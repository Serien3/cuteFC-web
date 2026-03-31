type SectionHeaderProps = {
  title: string;
  eyebrow?: string;
  subtitle?: string;
};

export function SectionHeader({ title, eyebrow, subtitle }: SectionHeaderProps) {
  return (
    <div className="section-header">
      {eyebrow ? <div className="section-eyebrow">{eyebrow}</div> : null}
      <h2>{title}</h2>
      {subtitle ? <p>{subtitle}</p> : null}
    </div>
  );
}

