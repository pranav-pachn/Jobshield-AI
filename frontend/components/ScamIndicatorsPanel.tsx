"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScamIndicatorTag } from "./ScamIndicatorTag";
import { AlertTriangle, Activity } from "lucide-react";

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
      <Card className="glass-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Activity className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No scam indicators detected in this job posting.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {indicators.map((indicator, idx) => (
            <ScamIndicatorTag
              key={idx}
              label={indicator.label}
              type={indicator.type}
              count={indicator.count}
            />
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          {indicators.length} scam indicator{indicators.length !== 1 ? "s" : ""} identified based on AI analysis patterns
        </p>
      </CardContent>
    </Card>
  );
}
