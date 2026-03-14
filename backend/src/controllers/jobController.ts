import { Request, Response } from "express";
import { analyzeJobText } from "../services/aiService";
import { saveAnalysisResult, getStats } from "../services/analysisStorageService";
import { logger } from "../utils/logger";

export async function analyzeJob(req: Request, res: Response) {
  const text = req.body?.text;
  const startTime = Date.now();

  logger.info("[JOB_ANALYZE] Incoming request", {
    path: req.originalUrl,
    textLength: typeof text === "string" ? text.length : 0,
  });

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    logger.error("[JOB_ANALYZE] Invalid request payload", {
      reason: "Text is missing or empty",
    });
    return res.status(400).json({ message: "Text is required" });
  }

  try {
    const analysis = await analyzeJobText(text);
    const aiLatency = Date.now() - startTime;

    // Store analysis result in MongoDB
    const storageData = {
      job_text: text,
      scam_probability: analysis.scam_probability,
      risk_level: analysis.risk_level as "Low" | "Medium" | "High",
      suspicious_phrases: analysis.suspicious_phrases,
      reasons: analysis.reasons,
      ai_latency_ms: aiLatency,
    };

    // Save asynchronously - don't wait for it to complete before responding
    saveAnalysisResult(storageData).catch((error) => {
      // Error is already logged in the storage service
      logger.error("[JOB_ANALYZE] Background storage failed", error);
    });

    logger.info("[JOB_ANALYZE] Returning response", {
      ...analysis,
      ai_latency_ms: aiLatency,
    });
    
    return res.json({
      ...analysis,
      ai_latency_ms: aiLatency,
    });
  } catch (error) {
    logger.error("[JOB_ANALYZE] AI service unavailable", error);
    return res.status(502).json({ message: "AI service unavailable" });
  }
}

export async function getJobStats(req: Request, res: Response) {
  try {
    const stats = await getStats();
    logger.info("[JOB_STATS] Retrieved stats", stats);
    return res.json(stats);
  } catch (error) {
    logger.error("[JOB_STATS] Failed to retrieve stats", error);
    return res.status(500).json({ message: "Failed to retrieve stats" });
  }
}

export async function getRecentAnalyses(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const analyses = await import("../services/analysisStorageService").then(
      (module) => module.getRecentAnalyses(limit)
    );

    logger.info("[JOB_ANALYZE] Retrieved recent analyses", {
      count: analyses.length,
      limit,
    });

    return res.json({
      analyses,
      count: analyses.length,
      limit,
    });
  } catch (error) {
    logger.error("[JOB_ANALYZE] Failed to retrieve recent analyses", error);
    return res.status(500).json({ message: "Failed to retrieve analyses" });
  }
}
