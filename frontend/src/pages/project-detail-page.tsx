import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";

import { FileRegistrationForm } from "../features/projects/file-registration-form";
import { ProjectTaskPanel } from "../features/tasks/project-task-panel";
import { SampleCreateForm } from "../features/projects/sample-create-form";
import { SampleTable } from "../features/projects/sample-table";
import { createFile, createSample, getProject } from "../lib/api";
import type { FileCreate, ProjectDetail, SampleCreate } from "../lib/types";

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sampleBusy, setSampleBusy] = useState(false);
  const [fileBusy, setFileBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!projectId) {
      setError("无效的项目 ID。");
      setLoading(false);
      return;
    }

    void getProject(Number(projectId))
      .then((data) => {
        if (!cancelled) {
          setProject(data);
        }
      })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          setError(requestError instanceof Error ? requestError.message : "加载项目失败。");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  async function handleCreateSample(value: SampleCreate) {
    if (!project) {
      return;
    }

    setSampleBusy(true);
    setActionError(null);
    setActionMessage(null);
    try {
      const created = await createSample(project.id, value);
      setProject((current) =>
        current
          ? {
              ...current,
              samples: [...current.samples, created],
            }
          : current
      );
      setActionMessage(`Sample ${created.sample_name} has been added.`);
    } catch (requestError: unknown) {
      setActionError(requestError instanceof Error ? requestError.message : "创建样本失败。");
    } finally {
      setSampleBusy(false);
    }
  }

  async function handleRegisterFile(value: FileCreate) {
    if (!project) {
      return;
    }

    setFileBusy(true);
    setActionError(null);
    setActionMessage(null);
    try {
      const created = await createFile(value);
      setProject((current) =>
        current
          ? {
              ...current,
              files: [created, ...current.files],
            }
          : current
      );
      setActionMessage(`Registered ${created.file_type} for the project.`);
    } catch (requestError: unknown) {
      setActionError(requestError instanceof Error ? requestError.message : "注册文件失败。");
    } finally {
      setFileBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen py-32 px-8 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen py-32 px-8 flex items-center justify-center">
        <p className="text-2xl text-red-500">{error || "Project not found."}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen py-32 px-8"
    >
      <div className="max-w-[1400px] mx-auto w-full">
        
        <header className="mb-20">
          <Link
            to="/app/platform"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest text-sm font-semibold mb-8"
          >
            <span>←</span> Return to Projects
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-6xl md:text-8xl font-sans tracking-tighter text-slate-900 mb-8 leading-tight">
              {project.name}
            </h1>
            <p className="text-2xl text-slate-500 max-w-3xl font-light tracking-wide leading-relaxed">
              {project.description || "No directive provided for this workspace."}
            </p>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-16">
          <div className="xl:col-span-2 space-y-16">
            <section>
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-3xl font-semibold tracking-tight text-slate-800">Biological Cohort</h2>
                 <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-sm font-semibold tracking-widest uppercase">
                   {project.samples.length} Samples
                 </span>
              </div>
              <div className="bg-white/40 backdrop-blur-2xl rounded-[3rem] p-8 border border-white/60 shadow-xl">
                 <SampleTable samples={project.samples} files={project.files} />
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-semibold tracking-tight text-slate-800">Input Registration</h2>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="bg-white/40 backdrop-blur-2xl rounded-[3rem] p-8 border border-white/60 shadow-xl">
                  <div className="mb-8">
                    <h3 className="text-2xl font-semibold tracking-tight text-slate-800">Add Sample</h3>
                    <p className="text-slate-500 mt-2 leading-relaxed">
                      Register a sample before launching a new cuteFC analysis.
                    </p>
                  </div>
                  <SampleCreateForm busy={sampleBusy} onSubmit={handleCreateSample} />
                </div>
                <div className="bg-white/40 backdrop-blur-2xl rounded-[3rem] p-8 border border-white/60 shadow-xl">
                  <div className="mb-8">
                    <h3 className="text-2xl font-semibold tracking-tight text-slate-800">Register Files</h3>
                    <p className="text-slate-500 mt-2 leading-relaxed">
                      Attach BAM, reference FASTA, and target VCF paths for task creation.
                    </p>
                  </div>
                  <FileRegistrationForm busy={fileBusy} project={project} onSubmit={handleRegisterFile} />
                </div>
              </div>
              {actionError ? (
                <div className="mt-6 bg-red-50 text-red-600 px-6 py-4 rounded-3xl text-sm border border-red-100">
                  {actionError}
                </div>
              ) : null}
              {actionMessage ? (
                <div className="mt-6 bg-emerald-50 text-emerald-700 px-6 py-4 rounded-3xl text-sm border border-emerald-100">
                  {actionMessage}
                </div>
              ) : null}
            </section>
          </div>

          <div className="space-y-16">
            <section>
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-3xl font-semibold tracking-tight text-slate-800">Pipelines</h2>
              </div>
              <div className="bg-white/40 backdrop-blur-2xl rounded-[3rem] p-8 border border-white/60 shadow-xl">
                 <ProjectTaskPanel project={project} />
              </div>
            </section>
            
            <section>
               <div className="bg-gradient-to-br from-amber-500 to-amber-700 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                 <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-4">Initialize New Analysis</h3>
                    <p className="text-amber-100 mb-8 leading-relaxed">
                      Launch a new structural variant detection sequence using cuteFC for the configured samples.
                    </p>
                    <Link
                      to={`/app/pipeline/new?projectId=${project.id}`}
                      className="inline-flex items-center gap-3 bg-white text-amber-900 font-bold hover:text-amber-800 px-8 py-4 rounded-full font-semibold tracking-wide hover:scale-105 transition-transform"
                    >
                      Configure Pipeline →
                    </Link>
                 </div>
                 <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-amber-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse-slow"></div>
               </div>
            </section>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
