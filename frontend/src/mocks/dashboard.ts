import type { DashboardPayload } from "../lib/types";

export const dashboardMock: DashboardPayload = {
  hero: {
    title: "Structural Variant Atlas",
    subtitle: "Genome-scale cohort analysis, task orchestration, and showcase-ready visual storytelling"
  },
  stats: [
    { label: "Samples", value: 128 },
    { label: "Tasks", value: 24 },
    { label: "Analysis Success Rate", value: "95.8%" },
    { label: "Result Variants", value: 14327 },
    { label: "Cohort Sites", value: 3982 },
    { label: "Hot Regions", value: 27 }
  ],
  recent_tasks: [
    { id: 12, name: "HG002-ONT", status: "succeeded" },
    { id: 11, name: "HG005-HiFi", status: "running" },
    { id: 10, name: "Atlas import", status: "succeeded" }
  ],
  sv_type_distribution: { DEL: 5521, INS: 4820, DUP: 1220, INV: 334 },
  hotspots: [
    { variant_key: "chr1:1020:1088:DEL", chrom: "chr1", pos: 1020, frequency: 0.72 },
    { variant_key: "chr3:9182:9190:INS", chrom: "chr3", pos: 9182, frequency: 0.64 },
    { variant_key: "chr7:33920:34010:DUP", chrom: "chr7", pos: 33920, frequency: 0.58 }
  ]
};

