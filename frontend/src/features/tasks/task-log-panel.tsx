type TaskLogPanelProps = {
  title?: string;
  content?: string;
  path?: string;
};

export function TaskLogPanel({
  title = "执行日志与命令",
  content = "暂无日志内容。",
  path
}: TaskLogPanelProps) {
  return (
    <section className="panel">
      <h3>{title}</h3>
      {path ? <p>{path}</p> : null}
      <pre className="log-panel">{content}</pre>
    </section>
  );
}
