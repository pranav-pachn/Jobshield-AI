import React from "react";
import { ShieldOff, Copy, CheckCircle2, Database, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface SimilarPattern {
  pattern: string;
  frequency: number;
  confidence: number;
}

export interface SimilarPatternPanelProps {
  similar_patterns?: SimilarPattern[];
  matching_templates?: string[];
}

export const SimilarPatternPanel: React.FC<SimilarPatternPanelProps> = ({
  similar_patterns = [],
  matching_templates = [],
}) => {
  const hasData = similar_patterns.length > 0 || matching_templates.length > 0;

  const totalMatches = similar_patterns.reduce((sum, p) => sum + p.frequency, 0);
  const topConfidence = similar_patterns.length > 0
    ? Math.round(Math.max(...similar_patterns.map(p => p.confidence)) * 100)
    : 0;

  return (
    <Card className="glass-card border-border overflow-hidden">
      {/* Top accent stripe */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />

      <CardHeader className="border-b border-border/50 pb-4 pt-6 bg-card/40">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-foreground flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
              <Copy className="h-5 w-5 text-purple-400" />
            </div>
            Similar Scam Patterns Detected
          </CardTitle>
          {hasData && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {matching_templates.length + similar_patterns.length} pattern{(matching_templates.length + similar_patterns.length) !== 1 && "s"} matched
              </span>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Cross-referenced against known fraud templates in the JobShield threat database.
        </p>
      </CardHeader>

      <CardContent className="pt-6 space-y-5">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 opacity-50" />
            <p className="text-muted-foreground text-sm">No known scam template matches found.</p>
          </div>
        ) : (
          <>
            {/* Stats summary row */}
            {similar_patterns.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="rounded-lg border border-border/40 bg-card/20 p-3 text-center">
                  <p className="text-2xl font-black text-purple-400">{matching_templates.length + similar_patterns.length}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Templates Matched</p>
                </div>
                <div className="rounded-lg border border-border/40 bg-card/20 p-3 text-center">
                  <p className="text-2xl font-black text-amber-400">{totalMatches}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Prior Reports</p>
                </div>
                <div className="rounded-lg border border-border/40 bg-card/20 p-3 text-center hidden sm:block">
                  <p className="text-2xl font-black text-red-400">{topConfidence}%</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Peak Confidence</p>
                </div>
              </div>
            )}

            {/* Matching templates */}
            {matching_templates.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-3.5 w-3.5 text-purple-400" />
                  <p className="text-xs font-bold uppercase tracking-wider text-purple-400">
                    Matched Script Templates
                  </p>
                </div>
                {matching_templates.map((template, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-purple-500/20 bg-purple-500/5 px-4 py-3 text-sm text-foreground/90 italic font-mono leading-relaxed"
                  >
                    <ShieldOff className="inline h-3.5 w-3.5 text-purple-400 mr-2 -mt-0.5" />
                    "{template}"
                  </div>
                ))}
              </div>
            )}

            {/* Similar patterns */}
            {similar_patterns.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Common Pattern Variants
                  </p>
                </div>
                {similar_patterns.slice(0, 4).map((pattern, idx) => {
                  const conf = Math.round(pattern.confidence * 100);
                  const confColor = conf >= 80 ? "text-red-400" : conf >= 60 ? "text-amber-400" : "text-emerald-400";
                  const barColor = conf >= 80 ? "bg-red-500" : conf >= 60 ? "bg-amber-500" : "bg-emerald-500";
                  return (
                    <div key={idx} className="rounded-lg border border-border/40 bg-card/20 p-4 group hover:border-purple-500/30 transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm text-foreground font-medium leading-snug">"{pattern.pattern}"</p>
                        <div className="flex-shrink-0 text-right">
                          <p className={`text-lg font-black ${confColor}`}>{conf}%</p>
                          <p className="text-[10px] text-muted-foreground">match</p>
                        </div>
                      </div>
                      {/* Confidence bar */}
                      <div className="mt-3 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                          style={{ width: `${conf}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Found in <strong className="text-foreground">{pattern.frequency}</strong> verified scam reports
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer */}
            <div className="rounded-lg bg-purple-500/5 border border-purple-500/10 px-4 py-3">
              <p className="text-xs text-muted-foreground">
                🛡 Pattern intelligence sourced from the JobShield threat database. Matches indicate structural similarity to known fraudulent job scripts.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
