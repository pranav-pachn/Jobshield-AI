import { analyzeJobWithSmartFlow } from "./smartAnalysisService";
import { saveAnalysisResult, getCachedAnalysisByText, computeTextHash } from "./analysisStorageService";
import { AnalysisEnrichmentService } from "./analysisEnrichmentService";
import {
  buildThreatIntelligencePresentation,
  buildWorkflowResponse,
} from "./analysisPresentationService";
import scamNetworkCorrelationService from "./scamNetworkCorrelationService";
import urlIntelligenceService, { UrlIntelligenceResult } from "./urlIntelligenceService";
import { ThreatIntelligenceEngine } from "./threatIntelligenceEngine";
import { ThreatIndicatorExtractionService } from "./threatIndicatorExtractionService";
import { buildRecruiterReadyReasons } from "./recruiterReadyAnalysisService";
import { computeUnifiedRisk } from "./unifiedRiskEngine";
import threatIntelligenceService from "./threatIntelligenceService";
import { buildGraph, extractPrimaryEmail } from "./analysisGraphService";
import { logger } from "../utils/logger";
import { statsCache, reportsCache } from "../middleware/cache";

export interface GraphData {
  nodes: Array<{ id: string; label?: string; group?: string }>;
  links: Array<{ source: string; target: string; value?: number }>;
}

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

export async function orchestrateAnalysis(
  text: string,
  recruiterEmail?: string,
  jobUrl?: string,
  userId?: string
) {
  let processText = text;
  let urlIntel: UrlIntelligenceResult | undefined;

  // 1. URL Interception & Intelligence
  if (urlIntelligenceService.isUrl(text)) {
    logger.info("[ORCHESTRATOR] URL detected, running URL intelligence pipeline");
    urlIntel = await urlIntelligenceService.analyzeUrl(text);
    if (urlIntel.fetch_successful && urlIntel.extracted_text) {
      processText = urlIntel.extracted_text;
    }
  }

  // 2. Cache Check
  const cachedAnalysis = await getCachedAnalysisByText(text);
  if (cachedAnalysis) {
    const cachedIndicators = ThreatIndicatorExtractionService.extractIndicators(text);
    const cachedRiskScore = Math.round(cachedAnalysis.scam_probability * 100);

    const [cachedThreatIntel, cachedRecruiterScore] = await Promise.all([
      ThreatIntelligenceEngine.checkPatterns(cachedIndicators, cachedRiskScore),
      recruiterEmail
        ? threatIntelligenceService
            .checkRecruiterEmail(recruiterEmail)
            .then((recruiterCheck) => recruiterCheck?.score ?? null)
            .catch(() => null)
        : Promise.resolve<number | null>(null),
    ]);
    const cachedThreatPresentation = buildThreatIntelligencePresentation(cachedThreatIntel);

    const cachedUnifiedRisk = computeUnifiedRisk(
      cachedAnalysis.scam_probability,
      cachedRecruiterScore,
      cachedThreatIntel,
      cachedRiskScore
    );

    const cachedRecruiterReasons = buildRecruiterReadyReasons({
      risk_level: cachedUnifiedRisk.riskLevel,
      reasons: cachedAnalysis.reasons || [],
      suspicious_phrases: cachedAnalysis.suspicious_phrases || [],
      domain_intelligence: cachedAnalysis.domain_intelligence,
      community_report_count: cachedAnalysis.community_report_count || 0,
      recruiter_email: recruiterEmail,
      job_url: jobUrl,
    });

    logger.info("[ORCHESTRATOR] Returning cached analysis (AI skipped)", {
      analysis_id: cachedAnalysis._id,
      text_hash: cachedAnalysis.text_hash,
    });

    const networks = await scamNetworkCorrelationService.getNetworksForAnalysis(
      cachedAnalysis._id.toString(),
    );

    let cachedGraphData: GraphData = { nodes: [], links: [] };
    try {
      cachedGraphData = buildGraph({
        domain: cachedAnalysis.domain_intelligence?.domain,
        email: recruiterEmail || extractPrimaryEmail(text),
        phrases: cachedAnalysis.suspicious_phrases || [],
      });
    } catch (err) {
      logger.error("[ORCHESTRATOR] Failed to build cached graph", err instanceof Error ? err.stack || err.message : String(err));
      cachedGraphData = { nodes: [], links: [] };
    }

    return {
      _id: cachedAnalysis._id,
      success: true,
      cached: true,
      finalScore: cachedUnifiedRisk.finalScore,
      riskLevel: cachedUnifiedRisk.riskLevel,
      confidence: cachedUnifiedRisk.confidence,
      breakdown: cachedUnifiedRisk.breakdown,
      graph_data: cachedGraphData,
      workflow: buildWorkflowResponse({
        text,
        cached: true,
        analysis: {
          scam_probability: cachedAnalysis.scam_probability,
          risk_score: cachedUnifiedRisk.finalScore,
          risk_level: cachedUnifiedRisk.riskLevel,
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
        risk_score: cachedUnifiedRisk.finalScore,
        risk_level: cachedUnifiedRisk.riskLevel,
        confidence: getConfidenceValue({
          confidence: cachedAnalysis.confidence,
          scam_probability: cachedAnalysis.scam_probability,
        }),
        graph_data: cachedGraphData,
        suspicious_phrases: cachedAnalysis.suspicious_phrases,
        reasons: cachedRecruiterReasons.reasons,
        summary_reasons: cachedRecruiterReasons.summary_reasons,
        phrase_details: ('phrase_details' in cachedAnalysis ? (cachedAnalysis as { phrase_details?: any[] }).phrase_details : []) || [],
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
    };
  }

  // 3. New Analysis
  const startTime = Date.now();
  const analysisContext = urlIntel ? 
    `[URL Intelligence: Platform: ${urlIntel.platform}, Domain Trust: ${urlIntel.platform_trust}, URL Risk: ${urlIntel.url_risk}]\n\n${processText}` 
    : processText;

  const analysis = await analyzeJobWithSmartFlow(analysisContext);
  if (isUnableToAssess(analysis)) {
    logger.info("[ORCHESTRATOR] AI unable to assess input - demo/fallback active");
    return { status: "UNABLE_TO_ASSESS", message: "Unable to complete full analysis", demoMode: true, banner: "Demo Mode Active" };
  }
  const totalLatency = Date.now() - startTime;

  const indicators = ThreatIndicatorExtractionService.extractIndicators(text);
  const originalRiskScore = Math.round(analysis.scam_probability * 100);
  
  const [enrichment, patternResult, recruiterScore] = await Promise.all([
    AnalysisEnrichmentService.enrichAnalysis({
      job_text: text,
      scam_probability: analysis.scam_probability,
      risk_level: analysis.risk_level as "Low" | "Medium" | "High",
      suspicious_phrases: analysis.suspicious_phrases,
      component_scores: analysis.component_scores,
      recruiter_email: recruiterEmail,
      job_url: urlIntel ? urlIntel.original_url : jobUrl,
    }),
    ThreatIntelligenceEngine.checkPatterns(indicators, originalRiskScore),
    recruiterEmail
      ? threatIntelligenceService
          .checkRecruiterEmail(recruiterEmail)
          .then((recruiterCheck) => recruiterCheck?.score ?? null)
          .catch((error) => {
            logger.error("Failed to check recruiter email, using neutral score", { error, recruiterEmail });
            return null;
          })
      : Promise.resolve<number | null>(null),
  ]);
  const threatPresentation = buildThreatIntelligencePresentation(patternResult);

  if (urlIntel) {
    enrichment.url_intelligence = urlIntel;
  }

  const unifiedRisk = computeUnifiedRisk(
    analysis.scam_probability,
    recruiterScore,
    patternResult,
    originalRiskScore
  );

  const finalRiskScore = unifiedRisk.finalScore;
  const finalRiskLevel = unifiedRisk.riskLevel;
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

  const storageData = {
    user_id: userId,
    job_text: text,
    text_hash: computeTextHash(text),
    scam_probability: analysis.scam_probability,
    risk_level: analysis.risk_level as "Low" | "Medium" | "High",
    confidence: analysis.confidence,
    suspicious_phrases: analysis.suspicious_phrases,
    reasons: recruiterReadyReasons.reasons,
    ai_latency_ms: analysis.ai_latency_ms,
    evidence_sources: enrichment.evidence_sources,
    domain_intelligence: enrichment.domain_intelligence,
    similar_patterns: enrichment.similar_patterns,
    community_report_count: enrichment.community_report_count,
    confidence_level: enrichment.confidence_level,
    confidence_reason: enrichment.confidence_reason,
    source_links: enrichment.source_links,
    component_scores: analysis.component_scores,
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

  try {
    statsCache.flushAll();
    reportsCache.flushAll();
    logger.info("[CACHE] Flushed stats and reports caches due to new analysis");
  } catch (cacheErr) {
    logger.error("[CACHE] Failed to flush caches", cacheErr);
  }

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

  let graphData: GraphData = { nodes: [], links: [] };
  try {
    graphData = buildGraph({
      domain: indicators.website_domain || enrichment.domain_intelligence?.domain || urlIntel?.domain,
      email: recruiterEmail || extractPrimaryEmail(text),
      phrases: analysis.suspicious_phrases || [],
    });
  } catch (err) {
    logger.error("[ORCHESTRATOR] Failed to build graph", err instanceof Error ? err.stack || err.message : String(err));
    graphData = { nodes: [], links: [] };
  }

  logger.info("[ORCHESTRATOR] Smart analysis pipeline complete", {
    ai_invoked: analysis.ai_invoked,
    total_latency_ms: totalLatency,
    final_probability: analysis.scam_probability,
    risk_level: analysis.risk_level,
    intelligence_boost: patternResult.risk_boost,
  });
  
  return {
    _id: savedAnalysis?._id,
    success: true,
    finalScore: unifiedRisk.finalScore,
    riskLevel: unifiedRisk.riskLevel,
    breakdown: unifiedRisk.breakdown,
    graph_data: graphData,
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
      graph_data: graphData,
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
  };
}
