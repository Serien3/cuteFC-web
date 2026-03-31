import { useEffect, useState } from "react";
import { Filter, RotateCcw, Search, SlidersHorizontal, ChevronDown } from "lucide-react";

import type { ResultVariantQuery } from "../../lib/types";

type ResultBrowserFiltersProps = {
  busy?: boolean;
  query: ResultVariantQuery;
  onApply: (query: ResultVariantQuery) => void;
  onReset: () => void;
};

const EMPTY_QUERY: ResultVariantQuery = {
  chrom: "",
  sv_type: "",
  genotype: "",
  start: undefined,
  end: undefined,
  min_length: undefined,
  max_length: undefined,
  min_support_reads: undefined,
  max_support_reads: undefined,
  sort_by: "pos",
  sort_order: "asc",
  limit: 25,
  offset: 0
};

const SV_TYPES = ["DEL", "INS", "DUP", "INV", "BND", "TRA"];
const GENOTYPES = ["0/1", "1/1", "0/0", "./."];

export function ResultBrowserFilters({
  busy = false,
  query,
  onApply,
  onReset
}: ResultBrowserFiltersProps) {
  const [draft, setDraft] = useState<ResultVariantQuery>(query);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setDraft(query);
  }, [query]);

  function update<K extends keyof ResultVariantQuery>(key: K, value: ResultVariantQuery[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleApply() {
    onApply(
      Object.fromEntries(
        Object.entries(draft).filter(([, value]) => value !== "" && value !== undefined)
      ) as ResultVariantQuery
    );
  }

  function handleReset() {
    setDraft(EMPTY_QUERY);
    onReset();
  }

  const activeFiltersCount = Object.entries(draft).filter(([key, value]) => {
    if (key === 'sort_by' || key === 'sort_order' || key === 'limit' || key === 'offset') return false;
    return value !== "" && value !== undefined;
  }).length;

  return (
    <section className="bg-white/40 backdrop-blur-2xl rounded-[3rem] p-8 border border-white/60 shadow-xl overflow-hidden mb-8 transition-all duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
            <Filter size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-sans tracking-tight text-slate-800">
              Browser Filters
            </h2>
            <p className="text-slate-500 font-medium text-sm">
              Refine your selection by locus, metrics, and classification.
              {activeFiltersCount > 0 && <span className="ml-2 text-indigo-500 font-semibold">{activeFiltersCount} active</span>}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            type="button" 
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:bg-white hover:text-slate-800 transition-all border border-transparent hover:border-slate-200" 
            disabled={busy} 
            onClick={handleReset}
          >
            <RotateCcw size={16} />
            Reset
          </button>
          <button 
            type="button" 
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-500 hover:bg-indigo-600 shadow-md hover:shadow-lg transition-all" 
            disabled={busy} 
            onClick={handleApply}
          >
            <Search size={16} />
            {busy ? "Applying..." : "Apply Filters"}
          </button>
        </div>
      </div>

      {/* Primary Filters - Always visible */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Chromosome Input */}
        <div className="col-span-1 border border-slate-200/60 bg-white/50 rounded-2xl p-3 flex flex-col gap-1.5 focus-within:border-indigo-400 focus-within:bg-white transition-colors">
          <label className="text-xs font-bold tracking-widest text-slate-400 uppercase ml-1">Chromosome</label>
          <input
            type="text"
            className="w-full bg-transparent border-none outline-none font-medium text-slate-700 placeholder:text-slate-300 px-1"
            placeholder="e.g. chr1"
            value={draft.chrom ?? ""}
            onChange={(e) => update("chrom", e.target.value)}
          />
        </div>

        {/* Start Position */}
        <div className="col-span-1 border border-slate-200/60 bg-white/50 rounded-2xl p-3 flex flex-col gap-1.5 focus-within:border-indigo-400 focus-within:bg-white transition-colors">
          <label className="text-xs font-bold tracking-widest text-slate-400 uppercase ml-1">Start Pos</label>
          <input
            type="number"
            className="w-full bg-transparent border-none outline-none font-mono text-slate-700 placeholder:text-slate-300 px-1"
            placeholder="Any"
            value={draft.start ?? ""}
            onChange={(e) => update("start", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        {/* End Position */}
        <div className="col-span-1 border border-slate-200/60 bg-white/50 rounded-2xl p-3 flex flex-col gap-1.5 focus-within:border-indigo-400 focus-within:bg-white transition-colors">
          <label className="text-xs font-bold tracking-widest text-slate-400 uppercase ml-1">End Pos</label>
          <input
            type="number"
            className="w-full bg-transparent border-none outline-none font-mono text-slate-700 placeholder:text-slate-300 px-1"
            placeholder="Any"
            value={draft.end ?? ""}
            onChange={(e) => update("end", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        {/* SV Type Toggle Group */}
        <div className="col-span-1 md:col-span-1 flex flex-col gap-2 justify-center">
           <label className="text-xs font-bold tracking-widest text-slate-400 uppercase ml-1">SV Type</label>
           <div className="relative">
             <select
               className="w-full appearance-none bg-white/50 border border-slate-200/60 rounded-xl px-4 py-2 font-semibold text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors cursor-pointer"
               value={draft.sv_type ?? ""}
               onChange={(e) => update("sv_type", e.target.value)}
             >
               <option value="">All Types</option>
               {SV_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
             </select>
             <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
           </div>
        </div>
      </div>

      {/* Divider with Toggle for Advanced */}
      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-slate-200/50"></div>
        </div>
        <button
          className="relative inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full text-xs font-bold text-slate-400 hover:text-indigo-500 border border-slate-200/50 shadow-sm transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <SlidersHorizontal size={12} />
          {isExpanded ? "Hide Advanced Filters" : "Show Advanced Filters"}
        </button>
      </div>

      {/* Advanced Filters Grid */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2 animate-in fade-in slide-in-from-top-4 duration-300">
          
          {/* Genotype */}
          <div className="col-span-1">
            <label className="text-xs font-bold tracking-widest text-slate-400 uppercase ml-1 mb-2 block">Genotype</label>
            <div className="relative">
             <select
               className="w-full appearance-none bg-white/50 border border-slate-200/60 rounded-xl px-4 py-2 font-semibold text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors cursor-pointer"
               value={draft.genotype ?? ""}
               onChange={(e) => update("genotype", e.target.value)}
             >
               <option value="">All GTs</option>
               {GENOTYPES.map(t => <option key={t} value={t}>{t}</option>)}
             </select>
             <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
           </div>
          </div>

          {/* Length Range */}
          <div className="col-span-1 md:col-span-1">
            <label className="text-xs font-bold tracking-widest text-slate-400 uppercase ml-1 mb-2 block">Length Range (bp)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="w-full bg-white/50 border border-slate-200/60 rounded-xl px-3 py-2 font-mono text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors"
                placeholder="Min"
                value={draft.min_length ?? ""}
                onChange={(e) => update("min_length", e.target.value ? Number(e.target.value) : undefined)}
              />
              <span className="text-slate-300 font-bold">-</span>
              <input
                type="number"
                className="w-full bg-white/50 border border-slate-200/60 rounded-xl px-3 py-2 font-mono text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors"
                placeholder="Max"
                value={draft.max_length ?? ""}
                onChange={(e) => update("max_length", e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </div>

          {/* Support Reads */}
          <div className="col-span-1 md:col-span-1">
            <label className="text-xs font-bold tracking-widest text-slate-400 uppercase ml-1 mb-2 block">Support Reads</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="w-full bg-white/50 border border-slate-200/60 rounded-xl px-3 py-2 font-mono text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors"
                placeholder="Min"
                value={draft.min_support_reads ?? ""}
                onChange={(e) => update("min_support_reads", e.target.value ? Number(e.target.value) : undefined)}
              />
              <span className="text-slate-300 font-bold">-</span>
              <input
                type="number"
                className="w-full bg-white/50 border border-slate-200/60 rounded-xl px-3 py-2 font-mono text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors"
                placeholder="Max"
                value={draft.max_support_reads ?? ""}
                onChange={(e) => update("max_support_reads", e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </div>

          {/* Sorting and limits */}
          <div className="col-span-1 md:col-span-1 flex flex-col gap-3">
             <div className="flex gap-2">
                <div className="flex-1 relative">
                  <select
                    className="w-full appearance-none bg-white/50 border border-slate-200/60 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors cursor-pointer"
                    value={draft.sort_by ?? "pos"}
                    onChange={(e) => update("sort_by", e.target.value)}
                  >
                    <option value="pos">Sort: Pos</option>
                    <option value="end">Sort: End</option>
                    <option value="sv_len">Sort: Length</option>
                    <option value="support_reads">Sort: Reads</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                </div>
                <div className="relative w-24">
                  <select
                    className="w-full appearance-none bg-white/50 border border-slate-200/60 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors cursor-pointer"
                    value={draft.sort_order ?? "asc"}
                    onChange={(e) => update("sort_order", e.target.value as "asc" | "desc")}
                  >
                    <option value="asc">Asc</option>
                    <option value="desc">Desc</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                </div>
             </div>
             <div className="relative">
                <select
                  className="w-full appearance-none bg-indigo-50/50 border border-indigo-100 rounded-xl px-3 py-2 text-sm font-semibold text-indigo-700 focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors cursor-pointer"
                  value={String(draft.limit ?? 25)}
                  onChange={(e) => update("limit", Number(e.target.value))}
                >
                  <option value="25">Display: 25 items</option>
                  <option value="50">Display: 50 items</option>
                  <option value="100">Display: 100 items</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" size={16} />
             </div>
          </div>

        </div>
      )}
    </section>
  );
}
