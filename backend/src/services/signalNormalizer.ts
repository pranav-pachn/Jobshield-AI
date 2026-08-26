import { InvestigationResult } from "../agent/types";
import { computeUnifiedRisk, UnifiedRiskResult } from "./unifiedRiskEngine";
import { RISK_SIGNAL_RULES } from "./riskSignalRules";

export function computeAgentRisk(result: InvestigationResult): UnifiedRiskResult {
  // 1. Base Score
  let rawScore = 20;

  // 2. Weighted Signals from RiskSignalRules
  let totalSignalPenalty = 0;
  for (const signal of result.signals) {
    const rule = RISK_SIGNAL_RULES[signal.type];
    const penalty = rule ? rule.points : (signal.severity === "CRITICAL" ? 25 : (signal.severity === "HIGH" ? 15 : 5));
    totalSignalPenalty += penalty;
  }
  
  // 3. Other deterministic components
  const hasRecruiterSignal = result.signals.some(s => s.type.includes("recruiter") || s.type.includes("email"));
  const recruiterPenalty = hasRecruiterSignal ? 30 : 0;

  const hasThreatEvidence = result.evidence.length > 0;
  const threatPenalty = hasThreatEvidence ? (20 + result.evidence.length * 10) : 0;

  rawScore += totalSignalPenalty + recruiterPenalty + threatPenalty;

  // 4. Final calculation: Clamp(0, 100)
  const finalScore = Math.min(100, Math.max(0, rawScore));
  
  let riskLevel: "High" | "Medium" | "Low" = "Low";
  if (finalScore > 75) riskLevel = "High";
  else if (finalScore > 40) riskLevel = "Medium";

  // Confidence is boosted by evidence
  const confidence = Math.min(100, result.confidence * 100 + (result.evidence.length * 10));

  // If agent found a CONFLICT, it defaults to ABSTAIN state (confidence 0).
  if (result.verdict === "CONFLICT" || result.verdict === "ABSTAIN") {
    return {
      finalScore,
      riskLevel: "ABSTAIN",
      confidence: 0,
      breakdown: { aiScore: totalSignalPenalty, recruiterScore: recruiterPenalty, threatScore: threatPenalty }
    };
  }

  return {
    finalScore,
    riskLevel,
    confidence: Math.round(confidence),
    breakdown: { aiScore: totalSignalPenalty, recruiterScore: recruiterPenalty, threatScore: threatPenalty }
  };
}
