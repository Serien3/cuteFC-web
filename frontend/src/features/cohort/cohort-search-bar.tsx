import { useState } from "react";

import type { CohortSearchQuery } from "../../lib/types";

type CohortSearchBarProps = {
  onSearch: (query: CohortSearchQuery) => void;
  busy?: boolean;
};

export function CohortSearchBar({ onSearch, busy = false }: CohortSearchBarProps) {
  const [query, setQuery] = useState<CohortSearchQuery>({});

  function update<K extends keyof CohortSearchQuery>(key: K, value: CohortSearchQuery[K]) {
    setQuery((current) => ({ ...current, [key]: value }));
  }

  function handleSearch() {
    onSearch(
      Object.fromEntries(
        Object.entries(query).filter(([, value]) => value !== "" && value !== undefined)
      ) as CohortSearchQuery
    );
  }

  return (
    <div className="search-bar">
      <input
        aria-label="基因名称"
        type="text"
        placeholder="基因名称"
        value={query.gene_name ?? ""}
        onChange={(event) => update("gene_name", event.target.value)}
      />
      <input
        aria-label="样本名称"
        type="text"
        placeholder="样本名称"
        value={query.sample_name ?? ""}
        onChange={(event) => update("sample_name", event.target.value)}
      />
      <input
        aria-label="染色体区间"
        type="text"
        placeholder="chr1:100-500"
        value={
          query.chrom && query.start !== undefined && query.end !== undefined
            ? `${query.chrom}:${query.start}-${query.end}`
            : ""
        }
        onChange={(event) => {
          const value = event.target.value.trim();
          const regionMatch = value.match(/^(chr[\w]+):(\d+)-(\d+)$/i);
          if (!value) {
            update("chrom", undefined);
            update("start", undefined);
            update("end", undefined);
            return;
          }
          if (regionMatch) {
            update("chrom", regionMatch[1]);
            update("start", Number(regionMatch[2]));
            update("end", Number(regionMatch[3]));
          }
        }}
      />
      <select
        aria-label="SV 类型"
        value={query.sv_type ?? ""}
        onChange={(event) => update("sv_type", event.target.value)}
      >
        <option value="">全部类型</option>
        <option value="DEL">DEL</option>
        <option value="INS">INS</option>
        <option value="DUP">DUP</option>
        <option value="INV">INV</option>
        <option value="BND">BND</option>
        <option value="TRA">TRA</option>
      </select>
      <input
        aria-label="最小频率"
        type="number"
        step="0.01"
        min="0"
        max="1"
        placeholder="最小频率"
        value={query.frequency_min ?? ""}
        onChange={(event) =>
          update("frequency_min", event.target.value ? Number(event.target.value) : undefined)
        }
      />
      <input
        aria-label="最大频率"
        type="number"
        step="0.01"
        min="0"
        max="1"
        placeholder="最大频率"
        value={query.frequency_max ?? ""}
        onChange={(event) =>
          update("frequency_max", event.target.value ? Number(event.target.value) : undefined)
        }
      />
      <button
        type="button"
        className="primary-button"
        disabled={busy}
        onClick={handleSearch}
      >
        {busy ? "搜索中..." : "搜索图谱"}
      </button>
    </div>
  );
}
