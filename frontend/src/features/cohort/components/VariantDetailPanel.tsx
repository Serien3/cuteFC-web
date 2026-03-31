import React, { useMemo, useState } from "react";
import { ArrowLeft, Copy, MapIcon, Dna, Activity, Users, BoxSelect } from "lucide-react";
import type { CohortVariant } from "../../../lib/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface VariantDetailPanelProps {
    variant: CohortVariant | null;
    allVariants?: CohortVariant[];
    totalSamples?: number;
    datasetId?: string | number;
    onClose?: () => void;
}

// Helpers
function getSpan(v: CohortVariant) {
    if (v.end && v.pos) return Math.max(0, v.end - v.pos + 1);
    return 0;
}

function formatSpan(span: number) {
    if (span >= 1_000_000) return `${(span / 1_000_000).toFixed(2)} Mb`;
    if (span >= 1_000) return `${(span / 1_000).toFixed(2)} kb`;
    return `${span} bp`;
}

function formatNumber(num: number) {
    return new Intl.NumberFormat("en-US").format(num);
}

function getFrequencyBucket(freq: number) {
    if (freq >= 0.50) return "Hotspot";
    if (freq >= 0.10) return "Recurrent";
    if (freq >= 0.01) return "Low-frequency";
    return "Rare";
}

function getSVBadgeColor(svType: string) {
    const t = svType.toUpperCase();
    if (t.includes('DEL')) return "border-red-200 text-red-700 bg-red-50";
    if (t.includes('DUP')) return "border-indigo-200 text-indigo-700 bg-indigo-50";
    if (t.includes('INS')) return "border-emerald-200 text-emerald-700 bg-emerald-50";
    if (t.includes('INV')) return "border-amber-200 text-amber-700 bg-amber-50";
    if (t.includes('BND')) return "border-purple-200 text-purple-700 bg-purple-50";
    return "border-slate-200 text-slate-700 bg-slate-50";
}

function formatLocus(v: CohortVariant) {
    const c = v.chrom.startsWith("chr") ? v.chrom : `chr${v.chrom}`;
    return `${c}:${formatNumber(v.pos)}${v.end ? `-${formatNumber(v.end)}` : ""}`;
}

const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
};

export function VariantDetailPanel({ variant, allVariants = [], totalSamples = 100, datasetId = "Unknown", onClose }: VariantDetailPanelProps) {
    const [showAllCarriers, setShowAllCarriers] = useState(false);
    const [activeRelatedTab, setActiveRelatedTab] = useState<"gene" | "type" | "nearby">("gene");

    if (!variant) return null;

    // Derived fields
    const span = getSpan(variant);
    const locus = formatLocus(variant);
    const gene = variant.gene_name || "Intergenic";
    const freqBucket = getFrequencyBucket(variant.frequency);
    // Carriers
    const sampleListArray = useMemo(() => {
        if (!variant.sample_list) return [];
        return variant.sample_list.split(",").map(s => s.trim()).filter(Boolean);
    }, [variant.sample_list]);

    // Related variants
    const related = useMemo(() => {
        const others = allVariants.filter(v => v.id !== variant.id);
        
        const sameGene = others
            .filter(v => v.gene_name === variant.gene_name && variant.gene_name)
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 5);

        const sameType = others
            .filter(v => v.sv_type === variant.sv_type)
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 5);

        const nearby = others
            .filter(v => v.chrom === variant.chrom && Math.abs(v.pos - variant.pos) <= 1_000_000)
            .sort((a, b) => Math.abs(a.pos - variant.pos) - Math.abs(b.pos - variant.pos))
            .slice(0, 5);

        return { sameGene, sameType, nearby };
    }, [variant, allVariants]);

    const renderRelatedList = (list: CohortVariant[], emptyMessage: string) => {
        if (list.length === 0) {
            return (
                <div className="py-8 text-center text-sm text-slate-400 font-light border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    {emptyMessage}
                </div>
            );
        }
        return (
            <div className="flex flex-col gap-2">
                {list.map(v => (
                    <div key={v.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-white hover:border-indigo-100 hover:shadow-sm transition-all sm:text-sm text-xs">
                        <div className="flex flex-col">
                            <span className="font-mono font-medium text-slate-800">{v.sv_type} {formatLocus(v)}</span>
                            <span className="text-slate-500">{v.gene_name || "Intergenic"}</span>
                        </div>
                        <div className="flex gap-4 text-right">
                            <div className="flex flex-col">
                                <span className="text-slate-400 text-[10px] uppercase tracking-wider">Freq</span>
                                <span className="font-mono text-slate-700">{(v.frequency * 100).toFixed(2)}%</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-slate-400 text-[10px] uppercase tracking-wider">Carriers</span>
                                <span className="font-mono text-slate-700">{v.sample_count}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-white/80 backdrop-blur-3xl rounded-[2rem] border border-slate-200/60 shadow-2xl p-6 sm:p-10 flex flex-col w-full text-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-4 mb-6">
                <button 
                    onClick={() => onClose?.()}
                    className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 px-3 py-1.5 rounded-lg shadow-sm"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Variant Registry
                </button>
                <div className="flex items-center gap-4">
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                        <BoxSelect className="w-3 h-3" /> Dataset <span className="font-mono text-slate-600 font-medium">{datasetId}</span>
                    </div>
                </div>
            </div>

            {/* Hero Summary */}
            <div className="flex flex-col xl:flex-row justify-between gap-8 mb-10">
                <div className="flex flex-col gap-3 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn("text-xs font-bold font-mono px-2 py-0.5 rounded border", getSVBadgeColor(variant.sv_type))}>
                            {variant.sv_type}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-widest border border-slate-200/60">
                            {freqBucket}
                        </span>
                        <button 
                            onClick={() => copyToClipboard(variant.variant_key)}
                            className="ml-auto xl:ml-0 flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 px-2 py-1 rounded transition-colors"
                            title="Copy Variant Key"
                        >
                            <Copy className="w-3 h-3" /> {variant.variant_key}
                        </button>
                    </div>
                    
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif tracking-tight text-slate-900 break-all leading-tight">
                        {variant.sv_type} <span className="text-slate-500 font-mono font-light ml-1">{locus}</span>
                    </h2>
                    
                    <p className="text-slate-500 flex items-center gap-2 text-sm sm:text-base font-medium">
                        <span className="text-indigo-600 bg-indigo-50 px-2 rounded-md">{gene}</span>
                        <span className="text-slate-300">&bull;</span>
                        <span>{variant.sample_count} carriers</span>
                        <span className="text-slate-300">&bull;</span>
                        <span>{(variant.frequency * 100).toFixed(2)}% frequency</span>
                    </p>
                </div>

                {/* Hero Stats */}
                <div className="flex gap-3 grid grid-cols-3 xl:flex shrink-0">
                    <div className="bg-slate-50/50 border border-slate-200/50 rounded-2xl p-4 flex flex-col justify-center min-w-[120px]">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold flex items-center gap-1.5 mb-1"><Users className="w-3 h-3"/> Carriers</span>
                        <span className="text-2xl font-serif">{formatNumber(variant.sample_count)}</span>
                    </div>
                    <div className="bg-slate-50/50 border border-slate-200/50 rounded-2xl p-4 flex flex-col justify-center min-w-[120px]">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold flex items-center gap-1.5 mb-1"><Activity className="w-3 h-3"/> Frequency</span>
                        <span className="text-2xl font-serif">{(variant.frequency * 100).toFixed(2)}<span className="text-sm text-slate-400 ml-0.5">%</span></span>
                    </div>
                    <div className="bg-slate-50/50 border border-slate-200/50 rounded-2xl p-4 flex flex-col justify-center min-w-[120px]">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold flex items-center gap-1.5 mb-1"><MapIcon className="w-3 h-3"/> Span</span>
                        <span className="text-2xl font-serif">{formatSpan(span)}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                {/* Facts Section */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200/50 pb-2 flex items-center gap-2">
                        <Dna className="w-4 h-4"/> Identity & Facts
                    </h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 p-5 bg-slate-50/50 border border-slate-200/60 rounded-2xl">
                        <div className="flex flex-col"><span className="text-[10px] text-slate-400 uppercase font-semibold">Variant Key</span><span className="text-sm font-mono text-slate-700 truncate" title={variant.variant_key}>{variant.variant_key}</span></div>
                        <div className="flex flex-col"><span className="text-[10px] text-slate-400 uppercase font-semibold">SV Type</span><span className="text-sm font-medium text-slate-700">{variant.sv_type}</span></div>
                        
                        <div className="flex flex-col"><span className="text-[10px] text-slate-400 uppercase font-semibold">Chromosome</span><span className="text-sm font-mono text-slate-700">{variant.chrom.startsWith('chr') ? variant.chrom : `chr${variant.chrom}`}</span></div>
                        <div className="flex flex-col"><span className="text-[10px] text-slate-400 uppercase font-semibold">Locus Span</span><span className="text-sm font-medium text-slate-700">{formatSpan(span)}</span></div>
                        
                        <div className="flex flex-col"><span className="text-[10px] text-slate-400 uppercase font-semibold">Start Position</span><span className="text-sm font-mono text-slate-700">{formatNumber(variant.pos)}</span></div>
                        <div className="flex flex-col"><span className="text-[10px] text-slate-400 uppercase font-semibold">End Position</span><span className="text-sm font-mono text-slate-700">{variant.end ? formatNumber(variant.end) : "N/A"}</span></div>
                        
                        <div className="flex flex-col"><span className="text-[10px] text-slate-400 uppercase font-semibold">Gene Context</span><span className="text-sm font-medium text-slate-700">{gene}</span></div>
                        <div className="flex flex-col"><span className="text-[10px] text-slate-400 uppercase font-semibold">Cohort Total</span><span className="text-sm font-medium text-slate-700">{formatNumber(totalSamples)} samples</span></div>
                    </div>
                </div>

                {/* Carriers Section */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200/50 pb-2 flex items-center justify-between">
                        <span className="flex items-center gap-2"><Users className="w-4 h-4"/> Carrier Samples</span>
                        <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{variant.sample_count} TOTAL</span>
                    </h3>
                    
                    <div className="p-5 bg-slate-50/50 border border-slate-200/60 rounded-2xl flex-1">
                        {sampleListArray.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm font-light">
                                <Users className="w-8 h-8 text-slate-200 mb-2" />
                                No sample references mapped directly.
                                <span className="text-xs mt-1">Found {variant.sample_count} generic carriers in summary.</span>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {(showAllCarriers ? sampleListArray : sampleListArray.slice(0, 12)).map((s, i) => (
                                        <span key={i} className="text-xs font-mono text-indigo-700 bg-white border border-indigo-100 shadow-sm px-2.5 py-1 rounded-md">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                                {sampleListArray.length > 12 && (
                                    <button 
                                        onClick={() => setShowAllCarriers(!showAllCarriers)}
                                        className="mt-auto self-start text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100"
                                    >
                                        {showAllCarriers ? "Show less" : `Show all ${sampleListArray.length} carriers`}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Related Variants */}
            <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200/50 pb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2"><Activity className="w-4 h-4"/> Related Variations</span>
                </h3>
                
                <div className="flex gap-2 mb-2">
                    <button 
                        onClick={() => setActiveRelatedTab("gene")}
                        className={cn("text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all", activeRelatedTab === "gene" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}
                    >
                        Same Gene
                    </button>
                    <button 
                        onClick={() => setActiveRelatedTab("type")}
                        className={cn("text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all", activeRelatedTab === "type" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}
                    >
                        Same SV Type
                    </button>
                    <button 
                        onClick={() => setActiveRelatedTab("nearby")}
                        className={cn("text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all", activeRelatedTab === "nearby" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}
                    >
                        Nearby (1 Mb)
                    </button>
                </div>

                <div className="mt-2">
                    {activeRelatedTab === "gene" && renderRelatedList(related.sameGene, variant.gene_name ? `No other variants found implicating ${variant.gene_name}` : "This variation is intergenic. Try nearby variants.")}
                    {activeRelatedTab === "type" && renderRelatedList(related.sameType, `No other ${variant.sv_type} events in this locus range.`)}
                    {activeRelatedTab === "nearby" && renderRelatedList(related.nearby, "No variants found within 1 Mb.")}
                </div>
            </div>
            
            {/* Extended Bottom Space Wrapper (in case it runs off during transition) */}
            <div className="h-6"></div>
        </div>
    );
}
