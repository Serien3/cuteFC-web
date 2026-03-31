import { Link } from "react-router-dom";

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

type TaskDetailHeaderProps = {
  running: boolean;
  task: Task;
  onRunTask: () => void;
};

export function TaskDetailHeader({ running, task, onRunTask }: TaskDetailHeaderProps) {
  const canRun = task.status === "pending" || task.status === "failed";

  return (
    <section className="panel task-detail-hero">
      <div className="task-detail-hero-copy">
        <div className="section-eyebrow">任务详情</div>
        <h1>{task.task_name}</h1>
        <p>{task.project_name} / {task.sample_name}</p>
        <div className="task-action-row">
          <span className={`task-status-badge ${task.status}`}>{formatTaskStatus(task.status)}</span>
          {canRun ? (
            <button type="button" className="primary-button !text-slate-50" onClick={onRunTask} disabled={running}>
              {running ? "运行中..." : task.status === "failed" ? "重新运行" : "运行任务"}
            </button>
          ) : null}
          {task.has_results ? (
            <Link className="primary-button !text-slate-50" to={`/app/results/${task.id}`}>
              查看结果
            </Link>
          ) : null}
        </div>
      </div>
      <div className="task-detail-hero-side">
        <div className="task-row-meta">创建时间</div>
        <strong>{task.created_at}</strong>
        <div className="task-row-meta">最近更新时间</div>
        <strong>{task.updated_at}</strong>
      </div>
    </section>
  );
}
