import React from "react";
import { CheckCircle2, AlertTriangle, Zap } from "lucide-react";

export interface EvidenceSource {
  source: string;
  description: string;
  confidence: number;
}

export interface EvidenceSourcesPanelProps {
  evidence_sources?: EvidenceSource[];
  scam_probability?: number;
}

/**
 * EvidenceSourcesPanel
 * Displays verification evidence from multiple detection sources
 * Shows what signals triggered the scam detection
 */
export const EvidenceSourcesPanel: React.FC<EvidenceSourcesPanelProps> = ({
  evidence_sources = [],
  scam_probability = 0,
}) => {
  if (!evidence_sources.length) {
    return null;
  }

  const getConfidenceBadgeColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-red-500/20 text-red-300 border-red-500/40";
    if (confidence >= 0.5) return "bg-amber-500/20 text-amber-300 border-amber-500/40";
    return "bg-yellow-500/20 text-yellow-300 border-yellow-500/40";
  };

  const getSourceIcon = (source: string) => {
    if (
      source.includes("Phrase") ||
      source.includes("Detection")
    ) {
      return <Zap className="h-4 w-4" />;
    }
    if (source.includes("Classification") || source.includes("AI")) {
      return <Zap className="h-4 w-4" />;
    }
    return <CheckCircle2 className="h-4 w-4" />;
  };

  return (
    <div className="rounded-xl border border-blue-500/40 bg-gradient-to-br from-blue-900/20 to-blue-900/10 backdrop-blur-xl p-6 sm:p-8 hover:border-blue-500/60 transition-all">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/40">
          <CheckCircle2 className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h3 className="font-bold text-white text-lg">Verification Evidence</h3>
          <p className="text-xs text-blue-200/60 mt-0.5">Multiple detection methods confirm threat</p>
        </div>
      </div>

      {/* Evidence List */}
      <div className="space-y-3">
        {evidence_sources.map((evidence, index) => (
          <div
            key={index}
            className="group rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-sm p-4 transition-all hover:border-blue-500/30"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-blue-400 group-hover:scale-110 transition-transform">
                {getSourceIcon(evidence.source)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="font-semibold text-white text-sm truncate">
                    {evidence.source}
                  </p>
                  <div className={`rounded-full px-3 py-1 text-xs font-bold border backdrop-blur-sm flex-shrink-0 ${getConfidenceBadgeColor(evidence.confidence)}`}>
                    {Math.round(evidence.confidence * 100)}%
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  {evidence.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {evidence_sources.length > 1 && (
        <div className="mt-6 pt-6 border-t border-white/10 rounded-lg border-transparent">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-white/5">
            <AlertTriangle className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <span className="text-xs text-gray-300 leading-relaxed">
              <strong className="text-blue-300">{evidence_sources.length} independent</strong> detection methods flagged this posting
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
