import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp,
  PieChart,
  BarChart3,
  Clock
} from "lucide-react";

const reports = [
  {
    id: 1,
    name: "Weekly Threat Summary",
    type: "threat",
    generated: "Mar 14, 2026",
    period: "Mar 7 - Mar 14",
    size: "2.4 MB",
  },
  {
    id: 2,
    name: "Monthly Analysis Report",
    type: "analysis",
    generated: "Mar 1, 2026",
    period: "February 2026",
    size: "5.8 MB",
  },
  {
    id: 3,
    name: "Scam Campaign Intelligence",
    type: "campaign",
    generated: "Mar 10, 2026",
    period: "Q1 2026",
    size: "3.2 MB",
  },
  {
    id: 4,
    name: "Domain Risk Assessment",
    type: "domain",
    generated: "Mar 12, 2026",
    period: "Last 30 days",
    size: "1.9 MB",
  },
];

const reportStats = [
  { label: "Reports Generated", value: 47, icon: FileText, trend: "+12 this month" },
  { label: "Data Analyzed", value: "2.4 TB", icon: BarChart3, trend: "+340 GB" },
  { label: "Avg Generation Time", value: "4.2s", icon: Clock, trend: "-0.8s improvement" },
];

export default function ReportsPage() {
  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            Reports
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            Intelligence Reports
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Access automated threat reports, analysis summaries, and exportable intelligence data.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          {reportStats.map((stat) => (
            <Card key={stat.label} className="border-border bg-card glass-card glass-card-hover">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                    <p className="text-xs text-primary mt-2">{stat.trend}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Generate Report */}
        <Card className="border-border bg-card glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <PieChart className="h-5 w-5" />
              Generate New Report
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Create custom reports based on your analysis needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-border hover:bg-accent">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>Threat Summary</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-border hover:bg-accent">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span>Analysis Report</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-border hover:bg-accent">
                <PieChart className="h-5 w-5 text-primary" />
                <span>Risk Assessment</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-border hover:bg-accent">
                <FileText className="h-5 w-5 text-primary" />
                <span>Custom Report</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card className="border-border bg-card glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Clock className="h-5 w-5" />
              Recent Reports
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Your generated reports and intelligence exports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-accent/30 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{report.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{report.period}</span>
                        <Badge variant="secondary" className="text-[10px]">{report.type}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{report.generated}</p>
                      <p className="text-xs text-muted-foreground">{report.size}</p>
                    </div>
                    <Button size="sm" variant="outline" className="border-border hover:bg-accent">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
