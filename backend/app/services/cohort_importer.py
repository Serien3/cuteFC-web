from dataclasses import dataclass
from pathlib import Path


@dataclass(slots=True)
class CohortSummaryRecord:
    variant_key: str
    chrom: str
    pos: int
    end: int
    sv_type: str
    sample_count: int
    frequency: float
    sample_list: str
    gene_name: str


@dataclass(slots=True)
class CohortImportSummary:
    total_sites: int
    total_samples: int
    hotspots: list[CohortSummaryRecord]
    rare: list[CohortSummaryRecord]
    summaries: list[CohortSummaryRecord]


def _is_carrier_genotype(genotype: str) -> bool:
    alleles = genotype.replace("|", "/").split("/")
    return any(allele not in {"0", "."} for allele in alleles)


def count_cohort_samples(vcf_path: Path) -> int:
    for line in vcf_path.read_text(encoding="utf-8").splitlines():
        if line.startswith("#CHROM"):
            return max(len(line.split("\t")) - 9, 0)
    return 0


def import_cohort_vcf(vcf_path: Path) -> CohortImportSummary:
    lines = vcf_path.read_text(encoding="utf-8").splitlines()
    sample_names: list[str] = []
    summaries: list[CohortSummaryRecord] = []

    for line in lines:
        if not line or line.startswith("##"):
            continue
        if line.startswith("#CHROM"):
            header_parts = line.split("\t")
            sample_names = header_parts[9:]
            continue

        parts = line.split("\t")
        chrom, pos, _id, _ref, _alt, _qual, _filter, info, fmt = parts[:9]
        sample_fields = parts[9:]
        info_map = {}
        for item in info.split(";"):
            if "=" in item:
                key, value = item.split("=", 1)
                info_map[key] = value

        format_keys = fmt.split(":")
        carriers: list[str] = []
        for index, sample_value in enumerate(sample_fields):
            sample_map = dict(zip(format_keys, sample_value.split(":"), strict=False))
            genotype = sample_map.get("GT", "./.")
            if _is_carrier_genotype(genotype):
                carriers.append(sample_names[index])

        total_samples = max(len(sample_names), 1)
        end = int(info_map.get("END", pos))
        sv_type = info_map.get("SVTYPE", "UNK")
        gene_name = info_map.get("GENE", "")
        variant_key = f"{chrom}:{pos}:{end}:{sv_type}"
        sample_count = len(carriers)
        frequency = sample_count / total_samples
        summaries.append(
            CohortSummaryRecord(
                variant_key=variant_key,
                chrom=chrom,
                pos=int(pos),
                end=end,
                sv_type=sv_type,
                sample_count=sample_count,
                frequency=frequency,
                sample_list=",".join(carriers),
                gene_name=gene_name,
            )
        )

    hotspots = sorted([item for item in summaries if item.frequency >= 0.5], key=lambda item: (-item.frequency, item.pos))[:10]
    rare = sorted(
        [item for item in summaries if 0 < item.frequency <= 0.1],
        key=lambda item: (item.frequency, item.pos),
    )[:10]
    return CohortImportSummary(
        total_sites=len(summaries),
        total_samples=len(sample_names),
        hotspots=hotspots,
        rare=rare,
        summaries=summaries,
    )
