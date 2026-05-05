import { Request, Response } from "express";
import { analyzeJobWithSmartFlow } from "../services/smartAnalysisService";
import { saveAnalysisResult, getStats, getCachedAnalysisByText, computeTextHash } from "../services/analysisStorageService";
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
import { logger } from "../utils/logger";

function getConfidenceValue(analysis: { confidence?: number; scam_probability: number }): number {
  if (typeof analysis.confidence === "number") {
    return analysis.confidence;
  }

  return Math.max(0, Math.min(1, 0.5 + Math.abs(analysis.scam_probability - 0.5)));
}

export async function analyzeJob(req: Request, res: Response) {
  const text = req.body?.text;
  const recruiterEmail = req.body?.recruiter_email;
  const jobUrl = req.body?.job_url;

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

  let processText = text;
  let urlIntel: UrlIntelligenceResult | undefined;

  // 1. URL Interception & Intelligence
  if (urlIntelligenceService.isUrl(text)) {
    logger.info("[JOB_ANALYZE] URL detected, running URL intelligence pipeline");
    urlIntel = await urlIntelligenceService.analyzeUrl(text);
    if (urlIntel.fetch_successful && urlIntel.extracted_text) {
      processText = urlIntel.extracted_text;
    }
  }

  try {
    const cachedAnalysis = await getCachedAnalysisByText(text);
    if (cachedAnalysis) {
      const cachedIndicators = ThreatIndicatorExtractionService.extractIndicators(text);
      const cachedThreatIntel = await ThreatIntelligenceEngine.checkPatterns(
        cachedIndicators,
        Math.round(cachedAnalysis.scam_probability * 100),
      );
      const cachedThreatPresentation = buildThreatIntelligencePresentation(cachedThreatIntel);
      const cachedRiskScore = Math.round(cachedAnalysis.scam_probability * 100);
      const cachedRecruiterReasons = buildRecruiterReadyReasons({
        risk_level: cachedAnalysis.risk_level as "Low" | "Medium" | "High",
        reasons: cachedAnalysis.reasons || [],
        suspicious_phrases: cachedAnalysis.suspicious_phrases || [],
        domain_intelligence: cachedAnalysis.domain_intelligence,
        community_report_count: cachedAnalysis.community_report_count || 0,
        recruiter_email: recruiterEmail,
        job_url: jobUrl,
      });

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
            risk_score: cachedRiskScore,
            risk_level: cachedAnalysis.risk_level as "Low" | "Medium" | "High",
            confidence: getConfidenceValue({
              confidence: cachedAnalysis.confidence,
              scam_probability: cachedAnalysis.scam_probability,
            }),
            suspicious_phrases: cachedAnalysis.suspicious_phrases || [],
            reasons: cachedRecruiterReasons.reasons,
            summary_reasons: cachedRecruiterReasons.summary_reasons,
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
            url_intelligence: cachedAnalysis.url_intelligence,
          },
          threatIntelligence: cachedThreatPresentation,
          network: networks || [],
        }),
        analysis: {
          scam_probability: cachedAnalysis.scam_probability,
          risk_score: cachedRiskScore,
          risk_level: cachedAnalysis.risk_level,
          confidence: getConfidenceValue({
            confidence: cachedAnalysis.confidence,
            scam_probability: cachedAnalysis.scam_probability,
          }),
          suspicious_phrases: cachedAnalysis.suspicious_phrases,
          reasons: cachedRecruiterReasons.reasons,
          summary_reasons: cachedRecruiterReasons.summary_reasons,
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
          url_intelligence: cachedAnalysis.url_intelligence,
          threat_intelligence: cachedThreatPresentation,
        },
        network: networks || [],
      });
    }

    const startTime = Date.now();
    // Pass the context into the pipeline (the AI service will use the combined context)
    const analysisContext = urlIntel ? 
      `[URL Intelligence: Platform: ${urlIntel.platform}, Domain Trust: ${urlIntel.platform_trust}, URL Risk: ${urlIntel.url_risk}]\n\n${processText}` 
      : processText;

    const analysis = await analyzeJobWithSmartFlow(analysisContext);
    const totalLatency = Date.now() - startTime;

    // Enrich analysis with explainable AI data
    const enrichment = await AnalysisEnrichmentService.enrichAnalysis({
      job_text: text,
      scam_probability: analysis.scam_probability,
      risk_level: analysis.risk_level as "Low" | "Medium" | "High",
      suspicious_phrases: analysis.suspicious_phrases,
      component_scores: (analysis as any).component_scores, // May be provided by AI service
      recruiter_email: recruiterEmail,
      job_url: urlIntel ? urlIntel.original_url : jobUrl,
    });

    if (urlIntel) {
      enrichment.url_intelligence = urlIntel;
    }

    // Extract threat indicators and check patterns
    const indicators = ThreatIndicatorExtractionService.extractIndicators(text);
    const originalRiskScore = Math.round(analysis.scam_probability * 100);
    const patternResult = await ThreatIntelligenceEngine.checkPatterns(indicators, originalRiskScore);
    const threatPresentation = buildThreatIntelligencePresentation(patternResult);
    
    // Calculate final risk score with intelligence boost
    const finalRiskScore = Math.min(originalRiskScore + patternResult.risk_boost, 100);
    const finalRiskLevel = finalRiskScore >= 70 ? "High" : finalRiskScore >= 40 ? "Medium" : "Low";
    
    // Update analysis with threat intelligence
    analysis.scam_probability = finalRiskScore / 100;
    analysis.risk_level = finalRiskLevel;
    const recruiterReadyReasons = buildRecruiterReadyReasons({
      risk_level: finalRiskLevel,
      reasons: analysis.reasons,
      suspicious_phrases: analysis.suspicious_phrases,
      domain_intelligence: enrichment.domain_intelligence,
      community_report_count: enrichment.community_report_count,
      recruiter_email: recruiterEmail,
      job_url: urlIntel ? urlIntel.original_url : jobUrl,
      threat_frequency: patternResult.frequency,
    });
    analysis.reasons = recruiterReadyReasons.reasons;
    
    logger.info("Threat intelligence applied", {
      originalRiskScore,
      intelligenceBoost: patternResult.risk_boost,
      finalRiskScore,
      patternsFound: patternResult.found,
      websiteDomain: indicators.website_domain,
      emailDomain: indicators.email_domain
    });

    // Store analysis result in MongoDB with enrichment data
    const storageData = {
      job_text: text,
      text_hash: computeTextHash(text),
      scam_probability: analysis.scam_probability,
      risk_level: analysis.risk_level as "Low" | "Medium" | "High",
      confidence: analysis.confidence,
      suspicious_phrases: analysis.suspicious_phrases,
      reasons: recruiterReadyReasons.reasons,
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
      url_intelligence: urlIntel,
      pipeline_metadata: {
        ai_invoked: analysis.ai_invoked,
        ai_latency_ms: analysis.ai_latency_ms,
        rule_score: analysis.pipeline?.rule_score || 0,
        heuristic_score: analysis.pipeline?.heuristic_score || 0,
        ai_triggered_by: analysis.pipeline?.ai_triggered_by || "not_needed",
        preprocessed_length: analysis.pipeline?.preprocessed_length || 0,
      },
    };

    const savedAnalysis = await saveAnalysisResult(storageData);

    // Store threat intelligence data asynchronously
    try {
      await ThreatIntelligenceEngine.storeThreatIndicators(
        indicators,
        originalRiskScore,
        patternResult.risk_boost,
        finalRiskScore,
        finalRiskLevel,
        text,
        savedAnalysis?._id?.toString()
      );
    } catch (error) {
      logger.error("Failed to store threat indicators", { error, analysisId: savedAnalysis?._id });
    }

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
      intelligence_boost: patternResult.risk_boost,
      final_risk_score: finalRiskScore,
    });
    
    return res.json({
      _id: savedAnalysis?._id, // Include MongoDB _id for report generation
      success: true,
      workflow: buildWorkflowResponse({
        text,
        cached: false,
        analysis: {
          scam_probability: analysis.scam_probability,
          risk_score: finalRiskScore,
          risk_level: analysis.risk_level as "Low" | "Medium" | "High",
          confidence: analysis.confidence,
          suspicious_phrases: analysis.suspicious_phrases || [],
          reasons: recruiterReadyReasons.reasons,
          summary_reasons: recruiterReadyReasons.summary_reasons,
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
          url_intelligence: urlIntel,
        },
        threatIntelligence: threatPresentation,
        network: networks,
      }),
      analysis: {
        scam_probability: analysis.scam_probability,
        risk_score: finalRiskScore,
        risk_level: analysis.risk_level,
        confidence: analysis.confidence,
        suspicious_phrases: analysis.suspicious_phrases,
        reasons: recruiterReadyReasons.reasons,
        summary_reasons: recruiterReadyReasons.summary_reasons,
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
        url_intelligence: urlIntel,
        threat_intelligence: threatPresentation,
      },
      network: networks,
    });
  } catch (error) {
    logger.error("[JOB_ANALYZE] Error during analysis", { error });
    return res.status(502).json({ message: "Analysis failed" });
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
      job_url: urlIntel ? urlIntel.original_url : undefined,
    });

    if (urlIntel) {
      enrichment.url_intelligence = urlIntel;
    }

    const streamIndicators = ThreatIndicatorExtractionService.extractIndicators(text);
    const streamThreatIntel = await ThreatIntelligenceEngine.checkPatterns(
      streamIndicators,
      Math.round(analysis.scam_probability * 100),
    );
    const streamThreatPresentation = buildThreatIntelligencePresentation(streamThreatIntel);

    const recruiterReadyReasons = buildRecruiterReadyReasons({
      risk_level: analysis.risk_level as "Low" | "Medium" | "High",
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

    // Build final response
    const finalAnalysis = {
      scam_probability: analysis.scam_probability,
      risk_score: Math.round(analysis.scam_probability * 100),
      risk_level: analysis.risk_level,
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
