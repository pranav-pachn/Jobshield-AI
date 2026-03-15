import React from "react";
import { Users, MessageCircle } from "lucide-react";

export interface CommunityReportsPanelProps {
  community_report_count?: number;
}

/**
 * CommunityReportsPanel
 * Shows how many users have flagged similar job offers
 * Community validation increases confidence
 */
export const CommunityReportsPanel: React.FC<CommunityReportsPanelProps> = ({
  community_report_count = 0,
}) => {
  if (!community_report_count || community_report_count === 0) {
    return null;
  }

  const isHighCount = community_report_count >= 10;

  return (
    <div className="rounded-xl border border-red-500/40 bg-gradient-to-br from-red-900/20 to-red-900/10 backdrop-blur-xl p-6 sm:p-8 hover:border-red-500/60 transition-all group">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/40">
          <Users className="h-5 w-5 text-red-400" />
        </div>
        <div>
          <h3 className="font-bold text-white text-lg">Community Reports</h3>
          <p className="text-xs text-red-200/60 mt-0.5">Real users flagging similar offers</p>
        </div>
      </div>

      {/* Main Report Count */}
      <div className="rounded-lg border border-red-500/20 bg-gradient-to-br from-red-500/10 to-red-600/5 backdrop-blur-sm p-6 text-center mb-4 hover:border-red-500/40 transition-all">
        <div className="flex items-center justify-center gap-4 mb-3">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-md" />
            <MessageCircle className="h-8 w-8 text-red-400 relative" />
          </div>
          <span className="text-5xl font-black text-red-300">{community_report_count}</span>
        </div>

        <p className="text-sm font-semibold text-gray-200">
          {community_report_count === 1
            ? "1 community member"
            : `${community_report_count} community members`}{" "}
          <span className="text-red-300">flagged </span>similar offers
        </p>

        {isHighCount && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/15 border border-red-500/30">
            <p className="text-xs font-bold text-red-200 flex items-center gap-2 justify-center">
              <span className="text-lg">⚠️</span>
              High volume confirms known scam pattern
            </p>
          </div>
        )}
      </div>

      {/* Validation Message */}
      <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-4">
        <p className="text-xs font-semibold text-gray-300">
          ✓ Community validation <span className="text-green-300">strengthens confidence</span> in this detection
        </p>
      </div>
    </div>
  );
};
