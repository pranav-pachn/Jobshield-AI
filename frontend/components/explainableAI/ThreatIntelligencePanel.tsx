import React from "react";
import { AlertTriangle, Radar, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface ThreatIntelligenceData {
  found: boolean;
  frequency: number;
  intelligence_boost: number;
  alerts: string[];
}

interface ThreatIntelligencePanelProps {
  threat_intelligence?: ThreatIntelligenceData;
}

function ThreatIntelStatBadge({
  value,
  label,
  className,
}: {
  value: string;
  label: string;
  className: string;
}) {
  return (
    <span className={`rounded border px-2 py-1 font-mono text-xs ${className}`}>
      {value} {label}
    </span>
  );
}

function ThreatIntelAlertItem({ alert }: { alert: string }) {
  return (
    <div className="rounded-lg border border-red-500/15 bg-red-500/5 px-4 py-3">
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
        <p className="text-sm leading-relaxed text-foreground/90">
          <span className="mr-1 text-red-300">⚠</span>
          {alert}
        </p>
      </div>
    </div>
  );
}

export const ThreatIntelligencePanel: React.FC<ThreatIntelligencePanelProps> = ({
  threat_intelligence,
}) => {
  if (!threat_intelligence || threat_intelligence.alerts.length === 0) {
    return null;
  }

  return (
    <Card className="glass-card border-red-500/30 overflow-hidden">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
      <CardHeader className="border-b border-border/50 pb-4 pt-6 bg-red-950/10">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="text-foreground flex items-center gap-2">
            <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/30">
              <Radar className="h-5 w-5 text-red-400" />
            </div>
            Threat Intelligence Hits
          </CardTitle>
          <div className="flex items-center gap-2">
            {threat_intelligence.frequency > 0 && (
              <ThreatIntelStatBadge
                value={String(threat_intelligence.frequency)}
                label={`prior hit${threat_intelligence.frequency === 1 ? "" : "s"}`}
                className="border-red-500/20 bg-red-500/10 text-red-300"
              />
            )}
            {threat_intelligence.intelligence_boost > 0 && (
              <ThreatIntelStatBadge
                value={`+${threat_intelligence.intelligence_boost}`}
                label="risk boost"
                className="border-amber-500/20 bg-amber-500/10 text-amber-300"
              />
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Matches found in prior scam reports and JobShield threat logs.
        </p>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="space-y-2.5">
          {threat_intelligence.alerts.map((alert, index) => (
            <ThreatIntelAlertItem key={`${alert}-${index}`} alert={alert} />
          ))}
        </div>

        <div className="mt-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            These hits come from previously observed scam domains, phrases, and related threat patterns.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
