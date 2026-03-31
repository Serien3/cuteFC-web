import { ReactNode } from "react";

type ChartPanelProps = {
  title: string;
  children: ReactNode;
};

export function ChartPanel({ title, children }: ChartPanelProps) {
  return (
    <section className="chart-panel">
      <h3>{title}</h3>
      <div>{children}</div>
    </section>
  );
}

