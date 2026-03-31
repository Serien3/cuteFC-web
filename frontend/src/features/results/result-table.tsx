import type { ResultVariant } from "../../lib/types";

type ResultTableProps = {
  variants: ResultVariant[];
  onSelectVariant?: (variantId: number) => void;
};

export function ResultTable({ variants, onSelectVariant }: ResultTableProps) {
  
  return (
    <section className="bg-white/40 backdrop-blur-2xl rounded-[3rem] p-8 border border-white/60 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold font-sans tracking-tight text-slate-800">
          Identified Genomic Variants
        </h2>
        <span className="bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase">
          {variants.length} Results
        </span>
      </div>

      {variants.length > 0 ? (
        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="py-4 px-4 text-xs font-bold tracking-widest text-slate-400 uppercase">Locus</th>
                <th className="py-4 px-4 text-xs font-bold tracking-widest text-slate-400 uppercase">Position</th>
                <th className="py-4 px-4 text-xs font-bold tracking-widest text-slate-400 uppercase">Type</th>
                <th className="py-4 px-4 text-xs font-bold tracking-widest text-slate-400 uppercase text-right">Length (bp)</th>
                <th className="py-4 px-4 text-xs font-bold tracking-widest text-slate-400 uppercase text-center">Genotype</th>
                <th className="py-4 px-4 text-xs font-bold tracking-widest text-slate-400 uppercase text-right">Support</th>
                <th className="py-4 px-4 text-xs font-bold tracking-widest text-slate-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {variants.map((variant) => {
                let typeColor = "bg-slate-100 text-slate-600";
                if (variant.sv_type === "DEL") typeColor = "bg-red-100 text-red-700";
                if (variant.sv_type === "INS") typeColor = "bg-green-100 text-green-700";
                if (variant.sv_type === "DUP") typeColor = "bg-blue-100 text-blue-700";
                if (variant.sv_type === "INV") typeColor = "bg-purple-100 text-purple-700";
                if (variant.sv_type === "BND" || variant.sv_type === "TRA") typeColor = "bg-orange-100 text-orange-700";

                return (
                  <tr key={variant.id} className="hover:bg-white/50 transition-colors group">
                    <td className="py-4 px-4 font-bold text-slate-800">{variant.chrom}</td>
                    <td className="py-4 px-4 font-mono text-sm text-slate-500">
                      {variant.pos.toLocaleString()} <span className="text-slate-300 mx-1">→</span> {variant.end.toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wider ${typeColor}`}>
                        {variant.sv_type}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-sm text-slate-600 text-right">
                      {Math.abs(variant.sv_len).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-mono text-sm font-semibold bg-slate-100 px-2 py-1 rounded text-slate-700">
                        {variant.gt}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-sm text-slate-600 text-right">
                      {variant.support_reads}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectVariant?.(variant.id)}
                        className="opacity-0 group-hover:opacity-100 bg-white shadow-sm border border-slate-200 hover:border-amber-300 hover:text-amber-700 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold transition-all"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-20 text-center bg-white/30 rounded-3xl border border-white/50">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">No Variants Detected</h3>
          <p className="text-slate-500 font-medium max-w-md mx-auto">
            The current pipeline execution or filter selection yielded zero structural variants. Please adjust parameters or check the task input alignment.
          </p>
        </div>
      )}
    </section>
  );

}
