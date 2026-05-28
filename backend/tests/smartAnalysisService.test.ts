import { analyzeJobWithSmartFlow } from "../src/services/smartAnalysisService";
import * as aiService from "../src/services/aiService";

jest.mock("../src/services/aiService", () => ({
  analyzeJobText: jest.fn(),
}));

describe("Smart Analysis Service", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should evaluate heuristic score and return fast if USE_REAL_AI is false", async () => {
    process.env.USE_REAL_AI = "false";
    const text = "This is a normal job description for a software engineer.";
    
    const result = await analyzeJobWithSmartFlow(text) as any;
    
    expect(result).toBeDefined();
    expect(result.ai_invoked).toBe(false);
    expect(result.scam_probability).toBeLessThan(0.4);
    expect(result.risk_level).toBe("Low");
    expect(result.pipeline.heuristic_score).toBeDefined();
  });

  it("should detect obvious scam patterns with heuristics even without AI", async () => {
    process.env.USE_REAL_AI = "false";
    const text = "Urgent hiring! Pay registration fee of $50 via crypto payment or wire transfer immediately.";
    
    const result = await analyzeJobWithSmartFlow(text) as any;
    
    expect(result.ai_invoked).toBe(false);
    expect(result.scam_probability).toBeGreaterThan(0.6);
    expect(result.suspicious_phrases.length).toBeGreaterThan(0);
    expect(result.risk_level).not.toBe("Low");
  });

  it("should invoke AI if USE_REAL_AI is true and heuristic score is ambiguous", async () => {
    process.env.USE_REAL_AI = "true";
    (aiService.analyzeJobText as jest.Mock).mockResolvedValue({
      scam_probability: 0.85,
      risk_level: "High",
      confidence: 0.9,
      suspicious_phrases: ["weird phrase"],
      reasons: ["AI reason"],
      component_scores: {
        rule_score: 0.5,
        zero_shot_score: 0.9,
        similarity_score: 0.8,
      },
      phrase_details: [],
    });

    // Use a text that hits rules hard enough to be > 0.2 but < 0.8
    const text = "urgent hiring. wire transfer required. guaranteed income. no interview.";
    
    const result = await analyzeJobWithSmartFlow(text) as any;
    
    // In current implementation, if USE_REAL_AI=true, it invokes AI
    expect(result.ai_invoked).toBe(true);
    expect(result.scam_probability).toBeGreaterThan(0.6);
    expect(aiService.analyzeJobText).toHaveBeenCalled();
  });
});
