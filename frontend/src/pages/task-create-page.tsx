import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { TaskForm } from "../features/tasks/task-form";

export function TaskCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialProjectId = Number(searchParams.get("projectId"));
  const resolvedProjectId = Number.isNaN(initialProjectId) ? undefined : initialProjectId;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen py-32 px-8"
    >
      <div className="max-w-[1200px] mx-auto w-full mb-16">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-6xl md:text-8xl font-sans tracking-tighter text-slate-900 mb-6 leading-tight">
            Launch <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-700">Pipeline</span>
          </h1>
          <p className="text-2xl text-slate-500 max-w-2xl font-light tracking-wide leading-relaxed">
            Configure sequence parameters to initiate structural variation analysis.
          </p>
        </motion.div>
      </div>
      
      <TaskForm
        initialProjectId={resolvedProjectId}
        onCreated={(task) => navigate(`/app/pipeline/${task.id}`)}
      />
    </motion.div>
  );
}
