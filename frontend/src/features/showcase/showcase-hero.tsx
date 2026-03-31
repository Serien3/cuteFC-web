type ShowcaseHeroProps = {
  title: string;
  subtitle: string;
};

export function ShowcaseHero({ title, subtitle }: ShowcaseHeroProps) {
  return (
    <section className="showcase-hero">
      <div className="section-eyebrow">竞赛展示专页</div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </section>
  );
}
