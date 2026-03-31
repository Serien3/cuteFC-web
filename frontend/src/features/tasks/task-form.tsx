import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { ChangeEvent, FormEvent } from "react";

import { createTask, getProject, getProjects } from "../../lib/api";
import type { InputFile, Project, ProjectDetail, Task } from "../../lib/types";

type TaskFormProps = {
  initialProjectId?: number;
  onCreated?: (task: Task) => void;
};

type TaskFormState = {
  project_id: number;
  sample_id: number;
  task_name: string;
  platform_type: string;
  threads: number;
  input_bam: string;
  reference_fasta: string;
  target_vcf: string;
  output_vcf: string;
  work_dir: string;
  min_support: number;
  min_size: number;
  min_mapq: number;
};

const PRESET_DEFAULTS: Record<string, { min_support: number; min_size: number; min_mapq: number }> = {
  ONT: { min_support: 3, min_size: 50, min_mapq: 20 },
  HiFi: { min_support: 2, min_size: 50, min_mapq: 20 },
  CLR: { min_support: 4, min_size: 50, min_mapq: 10 }
};

function getFilePath(files: InputFile[], fileType: string, sampleId: number): string {
  return (
    files.find((file) => file.sample_id === sampleId && file.file_type === fileType)?.file_path ??
    files.find((file) => file.sample_id === null && file.file_type === fileType)?.file_path ??
    ""
  );
}

export function TaskForm({ initialProjectId, onCreated }: TaskFormProps) {
  const [mode, setMode] = useState<"quick" | "expert">("quick");
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectDetail, setProjectDetail] = useState<ProjectDetail | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingProjectDetail, setLoadingProjectDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<TaskFormState>({
    project_id: 0,
    sample_id: 0,
    task_name: "",
    platform_type: "ONT",
    threads: 8,
    input_bam: "",
    reference_fasta: "",
    target_vcf: "",
    output_vcf: "",
    work_dir: "",
    min_support: 3,
    min_size: 50,
    min_mapq: 20
  });

  useEffect(() => {
    let cancelled = false;

    void getProjects()
      .then((items) => {
        if (cancelled) {
          return;
        }

        setProjects(items);
        const firstProjectId =
          initialProjectId && items.some((project) => project.id === initialProjectId)
            ? initialProjectId
            : items[0]?.id ?? 0;
        setForm((current) => ({
          ...current,
          project_id: firstProjectId
        }));
      })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          setError(requestError instanceof Error ? requestError.message : "加载项目列表失败。");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingProjects(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [initialProjectId]);

  useEffect(() => {
    if (!form.project_id) {
      setProjectDetail(null);
      return;
    }

    let cancelled = false;
    setLoadingProjectDetail(true);

    void getProject(form.project_id)
      .then((detail) => {
        if (cancelled) {
          return;
        }

        const firstSampleId = detail.samples[0]?.id ?? 0;
        const selectedSampleId =
          detail.samples.find((sample) => sample.id === form.sample_id)?.id ?? firstSampleId;
        const selectedSample = detail.samples.find((sample) => sample.id === selectedSampleId);
        const platformType = selectedSample?.platform_type ?? form.platform_type;
        const preset = PRESET_DEFAULTS[platformType] ?? PRESET_DEFAULTS.ONT;
        setProjectDetail(detail);
        setForm((current) => ({
          ...current,
          project_id: detail.id,
          sample_id: selectedSampleId,
          platform_type: platformType,
          task_name: current.task_name || `${selectedSample?.sample_name ?? "sample"}-${platformType.toLowerCase()}`,
          input_bam: getFilePath(detail.files, "bam", selectedSampleId),
          reference_fasta: getFilePath(detail.files, "reference_fasta", selectedSampleId),
          target_vcf: getFilePath(detail.files, "target_vcf", selectedSampleId),
          output_vcf:
            current.output_vcf || `/tmp/tasks/${detail.id}-${selectedSampleId || "sample"}.vcf`,
          work_dir: current.work_dir || `/tmp/tasks/${detail.id}-${selectedSampleId || "sample"}`,
          min_support: preset.min_support,
          min_size: preset.min_size,
          min_mapq: preset.min_mapq
        }));
      })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          setError(requestError instanceof Error ? requestError.message : "加载项目详情失败。");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingProjectDetail(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [form.project_id]);

  const selectedSample = useMemo(
    () => projectDetail?.samples.find((sample) => sample.id === form.sample_id) ?? null,
    [projectDetail, form.sample_id]
  );
  const readinessItems = [
    { label: "BAM", value: form.input_bam, readyLabel: "BAM 已就绪" },
    { label: "FASTA", value: form.reference_fasta, readyLabel: "FASTA 已就绪" },
    { label: "目标 VCF", value: form.target_vcf, readyLabel: "目标 VCF 已就绪" }
  ];

  function handleFieldChange<Key extends keyof TaskFormState>(key: Key, value: TaskFormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleProjectChange(event: ChangeEvent<HTMLSelectElement>) {
    handleFieldChange("project_id", Number(event.target.value));
  }

  function handleSampleChange(sampleId: number) {
    const sample = projectDetail?.samples.find((item) => item.id === sampleId);
    const platformType = sample?.platform_type ?? "ONT";
    const preset = PRESET_DEFAULTS[platformType] ?? PRESET_DEFAULTS.ONT;
    setForm((current) => ({
      ...current,
      sample_id: sampleId,
      platform_type: platformType,
      task_name: `${sample?.sample_name ?? "sample"}-${platformType.toLowerCase()}`,
      input_bam: getFilePath(projectDetail?.files ?? [], "bam", sampleId),
      reference_fasta: getFilePath(projectDetail?.files ?? [], "reference_fasta", sampleId),
      target_vcf: getFilePath(projectDetail?.files ?? [], "target_vcf", sampleId),
      min_support: preset.min_support,
      min_size: preset.min_size,
      min_mapq: preset.min_mapq
    }));
  }

  function handlePlatformChange(event: ChangeEvent<HTMLSelectElement>) {
    const platformType = event.target.value;
    const preset = PRESET_DEFAULTS[platformType] ?? PRESET_DEFAULTS.ONT;
    setForm((current) => ({
      ...current,
      platform_type: platformType,
      min_support: preset.min_support,
      min_size: preset.min_size,
      min_mapq: preset.min_mapq
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const created = await createTask({
        project_id: form.project_id,
        sample_id: form.sample_id,
        task_name: form.task_name,
        platform_type: form.platform_type,
        threads: form.threads,
        input_bam: form.input_bam,
        reference_fasta: form.reference_fasta,
        target_vcf: form.target_vcf,
        output_vcf: form.output_vcf,
        work_dir: form.work_dir,
        params_json: {
          min_support: form.min_support,
          min_size: form.min_size,
          min_mapq: form.min_mapq
        }
      });
      setError(null);
      onCreated?.(created);
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "创建任务失败。");
    }
  }

  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1200px] mx-auto w-full"
    >
      <form onSubmit={handleSubmit} className="space-y-16 py-12">
        <div className="space-y-4">
          <input
            type="text"
            required
            name="task_name"
            value={form.task_name}
            onChange={(e) => handleFieldChange("task_name", e.target.value)}
            placeholder="Type task name..."
            className="w-full bg-transparent border-none text-5xl md:text-7xl font-sans tracking-tight text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-0 p-0"
          />
          <p className="text-xl text-slate-500 font-light tracking-wide">
            Give this pipeline task a designated identity.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-6 py-4 rounded-3xl text-sm border border-red-100">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 border-t border-slate-200/50 pt-12">
          
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="block text-sm font-semibold tracking-widest text-slate-400 uppercase">
                Project Scope
              </label>
              <select
                required
                value={form.project_id}
                onChange={handleProjectChange}
                disabled={loadingProjects}
                className="w-full bg-slate-50/50 backdrop-blur-md text-xl md:text-2xl text-slate-800 border-none rounded-3xl px-6 py-4 focus:ring-4 focus:ring-amber-500/20 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value={0} disabled>
                  Select origin project...
                </option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>

            {projectDetail && projectDetail.samples && projectDetail.samples.length > 0 && (
              <div className="space-y-3">
                <label className="block text-sm font-semibold tracking-widest text-slate-400 uppercase">
                  Biological Sample
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {projectDetail.samples.map((sample) => (
                    <label
                      key={sample.id}
                      className={`relative flex items-center justify-center p-4 rounded-3xl cursor-pointer transition-all ${
                        form.sample_id === sample.id
                          ? "bg-amber-100/50 text-amber-900 shadow-[inset_0_0_0_2px_theme(colors.amber.500)]"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-600"
                      }`}
                    >
                      <input
                        type="radio"
                        name="sample_id"
                        value={sample.id}
                        onChange={() => handleSampleChange(sample.id)}
                        className="hidden"
                      />
                      <span className="font-medium text-lg">{sample.sample_name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-sm font-semibold tracking-widest text-slate-400 uppercase">
                Sequencing Platform
              </label>
              <div className="flex flex-wrap gap-4">
                {Object.keys(PRESET_DEFAULTS).map((platform) => (
                  <label
                    key={platform}
                    onClick={() => handleFieldChange("platform_type", platform)}
                    className={`cursor-pointer px-8 py-4 rounded-full text-lg font-medium transition-all ${
                      form.platform_type === platform
                        ? "bg-slate-800 text-white shadow-lg shadow-slate-800/20"
                        : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {platform}
                  </label>
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
               <label className="block text-sm font-semibold tracking-widest text-slate-400 uppercase">
                 Computational Threads
               </label>
               <input
                  type="number"
                  min="1"
                  required
                  value={form.threads}
                  onChange={(e) => handleFieldChange("threads", Number(e.target.value))}
                  className="w-full bg-slate-50/50 backdrop-blur-md text-2xl text-slate-800 border-none rounded-3xl px-6 py-4 focus:ring-4 focus:ring-amber-500/20 outline-none transition-all"
               />
            </div>
          </div>

          <div className="space-y-8 lg:pl-12">
            
            <div>
              <h3 className="text-2xl font-semibold tracking-tight text-slate-800 mb-6">Algorithm Parameters</h3>
              <div className="space-y-6 bg-white/40 p-8 rounded-[2.5rem] border border-white/60 shadow-sm backdrop-blur-xl">
                <div className="space-y-2">
                  <label className="flex items-center justify-between text-sm font-semibold text-slate-500">
                    <span>Min Support</span>
                    <span className="text-amber-600 bg-amber-50 px-3 py-1 rounded-full">{form.min_support} READS</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={form.min_support}
                    onChange={(e) => handleFieldChange("min_support", Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center justify-between text-sm font-semibold text-slate-500">
                    <span>Min Size</span>
                    <span className="text-amber-600 bg-amber-50 px-3 py-1 rounded-full">{form.min_size} BP</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={form.min_size}
                    onChange={(e) => handleFieldChange("min_size", Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center justify-between text-sm font-semibold text-slate-500">
                    <span>Min MapQ</span>
                    <span className="text-amber-600 bg-amber-50 px-3 py-1 rounded-full">{form.min_mapq}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={form.min_mapq}
                    onChange={(e) => handleFieldChange("min_mapq", Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
               <label className="block text-sm font-semibold tracking-widest text-slate-400 uppercase">
                 Data Pointers
               </label>
               <input
                  type="text"
                  required
                  value={form.input_bam}
                  onChange={(e) => handleFieldChange("input_bam", e.target.value)}
                  placeholder="Input BAM / CRAM path..."
                  className="w-full bg-slate-50/50 text-slate-700 font-mono text-sm border-none rounded-2xl px-5 py-3 focus:ring-2 focus:ring-amber-500/20 outline-none"
               />
               <input
                  type="text"
                  required
                  value={form.reference_fasta}
                  onChange={(e) => handleFieldChange("reference_fasta", e.target.value)}
                  placeholder="Reference FASTA path..."
                  className="w-full bg-slate-50/50 text-slate-700 font-mono text-sm border-none rounded-2xl px-5 py-3 focus:ring-2 focus:ring-amber-500/20 outline-none"
               />
            </div>

          </div>
        </div>

        <div className="pt-12 flex justify-end">
          <button
            type="submit"
            className="group relative inline-flex items-center gap-4 bg-slate-900 hover:bg-slate-800 text-white px-12 py-5 rounded-full text-xl font-medium tracking-wide transition-all overflow-hidden"
          >
            Launch Pipeline
            <span className="block transform group-hover:translate-x-1 transition-transform">
              →
            </span>
            <div className="absolute inset-0 rounded-full ring-2 ring-transparent group-hover:ring-slate-900/20 ring-offset-2 transition-all"></div>
          </button>
        </div>
      </form>
    </motion.div>
  );

}
