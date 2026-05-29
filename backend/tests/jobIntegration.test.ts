import request from "supertest";
import express from "express";
import jobRoutes from "../src/routes/jobRoutes";
import * as orchestrator from "../src/services/analysisOrchestrator";

// Mock the orchestrator
jest.mock("../src/services/analysisOrchestrator", () => ({
  orchestrateAnalysis: jest.fn(),
}));

// Mock auth middleware to bypass auth
jest.mock("../src/middleware/authMiddleware", () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    req.user = { id: "test-user-id" };
    next();
  }
}));

const app = express();
app.use(express.json());
app.use("/api/jobs", jobRoutes);

describe("Job API Integration", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("POST /api/jobs/analyze should return 400 if text is missing", async () => {
    const response = await request(app)
      .post("/api/jobs/analyze")
      .send({});
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
  });

  it("POST /api/jobs/analyze should return analysis result on success", async () => {
    const mockResult = {
      success: true,
      riskLevel: "High",
      finalScore: 85,
      breakdown: { aiScore: 90, recruiterScore: 50, threatScore: 80 }
    };
    (orchestrator.orchestrateAnalysis as jest.Mock).mockResolvedValue(mockResult);

    const response = await request(app)
      .post("/api/jobs/analyze")
      .send({ text: "Earn $5000 daily via wire transfer" });
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockResult);
    expect(orchestrator.orchestrateAnalysis).toHaveBeenCalledWith(
      "Earn $5000 daily via wire transfer",
      undefined,
      undefined,
      "test-user-id"
    );
  });

  it("POST /api/jobs/analyze should pass recruiterEmail and jobUrl to orchestrator", async () => {
    (orchestrator.orchestrateAnalysis as jest.Mock).mockResolvedValue({ success: true });

    await request(app)
      .post("/api/jobs/analyze")
      .send({ 
        text: "test job description", 
        recruiter_email: "scam@gmail.com",
        job_url: "http://fake-job.com"
      });
    
    expect(orchestrator.orchestrateAnalysis).toHaveBeenCalledWith(
      "test job description",
      "scam@gmail.com",
      "http://fake-job.com",
      "test-user-id"
    );
  });
});
