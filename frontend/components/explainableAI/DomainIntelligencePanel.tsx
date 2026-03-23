import React from "react";
import { Globe, AlertTriangle, Clock, Shield } from "lucide-react";

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
 * Displays domain reputation and registration details with enhanced UI
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
        return { 
          bg: "bg-gradient-to-br from-red-50 to-red-100", 
          border: "border-red-200", 
          text: "text-red-800",
          icon: "bg-red-500 text-white"
        };
      case "medium":
        return { 
          bg: "bg-gradient-to-br from-orange-50 to-orange-100", 
          border: "border-orange-200", 
          text: "text-orange-800",
          icon: "bg-orange-500 text-white"
        };
      case "low":
        return { 
          bg: "bg-gradient-to-br from-green-50 to-green-100", 
          border: "border-green-200", 
          text: "text-green-800",
          icon: "bg-green-500 text-white"
        };
      default:
        return { 
          bg: "bg-gradient-to-br from-gray-50 to-gray-100", 
          border: "border-gray-200", 
          text: "text-gray-800",
          icon: "bg-gray-500 text-white"
        };
    }
  };

  const formatDomainAge = (days?: number) => {
    if (!days) return "Unknown";
    
    if (days >= 365) {
      const years = Math.floor(days / 365);
      const remainingDays = days % 365;
      return `${years} year${years > 1 ? 's' : ''}${remainingDays > 0 ? `, ${remainingDays} day${remainingDays > 1 ? 's' : ''}` : ''}`;
    } else if (days >= 30) {
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      return `${months} month${months > 1 ? 's' : ''}${remainingDays > 0 ? `, ${remainingDays} day${remainingDays > 1 ? 's' : ''}` : ''}`;
    } else {
      return `${days} day${days > 1 ? 's' : ''}`;
    }
  };

  const getDomainAgeColor = (days?: number) => {
    if (!days) return "text-gray-500";
    if (days >= 365) return "text-green-700";
    if (days >= 90) return "text-yellow-700";
    return "text-red-700";
  };

  const getTrustScoreColor = (score?: number) => {
    if (!score) return "text-gray-500";
    if (score >= 70) return "text-green-700";
    if (score >= 40) return "text-yellow-700";
    return "text-red-700";
  };

  const threatColors = getThreatColor(threat_level);

  return (
    <div
      className={`rounded-xl border p-6 ${threatColors.bg} ${threatColors.border} shadow-sm transition-all duration-200 hover:shadow-md`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2.5 rounded-full ${threatColors.icon}`}>
          <Globe className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Domain Intelligence</h3>
          <p className="text-sm text-gray-600">Security analysis of domain reputation</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Domain */}
        <div className="rounded-lg bg-white/70 p-4 border border-white/50">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-4 w-4 text-gray-600" />
            <p className="text-sm font-semibold text-gray-700">Domain</p>
          </div>
          <p className="text-base font-bold text-gray-900 break-all">
            {domain}
          </p>
        </div>

        {/* Domain Age */}
        {domain_age_days !== undefined && (
          <div className="rounded-lg bg-white/70 p-4 border border-white/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <p className="text-sm font-semibold text-gray-700">Domain Age</p>
              </div>
              {recently_registered && (
                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Recently Registered
                </span>
              )}
            </div>
            <p className={`text-base font-bold ${getDomainAgeColor(domain_age_days)}`}>
              {formatDomainAge(domain_age_days)}
            </p>
            {domain_age_days < 90 && (
              <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                New domains are often used in scams
              </p>
            )}
          </div>
        )}

        {/* Trust Score */}
        {trust_score !== undefined && (
          <div className="rounded-lg bg-white/70 p-4 border border-white/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-600" />
                <p className="text-sm font-semibold text-gray-700">Trust Score</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      trust_score >= 70 ? 'bg-green-500' : 
                      trust_score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${trust_score}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className={`text-base font-bold ${getTrustScoreColor(trust_score)}`}>
                {trust_score}/100
              </p>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${
                  trust_score >= 70
                    ? "bg-green-100 text-green-800"
                    : trust_score >= 40
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {trust_score >= 70 ? "High" : trust_score >= 40 ? "Medium" : "Low"}
              </span>
            </div>
          </div>
        )}

        {/* Threat Level */}
        {threat_level && (
          <div className="rounded-lg bg-white/70 p-4 border border-white/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-gray-600" />
                <p className="text-sm font-semibold text-gray-700">Threat Level</p>
              </div>
              <div className={`p-1.5 rounded-full ${threatColors.icon}`}>
                <AlertTriangle className="h-3 w-3" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className={`text-base font-bold ${threatColors.text}`}>
                {threat_level.charAt(0).toUpperCase() + threat_level.slice(1)}
              </p>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold uppercase ${threatColors.text} ${threatColors.bg.replace('bg-', 'bg-opacity-20 bg-')}`}
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
