import { ThreatIndicatorCard } from "./ThreatIndicatorCard";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ThreatResultsProps {
  indicators: any[];
  isLoading: boolean;
  pagination: {
    page: number;
    totalPages: number;
  } | null;
  onPageChange: (page: number) => void;
}

export function ThreatResults({ indicators, isLoading, pagination, onPageChange }: ThreatResultsProps) {
  if (isLoading && indicators.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-500" />
        <p>Loading threat intelligence...</p>
      </div>
    );
  }

  if (indicators.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <div className="bg-slate-800/50 p-6 rounded-full mb-4">
          <SearchIcon className="h-8 w-8 text-slate-500" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No indicators found</h3>
        <p>Try adjusting your search terms or filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {indicators.map((indicator) => (
          <ThreatIndicatorCard key={indicator._id} indicator={indicator} />
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-6">
          <Button 
            variant="outline" 
            className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-white"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            Previous
          </Button>
          <span className="text-slate-400 text-sm">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button 
            variant="outline" 
            className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-white"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function SearchIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
