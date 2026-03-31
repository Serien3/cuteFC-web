import { ChevronUp, ChevronDown, ListFilter, AlignLeft, Info } from "lucide-react";
import type { ResultVariant, ResultVariantQuery } from "../../lib/types";

type ResultBrowserTableProps = {
  busy?: boolean;
  variants: ResultVariant[];
  query: ResultVariantQuery;
  selectedVariantId?: number | null;
  onSelectVariant?: (variantId: number) => void;
  onSortChange: (sortBy: "pos" | "end" | "sv_len" | "support_reads") => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

const SORTABLE_COLUMNS: Array<{
  label: string;
  key: "pos" | "end" | "sv_len" | "support_reads";
}> = [
  { label: "START POS", key: "pos" },
  { label: "END POS", key: "end" },
  { label: "LENGTH", key: "sv_len" },
  { label: "SUPPORT", key: "support_reads" }
];

export function ResultBrowserTable({
  busy = false,
  variants,
  query,
  selectedVariantId = null,
  onSelectVariant,
  onSortChange,
  onPreviousPage,
  onNextPage
}: ResultBrowserTableProps) {
  const offset = query.offset ?? 0;
  const limit = query.limit ?? 25;

  const maxSupportReads = variants.length > 0 ? Math.max(...variants.map(v => v.support_reads)) : 100;
  // A reasonable threshold to show max bar for sv length, like 100000 bp. Just mapping logs to width looks better.
  const getLenWidth = (len: number) => {
    const l = Math.abs(len);
    if (l < 50) return 5;
    if (l > 100000) return 100;
    return Math.max(5, (Math.log10(l) / 5) * 100);
  };

  return (
    <section className="bg-white/40 backdrop-blur-2xl rounded-[3rem] p-8 border border-white/60 shadow-xl overflow-hidden mb-12">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/70 text-slate-700 rounded-2xl flex items-center justify-center shadow-sm border border-slate-200">
            <ListFilter size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-sans tracking-tight text-slate-800">
              Variant Signatures
            </h2>
            <p className="text-slate-500 font-medium text-sm">
              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-900">{variants.length}</span> items in view. Select a signature for multi-omic analysis.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-50/80 p-1.5 rounded-2xl border border-slate-200/50 shadow-inner">
          <button 
            type="button" 
            className="px-5 py-2 rounded-xl font-bold tracking-wide text-sm text-slate-900 hover:bg-white hover:shadow hover:text-slate-900 transition-all disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:shadow-none" 
            disabled={busy || offset === 0} 
            onClick={onPreviousPage}
          >
            Previous
          </button>
          <div className="w-px h-5 bg-slate-200"></div>
          <button 
            type="button" 
            className="px-5 py-2 rounded-xl font-bold tracking-wide text-sm text-slate-900 hover:bg-white hover:shadow hover:text-slate-900 transition-all disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:shadow-none" 
            disabled={busy || variants.length < limit} 
            onClick={onNextPage}
          >
            Next
          </button>
        </div>
      </div>

      {/* Table Data */}
      {variants.length > 0 ? (
        <div className="overflow-x-auto pb-4 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="py-4 px-5 text-[11px] font-extrabold tracking-widest text-slate-400 uppercase w-20">Locus</th>
                {SORTABLE_COLUMNS.map((column) => (
                  <th key={column.key} className="py-4 px-5 text-[11px] font-extrabold tracking-widest text-slate-400 uppercase">
                    <button
                      type="button"
                      className="group flex items-center gap-1.5 hover:text-indigo-600 transition-colors uppercase outline-none"
                      onClick={() => onSortChange(column.key)}
                    >
                      {column.label}
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400">
                        {query.sort_by === column.key ? (query.sort_order === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>) : <ChevronUp size={14}/>}
                      </span>
                    </button>
                  </th>
                ))}
                <th className="py-4 px-5 text-[11px] font-extrabold tracking-widest text-slate-400 uppercase">Type</th>
                <th className="py-4 px-5 text-[11px] font-extrabold tracking-widest text-slate-400 uppercase text-center">Genotype</th>
                <th className="py-4 px-5 text-[11px] font-extrabold tracking-widest text-slate-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {variants.map((variant) => {
                const isSelected = selectedVariantId === variant.id;
                let typeColor = "bg-slate-100 text-slate-900 border-slate-200";
                if (variant.sv_type === "DEL") typeColor = "bg-red-50 text-red-600 border-red-200";
                if (variant.sv_type === "INS") typeColor = "bg-green-50 text-green-600 border-green-200";
                if (variant.sv_type === "DUP") typeColor = "bg-blue-50 text-blue-600 border-blue-200";
                if (variant.sv_type === "INV") typeColor = "bg-purple-50 text-purple-600 border-purple-200";
                if (variant.sv_type === "BND" || variant.sv_type === "TRA") typeColor = "bg-orange-50 text-orange-600 border-orange-200";

                return (
                  <tr 
                    key={variant.id} 
                    className={`transition-all group \${isSelected ? 'bg-indigo-50/50 shadow-[inset_4px_0_0_0_theme(colors.indigo.500)]' : 'hover:bg-white/60 hover:shadow-sm'}`}
                  >
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-700 bg-white shadow-sm border border-slate-200 rounded-lg px-2 py-1 inline-block text-xs">
                        {variant.chrom}
                      </div>
                    </td>
                    <td className="py-4 px-5 font-mono text-sm text-slate-500">{variant.pos.toLocaleString()}</td>
                    <td className="py-4 px-5 font-mono text-sm text-slate-500">{variant.end.toLocaleString()}</td>
                    
                    {/* Visual Length */}
                    <td className="py-4 px-5">
                      <div className="flex flex-col gap-1.5 w-32">
                        <span className="font-mono text-xs font-semibold text-slate-900">{Math.abs(variant.sv_len).toLocaleString()} bp</span>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-300 rounded-full" style={{ width: `\${getLenWidth(variant.sv_len)}%` }} />
                        </div>
                      </div>
                    </td>

                    {/* Visual Support Reads */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3 w-32">
                        <span className="font-mono text-xs font-bold text-slate-700 w-6 text-right">{variant.support_reads}</span>
                        <div className="flex-1 h-3 bg-slate-100 rounded-sm overflow-hidden flex">
                          {Array.from({ length: 10 }).map((_, i) => {
                            const threshold = (maxSupportReads / 10) * (i + 1);
                            const isActive = variant.support_reads >= threshold;
                            return (
                              <div key={i} className={`flex-1 border-r border-white/50 last:border-0 \${isActive ? 'bg-indigo-500' : 'bg-transparent'}`} />
                            );
                          })}
                        </div>
                      </div>
                    </td>

                    {/* SV Type Badge */}
                    <td className="py-4 px-5">
                      <span className={`px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wider border \${typeColor}`}>
                        {variant.sv_type}
                      </span>
                    </td>

                    {/* Genotype Display */}
                    <td className="py-4 px-5 text-center">
                      <div className="inline-flex divide-x divide-slate-200 border border-slate-200 rounded-md overflow-hidden bg-white shadow-sm">
                        {variant.gt.split('/').map((allele, i) => (
                           <span key={i} className={`px-2 py-0.5 font-mono text-xs font-bold \${allele === '0' || allele === '.' ? 'text-slate-400' : 'text-indigo-600 bg-indigo-50'}`}>
                             {allele}
                           </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectVariant?.(variant.id)}
                        className={`\${isSelected ? 'bg-indigo-500 text-white border-indigo-500 shadow-md' : 'opacity-60 group-hover:opacity-100 bg-white border-slate-200 hover:border-indigo-400 !text-slate-800 hover:!text-indigo-700 shadow-sm'} px-4 py-2 border rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ml-auto`}
                      >
                        <AlignLeft size={14} />
                        {isSelected ? "Inspecting" : "Details"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-32 flex flex-col items-center justify-center text-center bg-white/30 rounded-3xl border border-white/50 border-dashed m-2">
          <div className="w-20 h-20 bg-slate-100/80 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Info size={32} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">Query Yielded No Results</h3>
          <p className="text-slate-500 font-medium max-w-md">
            Adjust your parametric filters above to perform a wider sweep of the variant database, or try resetting the criteria.
          </p>
        </div>
      )}
    </section>
  );
}
