import type { CohortVariant } from "../../lib/types";

type HeatmapPanelProps = {
  items: CohortVariant[];
};

export function HeatmapPanel({ items }: HeatmapPanelProps) {
  return (
    <section className="panel heatmap-panel">
      <h3>样本-变异热图</h3>
      {items.length > 0 ? (
        <div className="heatmap-grid">
          {items.slice(0, 12).map((item) => (
            <div
              key={item.variant_key}
              className="heat-cell"
              style={{ opacity: Math.max(item.frequency, 0.15) }}
              title={item.variant_key}
            >
              {item.sv_type}
            </div>
          ))}
        </div>
      ) : (
        <p>当前没有可用于热图渲染的变异。</p>
      )}
    </section>
  );
}
