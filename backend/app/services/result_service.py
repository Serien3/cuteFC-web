import json
from collections import Counter
import csv
from io import StringIO
from statistics import median
from pathlib import Path

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.repositories import result_repo, task_repo
from app.services.vcf_parser import parse_vcf


RESULT_ASSET_KINDS = {
    "reference_fasta",
    "reference_index",
    "input_bam",
    "input_bam_index",
    "output_vcf",
    "target_vcf",
    "target_vcf_index",
}


def _bucket_lengths(lengths: list[int]) -> dict[str, int]:
    buckets = {"0-49": 0, "50-100": 0, "101-500": 0, "501+": 0}
    for length in lengths:
        if length <= 49:
            buckets["0-49"] += 1
        elif length <= 100:
            buckets["50-100"] += 1
        elif length <= 500:
            buckets["101-500"] += 1
        else:
            buckets["501+"] += 1
    return buckets


def _bucket_support_reads(counts: list[int]) -> dict[str, int]:
    buckets = {"0-2": 0, "3-5": 0, "6-10": 0, "11+": 0}
    for count in counts:
        if count <= 2:
            buckets["0-2"] += 1
        elif count <= 5:
            buckets["3-5"] += 1
        elif count <= 10:
            buckets["6-10"] += 1
        else:
            buckets["11+"] += 1
    return buckets


def ingest_task_vcf(session: Session, task_id: int) -> list[models.VariantRecord]:
    task = task_repo.get_task(session, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    payload = json.loads(task.params_json)
    output_vcf = Path(payload["output_vcf"])
    if not output_vcf.exists():
        return []

    sample = session.get(models.Sample, task.sample_id)
    parsed_records = parse_vcf(output_vcf, sample.sample_name if sample else "sample")
    variant_records = [
        models.VariantRecord(
            task_id=task.id,
            sample_id=task.sample_id,
            chrom=record.chrom,
            pos=record.pos,
            end=record.end,
            sv_type=record.sv_type,
            sv_len=record.sv_len,
            gt=record.gt,
            support_reads=record.support_reads,
        )
        for record in parsed_records
    ]
    return result_repo.replace_variant_records(session, task.id, task.sample_id, variant_records)


def get_result_summary(session: Session, task_id: int) -> schemas.ResultSummary:
    task = task_repo.get_task(session, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    records = result_repo.list_variant_records(session, task_id)
    lengths = [record.sv_len for record in records]
    support_reads = [record.support_reads for record in records]
    sv_type_counts = Counter(record.sv_type for record in records)
    genotype_counts = Counter(record.gt for record in records)
    chromosome_counts = Counter(record.chrom for record in records)

    first_seen_types: dict[str, int] = {}
    for index, record in enumerate(records):
        first_seen_types.setdefault(record.sv_type, index)
    dominant_sv_type = ""
    if sv_type_counts:
        dominant_sv_type = max(
            sv_type_counts.items(),
            key=lambda item: (item[1], -first_seen_types[item[0]]),
        )[0]

    return schemas.ResultSummary(
        task_id=task_id,
        total_sv=len(records),
        median_sv_length=int(median(lengths)) if lengths else 0,
        max_sv_length=max(lengths, default=0),
        dominant_sv_type=dominant_sv_type,
        sv_type_counts=dict(sv_type_counts),
        genotype_counts=dict(genotype_counts),
        chromosome_counts=dict(chromosome_counts),
        length_buckets=_bucket_lengths(lengths),
        support_read_buckets=_bucket_support_reads(support_reads),
    )


def get_result_variants(
    session: Session,
    task_id: int,
    query: schemas.ResultVariantQuery | None = None,
) -> list[schemas.ResultVariantRead]:
    task = task_repo.get_task(session, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    return [
        schemas.ResultVariantRead.model_validate(record)
        for record in result_repo.list_variant_records(session, task_id, query)
    ]


def export_result_variants(
    session: Session,
    task_id: int,
    query: schemas.ResultVariantQuery | None,
    export_format: str,
) -> str:
    task = task_repo.get_task(session, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    variants = get_result_variants(session, task_id, query)
    if export_format == "csv":
        return _serialize_delimited_variants(variants, ",")
    if export_format == "tsv":
        return _serialize_delimited_variants(variants, "\t")
    if export_format == "vcf":
        payload = json.loads(task.params_json)
        return _serialize_vcf_variants(variants, payload)
    raise HTTPException(status_code=400, detail="Unsupported export format")


def get_result_variant_detail(session: Session, variant_id: int) -> schemas.ResultVariantDetail:
    record = result_repo.get_variant_record(session, variant_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Variant not found")

    task = task_repo.get_task(session, record.task_id)
    sample = session.get(models.Sample, record.sample_id)
    payload = json.loads(task.params_json) if task is not None else {}
    reference_fasta = payload.get("reference_fasta", "")
    input_bam = payload.get("input_bam", "")
    target_vcf = payload.get("target_vcf", "")
    output_vcf = payload.get("output_vcf", "")
    reference_index = _ensure_reference_index(reference_fasta)
    bam_index = _resolve_index_path(input_bam, payload.get("input_bam_index"), ".bai")
    target_vcf_index = _resolve_index_path(target_vcf, payload.get("target_vcf_index"), ".tbi")

    igv_unavailable_reasons: list[str] = []
    if not reference_fasta or not Path(reference_fasta).exists():
        igv_unavailable_reasons.append("参考 FASTA 不存在，IGV 无法初始化参考序列。")
    elif reference_index is None or not reference_index.exists():
        igv_unavailable_reasons.append("参考 FASTA 缺少 .fai 索引，IGV 无法初始化参考序列。")
    if not output_vcf or not Path(output_vcf).exists():
        igv_unavailable_reasons.append("输出 VCF 不存在，IGV 无法加载当前结果轨道。")
    if input_bam and (bam_index is None or not bam_index.exists()):
        igv_unavailable_reasons.append("输入 BAM 缺少 .bai 索引，已跳过比对读段轨道。")

    return schemas.ResultVariantDetail.model_validate(
        {
            **schemas.ResultVariantRead.model_validate(record).model_dump(),
            "sample_name": sample.sample_name if sample is not None else "",
            "task_name": task.task_name if task is not None else "",
            "output_vcf": output_vcf,
            "reference_fasta": reference_fasta,
            "input_bam": input_bam,
            "target_vcf": target_vcf,
            "locus": f"{record.chrom}:{record.pos}-{record.end}",
            "output_vcf_asset_path": output_vcf,
            "bam_index": str(bam_index) if bam_index is not None else None,
            "reference_index": str(reference_index) if reference_index is not None else None,
            "target_vcf_index": str(target_vcf_index) if target_vcf_index is not None else None,
            "reference_index_available": reference_index is not None and reference_index.exists(),
            "bam_index_available": bam_index is not None and bam_index.exists(),
            "output_vcf_available": bool(output_vcf) and Path(output_vcf).exists(),
            "target_vcf_available": bool(target_vcf) and Path(target_vcf).exists(),
            "igv_unavailable_reasons": igv_unavailable_reasons,
            "annotation_tracks": payload.get("annotation_tracks", []),
        }
    )


def get_result_variant_asset_path(session: Session, variant_id: int, asset_kind: str) -> Path:
    if asset_kind not in RESULT_ASSET_KINDS:
        raise HTTPException(status_code=404, detail="Unsupported result asset")

    detail = get_result_variant_detail(session, variant_id)
    asset_map = {
        "reference_fasta": detail.reference_fasta,
        "reference_index": detail.reference_index,
        "input_bam": detail.input_bam,
        "input_bam_index": detail.bam_index,
        "output_vcf": detail.output_vcf_asset_path,
        "target_vcf": detail.target_vcf,
        "target_vcf_index": detail.target_vcf_index,
    }
    asset_path = asset_map.get(asset_kind)
    if not asset_path:
        raise HTTPException(status_code=404, detail="Result asset is unavailable")

    path = Path(asset_path)
    if not path.exists():
        raise HTTPException(status_code=404, detail="Result asset file not found")
    return path


def _serialize_delimited_variants(
    variants: list[schemas.ResultVariantRead], delimiter: str
) -> str:
    buffer = StringIO()
    writer = csv.writer(buffer, delimiter=delimiter, lineterminator="\n")
    writer.writerow(["chrom", "pos", "end", "sv_type", "sv_len", "gt", "support_reads"])
    for variant in variants:
        writer.writerow(
            [
                variant.chrom,
                variant.pos,
                variant.end,
                variant.sv_type,
                variant.sv_len,
                variant.gt,
                variant.support_reads,
            ]
        )
    return buffer.getvalue()


def _serialize_vcf_variants(
    variants: list[schemas.ResultVariantRead], task_payload: dict[str, object]
) -> str:
    sample_name = str(task_payload.get("sample_name", "sample"))
    lines = [
        "##fileformat=VCFv4.2",
        f"##source={task_payload.get('tool_name', 'cuteFC-gui')}",
        f"#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT\t{sample_name}",
    ]
    for variant in variants:
        info = (
            f"SVTYPE={variant.sv_type};END={variant.end};SVLEN={variant.sv_len};RE={variant.support_reads}"
        )
        lines.append(
            "\t".join(
                [
                    variant.chrom,
                    str(variant.pos),
                    ".",
                    "N",
                    f"<{variant.sv_type}>",
                    ".",
                    "PASS",
                    info,
                    "GT",
                    variant.gt,
                ]
            )
        )
    return "\n".join(lines) + "\n"


def _resolve_index_path(file_path: str, explicit_index: object, suffix: str) -> Path | None:
    if explicit_index:
        return Path(str(explicit_index))
    if not file_path:
        return None
    return Path(f"{file_path}{suffix}")


def _ensure_reference_index(reference_fasta: str) -> Path | None:
    if not reference_fasta:
        return None

    fasta_path = Path(reference_fasta)
    if not fasta_path.exists():
        return None

    explicit_index = Path(f"{reference_fasta}.fai")
    if explicit_index.exists():
        return explicit_index

    index_lines: list[str] = []
    with fasta_path.open("r", encoding="utf-8") as handle:
        seq_name: str | None = None
        seq_length = 0
        seq_offset = 0
        line_bases = 0
        line_width = 0
        current_offset = 0
        for raw_line in handle:
            encoded = raw_line.encode("utf-8")
            if raw_line.startswith(">"):
                if seq_name is not None:
                    index_lines.append(
                        f"{seq_name}\t{seq_length}\t{seq_offset}\t{line_bases}\t{line_width}"
                    )
                seq_name = raw_line[1:].strip().split()[0]
                seq_length = 0
                seq_offset = current_offset + len(encoded)
                line_bases = 0
                line_width = 0
            else:
                stripped = raw_line.rstrip("\n\r")
                if stripped:
                    seq_length += len(stripped)
                    if line_bases == 0:
                        line_bases = len(stripped)
                        line_width = len(encoded)
            current_offset += len(encoded)

    if seq_name is not None:
        index_lines.append(f"{seq_name}\t{seq_length}\t{seq_offset}\t{line_bases}\t{line_width}")

    if not index_lines:
        return None

    explicit_index.write_text("\n".join(index_lines) + "\n", encoding="utf-8")
    return explicit_index
