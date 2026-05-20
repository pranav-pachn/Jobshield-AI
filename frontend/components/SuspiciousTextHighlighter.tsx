"use client";

import { HighlightedJobText } from "./HighlightedJobText";

interface SuspiciousTextHighlighterProps {
  originalText: string;
  phrases: string[];
}

export function SuspiciousTextHighlighter({ originalText, phrases }: SuspiciousTextHighlighterProps) {
  return <HighlightedJobText originalText={originalText} suspiciousPhrases={phrases} />;
}
