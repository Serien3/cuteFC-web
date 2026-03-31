import { PageHero } from '../components/page-hero';
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, ArrowRight, Dna, Database } from "lucide-react";

import { ProjectForm } from "../features/projects/project-form";
import { createProject, getProjects } from "../lib/api";
import type { Project } from "../lib/types";
import { useAsyncData } from "../lib/use-async-data";

export function PlatformPage() {
  const { data, loading, error } = useAsyncData(getProjects, []);
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const projectItems = projects ?? data ?? [];

  async function handleCreateProject(value: { name: string; description: string }) {
    try {
      const created = await createProject(value);
      setProjects((current) => [created, ...(current ?? data ?? [])]);
      setFormError(null);
      setIsCreating(false);
    } catch (submitError: unknown) {
      setFormError(submitError instanceof Error ? submitError.message : "Failed to create project.");
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <>
      <PageHero
        eyebrow="Platform"
        title="Project Management"
        description="Organize cohort studies, sample grouping, and registered genomic data securely."
        bgImage="https://www.insitro.com/wp-content/uploads/2023/11/Insitro-293-scaled.jpg"
      />
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="page !max-w-[1600px] !px-4">

        {/* Grid of Projects */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

          {/* Create Card / Action */}
          <div className="flex flex-col h-full">
            {!isCreating ? (
              <button
                onClick={() => setIsCreating(true)}
                className="flex-1 min-h-[360px] bg-slate-50 hover:bg-slate-900 rounded-[2.5rem] border border-black/5 p-12 transition-all duration-500 group flex flex-col justify-center items-center text-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="w-20 h-20 rounded-full bg-white group-hover:bg-amber-500 flex items-center justify-center mb-6 shadow-sm transition-colors duration-500 relative z-10">
                  <Plus className="w-8 h-8 text-slate-900 group-hover:text-white transition-colors duration-500" />
                </div>
                <h3 className="text-2xl font-serif text-slate-800 group-hover:text-white mb-3 transition-colors duration-500 z-10">New Workspace</h3>
                <p className="text-slate-500 group-hover:text-slate-300 text-sm font-light uppercase tracking-widest z-10 transition-colors duration-500">Initialize Cohort</p>
              </button>
            ) : (
              <div className="flex-1 bg-white/70 backdrop-blur-3xl rounded-[2.5rem] border border-white shadow-2xl p-10 relative overflow-hidden min-h-[360px] flex flex-col">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-serif tracking-tight text-slate-900">Define Scope</h3>
                  <button onClick={() => setIsCreating(false)} className="text-[10px] uppercase tracking-widest font-bold text-slate-400 hover:text-slate-900">Cancel</button>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <ProjectForm onSubmit={handleCreateProject} />
                  {formError && <p className="text-rose-500 text-sm mt-4 bg-rose-50 p-4 rounded-xl">{formError}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Existing Projects */}
          {loading && <div className="min-h-[360px] rounded-[2.5rem] bg-slate-50 animate-pulse border border-black/5" />}
          {error && <div className="min-h-[360px] rounded-[2.5rem] bg-rose-50 p-12 text-rose-500 border border-rose-100 flex items-center justify-center font-mono text-sm">{error}</div>}

          {projectItems.map((project, i) => (
            <Link
              key={project.id}
              to={`/app/platform/${project.id}`}
              className="group block min-h-[360px] bg-white/60 backdrop-blur-2xl rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/50 p-10 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-700 relative overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-700">
                <Database className="w-32 h-32 text-slate-900" />
              </div>

              <div className="flex-1 z-10 flex flex-col">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.15em] mb-4">Workspace</span>
                <h2 className="text-3xl font-serif text-slate-900 tracking-tight leading-tight mb-4 group-hover:text-amber-700 transition-colors duration-500">
                  {project.name}
                </h2>
                <p className="text-slate-500 font-light leading-relaxed line-clamp-4 mt-auto">
                  {project.description || "No specific hypothesis provided for this cohort workspace."}
                </p>
              </div>

              <div className="mt-8 flex justify-between items-center z-10 pt-6 border-t border-black/5">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(n => (
                    <div key={n} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-bold">
                      <Dna className="w-3 h-3" />
                    </div>
                  ))}
                </div>
                <div className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center bg-white group-hover:bg-slate-900 transition-colors duration-500">
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors duration-500" />
                </div>
              </div>
            </Link>
          ))}
        </motion.div>
      </motion.div>
    </>
  );
}
