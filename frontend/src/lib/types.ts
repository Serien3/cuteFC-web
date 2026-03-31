export type StatItem = {
  label: string;
  value: string | number;
};

export type Project = {
  id: number;
  name: string;
  description: string;
};

export type ProjectCreate = {
  name: string;
  description: string;
};

export type Sample = {
  id: number;
  project_id: number;
  sample_name: string;
  platform_type: string;
  remark: string;
};

export type SampleCreate = {
  sample_name: string;
  platform_type: string;
  remark: string;
};

export type InputFile = {
  id: number;
  project_id: number;
  sample_id: number | null;
  file_type: string;
  file_path: string;
  status: string;
};

export type FileCreate = {
  project_id: number;
  sample_id: number | null;
  file_type: string;
  file_path: string;
  status: string;
};

export type ProjectDetail = Project & {
  samples: Sample[];
  files: InputFile[];
  task_summary: TaskStatusSummary;
  recent_tasks: Task[];
};

export type TaskStatusSummary = {
  total: number;
  pending: number;
  running: number;
  succeeded: number;
  failed: number;
  attention_count: number;
};

export type Task = {
  id: number;
  project_id: number;
  sample_id: number;
  project_name: string;
  sample_name: string;
  tool_name: string;
  task_name: string;
  params_json: string;
  status: string;
  output_path: string;
  log_path: string;
  error_message: string;
  has_results: boolean;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
  params: Record<string, unknown>;
};

export type TaskCreate = {
  project_id: number;
  sample_id: number;
  task_name: string;
  platform_type: string;
  threads: number;
  input_bam: string;
  reference_fasta: string;
  target_vcf: string;
  output_vcf: string;
  work_dir: string;
  params_json: Record<string, string | number>;
};

export type TaskLog = {
  log_path: string;
  log_excerpt: string;
};

export type ResultSummary = {
  task_id: number;
  total_sv: number;
  median_sv_length: number;
  max_sv_length: number;
  dominant_sv_type: string;
  sv_type_counts: Record<string, number>;
  genotype_counts: Record<string, number>;
  chromosome_counts: Record<string, number>;
  length_buckets: Record<string, number>;
  support_read_buckets: Record<string, number>;
};

export type ResultVariant = {
  id: number;
  task_id?: number;
  sample_id?: number;
  chrom: string;
  pos: number;
  end: number;
  sv_type: string;
  sv_len: number;
  gt: string;
  support_reads: number;
};

export type ResultVariantQuery = {
  chrom?: string;
  sv_type?: string;
  genotype?: string;
  min_length?: number;
  max_length?: number;
  min_support_reads?: number;
  max_support_reads?: number;
  start?: number;
  end?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  limit?: number;
  offset?: number;
};

export type ResultVariantDetail = ResultVariant & {
  sample_name: string;
  task_name: string;
  output_vcf: string;
  reference_fasta: string;
  input_bam: string;
  target_vcf: string;
  locus: string;
  output_vcf_asset_path: string;
  bam_index?: string | null;
  reference_index?: string | null;
  target_vcf_index?: string | null;
  reference_index_available: boolean;
  bam_index_available: boolean;
  output_vcf_available: boolean;
  target_vcf_available: boolean;
  igv_unavailable_reasons: string[];
  annotation_tracks: string[];
};

export type CohortVariant = {
  id: number;
  variant_key: string;
  chrom: string;
  pos: number;
  end: number;
  sv_type: string;
  sample_count: number;
  frequency: number;
  sample_list: string;
  gene_name: string;
};

export type CohortSearchQuery = {
  gene_name?: string;
  sample_name?: string;
  sv_type?: string;
  chrom?: string;
  start?: number;
  end?: number;
  frequency_min?: number;
  frequency_max?: number;
};

export type CohortOverview = {
  dataset_id: number;
  dataset_name: string;
  total_sites: number;
  total_samples: number;
  hotspot_count: number;
  rare_count: number;
};

export type CohortDataset = {
  id: number;
  dataset_name: string;
  source_path: string;
  description: string;
  import_status: string;
};

export type DashboardPayload = {
  hero: { title: string; subtitle: string };
  stats: StatItem[];
  task_summary: TaskStatusSummary;
  recent_tasks: Task[];
  sv_type_distribution: Record<string, number>;
  hotspots: Array<{ variant_key: string; chrom: string; pos: number; frequency: number }>;
};

export type ShowcasePayload = {
  hero: { title: string; subtitle: string };
  architecture: string[];
  workflow: string[];
  innovation_points: string[];
};
