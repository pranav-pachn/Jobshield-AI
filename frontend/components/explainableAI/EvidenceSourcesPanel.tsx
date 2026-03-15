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
    if (confidence >= 0.8) return "bg-red-100 text-red-800";
    if (confidence >= 0.5) return "bg-orange-100 text-orange-800";
    return "bg-yellow-100 text-yellow-800";
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
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-blue-900">Verification Evidence</h3>
      </div>

      <div className="space-y-3">
        {evidence_sources.map((evidence, index) => (
          <div
            key={index}
            className="flex items-start gap-3 rounded-md bg-white/50 p-3"
          >
            <div className="mt-1 text-blue-600">
              {getSourceIcon(evidence.source)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="font-medium text-gray-900 text-sm">
                  {evidence.source}
                </p>
                <span
                  className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${getConfidenceBadgeColor(evidence.confidence)}`}
                >
                  {Math.round(evidence.confidence * 100)}% confidence
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {evidence.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {evidence_sources.length > 1 && (
        <div className="mt-4 pt-4 border-t border-blue-200">
          <div className="flex items-center gap-2 text-xs text-blue-800">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>
              <strong>{evidence_sources.length}</strong> independent detection
              methods flagged this posting
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
