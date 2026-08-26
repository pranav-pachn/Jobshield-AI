import { Router } from "express";
import { LearningService } from "../services/learningService";
import { authMiddleware, requireRole } from "../middleware/authMiddleware";
import { logger } from "../utils/logger";

const learningRoutes = Router();

learningRoutes.use(authMiddleware);

// List pending feedback (Analysts/Admins only)
learningRoutes.get("/feedback/pending", requireRole(["ANALYST", "ADMIN"]), async (req, res) => {
  try {
    const pending = await LearningService.getPendingFeedback();
    res.json(pending);
  } catch (error) {
    logger.error("Error fetching pending feedback:", error);
    res.status(500).json({ error: "Failed to fetch pending feedback" });
  }
});

// Approve feedback and generate KnowledgeItem (Analysts/Admins only)
learningRoutes.post("/feedback/:id/approve", requireRole(["ANALYST", "ADMIN"]), async (req: any, res) => {
  try {
    const { id } = req.params;
    const { knowledgeContent, knowledgeCategory } = req.body;

    if (!knowledgeContent || !knowledgeCategory) {
      return res.status(400).json({ error: "Missing knowledge details" });
    }

    const result = await LearningService.approveFeedback(
      id,
      req.user.id,
      knowledgeContent,
      knowledgeCategory
    );

    res.json(result);
  } catch (error: any) {
    logger.error(`Error approving feedback ${req.params.id}:`, error);
    res.status(500).json({ error: error.message || "Failed to approve feedback" });
  }
});

// Reject feedback (Analysts/Admins only)
learningRoutes.post("/feedback/:id/reject", requireRole(["ANALYST", "ADMIN"]), async (req: any, res) => {
  try {
    const { id } = req.params;
    const feedback = await LearningService.rejectFeedback(id, req.user.id);
    res.json(feedback);
  } catch (error) {
    logger.error(`Error rejecting feedback ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to reject feedback" });
  }
});

export default learningRoutes;
