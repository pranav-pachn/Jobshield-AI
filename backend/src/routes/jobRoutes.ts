import { Router } from "express";
import { analyzeJob, getRecentAnalyses, getJobStats } from "../controllers/jobController";
// import { authMiddleware } from "../middleware/authMiddleware";

const jobRoutes = Router();

// Temporarily remove auth middleware for testing
jobRoutes.post("/analyze", analyzeJob);
jobRoutes.get("/recent", getRecentAnalyses);
jobRoutes.get("/stats", getJobStats);

export default jobRoutes;
