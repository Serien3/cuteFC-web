import { StatCard } from "../../components/stat-card";
import type { ResultSummary } from "../../lib/types";

type ResultSummaryStripProps = {
  summary: ResultSummary;
};

export function ResultSummaryStrip({ summary }: ResultSummaryStripProps) {
  return (
    <section className="result-summary-strip">
      <StatCard label="SV 总数" value={summary.total_sv} tone="accent" />
      <StatCard label="主导类型" value={summary.dominant_sv_type || "NA"} />
      <StatCard label="中位长度" value={`${summary.median_sv_length} bp`} />
      <StatCard label="最大长度" value={`${summary.max_sv_length} bp`} />
    </section>
  );
}
