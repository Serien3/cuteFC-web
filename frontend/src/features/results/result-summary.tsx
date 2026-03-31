import { ChartPanel } from "../../components/chart-panel";
import { SectionHeader } from "../../components/section-header";
import { StatCard } from "../../components/stat-card";
import type { ResultSummary as ResultSummaryType } from "../../lib/types";

type ResultSummaryProps = {
  summary: ResultSummaryType;
};

export function ResultSummary({ summary }: ResultSummaryProps) {
  
  return (
    <div className="space-y-12">
      <SectionHeader title="Analytic Synthesis" eyebrow="GLOBAL METRICS" subtitle="High-level structural variant distribution detected across the genome." />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard label="Total Signatures" value={summary.total_sv} tone="accent" />
        <StatCard label="SV Categories" value={Object.keys(summary.sv_type_counts).length} />
        <StatCard label="Chromosomes Hit" value={Object.keys(summary.chromosome_counts).length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartPanel title="SV CATEGORY INDEX">
          <div className="flex flex-wrap gap-4 mt-6">
            {Object.entries(summary.sv_type_counts).map(([key, value]) => (
               <div key={key} className="flex-1 min-w-[120px] bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-center items-center gap-2 hover:bg-white hover:shadow-lg transition-all">
                  <span className="text-sm font-bold tracking-widest text-slate-400 uppercase">{key}</span>
                  <span className="text-3xl font-mono tracking-tighter text-slate-800">{value}</span>
               </div>
            ))}
          </div>
        </ChartPanel>
        
        <ChartPanel title="GENOTYPE DISTRIBUTION">
          <div className="flex flex-wrap gap-4 mt-6">
            {Object.entries(summary.genotype_counts).map(([key, value]) => (
               <div key={key} className="flex-1 min-w-[120px] bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-center items-center gap-2 hover:bg-white hover:shadow-lg transition-all">
                  <span className="text-sm font-bold tracking-widest text-slate-400">{key}</span>
                  <span className="text-3xl font-mono tracking-tighter text-slate-800">{value}</span>
               </div>
            ))}
          </div>
        </ChartPanel>

        <ChartPanel title="CHROMOSOMAL LOCI MAP">
          <div className="flex flex-wrap gap-3 mt-6 pb-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {Object.entries(summary.chromosome_counts)
              .sort((a, b) => b[1] - a[1])
              .map(([key, value]) => (
               <div key={key} className="flex items-center justify-between w-full bg-slate-50 px-4 py-3 rounded-xl hover:bg-slate-100 transition-colors">
                  <span className="font-bold text-slate-600">{key}</span>
                  <div className="flex items-center gap-4">
                    <div className="h-2 bg-amber-500 rounded-full" style={{ width: `${Math.max(4, (value / summary.total_sv) * 200)}px`}}></div>
                    <span className="font-mono text-slate-500 text-sm w-12 text-right">{value}</span>
                  </div>
               </div>
            ))}
          </div>
        </ChartPanel>
        
        <ChartPanel title="ALIGNMENT TOPOLOGY">
          <div className="h-full min-h-[200px] mt-6 flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl p-8 border border-slate-100 border-dashed text-center">
             <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20v-4"></path></svg>
             </div>
             <h4 className="font-bold text-slate-700 mb-2">Length Distribution</h4>
             <p className="text-slate-500 text-sm leading-relaxed max-w-[250px]">
               Advanced topological mapping of fragment length variance derived from sequencing read geometry.
             </p>
          </div>
        </ChartPanel>
      </div>
    </div>
  );

}
