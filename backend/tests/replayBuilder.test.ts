import { buildReplayEvents } from "../src/explainability/replayBuilder";
import { IInvestigationTrace } from "../src/models/InvestigationTrace";

describe("replayBuilder", () => {
  const mockTrace: Partial<IInvestigationTrace> = {
    startedAt: new Date("2024-01-01T00:00:00Z"),
    steps: [
      { step: 1, tool: "analyze_url", status: "success", latencyMs: 500 },
      { step: 2, tool: "analyze_recruiter", status: "success", latencyMs: 600 }
    ],
    evidence: [
      { signal: "suspicious_domain", description: "Bad domain", source: { type: "url", id: "1", title: "Domain" }, retrievedAt: new Date() }
    ],
    riskBreakdown: [
      { signal: "suspicious_domain", contribution: 20 },
      { signal: "registration_fee", contribution: 25 }
    ]
  };

  const mockAnalysis = {
    _id: "test-id",
    created_at: new Date("2024-01-01T00:00:00Z"),
    risk_level: "CRITICAL",
    scam_probability: 0.91,
    confidence: 90
  };

  const mockCampaigns = [
    { campaignId: "CAMPAIGN-0042", name: "Fake Job Campaign" }
  ];

  it("should generate a correct sequence of replay events", () => {
    const events = buildReplayEvents(mockTrace as any, mockAnalysis, mockCampaigns);
    
    // We expect:
    // 1. START
    // 2. TOOL_CALL (URL)
    // 3. TOOL_CALL (Recruiter)
    // 4. EVIDENCE
    // 5. RISK
    // 6. CAMPAIGN
    // 7. VERDICT
    expect(events).toHaveLength(7);

    expect(events[0].type).toBe("START");
    expect(events[1].type).toBe("TOOL_CALL");
    expect(events[1].title).toBe("URL INTELLIGENCE");
    expect(events[2].type).toBe("TOOL_CALL");
    expect(events[2].title).toBe("RECRUITER INTELLIGENCE");
    expect(events[3].type).toBe("EVIDENCE_FOUND");
    expect(events[4].type).toBe("RISK_CALCULATION");
    expect(events[5].type).toBe("CAMPAIGN_DETECTED");
    expect(events[5].campaignId).toBe("CAMPAIGN-0042");
    expect(events[6].type).toBe("FINAL_VERDICT");
    expect(events[6].title).toBe("FINAL INVESTIGATION RESULT");
  });

  it("should handle INCONCLUSIVE/ABSTAIN verdicts", () => {
    const abstainAnalysis = { ...mockAnalysis, risk_level: "UNKNOWN", confidence: 10 };
    const events = buildReplayEvents(mockTrace as any, abstainAnalysis, []);
    
    const verdictEvent = events[events.length - 1];
    expect(verdictEvent.type).toBe("FINAL_VERDICT");
    expect(verdictEvent.title).toContain("INCONCLUSIVE");
    expect(events.find(e => e.type === "CAMPAIGN_DETECTED")).toBeUndefined();
  });

  it("should skip tools that were not executed", () => {
    const shortTrace = { ...mockTrace, steps: [{ step: 1, tool: "analyze_url", status: "success", latencyMs: 500 }] };
    const events = buildReplayEvents(shortTrace as any, mockAnalysis, []);
    
    const toolEvents = events.filter(e => e.type === "TOOL_CALL");
    expect(toolEvents).toHaveLength(1);
    expect(toolEvents[0].title).toBe("URL INTELLIGENCE");
  });
});
