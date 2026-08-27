import { Router } from "express";
import { EvaluationRun } from "../models/EvaluationRun";
import { authMiddleware, requireRole } from "../middleware/authMiddleware";
import { logger } from "../utils/logger";

const evaluationRoutes = Router();

// Protect all evaluation routes for Analysts and Admins
evaluationRoutes.use(authMiddleware);
evaluationRoutes.use(requireRole(["ANALYST", "ADMIN"]));

// GET /api/evaluation/runs - List all evaluation runs
evaluationRoutes.get("/runs", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const runs = await EvaluationRun.find()
      .sort({ startedAt: -1 })
      .limit(limit)
      .select("-failureCases -regressions -retrievalMetrics -explainabilityMetrics") // Exclude heavy fields for summary
      .lean();

    res.json(runs);
  } catch (error) {
    logger.error("Error fetching evaluation runs:", error);
    res.status(500).json({ error: "Failed to fetch evaluation runs" });
  }
});

// GET /api/evaluation/runs/:id - Get details for a specific run
evaluationRoutes.get("/runs/:id", async (req, res) => {
  try {
    const run = await EvaluationRun.findOne({ runId: req.params.id }).lean();
    if (!run) {
      return res.status(404).json({ error: "Evaluation run not found" });
    }
    res.json(run);
  } catch (error) {
    logger.error(`Error fetching evaluation run ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to fetch evaluation run" });
  }
});

export default evaluationRoutes;
