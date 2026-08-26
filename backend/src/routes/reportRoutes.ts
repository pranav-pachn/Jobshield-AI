import { Router } from "express";
import {
  submitReport,
  downloadReport,
  getSharedReport,
  deleteReport,
  getUserReports,
} from "../controllers/reportController";
import { authMiddleware } from "../middleware/authMiddleware";
import { InvestigationReportService } from "../services/investigationReportService";
import { logger } from "../utils/logger";

const reportRoutes = Router();

// Phase 7: Web-first canonical report
reportRoutes.get("/investigation/:investigationId", authMiddleware, async (req, res) => {
  try {
    const { investigationId } = req.params as { investigationId: string };
    if (!investigationId) return res.status(400).json({ error: "Investigation ID is required" });

    const report = await InvestigationReportService.generateReport(investigationId);
    if (!report) return res.status(404).json({ error: "Investigation not found" });

    res.json(report);
  } catch (error) {
    logger.error("Error fetching investigation report:", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
});

// POST /api/reports/submit - Generate new report (protected)
reportRoutes.post("/submit", authMiddleware, submitReport);

// GET /api/reports/:report_id - Download report (protected)
reportRoutes.get("/:report_id", authMiddleware, downloadReport);

// DELETE /api/reports/:report_id - Delete report (protected)
reportRoutes.delete("/:report_id", authMiddleware, deleteReport);

// GET /api/reports/user/all - List user's reports (protected)
reportRoutes.get("/user/all", authMiddleware, getUserReports);

// Public routes
// GET /api/reports/share/:share_token - Access shared report (public)
reportRoutes.get("/share/:share_token", getSharedReport);

export default reportRoutes;
