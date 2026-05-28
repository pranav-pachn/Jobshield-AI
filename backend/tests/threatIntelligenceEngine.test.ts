import { ThreatIntelligenceEngine } from "../src/services/threatIntelligenceEngine";
import { ThreatLog } from "../src/models/ThreatLog";
import { ExtractedIndicators } from "../src/services/threatIndicatorExtractionService";

jest.mock("../src/models/ThreatLog");

describe("Threat Intelligence Engine", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("checkPatterns", () => {
    it("should return neutral score if no indicators are present", async () => {
      const indicators: ExtractedIndicators = {
        suspicious_phrases: [],
        website_domain: undefined,
        email_domain: undefined,
        phone_numbers: [],
        salary_pattern: "normal",
      };

      const result = await ThreatIntelligenceEngine.checkPatterns(indicators, 50);
      
      expect(result.found).toBe(false);
      expect(result.risk_boost).toBe(0);
      expect(result.frequency).toBe(0);
    });

    it("should detect known malicious domains and apply high risk boost", async () => {
      const indicators: ExtractedIndicators = {
        suspicious_phrases: [],
        website_domain: "scam-domain.com",
        email_domain: undefined,
        phone_numbers: [],
        salary_pattern: "normal",
      };

      (ThreatLog.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([
          { website_domain: "scam-domain.com", created_at: new Date() },
          { website_domain: "scam-domain.com", created_at: new Date() },
          { website_domain: "scam-domain.com", created_at: new Date() }
        ])
      });

      const result = await ThreatIntelligenceEngine.checkPatterns(indicators, 50);
      
      expect(result.found).toBe(true);
      expect(result.risk_boost).toBeGreaterThan(0);
      expect(result.frequency).toBe(3);
    });
  });
});
