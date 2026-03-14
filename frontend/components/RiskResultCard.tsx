"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Clock, CheckCircle } from "lucide-react";

interface AnalysisResult {
  scam_probability: number;
  risk_level: "High" | "Medium" | "Low";
  reasons: string[];
  suspicious_phrases: string[];
  ai_latency_ms: number;
}

interface RiskResultCardProps {
  result: AnalysisResult;
}

export function RiskResultCard({ result }: RiskResultCardProps) {
  const getRiskBadgeStyles = (level: string) => {
    switch (level) {
      case "High":
        return "bg-risk-high/10 text-risk-high border-risk-high/30";
      case "Medium":
        return "bg-risk-medium/10 text-risk-medium border-risk-medium/30";
      case "Low":
        return "bg-risk-low/10 text-risk-low border-risk-low/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "High":
      case "Medium":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getProgressBarColor = (level: string) => {
    switch (level) {
      case "High":
        return "bg-gradient-to-r from-risk-high to-red-600";
      case "Medium":
        return "bg-gradient-to-r from-risk-medium to-amber-600";
      case "Low":
        return "bg-gradient-to-r from-risk-low to-emerald-600";
      default:
        return "bg-muted";
    }
  };

  const scamPercentage = Math.round(result.scam_probability * 100);

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-foreground">
          <span className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Analysis Results
          </span>
          <Badge 
            className={`flex items-center gap-2 ${getRiskBadgeStyles(result.risk_level)}`}
            variant="outline"
          >
            {getRiskIcon(result.risk_level)}
            {result.risk_level} Risk
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Risk Score Display */}
        <div className="rounded-lg border border-border bg-accent/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Scam Probability</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-foreground">{scamPercentage}%</span>
                <span className="text-sm text-muted-foreground">confidence</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{result.ai_latency_ms}ms</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">AI latency</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div 
                className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressBarColor(result.risk_level)}`}
                style={{ width: `${scamPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Detection Reasons */}
        <div>
          <h3 className="text-base font-semibold text-foreground mb-3">Detection Reasons</h3>
          <div className="space-y-2">
            {result.reasons.map((reason, index) => (
              <div 
                key={index}
                className="rounded-lg border border-border bg-accent/20 px-4 py-3"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1.5">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <p className="text-sm text-foreground">{reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suspicious Phrases */}
        {result.suspicious_phrases.length > 0 && (
          <div>
            <h3 className="text-base font-semibold text-foreground mb-3">Suspicious Phrases Detected</h3>
            <div className="flex flex-wrap gap-2">
              {result.suspicious_phrases.map((phrase, index) => (
                <Badge 
                  key={index}
                  variant="secondary"
                  className="bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20"
                >
                  {phrase}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
