import { Fingerprint, Info, AlertCircle } from "lucide-react";

interface ReportEvidenceProps {
  evidence: Array<{
    source: string;
    description: string;
    quality: string;
  }>;
}

export function ReportEvidence({ evidence }: ReportEvidenceProps) {
  return (
    <section id="evidence" className="scroll-mt-24 space-y-4">
      <h3 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">Evidence Trail</h3>
      
      {evidence.length === 0 ? (
        <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-8 text-center text-slate-500">
          No specific evidence items found in trace.
        </div>
      ) : (
        <div className="space-y-3">
          {evidence.map((item, idx) => (
            <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 flex gap-4">
              <div className="shrink-0 mt-1">
                {item.quality === 'primary' ? (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                ) : (
                  <Info className="h-5 w-5 text-blue-500" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-slate-300">{item.description}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                  <Fingerprint className="h-3 w-3" />
                  <span>{item.source}</span>
                  <span className="px-1.5 py-0.5 bg-slate-800 rounded uppercase">{item.quality} quality</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
