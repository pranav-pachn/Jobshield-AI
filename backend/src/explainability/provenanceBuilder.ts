import { InvestigationResult } from "../agent/types";
import { ITraceEvidence } from "../models/InvestigationTrace";

export function buildProvenance(result: InvestigationResult): ITraceEvidence[] {
  // Agent already builds a simplified EvidenceReferenceSchema
  // We enrich it to ensure it perfectly matches the trace schema.
  return result.evidence.map(e => ({
    signal: e.summary.split(" ")[0] || "threat_match", // fallback derived from summary
    description: e.summary,
    source: {
      type: e.sourceType,
      id: e.id,
      title: "Threat Evidence" // We can look this up in the KB, but for now we rely on the agent's summary or fallback.
    },
    similarity: e.similarity !== undefined ? e.similarity : undefined,
    retrievedAt: new Date()
  }));
}
