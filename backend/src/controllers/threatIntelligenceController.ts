import { Request, Response } from "express";
import { ThreatIntelligenceEngine } from "../services/threatIntelligenceEngine";
import { ThreatIndicatorExtractionService, ExtractedIndicators } from "../services/threatIndicatorExtractionService";
import { logger } from "../utils/logger";

/**
 * POST /api/threat/log
 * Store threat indicators from job analysis
 */
export async function logThreatIndicators(req: Request, res: Response): Promise<void> {
  try {
    const {
      job_text,
      original_risk_score,
      risk_level,
      job_analysis_id
    } = req.body;

    if (!job_text || original_risk_score === undefined || !risk_level) {
      res.status(400).json({
        error: "Missing required fields: job_text, original_risk_score, risk_level"
      });
      return;
    }

    // Extract indicators from job text
    const indicators = ThreatIndicatorExtractionService.extractIndicators(job_text);

    // Check patterns for intelligence boost
    const patternResult = await ThreatIntelligenceEngine.checkPatterns(
      indicators,
      original_risk_score
    );

    // Calculate final risk score
    const finalRiskScore = Math.min(original_risk_score + patternResult.risk_boost, 100);
    const finalRiskLevel = finalRiskScore >= 70 ? "High" : finalRiskScore >= 40 ? "Medium" : "Low";

    // Store threat indicators
    const threatLog = await ThreatIntelligenceEngine.storeThreatIndicators(
      indicators,
      original_risk_score,
      patternResult.risk_boost,
      finalRiskScore,
      finalRiskLevel as "Low" | "Medium" | "High",
      job_text,
      job_analysis_id
    );

    logger.info("Threat indicators logged successfully", {
      threatLogId: threatLog._id,
      websiteDomain: indicators.website_domain,
      emailDomain: indicators.email_domain,
      originalScore: original_risk_score,
      intelligenceBoost: patternResult.risk_boost,
      finalScore: finalRiskScore
    });

    res.status(201).json({
      success: true,
      data: {
        threat_log_id: threatLog._id,
        indicators: {
          email_domain: indicators.email_domain,
          website_domain: indicators.website_domain,
          phone_numbers: indicators.phone_numbers,
          job_title: indicators.job_title,
          suspicious_phrases: indicators.suspicious_phrases,
          salary_pattern: indicators.salary_pattern,
          threat_category: indicators.threat_category
        },
        intelligence_analysis: {
          patterns_found: patternResult.found,
          frequency: patternResult.frequency,
          intelligence_boost: patternResult.risk_boost,
          details: patternResult.details,
          similar_domains: patternResult.similar_domains,
          similar_phrases: patternResult.similar_phrases
        },
        risk_scores: {
          original: original_risk_score,
          intelligence_boost: patternResult.risk_boost,
          final: finalRiskScore,
          original_level: risk_level,
          final_level: finalRiskLevel
        }
      }
    });

  } catch (error) {
    logger.error("Error logging threat indicators", { error, body: req.body });
    res.status(500).json({
      error: "Internal server error while logging threat indicators"
    });
  }
}

/**
 * GET /api/threat/summary
 * Get threat intelligence summary for dashboard
 */
export async function getThreatSummary(req: Request, res: Response): Promise<void> {
  try {
    const summary = await ThreatIntelligenceEngine.getThreatSummary();

    logger.info("Threat summary retrieved", {
      topDomainsCount: summary.top_domains.length,
      topPhrasesCount: summary.top_phrases.length,
      totalAnalyzed: summary.threat_trends.total_analyzed
    });

    res.status(200).json({
      success: true,
      data: summary
    });

  } catch (error) {
    logger.error("Error retrieving threat summary", { error });
    res.status(500).json({
      error: "Internal server error while retrieving threat summary"
    });
  }
}

/**
 * GET /api/threat/patterns/:domain
 * Get domain history and frequency analysis
 */
export async function getDomainPatterns(req: Request, res: Response): Promise<void> {
  try {
    const { domain } = req.params;

    if (!domain || Array.isArray(domain)) {
      res.status(400).json({
        error: "Domain parameter is required and must be a single value"
      });
      return;
    }

    const domainHistory = await ThreatIntelligenceEngine.getDomainHistory(domain);

    logger.info("Domain patterns retrieved", {
      domain,
      totalReports: domainHistory.total_reports,
      recentReports: domainHistory.recent_reports
    });

    res.status(200).json({
      success: true,
      data: domainHistory
    });

  } catch (error) {
    logger.error("Error retrieving domain patterns", { error, domain: req.params.domain });
    
    if (error instanceof Error && error.message.includes("not found in threat logs")) {
      res.status(404).json({
        error: error.message
      });
    } else {
      res.status(500).json({
        error: "Internal server error while retrieving domain patterns"
      });
    }
  }
}

/**
 * POST /api/threat/analyze
 * Analyze job text for threat intelligence (standalone endpoint)
 */
export async function analyzeThreatIntelligence(req: Request, res: Response): Promise<void> {
  try {
    const { job_text, original_risk_score } = req.body;

    if (!job_text) {
      res.status(400).json({
        error: "job_text is required"
      });
      return;
    }

    // Extract indicators
    const indicators = ThreatIndicatorExtractionService.extractIndicators(job_text);

    // Check patterns
    const patternResult = await ThreatIntelligenceEngine.checkPatterns(
      indicators,
      original_risk_score || 0
    );

    // Calculate enhanced risk score
    const finalRiskScore = Math.min((original_risk_score || 0) + patternResult.risk_boost, 100);
    const finalRiskLevel = finalRiskScore >= 70 ? "High" : finalRiskScore >= 40 ? "Medium" : "Low";

    logger.info("Threat intelligence analysis completed", {
      indicatorsCount: Object.keys(indicators).length,
      patternsFound: patternResult.found,
      intelligenceBoost: patternResult.risk_boost,
      finalScore: finalRiskScore
    });

    res.status(200).json({
      success: true,
      data: {
        indicators,
        intelligence_analysis: patternResult,
        enhanced_risk_assessment: {
          original_score: original_risk_score || 0,
          intelligence_boost: patternResult.risk_boost,
          final_score: finalRiskScore,
          risk_level: finalRiskLevel,
          confidence: patternResult.found ? "High" : "Medium"
        }
      }
    });

  } catch (error) {
    logger.error("Error in threat intelligence analysis", { error, body: req.body });
    res.status(500).json({
      error: "Internal server error during threat intelligence analysis"
    });
  }
}

/**
 * GET /api/threat/stats
 * Get threat intelligence statistics
 */
export async function getThreatStats(req: Request, res: Response): Promise<void> {
  try {
    const summary = await ThreatIntelligenceEngine.getThreatSummary();
    
    const stats = {
      overview: {
        total_analyzed: summary.threat_trends.total_analyzed,
        high_risk_percentage: summary.threat_trends.high_risk_percentage,
        avg_intelligence_boost: summary.threat_trends.avg_intelligence_boost,
        most_active_threat_category: summary.threat_trends.most_active_threat_category
      },
      top_threats: {
        domains: summary.top_domains.slice(0, 5),
        phrases: summary.top_phrases.slice(0, 5),
        email_domains: summary.top_email_domains.slice(0, 5)
      },
      recent_activity: {
        high_risk_count: summary.recent_high_risk.length,
        latest_high_risk: summary.recent_high_risk.slice(0, 10)
      }
    };

    logger.info("Threat stats retrieved", {
      totalAnalyzed: stats.overview.total_analyzed,
      highRiskPercentage: stats.overview.high_risk_percentage
    });

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error("Error retrieving threat stats", { error });
    res.status(500).json({
      error: "Internal server error while retrieving threat statistics"
    });
  }
}
