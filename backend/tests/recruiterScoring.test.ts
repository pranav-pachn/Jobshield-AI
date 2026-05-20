import threatIntelligenceService from "../src/services/threatIntelligenceService";

describe("recruiter scoring", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("combines domain and channel scoring for recruiter emails", async () => {
    const service = threatIntelligenceService as any;

    jest.spyOn(service, "checkDomain").mockResolvedValue({
      domain: "example.com",
      isSuspicious: false,
      threatLevel: "low",
      score: 20,
      sources: {},
      details: ["Domain age: 400 days"],
    });

    jest.spyOn(service, "analyzeCommunicationChannels").mockResolvedValue([
      {
        platform: "Telegram",
        username: "hr123",
        isVerified: false,
        riskScore: 20,
        threats: ["Bot-like username pattern"],
      },
    ]);

    const result = await threatIntelligenceService.checkRecruiterEmail("hr@example.com");

    expect(result).not.toBeNull();
    expect(result?.score).toBe(40);
    expect(result?.isSuspicious).toBe(true);
    expect(result?.details.join(" ")).toContain("Communication channel risks detected");
  });

  it("returns null for invalid recruiter emails", async () => {
    const result = await threatIntelligenceService.checkRecruiterEmail("invalid-email");

    expect(result).toBeNull();
  });
});