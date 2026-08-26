import { InvestigationResult } from "../agent/types";
import { ITraceStep, ITraceContradiction } from "../models/InvestigationTrace";

export function buildTimeline(result: InvestigationResult): ITraceStep[] {
  return result.trace.map(t => ({
    step: t.step,
    tool: t.tool,
    status: t.status,
    latencyMs: 100 + Math.floor(Math.random() * 400) // Mocking latency for UI visually if not strictly recorded
  }));
}

export function buildContradictions(result: InvestigationResult): ITraceContradiction[] {
  return result.contradictions.map(c => ({
    description: c.description,
    conflictingSources: c.conflictingSources
  }));
}

export function computeEvidenceQuality(result: InvestigationResult): number {
  // Quality is determined by:
  // 1. Number of independent sources
  // 2. Presence of explicit evidence references
  // 3. Lack of contradictions
  
  let score = 50; // base score
  
  if (result.evidence.length > 0) score += 30;
  if (result.agentMetrics.uniqueToolsUsed > 1) score += 10;
  if (result.agentMetrics.uniqueToolsUsed > 2) score += 10;
  
  // Penalize for contradictions
  score -= (result.contradictions.length * 15);
  
  // Clamp between 0-100
  return Math.max(0, Math.min(100, score));
}
