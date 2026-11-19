/**
 * URL Intelligence Service
 * 
 * Handles extracting intelligence from job URLs:
 * 1. Platform Detection (Trusted vs Risky)
 * 2. URL Pattern Risk (Shorteners, non-HTTPS)
 * 3. Content Extraction via HTML scraping with SSRF protection
 */

import { validateUrlForSSRF } from "../utils/ssrfValidator";
import jobExtractorService from "./jobExtractorService";
import { logger } from "../utils/logger";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UrlIntelligenceResult {
  is_url: boolean;
  original_url: string;
  domain: string;
  platform: string;
  platform_trust: "High" | "Medium" | "Low";
  url_risk: "High" | "Medium" | "Low";
  url_risk_reason?: string;
  extracted_text: string;
  fetch_successful: boolean;
  extracted_details?: {
    jobTitle?: string;
    company?: string;
    location?: string;
    salary?: string;
    recruiterEmail?: string;
    recruiterPhone?: string;
  };
}

// ─── Config ──────────────────────────────────────────────────────────────────

const URL_SHORTENERS = new Set([
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "adf.ly",
  "bit.do",
  "cutt.ly",
]);

// ─── Service ─────────────────────────────────────────────────────────────────

class UrlIntelligenceService {
  /**
   * Check if the input is a URL
   */
  isUrl(input: string): boolean {
    const trimmed = input.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return true;
    }
    if (!trimmed.includes(" ") && trimmed.includes(".") && trimmed.length < 2000) {
      try {
        new URL(`https://${trimmed}`);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  /**
   * Main analysis method
   */
  async analyzeUrl(inputUrl: string): Promise<UrlIntelligenceResult> {
    let urlString = inputUrl.trim();
    if (!urlString.startsWith("http")) {
      urlString = `https://${urlString}`;
    }

    let urlObj: URL;
    try {
      urlObj = new URL(urlString);
    } catch {
      throw new Error(`Invalid URL format: ${urlString}`);
    }

    const domain = urlObj.hostname.toLowerCase().replace(/^www\./, "");
    const { platform, platformTrust: platform_trust } = jobExtractorService.detectPlatform(domain);

    // 1. URL Pattern Analysis
    let url_risk: "High" | "Medium" | "Low" = "Low";
    let url_risk_reason: string | undefined;

    if (urlObj.protocol === "http:") {
      url_risk = "Medium";
      url_risk_reason = "Connection is not secure (HTTP instead of HTTPS).";
    }

    if (URL_SHORTENERS.has(domain)) {
      url_risk = "High";
      url_risk_reason = "URL shorteners hide the true destination, a common tactic in phishing and scam campaigns.";
    } else if (urlObj.pathname.length > 100 || urlObj.search.length > 200) {
      url_risk = "Medium";
      url_risk_reason = "Unusually long URL with excessive parameters, often used for tracking or exploiting parsing behaviors.";
    }

    if (platform_trust === "Low") {
      url_risk = "High";
      url_risk_reason = `${platform} links are heavily abused for recruitment fraud. Legitimate recruiters rarely send initial links to encrypted messaging apps.`;
    }

    // 2. Safe Content Extraction
    let extracted_text = "";
    let fetch_successful = false;
    let extracted_details: any = undefined;

    const skipScraping = URL_SHORTENERS.has(domain) || platform_trust === "Low";

    if (!skipScraping) {
      try {
        const extraction = await jobExtractorService.extractFromUrl(urlString);
        if (extraction.success && extraction.extracted) {
          extracted_text = extraction.extracted.description;
          fetch_successful = true;
          extracted_details = {
            jobTitle: extraction.extracted.jobTitle,
            company: extraction.extracted.company,
            location: extraction.extracted.location,
            salary: extraction.extracted.salary,
            recruiterEmail: extraction.extracted.recruiterEmail,
            recruiterPhone: extraction.extracted.recruiterPhone,
          };
        } else {
          logger.info("[URL_INTEL] Extraction completed without content", { url: urlString, error: extraction.error });
        }
      } catch (error) {
        logger.error("[URL_INTEL] Content extraction failed", {
          url: urlString,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return {
      is_url: true,
      original_url: urlString,
      domain,
      platform,
      platform_trust,
      url_risk,
      url_risk_reason,
      extracted_text,
      fetch_successful,
      extracted_details,
    };
  }
}

export default new UrlIntelligenceService();
