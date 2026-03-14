"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Fingerprint } from "lucide-react";

interface SuspiciousTextHighlighterProps {
  originalText: string;
  phrases: string[];
}

export function SuspiciousTextHighlighter({ originalText, phrases }: SuspiciousTextHighlighterProps) {
  const highlightedContent = useMemo(() => {
    if (!phrases.length) {
      return [{ text: originalText, isHighlighted: false }];
    }

    // Sort phrases by length (longest first) to avoid partial matches
    const sortedPhrases = [...phrases].sort((a, b) => b.length - a.length);
    
    // Find all matches with their positions
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

    // Sort matches by start position
    matches.sort((a, b) => a.start - b.start);

    // Merge overlapping matches
    const mergedMatches: Array<{ start: number; end: number; phrase: string }> = [];
    for (const match of matches) {
      if (mergedMatches.length === 0) {
        mergedMatches.push(match);
      } else {
        const lastMatch = mergedMatches[mergedMatches.length - 1];
        if (match.start <= lastMatch.end) {
          // Overlapping - merge them
          lastMatch.end = Math.max(lastMatch.end, match.end);
        } else {
          mergedMatches.push(match);
        }
      }
    }

    // Build the highlighted content
    const parts: Array<{ text: string; isHighlighted: boolean; phrase?: string }> = [];
    let lastIndex = 0;

    mergedMatches.forEach(match => {
      // Add text before the match
      if (match.start > lastIndex) {
        parts.push({
          text: originalText.slice(lastIndex, match.start),
          isHighlighted: false
        });
      }
      
      // Add the highlighted text
      parts.push({
        text: originalText.slice(match.start, match.end),
        isHighlighted: true,
        phrase: match.phrase
      });
      
      lastIndex = match.end;
    });

    // Add remaining text
    if (lastIndex < originalText.length) {
      parts.push({
        text: originalText.slice(lastIndex),
        isHighlighted: false
      });
    }

    return parts;
  }, [originalText, phrases]);

  return (
    <Card className="glass-card shadow-xl overflow-hidden">
      <CardHeader className="border-b border-border bg-card/40 pb-4 pt-6">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Fingerprint className="h-5 w-5 text-primary" />
          Explainable AI Inspector
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        
        {/* Highlighted Text Window */}
        <div className="rounded-xl border border-border bg-black/40 p-1 font-mono text-sm leading-relaxed shadow-inner">
          <div className="flex h-8 w-full items-center gap-2 border-b border-border bg-card/60 px-4">
             <div className="h-3 w-3 rounded-full bg-destructive/60" />
             <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
             <div className="h-3 w-3 rounded-full bg-green-500/60" />
             <span className="ml-2 text-xs text-muted-foreground uppercase tracking-wider">Payload Inspector</span>
          </div>
          <div className="p-5 text-gray-300">
            {highlightedContent.map((part: { text: string; isHighlighted: boolean; phrase?: string }, index: number) => (
              <span key={index}>
                {part.isHighlighted ? (
                  <span className="relative inline-block mx-0.5 rounded bg-destructive/20 px-1 font-bold text-red-400 shadow-[0_0_10px_rgba(var(--destructive),0.3)] ring-1 ring-destructive/40">
                    {part.text}
                  </span>
                ) : (
                  part.text
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Status Strip */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-card/40 px-4 py-3">
          <div className="flex items-center gap-3">
            {phrases.length > 0 ? (
              <>
                <div className="flex h-2 w-2 items-center justify-center">
                  <div className="h-2 w-2 animate-ping rounded-full bg-destructive" />
                </div>
                <span className="text-sm font-medium text-destructive">
                  {phrases.length} indicators found in text
                </span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-green-500">
                  Clean payload detected
                </span>
              </>
            )}
          </div>
          {phrases.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-end max-w-[50%]">
              {phrases.slice(0, 3).map((phrase, index) => (
                <Badge 
                  key={index}
                  variant="outline"
                  className="bg-destructive/10 text-destructive border-transparent text-[10px]"
                >
                  {phrase.length > 20 ? phrase.substring(0, 20) + "..." : phrase}
                </Badge>
              ))}
              {phrases.length > 3 && (
                <Badge variant="outline" className="bg-muted text-muted-foreground text-[10px]">
                  +{phrases.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
