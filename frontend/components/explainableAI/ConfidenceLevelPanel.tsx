import React from "react";
import { CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";

export interface ConfidenceLevelPanelProps {
  confidence_level?: "High" | "Medium" | "Low";
  confidence_reason?: string;
  scam_probability?: number;
}

/**
 * ConfidenceLevelPanel
 * Displays confidence in the scam detection verdict
 * Shows reasoning for the confidence level
 */
export const ConfidenceLevelPanel: React.FC<ConfidenceLevelPanelProps> = ({
  confidence_level = "Medium",
  confidence_reason,
  scam_probability = 0,
}) => {
  const getConfidenceColor = (level: string) => {
    switch (level) {
      case "High":
        return {
          bg: "from-emerald-900/30 to-emerald-900/10",
          border: "border-emerald-500/40",
          badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
          text: "text-emerald-100",
          icon: "text-emerald-400",
          accent: "text-emerald-400",
        };
      case "Medium":
        return {
          bg: "from-blue-900/30 to-blue-900/10",
          border: "border-blue-500/40",
          badge: "bg-blue-500/20 text-blue-300 border-blue-500/40",
          text: "text-blue-100",
          icon: "text-blue-400",
          accent: "text-blue-400",
        };
      case "Low":
        return {
          bg: "from-purple-900/30 to-purple-900/10",
          border: "border-purple-500/40",
          badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
          text: "text-purple-100",
          icon: "text-purple-400",
          accent: "text-purple-400",
        };
      default:
        return {
          bg: "from-slate-900/30 to-slate-900/10",
          border: "border-slate-500/40",
          badge: "bg-slate-500/20 text-slate-300 border-slate-500/40",
          text: "text-slate-100",
          icon: "text-slate-400",
          accent: "text-slate-400",
        };
    }
  };

  const colors = getConfidenceColor(confidence_level);

  const getConfidenceIcon = () => {
    switch (confidence_level) {
      case "High":
        return <CheckCircle2 className={`h-5 w-5 ${colors.icon}`} />;
      case "Medium":
        return <AlertCircle className={`h-5 w-5 ${colors.icon}`} />;
      case "Low":
        return <HelpCircle className={`h-5 w-5 ${colors.icon}`} />;
      default:
        return <HelpCircle className={`h-5 w-5 ${colors.icon}`} />;
    }
  };

  return (
    <div
      className={`rounded-xl border ${colors.border} bg-gradient-to-br ${colors.bg} backdrop-blur-xl p-6 sm:p-8 hover:border-white/20 transition-all`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${colors.bg} border ${colors.border}`}>
          {getConfidenceIcon()}
        </div>
        <div>
          <h3 className={`font-bold text-lg text-white`}>Confidence Level</h3>
          <p className={`text-xs ${colors.text} opacity-70 mt-0.5`}>
            Reliability of this detection
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Confidence Level Badge */}
        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-4 hover:bg-white/8 transition-all">
          <p className="text-sm font-semibold text-gray-300">Detection Confidence</p>
          <div className={`rounded-lg border ${colors.badge} px-4 py-2 font-bold text-center`}>
            {confidence_level}
          </div>
        </div>

        {/* Scam Probability */}
        {scam_probability > 0 && (
          <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Associated Risk
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Scam Probability</span>
                <span className={`text-lg font-bold ${colors.accent}`}>
                  {Math.round(scam_probability * 100)}%
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden border border-white/5">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ${
                    scam_probability >= 0.7
                      ? "bg-gradient-to-r from-red-500 to-red-600"
                      : scam_probability >= 0.4
                        ? "bg-gradient-to-r from-amber-500 to-orange-600"
                        : "bg-gradient-to-r from-yellow-500 to-amber-600"
                  }`}
                  style={{ width: `${scam_probability * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Reason */}
        {confidence_reason && (
          <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Why</p>
            <p className="text-sm text-gray-300 leading-relaxed">{confidence_reason}</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
          Confidence Levels
        </p>
        <div className="space-y-2.5 text-xs text-gray-400">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-emerald-400 flex-shrink-0" />
            <span><span className="text-emerald-300 font-semibold">High:</span> Multiple detection methods flagged this</span>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-blue-400 flex-shrink-0" />
            <span><span className="text-blue-300 font-semibold">Medium:</span> Some indicators detected, additional verification recommended</span>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-purple-400 flex-shrink-0" />
            <span><span className="text-purple-300 font-semibold">Low:</span> Limited scam indicators detected</span>
          </div>
        </div>
      </div>
    </div>
  );
};
