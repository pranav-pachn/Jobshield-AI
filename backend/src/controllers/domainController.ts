import { Request, Response } from "express";
import DomainIntelligenceService from "../services/domainIntelligenceService";
import { logger } from "../utils/logger";

const domainService = new DomainIntelligenceService();

export async function analyzeDomain(req: Request, res: Response) {
  try {
    const { domain, email, url } = req.body;

    if (!domain && !email && !url) {
      logger.error("[DOMAIN_ANALYZE] Missing required field", {
        reason: "domain, email, or url required",
      });
      return res.status(400).json({
        error: "Missing required field: domain, email, or url",
      });
    }

    const input = domain || email || url;
    logger.info("[DOMAIN_ANALYZE] Starting analysis", { input });

    const analysis = await domainService.analyzeDomain(input);

    logger.info("[DOMAIN_ANALYZE] Analysis complete", {
      domain: analysis.domain,
      trustScore: analysis.trustScore?.score,
    });

    return res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    logger.error("[DOMAIN_ANALYZE] Analysis failed", error);
    return res.status(500).json({
      error: "Domain analysis failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function quickCheckDomain(req: Request, res: Response) {
  try {
    const domainParam = req.params.domain;
    const domain = Array.isArray(domainParam) ? domainParam[0] : domainParam;

    if (!domain) {
      logger.error("[DOMAIN_QUICK_CHECK] Missing domain parameter");
      return res.status(400).json({ error: "Domain parameter required" });
    }

    logger.info("[DOMAIN_QUICK_CHECK] Quick check for", { domain });

    const analysis = await domainService.analyzeDomain(domain);
    const whoisData = analysis.whoisData && !("error" in analysis.whoisData) ? analysis.whoisData : null;
    const hasValidSSL = "valid" in analysis.sslCertificate ? analysis.sslCertificate.valid : false;
    const flaggedBySafeBrowsing = "safe" in analysis.safeBrowsing ? !analysis.safeBrowsing.safe : false;
    const maliciousReports = "malicious" in analysis.virusTotal ? analysis.virusTotal.malicious : 0;

    return res.json({
      success: true,
      data: {
        domain: analysis.domain,
        trustScore: analysis.trustScore,
        recentlyRegistered: !!(whoisData?.domainAge && whoisData.domainAge < 30),
        hasValidSSL,
        flaggedBySafeBrowsing,
        maliciousReports,
      },
    });
  } catch (error) {
    logger.error("[DOMAIN_QUICK_CHECK] Quick check failed", error);
    return res.status(500).json({
      error: "Quick domain check failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function bulkCheckDomains(req: Request, res: Response) {
  try {
    const { domains } = req.body;

    if (!Array.isArray(domains) || domains.length === 0) {
      logger.error("[DOMAIN_BULK_CHECK] Invalid domains array");
      return res.status(400).json({ error: "Array of domains required" });
    }

    if (domains.length > 10) {
      logger.error("[DOMAIN_BULK_CHECK] Too many domains", {
        count: domains.length,
      });
      return res
        .status(400)
        .json({ error: "Maximum 10 domains per request" });
    }

    logger.info("[DOMAIN_BULK_CHECK] Checking domains", { count: domains.length });

    const results = await Promise.allSettled(
      domains.map((domain) => domainService.analyzeDomain(domain))
    );

    const analyses = results.map((result, index) => ({
      domain: domains[index],
      success: result.status === "fulfilled",
      data:
        result.status === "fulfilled"
          ? result.value
          : { error: (result as PromiseRejectedResult).reason?.message },
    }));

    return res.json({
      success: true,
      data: {
        analyzed: analyses.length,
        results: analyses,
      },
    });
  } catch (error) {
    logger.error("[DOMAIN_BULK_CHECK] Bulk check failed", error);
    return res.status(500).json({
      error: "Bulk domain check failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
