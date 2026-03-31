import { useState } from "react";
import type { FormEvent } from "react";

import type { ProjectCreate } from "../../lib/types";

type ProjectFormProps = {
  initialValue?: ProjectCreate;
  submitLabel?: string;
  onSubmit: (value: ProjectCreate) => Promise<void> | void;
};

export function ProjectForm({
  initialValue = { name: "", description: "" },
  submitLabel = "创建项目",
  onSubmit
}: ProjectFormProps) {
  const [name, setName] = useState(initialValue.name);
  const [description, setDescription] = useState(initialValue.description);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      name: name.trim(),
      description: description.trim()
    });
  }

  
  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      <div className="space-y-8">
        <div className="space-y-4">
          <input
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Name your initiative..."
            className="w-full bg-transparent border-none text-5xl md:text-7xl font-sans tracking-tight text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-0 p-0"
          />
          <p className="text-xl text-slate-500 font-light tracking-wide">
            Provide a clear and concise title for the new project workspace.
          </p>
        </div>

        <div className="space-y-4 pt-8 border-t border-slate-200/50">
          <label className="block text-sm font-semibold tracking-widest text-slate-400 uppercase">
            Project Directive
          </label>
          <textarea
            placeholder="Outline the scope, biological origins, or hypotheses behind this sequencing effort..."
            rows={5}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="w-full bg-white/40 backdrop-blur-xl border border-white/60 shadow-sm rounded-3xl p-6 text-xl text-slate-700 leading-relaxed focus:ring-4 focus:ring-amber-500/20 outline-none resize-none transition-all"
          />
        </div>
      </div>

      <div className="pt-8 flex justify-end">
        <button
          type="submit"
          disabled={!name.trim()}
          className="group relative inline-flex items-center gap-4 bg-slate-900 hover:bg-slate-800 text-white px-10 py-4 rounded-full text-xl font-medium tracking-wide transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitLabel}
          <span className="block transform group-hover:translate-x-1 transition-transform">
            →
          </span>
          <div className="absolute inset-0 rounded-full ring-2 ring-transparent group-hover:ring-slate-900/20 ring-offset-2 transition-all"></div>
        </button>
      </div>
    </form>
  );

}
