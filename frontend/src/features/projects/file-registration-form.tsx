import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import type { FileCreate, ProjectDetail } from "../../lib/types";

type FileRegistrationFormProps = {
  busy?: boolean;
  project: ProjectDetail;
  onSubmit: (value: FileCreate) => Promise<void> | void;
};

const FILE_TYPES = [
  { value: "bam", label: "BAM / CRAM" },
  { value: "reference_fasta", label: "Reference FASTA" },
  { value: "target_vcf", label: "Target VCF" },
];

export function FileRegistrationForm({
  busy = false,
  project,
  onSubmit,
}: FileRegistrationFormProps) {
  const [sampleId, setSampleId] = useState<string>("shared");
  const [fileType, setFileType] = useState("bam");
  const [filePath, setFilePath] = useState("");

  const selectedLabel = useMemo(() => {
    if (sampleId === "shared") {
      return "shared";
    }
    const sample = project.samples.find((item) => String(item.id) === sampleId);
    return sample?.sample_name ?? "sample";
  }, [project.samples, sampleId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      project_id: project.id,
      sample_id: sampleId === "shared" ? null : Number(sampleId),
      file_type: fileType,
      file_path: filePath.trim(),
      status: "registered",
    });
    setFilePath("");
  }

  function handleSampleChange(event: ChangeEvent<HTMLSelectElement>) {
    setSampleId(event.target.value);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <label className="block text-sm font-semibold tracking-widest text-slate-400 uppercase">
          Attach To
        </label>
        <select
          aria-label="Attach To"
          value={sampleId}
          onChange={handleSampleChange}
          className="w-full bg-slate-50/50 backdrop-blur-md text-slate-800 border-none rounded-3xl px-6 py-4 focus:ring-4 focus:ring-amber-500/20 outline-none transition-all appearance-none cursor-pointer"
        >
          <option value="shared">Shared Project Resource</option>
          {project.samples.map((sample) => (
            <option key={sample.id} value={sample.id}>
              {sample.sample_name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-semibold tracking-widest text-slate-400 uppercase">
          File Type
        </label>
        <div className="flex flex-wrap gap-3">
          {FILE_TYPES.map((option) => (
            <label
              key={option.value}
              className={`cursor-pointer px-4 py-3 rounded-full text-sm font-medium transition-all ${
                fileType === option.value
                  ? "bg-amber-100/50 text-amber-900 shadow-[inset_0_0_0_2px_theme(colors.amber.500)]"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              }`}
            >
              <input
                type="radio"
                name="file_type"
                value={option.value}
                checked={fileType === option.value}
                onChange={() => setFileType(option.value)}
                className="hidden"
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-semibold tracking-widest text-slate-400 uppercase">
          Absolute File Path
        </label>
        <input
          type="text"
          required
          aria-label="Absolute File Path"
          value={filePath}
          onChange={(event) => setFilePath(event.target.value)}
          placeholder={`/data/demo/${selectedLabel}/${fileType}`}
          className="w-full bg-slate-50/50 text-slate-700 font-mono text-sm border-none rounded-2xl px-5 py-3 focus:ring-2 focus:ring-amber-500/20 outline-none"
        />
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={busy || !filePath.trim() || project.samples.length === 0}
          className="group relative inline-flex items-center gap-4 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-full text-base font-medium tracking-wide transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? "Registering..." : "Register File"}
          <span className="block transform group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>
    </form>
  );
}
