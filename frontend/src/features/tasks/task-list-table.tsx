import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Droplet, Activity, CheckCircle2, AlertCircle } from "lucide-react";
import type { Task } from "../../lib/types";

function formatTaskTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function getStatusInfo(status: string) {
  switch (status) {
    case "pending": return { label: "Pending", icon: Droplet, color: "text-amber-500", bg: "bg-amber-500", progress: 25 };
    case "running": return { label: "Sequencing", icon: Activity, color: "text-cyan-500", bg: "bg-cyan-500", progress: 65 };
    case "succeeded": return { label: "Completed", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500", progress: 100 };
    case "failed": return { label: "Failed", icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-500", progress: 100 };
    default: return { label: status, icon: Droplet, color: "text-slate-500", bg: "bg-slate-500", progress: 0 };
  }
}

export function TaskListTable({ tasks }: { tasks: Task[] }) {
  return (
    <div className="space-y-4">
      {tasks.map((task, i) => {
        const platform = String(task.params.platform_type ?? "Unknown");
        const status = getStatusInfo(task.status);
        const Icon = status.icon;

        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={task.id}
            className="group relative bg-white/70 backdrop-blur-2xl rounded-[2rem] p-6 md:p-8 border border-white shadow-xl shadow-slate-200/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-900/5 transition-all duration-500 overflow-hidden flex flex-col md:flex-row md:items-center gap-6 md:gap-12"
          >
            {/* Background gradient hint */}
            <div className={`absolute -inset-20 opacity-0 group-hover:opacity-10 transition-opacity duration-1000 bg-gradient-to-r from-transparent via-${status.bg.split('-')[1]}-500 to-transparent blur-3xl rounded-full`} />

            {/* Left Info */}
            <div className="flex-1 z-10">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] border ${status.color.replace('text', 'border')} ${status.color}`}>
                  {status.label}
                </span>
                <span className="text-[11px] text-slate-400 font-mono tracking-wider">{formatTaskTime(task.updated_at)}</span>
              </div>
              <h3 className="text-2xl font-serif text-slate-900 tracking-tight leading-none mb-1">
                {task.task_name}
              </h3>
              <p className="text-sm text-slate-500 font-light flex items-center gap-2">
                <span className="font-medium text-slate-700">{task.project_name}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span>{task.sample_name}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-amber-700 font-medium">{platform}</span>
              </p>
            </div>

            {/* Pipeline Progress */}
            <div className="flex-1 w-full relative z-10 flex flex-col justify-center">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-3">
                <span className={task.status !== 'pending' ? 'text-slate-800' : ''}>Initiated</span>
                <span className={task.status === 'running' || task.status === 'succeeded' ? 'text-slate-800' : ''}>Processing</span>
                <span className={task.status === 'succeeded' ? 'text-emerald-600' : task.status === 'failed' ? 'text-rose-600' : ''}>Results</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${status.progress}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className={`absolute top-0 left-0 h-full ${status.bg}`} 
                />
              </div>
            </div>

            {/* Action */}
            <div className="z-10 flex justify-end">
              <Link
                to={task.has_results ? `/app/results/${task.id}` : `/app/pipeline/${task.id}`}
                className="group/btn flex items-center justify-center w-14 h-14 rounded-full bg-slate-50 hover:bg-slate-900 border border-slate-200 hover:border-slate-900 transition-colors duration-500 shadow-sm"
              >
                <ChevronRight className="w-6 h-6 text-slate-400 group-hover/btn:text-white transition-colors duration-500 group-hover/btn:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
