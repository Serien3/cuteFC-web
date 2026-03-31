import { useState } from "react";

import type { ResultVariantQuery } from "../../lib/types";

type ResultFilterBarProps = {
  busy?: boolean;
  onApply: (query: ResultVariantQuery) => void;
  onReset: () => void;
};

const EMPTY_QUERY: ResultVariantQuery = {
  chrom: "",
  sv_type: "",
  genotype: "",
  min_length: undefined,
  max_length: undefined
};

export function ResultFilterBar({ busy = false, onApply, onReset }: ResultFilterBarProps) {
  const [query, setQuery] = useState<ResultVariantQuery>(EMPTY_QUERY);

  function update<K extends keyof ResultVariantQuery>(key: K, value: ResultVariantQuery[K]) {
    setQuery((current) => ({ ...current, [key]: value }));
  }

  function handleApply() {
    onApply(
      Object.fromEntries(
        Object.entries(query).filter(([, value]) => value !== "" && value !== undefined)
      ) as ResultVariantQuery
    );
  }

  function handleReset() {
    setQuery(EMPTY_QUERY);
    onReset();
  }

  
  return (
    <section className="bg-white/40 backdrop-blur-2xl rounded-[3rem] p-8 border border-white/60 shadow-lg mb-12">
      <div className="flex flex-col md:flex-row gap-6 mt-4">
        
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold tracking-widest text-slate-400 uppercase mb-2 ml-4">Locus</label>
          <input
            aria-label="Chromosome"
            type="text"
            placeholder="e.g. chr1"
            value={query.chrom ?? ""}
            onChange={(event) => update("chrom", event.target.value)}
            className="w-full bg-slate-50/50 hover:bg-slate-100/50 backdrop-blur-md text-slate-800 font-medium text-lg border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all placeholder-slate-400 shadow-sm"
          />
        </div>

        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-bold tracking-widest text-slate-400 uppercase mb-2 ml-4">SV Type</label>
          <select
            aria-label="SV Type"
            value={query.sv_type ?? ""}
            onChange={(event) => update("sv_type", event.target.value)}
            className="w-full bg-slate-50/50 hover:bg-slate-100/50 backdrop-blur-md text-slate-800 font-medium text-lg border-none rounded-2xl px-6 py-4 outline-none transition-all appearance-none cursor-pointer focus:ring-2 focus:ring-amber-500/20 shadow-sm"
          >
            <option value="">All Types</option>
            <option value="DEL">DEL</option>
            <option value="INS">INS</option>
            <option value="DUP">DUP</option>
            <option value="INV">INV</option>
            <option value="BND">BND</option>
            <option value="TRA">TRA</option>
          </select>
        </div>

        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-bold tracking-widest text-slate-400 uppercase mb-2 ml-4">Genotype</label>
          <select
            aria-label="Genotype"
            value={query.genotype ?? ""}
            onChange={(event) => update("genotype", event.target.value)}
            className="w-full bg-slate-50/50 hover:bg-slate-100/50 backdrop-blur-md text-slate-800 font-medium text-lg border-none rounded-2xl px-6 py-4 outline-none transition-all appearance-none cursor-pointer focus:ring-2 focus:ring-amber-500/20 shadow-sm"
          >
            <option value="">All GTs</option>
            <option value="0/1">0/1</option>
            <option value="1/1">1/1</option>
            <option value="0/0">0/0</option>
            <option value="./.">./.</option>
          </select>
        </div>

        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-bold tracking-widest text-slate-400 uppercase mb-2 ml-4">Min Length (bp)</label>
          <input
            aria-label="Min Length"
            type="number"
            placeholder="0"
            value={query.min_length ?? ""}
            onChange={(event) => update("min_length", event.target.value ? Number(event.target.value) : undefined)}
            className="w-full bg-slate-50/50 hover:bg-slate-100/50 backdrop-blur-md text-slate-800 font-medium text-lg border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all placeholder-slate-400 shadow-sm"
          />
        </div>

        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-bold tracking-widest text-slate-400 uppercase mb-2 ml-4">Max Length (bp)</label>
          <input
            aria-label="Max Length"
            type="number"
            placeholder="∞"
            value={query.max_length ?? ""}
            onChange={(event) => update("max_length", event.target.value ? Number(event.target.value) : undefined)}
            className="w-full bg-slate-50/50 hover:bg-slate-100/50 backdrop-blur-md text-slate-800 font-medium text-lg border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all placeholder-slate-400 shadow-sm"
          />
        </div>

        <div className="flex items-end gap-3 pt-6 md:pt-0">
          <button 
            type="button" 
            disabled={busy} 
            onClick={handleApply}
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold tracking-wide transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {busy ? "Filtering..." : "Apply Filter"}
          </button>
          <button 
            type="button" 
            disabled={busy} 
            onClick={handleReset}
            className="bg-white/50 hover:bg-white text-slate-600 px-6 py-4 rounded-2xl font-bold tracking-wide transition-all border border-slate-200 shadow-sm disabled:opacity-50 whitespace-nowrap"
          >
            Reset
          </button>
        </div>
      </div>
    </section>
  );

}
