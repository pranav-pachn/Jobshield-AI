import { buildRiskBreakdown } from "../src/explainability/riskBreakdown";
import { RISK_SIGNAL_RULES } from "../src/services/riskSignalRules";

describe("Risk Breakdown Consistency", () => {
  it("should sum up the explanation ledger to match the deterministic signal penalties", () => {
    const mockInvestigationResult: any = {
      verdict: "SCAM",
      confidence: 0.9,
      evidence: [],
      contradictions: [],
      trace: [],
      agentMetrics: {} as any,
      signals: [
        { type: "advance_fee", severity: "CRITICAL", description: "advance fee" },
        { type: "suspicious_domain", severity: "HIGH", description: "bad domain" },
        { type: "recruiter_mismatch", severity: "MEDIUM", description: "mismatch" }
      ]
    };

    const expectedTotalPenalty = 
      RISK_SIGNAL_RULES["advance_fee"].points + 
      RISK_SIGNAL_RULES["suspicious_domain"].points + 
      RISK_SIGNAL_RULES["recruiter_mismatch"].points;

    const breakdown = buildRiskBreakdown(mockInvestigationResult);
    
    const breakdownTotal = breakdown.reduce((sum, item) => sum + item.contribution, 0);

    expect(breakdownTotal).toEqual(expectedTotalPenalty);
  });

  it("should deduplicate duplicate signals from agent", () => {
    const mockInvestigationResult: any = {
      signals: [
        { type: "advance_fee", severity: "CRITICAL", description: "advance fee 1" },
        { type: "advance_fee", severity: "CRITICAL", description: "advance fee 2" }
      ]
    };

    const expectedTotalPenalty = RISK_SIGNAL_RULES["advance_fee"].points;

    const breakdown = buildRiskBreakdown(mockInvestigationResult);
    const breakdownTotal = breakdown.reduce((sum, item) => sum + item.contribution, 0);

    expect(breakdown.length).toBe(1);
    expect(breakdownTotal).toEqual(expectedTotalPenalty);
  });
});
