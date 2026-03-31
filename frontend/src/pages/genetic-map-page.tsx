import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Sparkles, X, Activity, ListFilter, AlignLeft } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { CohortSearchBar } from "../features/cohort/cohort-search-bar";
import { VariantTable } from "../features/cohort/components/VariantTable";
import { getCohortDatasets, getCohortOverview, searchCohort } from "../lib/api";
import type { CohortSearchQuery, CohortVariant } from "../lib/types";
import { useAsyncData } from "../lib/use-async-data";

const DEMO_DATASET_NAME = "Competition Demo Atlas";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function buildSearchLabel(query: CohortSearchQuery): string {
  const labels = [
    query.gene_name ? `Gene: ${query.gene_name}` : null,
    query.sample_name ? `Sample: ${query.sample_name}` : null,
    query.sv_type ? `SV: ${query.sv_type}` : null,
    query.chrom && query.start !== undefined && query.end !== undefined
      ? `Locus: ${query.chrom}:${query.start}-${query.end}`
      : null,
    query.frequency_min !== undefined ? `Min Freq: ${query.frequency_min}` : null,
    query.frequency_max !== undefined ? `Max Freq: ${query.frequency_max}` : null
  ];
  return labels.filter(Boolean).join(" | ");
}

const CHROMOSOMES = [
  "chr1", "chr2", "chr3", "chr4", "chr5", "chr6", "chr7", "chr8", "chr9", "chr10",
  "chr11", "chr12", "chr13", "chr14", "chr15", "chr16", "chr17", "chr18", "chr19", "chr20",
  "chr21", "chr22", "chrX", "chrY"
];

// Helper: simplified variant density grouping for the UI
function groupVariantsByChrom(variants: CohortVariant[]) {
  const map: Record<string, CohortVariant[]> = {};
  for (const c of CHROMOSOMES) {
    map[c] = [];
  }
  for (const v of variants) {
    const c = v.chrom.startsWith("chr") ? v.chrom : `chr${v.chrom}`;
    if (map[c]) {
      map[c].push(v);
    }
  }
  return map;
}

export function GeneticMapPage() {
  const {
    data: cohortData,
    error,
    loading
  } = useAsyncData(
    async () => {
      const datasets = await getCohortDatasets();
      const dataset =
        datasets.find((item) => item.dataset_name === DEMO_DATASET_NAME && item.import_status === "succeeded") ??
        datasets.find((item) => item.import_status === "succeeded") ??
        datasets[0];
      if (!dataset) throw new Error("No active cohort dataset available.");
      const [overview, variants] = await Promise.all([
        getCohortOverview(dataset.id),
        searchCohort({}, dataset.id)
      ]);
      return { dataset, overview, variants };
    },
    []
  );

  const [searchResults, setSearchResults] = useState<CohortVariant[] | null>(null);
  const [searchLabel, setSearchLabel] = useState<string>("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<CohortVariant | null>(null);

  // Derive current viewing items
  // First priority: explicit search results. Otherwise show the full imported cohort registry.
  const displayItems = useMemo(() => {
    if (searchResults) return searchResults;
    return cohortData?.variants ?? [];
  }, [cohortData, searchResults]);

  const chromGroups = useMemo(() => groupVariantsByChrom(displayItems), [displayItems]);

  // Compute dominant SV
  const dominantSvType = useMemo(() => {
    if (!displayItems.length) return "N/A";
    const counts: Record<string, number> = {};
    for (const v of displayItems) {
      counts[v.sv_type] = (counts[v.sv_type] || 0) + 1;
    }
    let max = 0, typeDesc = "N/A";
    for (const [t, c] of Object.entries(counts)) {
      if (c > max) { max = c; typeDesc = t; }
    }
    return typeDesc;
  }, [displayItems]);

  const hotspotCount = useMemo(() => displayItems.filter(v => v.frequency >= 0.5).length, [displayItems]);
  const rareCount = useMemo(() => displayItems.filter(v => v.frequency > 0 && v.frequency <= 0.1).length, [displayItems]);

  async function handleSearch(query: CohortSearchQuery) {
    if (Object.keys(query).length === 0) {
      setSearchResults(null); setSearchLabel(""); setSearchError(null); return;
    }
    if (!cohortData) return;
    setSearching(true); setSearchError(null); setSelectedVariant(null);

    try {
      const results = await searchCohort(query, cohortData.dataset.id);
      setSearchResults(results);
      setSearchLabel(buildSearchLabel(query));
    } catch (err: unknown) {
      setSearchResults(null);
      setSearchLabel(buildSearchLabel(query));
      setSearchError(err instanceof Error ? err.message : "Search failed.");
    } finally {
      setSearching(false);
    }
  }

  function handleQuickSearch(type: string) {
    handleSearch({ sv_type: type });
  }

  function resetSearch() {
    setSearchResults(null);
    setSearchLabel("");
    setSearchError(null);
    setSelectedVariant(null);
  }

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  if (error || loading || !cohortData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        {loading ? (
          <div className="flex flex-col items-center gap-6">
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2, ease: "easeInOut" }}
                  className="w-3 h-3 bg-indigo-500 rounded-full"
                />
              ))}
            </div>
            <p className="text-slate-500 font-mono tracking-widest text-xs uppercase animate-pulse">Initializing DB...</p>
          </div>
        ) : (
          <div className="text-rose-500 bg-rose-50 p-6 rounded-2xl border border-rose-100 max-w-md text-center">
            <h3 className="font-serif text-2xl mb-1">Database Error</h3>
            <p className="text-sm font-light opacity-80">{error}</p>
          </div>
        )}
      </div>
    );
  }

  const { overview } = cohortData;

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden" style={{ backgroundImage: 'radial-gradient(circle at center, #cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px', backgroundPosition: 'center center' }}>

      {/* 1. Search Hero Section */}
      <div className="relative w-full bg-white/60 backdrop-blur-2xl border-b border-slate-200/60 pt-32 pb-12 mb-10 overflow-hidden">

        {/* Background Image */}
        <motion.div
          initial={{ opacity: 0, x: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-0 pointer-events-none"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50/90 via-slate-50/80 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent z-10" />
          <img
            src="https://www.insitro.com/wp-content/uploads/2023/10/hero-people.jpg"
            alt="Genetic Map Background"
            className="w-full h-full object-cover object-right opacity-80 mix-blend-multiply filter grayscale-[15%]"
          />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 xl:px-12">

          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-3 font-serif">
              群体结构变异图谱 <span className="text-xl md:text-2xl text-slate-400 font-sans font-light tracking-normal block mt-2">Population Structural Variant Explorer</span>
            </h1>
            <p className="text-slate-600 max-w-2xl">
              Explore cohort-level structural variants across human genome. Dataset <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-800">{overview.dataset_id}</span> with <span className="font-semibold">{overview.total_samples}</span> sequenced samples.
            </p>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-200/50 shadow-xl shadow-slate-100 flex flex-col gap-4">
            <CohortSearchBar onSearch={handleSearch} busy={searching} />
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">Quick Hits:</span>
              <button onClick={() => resetSearch()} className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition">Reset All</button>
              <div className="w-px h-4 bg-slate-200 mx-1"></div>
              {["DEL", "INS", "DUP", "INV", "BND"].map(sv => (
                <button key={sv} onClick={() => handleQuickSearch(sv)} className="px-3 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium transition">
                  {sv}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {searchLabel && (
              <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: "auto", marginTop: 24 }} exit={{ opacity: 0, height: 0, marginTop: 0 }} className="overflow-hidden">
                <div className="bg-amber-50/80 backdrop-blur-md rounded-[1.5rem] p-4 border border-amber-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-700">Active Query</span>
                    <span className="font-mono text-sm tracking-tight text-amber-900 bg-white/50 px-3 py-1 rounded-lg">{searchLabel}</span>
                    {searchError && <span className="text-rose-500 font-medium text-xs">{searchError}</span>}
                  </div>
                  <button onClick={resetSearch} className="text-amber-600 hover:text-amber-800 p-2 rounded-full hover:bg-amber-100/50 transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto px-6 xl:px-12 pb-24">

        {/* 2. Variant Atlas View (Chromosome Atlas + Summary) */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">

          {/* Chromosome Atlas - 2/3 */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-2xl border border-slate-200/50 rounded-[2rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-serif text-slate-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                Chromosome Atlas
              </h3>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">{displayItems.length} Variants Displayed</p>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {CHROMOSOMES.map(chr => {
                const hits = chromGroups[chr] || [];
                const hitCount = hits.length;
                const hasHits = hitCount > 0;

                return (
                  <div key={chr} className="flex items-center gap-4 group">
                    <div className="w-12 text-right">
                      <span className={cn("text-xs font-mono font-medium transition-colors", hasHits ? "text-slate-700" : "text-slate-300")}>{chr}</span>
                    </div>
                    <div className="flex-1 h-3 rounded-full bg-slate-100 border border-slate-200/50 relative overflow-hidden group-hover:bg-slate-200 transition-colors cursor-pointer" title={hasHits ? `${hitCount} variants on ${chr}` : "No variants"}>
                      {/* Mock Density Dots */}
                      {hasHits && (
                        <div className="absolute inset-y-0 left-0 w-full flex items-center">
                          {Array.from({ length: Math.min(20, hitCount) }).map((_, i) => (
                            <div key={i} className="absolute h-full w-1 bg-indigo-500/40 mix-blend-multiply" style={{ left: `${Math.random() * 95}%` }} />
                          ))}
                        </div>
                      )}
                      {hitCount > 50 && <div className="absolute inset-y-0 left-1/4 right-3/4 bg-amber-400/30 blur-sm" />}
                    </div>
                    <div className="w-10">
                      {hasHits ? (
                        <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{hitCount}</span>
                      ) : (
                        <span className="text-[10px] text-transparent">-</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selection Summary - 1/3 */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-2 pl-2">Selection Insight</h3>

            <div className="grid grid-cols-2 gap-4 flex-1">
              <div className="bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-[1.5rem] p-6 shadow-sm flex flex-col justify-center">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Target className="w-3 h-3" /> Total Items</span>
                <span className="text-4xl font-serif text-slate-800">{displayItems.length}</span>
              </div>
              <div className="bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-[1.5rem] p-6 shadow-sm flex flex-col justify-center">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><AlignLeft className="w-3 h-3" /> Dominant SV</span>
                <span className="text-2xl font-serif text-slate-800">{dominantSvType}</span>
              </div>
              <div className="bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-[1.5rem] p-6 shadow-sm flex flex-col justify-center">
                <span className="text-xs font-semibold text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-1"><Activity className="w-3 h-3" /> Hotspots</span>
                <span className="text-3xl font-serif text-amber-600">{hotspotCount}</span>
              </div>
              <div className="bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-[1.5rem] p-6 shadow-sm flex flex-col justify-center">
                <span className="text-xs font-semibold text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Rare Types</span>
                <span className="text-3xl font-serif text-emerald-600">{rareCount}</span>
              </div>
            </div>
          </div>

        </motion.div>

        {/* 3. Variant List & Details */}
        <motion.div variants={itemVariants} className="min-h-[500px] flex flex-col mb-10 w-full max-w-full overflow-hidden">
          <div className="flex items-center justify-between mb-4 pl-2">
            <h3 className="text-xl font-serif text-slate-800 flex items-center gap-2">
              <ListFilter className="w-5 h-5 text-slate-400" />
              Variant Directory
            </h3>
          </div>

          <div className="flex-1 flex flex-col w-full">
            {/* The table takes full width */}
            <VariantTable
              variants={displayItems}
              selectedVariant={selectedVariant}
              onSelectVariant={(v) => setSelectedVariant((current) => (current?.id === v.id ? null : v))}
              totalSamples={overview?.total_samples || 100}
              datasetId={overview?.dataset_id || ""}
            />
          </div>

        </motion.div>

      </motion.div>
    </div>
  );
}
