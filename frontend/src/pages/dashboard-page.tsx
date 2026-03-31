import { Link } from "react-router-dom";
import { getDashboard } from "../lib/api";
import { useAsyncData } from "../lib/use-async-data";
import { motion } from "framer-motion";
import { Activity, Database, PieChart, TrendingUp, AlertCircle, CheckCircle2, Clock, ChevronRight, Dna } from "lucide-react";

function formatTaskStatus(status: string) {
  switch (status) {
    case "pending": return { label: "Pending", icon: Clock, color: "text-amber-500", bg: "bg-amber-50" };
    case "running": return { label: "Running", icon: Activity, color: "text-amber-600", bg: "bg-amber-50" };
    case "succeeded": return { label: "Completed", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" };
    case "failed": return { label: "Failed", icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-50" };
    default: return { label: status, icon: Clock, color: "text-slate-500", bg: "bg-slate-50" };
  }
}

export function DashboardPage() {
  const { data: dashboard, error, loading } = useAsyncData(getDashboard, []);

  if (error || loading || !dashboard) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-10 h-10 border-4 border-slate-200 border-t-amber-500 rounded-full"
            />
            <p className="text-slate-500 font-medium tracking-wide">Initializing Pipeline...</p>
          </div>
        ) : (
          <div className="text-rose-500 bg-rose-50 p-6 rounded-2xl border border-rose-100 max-w-md text-center">
            <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-80" />
            <h3 className="font-semibold text-lg mb-1">Connection Error</h3>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        )}
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-8"
    >
      {/* Header Section */}
      <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/60 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold tracking-widest uppercase mb-4 shadow-sm border border-amber-100/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            System Active
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-tight">
            {dashboard.hero.title || "Structure Variants Intelligence"}
          </h1>
          <p className="text-slate-500 mt-2 max-w-xl text-lg font-light leading-relaxed">
            {dashboard.hero.subtitle || "Monitor genomic pipelines, analyze cohort variants, and orchestrate large-scale SV discovery."}
          </p>
        </div>
        
        <div className="flex gap-3">
          <Link
            to="/app/genetic-map"
            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-amber-300 hover:shadow-md hover:text-amber-700 transition-all font-medium text-sm text-slate-700 flex items-center gap-2"
          >
            <Database className="w-4 h-4" /> View Cohort
          </Link>
          <Link
            to="/app/pipeline/new"
            className="px-5 py-2.5 rounded-xl bg-slate-900 !text-slate-50 shadow-lg shadow-slate-900/20 hover:bg-amber-700 hover:shadow-amber-700/30 transition-all font-medium text-sm flex items-center gap-2"
          >
            <Activity className="w-4 h-4" /> New Analysis
          </Link>
        </div>
      </motion.header>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dashboard.stats.map((stat: any, i: number) => (
          <div 
            key={i} 
            className="group relative bg-white/70 backdrop-blur-2xl rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-amber-900/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-slate-50/80 to-transparent rounded-bl-full opacity-50 group-hover:from-amber-50/80 transition-colors" />
            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-bold tracking-tight text-slate-900">
                {stat.value}
              </h3>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-amber-600 bg-amber-50 w-fit px-2 py-1 rounded-md">
              <TrendingUp className="w-3 h-3 mr-1" /> Updated Just Now
            </div>
          </div>
        ))}
      </motion.div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - SV Distribution */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
          <div className="bg-white/70 backdrop-blur-2xl border-white rounded-[2rem] p-8 border border-slate-200/60 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Dna className="w-48 h-48 text-slate-900" />
            </div>
            
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-amber-50 flex items-center justify-center border border-slate-100">
                <PieChart className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight text-slate-900">Variant Signature</h3>
                <p className="text-sm text-slate-500">Distribution of structural alterations across the cohort</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
              {Object.entries(dashboard.sv_type_distribution || {}).map(([type, count]: [string, any]) => (
                <div key={type} className="bg-slate-50/50 hover:bg-slate-50 rounded-2xl p-4 transition-colors border border-slate-100/50">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{type}</div>
                  <div className="text-2xl font-bold text-slate-800">{count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hotspots */}
          <div className="bg-white/70 backdrop-blur-2xl border-white rounded-[2rem] p-8 border border-slate-200/60 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-100/50">
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-slate-900">Genomic Hotspots</h3>
                  <p className="text-sm text-slate-500">High-frequency structural variance loci</p>
                </div>
              </div>
              <Link
                to="/app/genetic-map"
                className="text-sm font-semibold text-amber-600 hover:text-amber-700 flex items-center transition-colors"
              >
                Explore All <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="space-y-3">
              {dashboard.hotspots?.map((spot: any, i: number) => (
                <div key={i} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xs font-mono font-bold text-slate-600 border border-slate-200/60 group-hover:bg-white group-hover:shadow-sm">
                      {spot.chrom}
                    </div>
                    <div>
                      <div className="font-mono text-sm font-semibold text-slate-700 mb-0.5">Pos: {spot.pos.toLocaleString()}</div>
                      <div className="text-xs text-slate-400">Var Key: {spot.variant_key}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-lg font-bold text-slate-800">{Math.round(spot.frequency * 100)}%</div>
                    <div className="text-xs font-medium text-slate-400 uppercase tracking-widest">Freq</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Column - Recent Activity */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="bg-white/70 backdrop-blur-2xl border-white rounded-[2rem] p-6 lg:p-8 border border-slate-200/60 shadow-sm sticky top-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200/50">
                <Activity className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight text-slate-900">Pipeline Activity</h3>
                <p className="text-sm text-slate-500">Recent task executions</p>
              </div>
            </div>

            <div className="space-y-5">
              {dashboard.recent_tasks?.map((task: any) => {
                const StatusOptions = formatTaskStatus(task.status);
                const StatusIcon = StatusOptions.icon;
                return (
                  <div key={task.id} className="relative pl-6 pb-5 border-l-2 border-slate-100 last:pb-0 last:border-transparent group">
                    <div className={`absolute -left-[11px] top-0.5 w-5 h-5 rounded-full border-4 border-white ${StatusOptions.bg} flex items-center justify-center`}>
                      <div className={`w-2 h-2 rounded-full ${StatusOptions.color.replace('text-', 'bg-')}`} />
                    </div>
                    
                    <div className="bg-white group-hover:bg-slate-50 border border-slate-100 p-4 rounded-2xl transition-all shadow-sm group-hover:shadow cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-slate-800 text-sm truncate pr-4">{task.task_name}</h4>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${StatusOptions.bg} ${StatusOptions.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {StatusOptions.label}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono">ID: {String(task.id)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <Link
              to="/app/pipeline"
              className="w-full mt-6 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors block text-center"
            >
              View All Tasks
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
