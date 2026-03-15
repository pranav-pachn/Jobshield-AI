import React from "react";
import {
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
} from "lucide-react";

export interface WhyItWasFlaggedPanelProps {
  suspicious_phrases: string[];
  phrase_details?: Array<{
    phrase: string;
    confidence: number;
    reason: string;
  }>;
  reasons?: string[];
}

/**
 * WhyItWasFlaggedPanel
 * Displays the top suspicious indicators detected in the job posting
 * with individual confidence scores and reasons
 */
export const WhyItWasFlaggedPanel: React.FC<WhyItWasFlaggedPanelProps> = ({
  suspicious_phrases,
  phrase_details,
  reasons,
}) => {
  const topIndicators = phrase_details?.slice(0, 5) || [];

  if (!topIndicators.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-900/20 to-amber-900/10 backdrop-blur-xl p-6 sm:p-8 hover:border-amber-500/50 transition-all">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/40">
          <AlertCircle className="h-5 w-5 text-amber-400" />
        </div>
        <div>
          <h3 className="font-bold text-white text-lg">Why It Was Flagged</h3>
          <p className="text-xs text-amber-200/60 mt-0.5">Detected suspicious indicators</p>
        </div>
      </div>

      {/* Indicators List */}
      <div className="space-y-3">
        {topIndicators.map((item, index) => (
          <div
            key={index}
            className="group rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-sm p-4 transition-all hover:border-amber-500/30"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-lg bg-amber-500/20 border border-amber-500/30 p-1.5 group-hover:bg-amber-500/30 transition-colors">
                <TrendingUp className="h-4 w-4 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="font-semibold text-white text-sm leading-snug break-words">
                    "{item.phrase}"
                  </p>
                  <div className="inline-flex flex-shrink-0 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/40 px-3 py-1 backdrop-blur-sm">
                    <span className="text-xs font-bold text-amber-300">
                      {Math.round(item.confidence * 100)}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">{item.reason}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detection Summary */}
      {reasons && reasons.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-300/70 mb-3">
            Detection Summary
          </p>
          <div className="flex flex-wrap gap-2">
            {reasons.slice(0, 3).map((reason, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500/15 to-amber-600/15 border border-amber-500/30 px-3.5 py-1.5 text-xs font-medium text-amber-200 hover:from-amber-500/20 hover:to-amber-600/20 transition-all cursor-default"
              >
                <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{reason}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
