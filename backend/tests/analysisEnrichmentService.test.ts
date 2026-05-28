import { AnalysisEnrichmentService } from "../src/services/analysisEnrichmentService";
import { JobReport } from "../src/models/JobReport";
import threatIntelService from "../src/services/threatIntelligenceService";

jest.mock("../src/models/JobReport");
jest.mock("../src/services/threatIntelligenceService");

describe("Analysis Enrichment Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("enrichAnalysis", () => {
    it("should provide community report counts and evidence sources", async () => {
      // Mock community reports found
      (JobReport.countDocuments as jest.Mock).mockResolvedValue(3);
      (threatIntelService.checkDomain as jest.Mock).mockResolvedValue({
        domain: "telegram.me",
        score: 80,
        threatLevel: "high",
        sources: { domainAge: 10 }
      });

      const params = {
        job_text: "Contact me on telegram.me/scammer for immediate hiring.",
        scam_probability: 0.8,
        risk_level: "High" as const,
        suspicious_phrases: ["immediate hiring"],
        recruiter_email: "test@example.com"
      };

      const result = await AnalysisEnrichmentService.enrichAnalysis(params);

      expect(result.community_report_count).toBe(3);
      expect(result.evidence_sources.length).toBeGreaterThan(0);
      expect(result.evidence_sources).toContainEqual(
        expect.objectContaining({ source: "Combined Analysis" })
      );
    });

    it("should fallback gracefully if database fails", async () => {
      (JobReport.countDocuments as jest.Mock).mockRejectedValue(new Error("DB Error"));
      (threatIntelService.checkDomain as jest.Mock).mockResolvedValue({
        domain: "test.com",
        score: 10,
        threatLevel: "low",
      });
      
      const params = {
        job_text: "Standard job",
        scam_probability: 0.2,
        risk_level: "Low" as const,
        suspicious_phrases: []
      };

      const result = await AnalysisEnrichmentService.enrichAnalysis(params);

      expect(result.community_report_count).toBe(0);
      expect(result.confidence_level).toBeDefined();
    });
  });
});
