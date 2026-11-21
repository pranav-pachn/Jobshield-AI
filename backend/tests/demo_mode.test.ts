import request from "supertest";

// Mock auth middleware so tests run purely offline without requiring live MongoDB connection
jest.mock("../src/middleware/authMiddleware", () => ({
  authMiddleware: (req: any, _res: any, next: any) => {
    req.user = { id: "507f1f77bcf86cd799439011", role: "USER" };
    req.userId = "507f1f77bcf86cd799439011";
    next();
  },
  requireRole: () => (_req: any, _res: any, next: any) => next(),
}));

// Mock rate limiter to avoid 429 in fast test runs
jest.mock("../src/middleware/rateLimiter", () => ({
  investigationLimiter: (_req: any, _res: any, next: any) => next(),
  apiLimiter: (_req: any, _res: any, next: any) => next(),
}));

import app from "../src/server";
import * as investigationService from "../src/services/investigationService";
import { 
  getDemoScenarioSummaries, 
  getDemoScenario, 
  isDemoId, 
  DEMO_SCENARIOS 
} from "../src/demo/demoScenarios";
import { Investigation } from "../src/models/Investigation";
import { JobAnalysis } from "../src/models/JobAnalysis";
import { InvestigationFeedback } from "../src/models/InvestigationFeedback";

describe("Demo Mode Isolation & Regression Tests", () => {
  describe("Scenario Registry", () => {
    it("should provide exactly 6 pre-computed deterministic scenarios", () => {
      const summaries = getDemoScenarioSummaries();
      expect(summaries.length).toBe(6);

      const categories = summaries.map(s => s.category);
      expect(categories).toContain("SCAM");
      expect(categories).toContain("SAFE");
      expect(categories).toContain("HUMAN_REVIEW");
    });

    it("should ensure every demo scenario strictly conforms to InvestigationTrace", () => {
      for (const [id, record] of Object.entries(DEMO_SCENARIOS)) {
        expect(record.id).toBe(id);
        const trace = record.trace;
        expect(trace.executionMode).toBe("DEMO");
        expect(trace.isSimulated).toBe(true);
        expect(trace.state).toBe("COMPLETED");
        expect(trace.investigationId).toBe(id);
        expect(Array.isArray(trace.agentTraces)).toBe(true);
        expect(trace.agentTraces.length).toBeGreaterThanOrEqual(4);
        expect(trace.finalDecision).toBeDefined();
        expect(trace.finalDecision.verdict).toBeDefined();
        expect(trace.finalDecision.why.length).toBeGreaterThan(0);
        expect(trace.evaluation).toBeDefined();
        expect(trace.evaluation.overall_risk).toBeDefined();
        expect(trace.decisionPolicy).toBeDefined();
        expect(["SAFE", "SCAM", "HUMAN_REVIEW"]).toContain(trace.decisionPolicy.decision);
      }
    });

    it("should correctly identify demo IDs and reject non-demo IDs", () => {
      expect(isDemoId("demo-scam-equipment-check")).toBe(true);
      expect(isDemoId("demo-safe-tech-lead")).toBe(true);
      expect(isDemoId("demo-custom-id")).toBe(true);
      expect(isDemoId("a5d6f831-419b-4654-8c01-7fa0d2358043")).toBe(false);
      expect(isDemoId("65e0f1112233445566778899")).toBe(false);
      expect(isDemoId(undefined)).toBe(false);
    });
  });

  describe("Demo Endpoints & Execution Isolation", () => {
    let liveInvestigateSpy: jest.SpyInstance;
    let liveStreamSpy: jest.SpyInstance;
    let investCreateSpy: jest.SpyInstance;
    let jobAnalysisCreateSpy: jest.SpyInstance;

    beforeEach(() => {
      liveInvestigateSpy = jest.spyOn(investigationService, "investigateJob");
      liveStreamSpy = jest.spyOn(investigationService, "investigateJobStream");
      investCreateSpy = jest.spyOn(Investigation, "create");
      jobAnalysisCreateSpy = jest.spyOn(JobAnalysis, "create");
    });

    afterEach(() => {
      liveInvestigateSpy.mockRestore();
      liveStreamSpy.mockRestore();
      investCreateSpy.mockRestore();
      jobAnalysisCreateSpy.mockRestore();
    });

    it("GET /api/investigations/demo/scenarios should return all scenarios", async () => {
      const res = await request(app).get("/api/investigations/demo/scenarios");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(6);
      expect(res.body[0]).toHaveProperty("id");
      expect(res.body[0]).toHaveProperty("title");
      expect(res.body[0]).toHaveProperty("category");
    });

    it("POST /api/investigations/demo should return demo trace and NEVER invoke live AI service or write to DB", async () => {
      const res = await request(app)
        .post("/api/investigations/demo")
        .send({ scenarioId: "demo-scam-equipment-check" });

      expect(res.status).toBe(200);
      expect(res.body.investigationId).toBe("demo-scam-equipment-check");
      expect(res.body.executionMode).toBe("DEMO");
      expect(res.body.isSimulated).toBe(true);
      expect(res.body.decisionPolicy.decision).toBe("SCAM");

      // Verify ZERO calls to live AI service
      expect(liveInvestigateSpy).not.toHaveBeenCalled();
      expect(liveStreamSpy).not.toHaveBeenCalled();

      // Verify ZERO writes to Mongo collections
      expect(investCreateSpy).not.toHaveBeenCalled();
      expect(jobAnalysisCreateSpy).not.toHaveBeenCalled();
    });

    it("POST /api/investigations with mode='demo' routes directly to demo path", async () => {
      const res = await request(app)
        .post("/api/investigations")
        .send({ mode: "demo", scenarioId: "demo-safe-tech-lead" });

      expect(res.status).toBe(200);
      expect(res.body.investigationId).toBe("demo-safe-tech-lead");
      expect(res.body.executionMode).toBe("DEMO");
      expect(res.body.isSimulated).toBe(true);
      expect(res.body.decisionPolicy.decision).toBe("SAFE");

      expect(liveInvestigateSpy).not.toHaveBeenCalled();
      expect(investCreateSpy).not.toHaveBeenCalled();
    });

    it("POST /api/investigations/demo/stream should emit valid SSE events and complete cleanly", async () => {
      const res = await request(app)
        .post("/api/investigations/demo/stream")
        .send({ scenarioId: "demo-safe-tech-lead" });

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("text/event-stream");
      expect(res.text).toContain("event: STATE_UPDATE");
      expect(res.text).toContain("event: AGENT_COMPLETED");
      expect(res.text).toContain("event: COMPLETE");
      expect(res.text).toContain("demo-safe-tech-lead");

      expect(liveInvestigateSpy).not.toHaveBeenCalled();
      expect(liveStreamSpy).not.toHaveBeenCalled();
    });

    it("GET /api/investigations/:id for demo id should return formatted demo investigation without Mongo query", async () => {
      const res = await request(app)
        .get("/api/investigations/demo-scam-equipment-check");

      expect(res.status).toBe(200);
      expect(res.body.investigation.id).toBe("demo-scam-equipment-check");
      expect(res.body.mode).toBe("DEMO");
      expect(res.body.verdict.label).toBe("High");
    });

    it("GET /api/investigations/:id/trace for demo id should return demo trace directly from memory", async () => {
      const res = await request(app)
        .get("/api/investigations/demo-scam-equipment-check/trace");

      expect(res.status).toBe(200);
      expect(res.body.investigationId).toBe("demo-scam-equipment-check");
      expect(res.body.executionMode).toBe("DEMO");
      expect(res.body.isSimulated).toBe(true);
    });

    it("GET /api/investigations/:id/timeline for demo id should return memory timeline", async () => {
      const res = await request(app)
        .get("/api/investigations/demo-review-stealth-startup/timeline");

      expect(res.status).toBe(200);
      expect(res.body.investigationId).toBe("demo-review-stealth-startup");
      expect(Array.isArray(res.body.events)).toBe(true);
      expect(res.body.events.length).toBeGreaterThan(0);
    });

    it("GET /api/investigations/:id/explanation for demo id should return memory explanation", async () => {
      const res = await request(app)
        .get("/api/investigations/demo-scam-telegram-crypto/explanation");

      expect(res.status).toBe(200);
      expect(res.body.investigationId).toBe("demo-scam-telegram-crypto");
      expect(Array.isArray(res.body.signals)).toBe(true);
      expect(res.body.signals.length).toBeGreaterThan(0);
    });

    it("POST /api/investigations/:id/feedback for demo id should skip persistence to avoid contaminating analytics", async () => {
      const feedbackSaveSpy = jest.spyOn(InvestigationFeedback.prototype, "save");

      const res = await request(app)
        .post("/api/investigations/demo-scam-equipment-check/feedback")
        .send({ verdict: "CORRECT", feedbackType: "ACCURATE", comment: "Test demo feedback" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(feedbackSaveSpy).not.toHaveBeenCalled();

      feedbackSaveSpy.mockRestore();
    });
  });
});
