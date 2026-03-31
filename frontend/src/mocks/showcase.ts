import type { ShowcasePayload } from "../lib/types";

export const showcaseMock: ShowcasePayload = {
  hero: {
    title: "cuteFC-SV Platform",
    subtitle: "A high-clarity genome variation platform for competition demos and cohort exploration"
  },
  architecture: [
    "React frontend with dashboard, workflow, atlas, and showcase scenes",
    "FastAPI orchestration layer for tasks, parsed results, and atlas search",
    "SQLite and local filesystem deployment for stable single-node delivery"
  ],
  workflow: [
    "Register projects, samples, and genome data assets",
    "Launch cuteFC jobs with platform-aware presets",
    "Inspect result summaries and navigate into cohort atlas pages"
  ],
  innovation_points: [
    "Transforms a command-line genomics workflow into a complete platform experience",
    "Decouples cohort atlas import from cuteFC runtime so demos remain stable and immediate",
    "Uses genome-inspired visual language instead of generic admin dashboards"
  ]
};

