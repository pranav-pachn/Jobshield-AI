import { ThreatIndicatorCard } from "./ThreatIndicatorCard";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="p-4 rounded-lg bg-surface-elevated border border-slate-800/80 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20 bg-slate-800" />
              <Skeleton className="h-4 w-12 bg-slate-800" />
            </div>
            <Skeleton className="h-6 w-3/4 bg-slate-850" />
            <Skeleton className="h-4 w-full bg-slate-800" />
          </div>
        ))}
      </div>
    );
  }

  if (indicators.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-lg border border-slate-800/80 bg-surface-elevated">
        <div className="p-3 bg-slate-850 rounded-full mb-3 text-slate-500">
          <Search className="h-6 w-6" />
        </div>
        <h3 className="text-base font-serif text-slate-200 mb-1">No indicators found</h3>
        <p className="text-xs text-slate-400 font-sans max-w-sm">
          No matching threat records found. Try modifying your search query or filter criteria.
        </p>
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
        <div className="flex justify-center items-center gap-4 pt-4">
          <Button 
            variant="outline" 
            size="sm"
            className="border-slate-800 bg-surface hover:bg-slate-850 text-slate-300 text-xs font-sans"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            Previous
          </Button>
          <span className="text-slate-400 text-xs font-mono">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button 
            variant="outline" 
            size="sm"
            className="border-slate-800 bg-surface hover:bg-slate-850 text-slate-300 text-xs font-sans"
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
