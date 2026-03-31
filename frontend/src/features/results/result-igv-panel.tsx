import { useEffect, useRef, useState } from "react";
import igv from "igv";

import { API_BASE } from "../../lib/api";
import type { ResultVariantDetail } from "../../lib/types";

type ResultIgvPanelProps = {
  detail: ResultVariantDetail;
};

export function ResultIgvPanel({ detail }: ResultIgvPanelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const assetUrl = (assetKind: string) => `${API_BASE}/results/variants/${detail.id}/assets/${assetKind}`;

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    if (!detail.reference_index_available || !detail.output_vcf_available) {
      setInitError(
        detail.igv_unavailable_reasons[0] ?? "当前结果缺少 IGV 所需文件或索引，无法初始化浏览器。"
      );
      return;
    }

    let browser: Awaited<ReturnType<typeof igv.createBrowser>> | null = null;
    let disposed = false;
    const tracks = [];
    setInitError(null);

    if (detail.input_bam && detail.bam_index_available) {
      tracks.push({
        type: "alignment",
        format: "bam",
        name: "Input BAM",
        url: assetUrl("input_bam"),
        indexURL: assetUrl("input_bam_index")
      });
    }

    if (detail.output_vcf_available) {
      tracks.push({
        type: "variant",
        format: "vcf",
        name: "Result VCF",
        url: assetUrl("output_vcf")
      });
    }

    if (detail.target_vcf_available) {
      tracks.push({
        type: "variant",
        format: "vcf",
        name: "Target VCF",
        url: assetUrl("target_vcf")
      });
    }

    void igv
      .createBrowser(containerRef.current, {
        locus: detail.locus,
        reference: {
          fastaURL: assetUrl("reference_fasta"),
          indexURL: assetUrl("reference_index")
        },
        tracks
      })
      .then((instance) => {
        if (!disposed) {
          browser = instance;
        }
      })
      .catch((error: unknown) => {
        setInitError(error instanceof Error ? error.message : "IGV 初始化失败。");
      });

    return () => {
      disposed = true;
      if (browser) {
        igv.removeBrowser(browser);
      }
    };
  }, [
    detail.bam_index_available,
    detail.id,
    detail.igv_unavailable_reasons,
    detail.bam_index,
    detail.input_bam,
    detail.locus,
    detail.output_vcf_available,
    detail.reference_index_available,
    detail.reference_fasta,
    detail.reference_index,
    detail.target_vcf_available,
    detail.target_vcf
  ]);

  return (
    <section className="igv-panel">
      <div className="section-eyebrow">IGV</div>
      <h3>位点浏览</h3>
      <p>{detail.locus}</p>
      {detail.igv_unavailable_reasons.length > 0 ? (
        <div className="igv-warning-list">
          {detail.igv_unavailable_reasons.map((reason) => (
            <p key={reason}>{reason}</p>
          ))}
        </div>
      ) : null}
      {initError ? <p>IGV 初始化失败：{initError}</p> : null}
      <div className="igv-host" data-testid="igv-host" ref={containerRef} />
    </section>
  );
}
