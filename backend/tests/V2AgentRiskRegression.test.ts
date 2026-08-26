import { computeAgentRisk } from "../src/services/signalNormalizer";
import { InvestigationResult } from "../src/agent/types";

describe("V2 Agent Risk Regression", () => {
  it("should classify a high-confidence agent SCAM with advance_fee as High Risk (not Safe)", () => {
    const mockInvestigationResult: InvestigationResult = {
      verdict: "SCAM",
      confidence: 0.95,
      signals: [
        {
          type: "advance_fee",
          severity: "CRITICAL",
          description: "Requests upfront payment."
        }
      ],
      evidence: [
        {
          id: "mock-2",
          sourceType: "advisory",
          summary: "Registration fee scam."
        }
      ],
      contradictions: [],
      trace: [],
      agentMetrics: {} as any
    };

    const riskResult = computeAgentRisk(mockInvestigationResult);

    expect(riskResult.finalScore).toBeGreaterThan(75);
    expect(riskResult.riskLevel).toBe("High");
  });

  it("should classify a confident agent SAFE as Low Risk with correct score", () => {
    const mockInvestigationResult: InvestigationResult = {
      verdict: "SAFE",
      confidence: 0.90,
      signals: [],
      evidence: [],
      contradictions: [],
      trace: [],
      agentMetrics: {} as any
    };

    const riskResult = computeAgentRisk(mockInvestigationResult);

    // Score should just be base score 20
    expect(riskResult.finalScore).toEqual(20);
    expect(riskResult.riskLevel).toBe("Low");
  });
});
