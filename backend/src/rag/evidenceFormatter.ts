import { RetrievedEvidence } from "../knowledge/vectorSearchService";

export function formatEvidence(evidences: RetrievedEvidence[]): string {
  if (!evidences || evidences.length === 0) {
    return "No similar historical threats found.";
  }

  let formatted = "### Related Threat Intelligence\n\n";

  evidences.forEach((ev, i) => {
    const similarityPercent = Math.round(ev.similarity * 100);
    formatted += `THREAT EVIDENCE #${i + 1}\n`;
    formatted += `Title: ${ev.item.title}\n`;
    formatted += `Category: ${ev.item.category}\n`;
    formatted += `Similarity: ${similarityPercent}%\n`;
    formatted += `Source: ${ev.item.source} (${ev.item.sourceType})\n`;
    formatted += `Relevant Pattern:\n${ev.item.content}\n\n`;
  });

  formatted += "Instructions: Use the above evidence to determine if the current job description follows these known scam patterns. Do not let the evidence make the final verdict unconditionally; use it as context for your own reasoning.";

  return formatted;
}
