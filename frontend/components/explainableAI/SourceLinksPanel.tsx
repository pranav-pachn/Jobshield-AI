import React from "react";
import { ExternalLink, BookOpen } from "lucide-react";

export interface SourceLink {
  title: string;
  url: string;
  category: string;
}

export interface SourceLinksPanelProps {
  source_links?: SourceLink[];
  risk_level?: "Low" | "Medium" | "High";
}

/**
 * SourceLinksPanel
 * Provides educational resources and official warnings
 * Links to FTC, consumer protection agencies, and expert articles
 */
export const SourceLinksPanel: React.FC<SourceLinksPanelProps> = ({
  source_links = [],
  risk_level = "Medium",
}) => {
  if (!source_links || source_links.length === 0) {
    return null;
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Government":
        return "bg-blue-100 text-blue-800";
      case "Consumer Guide":
        return "bg-green-100 text-green-800";
      case "Social Media":
        return "bg-purple-100 text-purple-800";
      case "Platform Scams":
        return "bg-orange-100 text-orange-800";
      case "Take Action":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="h-5 w-5 text-indigo-600" />
        <h3 className="font-semibold text-indigo-900">Learn More</h3>
      </div>

      <div className="space-y-3">
        {source_links.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-md bg-white/50 p-3 hover:bg-white/70 transition-colors border border-indigo-100 hover:border-indigo-300"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="font-medium text-indigo-900 text-sm truncate">
                    {link.title}
                  </p>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${getCategoryColor(link.category)}`}
                  >
                    {link.category}
                  </span>
                </div>
                <p className="text-xs text-gray-600 truncate">{link.url}</p>
              </div>
              <ExternalLink className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-1" />
            </div>
          </a>
        ))}
      </div>

      {risk_level === "High" && (
        <div className="mt-4 pt-4 border-t border-indigo-200">
          <div className="rounded-md bg-red-50 border border-red-200 p-3">
            <p className="text-xs font-semibold text-red-900 mb-2">
              ⚠️ High-Risk Posting
            </p>
            <p className="text-xs text-red-800">
              Please report this to the FTC or the job platform if you have
              additional information.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
