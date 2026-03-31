import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { ResultBrowserFilters } from "../features/results/result-browser-filters";
import { ResultBrowserTable } from "../features/results/result-browser-table";
import { ResultDetailPanel } from "../features/results/result-detail-panel";
import { ResultDistributionPanels } from "../features/results/result-distribution-panels";
import { ResultExportMenu } from "../features/results/result-export-menu";
import { ResultHero } from "../features/results/result-hero";
import { ResultSummaryStrip } from "../features/results/result-summary-strip";
import {
  exportResultVariants,
  getResultSummary,
  getResultVariantDetail,
  getResultVariants,
  queryResultVariants
} from "../lib/api";
import type { ResultVariant, ResultVariantDetail, ResultVariantQuery } from "../lib/types";
import { useAsyncData } from "../lib/use-async-data";

const DEFAULT_QUERY: ResultVariantQuery = {
  sort_by: "pos",
  sort_order: "asc",
  limit: 25,
  offset: 0
};

function getActiveFilterCount(query: ResultVariantQuery) {
  return Object.entries(query).filter(([key, value]) => {
    if (value === undefined || value === "") {
      return false;
    }
    return DEFAULT_QUERY[key as keyof ResultVariantQuery] !== value;
  }).length;
}

export function ResultPage() {
  const { taskId } = useParams();
  const resolvedTaskId = Number(taskId);
  const invalidTaskId = !taskId || Number.isNaN(resolvedTaskId);
  const { data, error, loading } = useAsyncData(
    async () => {
      const [summary, variants] = await Promise.all([
        getResultSummary(resolvedTaskId),
        getResultVariants(resolvedTaskId)
      ]);

      return { summary, variants };
    },
    [resolvedTaskId],
    !invalidTaskId
  );
  const [variants, setVariants] = useState<ResultVariant[]>([]);
  const [activeQuery, setActiveQuery] = useState<ResultVariantQuery>(DEFAULT_QUERY);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [filtering, setFiltering] = useState(false);
  const [exportBusy, setExportBusy] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [selectedVariantDetail, setSelectedVariantDetail] = useState<ResultVariantDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    setVariants(data?.variants ?? []);
    setActiveQuery(DEFAULT_QUERY);
    setFilterError(null);
    setExportError(null);
    setSelectedVariantDetail(null);
    setDetailError(null);
    setDetailLoading(false);
  }, [data]);

  async function handleApplyFilters(query: ResultVariantQuery) {
    setFiltering(true);
    setFilterError(null);
    try {
      const nextQuery = { ...DEFAULT_QUERY, ...query, offset: 0 };
      setActiveQuery(nextQuery);
      setVariants(await queryResultVariants(resolvedTaskId, nextQuery));
    } catch (requestError: unknown) {
      setFilterError(requestError instanceof Error ? requestError.message : "结果筛选失败。");
    } finally {
      setFiltering(false);
    }
  }

  async function handleResetFilters() {
    setFiltering(true);
    setFilterError(null);
    try {
      setActiveQuery(DEFAULT_QUERY);
      setVariants(await queryResultVariants(resolvedTaskId, DEFAULT_QUERY));
    } catch (requestError: unknown) {
      setFilterError(requestError instanceof Error ? requestError.message : "结果重置失败。");
    } finally {
      setFiltering(false);
    }
  }

  async function handleSelectVariant(variantId: number) {
    setDetailLoading(true);
    setDetailError(null);
    try {
      setSelectedVariantDetail(await getResultVariantDetail(variantId));
    } catch (requestError: unknown) {
      setSelectedVariantDetail(null);
      setDetailError(requestError instanceof Error ? requestError.message : "详情加载失败。");
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleSortChange(sortBy: "pos" | "end" | "sv_len" | "support_reads") {
    const nextQuery = {
      ...activeQuery,
      sort_by: sortBy,
      sort_order:
        activeQuery.sort_by === sortBy && activeQuery.sort_order === "asc" ? "desc" : "asc",
      offset: 0
    } satisfies ResultVariantQuery;
    await handleApplyFilters(nextQuery);
  }

  async function handlePageChange(direction: "next" | "previous") {
    const limit = activeQuery.limit ?? DEFAULT_QUERY.limit ?? 25;
    const currentOffset = activeQuery.offset ?? 0;
    const nextOffset =
      direction === "next" ? currentOffset + limit : Math.max(0, currentOffset - limit);
    const nextQuery = { ...activeQuery, offset: nextOffset };
    await handleApplyFilters(nextQuery);
  }

  async function handleExport(format: "csv" | "tsv" | "vcf") {
    setExportBusy(true);
    setExportError(null);
    try {
      const content = await exportResultVariants(resolvedTaskId, activeQuery, format);
      const blob = new Blob([content], { type: format === "vcf" ? "text/plain" : "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `task-${resolvedTaskId}-results.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (requestError: unknown) {
      setExportError(requestError instanceof Error ? requestError.message : "结果导出失败。");
    } finally {
      setExportBusy(false);
    }
  }

  if (invalidTaskId) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>结果查看</h1>
          <p>路由中的任务 ID 无效。</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>结果查看</h1>
          <p>加载结果数据失败：{error}</p>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>结果查看</h1>
          <p>正在加载任务级结果摘要与变异列表。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page result-browser-page">
      <ResultHero
        taskId={resolvedTaskId}
        totalSv={data.summary.total_sv}
        activeFilterCount={getActiveFilterCount(activeQuery)}
      />
      <ResultSummaryStrip summary={data.summary} />
      <div className="result-summary-layout">
        <ResultDistributionPanels summary={data.summary} />
        <ResultExportMenu busy={exportBusy} onExport={handleExport} />
      </div>
      {exportError ? (
        <section className="bg-white/40 mb-12 backdrop-blur-2xl rounded-[3rem] p-8 border border-white/40 shadow-[0_8px_32px_rgba(251,191,36,0.05)] text-slate-800 relative mt-12 overflow-hidden">
      {/* Soft noise texture */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay rounded-[3rem]"
          style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' 
        }}
      />
          <p>导出失败：{exportError}</p>
        </section>
      ) : null}
      <div className="page-header">
        <h1>结果浏览</h1>
        <p>继续向下筛选、排序并查看单条结构变异的上下文细节。</p>
      </div>
      <ResultBrowserFilters
        busy={filtering}
        query={activeQuery}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
      {filterError ? (
        <section className="bg-white/40 mb-12 backdrop-blur-2xl rounded-[3rem] p-8 border border-white/40 shadow-[0_8px_32px_rgba(251,191,36,0.05)] text-slate-800 relative mt-12 overflow-hidden">
      {/* Soft noise texture */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay rounded-[3rem]"
          style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' 
        }}
      />
          <p>筛选请求失败：{filterError}</p>
        </section>
      ) : null}
      <ResultBrowserTable
        busy={filtering}
        variants={variants}
        query={activeQuery}
        selectedVariantId={selectedVariantDetail?.id ?? null}
        onSelectVariant={handleSelectVariant}
        onSortChange={handleSortChange}
        onPreviousPage={() => void handlePageChange("previous")}
        onNextPage={() => void handlePageChange("next")}
      />
      <ResultDetailPanel
        detail={selectedVariantDetail}
        loading={detailLoading}
        error={detailError}
        onClose={() => {
          setSelectedVariantDetail(null);
          setDetailError(null);
          setDetailLoading(false);
        }}
      />
    </div>
  );
}
