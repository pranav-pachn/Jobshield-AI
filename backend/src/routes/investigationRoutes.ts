import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { investigateJob, investigateJobStream, getInvestigationById } from "../services/investigationService";
import { logger } from "../utils/logger";

const investigationRoutes = Router();

investigationRoutes.post("/", authMiddleware, async (req, res) => {
  try {
    const trace = await investigateJob(req.body);
    res.status(200).json(trace);
  } catch (error) {
    logger.error("[INVESTIGATION_ROUTES] Failed to investigate job", { error });
    res.status(500).json({ error: "Failed to investigate job" });
  }
});

investigationRoutes.post("/stream", authMiddleware, async (req, res) => {
  try {
    await investigateJobStream(req.body, res);
  } catch (error) {
    logger.error("[INVESTIGATION_ROUTES] Failed to stream investigation", { error });
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to stream investigation" });
    }
  }
});

investigationRoutes.get("/:id", authMiddleware, async (req, res) => {
  try {
    const trace = await getInvestigationById(req.params.id);
    if (!trace) {
      res.status(404).json({ error: "Investigation not found" });
      return;
    }
    res.status(200).json(trace);
  } catch (error) {
    logger.error("[INVESTIGATION_ROUTES] Failed to retrieve investigation", { error });
    res.status(500).json({ error: "Failed to retrieve investigation" });
  }
});

export default investigationRoutes;
