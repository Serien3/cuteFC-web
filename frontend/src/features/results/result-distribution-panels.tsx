import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import type { ResultSummary } from "../../lib/types";

type ResultDistributionPanelsProps = {
  summary: ResultSummary;
};

// Colors mapping matching the SV Types in the table
const SV_COLORS: Record<string, string> = {
  DEL: "#ef4444",
  INS: "#22c55e",
  DUP: "#3b82f6",
  INV: "#a855f7",
  BND: "#f97316",
  TRA: "#f97316",
};
const DEFAULT_COLOR = "#94a3b8";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-3 border border-slate-200 rounded-xl shadow-lg">
        <p className="text-slate-700 font-bold mb-1">{`\${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-\${index}`} className="text-sm font-medium" style={{ color: entry.color || entry.fill }}>
            {entry.name === 'value' ? 'Count' : entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function ResultDistributionPanels({ summary }: ResultDistributionPanelsProps) {
  // Data for rendering
  const svTypeData = useMemo(() => {
    return Object.entries(summary.sv_type_counts || {}).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [summary.sv_type_counts]);

  const chromData = useMemo(() => {
    const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
    return Object.entries(summary.chromosome_counts || {})
      .sort(([a], [b]) => collator.compare(a, b))
      .map(([name, value]) => ({ name, value }));
  }, [summary.chromosome_counts]);

  const lengthData = useMemo(() => {
    return Object.entries(summary.length_buckets || {})
      .map(([name, value]) => ({ name, value }));
  }, [summary.length_buckets]);

  const supportData = useMemo(() => {
    return Object.entries(summary.support_read_buckets || {})
      .map(([name, value]) => ({ name, value }));
  }, [summary.support_read_buckets]);

  // Make sure we have valid data before rendering
  if (!summary) return null;

  return (
    <div className="flex flex-col gap-6 mb-8">
      {/* Row 1: SV Type & Chromosome */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SV Type */}
        <div className="bg-white/40 backdrop-blur-2xl rounded-[2rem] p-6 border border-white/60 shadow-xl flex flex-col col-span-1">
          <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-4">SV Type Distribution</h3>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={svTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {svTypeData.map((entry, index) => (
                    <Cell key={`cell-\${index}`} fill={SV_COLORS[entry.name] || DEFAULT_COLOR} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {svTypeData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SV_COLORS[entry.name] || DEFAULT_COLOR }} />
                {entry.name}
              </div>
            ))}
          </div>
        </div>

        {/* Chromosome */}
        <div className="bg-white/40 backdrop-blur-2xl rounded-[2rem] p-6 border border-white/60 shadow-xl flex flex-col lg:col-span-2">
          <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-4">Chromosome Distribution</h3>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chromData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(203, 213, 225, 0.4)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <RechartsTooltip cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Length & Support Reads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Length Distribution */}
        <div className="bg-white/40 backdrop-blur-2xl rounded-[2rem] p-6 border border-white/60 shadow-xl flex flex-col min-h-[250px]">
          <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-4">Length Distribution</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lengthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLength" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(203, 213, 225, 0.4)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorLength)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Support Reads */}
        <div className="bg-white/40 backdrop-blur-2xl rounded-[2rem] p-6 border border-white/60 shadow-xl flex flex-col min-h-[250px]">
          <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-4">Support Reads</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supportData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(203, 213, 225, 0.4)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <RechartsTooltip cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#ec4899" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
