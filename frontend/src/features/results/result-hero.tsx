import { Link } from "react-router-dom";

type ResultHeroProps = {
  taskId: number;
  totalSv: number;
  activeFilterCount: number;
};

export function ResultHero({ taskId, totalSv, activeFilterCount }: ResultHeroProps) {
  return (
    <section className="result-hero panel">
      <div className="result-hero-copy">
        <div className="section-eyebrow">Research Browser</div>
        <h1>任务 {taskId} 结果浏览器</h1>
        <p>把任务级结构变异结果整理成紧凑摘要、分布概览和可继续钻取的研究工作台。</p>
      </div>
      <div className="result-hero-meta">
        <div className="result-hero-kpi">
          <span>当前结果量</span>
          <strong>{totalSv}</strong>
        </div>
        <div className="result-hero-kpi">
          <span>活跃筛选</span>
          <strong>{activeFilterCount}</strong>
        </div>
        <div className="task-action-row">
          <Link className="ghost-button" to={`/app/pipeline/${taskId}`}>
            返回任务详情
          </Link>
        </div>
      </div>
    </section>
  );
}
