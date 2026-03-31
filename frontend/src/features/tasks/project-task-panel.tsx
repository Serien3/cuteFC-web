import { Link } from "react-router-dom";

import type { ProjectDetail } from "../../lib/types";

type ProjectTaskPanelProps = {
  project: ProjectDetail;
};

export function ProjectTaskPanel({ project }: ProjectTaskPanelProps) {
  const taskSummary = project.task_summary ?? {
    total: 0,
    pending: 0,
    running: 0,
    succeeded: 0,
    failed: 0,
    attention_count: 0
  };
  const recentTasks = project.recent_tasks ?? [];

  return (
    <section className="panel">
      <div className="section-eyebrow">项目任务</div>
      <h3>把项目直接推进到分析执行</h3>
      <div className="task-summary-strip">
        <div className="stat-card">
          <div className="stat-label">任务总数</div>
          <div className="stat-value">{taskSummary.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">待处理</div>
          <div className="stat-value">{taskSummary.attention_count}</div>
        </div>
        <div className="stat-card accent">
          <div className="stat-label">已完成</div>
          <div className="stat-value">{taskSummary.succeeded}</div>
        </div>
      </div>
      <div className="task-dashboard-actions">
        <Link className="primary-button !text-slate-50" to={`/app/pipeline/new?projectId=${project.id}`}>
          创建任务
        </Link>
        <Link className="ghost-button" to={`/app/pipeline?projectId=${project.id}`}>
          查看任务中心
        </Link>
      </div>
      {recentTasks.length ? (
        <div className="stack-list">
          {recentTasks.map((task) => (
            <div key={task.id} className="task-dashboard-row">
              <div className="task-row-title">
                <strong>{task.task_name}</strong>
                <span className="task-row-meta">{task.sample_name}</span>
              </div>
              <div className="task-action-row">
                <Link className="ghost-button" to={`/app/pipeline/${task.id}`}>
                  查看详情
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>当前项目还没有任务，建议从这个页面直接创建第一次分析。</p>
      )}
    </section>
  );
}
