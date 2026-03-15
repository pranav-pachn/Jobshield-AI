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
          bg: "bg-green-50",
          border: "border-green-200",
          badge: "bg-green-100 text-green-800",
          text: "text-green-900",
          icon: "text-green-600",
        };
      case "Medium":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          badge: "bg-yellow-100 text-yellow-800",
          text: "text-yellow-900",
          icon: "text-yellow-600",
        };
      case "Low":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          badge: "bg-blue-100 text-blue-800",
          text: "text-blue-900",
          icon: "text-blue-600",
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          badge: "bg-gray-100 text-gray-800",
          text: "text-gray-900",
          icon: "text-gray-600",
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
      className={`rounded-lg border p-4 sm:p-6 ${colors.bg} ${colors.border}`}
    >
      <div className="flex items-center gap-2 mb-4">
        {getConfidenceIcon()}
        <h3 className={`font-semibold ${colors.text}`}>Confidence Level</h3>
      </div>

      <div className="space-y-4">
        {/* Confidence Level Badge */}
        <div className="flex items-center justify-between rounded-md bg-white/50 p-3">
          <p className="text-sm font-medium text-gray-700">Detection Confidence:</p>
          <span className={`rounded-full px-3 py-1 text-sm font-bold ${colors.badge}`}>
            {confidence_level}
          </span>
        </div>

        {/* Scam Probability */}
        {scam_probability > 0 && (
          <div className="rounded-md bg-white/50 p-3">
            <p className="text-xs font-medium text-gray-600 mb-2">
              Scam Probability
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    scam_probability >= 0.7
                      ? "bg-red-500"
                      : scam_probability >= 0.4
                        ? "bg-orange-500"
                        : "bg-yellow-500"
                  }`}
                  style={{ width: `${scam_probability * 100}%` }}
                />
              </div>
              <span className="text-sm font-bold text-gray-900">
                {Math.round(scam_probability * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* Reason */}
        {confidence_reason && (
          <div className="rounded-md bg-white/50 p-3">
            <p className="text-xs font-medium text-gray-600 mb-2">Why</p>
            <p className="text-sm text-gray-800">{confidence_reason}</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-current border-opacity-20">
        <div className="space-y-2 text-xs text-gray-700">
          <div className="flex items-start gap-2">
            <span className="font-bold text-green-700 min-w-12">High:</span>
            <span>Multiple detection methods flagged this posting</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-yellow-700 min-w-12">Medium:</span>
            <span>Some indicators detected, additional context recommended</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-blue-700 min-w-12">Low:</span>
            <span>Limited scam indicators detected</span>
          </div>
        </div>
      </div>
    </div>
  );
};
