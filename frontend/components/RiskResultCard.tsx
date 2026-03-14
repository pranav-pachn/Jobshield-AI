import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShieldCheck, Clock, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const getRiskStyle = (level: string) => {
    switch (level) {
      case "High":
        return "bg-destructive/10 text-destructive border-destructive/20 shadow-[0_0_15px_rgba(var(--destructive),0.2)]";
      case "Medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.15)]";
      case "Low":
        return "bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.15)]";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "High":
      case "Medium":
        return <AlertTriangle className="h-4 w-4" />;
      case "Low":
        return <ShieldCheck className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getProgressBarColor = (level: string) => {
    switch (level) {
      case "High":
        return "bg-destructive shadow-[0_0_10px_rgba(var(--destructive),0.8)]";
      case "Medium":
        return "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]";
      case "Low":
        return "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]";
      default:
        return "bg-muted";
    }
  };

  const scamPercentage = Math.round(result.scam_probability * 100);

  return (
    <Card className="glass-card shadow-xl overflow-hidden relative border-t-0">
      {/* Top Warning Border */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-1",
        result.risk_level === 'High' ? 'bg-destructive' :
        result.risk_level === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
      )} />

      <CardHeader className="pt-6 pb-4">
        <CardTitle className="flex items-center justify-between text-foreground">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <span>Analysis Results</span>
          </div>
          <Badge 
            className={cn("flex items-center gap-2 px-3 py-1 font-semibold tracking-wide", getRiskStyle(result.risk_level))}
            variant="outline"
          >
            {getRiskIcon(result.risk_level)}
            {result.risk_level} Risk
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Risk Score Display */}
        <div className="rounded-xl border border-border bg-black/40 p-6 backdrop-blur-sm relative overflow-hidden">
          {/* Subtle background glow based on risk */}
          <div className={cn(
            "absolute -bottom-8 -right-8 h-32 w-32 rounded-full blur-3xl opacity-20 pointer-events-none",
            result.risk_level === 'High' ? 'bg-destructive' :
            result.risk_level === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
          )} />

          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Scam Probability</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className={cn(
                  "text-5xl font-mono font-bold tracking-tight",
                  result.risk_level === 'High' ? 'text-destructive' :
                  result.risk_level === 'Medium' ? 'text-yellow-500' : 'text-green-500'
                )}>{scamPercentage}%</span>
                <span className="text-sm font-medium text-muted-foreground">confidence</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-2 font-mono text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{result.ai_latency_ms}ms</span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-1">AI Latency</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-5">
            <div className="h-2 w-full overflow-hidden rounded-full bg-border/50">
              <div 
                className={cn("h-full rounded-full transition-all duration-1000 ease-out", getProgressBarColor(result.risk_level))}
                style={{ width: `${scamPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Detection Reasons */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 font-mono">
            Detection Indicators
          </h3>
          <div className="space-y-2">
            {result.reasons.map((reason, index) => (
              <div 
                key={index}
                className="group rounded-lg border border-border bg-card/40 px-4 py-3 transition-colors hover:bg-card/80 hover:border-white/10"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary group-hover:animate-ping" />
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/90">{reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suspicious Phrases */}
        {result.suspicious_phrases.length > 0 && (
          <div className="pt-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 font-mono">
              Suspicious Vocabulary Detected
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.suspicious_phrases.map((phrase, index) => (
                <Badge 
                  key={index}
                  variant="secondary"
                  className="bg-destructive/10 text-destructive border-destructive/20 transition-all hover:bg-destructive/20 hover:scale-105 pointer-events-none"
                >
                  <AlertTriangle className="mr-1.5 h-3 w-3" />
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
