import { Request, Response } from "express";
import { orchestrateAnalysis } from "../services/analysisOrchestrator";
import { analyzeJobWithSmartFlow } from "../services/smartAnalysisService";
import { saveAnalysisResult, getStats, getCachedAnalysisByText, computeTextHash, getRecentAnalyses as getRecentAnalysesService } from "../services/analysisStorageService";
import { AnalysisEnrichmentService } from "../services/analysisEnrichmentService";
import {
  buildThreatIntelligencePresentation,
  buildWorkflowResponse,
} from "../services/analysisPresentationService";
import scamNetworkCorrelationService from "../services/scamNetworkCorrelationService";
import urlIntelligenceService, { UrlIntelligenceResult } from "../services/urlIntelligenceService";
import { ThreatIntelligenceEngine } from "../services/threatIntelligenceEngine";
import { ThreatIndicatorExtractionService } from "../services/threatIndicatorExtractionService";
import { buildRecruiterReadyReasons } from "../services/recruiterReadyAnalysisService";
import { computeUnifiedRisk, UnifiedRiskResult } from "../services/unifiedRiskEngine";
import threatIntelligenceService from "../services/threatIntelligenceService";
import { buildGraph, extractPrimaryEmail } from "../services/analysisGraphService";
import { logger } from "../utils/logger";
import { statsCache, reportsCache } from "../middleware/cache";

function getConfidenceValue(analysis: { confidence?: number; scam_probability: number }): number {
  if (typeof analysis.confidence === "number") {
    return analysis.confidence;
  }

  return Math.max(0, Math.min(1, 0.5 + Math.abs(analysis.scam_probability - 0.5)));
}

function isUnableToAssess(
  analysis: Awaited<ReturnType<typeof analyzeJobWithSmartFlow>>,
): analysis is { status: "UNABLE_TO_ASSESS" } {
  return (analysis as { status?: string } | null | undefined)?.status === "UNABLE_TO_ASSESS";
}

export async function analyzeJob(req: Request, res: Response) {
  const text = req.body?.text;
  const recruiterEmail = req.body?.recruiter_email;
  const jobUrl = req.body?.job_url;
  const userId = (req as any).user?.id || (req as any).userId;

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
    const result = await orchestrateAnalysis(text, recruiterEmail, jobUrl, userId);
    return res.json(result);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const errStack = error instanceof Error ? error.stack : undefined;
    logger.error("[JOB_ANALYZE] Error during analysis", { message: errMsg, stack: errStack });
    return res.status(500).json({
      error: "Internal Server Error"
    });
  }
}

export async function analyzeJobStream(req: Request, res: Response) {
  const text = req.query.text as string;

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    logger.error("[JOB_ANALYZE_STREAM] Invalid request payload", {
      reason: "Text is missing or empty",
    });
    return res.status(400).json({ message: "Text is required" });
  }

  let processText = text;
  let urlIntel: UrlIntelligenceResult | undefined;

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const sendEvent = (eventType: string, data: unknown): void => {
    res.write(`event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  logger.info("[JOB_ANALYZE_STREAM] Starting streaming analysis", {
    textLength: text.length,
  });

  const startTime = Date.now();

  try {
    // 1. URL Intelligence
    if (urlIntelligenceService.isUrl(text)) {
      sendEvent("progress", {
        type: "progress",
        step: 0,
        name: "Gathering URL intelligence",
        status: "running",
        progress: 5,
      });

      urlIntel = await urlIntelligenceService.analyzeUrl(text);
      if (urlIntel.fetch_successful && urlIntel.extracted_text) {
        processText = urlIntel.extracted_text;
      }
      
      sendEvent("progress", {
        type: "progress",
        step: 0,
        name: "Gathering URL intelligence",
        status: "completed",
        progress: 10,
      });
    }

    // Send initial progress event
    sendEvent("progress", {
      type: "progress",
      step: 1,
      name: "Preprocessing input text",
      status: "running",
      progress: urlIntel ? 15 : 10,
    });

    const analysisContext = urlIntel ? 
      `[URL Intelligence: Platform: ${urlIntel.platform}, Domain Trust: ${urlIntel.platform_trust}, URL Risk: ${urlIntel.url_risk}]\n\n${processText}` 
      : processText;

    // Run the smart analysis pipeline
    const analysis = await analyzeJobWithSmartFlow(analysisContext);
    if (isUnableToAssess(analysis)) {
      sendEvent("complete", {
        type: "complete",
        success: false,
        message: "Unable to complete full analysis",
        status: "UNABLE_TO_ASSESS",
        demoMode: true,
        banner: "Demo Mode Active",
      });
      res.end();
      logger.info("[JOB_ANALYZE_STREAM] AI unable to assess input - demo/fallback active");
      return;
    }

    // Send progress updates for each pipeline stage
    sendEvent("progress", {
      type: "progress",
      step: 2,
      name: "Running scam detection rules",
      status: "completed",
      progress: 40,
    });

    sendEvent("progress", {
      type: "progress",
      step: 3,
      name: "Analyzing with AI model",
      status: "completed",
      progress: 70,
    });

    // Enrich analysis with evidence
    sendEvent("progress", {
      type: "progress",
      step: 4,
      name: "Gathering evidence and context",
      status: "running",
      progress: 85,
    });

    const streamIndicators = ThreatIndicatorExtractionService.extractIndicators(text);
    const streamOriginalRiskScore = Math.round(analysis.scam_probability * 100);
    const [enrichment, streamThreatIntel] = await Promise.all([
      AnalysisEnrichmentService.enrichAnalysis({
        job_text: text,
        scam_probability: analysis.scam_probability,
        risk_level: analysis.risk_level as "Low" | "Medium" | "High",
        suspicious_phrases: analysis.suspicious_phrases,
        component_scores: (analysis as any).component_scores,
        job_url: urlIntel ? urlIntel.original_url : undefined,
      }),
      ThreatIntelligenceEngine.checkPatterns(streamIndicators, streamOriginalRiskScore),
    ]);

    if (urlIntel) {
      enrichment.url_intelligence = urlIntel;
    }
    const streamThreatPresentation = buildThreatIntelligencePresentation(streamThreatIntel);

    // Compute unified risk for streaming endpoint (no recruiter email in stream)
    const streamUnifiedRisk = computeUnifiedRisk(
      analysis.scam_probability,
      null, // No recruiter email in streaming endpoint
      streamThreatIntel,
      streamOriginalRiskScore
    );

    const recruiterReadyReasons = buildRecruiterReadyReasons({
      risk_level: streamUnifiedRisk.riskLevel,
      reasons: analysis.reasons,
      suspicious_phrases: analysis.suspicious_phrases,
      domain_intelligence: enrichment.domain_intelligence,
      community_report_count: enrichment.community_report_count,
      job_url: urlIntel ? urlIntel.original_url : undefined,
    });

    sendEvent("progress", {
      type: "progress",
      step: 4,
      name: "Gathering evidence and context",
      status: "completed",
      progress: 95,
    });

    const totalLatency = Date.now() - startTime;

    // Build final response with unified risk engine
    const finalAnalysis = {
      scam_probability: analysis.scam_probability,
      risk_score: streamUnifiedRisk.finalScore,
      risk_level: streamUnifiedRisk.riskLevel,
      // Unified Risk Engine output
      finalScore: streamUnifiedRisk.finalScore,
      riskLevel: streamUnifiedRisk.riskLevel,
      breakdown: streamUnifiedRisk.breakdown,
      suspicious_phrases: analysis.suspicious_phrases,
      reasons: recruiterReadyReasons.reasons,
      summary_reasons: recruiterReadyReasons.summary_reasons,
      component_scores: analysis.component_scores,
      pipeline_metadata: {
        ai_invoked: analysis.ai_invoked,
        ai_latency_ms: analysis.ai_latency_ms,
        rule_score: analysis.pipeline?.rule_score,
      },
      enrichment: {
        evidence_sources: enrichment.evidence_sources,
        domain_intelligence: enrichment.domain_intelligence,
        url_intelligence: urlIntel,
        similar_patterns: enrichment.similar_patterns,
        community_report_count: enrichment.community_report_count,
        threat_intelligence: streamThreatPresentation,
      },
      threat_intelligence: streamThreatPresentation,
      network: [], // Stream doesn't query networks by default to save time
    };

    // Send completion event with final analysis
    sendEvent("complete", {
      type: "complete",
      success: true,
      message: "Analysis complete",
      analysis: finalAnalysis,
    });

    res.end();

    logger.info("[JOB_ANALYZE_STREAM] Streaming analysis complete");
  } catch (error) {
    res.end();
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

export async function saveAnalysis(req: Request, res: Response) {
  try {
    const analysisData = req.body;
    
    if (!analysisData) {
      return res.status(400).json({ message: "Analysis data is required" });
    }

    // Prepare data for storage
    const storageData = {
      user_id: (req as any).user?.id || (req as any).userId,
      job_text: analysisData.job_text || "",
      text_hash: computeTextHash(analysisData.job_text || ""),
      scam_probability: analysisData.scam_probability || 0,
      risk_level: analysisData.risk_level || "Low",
      confidence: analysisData.confidence,
      suspicious_phrases: analysisData.suspicious_phrases || [],
      reasons: analysisData.reasons || [],
      ai_latency_ms: analysisData.ai_latency_ms,
      // Enrichment data
      evidence_sources: analysisData.evidence_sources || [],
      domain_intelligence: analysisData.domain_intelligence,
      similar_patterns: analysisData.similar_patterns || [],
      community_report_count: analysisData.community_report_count || 0,
      confidence_level: analysisData.confidence_level,
      confidence_reason: analysisData.confidence_reason,
      source_links: analysisData.source_links || [],
      component_scores: analysisData.component_scores,
      // Pipeline metadata
      pipeline_metadata: analysisData.pipeline_metadata || {},
      // Save metadata
      saved_at: analysisData.saved_at || new Date().toISOString(),
      is_saved: true
    };

    const savedAnalysis = await saveAnalysisResult(storageData);
    
    // Invalidate analytics and reports caches so changes reflect in stats & feeds
    try {
      statsCache.flushAll();
      reportsCache.flushAll();
      logger.info("[CACHE] Flushed stats and reports caches due to manual save");
    } catch (cacheErr) {
      logger.error("[CACHE] Failed to flush caches on manual save", cacheErr);
    }
    
    logger.info("[JOB_SAVE] Analysis saved successfully", {
      analysis_id: savedAnalysis?._id,
      risk_level: storageData.risk_level,
      scam_probability: storageData.scam_probability
    });

    return res.json({
      success: true,
      _id: savedAnalysis?._id,
      saved_at: savedAnalysis?.created_at,
      message: "Analysis saved successfully"
    });

  } catch (error) {
    logger.error("[JOB_SAVE] Failed to save analysis", error);
    return res.status(500).json({ message: "Failed to save analysis" });
  }
}

export async function getRecentAnalyses(req: Request, res: Response) {
  try {
    const page = Number(req.query.page || 1);
    const limit = 20;
    const analyses = await getRecentAnalysesService(page, limit);

    logger.info("[JOB_ANALYZE] Retrieved recent analyses", {
      count: analyses.length,
      page,
      limit,
    });

    // Convert Mongoose documents to plain JS objects and transform fields
    // to match frontend interface expectations
    const transformedAnalyses = analyses.map((doc: any) => {
      try {
        const plainDoc = doc.toObject({ versionKey: false });
        
        // Transform fields to match frontend interface
        return {
          id: plainDoc._id,
          timestamp: plainDoc.created_at,
          risk_level: plainDoc.risk_level,
          scam_probability: plainDoc.scam_probability,
          job_text_preview: plainDoc.job_text ? plainDoc.job_text.substring(0, 150) + (plainDoc.job_text.length > 150 ? "..." : "") : "No preview available",
          suspicious_phrases: plainDoc.suspicious_phrases || []
        };
      } catch {
        // If a single doc is malformed, return a safe plain object representation
        const plainDoc = JSON.parse(JSON.stringify(doc));
        return {
          id: plainDoc._id,
          timestamp: plainDoc.created_at,
          risk_level: plainDoc.risk_level,
          scam_probability: plainDoc.scam_probability,
          job_text_preview: plainDoc.job_text ? plainDoc.job_text.substring(0, 150) + (plainDoc.job_text.length > 150 ? "..." : "") : "No preview available",
          suspicious_phrases: plainDoc.suspicious_phrases || []
        };
      }
    });

    // Return just the array as expected by frontend
    return res.json(transformedAnalyses);
  } catch (error) {
    logger.error("[JOB_ANALYZE] Failed to retrieve recent analyses", error);
    return res.status(500).json({ message: "Failed to retrieve analyses" });
  }
}
