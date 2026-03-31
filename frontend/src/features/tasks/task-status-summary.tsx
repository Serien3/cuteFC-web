import type { TaskStatusSummary as TaskStatusSummaryType } from "../../lib/types";

type TaskStatusSummaryProps = {
  summary: TaskStatusSummaryType;
};

const CARDS = [
  { key: "total", label: "任务总数" },
  { key: "running", label: "运行中" },
  { key: "failed", label: "失败" },
  { key: "succeeded", label: "已完成" }
] as const;

export function TaskStatusSummary({ summary }: TaskStatusSummaryProps) {
  
  return (
    <section className="flex flex-wrap gap-4 mb-16" aria-label="Task Overview">
      {CARDS.map((card) => {
         let cardStyle = "bg-white/40 border-white/60";
         let labelStyle = "text-slate-400";
         let valStyle = "text-slate-800";

         if (card.key === "running") {
            cardStyle = "bg-amber-500 text-white border-amber-400 shadow-lg shadow-amber-500/20";
            labelStyle = "text-amber-100";
            valStyle = "text-white";
         } else if (card.key === "failed") {
            cardStyle = "bg-red-50 text-red-900 border-red-100";
            labelStyle = "text-red-400";
            valStyle = "text-red-600";
         } else if (card.key === "succeeded") {
            cardStyle = "bg-slate-900 text-white border-slate-800 shadow-xl";
            labelStyle = "text-slate-400";
            valStyle = "text-white";
         }

         return (
            <div key={card.key} className={`flex-1 min-w-[150px] p-6 rounded-3xl border backdrop-blur-md transition-all hover:scale-105 ${cardStyle}`}>
               <h6 className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-2 ${labelStyle}`}>
                  {card.label === "任务总数" ? "Total Ops" : card.label === "运行中" ? "In Orbit" : card.label === "失败" ? "Failed Setup" : card.label === "已完成" ? "Completed" : card.label}
               </h6>
               <div className={`text-4xl md:text-5xl font-mono tracking-tighter ${valStyle}`}>
                  {summary[card.key]}
               </div>
            </div>
         );
      })}
    </section>
  );

}
