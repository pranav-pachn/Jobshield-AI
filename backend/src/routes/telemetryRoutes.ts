import { Router, Request, Response } from "express";
import { LLMInvocation } from "../models/LLMInvocation";
import { logger } from "../utils/logger";

const router = Router();

// POST /api/telemetry/llm-invocation
// High-throughput fire-and-forget telemetry endpoint
router.post("/llm-invocation", async (req: Request, res: Response) => {
  try {
    const invocations = Array.isArray(req.body) ? req.body : [req.body];
    
    // We don't await this so we can immediately return 202 Accepted
    // This ensures telemetry ingestion is non-blocking for the AI service.
    LLMInvocation.insertMany(invocations).catch(error => {
      logger.error("Failed to insert async LLM invocations:", error);
    });

    res.status(202).json({ accepted: true, count: invocations.length });
  } catch (error) {
    logger.error("Error processing LLM telemetry payload:", error);
    res.status(500).json({ error: "Failed to process telemetry payload" });
  }
});

export const telemetryRoutes = router;
