import { Fragment, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { type CohortVariant } from "../../../lib/types";
import { ChevronDown, ChevronUp, Download, Dna, Search } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { VariantDetailPanel } from "./VariantDetailPanel";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface VariantTableProps {
    variants: CohortVariant[];
    selectedVariant: CohortVariant | null;
    onSelectVariant: (variant: CohortVariant) => void;
    totalSamples?: number;
    datasetId?: string | number;
}

// Helpers for the new Rich List Attribute Model
function getSpan(pos: number, end: number) {
    const bp = end - pos + 1;
    if (bp >= 1000) return `${(bp / 1000).toFixed(2)} kb`;
    return `${bp} bp`;
}

function formatLocus(chrom: string, pos: number, end: number) {
    // Basic human readable formatting, e.g. 123,400
    const p = pos.toLocaleString("en-US");
    const e = end.toLocaleString("en-US");
    return `${chrom}:${p}-${e}`;
}

function getFrequencyBucket(freq: number) {
    if (freq >= 0.50) return { label: "Hotspot", color: "bg-rose-100 text-rose-700", dot: "bg-rose-500" };
    if (freq >= 0.10) return { label: "Recurrent", color: "bg-orange-100 text-orange-700", dot: "bg-orange-500" };
    if (freq >= 0.01) return { label: "Low Freq", color: "bg-amber-100 text-amber-700", dot: "bg-amber-400" };
    return { label: "Rare", color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" };
}

function truncateSampleList(listStr: string | null) {
    if (!listStr) return "-";
    const samples = listStr.split(",").map(s => s.trim()).filter(Boolean);
    if (samples.length === 0) return "-";
    if (samples.length <= 3) return samples.join(", ");
    return `${samples.slice(0, 2).join(", ")} +${samples.length - 2}`;
}

function getSVBadgeColor(type: string) {
    const t = type.toUpperCase();
    if (t.includes("DEL")) return "bg-red-50 text-red-700 border-red-100";
    if (t.includes("INS")) return "bg-green-50 text-green-700 border-green-100";
    if (t.includes("DUP")) return "bg-blue-50 text-blue-700 border-blue-100";
    if (t.includes("INV")) return "bg-purple-50 text-purple-700 border-purple-100";
    if (t.includes("BND")) return "bg-slate-100 text-slate-700 border-slate-200";
    return "bg-slate-100 text-slate-600 border-slate-200";
}

export function VariantTable({
    variants,
    selectedVariant,
    onSelectVariant,
    totalSamples = 100,
    datasetId = "Unknown"
}: VariantTableProps) {
    const [sortCol, setSortCol] = useState<keyof CohortVariant>("frequency");
    const [sortDesc, setSortDesc] = useState(true);

    if (!variants || variants.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-16 bg-slate-50/50 rounded-[2rem] border border-slate-200 border-dashed">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 shadow-sm">
                    <Search className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-slate-700 font-serif text-lg mb-1">No variants found</h3>
                <p className="text-slate-400 font-light text-sm text-center max-w-sm">Try adjusting your filters or search query to see results in this dataset.</p>
            </div>
        );
    }

    const sortedVariants = [...variants].sort((a, b) => {
        let valA = a[sortCol];
        let valB = b[sortCol];
        if (valA === undefined) valA = "";
        if (valB === undefined) valB = "";
        if (valA < valB) return sortDesc ? 1 : -1;
        if (valA > valB) return sortDesc ? -1 : 1;
        return 0;
    });

    const handleSort = (col: keyof CohortVariant) => {
        if (sortCol === col) setSortDesc(!sortDesc);
        else {
            setSortCol(col);
            setSortDesc(col === "frequency" || col === "sample_count"); // Default descending for sizes/counts
        }
    };

    const getSortIcon = (col: keyof CohortVariant) => {
        if (sortCol !== col) return <ChevronDown className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
        return sortDesc ? <ChevronDown className="w-3 h-3 text-indigo-500" /> : <ChevronUp className="w-3 h-3 text-indigo-500" />;
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-[2rem] border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden">
            
            {/* Toolbar Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
                           Variant Registry
                           <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{variants.length} Hits</span>
                        </span>
                    </div>
                </div>
                <button className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-600 bg-white border border-slate-200 hover:border-indigo-200 px-3 py-1.5 rounded-full transition-all shadow-sm">
                    <Download className="w-3.5 h-3.5" /> Export TSV
                </button>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-auto custom-scrollbar bg-white">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead className="sticky top-0 bg-white z-10 text-[10px] uppercase tracking-widest text-slate-400 font-bold border-b border-slate-200 shadow-sm shadow-white/50">
                        <tr>
                            <th className="px-5 py-4 cursor-pointer group hover:bg-slate-50" onClick={() => handleSort("sv_type")}>
                                <div className="flex items-center gap-1">Event / Type {getSortIcon("sv_type")}</div>
                            </th>
                            <th className="px-5 py-4 cursor-pointer group hover:bg-slate-50" onClick={() => handleSort("pos")}>
                                <div className="flex items-center gap-1">Locus {getSortIcon("pos")}</div>
                            </th>
                            <th className="px-5 py-4 cursor-pointer group hover:bg-slate-50" onClick={() => handleSort("gene_name")}>
                                <div className="flex items-center gap-1">Gene Context {getSortIcon("gene_name")}</div>
                            </th>
                            <th className="px-5 py-4 cursor-pointer group hover:bg-slate-50" onClick={() => handleSort("sample_count")}>
                                <div className="flex items-center gap-1">Carriers {getSortIcon("sample_count")}</div>
                            </th>
                            <th className="px-5 py-4 cursor-pointer group hover:bg-slate-50" onClick={() => handleSort("frequency")}>
                                <div className="flex items-center gap-1">Prevalence {getSortIcon("frequency")}</div>
                            </th>
                            <th className="px-5 py-4">
                                <div className="flex items-center gap-1">Actions</div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/80">
                        {sortedVariants.map((v) => {
                            const isSelected = selectedVariant?.id === v.id;
                            const spanText = getSpan(v.pos, v.end);
                            const locusText = formatLocus(v.chrom, v.pos, v.end);
                            const bucket = getFrequencyBucket(v.frequency);
                            const samplesPreview = truncateSampleList(v.sample_list);
                            
                            return (
                                <Fragment key={v.id}>
                                    <tr
                                        onClick={() => onSelectVariant(v)}
                                        className={cn(
                                            "cursor-pointer transition-all duration-200 group relative",
                                            isSelected ? "bg-indigo-50/50" : "hover:bg-slate-50"
                                        )}
                                    >
                                        {/* Active Line Indicator */}
                                        {isSelected && <td className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-md"></td>}
                                        
                                        <td className="px-5 py-4 pl-6">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold border", getSVBadgeColor(v.sv_type))}>
                                                        {v.sv_type}
                                                    </span>
                                                    <span className="text-sm font-medium text-slate-800 truncate max-w-[200px]" title={v.variant_key}>
                                                        {v.sv_type} {v.chrom}:{v.pos}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-500 transition-colors">
                                                    {v.variant_key}
                                                </span>
                                            </div>
                                        </td>
                                        
                                        <td className="px-5 py-4">
                                             <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-mono text-slate-700 tracking-tight">{locusText}</span>
                                                <span className="text-[11px] text-slate-400">{spanText}</span>
                                             </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center border border-slate-200">
                                                    <Dna className="w-3 h-3 text-slate-400" />
                                                </div>
                                                <div className="flex flex-col">
                                                    {v.gene_name && v.gene_name !== "Intergenic" ? (
                                                        <span className="text-sm font-semibold text-slate-700">{v.gene_name}</span>
                                                    ) : (
                                                        <span className="text-sm italic text-slate-400">Intergenic</span>
                                                    )}
                                                    <span className="text-[10px] text-slate-400">{v.gene_name && v.gene_name !== "Intergenic" ? "Genic" : "Non-coding"}</span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-sm font-bold text-slate-700">{v.sample_count}</span>
                                                    <span className="text-[10px] text-slate-400 uppercase tracking-wide">Cases</span>
                                                </div>
                                                <div className="text-[10px] text-slate-500 truncate max-w-[120px]" title={samplesPreview}>
                                                    {samplesPreview}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4 w-48">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-sm font-mono tracking-tight text-slate-700">{(v.frequency * 100).toFixed(2)}%</span>
                                                    <span className={cn("text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm flex items-center gap-1", bucket.color)}>
                                                        <span className={cn("w-1 h-1 rounded-full", bucket.dot)}></span> {bucket.label}
                                                    </span>
                                                </div>
                                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={cn("h-full rounded-full transition-all", isSelected ? "bg-indigo-500" : bucket.dot)} style={{ width: `${Math.min(v.frequency * 100, 100)}%` }} />
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                               <div className="flex items-center gap-3">
                                                   <span className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 border-b border-transparent hover:border-indigo-800 transition-colors">
                                                       Drill Down
                                                   </span>
                                               </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <AnimatePresence initial={false}>
                                        {isSelected && (
                                            <tr className="bg-slate-50/60">
                                                <td colSpan={6} className="px-4 py-4 sm:px-5">
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0, y: -8 }}
                                                        animate={{ opacity: 1, height: "auto", y: 0 }}
                                                        exit={{ opacity: 0, height: 0, y: -8 }}
                                                        transition={{ duration: 0.22, ease: "easeOut" }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="relative">
                                                            <div className="absolute -top-2 left-20 h-4 w-4 rotate-45 border-l border-t border-slate-200 bg-white" />
                                                            <VariantDetailPanel
                                                                variant={v}
                                                                allVariants={variants}
                                                                totalSamples={totalSamples}
                                                                datasetId={datasetId}
                                                                onClose={() => onSelectVariant(v)}
                                                            />
                                                        </div>
                                                    </motion.div>
                                                </td>
                                            </tr>
                                        )}
                                    </AnimatePresence>
                                </Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            
            {/* Table Footer / Summary (Optional but adds nice touch) */}
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between text-[11px] text-slate-400">
                <span>Showing {sortedVariants.length} cohort events</span>
                <span>Click any row to reveal detailed annotations</span>
            </div>
        </div>
    );
}
