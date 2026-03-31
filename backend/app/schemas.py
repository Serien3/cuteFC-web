from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class ProjectCreate(BaseModel):
    name: str
    description: str = ""


class ProjectUpdate(BaseModel):
    name: str
    description: str = ""


class ProjectRead(ORMModel):
    id: int
    name: str
    description: str
    created_at: datetime
    updated_at: datetime


class SampleCreate(BaseModel):
    sample_name: str
    platform_type: str = "ONT"
    remark: str = ""


class SampleRead(ORMModel):
    id: int
    project_id: int
    sample_name: str
    platform_type: str
    remark: str
    created_at: datetime
    updated_at: datetime


class InputFileCreate(BaseModel):
    project_id: int
    sample_id: int | None = None
    file_type: str
    file_path: str
    status: str = "registered"


class InputFileRead(ORMModel):
    id: int
    project_id: int
    sample_id: int | None
    file_type: str
    file_path: str
    status: str
    created_at: datetime
    updated_at: datetime


class ProjectDetail(ORMModel):
    id: int
    name: str
    description: str
    created_at: datetime
    updated_at: datetime
    samples: list[SampleRead]
    files: list[InputFileRead]
    task_summary: "TaskStatusSummary"
    recent_tasks: list["TaskRead"]


class TaskCreate(BaseModel):
    project_id: int
    sample_id: int
    tool_name: str = "cuteFC"
    task_name: str
    platform_type: str = "ONT"
    threads: int = 8
    input_bam: str
    reference_fasta: str
    target_vcf: str
    output_vcf: str
    work_dir: str
    params_json: dict[str, int | float | str] = Field(default_factory=dict)


class TaskRead(ORMModel):
    id: int
    project_id: int
    sample_id: int
    project_name: str
    sample_name: str
    tool_name: str
    task_name: str
    params_json: str
    status: str
    output_path: str
    log_path: str
    error_message: str
    has_results: bool
    started_at: datetime | None
    finished_at: datetime | None
    created_at: datetime
    updated_at: datetime
    params: dict[str, object]


class TaskStatusSummary(BaseModel):
    total: int
    pending: int
    running: int
    succeeded: int
    failed: int
    attention_count: int


class TaskLogRead(BaseModel):
    task_id: int
    log_path: str
    log_excerpt: str


class ResultVariantRead(ORMModel):
    id: int
    task_id: int
    sample_id: int
    chrom: str
    pos: int
    end: int
    sv_type: str
    sv_len: int
    gt: str
    support_reads: int
    created_at: datetime
    updated_at: datetime


class ResultVariantQuery(BaseModel):
    chrom: str | None = None
    sv_type: str | None = None
    genotype: str | None = None
    min_length: int | None = None
    max_length: int | None = None
    min_support_reads: int | None = None
    max_support_reads: int | None = None
    start: int | None = None
    end: int | None = None
    sort_by: str = "pos"
    sort_order: str = "asc"
    limit: int = 100
    offset: int = 0


class ResultVariantDetail(ResultVariantRead):
    sample_name: str
    task_name: str
    output_vcf: str
    reference_fasta: str
    input_bam: str
    target_vcf: str
    locus: str
    output_vcf_asset_path: str
    bam_index: str | None = None
    reference_index: str | None = None
    target_vcf_index: str | None = None
    reference_index_available: bool = False
    bam_index_available: bool = False
    output_vcf_available: bool = False
    target_vcf_available: bool = False
    igv_unavailable_reasons: list[str] = Field(default_factory=list)
    annotation_tracks: list[str] = Field(default_factory=list)


class ResultSummary(BaseModel):
    task_id: int
    total_sv: int
    median_sv_length: int
    max_sv_length: int
    dominant_sv_type: str
    sv_type_counts: dict[str, int]
    genotype_counts: dict[str, int]
    chromosome_counts: dict[str, int]
    length_buckets: dict[str, int]
    support_read_buckets: dict[str, int]


class CohortDatasetCreate(BaseModel):
    dataset_name: str
    source_path: str
    description: str = ""


class CohortDatasetRead(ORMModel):
    id: int
    dataset_name: str
    source_path: str
    description: str
    import_status: str
    created_at: datetime
    updated_at: datetime


class CohortVariantRead(ORMModel):
    id: int
    dataset_id: int
    variant_key: str
    chrom: str
    pos: int
    end: int
    sv_type: str
    sample_count: int
    frequency: float
    sample_list: str
    gene_name: str
    created_at: datetime
    updated_at: datetime


class CohortOverview(BaseModel):
    dataset_id: int
    dataset_name: str
    total_sites: int
    total_samples: int
    hotspot_count: int
    rare_count: int


class CohortSearchQuery(BaseModel):
    gene_name: str | None = None
    sample_name: str | None = None
    sv_type: str | None = None
    chrom: str | None = None
    start: int | None = None
    end: int | None = None
    frequency_min: float | None = None
    frequency_max: float | None = None


class DemoBootstrapRead(BaseModel):
    project_id: int
    sample_id: int
    task_id: int
    dataset_id: int
    cohort_source_path: str
    result_vcf_path: str
    variant_count: int
