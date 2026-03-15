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
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-red-600" />
        <h3 className="font-semibold text-red-900">Community Reports</h3>
      </div>

      <div className="rounded-md bg-white/50 p-4 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <MessageCircle className="h-6 w-6 text-red-600" />
          <span className="text-3xl font-bold text-red-700">
            {community_report_count}
          </span>
        </div>

        <p className="text-sm font-medium text-gray-900">
          {community_report_count === 1
            ? "1 user flagged"
            : `${community_report_count} users flagged`}{" "}
          similar job offers
        </p>

        {isHighCount && (
          <p className="text-xs text-red-700 mt-2">
            ⚠️ High number of reports confirms this is a known scam pattern
          </p>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-red-200">
        <p className="text-xs text-red-800">
          This community validation strengthens our confidence in this detection
        </p>
      </div>
    </div>
  );
};
