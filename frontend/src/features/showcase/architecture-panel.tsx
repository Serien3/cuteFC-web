type ArchitecturePanelProps = {
  title: string;
  items: string[];
};

export function ArchitecturePanel({ title, items }: ArchitecturePanelProps) {
  return (
    <section className="panel">
      <h3>{title}</h3>
      <ul className="stack-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

