import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, AlertTriangle, ShieldCheck, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecentAnalysis {
  id: string;
  timestamp: string;
  risk_level: "High" | "Medium" | "Low";
  scam_probability: number;
  job_text?: string;
  suspicious_phrases?: string[];
}

interface RecentAnalysesTableProps {
  analyses: RecentAnalysis[];
}

export function RecentAnalysesTable({ analyses }: RecentAnalysesTableProps) {
  const getRiskStyle = (level: string) => {
    switch (level) {
      case "High":
        return "bg-destructive/10 text-destructive border-destructive/20 shadow-[0_0_10px_rgba(var(--destructive),0.1)]";
      case "Medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]";
      case "Low":
        return "bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]";
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

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (!analyses || analyses.length === 0) {
    return (
      <Card className="glass-card shadow-xl">
        <CardContent>
          <div className="flex h-32 items-center justify-center">
            <p className="text-muted-foreground">No recent analyses available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card shadow-xl overflow-hidden">
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-card">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-36">Time</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-32">Risk Level</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-28">Score</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Source Identity</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Indicators</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {analyses.map((analysis) => (
              <TableRow key={analysis.id} className="border-border transition-colors hover:bg-white/5">
                <TableCell className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    {formatDate(analysis.timestamp)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    className={cn("flex w-fit items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium", getRiskStyle(analysis.risk_level))}
                    variant="outline"
                  >
                    {getRiskIcon(analysis.risk_level)}
                    {analysis.risk_level}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className={cn(
                    "font-mono text-sm font-medium",
                    analysis.risk_level === 'High' ? 'text-destructive' :
                    analysis.risk_level === 'Medium' ? 'text-yellow-500' : 'text-green-500'
                  )}>
                    {Math.round(analysis.scam_probability * 100)}%
                  </span>
                </TableCell>
                <TableCell className="min-w-[250px] max-w-sm">
                  <div className="flex items-start gap-2 text-sm text-foreground/80">
                    <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="line-clamp-2 leading-relaxed">
                      {analysis.job_text ? truncateText(analysis.job_text) : "Encrypted Telemetry"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {(analysis.suspicious_phrases?.length ?? 0) > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {(analysis.suspicious_phrases ?? []).slice(0, 2).map((phrase, index) => (
                        <Badge 
                          key={index}
                          variant="secondary"
                          className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] uppercase font-semibold tracking-wider"
                        >
                          {phrase}
                        </Badge>
                      ))}
                      {(analysis.suspicious_phrases?.length ?? 0) > 2 && (
                        <Badge 
                          variant="secondary"
                          className="bg-muted text-muted-foreground text-[10px] font-semibold"
                        >
                          +{(analysis.suspicious_phrases?.length ?? 0) - 2}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">None detected</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="border-t border-border bg-card p-3 text-center">
          <p className="text-xs font-medium text-muted-foreground">
            Displaying {analyses.length} recent telemetry logs
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
