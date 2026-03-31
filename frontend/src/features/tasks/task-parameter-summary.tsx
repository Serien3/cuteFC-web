type TaskParameterSummaryProps = {
  params: {
    platform_type?: string;
    input_bam?: string;
    reference_fasta?: string;
    target_vcf?: string;
    output_vcf?: string;
    work_dir?: string;
    command?: string[];
    effective_params?: Record<string, string | number>;
  };
};

export function TaskParameterSummary({ params }: TaskParameterSummaryProps) {
  return (
    <section className="panel">
      <h3>参数摘要</h3>
      <div className="task-parameter-grid">
        <p>平台：{params.platform_type ?? "-"}</p>
        <p>输入 BAM：{params.input_bam ?? "-"}</p>
        <p>参考 FASTA：{params.reference_fasta ?? "-"}</p>
        <p>目标 VCF：{params.target_vcf ?? "-"}</p>
        <p>输出 VCF：{params.output_vcf ?? "-"}</p>
        <p>工作目录：{params.work_dir ?? "-"}</p>
      </div>
      <div className="task-command-block">
        <div className="task-row-meta">专家参数</div>
        <pre className="log-panel">{JSON.stringify(params.effective_params ?? {}, null, 2)}</pre>
      </div>
      <div className="task-command-block">
        <div className="task-row-meta">命令摘要</div>
        <pre className="log-panel">{params.command?.join(" ") ?? "-"}</pre>
      </div>
    </section>
  );
}
