"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Eye } from "lucide-react";

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
    <Card className="border-gray-700 bg-gray-800 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-100">
          <Eye className="h-5 w-5" />
          Highlighted Scam Indicators
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Highlighted Text */}
        <div className="rounded-lg border border-gray-600 bg-gray-700/50 p-6">
          <div className="text-sm leading-relaxed text-gray-300">
            {highlightedContent.map((part: { text: string; isHighlighted: boolean; phrase?: string }, index: number) => (
              <span key={index}>
                {part.isHighlighted ? (
                  <span className="bg-red-500/20 text-red-400 px-1 rounded font-medium">
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
        <div className="flex items-center gap-4 rounded-lg border border-gray-600 bg-gray-700/30 p-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-red-500/20"></div>
            <span className="text-sm text-gray-400">Suspicious phrase</span>
          </div>
          {phrases.length > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-gray-400">
                {phrases.length} suspicious phrase{phrases.length !== 1 ? 's' : ''} detected
              </span>
            </div>
          )}
        </div>

        {/* Detected Phrases List */}
        {phrases.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Detected Suspicious Phrases:</h3>
            <div className="flex flex-wrap gap-2">
              {phrases.map((phrase, index) => (
                <Badge 
                  key={index}
                  variant="outline"
                  className="border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                >
                  {phrase}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {phrases.length === 0 && (
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              <p className="text-sm text-green-300">
                No suspicious phrases detected.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
