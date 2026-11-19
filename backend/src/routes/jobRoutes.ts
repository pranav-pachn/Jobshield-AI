import { Router } from "express";
import { analyzeJob, analyzeJobStream, getRecentAnalyses, getJobStats, saveAnalysis } from "../controllers/jobController";
import { cacheMiddleware, reportsCache, statsCache } from "../middleware/cache";
import { authMiddleware } from "../middleware/authMiddleware";
import { validateAnalyzeInput } from "../middleware/zodValidation";
import jobExtractorService from "../services/jobExtractorService";

const jobRoutes = Router();

jobRoutes.post("/extract-url", authMiddleware, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ success: false, error: "A valid URL string is required" });
    }
    const result = await jobExtractorService.extractFromUrl(url);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: "We couldn't automatically retrieve this job posting. Paste the job description or recruiter message below to continue.",
    });
  }
});

// Streaming analysis endpoint (must come before POST /analyze)
jobRoutes.get("/analyze/stream", authMiddleware, analyzeJobStream);

jobRoutes.post("/analyze", authMiddleware, validateAnalyzeInput, analyzeJob);
jobRoutes.post("/save", authMiddleware, saveAnalysis);
jobRoutes.get("/recent", authMiddleware, getRecentAnalyses);
jobRoutes.get("/stats", authMiddleware, getJobStats);

export default jobRoutes;
