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
    <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="h-5 w-5 text-orange-600" />
        <h3 className="font-semibold text-orange-900">Why It Was Flagged</h3>
      </div>

      <div className="space-y-3">
        {topIndicators.map((item, index) => (
          <div
            key={index}
            className="flex items-start gap-3 rounded-md bg-white/50 p-3"
          >
            <div className="mt-1 rounded-full bg-orange-200 p-1">
              <TrendingUp className="h-3.5 w-3.5 text-orange-700" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900 text-sm">
                  {item.phrase}
                </p>
                <span className="inline-block rounded-full bg-orange-200 px-2 py-1 text-xs font-semibold text-orange-800">
                  {Math.round(item.confidence * 100)}%
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">{item.reason}</p>
            </div>
          </div>
        ))}
      </div>

      {reasons && reasons.length > 0 && (
        <div className="mt-4 pt-4 border-t border-orange-200">
          <p className="text-xs font-semibold text-orange-900 mb-2">
            Detection Summary
          </p>
          <div className="flex flex-wrap gap-2">
            {reasons.slice(0, 3).map((reason, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs text-orange-800"
              >
                <MessageSquare className="h-3 w-3" />
                {reason}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
