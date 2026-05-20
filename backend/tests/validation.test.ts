import express from "express";
import request from "supertest";
import type { Request, Response } from "express";
import { validateJobAnalysis } from "../src/middleware/validation";
import { handleValidation } from "../src/middleware/handleValidation";

function createApp() {
  const app = express();
  app.use(express.json());

  app.post("/validate", validateJobAnalysis, handleValidation, (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  return app;
}

describe("validation middleware", () => {
  it("accepts valid analysis payloads", async () => {
    const app = createApp();

    const response = await request(app)
      .post("/validate")
      .send({
        text: "Earn money from home with no interview required and immediate start.",
        recruiter_email: "recruiter@example.com",
        job_url: "https://example.com/jobs/123",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });

  it("rejects invalid analysis payloads", async () => {
    const app = createApp();

    const response = await request(app)
      .post("/validate")
      .send({
        text: "too short",
        recruiter_email: "not-an-email",
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ msg: expect.stringContaining("Job description/text must be between 20 and 5000 characters") }),
    ]));
  });
});