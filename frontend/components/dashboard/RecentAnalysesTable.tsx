"use client";

import { useEffect, useState } from "react";
import { Clock, AlertTriangle, ShieldCheck, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        setError("Failed to load recent analyses");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getRiskStyle = (level: string) => {
    switch (level) {
      case "High":
        return "bg-destructive/10 text-destructive border-destructive/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]";
      case "Medium":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]";
      case "Low":
        return "bg-green-500/10 text-green-600 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "High":
      case "Medium":
        return <AlertTriangle className="h-3 w-3" />;
      case "Low":
        return <ShieldCheck className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateText = (text: string, maxLength: number = 80) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <Clock className="h-5 w-5 text-green-400" />
          Recent Analyses
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center opacity-80 animate-in fade-in duration-500">
            <div className="h-10 w-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-muted-foreground">Loading recent analyses...</p>
          </div>
        ) : error ? (
          <div className="h-96 flex items-center justify-center text-muted-foreground">
            {error}
          </div>
        ) : analyses && analyses.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Timestamp</TableHead>
                  <TableHead className="text-muted-foreground">Risk Level</TableHead>
                  <TableHead className="text-muted-foreground">Scam Probability</TableHead>
                  <TableHead className="text-muted-foreground">Job Text Preview</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyses.map((analysis) => (
                  <TableRow
                    key={analysis.id}
                    className="border-border/30 hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(analysis.timestamp)}
                    </TableCell>
                    <TableCell>
                      <div
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
                          getRiskStyle(analysis.risk_level)
                        )}
                      >
                        {getRiskIcon(analysis.risk_level)}
                        {analysis.risk_level}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold">
                          {(analysis.scam_probability * 100).toFixed(1)}%
                        </span>
                        <div
                          className={cn(
                            "w-16 h-2 rounded-full",
                            analysis.scam_probability >= 0.7
                              ? "bg-red-500/30"
                              : analysis.scam_probability >= 0.4
                              ? "bg-yellow-500/30"
                              : "bg-green-500/30"
                          )}
                        >
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              analysis.scam_probability >= 0.7
                                ? "bg-red-500"
                                : analysis.scam_probability >= 0.4
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            )}
                            style={{
                              width: `${analysis.scam_probability * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="group relative flex items-center gap-2">
                        <span
                          className="text-xs text-muted-foreground cursor-help"
                          title={analysis.job_text_preview}
                        >
                          {truncateText(analysis.job_text_preview)}
                        </span>
                        <button
                          onClick={() =>
                            handleCopy(analysis.job_text_preview, analysis.id)
                          }
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                          title="Copy full text"
                        >
                          {copied === analysis.id ? (
                            <Check className="h-3 w-3 text-green-400" />
                          ) : (
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {analyses.length > 0 && (
              <div className="mt-4 text-xs text-muted-foreground text-center">
                Showing {analyses.length} recent analyses
              </div>
            )}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center opacity-80 animate-in fade-in zoom-in-95 duration-500">
            <div className="h-16 w-16 rounded-full border border-dashed border-white/20 bg-white/[2%] flex items-center justify-center mb-5 shadow-inner">
              <Clock className="h-6 w-6 text-muted-foreground/70" />
            </div>
            <h3 className="text-lg font-semibold text-foreground tracking-tight">No Recent Analyses</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-2 leading-relaxed">
              Your recent scan history will appear here once you analyze job postings or recruiters.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
