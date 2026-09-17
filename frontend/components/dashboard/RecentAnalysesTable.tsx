"use client";

import { useEffect, useState } from "react";
import { Clock, AlertTriangle, ShieldCheck, Copy, Check, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchRecentAnalyses } from "@/lib/dashboardApi";
import { RecentAnalysis } from "@/lib/dashboardTypes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export function RecentAnalysesTableComponent() {
  const [analyses, setAnalyses] = useState<RecentAnalysis[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchRecentAnalyses();
        setAnalyses(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch recent analyses:", err);
        setError("Unable to load recent analyses at this time.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getRiskBadge = (level: string) => {
    switch (level?.toLowerCase()) {
      case "high":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-sans font-medium bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertTriangle className="h-3 w-3" />
            High Risk
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-sans font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="h-3 w-3" />
            Moderate Risk
          </span>
        );
      case "low":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-sans font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="h-3 w-3" />
            Looks Safe
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-sans font-medium bg-slate-800 text-slate-300 border border-slate-700">
            {level || "Evaluated"}
          </span>
        );
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Recently";
    }
  };

  const truncateText = (text: string, maxLength: number = 75) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <Card className="border-slate-800/80 bg-surface-elevated rounded-lg shadow-sm">
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800/40">
                <Skeleton className="h-4 w-24 bg-slate-800" />
                <Skeleton className="h-4 w-20 bg-slate-800" />
                <Skeleton className="h-4 w-12 bg-slate-800" />
                <Skeleton className="h-4 w-48 bg-slate-850" />
                <Skeleton className="h-4 w-14 bg-slate-800" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-slate-400 font-sans">
            {error}
          </div>
        ) : analyses && analyses.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 bg-surface hover:bg-transparent">
                  <TableHead className="text-slate-400 font-sans text-[11px] uppercase tracking-wider font-semibold py-3 px-5">Timestamp</TableHead>
                  <TableHead className="text-slate-400 font-sans text-[11px] uppercase tracking-wider font-semibold py-3 px-5">Verdict</TableHead>
                  <TableHead className="text-slate-400 font-sans text-[11px] uppercase tracking-wider font-semibold py-3 px-5">Risk Probability</TableHead>
                  <TableHead className="text-slate-400 font-sans text-[11px] uppercase tracking-wider font-semibold py-3 px-5">Opportunity Snippet</TableHead>
                  <TableHead className="text-slate-400 font-sans text-[11px] uppercase tracking-wider font-semibold py-3 px-5 text-right">Report</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-800/50">
                {analyses.map((analysis) => (
                  <TableRow
                    key={analysis.id}
                    className="border-slate-800/40 hover:bg-slate-800/30 transition-colors"
                  >
                    <TableCell className="text-xs text-slate-400 font-mono py-3.5 px-5 whitespace-nowrap">
                      {formatDate(analysis.timestamp)}
                    </TableCell>
                    <TableCell className="py-3.5 px-5 whitespace-nowrap">
                      {getRiskBadge(analysis.risk_level)}
                    </TableCell>
                    <TableCell className="py-3.5 px-5 whitespace-nowrap">
                      <div className="flex items-center gap-2 font-mono text-xs text-slate-200">
                        <span>{Math.round(analysis.scam_probability * 100)}%</span>
                        <div className="w-12 h-1.5 rounded-full bg-slate-850 overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              analysis.scam_probability >= 0.7
                                ? "bg-red-500"
                                : analysis.scam_probability >= 0.4
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            )}
                            style={{
                              width: `${analysis.scam_probability * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 px-5">
                      <div className="group relative flex items-center gap-2 max-w-[180px] sm:max-w-[250px] lg:max-w-[300px]">
                        <span
                          className="text-xs text-slate-300 font-sans truncate"
                          title={analysis.job_text_preview}
                        >
                          {truncateText(analysis.job_text_preview, 50)}
                        </span>
                        <button
                          onClick={() =>
                            handleCopy(analysis.job_text_preview, analysis.id)
                          }
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-800 rounded text-slate-400"
                          title="Copy text snippet"
                        >
                          {copied === analysis.id ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-3.5 px-5 whitespace-nowrap">
                      <Link
                        href={`/investigations/${analysis.id}`}
                        className="inline-flex items-center gap-1 text-xs font-sans text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        View
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-14 flex flex-col items-center justify-center text-center px-4">
            <div className="h-12 w-12 rounded-full border border-slate-800 bg-surface flex items-center justify-center mb-3 text-slate-400">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-base font-serif text-slate-100">No recent analyses</h3>
            <p className="text-xs text-slate-400 font-sans max-w-sm mt-1 mb-4">
              Analyze a job posting to track and review intelligence records.
            </p>
            <Link href="/investigate">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs font-sans">
                Analyze a Job →
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
