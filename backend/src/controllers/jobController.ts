import { Request, Response } from "express";
import { analyzeJobWithSmartFlow } from "../services/smartAnalysisService";
import { saveAnalysisResult, getStats, getCachedAnalysisByText, computeTextHash } from "../services/analysisStorageService";
import { AnalysisEnrichmentService } from "../services/analysisEnrichmentService";
import scamNetworkCorrelationService from "../services/scamNetworkCorrelationService";
import { logger } from "../utils/logger";

function buildWorkflowResponse(params: {
  text: string;
  analysis: {
    scam_probability: number;
    risk_level: "Low" | "Medium" | "High";
    confidence?: number;
    suspicious_phrases: string[];
    reasons: string[];
  };
  componentScores?: unknown;
  pipelineMetadata?: unknown;
  enrichment: {
    evidence_sources?: unknown[];
    domain_intelligence?: unknown;
    similar_patterns?: unknown[];
    community_report_count?: number;
    confidence_level?: string;
    confidence_reason?: string;
    source_links?: unknown[];
  };
  network: unknown[];
  cached: boolean;
}) {
  return {
    user_input: {
      status: "completed",
      data: {
        text_length: params.text.length,
      },
    },
    ai_analyzes: {
      status: params.cached ? "skipped_cached_result" : "completed",
      data: {
        scam_probability: params.analysis.scam_probability,
        risk_level: params.analysis.risk_level,
        confidence: params.analysis.confidence,
        suspicious_phrases: params.analysis.suspicious_phrases,
      },
    },
    explains_reasoning: {
      status: "completed",
      data: {
        reasons: params.analysis.reasons,
        component_scores: params.componentScores,
        pipeline_metadata: params.pipelineMetadata,
      },
    },
    shows_evidence: {
      status: "completed",
      data: {
        evidence_sources: params.enrichment.evidence_sources || [],
        domain_intelligence: params.enrichment.domain_intelligence,
        similar_patterns: params.enrichment.similar_patterns || [],
        community_report_count: params.enrichment.community_report_count || 0,
        confidence_level: params.enrichment.confidence_level,
        confidence_reason: params.enrichment.confidence_reason,
        source_links: params.enrichment.source_links || [],
      },
    },
    builds_scam_network: {
      status: "completed",
      data: {
        correlations: params.network || [],
        total_network_links: (params.network || []).length,
      },
    },
  };
}

function getConfidenceValue(analysis: { confidence?: number; scam_probability: number }): number {
  if (typeof analysis.confidence === "number") {
    return analysis.confidence;
  }

  return Math.max(0, Math.min(1, 0.5 + Math.abs(analysis.scam_probability - 0.5)));
}

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
    const cachedAnalysis = await getCachedAnalysisByText(text);
    if (cachedAnalysis) {
      logger.info("[JOB_ANALYZE] Returning cached analysis (AI skipped)", {
        analysis_id: cachedAnalysis._id,
        text_hash: cachedAnalysis.text_hash,
      });

      const networks = await scamNetworkCorrelationService.getNetworksForAnalysis(
        cachedAnalysis._id.toString(),
      );

      return res.json({
        _id: cachedAnalysis._id,
        success: true,
        cached: true,
        workflow: buildWorkflowResponse({
          text,
          cached: true,
          analysis: {
            scam_probability: cachedAnalysis.scam_probability,
            risk_level: cachedAnalysis.risk_level as "Low" | "Medium" | "High",
            confidence: getConfidenceValue({
              confidence: cachedAnalysis.confidence,
              scam_probability: cachedAnalysis.scam_probability,
            }),
            suspicious_phrases: cachedAnalysis.suspicious_phrases || [],
            reasons: cachedAnalysis.reasons || [],
          },
          componentScores: cachedAnalysis.component_scores,
          pipelineMetadata: cachedAnalysis.pipeline_metadata,
          enrichment: {
            evidence_sources: cachedAnalysis.evidence_sources || [],
            domain_intelligence: cachedAnalysis.domain_intelligence,
            similar_patterns: cachedAnalysis.similar_patterns || [],
            community_report_count: cachedAnalysis.community_report_count || 0,
            confidence_level: cachedAnalysis.confidence_level,
            confidence_reason: cachedAnalysis.confidence_reason,
            source_links: cachedAnalysis.source_links || [],
          },
          network: networks || [],
        }),
        analysis: {
          scam_probability: cachedAnalysis.scam_probability,
          risk_level: cachedAnalysis.risk_level,
          confidence: getConfidenceValue({
            confidence: cachedAnalysis.confidence,
            scam_probability: cachedAnalysis.scam_probability,
          }),
          suspicious_phrases: cachedAnalysis.suspicious_phrases,
          reasons: cachedAnalysis.reasons,
          phrase_details: (cachedAnalysis as any).phrase_details || [],
        },
        pipeline_metadata: cachedAnalysis.pipeline_metadata,
        component_scores: cachedAnalysis.component_scores,
        enrichment: {
          evidence_sources: cachedAnalysis.evidence_sources || [],
          domain_intelligence: cachedAnalysis.domain_intelligence,
          similar_patterns: cachedAnalysis.similar_patterns || [],
          community_report_count: cachedAnalysis.community_report_count || 0,
          confidence_level: cachedAnalysis.confidence_level,
          confidence_reason: cachedAnalysis.confidence_reason,
          source_links: cachedAnalysis.source_links || [],
        },
        network: networks || [],
      });
    }

    const analysis = await analyzeJobWithSmartFlow(text);
    const totalLatency = Date.now() - startTime;

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
      text_hash: computeTextHash(text),
      scam_probability: analysis.scam_probability,
      risk_level: analysis.risk_level as "Low" | "Medium" | "High",
      confidence: analysis.confidence,
      suspicious_phrases: analysis.suspicious_phrases,
      reasons: analysis.reasons,
      ai_latency_ms: analysis.ai_latency_ms,
      // Add enrichment data
      evidence_sources: enrichment.evidence_sources,
      domain_intelligence: enrichment.domain_intelligence,
      similar_patterns: enrichment.similar_patterns,
      community_report_count: enrichment.community_report_count,
      confidence_level: enrichment.confidence_level,
      confidence_reason: enrichment.confidence_reason,
      source_links: enrichment.source_links,
      component_scores: (analysis as any).component_scores,
      // Add pipeline metadata
      pipeline_metadata: {
        ai_invoked: analysis.ai_invoked,
        ai_latency_ms: analysis.ai_latency_ms,
        rule_score: analysis.pipeline?.rule_score || 0,
        heuristic_score: analysis.pipeline?.heuristic_score || 0,
        ai_triggered_by: analysis.pipeline?.ai_triggered_by || "not_needed",
        preprocessed_length: analysis.pipeline?.preprocessed_length || text.length,
      },
    };

    // Save analysis and wait for it to complete (needed for getting _id for reports)
    const savedAnalysis = await saveAnalysisResult(storageData);
    const networks = savedAnalysis?._id
      ? await scamNetworkCorrelationService.getNetworksForAnalysis(savedAnalysis._id.toString())
      : [];

    logger.info("[JOB_ANALYZE] Smart analysis pipeline complete", {
      ai_invoked: analysis.ai_invoked,
      ai_latency_ms: analysis.ai_latency_ms,
      total_latency_ms: totalLatency,
      rule_score: analysis.pipeline?.rule_score,
      heuristic_score: analysis.pipeline?.heuristic_score,
      final_probability: analysis.scam_probability,
      risk_level: analysis.risk_level,
      ai_trigger_reason: analysis.pipeline?.ai_triggered_by,
      enrichment_evidence_count: enrichment.evidence_sources.length,
      analysis_id: savedAnalysis?._id,
    });
    
    return res.json({
      _id: savedAnalysis?._id, // Include MongoDB _id for report generation
      success: true,
      workflow: buildWorkflowResponse({
        text,
        cached: false,
        analysis: {
          scam_probability: analysis.scam_probability,
          risk_level: analysis.risk_level as "Low" | "Medium" | "High",
          confidence: analysis.confidence,
          suspicious_phrases: analysis.suspicious_phrases || [],
          reasons: analysis.reasons || [],
        },
        componentScores: analysis.component_scores,
        pipelineMetadata: {
          ai_invoked: analysis.ai_invoked,
          ai_latency_ms: analysis.ai_latency_ms,
          total_latency_ms: totalLatency,
          rule_score: analysis.pipeline?.rule_score,
          heuristic_score: analysis.pipeline?.heuristic_score,
          ai_triggered_by: analysis.pipeline?.ai_triggered_by,
          preprocessed_length: analysis.pipeline?.preprocessed_length,
        },
        enrichment: {
          evidence_sources: enrichment.evidence_sources,
          domain_intelligence: enrichment.domain_intelligence,
          similar_patterns: enrichment.similar_patterns,
          community_report_count: enrichment.community_report_count,
          confidence_level: enrichment.confidence_level,
          confidence_reason: enrichment.confidence_reason,
          source_links: enrichment.source_links,
        },
        network: networks,
      }),
      analysis: {
        scam_probability: analysis.scam_probability,
        risk_level: analysis.risk_level,
        confidence: analysis.confidence,
        suspicious_phrases: analysis.suspicious_phrases,
        reasons: analysis.reasons,
        phrase_details: analysis.phrase_details || [],
      },
      pipeline_metadata: {
        ai_invoked: analysis.ai_invoked,
        ai_latency_ms: analysis.ai_latency_ms,
        total_latency_ms: totalLatency,
        rule_score: analysis.pipeline?.rule_score,
        heuristic_score: analysis.pipeline?.heuristic_score,
        ai_triggered_by: analysis.pipeline?.ai_triggered_by,
        preprocessed_length: analysis.pipeline?.preprocessed_length,
      },
      component_scores: analysis.component_scores,
      enrichment: {
        evidence_sources: enrichment.evidence_sources,
        domain_intelligence: enrichment.domain_intelligence,
        similar_patterns: enrichment.similar_patterns,
        community_report_count: enrichment.community_report_count,
        confidence_level: enrichment.confidence_level,
        confidence_reason: enrichment.confidence_reason,
        source_links: enrichment.source_links,
      },
      network: networks,
    });
  } catch (error) {
    logger.error("[JOB_ANALYZE] AI service unavailable", error);
    return res.status(502).json({ message: "AI service unavailable" });
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

  try {
    // Send initial progress event
    sendEvent("progress", {
      type: "progress",
      step: 1,
      name: "Preprocessing input text",
      status: "running",
      progress: 10,
    });

    // Run the smart analysis pipeline
    const analysis = await analyzeJobWithSmartFlow(text);

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

    const enrichment = await AnalysisEnrichmentService.enrichAnalysis({
      job_text: text,
      scam_probability: analysis.scam_probability,
      risk_level: analysis.risk_level as "Low" | "Medium" | "High",
      suspicious_phrases: analysis.suspicious_phrases,
      component_scores: (analysis as any).component_scores,
    });

    sendEvent("progress", {
      type: "progress",
      step: 4,
      name: "Gathering evidence and context",
      status: "completed",
      progress: 95,
    });

    // Build final response
    const totalLatency = Date.now();
    const finalAnalysis = {
      scam_probability: analysis.scam_probability,
      risk_level: analysis.risk_level,
      suspicious_phrases: analysis.suspicious_phrases,
      reasons: analysis.reasons,
      component_scores: analysis.component_scores,
      pipeline_metadata: {
        ai_invoked: analysis.ai_invoked,
        ai_latency_ms: analysis.ai_latency_ms,
        rule_score: analysis.pipeline?.rule_score,
      },
      enrichment: {
        evidence_sources: enrichment.evidence_sources,
        domain_intelligence: enrichment.domain_intelligence,
        similar_patterns: enrichment.similar_patterns,
        community_report_count: enrichment.community_report_count,
      },
    };

    // Send completion event with final analysis
    sendEvent("complete", {
      type: "complete",
      success: true,
      analysis: finalAnalysis,
    });

    sendEvent("close", { message: "Analysis complete" });
    res.end();

    logger.info("[JOB_ANALYZE_STREAM] Streaming analysis complete");
  } catch (error) {
    logger.error("[JOB_ANALYZE_STREAM] Streaming analysis failed", error);

    sendEvent("error", {
      type: "error",
      message: error instanceof Error ? error.message : "Analysis failed",
    });

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
    const limit = parseInt(req.query.limit as string) || 10;
    const analyses = await import("../services/analysisStorageService").then(
      (module) => module.getRecentAnalyses(limit)
    );

    logger.info("[JOB_ANALYZE] Retrieved recent analyses", {
      count: analyses.length,
      limit,
    });

    // Convert Mongoose documents to plain JS objects and transform fields
    // to match frontend interface expectations
    const transformedAnalyses = analyses.map((doc) => {
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
