import { Router } from "express";
import { analyzeJob, analyzeJobStream, getRecentAnalyses, getJobStats, saveAnalysis } from "../controllers/jobController";
import { cacheMiddleware, reportsCache, statsCache } from "../middleware/cache";
import { authMiddleware } from "../middleware/authMiddleware";
import { validateAnalyzeInput } from "../middleware/zodValidation";

const jobRoutes = Router();

// Streaming analysis endpoint (must come before POST /analyze)
jobRoutes.get("/analyze/stream", authMiddleware, analyzeJobStream);

jobRoutes.post("/analyze", authMiddleware, validateAnalyzeInput, analyzeJob);
jobRoutes.post("/save", authMiddleware, saveAnalysis);
jobRoutes.get("/recent", authMiddleware, cacheMiddleware(reportsCache, 600), getRecentAnalyses);
jobRoutes.get("/stats", authMiddleware, cacheMiddleware(statsCache, 300), getJobStats);

export default jobRoutes;
