"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Fingerprint, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuspiciousPhrase {
  text: string;
  reason: string;
}

interface ExplainableAISectionProps {
  originalText: string;
  suspiciousPhrases: SuspiciousPhrase[];
  detectionReasons: string[];
}

export function ExplainableAISection({
  originalText,
  suspiciousPhrases,
  detectionReasons,
}: ExplainableAISectionProps) {
  const [selectedPhrase, setSelectedPhrase] = useState<string | null>(
    suspiciousPhrases.length > 0 ? suspiciousPhrases[0].text : null
  );

  const highlightedContent = useMemo(() => {
    if (!suspiciousPhrases.length) {
      return [{ text: originalText, isHighlighted: false }];
    }

    const sortedPhrases = [...suspiciousPhrases].sort((a, b) => b.text.length - a.text.length);

    const matches: Array<{ start: number; end: number; phrase: string }> = [];

    sortedPhrases.forEach((phraseObj) => {
      const escapedPhrase = phraseObj.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escapedPhrase, "gi");
      let match;

      while ((match = regex.exec(originalText)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          phrase: match[0],
        });
      }
    });

    matches.sort((a, b) => a.start - b.start);

    const mergedMatches: Array<{ start: number; end: number; phrase: string }> = [];
    for (const match of matches) {
      if (mergedMatches.length === 0) {
        mergedMatches.push(match);
      } else {
        const lastMatch = mergedMatches[mergedMatches.length - 1];
        if (match.start <= lastMatch.end) {
          lastMatch.end = Math.max(lastMatch.end, match.end);
        } else {
          mergedMatches.push(match);
        }
      }
    }

    const parts: Array<{ text: string; isHighlighted: boolean }> = [];
    let lastIndex = 0;

    mergedMatches.forEach((match) => {
      if (match.start > lastIndex) {
        parts.push({
          text: originalText.slice(lastIndex, match.start),
          isHighlighted: false,
        });
      }

      parts.push({
        text: originalText.slice(match.start, match.end),
        isHighlighted: true,
      });

      lastIndex = match.end;
    });

    if (lastIndex < originalText.length) {
      parts.push({
        text: originalText.slice(lastIndex),
        isHighlighted: false,
      });
    }

    return parts;
  }, [originalText, suspiciousPhrases]);

  const selectedPhraseData = suspiciousPhrases.find((p) => p.text === selectedPhrase);

  return (
    <Card className="glass-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Fingerprint className="h-5 w-5 text-primary" />
          Explainable AI Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="highlighted" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="highlighted">Highlighted Text</TabsTrigger>
            <TabsTrigger value="reasoning">Detection Reasoning</TabsTrigger>
          </TabsList>

          {/* Highlighted Text Tab */}
          <TabsContent value="highlighted" className="mt-4 space-y-4">
            {suspiciousPhrases.length === 0 ? (
              <div className="rounded-lg border border-border bg-card/40 p-6 text-center">
                <p className="text-muted-foreground">No suspicious phrases detected.</p>
              </div>
            ) : (
              <>
                {/* Main highlighted text display */}
                <div className="rounded-xl border border-border bg-black/40 p-4 font-mono text-sm leading-relaxed shadow-inner">
                  <div className="flex h-8 w-full items-center gap-2 border-b border-border bg-card/60 px-4 -m-4 mb-4 -mx-4 rounded-t-xl">
                    <div className="h-3 w-3 rounded-full bg-destructive/60" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                    <div className="h-3 w-3 rounded-full bg-green-500/60" />
                    <span className="ml-2 text-xs text-muted-foreground uppercase tracking-wider">
                      Job Text Inspector
                    </span>
                  </div>
                  <div className="p-4 text-gray-300">
                    {highlightedContent.map((part, index) => (
                      <span key={index}>
                        {part.isHighlighted ? (
                          <span className="relative inline-block mx-0.5 rounded bg-destructive/30 px-1.5 py-0.5 font-bold text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.4)] ring-1 ring-destructive/50 transition-all hover:bg-destructive/40 cursor-pointer">
                            {part.text}
                          </span>
                        ) : (
                          part.text
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Status strip */}
                <div className="flex items-center justify-between rounded-lg border border-border bg-card/40 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-2 w-2 items-center justify-center">
                      <div className="h-2 w-2 animate-ping rounded-full bg-destructive" />
                    </div>
                    <span className="text-sm font-medium text-destructive">
                      {suspiciousPhrases.length} suspicious phrase
                      {suspiciousPhrases.length !== 1 ? "s" : ""} found
                    </span>
                  </div>
                </div>

                {/* Phrases list */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Flagged Phrases
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suspiciousPhrases.map((phrase, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedPhrase(phrase.text)}
                        className={cn(
                          "rounded-full px-3 py-1 text-sm font-medium transition-all",
                          selectedPhrase === phrase.text
                            ? "bg-destructive/30 text-destructive border border-destructive/50 ring-2 ring-destructive/30"
                            : "bg-destructive/15 text-destructive/80 border border-destructive/30 hover:bg-destructive/20"
                        )}
                      >
                        "{phrase.text}"
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* Detection Reasoning Tab */}
          <TabsContent value="reasoning" className="mt-4 space-y-4">
            <div className="space-y-3">
              {/* Suspicious Phrase Explanation */}
              {selectedPhraseData && (
                <div className="rounded-lg border border-border bg-destructive/10 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-mono text-sm font-semibold text-destructive mb-1">
                        "{selectedPhraseData.text}"
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">
                        {selectedPhraseData.reason}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Detection Reasons */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Why This Is Flagged
                </p>
                <div className="space-y-2">
                  {detectionReasons.map((reason, idx) => (
                    <div key={idx} className="rounded-lg border border-border bg-card/40 p-3 pl-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        </div>
                        <p className="text-sm leading-relaxed text-foreground/90">{reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
