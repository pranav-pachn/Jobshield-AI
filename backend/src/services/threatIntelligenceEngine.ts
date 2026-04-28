import { ThreatLog, IThreatLog } from "../models/ThreatLog";
import { ExtractedIndicators, ThreatIndicatorExtractionService } from "./threatIndicatorExtractionService";
import { logger } from "../utils/logger";

export interface PatternMatchResult {
  found: boolean;
  frequency: number;
  risk_boost: number;
  details: string[];
  similar_domains?: string[];
  similar_phrases?: string[];
}

export interface IntelligenceSummary {
  top_domains: Array<{ domain: string; count: number; risk_level: string }>;
  top_phrases: Array<{ phrase: string; count: number; risk_boost: number }>;
  top_email_domains: Array<{ domain: string; count: number; avg_risk_score: number }>;
  recent_high_risk: Array<{
    job_title?: string;
    website_domain?: string;
    email_domain?: string;
    final_risk_score: number;
    created_at: Date;
  }>;
  threat_trends: {
    total_analyzed: number;
    high_risk_percentage: number;
    most_active_threat_category: string;
    avg_intelligence_boost: number;
  };
}

export class ThreatIntelligenceEngine {
  
  /**
   * Check if indicators exist in threat logs and calculate intelligence boost
   */
  static async checkPatterns(indicators: ExtractedIndicators, originalRiskScore: number): Promise<PatternMatchResult> {
    logger.info("Checking threat intelligence patterns", { 
      websiteDomain: indicators.website_domain,
      emailDomain: indicators.email_domain,
      suspiciousPhrasesCount: indicators.suspicious_phrases.length 
    });

    const result: PatternMatchResult = {
      found: false,
      frequency: 0,
      risk_boost: 0,
      details: [],
      similar_domains: [],
      similar_phrases: []
    };

    try {
      // Check website domain frequency
      if (indicators.website_domain) {
        const domainMatches = await ThreatLog.find({
          website_domain: indicators.website_domain,
          created_at: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        }).sort({ created_at: -1 }).limit(10);

        if (domainMatches.length > 0) {
          result.found = true;
          result.frequency += domainMatches.length;
          
          // Domain frequency risk boost
          if (domainMatches.length > 5) {
            result.risk_boost += 25;
            result.details.push(`Domain ${indicators.website_domain} reported ${domainMatches.length} times in 30 days`);
          } else if (domainMatches.length > 2) {
            result.risk_boost += 15;
            result.details.push(`Domain ${indicators.website_domain} reported ${domainMatches.length} times in 30 days`);
          } else {
            result.risk_boost += 5;
            result.details.push(`Domain ${indicators.website_domain} seen ${domainMatches.length} time(s) before`);
          }

          // Similar domains (variation detection)
          const similarDomains = await this.findSimilarDomains(indicators.website_domain);
          result.similar_domains = similarDomains;
          if (similarDomains.length > 0) {
            result.risk_boost += similarDomains.length * 5;
            result.details.push(`Found ${similarDomains.length} similar domain patterns`);
          }
        }
      }

      // Check email domain frequency
      if (indicators.email_domain) {
        const emailMatches = await ThreatLog.find({
          email_domain: indicators.email_domain,
          created_at: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }).sort({ created_at: -1 }).limit(10);

        if (emailMatches.length > 0) {
          result.found = true;
          result.frequency += emailMatches.length;
          
          // Email domain risk boost (lower weight than website domains)
          if (emailMatches.length > 10) {
            result.risk_boost += 20;
            result.details.push(`Email domain ${indicators.email_domain} used in ${emailMatches.length} scams`);
          } else if (emailMatches.length > 5) {
            result.risk_boost += 10;
            result.details.push(`Email domain ${indicators.email_domain} used in ${emailMatches.length} scams`);
          }
        }
      }

      // Check suspicious phrases frequency
      if (indicators.suspicious_phrases.length > 0) {
        for (const phrase of indicators.suspicious_phrases) {
          const phraseMatches = await ThreatLog.find({
            suspicious_phrases: phrase,
            created_at: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }).countDocuments();

          if (phraseMatches > 0) {
            result.found = true;
            result.similar_phrases?.push(phrase);
            
            // Phrase frequency risk boost
            if (phraseMatches > 20) {
              result.risk_boost += 10;
              result.details.push(`Phrase "${phrase}" appears in ${phraseMatches} scams`);
            } else if (phraseMatches > 10) {
              result.risk_boost += 5;
              result.details.push(`Phrase "${phrase}" appears in ${phraseMatches} scams`);
            } else {
              result.risk_boost += 2;
              result.details.push(`Phrase "${phrase}" seen ${phraseMatches} time(s) before`);
            }
          }
        }
      }

      // Salary pattern risk boost
      if (indicators.salary_pattern === "high_unrealistic") {
        result.risk_boost += 15;
        result.details.push("Unrealistic high salary pattern detected");
      } else if (indicators.salary_pattern === "low_unrealistic") {
        result.risk_boost += 10;
        result.details.push("Unrealistic low salary pattern detected");
      } else if (indicators.salary_pattern === "suspicious") {
        result.risk_boost += 5;
        result.details.push("Suspicious salary structure detected");
      }

      // Cap the risk boost at 50 points
      result.risk_boost = Math.min(result.risk_boost, 50);

      logger.info("Pattern matching completed", {
        found: result.found,
        frequency: result.frequency,
        riskBoost: result.risk_boost,
        detailsCount: result.details.length
      });

    } catch (error) {
      logger.error("Error in pattern matching", { error, indicators });
      // Return default result on error
    }

    return result;
  }

  /**
   * Store threat indicators in the database
   */
  static async storeThreatIndicators(
    indicators: ExtractedIndicators,
    originalRiskScore: number,
    intelligenceBoost: number,
    finalRiskScore: number,
    riskLevel: "Low" | "Medium" | "High",
    jobText: string,
    jobAnalysisId?: string
  ): Promise<IThreatLog> {
    const jobTextHash = ThreatIndicatorExtractionService.generateTextHash(jobText);
    const jobTextSample = ThreatIndicatorExtractionService.createJobTextSample(jobText);

    const threatLog = new ThreatLog({
      email_domain: indicators.email_domain,
      website_domain: indicators.website_domain,
      phone_numbers: indicators.phone_numbers,
      job_title: indicators.job_title,
      suspicious_phrases: indicators.suspicious_phrases,
      salary_pattern: indicators.salary_pattern,
      original_risk_score: originalRiskScore,
      intelligence_boost: intelligenceBoost,
      final_risk_score: finalRiskScore,
      risk_level: riskLevel,
      job_analysis_id: jobAnalysisId,
      job_text_hash: jobTextHash,
      job_text_sample: jobTextSample,
      threat_category: indicators.threat_category,
      confidence_level: finalRiskScore > 70 ? "High" : finalRiskScore > 40 ? "Medium" : "Low"
    });

    const saved = await threatLog.save();
    
    logger.info("Stored threat indicators", {
      threatLogId: saved._id,
      websiteDomain: indicators.website_domain,
      emailDomain: indicators.email_domain,
      finalRiskScore,
      intelligenceBoost
    });

    return saved;
  }

  /**
   * Get threat intelligence summary for dashboard
   */
  static async getThreatSummary(): Promise<IntelligenceSummary> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Top scam domains
      const topDomains = await ThreatLog.aggregate([
        { $match: { website_domain: { $exists: true, $ne: null }, created_at: { $gte: thirtyDaysAgo } } },
        { $group: { _id: "$website_domain", count: { $sum: 1 }, avg_risk: { $avg: "$final_risk_score" } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { domain: "$_id", count: 1, avg_risk: 1, risk_level: { $cond: [{ $gte: ["$avg_risk", 70] }, "High", { $cond: [{ $gte: ["$avg_risk", 40] }, "Medium", "Low"] }] } } }
      ]);

      // Top suspicious phrases
      const topPhrases = await ThreatLog.aggregate([
        { $match: { suspicious_phrases: { $exists: true, $ne: [] }, created_at: { $gte: thirtyDaysAgo } } },
        { $unwind: "$suspicious_phrases" },
        { $group: { _id: "$suspicious_phrases", count: { $sum: 1 }, avg_boost: { $avg: "$intelligence_boost" } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
        { $project: { phrase: "$_id", count: 1, risk_boost: { $round: ["$avg_boost", 0] } } }
      ]);

      // Top email domains
      const topEmailDomains = await ThreatLog.aggregate([
        { $match: { email_domain: { $exists: true, $ne: null }, created_at: { $gte: thirtyDaysAgo } } },
        { $group: { _id: "$email_domain", count: { $sum: 1 }, avg_risk_score: { $avg: "$final_risk_score" } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { domain: "$_id", count: 1, avg_risk_score: { $round: ["$avg_risk_score", 0] } } }
      ]);

      // Recent high-risk threats
      const recentHighRisk = await ThreatLog.find({
        final_risk_score: { $gte: 70 },
        created_at: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
      })
      .sort({ created_at: -1 })
      .limit(20)
      .select('job_title website_domain email_domain final_risk_score created_at')
      .lean();

      // Threat trends
      const totalAnalyzed = await ThreatLog.countDocuments({ created_at: { $gte: thirtyDaysAgo } });
      const highRiskCount = await ThreatLog.countDocuments({ 
        final_risk_score: { $gte: 70 }, 
        created_at: { $gte: thirtyDaysAgo } 
      });
      
      const mostActiveThreatCategory = await ThreatLog.aggregate([
        { $match: { threat_category: { $exists: true }, created_at: { $gte: thirtyDaysAgo } } },
        { $group: { _id: "$threat_category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ]);

      const avgIntelligenceBoost = await ThreatLog.aggregate([
        { $match: { created_at: { $gte: thirtyDaysAgo } } },
        { $group: { _id: null, avg_boost: { $avg: "$intelligence_boost" } } }
      ]);

      const summary: IntelligenceSummary = {
        top_domains: topDomains,
        top_phrases: topPhrases,
        top_email_domains: topEmailDomains,
        recent_high_risk: recentHighRisk,
        threat_trends: {
          total_analyzed: totalAnalyzed,
          high_risk_percentage: totalAnalyzed > 0 ? Math.round((highRiskCount / totalAnalyzed) * 100) : 0,
          most_active_threat_category: mostActiveThreatCategory[0]?._id || "other",
          avg_intelligence_boost: avgIntelligenceBoost[0]?.avg_boost ? Math.round(avgIntelligenceBoost[0].avg_boost * 10) / 10 : 0
        }
      };

      logger.info("Generated threat intelligence summary", {
        topDomainsCount: summary.top_domains.length,
        topPhrasesCount: summary.top_phrases.length,
        totalAnalyzed: summary.threat_trends.total_analyzed
      });

      return summary;

    } catch (error) {
      logger.error("Error generating threat summary", { error });
      throw error;
    }
  }

  /**
   * Find similar domains (variations of the same domain)
   */
  private static async findSimilarDomains(domain: string): Promise<string[]> {
    const baseDomain = domain.replace(/^(www\.|m\.|mobile\.)/, '').split('.')[0];
    
    const similarPatterns = await ThreatLog.distinct("website_domain", {
      website_domain: { 
        $regex: baseDomain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 
        $options: 'i' 
      },
      created_at: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    return similarPatterns.filter(d => d !== domain).slice(0, 5);
  }

  /**
   * Get domain history and frequency
   */
  static async getDomainHistory(domain: string): Promise<{
    domain: string;
    total_reports: number;
    recent_reports: number;
    avg_risk_score: number;
    risk_level: string;
    first_seen: Date;
    last_seen: Date;
    common_phrases: Array<{ phrase: string; count: number }>;
  }> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const domainData = await ThreatLog.aggregate([
      { $match: { website_domain: domain } },
      {
        $group: {
          _id: "$website_domain",
          total_reports: { $sum: 1 },
          recent_reports: {
            $sum: {
              $cond: [{ $gte: ["$created_at", thirtyDaysAgo] }, 1, 0]
            }
          },
          avg_risk_score: { $avg: "$final_risk_score" },
          first_seen: { $min: "$created_at" },
          last_seen: { $max: "$created_at" },
          all_phrases: { $push: "$suspicious_phrases" }
        }
      }
    ]);

    if (domainData.length === 0) {
      throw new Error(`Domain ${domain} not found in threat logs`);
    }

    const data = domainData[0];
    
    // Extract common phrases
    const phraseCounts: { [key: string]: number } = {};
    data.all_phrases.flat().forEach((phrase: string) => {
      phraseCounts[phrase] = (phraseCounts[phrase] || 0) + 1;
    });

    const common_phrases = Object.entries(phraseCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([phrase, count]) => ({ phrase, count }));

    return {
      domain: data._id,
      total_reports: data.total_reports,
      recent_reports: data.recent_reports,
      avg_risk_score: Math.round(data.avg_risk_score * 10) / 10,
      risk_level: data.avg_risk_score >= 70 ? "High" : data.avg_risk_score >= 40 ? "Medium" : "Low",
      first_seen: data.first_seen,
      last_seen: data.last_seen,
      common_phrases
    };
  }
}

export default ThreatIntelligenceEngine;
