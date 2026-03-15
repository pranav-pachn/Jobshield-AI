import React from "react";
import { Globe, AlertTriangle, Clock, TrendingDown } from "lucide-react";

export interface DomainIntelligence {
  domain?: string;
  domain_age_days?: number;
  trust_score?: number;
  threat_level?: "low" | "medium" | "high";
  recently_registered?: boolean;
}

export interface DomainIntelligencePanelProps {
  domain_intelligence?: DomainIntelligence;
}

/**
 * DomainIntelligencePanel
 * Displays domain reputation and registration details
 * Scammers often use newly registered domains
 */
export const DomainIntelligencePanel: React.FC<
  DomainIntelligencePanelProps
> = ({ domain_intelligence }) => {
  if (!domain_intelligence?.domain) {
    return null;
  }

  const {
    domain,
    domain_age_days,
    trust_score,
    threat_level,
    recently_registered,
  } = domain_intelligence;

  const getThreatColor = (level?: string) => {
    switch (level) {
      case "high":
        return { bg: "bg-red-50", border: "border-red-200", text: "text-red-800" };
      case "medium":
        return { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-800" };
      case "low":
        return { bg: "bg-green-50", border: "border-green-200", text: "text-green-800" };
      default:
        return { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-800" };
    }
  };

  const threatColors = getThreatColor(threat_level);

  return (
    <div
      className={`rounded-lg border p-4 sm:p-6 ${threatColors.bg} ${threatColors.border}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <Globe className="h-5 w-5 text-gray-700" />
        <h3 className="font-semibold text-gray-900">Domain Intelligence</h3>
      </div>

      <div className="space-y-3">
        {/* Domain */}
        <div className="rounded-md bg-white/50 p-3">
          <p className="text-xs font-medium text-gray-600">Domain</p>
          <p className="text-sm font-semibold text-gray-900 mt-1 break-all">
            {domain}
          </p>
        </div>

        {/* Domain Age */}
        {domain_age_days !== undefined && (
          <div className="rounded-md bg-white/50 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <p className="text-xs font-medium text-gray-600">Domain Age</p>
              </div>
              {recently_registered && (
                <span className="inline-block rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
                  ⚠️ Recently Registered
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {domain_age_days % 30 === 0
                ? `${Math.floor(domain_age_days / 30)} months old`
                : `${domain_age_days} days old`}
            </p>
            {domain_age_days < 90 && (
              <p className="text-xs text-red-700 mt-1">
                ⚠️ New domains are often used in scams
              </p>
            )}
          </div>
        )}

        {/* Trust Score */}
        {trust_score !== undefined && (
          <div className="rounded-md bg-white/50 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-gray-600">Trust Score</p>
              <span
                className={`inline-block rounded-full px-3 py-1 text-sm font-bold ${
                  trust_score >= 70
                    ? "bg-green-100 text-green-800"
                    : trust_score >= 40
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {trust_score}/100
              </span>
            </div>
          </div>
        )}

        {/* Threat Level */}
        {threat_level && (
          <div className="rounded-md bg-white/50 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-gray-600" />
                <p className="text-xs font-medium text-gray-600">
                  Threat Level
                </p>
              </div>
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase ${
                  threat_level === "high"
                    ? "bg-red-100 text-red-800"
                    : threat_level === "medium"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-green-100 text-green-800"
                }`}
              >
                {threat_level}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
