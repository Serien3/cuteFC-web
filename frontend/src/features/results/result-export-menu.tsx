type ResultExportMenuProps = {
  busy?: boolean;
  onExport: (format: "csv" | "tsv" | "vcf") => void;
};

export function ResultExportMenu({ busy = false, onExport }: ResultExportMenuProps) {
  
  return (
    <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden mb-16">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="max-w-xl">
          <h5 className="text-amber-400 font-bold tracking-[0.3em] text-xs uppercase mb-4">Export Framework</h5>
          <h2 className="text-4xl font-bold tracking-tight mb-4">Data Extraction Protocol</h2>
          <p className="text-slate-300 text-lg font-light leading-relaxed">
            Compile the current contextual variant slice into standardized computational formats for external pipeline integration or clinical review.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <button 
            type="button" 
            className="flex-1 md:flex-none justify-center group flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 px-8 py-4 rounded-full font-bold tracking-widest text-sm transition-all shadow-sm"
            disabled={busy} 
            onClick={() => onExport("csv")}
          >
            <span>CSV</span>
            <span className="opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all">↑</span>
          </button>
          
          <button 
            type="button" 
            className="flex-1 md:flex-none justify-center group flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 px-8 py-4 rounded-full font-bold tracking-widest text-sm transition-all shadow-sm"
            disabled={busy} 
            onClick={() => onExport("tsv")}
          >
            <span>TSV</span>
            <span className="opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all">↑</span>
          </button>
          
          <button 
            type="button" 
            className="w-full md:w-auto justify-center group relative overflow-hidden flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-slate-900 border-none px-10 py-4 rounded-full font-bold tracking-widest text-sm transition-all shadow-lg hover:shadow-amber-500/25"
            disabled={busy} 
            onClick={() => onExport("vcf")}
          >
            <span className="relative z-10">STANDARD VCF</span>
            <span className="relative z-10 opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all">↑</span>
            <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-500 ease-out"></div>
          </button>
        </div>
      </div>
    </section>
  );

}
