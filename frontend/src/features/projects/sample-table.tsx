import type { InputFile, Sample } from "../../lib/types";

type SampleTableProps = {
  samples: Sample[];
  files?: InputFile[];
};

export function SampleTable({ samples, files = [] }: SampleTableProps) {
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {samples.map((sample) => {
          const sampleFiles = files.filter((file) => file.sample_id === sample.id);
          return (
            <div 
              key={sample.id}
              className="bg-white/50 backdrop-blur-md rounded-[2rem] p-6 border border-white flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/80 transition-colors shadow-sm"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-4">
                  <h4 className="text-xl font-bold font-sans tracking-tight text-slate-800">
                    {sample.sample_name}
                  </h4>
                  <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                    {sample.platform_type}
                  </span>
                </div>
                <p className="text-slate-500 font-medium">
                  {sample.remark || "No additional metadata recorded."}
                </p>
              </div>
              
              <div className="flex-1 border-t md:border-t-0 md:border-l border-slate-200/50 pt-4 md:pt-0 md:pl-6">
                <h5 className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-3">
                  Registered Data Pointers
                </h5>
                {sampleFiles.length > 0 ? (
                  <div className="space-y-2">
                    {sampleFiles.map((file) => (
                      <div key={file.id} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded-md">
                          {file.file_type}
                        </span>
                        <code className="text-sm font-mono text-slate-600 font-medium truncate w-full max-w-xs" title={file.file_path}>
                          {file.file_path.split('/').pop() || file.file_path}
                        </code>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-slate-400 italic">No files registered to this sample yet.</span>
                )}
              </div>
            </div>
          );
        })}
        {samples.length === 0 && (
          <div className="py-12 text-center bg-white/30 rounded-[2rem] border border-white">
            <p className="text-slate-500 font-medium">No biological samples registered to this cohort.</p>
          </div>
        )}
      </div>
    </div>
  );

}
