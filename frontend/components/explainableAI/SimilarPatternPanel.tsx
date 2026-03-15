import React from "react";
import { Copy, TrendingUp, AlertCircle } from "lucide-react";

export interface SimilarPattern {
  pattern: string;
  frequency: number;
  confidence: number;
}

export interface SimilarPatternPanelProps {
  similar_patterns?: SimilarPattern[];
  matching_templates?: string[];
}

/**
 * SimilarPatternPanel
 * Shows how many times similar scam patterns have been reported
 * Provides pattern matching evidence
 */
export const SimilarPatternPanel: React.FC<SimilarPatternPanelProps> = ({
  similar_patterns = [],
  matching_templates = [],
}) => {
  if (similar_patterns.length === 0 && matching_templates.length === 0) {
    return null;
  }

  const totalMatches = similar_patterns.reduce(
    (sum, p) => sum + p.frequency,
    0
  );

  return (
    <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Copy className="h-5 w-5 text-purple-600" />
        <h3 className="font-semibold text-purple-900">Similar Scam Pattern</h3>
      </div>

      {similar_patterns.length > 0 && (
        <div className="space-y-3 mb-4">
          {similar_patterns.slice(0, 3).map((pattern, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-md bg-white/50 p-3"
            >
              <div className="mt-1 rounded-full bg-purple-200 p-1">
                <TrendingUp className="h-3.5 w-3.5 text-purple-700" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {pattern.pattern}
                </p>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <span className="text-xs text-gray-600">
                    Found in <strong>{pattern.frequency}</strong> similar
                    reports
                  </span>
                  <span className="inline-block rounded-full bg-purple-200 px-2 py-0.5 text-xs font-semibold text-purple-800">
                    {Math.round(pattern.confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {matching_templates.length > 0 && (
        <div className="rounded-md bg-white/50 p-3 border border-purple-200">
          <div className="flex items-start gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-purple-700 mt-0.5" />
            <p className="text-xs font-medium text-purple-900">
              Known Scam Template Match
            </p>
          </div>
          <div className="space-y-1">
            {matching_templates.map((template, index) => (
              <p
                key={index}
                className="text-xs text-gray-700 italic line-clamp-2"
              >
                &quot;{template}&quot;
              </p>
            ))}
          </div>
        </div>
      )}

      {similar_patterns.length > 0 && (
        <div className="mt-4 pt-4 border-t border-purple-200">
          <p className="text-xs text-purple-800">
            <strong>{totalMatches}</strong> similar indicators found in database
          </p>
        </div>
      )}
    </div>
  );
};
