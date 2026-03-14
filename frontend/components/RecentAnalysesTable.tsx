"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, AlertTriangle, Shield, FileText } from "lucide-react";

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
  const getRiskBadgeStyles = (level: string) => {
    switch (level) {
      case "High":
        return "bg-risk-high/10 text-risk-high border-risk-high/30 hover:bg-risk-high/20";
      case "Medium":
        return "bg-risk-medium/10 text-risk-medium border-risk-medium/30 hover:bg-risk-medium/20";
      case "Low":
        return "bg-risk-low/10 text-risk-low border-risk-low/30 hover:bg-risk-low/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "High":
      case "Medium":
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return <Shield className="h-3 w-3" />;
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
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Clock className="h-5 w-5" />
            Recent Analyses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">No recent analyses available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Clock className="h-5 w-5" />
          Recent Analyses
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Latest job scam detection results
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border bg-muted/30 hover:bg-muted/30">
                <TableHead className="text-muted-foreground font-medium">Timestamp</TableHead>
                <TableHead className="text-muted-foreground font-medium">Risk Level</TableHead>
                <TableHead className="text-muted-foreground font-medium">Probability</TableHead>
                <TableHead className="text-muted-foreground font-medium">Job Description</TableHead>
                <TableHead className="text-muted-foreground font-medium">Indicators</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analyses.map((analysis) => (
                <TableRow key={analysis.id} className="border-border hover:bg-accent/50">
                  <TableCell className="text-foreground text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      {formatDate(analysis.timestamp)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={`flex items-center gap-1.5 w-fit ${getRiskBadgeStyles(analysis.risk_level)}`}
                      variant="outline"
                    >
                      {getRiskIcon(analysis.risk_level)}
                      {analysis.risk_level}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-foreground text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            analysis.risk_level === 'High' ? 'bg-risk-high' :
                            analysis.risk_level === 'Medium' ? 'bg-risk-medium' : 'bg-risk-low'
                          }`}
                          style={{ width: `${Math.round(analysis.scam_probability * 100)}%` }}
                        />
                      </div>
                      <span className="font-medium tabular-nums">
                        {Math.round(analysis.scam_probability * 100)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-xs">
                    <div className="flex items-start gap-2">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">
                        {analysis.job_text ? truncateText(analysis.job_text) : "Text not available"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {(analysis.suspicious_phrases?.length ?? 0) > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {(analysis.suspicious_phrases ?? []).slice(0, 2).map((phrase, index) => (
                          <Badge 
                            key={index}
                            variant="secondary"
                            className="text-xs bg-destructive/10 text-destructive border-destructive/30"
                          >
                            {phrase}
                          </Badge>
                        ))}
                        {(analysis.suspicious_phrases?.length ?? 0) > 2 && (
                          <Badge 
                            variant="secondary"
                            className="text-xs bg-muted text-muted-foreground"
                          >
                            +{(analysis.suspicious_phrases?.length ?? 0) - 2}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">None detected</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {analyses.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Showing {analyses.length} most recent analyses
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
