"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Eye, CheckCircle } from "lucide-react";

interface SuspiciousTextHighlighterProps {
  originalText: string;
  phrases: string[];
}

export function SuspiciousTextHighlighter({ originalText, phrases }: SuspiciousTextHighlighterProps) {
  const highlightedContent = useMemo(() => {
    if (!phrases.length) {
      return [{ text: originalText, isHighlighted: false }];
    }

    const sortedPhrases = [...phrases].sort((a, b) => b.length - a.length);
    const matches: Array<{ start: number; end: number; phrase: string }> = [];
    
    sortedPhrases.forEach(phrase => {
      const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedPhrase, 'gi');
      let match;
      
      while ((match = regex.exec(originalText)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          phrase: match[0]
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

    const parts: Array<{ text: string; isHighlighted: boolean; phrase?: string }> = [];
    let lastIndex = 0;

    mergedMatches.forEach(match => {
      if (match.start > lastIndex) {
        parts.push({
          text: originalText.slice(lastIndex, match.start),
          isHighlighted: false
        });
      }
      
      parts.push({
        text: originalText.slice(match.start, match.end),
        isHighlighted: true,
        phrase: match.phrase
      });
      
      lastIndex = match.end;
    });

    if (lastIndex < originalText.length) {
      parts.push({
        text: originalText.slice(lastIndex),
        isHighlighted: false
      });
    }

    return parts;
  }, [originalText, phrases]);

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Eye className="h-5 w-5" />
          Explainable AI Analysis
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Highlighted text shows suspicious phrases detected in the job posting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Highlighted Text */}
        <div className="rounded-lg border border-border bg-accent/20 p-6">
          <div className="text-sm leading-relaxed text-foreground font-mono">
            {highlightedContent.map((part: { text: string; isHighlighted: boolean; phrase?: string }, index: number) => (
              <span key={index}>
                {part.isHighlighted ? (
                  <span className="bg-destructive/20 text-destructive px-1.5 py-0.5 rounded font-semibold border border-destructive/30">
                    {part.text}
                  </span>
                ) : (
                  part.text
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 rounded-lg border border-border bg-accent/30 p-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-destructive/20 border border-destructive/30" />
            <span className="text-sm text-muted-foreground">Suspicious phrase</span>
          </div>
          {phrases.length > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <AlertTriangle className="h-4 w-4 text-risk-medium" />
              <span className="text-sm text-muted-foreground">
                {phrases.length} suspicious phrase{phrases.length !== 1 ? 's' : ''} detected
              </span>
            </div>
          )}
        </div>

        {/* Detected Phrases List */}
        {phrases.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Detected Suspicious Phrases:</h3>
            <div className="flex flex-wrap gap-2">
              {phrases.map((phrase, index) => (
                <Badge 
                  key={index}
                  variant="outline"
                  className="border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20"
                >
                  {phrase}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {phrases.length === 0 && (
          <div className="rounded-lg border border-risk-low/30 bg-risk-low/10 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-risk-low" />
              <p className="text-sm text-risk-low font-medium">
                No suspicious phrases detected.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
