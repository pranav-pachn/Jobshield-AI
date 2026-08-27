import { orchestrateAnalysis } from "../src/services/analysisOrchestrator";
import * as smartAnalysisService from "../src/services/smartAnalysisService";
import * as storageService from "../src/services/analysisStorageService";

jest.mock("../src/services/smartAnalysisService");
jest.mock("../src/services/analysisStorageService");
jest.mock("../src/services/analysisEnrichmentService", () => ({
  AnalysisEnrichmentService: {
    enrichAnalysis: jest.fn().mockResolvedValue({
      evidence_sources: [],
      domain_intelligence: null,
      similar_patterns: [],
      community_report_count: 0,
      confidence_level: "Medium",
      confidence_reason: "",
      source_links: [],
    }),
  }
}));
jest.mock("../src/services/threatIntelligenceEngine", () => ({
  ThreatIntelligenceEngine: {
    checkPatterns: jest.fn().mockResolvedValue({ found: false, frequency: 0, risk_boost: 0, details: [], similar_domains: [], similar_phrases: [] }),
    storeThreatIndicators: jest.fn().mockResolvedValue(null),
  }
}));
jest.mock("../src/services/scamNetworkCorrelationService", () => ({
  __esModule: true,
  default: {
    getNetworksForAnalysis: jest.fn().mockResolvedValue([]),
  }
}));
jest.mock("../src/services/threatIntelligenceService", () => ({
  __esModule: true,
  default: {
    checkRecruiterEmail: jest.fn().mockResolvedValue({ score: 50 }),
  }
}));
jest.mock("../src/services/recruiterProfileService", () => ({
  __esModule: true,
  default: {
    findOrCreateProfile: jest.fn().mockResolvedValue({ profile: { _id: "profile1" } }),
    linkInvestigation: jest.fn().mockResolvedValue(null),
  }
}));
jest.mock("../src/services/campaignDetectionService", () => ({
  __esModule: true,
  default: {
    detectCampaigns: jest.fn().mockResolvedValue(null),
  }
}));
jest.mock("../src/models/InvestigationTrace", () => ({
  InvestigationTrace: {
    create: jest.fn().mockResolvedValue({}),
  }
}));
jest.mock("../src/models/ScamEntity", () => ({
  __esModule: true,
  default: {
    findOne: jest.fn().mockResolvedValue({ save: jest.fn() }),
  }
}));

describe("analysisOrchestrator", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should use cache if available", async () => {
    (storageService.getCachedAnalysisByText as jest.Mock).mockResolvedValue({
      _id: "cached-id",
      text_hash: "hash123",
      scam_probability: 0.9,
      risk_level: "High",
      confidence: 0.9,
      suspicious_phrases: ["urgent"],
      reasons: ["reason"],
      component_scores: {},
      pipeline_metadata: {},
      evidence_sources: [],
      similar_patterns: [],
      source_links: [],
    });

    const result = await orchestrateAnalysis("test text");
    
    expect(result.cached).toBe(true);
    expect(result._id).toBe("cached-id");
    expect(smartAnalysisService.analyzeJobWithSmartFlow).not.toHaveBeenCalled();
  });

  it("should run new analysis if not cached", async () => {
    (storageService.getCachedAnalysisByText as jest.Mock).mockResolvedValue(null);
    (storageService.saveAnalysisResult as jest.Mock).mockResolvedValue({ _id: "new-id" });
    
    (smartAnalysisService.analyzeJobWithSmartFlow as jest.Mock).mockResolvedValue({
      scam_probability: 0.8,
      risk_level: "High",
      confidence: 0.8,
      suspicious_phrases: ["fee"],
      reasons: ["reason 1"],
      component_scores: {},
      ai_invoked: true,
      ai_latency_ms: 100,
      pipeline: {
        preprocessed_length: 10,
        rule_score: 0.5,
        heuristic_score: 0.5,
        ai_triggered_by: "high_uncertainty",
      }
    });

    const result = await orchestrateAnalysis("test text new");
    
    expect(result.cached).toBeUndefined();
    expect(smartAnalysisService.analyzeJobWithSmartFlow).toHaveBeenCalled();
    expect(storageService.saveAnalysisResult).toHaveBeenCalled();
  });
});
