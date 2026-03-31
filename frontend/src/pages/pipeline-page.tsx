import { PageHero } from '../components/page-hero';
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { TaskFilterBar } from "../features/tasks/task-filter-bar";
import { TaskListTable } from "../features/tasks/task-list-table";
import { TaskStatusSummary } from "../features/tasks/task-status-summary";
import { getTasks } from "../lib/api";
import { useAsyncData } from "../lib/use-async-data";

export function PipelinePage() {
  const navigate = useNavigate();
  const { data: tasks, error, loading } = useAsyncData(getTasks, []);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [projectId, setProjectId] = useState("");
  const [platform, setPlatform] = useState("");

  const taskItems = tasks ?? [];
  const summary = useMemo(
    () => ({
      total: taskItems.length,
      pending: taskItems.filter((task) => task.status === "pending").length,
      running: taskItems.filter((task) => task.status === "running").length,
      succeeded: taskItems.filter((task) => task.status === "succeeded").length,
      failed: taskItems.filter((task) => task.status === "failed").length,
      attention_count: taskItems.filter((task) => task.status === "pending" || task.status === "failed").length
    }),
    [taskItems]
  );

  const projectOptions = useMemo(
    () => Array.from(new Map(taskItems.map((task) => [task.project_id, { id: task.project_id, name: task.project_name }])).values()),
    [taskItems]
  );
  const platformOptions = useMemo(
    () => Array.from(new Set(taskItems.map((task) => String(task.params.platform_type ?? "")).filter(Boolean))),
    [taskItems]
  );

  const filteredTasks = useMemo(
    () =>
      taskItems.filter((task) => {
        const matchesSearch = search.trim()
          ? task.task_name.toLowerCase().includes(search.trim().toLowerCase())
          : true;
        const matchesStatus = status ? task.status === status : true;
        const matchesProject = projectId ? String(task.project_id) === projectId : true;
        const matchesPlatform = platform ? String(task.params.platform_type ?? "") === platform : true;
        return matchesSearch && matchesStatus && matchesProject && matchesPlatform;
      }),
    [platform, projectId, search, status, taskItems]
  );

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  return (
    <>
      <PageHero
        eyebrow="Pipeline"
        title="Task Operations"
        description="Centralized view of cuteFC SV discovery tasks, project attributions, execution status, and next steps."
        bgImage="https://www.insitro.com/wp-content/uploads/2023/11/insitro_8.24.23-067_compressed-scaled.jpg"
        buttons={[{ label: "Create Task", active: true, onClick: () => navigate("/app/pipeline/new") }]}
      />
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="page !max-w-[1400px] !px-4">

        <motion.div variants={itemVariants}>
          <TaskStatusSummary summary={summary} />
        </motion.div>

        <motion.div variants={itemVariants} className="mt-8 mb-8 sticky top-32 z-30">
          <TaskFilterBar
            search={search} status={status} projectId={projectId} platform={platform}
            projectOptions={projectOptions} platformOptions={platformOptions}
            onSearchChange={setSearch} onStatusChange={setStatus} onProjectChange={setProjectId} onPlatformChange={setPlatform}
          />
        </motion.div>

        <motion.div variants={itemVariants} className="pb-32">
          {loading && !taskItems.length && (
            <div className="p-12 text-center text-slate-400 font-mono text-sm tracking-wider uppercase">Connecting to Pipeline...</div>
          )}
          {error && <div className="p-12 text-center text-rose-500 bg-rose-50 rounded-3xl border border-rose-100">{error}</div>}
          {!loading && !error && !taskItems.length && (
            <div className="py-32 text-center flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                <span className="text-3xl font-serif text-slate-300">0</span>
              </div>
              <h3 className="text-2xl font-serif text-slate-800 mb-4">Pipeline Empty</h3>
              <p className="text-slate-500 font-light max-w-md">Initialize a new cuteFC sequencing task to begin populating your pipeline.</p>
            </div>
          )}
          {!loading && !error && taskItems.length > 0 && !filteredTasks.length && (
            <div className="p-12 text-center text-slate-500 font-light">No sequences match the current parameters.</div>
          )}
          {!error && filteredTasks.length > 0 && <TaskListTable tasks={filteredTasks} />}
        </motion.div>
      </motion.div>
    </>
  );
}
