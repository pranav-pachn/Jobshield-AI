/**
 * Analysis Enrichment Service
 * Enriches scam detection analysis with explainable AI data:
 * - Evidence sources (detection methods, threat scores)
 * - Domain intelligence (age, registration, trust score)
 * - Similar scam patterns from database
 * - Community report counts
 * - Confidence level calculation
 * - Source links for user education
 */

import { logger } from "../utils/logger";
import { JobReportModel } from "../models/JobReport";
import threatIntelService from "./threatIntelligenceService";

export interface EnrichmentData {
  job_text: string;
  scam_probability: number;
  risk_level: "Low" | "Medium" | "High";
  suspicious_phrases: string[];
  component_scores?: {
    rule_score?: number;
    zero_shot_score?: number;
    similarity_score?: number;
  };
  recruiter_email?: string;
  recruiter_phone?: string;
  job_url?: string;
}

export interface EnrichedAnalysis {
  evidence_sources: Array<{
    source: string;
    description: string;
    confidence: number;
  }>;
  domain_intelligence?: {
    domain?: string;
    domain_age_days?: number;
    trust_score?: number;
    threat_level?: "low" | "medium" | "high";
    recently_registered?: boolean;
  };
  similar_patterns: Array<{
    pattern: string;
    frequency: number;
    confidence: number;
  }>;
  community_report_count: number;
  confidence_level: "High" | "Medium" | "Low";
  confidence_reason: string;
  source_links: Array<{
    title: string;
    url: string;
    category: string;
  }>;
}

class AnalysisEnrichmentServiceImpl {
  /**
   * Main enrichment method - combines all evidence sources
   */
  async enrichAnalysis(data: EnrichmentData): Promise<EnrichedAnalysis> {
    logger.info("[ENRICHMENT] Starting analysis enrichment", {
      scam_probability: data.scam_probability,
      risk_level: data.risk_level,
      suspicious_phrase_count: data.suspicious_phrases?.length,
    });

    // Collect evidence from multiple sources
    const evidenceSources = this.buildEvidenceSources(data);

    // Extract and analyze domain
    const domainIntelligence = await this.extractDomainIntelligence(
      data.recruiter_email,
      data.recruiter_phone,
      data.job_url,
      data.suspicious_phrases
    );

    // Query similar patterns from database
    const similarPatterns = await this.findSimilarPatterns(
      data.suspicious_phrases,
      data.job_text
    );

    // Count community reports for similar patterns
    const communityReportCount = await this.countCommunityReports(
      data.suspicious_phrases
    );

    // Calculate confidence level and reason
    const { confidenceLevel, confidenceReason } = this.calculateConfidenceLevel(
      data.scam_probability,
      evidenceSources,
      data.component_scores
    );

    // Generate source links
    const sourceLinks = this.generateSourceLinks(data.risk_level);

    const enriched: EnrichedAnalysis = {
      evidence_sources: evidenceSources,
      domain_intelligence: domainIntelligence,
      similar_patterns: similarPatterns,
      community_report_count: communityReportCount,
      confidence_level: confidenceLevel,
      confidence_reason: confidenceReason,
      source_links: sourceLinks,
    };

    logger.info("[ENRICHMENT] Enrichment complete", {
      evidence_count: evidenceSources.length,
      pattern_matches: similarPatterns.length,
      community_reports: communityReportCount,
      confidence: confidenceLevel,
    });

    return enriched;
  }

  /**
   * Build evidence sources from detection method components
   */
  private buildEvidenceSources(
    data: EnrichmentData
  ): Array<{ source: string; description: string; confidence: number }> {
    const sources: Array<{
      source: string;
      description: string;
      confidence: number;
    }> = [];

    // Component 1: Rule-based detection
    const ruleScore = data.component_scores?.rule_score ?? 0;
    if (ruleScore > 0) {
      sources.push({
        source: "Phrase-Based Detection",
        description: `Identified ${data.suspicious_phrases?.length || 0} suspicious phrases matching known scam indicators`,
        confidence: Math.min(ruleScore, 1),
      });
    }

    // Component 2: ML Classification
    const zeroShotScore = data.component_scores?.zero_shot_score ?? 0;
    if (zeroShotScore > 0) {
      sources.push({
        source: "AI Classification",
        description:
          "Machine learning model identified job posting as likely scam",
        confidence: Math.min(zeroShotScore, 1),
      });
    }

    // Component 3: Pattern Similarity
    const similarityScore = data.component_scores?.similarity_score ?? 0;
    if (similarityScore > 0) {
      sources.push({
        source: "Pattern Matching",
        description:
          "Content matches known scam templates from historical data",
        confidence: Math.min(similarityScore, 1),
      });
    }

    // Overall probability-based evidence
    if (data.scam_probability > 0.5) {
      sources.push({
        source: "Combined Analysis",
        description: `Multiple detection methods flagged this posting (probability: ${(data.scam_probability * 100).toFixed(0)}%)`,
        confidence: data.scam_probability,
      });
    }

    return sources;
  }

  /**
   * Extract domain from recruiter email, phone, or job URL
   */
  private async extractDomainIntelligence(
    recruiterEmail?: string,
    recruiterPhone?: string,
    jobUrl?: string,
    suspiciousPhrases?: string[]
  ) {
    let domain: string | undefined;

    // Try to extract domain from email
    if (recruiterEmail && recruiterEmail.includes("@")) {
      domain = recruiterEmail.split("@")[1];
    }

    // Try to extract domain from URL
    if (!domain && jobUrl) {
      try {
        const url = new URL(jobUrl);
        domain = url.hostname;
      } catch (e) {
        // Invalid URL
      }
    }

    // If no domain found, check if any suspicious phrase contains a domain pattern
    if (!domain && suspiciousPhrases) {
      for (const phrase of suspiciousPhrases) {
        const domainMatch = phrase.match(/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}/i);
        if (domainMatch) {
          domain = domainMatch[0];
          break;
        }
      }
    }

    if (!domain) {
      logger.info("[ENRICHMENT] No domain extracted from contact info");
      return undefined;
    }

    logger.info("[ENRICHMENT] Extracted domain for threat check", { domain });

    try {
      // Check domain threat intelligence
      const threatCheck = await threatIntelService.checkDomain(domain);

      return {
        domain,
        domain_age_days: threatCheck.sources?.domainAge,
        trust_score: 100 - threatCheck.score, // Invert: high score = low trust
        threat_level: threatCheck.threatLevel,
        recently_registered: (threatCheck.sources?.domainAge ?? 366) < 90,
      };
    } catch (error) {
      logger.error("[ENRICHMENT] Domain threat check failed", {
        domain,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      return {
        domain,
        recently_registered: false, // Conservative default
      };
    }
  }

  /**
   * Find similar patterns in job report collection
   */
  private async findSimilarPatterns(
    suspiciousPhrases?: string[],
    jobText?: string
  ): Promise<
    Array<{
      pattern: string;
      frequency: number;
      confidence: number;
    }>
  > {
    if (!suspiciousPhrases || suspiciousPhrases.length === 0 || !jobText) {
      return [];
    }

    const patterns: Array<{
      pattern: string;
      frequency: number;
      confidence: number;
    }> = [];

    try {
      // Search for job reports containing similar suspicious phrases
      for (const phrase of suspiciousPhrases.slice(0, 3)) {
        // Check top 3 phrases
        const regex = new RegExp(phrase, "i"); // Case-insensitive match
        const count = await JobReportModel.countDocuments({
          text: { $regex: regex },
        });

        if (count > 0) {
          patterns.push({
            pattern: phrase,
            frequency: count,
            confidence: Math.min(count / 100, 1), // Normalize: 100+ reports = confidence 1.0
          });
        }
      }

      // Sort by frequency descending
      patterns.sort((a, b) => b.frequency - a.frequency);

      logger.info("[ENRICHMENT] Found similar patterns", {
        count: patterns.length,
        top_pattern: patterns[0]?.pattern,
        top_frequency: patterns[0]?.frequency,
      });

      return patterns;
    } catch (error) {
      logger.error("[ENRICHMENT] Pattern search failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return [];
    }
  }

  /**
   * Count community reports with similar suspicious phrases
   */
  private async countCommunityReports(
    suspiciousPhrases?: string[]
  ): Promise<number> {
    if (!suspiciousPhrases || suspiciousPhrases.length === 0) {
      return 0;
    }

    try {
      // Count job reports that contain at least one suspicious phrase
      const count = await JobReportModel.countDocuments({
        text: {
          $regex: suspiciousPhrases
            .slice(0, 5)
            .map((p) => `(${p})`)
            .join("|"),
          $options: "i",
        },
      });

      logger.info("[ENRICHMENT] Community report count", { count });
      return Math.min(count, 999); // Cap at 999 for display
    } catch (error) {
      logger.error("[ENRICHMENT] Community report count failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return 0;
    }
  }

  /**
   * Calculate confidence level based on evidence
   */
  private calculateConfidenceLevel(
    scamProbability: number,
    evidenceSources: Array<{ source: string; description: string; confidence: number }>,
    componentScores?: { rule_score?: number; zero_shot_score?: number; similarity_score?: number }
  ): { confidenceLevel: "High" | "Medium" | "Low"; confidenceReason: string } {
    // High confidence: strong probability + multiple evidence sources + consistent scores
    if (scamProbability > 0.7 && evidenceSources.length >= 2) {
      const scores = Object.values({
        rule: componentScores?.rule_score ?? 0,
        zeroShot: componentScores?.zero_shot_score ?? 0,
        similarity: componentScores?.similarity_score ?? 0,
      }).filter((s) => s > 0);

      const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b) / scores.length : 0;

      if (avgScore > 0.6) {
        return {
          confidenceLevel: "High",
          confidenceReason: "Multiple detection methods consistently flagged this posting",
        };
      }
    }

    // Medium confidence: moderate probability or limited evidence
    if (scamProbability > 0.4 && evidenceSources.length > 0) {
      return {
        confidenceLevel: "Medium",
        confidenceReason: "Some indicators detected, but additional context recommended",
      };
    }

    // Low confidence: weak signals
    return {
      confidenceLevel: "Low",
      confidenceReason: "Limited scam indicators detected",
    };
  }

  /**
   * Generate educational resource links
   */
  private generateSourceLinks(
    riskLevel: "Low" | "Medium" | "High"
  ): Array<{
    title: string;
    url: string;
    category: string;
  }> {
    const links: Array<{ title: string; url: string; category: string }> = [
      {
        title: "FTC: Common Job Scams",
        url: "https://reportfraud.ftc.gov/articles/how-recognize-job-scam",
        category: "Government",
      },
      {
        title: "Employment Scams - How to Spot Them",
        url: "https://www.consumersentinel.gov/articles/how-recognize-employment-scam",
        category: "Consumer Guide",
      },
      {
        title: "Telegram Recruitment Scams",
        url: "https://www.linkedin.com/pulse/telegram-job-recruitment-scams-what-you-need-know/",
        category: "Social Media",
      },
      {
        title: "Upwork Imposter Scams",
        url: "https://support.upwork.com/hc/en-us/articles/211063408",
        category: "Platform Scams",
      },
    ];

    if (riskLevel === "High") {
      links.push({
        title: "Report the Scam to FTC",
        url: "https://reportfraud.ftc.gov",
        category: "Take Action",
      });
    }

    return links;
  }
}

export const AnalysisEnrichmentService = new AnalysisEnrichmentServiceImpl();
