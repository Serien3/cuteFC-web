import { ResultIgvPanel } from "./result-igv-panel";
import type { ResultVariantDetail } from "../../lib/types";

type ResultDetailPanelProps = {
  detail: ResultVariantDetail | null;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
};

export function ResultDetailPanel({
  detail,
  loading = false,
  error = null,
  onClose
}: ResultDetailPanelProps) {
  
  return (
    <section className="bg-slate-900 rounded-[3rem] p-8 md:p-12 border border-slate-800 shadow-2xl mt-12 relative overflow-hidden text-slate-200">
      
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-slate-800 rounded-full mix-blend-screen filter blur-[100px] opacity-20 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-8 mb-12 border-b border-slate-800 pb-8">
        <div>
          <h5 className="text-amber-500 font-bold tracking-[0.3em] text-xs uppercase mb-4">Inspection Module</h5>
          <h2 className="text-4xl font-bold tracking-tight text-white mb-2">Signature Inspector</h2>
          <p className="text-slate-400 font-medium">Deep topological analysis of the selected structural variation.</p>
        </div>
        <button 
          type="button" 
          className="group inline-flex items-center gap-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white px-6 py-3 rounded-full font-bold tracking-wide transition-all border border-slate-700 hover:border-slate-600 self-start" 
          onClick={onClose}
        >
          <span>✕ Close</span>
        </button>
      </div>

      <div className="relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
             <div className="w-16 h-16 border-4 border-slate-700 border-t-amber-500 rounded-full animate-spin mb-6"></div>
             <p className="text-slate-400 font-medium tracking-wide">Executing extraction protocols...</p>
          </div>
        ) : null}
        
        {error ? (
           <div className="bg-red-900/20 border border-red-900/50 rounded-2xl p-6 text-red-200">
              <p className="font-bold mb-1">Extraction Failed</p>
              <p className="text-sm opacity-80">{error}</p>
           </div>
        ) : null}
        
        {!loading && !error && !detail ? (
          <div className="py-16 text-center">
             <p className="text-slate-500 font-medium text-lg">Select a structural variant from the browser above to initiate inspection.</p>
          </div>
        ) : null}

        {!loading && !error && detail ? (
          <div className="space-y-12">
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              
              <div className="col-span-2 md:col-span-4 lg:col-span-5 bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 flex flex-wrap gap-x-12 gap-y-6">
                 <div>
                    <h6 className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase mb-2">Identity</h6>
                    <span className="text-white font-medium text-lg">{detail.task_name} <span className="text-slate-600 mx-2">/</span> {detail.sample_name}</span>
                 </div>
                 
                 <div>
                    <h6 className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase mb-2">Signature</h6>
                    <div className="flex items-center gap-3">
                       <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded text-sm font-bold tracking-widest">{detail.sv_type}</span>
                       <span className="bg-slate-700 text-slate-300 px-3 py-1 rounded text-sm font-mono">{detail.gt}</span>
                       <span className="bg-slate-700 text-slate-300 px-3 py-1 rounded text-sm font-mono">{Math.abs(detail.sv_len).toLocaleString()} <span className="text-slate-500 text-xs ml-1">BP</span></span>
                    </div>
                 </div>

                 <div>
                    <h6 className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase mb-2">Support Factor</h6>
                    <span className="text-white font-mono text-xl">{detail.support_reads} <span className="text-slate-500 text-xs font-sans tracking-wide ml-1">READS</span></span>
                 </div>
              </div>

              <div className="col-span-2 md:col-span-2 bg-slate-800/30 rounded-2xl p-6 border border-slate-700/30">
                 <h6 className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase mb-3">Genomic Coordinates</h6>
                 <div className="space-y-1 font-mono text-sm break-all">
                    <p><span className="text-slate-500">CHR:</span> <span className="text-white">{detail.chrom}</span></p>
                    <p><span className="text-slate-500">POS:</span> <span className="text-white">{detail.pos.toLocaleString()}</span></p>
                    <p><span className="text-slate-500">END:</span> <span className="text-white">{detail.end.toLocaleString()}</span></p>
                    <p className="mt-3 pt-3 border-t border-slate-700/50"><span className="text-amber-500/50">LOC:</span> <span className="text-amber-400">{detail.locus}</span></p>
                 </div>
              </div>

              <div className="col-span-2 md:col-span-2 lg:col-span-3 bg-slate-800/30 rounded-2xl p-6 border border-slate-700/30">
                 <h6 className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase mb-3">System Pointers</h6>
                 <div className="space-y-2 font-mono text-[11px] text-slate-400 break-all">
                    <p className="flex items-start gap-2"><span className="w-16 shrink-0 text-slate-600 font-sans tracking-widest uppercase text-[9px] mt-[2px]">FASTA</span> <span>{detail.reference_fasta}</span></p>
                    <p className="flex items-start gap-2"><span className="w-16 shrink-0 text-slate-600 font-sans tracking-widest uppercase text-[9px] mt-[2px]">BAM</span> <span>{detail.input_bam || "Not loaded"}</span></p>
                    <p className="flex items-start gap-2"><span className="w-16 shrink-0 text-slate-600 font-sans tracking-widest uppercase text-[9px] mt-[2px]">OUT_VCF</span> <span>{detail.output_vcf}</span></p>
                    <p className="flex items-start gap-2"><span className="w-16 shrink-0 text-slate-600 font-sans tracking-widest uppercase text-[9px] mt-[2px]">TRG_VCF</span> <span>{detail.target_vcf || "Not loaded"}</span></p>
                 </div>
              </div>
            </div>

            {detail.locus ? (
              <div className="pt-8 border-t border-slate-800">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                   <h6 className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase">Live IGV.js Render</h6>
                </div>
                <div className="bg-white rounded-2xl overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] border border-slate-700">
                  <ResultIgvPanel detail={detail} />
                </div>
              </div>
            ) : null}

          </div>
        ) : null}
      </div>
    </section>
  );

}
