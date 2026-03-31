import { useState } from "react";
import type { FormEvent } from "react";

import type { SampleCreate } from "../../lib/types";

type SampleCreateFormProps = {
  busy?: boolean;
  onSubmit: (value: SampleCreate) => Promise<void> | void;
};

const PLATFORM_OPTIONS = ["ONT", "HiFi", "CLR"];

export function SampleCreateForm({ busy = false, onSubmit }: SampleCreateFormProps) {
  const [sampleName, setSampleName] = useState("");
  const [platformType, setPlatformType] = useState("ONT");
  const [remark, setRemark] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      sample_name: sampleName.trim(),
      platform_type: platformType,
      remark: remark.trim(),
    });
    setSampleName("");
    setPlatformType("ONT");
    setRemark("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <label className="block text-sm font-semibold tracking-widest text-slate-400 uppercase">
          Sample Name
        </label>
        <input
          type="text"
          required
          aria-label="Sample Name"
          value={sampleName}
          onChange={(event) => setSampleName(event.target.value)}
          placeholder="e.g. HG003-ONT"
          className="w-full bg-slate-50/50 backdrop-blur-md text-slate-800 border-none rounded-3xl px-6 py-4 focus:ring-4 focus:ring-amber-500/20 outline-none transition-all"
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-semibold tracking-widest text-slate-400 uppercase">
          Sequencing Platform
        </label>
        <div className="flex flex-wrap gap-3">
          {PLATFORM_OPTIONS.map((platform) => (
            <label
              key={platform}
              className={`cursor-pointer px-6 py-3 rounded-full text-sm font-medium transition-all ${
                platformType === platform
                  ? "bg-slate-800 text-white shadow-lg shadow-slate-800/20"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              }`}
            >
              <input
                type="radio"
                name="platform_type"
                value={platform}
                checked={platformType === platform}
                onChange={() => setPlatformType(platform)}
                className="hidden"
              />
              {platform}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-semibold tracking-widest text-slate-400 uppercase">
          Remark
        </label>
        <textarea
          rows={3}
          aria-label="Remark"
          value={remark}
          onChange={(event) => setRemark(event.target.value)}
          placeholder="Optional sample context for the demo run."
          className="w-full bg-white/40 backdrop-blur-xl border border-white/60 shadow-sm rounded-3xl p-6 text-slate-700 leading-relaxed focus:ring-4 focus:ring-amber-500/20 outline-none resize-none transition-all"
        />
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={busy || !sampleName.trim()}
          className="group relative inline-flex items-center gap-4 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-full text-base font-medium tracking-wide transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? "Creating..." : "Create Sample"}
          <span className="block transform group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>
    </form>
  );
}
