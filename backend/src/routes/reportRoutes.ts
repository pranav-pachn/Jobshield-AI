import { Router } from "express";
import {
  submitReport,
  downloadReport,
  getSharedReport,
  deleteReport,
  getUserReports,
} from "../controllers/reportController";
import { authMiddleware } from "../middleware/authMiddleware";

const reportRoutes = Router();

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
