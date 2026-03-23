"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Highlighter } from "lucide-react";
import { cn } from "@/lib/utils";

type PhraseDetail = {
  phrase: string;
  confidence: number;
  reason: string;
};

type PhraseCategory =
  | "payment_request"
  | "unrealistic_salary"
  | "pressure_tactic"
  | "work_from_home"
  | "domain_risk"
  | "off_platform_contact"
  | "link_obfuscation"
  | "other";

interface HighlightedJobTextProps {
  originalText: string;
  suspiciousPhrases: string[];
  phraseDetails?: PhraseDetail[];
}

type Indicator = {
  phrase: string;
  reason: string;
  confidence: number;
  category: PhraseCategory;
};

type HighlightMatch = {
  start: number;
  end: number;
  phrase: string;
  reason: string;
  confidence: number;
  category: PhraseCategory;
};

type Segment = {
  text: string;
  match?: HighlightMatch;
};

const CATEGORY_LABELS: Record<PhraseCategory, string> = {
  payment_request: "Fees",
  unrealistic_salary: "Salary",
  pressure_tactic: "Pressure",
  work_from_home: "WFH",
  domain_risk: "Domain",
  off_platform_contact: "Off-platform",
  link_obfuscation: "Links",
  other: "Other",
};

const CATEGORY_STYLES: Record<PhraseCategory, string> = {
  payment_request: "bg-red-500/25 text-red-200 ring-red-400/50",
  unrealistic_salary: "bg-orange-500/25 text-orange-200 ring-orange-400/50",
  pressure_tactic: "bg-yellow-500/25 text-yellow-100 ring-yellow-400/50",
  work_from_home: "bg-amber-500/25 text-amber-200 ring-amber-400/50",
  domain_risk: "bg-violet-500/25 text-violet-200 ring-violet-400/50",
  off_platform_contact: "bg-cyan-500/25 text-cyan-100 ring-cyan-400/50",
  link_obfuscation: "bg-pink-500/25 text-pink-100 ring-pink-400/50",
  other: "bg-slate-500/25 text-slate-100 ring-slate-400/50",
};

function inferCategory(phrase: string, reason: string): PhraseCategory {
  const text = `${phrase} ${reason}`.toLowerCase();

  if (/(fee|payment|wire transfer|gift card|crypto|deposit|upfront)/.test(text)) {
    return "payment_request";
  }
  if (/(salary|weekly|monthly|daily|hourly|compensation|\$\d)/.test(text)) {
    return "unrealistic_salary";
  }
  if (/(urgent|immediately|limited slots|hurry|act fast|pressure)/.test(text)) {
    return "pressure_tactic";
  }
  if (/(work from home|remote|wfh)/.test(text)) {
    return "work_from_home";
  }
  if (/(domain|gmail|yahoo|hotmail|outlook|email service)/.test(text)) {
    return "domain_risk";
  }
  if (/(telegram|whatsapp|signal|off-platform)/.test(text)) {
    return "off_platform_contact";
  }
  if (/(shortened link|bitly|tinyurl|obfuscated|redirect)/.test(text)) {
    return "link_obfuscation";
  }

  return "other";
}

function escapeForRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function HighlightedJobText({
  originalText,
  suspiciousPhrases,
  phraseDetails,
}: HighlightedJobTextProps) {
  const indicators = useMemo<Indicator[]>(() => {
    const detailMap = new Map<string, PhraseDetail>();
    for (const detail of phraseDetails || []) {
      detailMap.set(detail.phrase.toLowerCase(), detail);
    }

    const uniquePhrases = Array.from(new Set((suspiciousPhrases || []).filter(Boolean)));
    return uniquePhrases.map((phrase) => {
      const detail = detailMap.get(phrase.toLowerCase());
      const reason = detail?.reason || "Detected as a suspicious indicator.";
      const confidence = typeof detail?.confidence === "number" ? detail.confidence : 0.5;

      return {
        phrase,
        reason,
        confidence,
        category: inferCategory(phrase, reason),
      };
    });
  }, [suspiciousPhrases, phraseDetails]);

  const categoriesInText = useMemo(() => {
    return Array.from(new Set(indicators.map((item) => item.category)));
  }, [indicators]);

  const [selectedCategory, setSelectedCategory] = useState<PhraseCategory | "all">("all");

  const filteredIndicators = useMemo(() => {
    if (selectedCategory === "all") {
      return indicators;
    }
    return indicators.filter((item) => item.category === selectedCategory);
  }, [indicators, selectedCategory]);

  const segments = useMemo<Segment[]>(() => {
    if (!originalText) {
      return [];
    }

    if (!filteredIndicators.length) {
      return [{ text: originalText }];
    }

    const matches: HighlightMatch[] = [];

    for (const indicator of [...filteredIndicators].sort((a, b) => b.phrase.length - a.phrase.length)) {
      const escaped = escapeForRegex(indicator.phrase);
      const regex = new RegExp(escaped, "gi");
      let match: RegExpExecArray | null;

      while ((match = regex.exec(originalText)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          phrase: match[0],
          reason: indicator.reason,
          confidence: indicator.confidence,
          category: indicator.category,
        });
      }
    }

    if (!matches.length) {
      return [{ text: originalText }];
    }

    matches.sort((a, b) => a.start - b.start || b.end - a.end);
    const merged: HighlightMatch[] = [];

    for (const match of matches) {
      const last = merged[merged.length - 1];
      if (!last || match.start >= last.end) {
        merged.push(match);
      }
    }

    const output: Segment[] = [];
    let cursor = 0;

    for (const match of merged) {
      if (match.start > cursor) {
        output.push({ text: originalText.slice(cursor, match.start) });
      }

      output.push({
        text: originalText.slice(match.start, match.end),
        match,
      });
      cursor = match.end;
    }

    if (cursor < originalText.length) {
      output.push({ text: originalText.slice(cursor) });
    }

    return output;
  }, [originalText, filteredIndicators]);

  return (
    <Card className="glass-card shadow-xl overflow-hidden">
      <CardHeader className="border-b border-white/10 pb-4 pt-6 bg-gradient-to-br from-card/60 to-card/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Highlighter className="h-5 w-5 text-primary" />
            Highlighted Job Text
          </CardTitle>
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
            {filteredIndicators.length} indicator{filteredIndicators.length === 1 ? "" : "s"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-5">
        {categoriesInText.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className="h-7 text-xs"
            >
              All
            </Button>
            {categoriesInText.map((category) => (
              <Button
                key={category}
                type="button"
                size="sm"
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="h-7 text-xs"
              >
                {CATEGORY_LABELS[category]}
              </Button>
            ))}
          </div>
        )}

        <div className="rounded-xl border border-border bg-black/40 p-4 font-mono text-sm leading-relaxed text-gray-200 shadow-inner whitespace-pre-wrap">
          {segments.map((segment, index) => {
            if (!segment.match) {
              return <span key={index}>{segment.text}</span>;
            }

            const tooltip = `${CATEGORY_LABELS[segment.match.category]} | ${segment.match.reason} | Confidence ${(segment.match.confidence * 100).toFixed(0)}%`;

            return (
              <span
                key={index}
                title={tooltip}
                className={cn(
                  "mx-0.5 inline rounded px-1 font-semibold ring-1",
                  CATEGORY_STYLES[segment.match.category],
                )}
              >
                {segment.text}
              </span>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}