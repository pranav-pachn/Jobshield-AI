import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertTriangle, ShieldAlert, Zap, CheckCircle2 } from "lucide-react";

export interface BehavioralIndicatorsPanelProps {
  suspicious_phrases?: string[];
  phrase_details?: Array<{
    phrase: string;
    confidence: number;
    reason: string;
  }>;
}

type IndicatorType = "urgency" | "payment" | "authority" | "other";

interface BehaviorIssue {
  type: IndicatorType;
  title: string;
  icon: React.ReactNode;
  description: string;
  severity: "high" | "medium" | "low";
  phrases: string[];
}

const URGENCY_KEYWORDS = /(urgent|immediately|limited slots|hurry|act fast|today only|respond asap|don't wait|apply now|closing soon)/;
const PAYMENT_KEYWORDS = /(fee|payment|wire transfer|gift card|crypto|deposit|upfront|training fee|registration fee|bank account|advance)/;
const AUTHORITY_KEYWORDS = /(ceo|executive|director|hr manager|official|confidential|strict|mandatory|corporate|directly from|verified employer)/;

export const BehavioralIndicatorsPanel: React.FC<BehavioralIndicatorsPanelProps> = ({
  suspicious_phrases = [],
  phrase_details = [],
}) => {
  const indicators = useMemo(() => {
    const issues: Record<IndicatorType, BehaviorIssue> = {
      urgency: {
        type: "urgency",
        title: "Urgency Tactic",
        icon: <Zap className="h-5 w-5 text-amber-400" />,
        description: "Pressure to act fast without time to research — classic scam manipulation.",
        severity: "medium",
        phrases: [],
      },
      payment: {
        type: "payment",
        title: "Financial Pressure",
        icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
        description: "Requesting fees, deposits, or payment before hiring — a definitive scam signal.",
        severity: "high",
        phrases: [],
      },
      authority: {
        type: "authority",
        title: "Authority Manipulation",
        icon: <ShieldAlert className="h-5 w-5 text-blue-400" />,
        description: "Impersonating executives or using official-sounding authority to bypass skepticism.",
        severity: "medium",
        phrases: [],
      },
      other: {
        type: "other",
        title: "Manipulative Phrasing",
        icon: <Activity className="h-5 w-5 text-slate-400" />,
        description: "Other deceptive language patterns identified by the AI engine.",
        severity: "low",
        phrases: [],
      },
    };

    const detailMap = new Map<string, { reason: string; confidence: number }>();
    phrase_details.forEach(d => detailMap.set(d.phrase.toLowerCase(), d));

    const uniquePhrases = Array.from(new Set(suspicious_phrases.filter(Boolean)));

    uniquePhrases.forEach(phrase => {
      const detail = detailMap.get(phrase.toLowerCase());
      const text = `${phrase} ${detail?.reason || ""}`.toLowerCase();

      let type: IndicatorType = "other";
      if (PAYMENT_KEYWORDS.test(text)) type = "payment";
      else if (URGENCY_KEYWORDS.test(text)) type = "urgency";
      else if (AUTHORITY_KEYWORDS.test(text)) type = "authority";

      if (!issues[type].phrases.includes(phrase)) {
        issues[type].phrases.push(phrase);
        // Escalate severity based on confidence
        if (detail && detail.confidence > 0.8 && type === "payment") {
          issues[type].severity = "high";
        }
      }
    });

    return Object.values(issues).filter(i => i.phrases.length > 0);
  }, [suspicious_phrases, phrase_details]);

  if (indicators.length === 0) {
    return (
      <Card className="glass-card border-border">
        <CardContent className="flex flex-col items-center justify-center py-10 text-center gap-3">
          <CheckCircle2 className="h-10 w-10 text-emerald-400 opacity-50" />
          <p className="text-muted-foreground text-sm">No behavioral manipulation tactics detected.</p>
        </CardContent>
      </Card>
    );
  }

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "high":
        return {
          card: "border-red-500/30 bg-gradient-to-br from-red-950/20 to-card/10",
          badge: "bg-red-500/15 border-red-500/30 text-red-400",
          phraseBg: "bg-red-500/10 border-red-500/15",
          dot: "bg-red-400 animate-pulse",
        };
      case "medium":
        return {
          card: "border-amber-500/25 bg-gradient-to-br from-amber-950/15 to-card/10",
          badge: "bg-amber-500/15 border-amber-500/25 text-amber-400",
          phraseBg: "bg-amber-500/10 border-amber-500/15",
          dot: "bg-amber-400",
        };
      default:
        return {
          card: "border-blue-500/20 bg-gradient-to-br from-blue-950/10 to-card/10",
          badge: "bg-blue-500/10 border-blue-500/20 text-blue-400",
          phraseBg: "bg-blue-500/5 border-blue-500/10",
          dot: "bg-blue-400",
        };
    }
  };

  return (
    <Card className="glass-card border-border overflow-hidden">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

      <CardHeader className="border-b border-border/50 pb-4 pt-6 bg-card/40">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-foreground flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30">
              <Activity className="h-5 w-5 text-amber-400" />
            </div>
            Behavioral Red Flags
          </CardTitle>
          <span className="text-xs font-mono px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {indicators.length} tactic{indicators.length !== 1 && "s"} detected
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Psychological manipulation patterns exploiting human decision-making.
        </p>
      </CardHeader>

      <CardContent className="pt-6 space-y-4">
        {indicators.map((indicator, idx) => {
          const s = getSeverityStyle(indicator.severity);
          return (
            <div
              key={idx}
              className={`rounded-xl border p-5 transition-all duration-200 ${s.card}`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex-shrink-0 p-2.5 rounded-lg bg-card/40 border border-white/5">
                  {indicator.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h4 className="font-bold text-foreground">{indicator.title}</h4>
                    <div className="flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${s.badge}`}>
                        {indicator.severity} risk
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    {indicator.description}
                  </p>
                  <div className="space-y-1.5">
                    {indicator.phrases.map((phrase, pIdx) => (
                      <div
                        key={pIdx}
                        className={`rounded-lg border px-3 py-2 font-mono text-xs text-foreground/80 break-words ${s.phraseBg}`}
                      >
                        "{phrase}"
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div className="rounded-lg bg-white/3 border border-white/5 px-4 py-3 mt-2">
          <p className="text-xs text-muted-foreground">
            🧠 These patterns exploit cognitive biases including urgency bias, authority bias, and financial loss aversion — the same tactics used in real-world social engineering attacks.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
