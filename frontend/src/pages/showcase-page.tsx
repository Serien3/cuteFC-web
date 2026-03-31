import { motion } from "framer-motion";
import { ArchitecturePanel } from "../features/showcase/architecture-panel";
import { ShowcaseHero } from "../features/showcase/showcase-hero";
import { getShowcasePage } from "../lib/api";
import { useAsyncData } from "../lib/use-async-data";

export function ShowcasePage() {
  const { data, error, loading } = useAsyncData(getShowcasePage, []);

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  if (error || loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="w-16 h-16 border-[1px] border-slate-200 border-t-slate-800 rounded-full" />
            <p className="text-slate-500 font-mono tracking-widest text-xs uppercase pt-4">Loading Architecture...</p>
          </div>
        ) : (
          <div className="text-rose-500 bg-rose-50 p-6 rounded-2xl border border-rose-100 max-w-md text-center">
            <h3 className="font-serif text-2xl mb-1">Error</h3>
            <p className="text-sm font-light opacity-80">{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="page !max-w-[1400px] !px-4">
      {/* Insitro style Giant Header */}
      <motion.div variants={itemVariants} className="pt-16 pb-24 border-b border-black/5 mb-16 relative">
        <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-gradient-to-bl from-amber-100 to-transparent blur-3xl opacity-50 rounded-full" />
        <span className="text-amber-600 font-bold uppercase tracking-[0.2em] text-[11px] mb-6 block">Platform Architecture</span>
        <h1 className="text-6xl md:text-[7rem] font-serif text-slate-900 tracking-tighter leading-[0.9] mb-8 max-w-5xl">
          {data.hero.title || "The cuteFC Engine."}
        </h1>
        <p className="text-slate-500 text-2xl font-light max-w-3xl leading-relaxed">
          {data.hero.subtitle || "A unified framework for structural variant deduction. We seamlessly blend high-throughput algorithmic calling with an interactive cohort intelligence graph."}
        </p>
      </motion.div>

      {/* Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
        
        <div className="space-y-8 lg:space-y-16">
          <div className="bg-slate-900 text-white rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden group hover:shadow-2xl hover:shadow-slate-900/20 transition-all duration-700">
             <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
             <h3 className="text-3xl font-serif tracking-tight mb-8 relative z-10">System Architecture</h3>
             <ul className="space-y-6 relative z-10">
               {data.architecture.map((item: string, i: number) => (
                 <li key={i} className="flex gap-4 items-start">
                   <div className="text-amber-500 font-mono tracking-tighter pt-1 opacity-60">{'0'+(i+1)}</div>
                   <p className="text-lg font-light text-slate-300 leading-relaxed">{item}</p>
                 </li>
               ))}
             </ul>
          </div>

          <div className="bg-white/60 backdrop-blur-2xl border border-white rounded-[2.5rem] p-10 md:p-14 shadow-xl shadow-slate-200/40 hover:-translate-y-2 transition-all duration-700">
             <h3 className="text-3xl font-serif text-slate-900 tracking-tight mb-8">Clinical Value</h3>
             <p className="text-xl text-slate-500 font-light leading-relaxed mb-8">
               Single-sample variant orchestration, multi-cohort data indexing, and storytelling are blended into one unified ecosystem.
             </p>
             <div className="h-[2px] w-full bg-gradient-to-r from-amber-500 to-transparent mb-8" />
             <p className="text-sm font-bold uppercase tracking-[0.1em] text-slate-400">cuteFC Foundation</p>
          </div>
        </div>

        <div className="space-y-8 lg:space-y-16 lg:mt-32">
          <div className="bg-white/80 backdrop-blur-2xl border border-white rounded-[2.5rem] p-10 md:p-14 shadow-xl shadow-slate-200/40">
             <h3 className="text-3xl font-serif tracking-tight mb-8 text-slate-900">Innovation Points</h3>
             <ul className="space-y-6">
               {data.innovation_points.map((item: string, i: number) => (
                 <div key={i} className="pb-6 border-b border-black/5 last:border-0 last:pb-0">
                   <p className="text-lg font-light text-slate-600 leading-relaxed">{item}</p>
                 </div>
               ))}
             </ul>
          </div>

          <div className="bg-amber-50 rounded-[2.5rem] p-10 md:p-14 border border-amber-100">
             <h3 className="text-3xl font-serif tracking-tight mb-8 text-amber-900">Pipeline Timeline</h3>
             <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-amber-200">
               {data.workflow.map((item: string, i: number) => (
                 <div key={i} className="relative z-10 pl-10">
                   <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white border-2 border-amber-500 flex items-center justify-center">
                     <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                   </div>
                   <p className="text-lg font-light text-amber-800 leading-relaxed pt-0.5">{item}</p>
                 </div>
               ))}
             </div>
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
}
