"use client";

import { useState } from "react";
import { FileText, Download, Share2, Trash2, Plus, Eye, Filter } from "lucide-react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getBackendUrl } from "@/lib/apiConfig";
import { getStoredToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface Report {
  id: string;
  jobTitle: string;
  companyName: string;
  riskLevel: string;
  createdAt: string;
  format: "pdf" | "html" | "json";
  downloads: number;
}

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const token = getStoredToken();
      // Assuming a GET /api/investigations endpoint exists to list recent analyses
      // Or we can fall back to a mock if it doesn't exist, but we should try fetching.
      const res = await fetch(`${getBackendUrl()}/api/investigate/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((inv: any) => ({
          id: inv.investigationId || inv._id,
          jobTitle: inv.input?.jobText?.substring(0, 30) || "Unknown Job",
          companyName: inv.input?.company || "Unknown Company",
          riskLevel: inv.evaluation?.overall_risk?.level || "Medium",
          createdAt: new Date(inv.createdAt).toISOString().split('T')[0],
          format: "html",
          downloads: 0
        }));
        setReports(mapped);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  import("react").then((React) => {
    React.useEffect(() => {
      fetchReports();
    }, []);
  });

  const [filterLevel] = useState<string>("all");

  const filteredReports = reports.filter((report) =>
    filterLevel === "all" ? true : report.riskLevel.toLowerCase() === filterLevel.toLowerCase()
  );

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "high":
        return "bg-red-500/10 text-red-500 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]";
      case "low":
        return "bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/30 shadow-[0_0_10px_rgba(0,255,136,0.2)]";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  };

  const handleDownload = (reportId: string) => {
    console.log("Downloading report:", reportId);
    // Integration with backend API
  };

  const handleShare = (reportId: string) => {
    console.log("Sharing report:", reportId);
    // Integration with share functionality
  };

  const handleDelete = (reportId: string) => {
    setReports(reports.filter((r) => r.id !== reportId));
  };

  return (
    <AuthGuard>
      <div className="flex w-full flex-col gap-8">
        {/* Page Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-100">
                  Threat Investigation Reports
                </h1>
                <p className="text-slate-400">
                  Investigation logs, forensic data, and detailed intelligence reports
                </p>
              </div>
            </div>
          </div>
          <Button
            className="bg-[#00ff88] hover:bg-[#00cc6a] text-black font-bold tracking-wide"
          >
            <Plus className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total Reports", value: reports.length, icon: FileText },
            { label: "High Risk", value: reports.filter((r) => r.riskLevel === "High").length, icon: FileText },
            { label: "Medium Risk", value: reports.filter((r) => r.riskLevel === "Medium").length, icon: FileText },
            { label: "Total Downloads", value: reports.reduce((sum, r) => sum + r.downloads, 0), icon: Download },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="glass-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">{stat.label}</p>
                      <p className="text-2xl font-bold font-mono text-slate-100 mt-1">
                        {stat.value}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Reports List */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Investigation Log</CardTitle>
                <CardDescription>
                  {filteredReports.length} report{filteredReports.length !== 1 ? "s" : ""} found
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredReports.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center opacity-80 animate-in fade-in zoom-in-95 duration-500">
                <div className="h-20 w-20 rounded-full border border-dashed border-white/20 bg-white/[2%] flex items-center justify-center mb-6 shadow-inner">
                  <FileText className="h-8 w-8 text-muted-foreground/70" />
                </div>
                <h3 className="text-xl font-semibold text-foreground tracking-tight">No Reports Found</h3>
                <p className="text-sm text-muted-foreground max-w-md mt-3 leading-relaxed">
                  You haven't generated any reports yet, or none match your current filters.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-5 rounded-lg bg-[#0b1220] border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 flex-shrink-0 shadow-[0_0_12px_rgba(59,130,246,0.15)]">
                          <FileText className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0 flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-slate-500">
                            #JS-{report.id.replace("report_", "")}
                          </span>
                          <div>
                            <p className="font-medium text-slate-200 truncate">
                              {report.jobTitle}
                            </p>
                            <p className="text-sm text-slate-400 truncate">
                              {report.companyName}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={getRiskLevelColor(report.riskLevel)}
                        >
                          {report.riskLevel} Risk
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {report.createdAt}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Format: {report.format.toUpperCase()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {report.downloads} download{report.downloads !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        title="View"
                        onClick={() => router.push(`/investigations/${report.id}`)}
                        className="hover:bg-white/10"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Download"
                        onClick={() => handleDownload(report.id)}
                        className="hover:bg-white/10"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Share"
                        onClick={() => handleShare(report.id)}
                        className="hover:bg-white/10"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Delete"
                        onClick={() => handleDelete(report.id)}
                        className="hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Export & Sharing</CardTitle>
            <CardDescription>
              Options for exporting and sharing your analysis reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  format: "PDF",
                  description: "Professional PDF format with all details",
                  icon: "📄",
                },
                {
                  format: "HTML",
                  description: "Interactive HTML with styling",
                  icon: "🌐",
                },
                {
                  format: "JSON",
                  description: "Raw JSON data for integrations",
                  icon: "{}",
                },
              ].map((option, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-[#0b1220] border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  <div className="text-2xl mb-2">{option.icon}</div>
                  <p className="font-medium text-foreground mb-1">
                    {option.format}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
