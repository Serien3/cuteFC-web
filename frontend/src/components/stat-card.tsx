type StatCardProps = {
  label: string;
  value: string | number;
  tone?: "default" | "accent";
};

export function StatCard({ label, value, tone = "default" }: StatCardProps) {
  return (
    <div className={`stat-card ${tone}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

