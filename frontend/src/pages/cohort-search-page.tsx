import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Database, ArrowRight } from "lucide-react";
import { PageHero } from "../components/page-hero";
import { CohortSearchBar } from "../features/cohort/cohort-search-bar";
import { useState } from "react";
import type { CohortSearchQuery } from "../lib/types";

export function CohortSearchPage() {
  const [searching, setSearching] = useState(false);

  async function handleSearch(query: CohortSearchQuery) {
    setSearching(true);
    // Simulate search routing/loading
    setTimeout(() => setSearching(false), 800);
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <>
      <PageHero
        eyebrow="Query Engine"
        title="Advanced Cohort Mining"
        description="Write complex parameters to isolate structural variants across thousands of sample genomes. Filter by frequency, region, and structural variant type."
        bgImage="https://www.insitro.com/wp-content/uploads/2023/11/Insitro-507-scaled.jpg"
      />

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="page !max-w-[1400px] !px-4 mt-8">
        <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-3xl rounded-[2.5rem] border border-white shadow-2xl shadow-slate-200/50 p-12 lg:p-16 relative overflow-hidden">

          <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
            <SlidersHorizontal className="w-64 h-64 text-slate-900" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="mb-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-6">
                <Search className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-4xl font-serif text-slate-900 tracking-tight mb-4">Set Parameters</h2>
              <p className="text-slate-500 font-light text-lg">Define loci, SV classifications, and occurrence frequencies to query the knowledge graph.</p>
            </div>

            <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-200">
              <CohortSearchBar onSearch={handleSearch} busy={searching} />
            </div>

            <div className="mt-16 pt-12 border-t border-slate-200/60 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-serif text-slate-800 mb-2">10M+</div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Known Variants</div>
              </div>
              <div className="text-center border-x border-slate-200/60">
                <div className="text-3xl font-serif text-slate-800 mb-2">&lt; 100ms</div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Query Latency</div>
              </div>
              <div className="text-center">
                <Database className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Real-time Indexed</div>
              </div>
            </div>
          </div>

        </motion.div>
      </motion.div>
    </>
  );
}
