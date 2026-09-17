"use client";

import { useState, useEffect } from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { FileText, Search, ArrowRight, ShieldAlert } from "lucide-react";
import { getBackendUrl } from "@/lib/apiConfig";
import { getStoredToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface Report {
  id: string;
  verdict: string;
  riskScore: number | string;
  createdAt: string;
  status: string;
  jobTitle: string;
}

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const token = getStoredToken();
      const res = await fetch(`${getBackendUrl()}/api/investigations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error("Unable to retrieve reports archive");
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        const mapped = data.map((inv: any) => ({
          id: inv.investigationId || inv._id || "INV-UNKNOWN",
          verdict: inv.finalDecision?.verdict || inv.finalDecision || inv.verdict || "INCONCLUSIVE",
          riskScore: typeof inv.finalDecision?.riskScore === "number" ? Math.round(inv.finalDecision.riskScore) : (inv.riskScore ?? "—"),
          createdAt: inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Recently",
          status: inv.state === "COMPLETED" ? "COMPLETE" : inv.state || "PENDING",
          jobTitle: inv.jobData?.jobTitle || inv.input?.jobText?.slice(0, 40) || "Job Opportunity Scan"
        }));
        setReports(mapped);
      }
    } catch (error) {
      setFetchError("Unable to load investigation reports archive at this time.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter((report) => 
    report.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderVerdictBadge = (verdict: string) => {
    const v = String(verdict).toUpperCase();
    if (v.includes("HIGH") || v === "CRITICAL" || v === "SCAM") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-sans font-medium bg-red-500/10 text-red-400 border border-red-500/20">
          High Risk
        </span>
      );
    }
    if (v.includes("MEDIUM") || v === "MODERATE" || v === "SUSPICIOUS") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-sans font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
          Moderate Risk
        </span>
      );
    }
    if (v.includes("LOW") || v === "SAFE" || v === "LEGITIMATE") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-sans font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Looks Safe
        </span>
      );
    }
    if (v.includes("REVIEW")) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-sans font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30">
          Human Review
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-sans font-medium bg-slate-800 text-slate-300 border border-slate-700">
        Needs Review
      </span>
    );
  };

  return (
    <AuthGuard>
      <div className="flex-1 space-y-8 p-6 md:p-10 bg-background min-h-screen max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <h1 className="text-3xl font-serif text-slate-100 tracking-tight">Investigation Reports</h1>
            <p className="text-sm text-slate-400 font-sans mt-1">
              Archived forensic records, multi-agent evaluations, and historical decision telemetry.
            </p>
          </div>

          <Link
            href="/investigate"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-medium transition-colors shadow-sm self-start sm:self-auto"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            New Investigation
          </Link>
        </header>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter reports by ID, job role, or company entity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-elevated border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/60 font-sans transition-colors"
          />
        </div>

        {fetchError && (
          <div className="p-4 rounded-lg bg-red-950/30 border border-red-900/50 text-red-400 text-xs font-sans flex items-center justify-between">
            <span>{fetchError}</span>
            <button onClick={fetchReports} className="underline hover:text-red-300 font-medium">
              Retry
            </button>
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 rounded-lg bg-surface-elevated border border-slate-800/80 flex items-center justify-between gap-4">
                <Skeleton className="h-4 w-28 bg-slate-800" />
                <Skeleton className="h-4 w-48 bg-slate-850" />
                <Skeleton className="h-4 w-20 bg-slate-800" />
                <Skeleton className="h-4 w-12 bg-slate-850" />
              </div>
            ))}
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-surface-elevated border border-slate-800/80 rounded-xl p-12 text-center">
            <div className="p-3 bg-slate-800/50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-base font-serif text-slate-200 mb-1">No investigations yet</h3>
            <p className="text-xs text-slate-400 font-sans max-w-sm mx-auto mb-5">
              Run your first investigation to populate the intelligence archive.
            </p>
            <Link
              href="/investigate"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-medium transition-colors"
            >
              Analyze a Job →
            </Link>
          </div>
        ) : (
          <div className="bg-surface-elevated border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-surface border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="px-5 py-3.5 font-sans font-semibold uppercase tracking-wider text-[11px]">Verdict</th>
                    <th className="px-5 py-3.5 font-sans font-semibold uppercase tracking-wider text-[11px]">Entity / Role</th>
                    <th className="px-5 py-3.5 font-sans font-semibold uppercase tracking-wider text-[11px]">Investigation ID</th>
                    <th className="px-5 py-3.5 font-sans font-semibold uppercase tracking-wider text-[11px] text-right">Risk Score</th>
                    <th className="px-5 py-3.5 font-sans font-semibold uppercase tracking-wider text-[11px]">Date</th>
                    <th className="px-5 py-3.5 font-sans font-semibold uppercase tracking-wider text-[11px] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 font-sans">
                  {filteredReports.map((report) => (
                    <tr 
                      key={report.id} 
                      onClick={() => router.push(`/investigations/${report.id}`)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-3.5">
                        {renderVerdictBadge(report.verdict)}
                      </td>
                      <td className="px-5 py-3.5 text-slate-200 font-medium max-w-[240px] truncate">
                        {report.jobTitle}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[11px] text-slate-400">
                        {report.id.length > 18 ? `${report.id.slice(0, 18)}...` : report.id}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-medium text-slate-100">
                        {typeof report.riskScore === "number" ? `${report.riskScore}/100` : report.riskScore}
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 text-[11px]">
                        {report.createdAt}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="inline-flex items-center gap-1 text-xs text-blue-400 group-hover:text-blue-300 transition-colors">
                          View
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
