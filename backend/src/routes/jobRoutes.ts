import { Router } from "express";
import { analyzeJob, analyzeJobStream, getRecentAnalyses, getJobStats, saveAnalysis } from "../controllers/jobController";
import { cacheMiddleware, reportsCache, statsCache } from "../middleware/cache";
// import { authMiddleware } from "../middleware/authMiddleware";

const jobRoutes = Router();

// Streaming analysis endpoint (must come before POST /analyze)
jobRoutes.get("/analyze/stream", analyzeJobStream);

// Temporarily remove auth middleware for testing
jobRoutes.post("/analyze", analyzeJob);
jobRoutes.post("/save", saveAnalysis);
jobRoutes.get("/recent", cacheMiddleware(reportsCache, 600), getRecentAnalyses);
jobRoutes.get("/stats", cacheMiddleware(statsCache, 300), getJobStats);

export default jobRoutes;
