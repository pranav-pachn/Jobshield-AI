import { Request, Response } from "express";
import { analyzeJobText } from "../services/aiService";
import { saveAnalysisResult, getStats } from "../services/analysisStorageService";
import { AnalysisEnrichmentService } from "../services/analysisEnrichmentService";
import { logger } from "../utils/logger";

export async function analyzeJob(req: Request, res: Response) {
  const text = req.body?.text;
  const recruiterEmail = req.body?.recruiter_email;
  const recruiterPhone = req.body?.recruiter_phone;
  const jobUrl = req.body?.job_url;
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

    // Enrich analysis with explainable AI data
    const enrichment = await AnalysisEnrichmentService.enrichAnalysis({
      job_text: text,
      scam_probability: analysis.scam_probability,
      risk_level: analysis.risk_level as "Low" | "Medium" | "High",
      suspicious_phrases: analysis.suspicious_phrases,
      component_scores: (analysis as any).component_scores, // May be provided by AI service
      recruiter_email: recruiterEmail,
      recruiter_phone: recruiterPhone,
      job_url: jobUrl,
    });

    // Store analysis result in MongoDB with enrichment data
    const storageData = {
      job_text: text,
      scam_probability: analysis.scam_probability,
      risk_level: analysis.risk_level as "Low" | "Medium" | "High",
      suspicious_phrases: analysis.suspicious_phrases,
      reasons: analysis.reasons,
      ai_latency_ms: aiLatency,
      // Add enrichment data
      evidence_sources: enrichment.evidence_sources,
      domain_intelligence: enrichment.domain_intelligence,
      similar_patterns: enrichment.similar_patterns,
      community_report_count: enrichment.community_report_count,
      confidence_level: enrichment.confidence_level,
      confidence_reason: enrichment.confidence_reason,
      source_links: enrichment.source_links,
      component_scores: (analysis as any).component_scores,
    };

    // Save analysis and wait for it to complete (needed for getting _id for reports)
    const savedAnalysis = await saveAnalysisResult(storageData);

    logger.info("[JOB_ANALYZE] Returning enriched response", {
      ...analysis,
      ai_latency_ms: aiLatency,
      enrichment_evidence_count: enrichment.evidence_sources.length,
      analysis_id: savedAnalysis?._id,
    });
    
    return res.json({
      _id: savedAnalysis?._id, // Include MongoDB _id for report generation
      ...analysis,
      ai_latency_ms: aiLatency,
      ...enrichment, // Include all enrichment data
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
