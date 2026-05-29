import { calculateThreatScore, computeUnifiedRisk, getRiskLevel } from "../src/services/unifiedRiskEngine";

describe("unifiedRiskEngine", () => {
  it("keeps unknown recruiter and threat signals neutral instead of safest", () => {
    const result = computeUnifiedRisk(
      0.1,
      null,
      {
        found: false,
        frequency: 0,
        risk_boost: 0,
        details: [],
        similar_domains: [],
        similar_phrases: [],
      },
      0,
    );

    expect(result.breakdown.recruiterScore).toBe(50);
    expect(result.breakdown.threatScore).toBe(50);
    expect(result.finalScore).toBe(30);
    expect(result.riskLevel).toBe("Low");
  });

  it("calculates threat score from matching indicators", () => {
    const threatScore = calculateThreatScore(
      {
        found: true,
        frequency: 7,
        risk_boost: 18,
        details: [],
        similar_domains: ["example-scam.com"],
        similar_phrases: ["urgent hiring"],
      },
      40,
    );

    expect(threatScore).toBeGreaterThanOrEqual(30);
  });

  it("maps final scores to the expected risk level", () => {
    expect(getRiskLevel(80)).toBe("High");
    expect(getRiskLevel(50)).toBe("Medium");
    expect(getRiskLevel(40)).toBe("Low");
  });

  it("computes high confidence when all signals agree on high risk", () => {
    const result = computeUnifiedRisk(
      0.9, // High AI risk (90)
      90,  // High recruiter risk
      { found: true, frequency: 50, risk_boost: 50, details: [], similar_domains: ["a","b","c","d","e","f"], similar_phrases: [] }, // High threat risk
      90
    );
    expect(result.confidence).toBeGreaterThan(80);
    expect(result.riskLevel).toBe("High");
  });

  it("computes lower confidence when signals disagree", () => {
    const result = computeUnifiedRisk(
      0.1, // Low AI risk (10)
      90,  // High recruiter risk
      { found: true, frequency: 50, risk_boost: 50, details: [], similar_domains: ["a","b","c","d","e","f"], similar_phrases: [] }, // High threat risk
      10
    );
    expect(result.confidence).toBeLessThan(70);
  });
});