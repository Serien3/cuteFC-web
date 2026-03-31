type TaskFilterBarProps = {
  search: string;
  status: string;
  projectId: string;
  platform: string;
  projectOptions: Array<{ id: number; name: string }>;
  platformOptions: string[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onProjectChange: (value: string) => void;
  onPlatformChange: (value: string) => void;
};

export function TaskFilterBar({
  search,
  status,
  projectId,
  platform,
  projectOptions,
  platformOptions,
  onSearchChange,
  onStatusChange,
  onProjectChange,
  onPlatformChange
}: TaskFilterBarProps) {
  
  return (
    <section className="bg-white/40 backdrop-blur-2xl rounded-[3rem] p-8 border border-white/60 shadow-lg mb-12">
      <div className="flex flex-col md:flex-row gap-8 items-center">
        
        <div className="flex-1 w-full relative">
          <span className="absolute inset-y-0 left-6 flex items-center text-slate-400">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
          <input 
            value={search} 
            onChange={(event) => onSearchChange(event.target.value)} 
            placeholder="Search tasks by identity..." 
            className="w-full bg-white/60 backdrop-blur-md text-xl md:text-2xl text-slate-800 border-none rounded-full pl-16 pr-8 py-5 focus:ring-4 focus:ring-amber-500/20 outline-none transition-all placeholder-slate-400 font-sans tracking-tight shadow-sm"
          />
        </div>

        <div className="flex flex-wrap md:flex-nowrap gap-4 w-full md:w-auto">
          <div className="flex-1 md:flex-none">
            <select 
              value={status} 
              onChange={(event) => onStatusChange(event.target.value)}
              className="w-full md:w-48 bg-slate-50/50 hover:bg-slate-100/50 backdrop-blur-md text-slate-700 font-medium border-none rounded-2xl px-6 py-4 outline-none transition-all appearance-none cursor-pointer focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="running">In Orbit</option>
              <option value="succeeded">Completed</option>
              <option value="failed">Failed Setup</option>
            </select>
          </div>
          
          <div className="flex-1 md:flex-none">
            <select 
              value={projectId} 
              onChange={(event) => onProjectChange(event.target.value)}
              className="w-full md:w-56 bg-slate-50/50 hover:bg-slate-100/50 backdrop-blur-md text-slate-700 font-medium border-none rounded-2xl px-6 py-4 outline-none transition-all appearance-none cursor-pointer focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="">Global Workspace</option>
              {projectOptions.map((project) => (
                <option key={project.id} value={String(project.id)}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 md:flex-none">
            <select 
              value={platform} 
              onChange={(event) => onPlatformChange(event.target.value)}
              className="w-full md:w-44 bg-slate-50/50 hover:bg-slate-100/50 backdrop-blur-md text-slate-700 font-medium border-none rounded-2xl px-6 py-4 outline-none transition-all appearance-none cursor-pointer focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="">Cross Platform</option>
              {platformOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>
    </section>
  );

}
