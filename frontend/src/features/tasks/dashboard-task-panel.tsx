import { Link } from "react-router-dom";

import type { DashboardPayload } from "../../lib/types";

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

type DashboardTaskPanelProps = {
  payload: DashboardPayload;
};

export function DashboardTaskPanel({ payload }: DashboardTaskPanelProps) {
  return (
    <section className="bg-white/40 mb-12 backdrop-blur-2xl rounded-[3rem] p-8 border border-white/40 shadow-[0_8px_32px_rgba(251,191,36,0.05)] text-slate-800 relative overflow-hidden">
      {/* Soft noise texture */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' 
        }}
      />
      <div className="section-eyebrow">任务枢纽</div>
      <h3>从驾驶舱直接进入任务中心</h3>
      <div className="task-summary-strip">
        <div className="stat-card">
          <div className="stat-label">待关注任务</div>
          <div className="stat-value">{payload.task_summary.attention_count}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">运行中</div>
          <div className="stat-value">{payload.task_summary.running}</div>
        </div>
        <div className="stat-card accent">
          <div className="stat-label">失败任务</div>
          <div className="stat-value">{payload.task_summary.failed}</div>
        </div>
      </div>
      <div className="task-dashboard-actions">
        <Link className="primary-button" to="/app/pipeline">
          进入任务中心
        </Link>
        <Link className="ghost-button" to="/app/pipeline/new">
          新建任务
        </Link>
      </div>
      <div className="stack-list">
        {payload.recent_tasks.map((task) => (
          <div key={task.id} className="task-dashboard-row">
            <div className="task-row-title">
              <strong>{task.task_name}</strong>
              <span className="task-row-meta">
                {task.project_name} / {task.sample_name}
              </span>
            </div>
            <span className={`task-status-badge ${task.status}`}>{formatTaskStatus(task.status)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
