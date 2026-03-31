import type { CohortVariant } from "../../lib/types";

type HotspotPanelProps = {
  title: string;
  items: CohortVariant[];
};

export function HotspotPanel({ title, items }: HotspotPanelProps) {
  return (
    <section className="panel">
      <h3>{title}</h3>
      {items.length > 0 ? (
        <ul className="rank-list">
          {items.map((item) => (
            <li key={item.variant_key}>
              <strong>{item.variant_key}</strong>
              <span>{item.sample_count} 个样本</span>
              <span>{Math.round(item.frequency * 100)}%</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>当前没有可显示的变异。</p>
      )}
    </section>
  );
}
