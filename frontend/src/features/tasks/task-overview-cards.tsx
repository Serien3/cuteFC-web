import type { Task } from "../../lib/types";

function formatTaskStatus(status: string): string {
  if (status === "pending") {
    return "待运行";
  }
  if (status === "running") {
    return "运行中";
  }
  if (status === "succeeded") {
    return "已完成";
  }
  if (status === "failed") {
    return "失败";
  }
  return status;
}

function formatDuration(startedAt: string | null, finishedAt: string | null): string {
  if (!startedAt || !finishedAt) {
    return "-";
  }

  const durationMs = new Date(finishedAt).getTime() - new Date(startedAt).getTime();
  if (Number.isNaN(durationMs) || durationMs < 0) {
    return "-";
  }

  return `${Math.round(durationMs / 1000)}s`;
}

type TaskOverviewCardsProps = {
  task: Task;
};

export function TaskOverviewCards({ task }: TaskOverviewCardsProps) {
  const cards = [
    { label: "状态", value: formatTaskStatus(task.status) },
    { label: "运行耗时", value: formatDuration(task.started_at, task.finished_at) },
    { label: "输出路径", value: task.output_path || "-" },
    { label: "平台", value: String(task.params.platform_type ?? "-") }
  ];

  return (
    <section className="panel">
      <h3>任务概览</h3>
      <div className="stat-grid">
        {cards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className="stat-label">{card.label}</div>
            <div className="stat-value task-overview-value">{card.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
