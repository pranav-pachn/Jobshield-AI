import { FileSearch, Link, ExternalLink, Bot, Database } from "lucide-react";

export function EvidenceCard({ evidence }: { evidence: any[] }) {
  if (!evidence || evidence.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl mb-4">
      <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
        <FileSearch className="w-5 h-5 text-blue-400" /> Evidence Provenance
      </h3>
      
      <div className="space-y-6">
        {evidence.map((item, idx) => (
          <div key={idx} className="bg-slate-800/30 border border-slate-700/50 rounded-lg overflow-hidden">
            
            {/* Retrieved Evidence (External Fact) */}
            <div className="p-4 bg-slate-800/80 border-b border-slate-700">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Database className="w-4 h-4 text-emerald-400" />
                  Retrieved Evidence
                </div>
                {item.similarity !== undefined && (
                  <span className={`text-xs px-2 py-1 rounded font-medium ${item.similarity >= 0.8 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {Math.round(item.similarity * 100)}% match
                  </span>
                )}
              </div>
              
              {item.source && (
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-slate-200">{item.source.title || item.source.id}</div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="bg-slate-900 px-2 py-1 rounded border border-slate-700">{item.source.type.replace(/_/g, " ")}</span>
                    {item.source.url && (
                      <a href={item.source.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                        <ExternalLink className="w-3 h-3" /> Source Link
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Agent Interpretation (Reasoning) */}
            <div className="p-4 bg-slate-900/50">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                <Bot className="w-4 h-4 text-purple-400" />
                Agent Interpretation
              </div>
              <p className="text-sm text-slate-300 leading-relaxed border-l-2 border-purple-500/30 pl-3 italic">
                "{item.description}"
              </p>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}
