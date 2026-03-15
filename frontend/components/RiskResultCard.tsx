import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShieldCheck, Clock, Activity } from "lucide-react";
import { CountingNumber } from "@/components/CountingNumber";
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
    <Card className="glass-card-accent shadow-2xl overflow-hidden relative border-t-0 animate-fade-in-scale">
      {/* Top accent border with glow */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-1",
        result.risk_level === 'High' ? 'bg-gradient-to-r from-destructive via-destructive/60 to-transparent' :
        result.risk_level === 'Medium' ? 'bg-gradient-to-r from-yellow-500 via-yellow-500/60 to-transparent' : 
        'bg-gradient-to-r from-green-500 via-green-500/60 to-transparent'
      )} />

      <CardHeader className="pt-6 pb-4">
        <CardTitle className="flex items-center justify-between text-foreground">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <span>Analysis Results</span>
          </div>
          <Badge 
            className={cn("flex items-center gap-2 px-4 py-1.5 font-bold tracking-wider border", getRiskStyle(result.risk_level))}
            variant="outline"
          >
            {getRiskIcon(result.risk_level)}
            <span>{result.risk_level} Risk</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Risk Score Display - Premium */}
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-black/60 to-black/40 p-6 backdrop-blur-sm relative overflow-hidden">
          {/* Animated background glow based on risk */}
          <div className={cn(
            "absolute -bottom-12 -right-12 h-40 w-40 rounded-full blur-3xl opacity-15 animate-pulse pointer-events-none",
            result.risk_level === 'High' ? 'bg-destructive' :
            result.risk_level === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
          )} />

          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground letter-spacing">Scam Probability Score</p>
              <div className="mt-2 flex items-baseline gap-2 animate-count-up">
                <span className={cn(
                  "text-6xl font-mono font-black tracking-tighter",
                  result.risk_level === 'High' ? 'text-destructive drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]' :
                  result.risk_level === 'Medium' ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]' : 
                  'text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.6)]'
                )}>
                  <CountingNumber 
                    target={scamPercentage} 
                    duration={1200}
                    decimals={0}
                  />%
                </span>
                <span className="text-sm font-semibold text-muted-foreground">confidence</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-2 font-mono text-sm text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span>{result.ai_latency_ms}ms</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Max Latency</p>
            </div>
          </div>
          
          {/* Premium Progress Bar with glow */}
          <div className="mt-6">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/5 border border-white/10">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-1500 ease-out shadow-[0_0_15px]",
                  result.risk_level === 'High' ? 'bg-gradient-to-r from-destructive to-destructive/60 shadow-destructive/50' :
                  result.risk_level === 'Medium' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600/60 shadow-yellow-500/50' :
                  'bg-gradient-to-r from-green-500 to-green-600/60 shadow-green-500/50'
                )}
                style={{ width: `${scamPercentage}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[11px] font-medium text-muted-foreground">
              <span>Low Risk</span>
              <span>Medium Risk</span>
              <span>High Risk</span>
            </div>
          </div>
        </div>

        {/* Detection Reasons - Premium styling */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3 font-mono flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Detection Indicators
          </h3>
          <div className="space-y-2">
            {result.reasons.map((reason, index) => (
              <div 
                key={index}
                className="group rounded-lg border border-white/5 bg-white/[3%] px-4 py-3 transition-all hover:border-white/10 hover:bg-white/[5%]"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary border border-primary/30">
                    <div className="h-2 w-2 rounded-full bg-primary group-hover:animate-pulse" />
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/85">{reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suspicious Phrases - Premium styling */}
        {result.suspicious_phrases.length > 0 && (
          <div className="pt-2 border-t border-white/5">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3 font-mono">
              Suspicious Vocabulary Detected
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.suspicious_phrases.map((phrase, index) => (
                <Badge 
                  key={index}
                  className="bg-gradient-to-r from-destructive/20 to-destructive/10 text-destructive/90 border-destructive/30 transition-all hover:from-destructive/30 hover:to-destructive/20 hover:scale-105 cursor-default font-medium"
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
