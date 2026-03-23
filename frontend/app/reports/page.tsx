"use client";

import { useState } from "react";
import { FileText, Download, Share2, Trash2, Plus, Eye, Filter } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  const [reports, setReports] = useState<Report[]>([
    {
      id: "report_001",
      jobTitle: "Senior Software Engineer",
      companyName: "TechCorp Inc.",
      riskLevel: "High",
      createdAt: "2024-03-14",
      format: "pdf",
      downloads: 3,
    },
    {
      id: "report_002",
      jobTitle: "Data Analyst",
      companyName: "Global Services Ltd.",
      riskLevel: "Medium",
      createdAt: "2024-03-13",
      format: "pdf",
      downloads: 1,
    },
    {
      id: "report_003",
      jobTitle: "Marketing Manager",
      companyName: "StartupXYZ",
      riskLevel: "Low",
      createdAt: "2024-03-12",
      format: "html",
      downloads: 0,
    },
  ]);

  const [filterLevel] = useState<string>("all");

  const filteredReports = reports.filter((report) =>
    filterLevel === "all" ? true : report.riskLevel.toLowerCase() === filterLevel.toLowerCase()
  );

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "high":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "low":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
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
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  Reports
                </h1>
                <p className="text-muted-foreground">
                  Manage and download your analysis reports
                </p>
              </div>
            </div>
          </div>
          <Button
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Report
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
              <Card key={index} className="glass-card border border-white/10">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {stat.value}
                      </p>
                    </div>
                    <Icon className="h-8 w-8 text-primary/30" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Reports List */}
        <Card className="glass-card border border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Reports</CardTitle>
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
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No reports found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 flex-shrink-0">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {report.jobTitle}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {report.companyName}
                          </p>
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
        <Card className="glass-card border border-white/10">
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
                  className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
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
