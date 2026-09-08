"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { FileText, Search, Filter, ShieldAlert } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { getBackendUrl } from "@/lib/apiConfig";
import { getStoredToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

  const fetchReports = async () => {
    try {
      const token = getStoredToken();
      // Fetch investigations which act as our reports
      const res = await fetch(`${getBackendUrl()}/api/investigations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((inv: any) => ({
          id: inv.investigationId || inv._id,
          verdict: inv.finalDecision || "INCONCLUSIVE",
          riskScore: inv.riskScore ?? "—",
          createdAt: new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          status: inv.state === "COMPLETED" ? "COMPLETE" : inv.state || "PENDING",
          jobTitle: inv.jobData?.jobTitle || "Unknown Entity"
        }));
        setReports(mapped);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
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

  const getVerdictBadge = (verdict: string) => {
    switch (verdict.toUpperCase()) {
      case "SCAM":
      case "MALICIOUS":
        return <span className="badge-critical">{verdict}</span>;
      case "SUSPICIOUS":
        return <span className="badge-high">{verdict}</span>;
      case "SAFE":
      case "LEGITIMATE":
        return <span className="badge-safe">{verdict}</span>;
      default:
        return <span className="badge-info">{verdict}</span>;
    }
  };

  return (
    <RoleGuard allowedRoles={["ANALYST", "ADMIN"]}>
      <div className="flex h-screen bg-background text-foreground font-sans selection:bg-primary/30">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar />
          <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
            <div className="max-w-6xl mx-auto space-y-8">
              
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-light text-white tracking-tight">Intelligence Reports</h1>
                  <p className="text-sm font-medium text-primary uppercase tracking-widest mt-2">Forensic Analysis Archive</p>
                </div>
              </header>

              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search reports by ID or entity..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface-elevated border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-surface-elevated border border-slate-800 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-colors">
                    <span>Risk</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-surface-elevated border border-slate-800 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-colors">
                    <span>Date</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-surface-elevated border border-slate-800 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-colors">
                    <Filter className="h-4 w-4" />
                    <span>Status</span>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-surface-elevated rounded-lg w-full"></div>
                  ))}
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="bg-surface-elevated border border-slate-800 rounded-xl p-8">
                  <EmptyState 
                    icon={FileText}
                    title="NO INTELLIGENCE REPORTS"
                    description="No completed investigations are available yet in the forensic archive."
                    action={
                      <Link href="/investigate" className="inline-flex items-center justify-center px-6 py-2.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:border-primary/30 rounded-lg font-medium text-sm transition-all tracking-wide">
                        <ShieldAlert className="w-4 h-4 mr-2" />
                        RUN THREAT SCAN
                      </Link>
                    }
                  />
                </div>
              ) : (
                <div className="bg-surface-elevated border border-slate-800 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-surface border-b border-slate-800 text-slate-400">
                        <tr>
                          <th className="px-6 py-4 font-medium tracking-wider text-xs uppercase">Report ID</th>
                          <th className="px-6 py-4 font-medium tracking-wider text-xs uppercase">Entity</th>
                          <th className="px-6 py-4 font-medium tracking-wider text-xs uppercase">Verdict</th>
                          <th className="px-6 py-4 font-medium tracking-wider text-xs uppercase text-right">Risk</th>
                          <th className="px-6 py-4 font-medium tracking-wider text-xs uppercase">Created</th>
                          <th className="px-6 py-4 font-medium tracking-wider text-xs uppercase text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {filteredReports.map((report) => (
                          <tr 
                            key={report.id} 
                            onClick={() => router.push(`/investigations/${report.id}`)}
                            className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                          >
                            <td className="px-6 py-4">
                              <span className="font-mono font-medium text-slate-300 group-hover:text-primary transition-colors">
                                {report.id}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-300 max-w-[200px] truncate">
                              {report.jobTitle}
                            </td>
                            <td className="px-6 py-4">
                              {getVerdictBadge(report.verdict)}
                            </td>
                            <td className="px-6 py-4 text-right text-white font-mono">
                              {report.riskScore}
                            </td>
                            <td className="px-6 py-4 text-slate-400">
                              {report.createdAt}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                                {report.status}
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
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}
