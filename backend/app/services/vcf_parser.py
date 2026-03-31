from dataclasses import dataclass
from pathlib import Path


@dataclass(slots=True)
class ParsedVariant:
    chrom: str
    pos: int
    end: int
    sv_type: str
    sv_len: int
    gt: str
    support_reads: int
    sample_name: str


def _parse_info_field(info_text: str) -> dict[str, str]:
    values: dict[str, str] = {}
    for part in info_text.split(";"):
        if "=" in part:
            key, value = part.split("=", 1)
            values[key] = value
    return values


def parse_vcf(vcf_path: Path, sample_name: str) -> list[ParsedVariant]:
    records: list[ParsedVariant] = []
    for line in vcf_path.read_text(encoding="utf-8").splitlines():
        if not line or line.startswith("##"):
            continue
        if line.startswith("#CHROM"):
            continue
        chrom, pos, _id, _ref, _alt, _qual, _filter, info, fmt, sample = line.split("\t")[:10]
        info_values = _parse_info_field(info)
        format_keys = fmt.split(":")
        sample_values = sample.split(":")
        sample_map = dict(zip(format_keys, sample_values, strict=False))
        gt = sample_map.get("GT", "./.")
        support_reads = int(
            sample_map.get("DV", sample_map.get("DR", info_values.get("RE", "0")))
        )
        end = int(info_values.get("END", pos))
        sv_type = info_values.get("SVTYPE", "UNK")
        sv_len = abs(int(info_values.get("SVLEN", "0")))
        records.append(
            ParsedVariant(
                chrom=chrom,
                pos=int(pos),
                end=end,
                sv_type=sv_type,
                sv_len=sv_len,
                gt=gt,
                support_reads=support_reads,
                sample_name=sample_name,
            )
        )
    return records
