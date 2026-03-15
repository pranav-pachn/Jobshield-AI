"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScamIndicatorTag } from "./ScamIndicatorTag";
import { AlertTriangle, Activity, TrendingUp, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScamIndicator {
  label: string;
  type: "registration-fee" | "training-fee" | "telegram" | "earnings-promise" | "urgency" | "unknown";
  count?: number;
}

interface ScamIndicatorsPanelProps {
  indicators: ScamIndicator[];
  title?: string;
}

export function ScamIndicatorsPanel({
  indicators,
  title = "Common Scam Indicators Detected",
}: ScamIndicatorsPanelProps) {
  if (indicators.length === 0) {
    return (
      <Card className="glass-card border-border overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Shield className="h-5 w-5 text-green-400" />
            {title}
          </CardTitle>
          <CardDescription>Analysis of threat patterns in your network</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-500/10 p-4">
            <Shield className="h-5 w-5 text-green-400 flex-shrink-0" />
            <p className="text-sm text-green-300">
              No scam indicators detected in this job posting. This appears to be a legitimate opportunity.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort indicators by count (descending)
  const sortedIndicators = [...indicators].sort((a, b) => (b.count || 0) - (a.count || 0));
  const topIndicators = sortedIndicators.slice(0, 5);
  const totalDetections = indicators.reduce((sum, ind) => sum + (ind.count || 0), 0);

  return (
    <Card className="glass-card border-border overflow-hidden relative">
      {/* Gradient accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-destructive/50 via-yellow-500/50 to-transparent" />
      
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1 flex-1">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
              {title}
            </CardTitle>
            <CardDescription>
              {totalDetections} threat indicators across {indicators.length} pattern{indicators.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          <div className="rounded-full bg-destructive/10 px-3 py-1 flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-destructive" />
            <span className="text-xs font-semibold text-destructive">+14% alerts</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Indicators Grid */}
        <div className="grid gap-3">
          {topIndicators.map((indicator, idx) => (
            <div 
              key={idx} 
              className="group relative overflow-hidden rounded-lg border border-white/5 bg-white/[3%] p-3.5 transition-all hover:border-white/10 hover:bg-white/[6%]"
            >
              {/* Gradient background on hover */}
              <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <ScamIndicatorTag
                    label={indicator.label}
                    type={indicator.type}
                  />
                </div>
                
                {indicator.count && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">{indicator.count}</div>
                    <div className="text-xs text-muted-foreground">occurrences</div>
                  </div>
                )}
              </div>

              {/* Mini progress bar */}
              {indicator.count && totalDetections > 0 && (
                <div className="mt-2 h-1 rounded-full overflow-hidden bg-white/5">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-destructive/60 to-yellow-500/60 transition-all"
                    style={{ width: `${(indicator.count / totalDetections) * 100}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary and CTA */}
        <div className="pt-3 border-t border-white/5">
          <p className="text-xs text-muted-foreground mb-3">
            These threat indicators have been identified across {indicators.length} unique fraud patterns detected by our AI engine.
          </p>
          <div className="flex justify-between items-center">
            <div className="text-xs font-medium text-primary">Pattern Confidence: 94.3%</div>
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs h-8 border-primary/30 hover:bg-primary/10 hover:border-primary/50"
            >
              View Threat Analysis
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
