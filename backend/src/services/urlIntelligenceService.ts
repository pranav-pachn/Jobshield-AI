/**
 * URL Intelligence Service
 * 
 * Handles extracting intelligence from job URLs:
 * 1. Platform Detection (Trusted vs Risky)
 * 2. URL Pattern Risk (Shorteners, non-HTTPS)
 * 3. Content Extraction via HTML scraping
 */

import axios from "axios";
import * as cheerio from "cheerio";
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
}

// ─── Config ──────────────────────────────────────────────────────────────────

const TRUSTED_PLATFORMS: Record<string, string> = {
  "linkedin.com": "LinkedIn",
  "indeed.com": "Indeed",
  "glassdoor.com": "Glassdoor",
  "naukri.com": "Naukri",
  "monster.com": "Monster / Foundit",
  "foundit.in": "Foundit",
  "simplyhired.com": "SimplyHired",
  "wellfound.com": "Wellfound (AngelList)",
  "workable.com": "Workable",
  "greenhouse.io": "Greenhouse",
  "lever.co": "Lever",
  "bamboohr.com": "BambooHR",
  "myworkdayjobs.com": "Workday",
};

const SUSPICIOUS_PLATFORMS: Record<string, string> = {
  "telegram.me": "Telegram",
  "t.me": "Telegram",
  "wa.me": "WhatsApp",
  "discord.gg": "Discord",
  "facebook.com": "Facebook", // Often used for informal/scam recruiting
  "craigslist.org": "Craigslist",
};

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
    // Accept standard URLs
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return true;
    }
    // Also accept obvious domains like www.linkedin.com/jobs... if no spaces
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
    } catch (e) {
      throw new Error(`Invalid URL format: ${urlString}`);
    }

    const domain = urlObj.hostname.toLowerCase().replace(/^www\./, "");
    
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

    // 2. Platform Detection
    let platform = "Unknown / Custom Website";
    let platform_trust: "High" | "Medium" | "Low" = "Low";

    // Check trusted
    for (const [key, name] of Object.entries(TRUSTED_PLATFORMS)) {
      if (domain === key || domain.endsWith(`.${key}`)) {
        platform = name;
        platform_trust = "High";
        break;
      }
    }

    // Check suspicious if not trusted
    if (platform_trust !== "High") {
      for (const [key, name] of Object.entries(SUSPICIOUS_PLATFORMS)) {
        if (domain === key || domain.endsWith(`.${key}`)) {
          platform = name;
          platform_trust = "Low";
          // If we detect telegram/whatsapp hiring link, force url risk high
          url_risk = "High";
          url_risk_reason = `${name} links are heavily abused for recruitment fraud. Legitimate recruiters rarely send initial links to encrypted messaging apps.`;
          break;
        }
      }
    }

    // 3. Content Extraction (Fetch HTML)
    let extracted_text = "";
    let fetch_successful = false;

    // Do not attempt to fetch from chat apps or known shorteners because they rely on JS redirects
    // or just open desktop apps. Also, skip if we know the domain blocks simple scraping (e.g. linkedin)
    // Actually, for LinkedIn, simple scraping fails (returns auth wall), but we will attempt it gracefully.
    const skipScraping = URL_SHORTENERS.has(domain) || SUSPICIOUS_PLATFORMS[domain];

    if (!skipScraping) {
      try {
        const response = await axios.get(urlString, {
          timeout: 8000,
          headers: {
            // Spoof user agent to avoid basic blocks
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
          },
          // Validate status so axios doesn't throw on 4xx/5xx, letting us handle it
          validateStatus: (status) => status < 500,
        });

        if (response.status === 200) {
          const html = response.data;
          const $ = cheerio.load(html);

          // Remove script, style, noscript, etc.
          $("script, style, noscript, iframe, img, svg").remove();

          // Best effort extraction:
          // Often job descriptions are in main, article, or elements with "job", "description" classes.
          let text = "";
          const jobDescriptionNode = $('[class*="job-description"], [class*="JobDescription"], [id*="job-description"], main, article');

          if (jobDescriptionNode.length > 0) {
            text = jobDescriptionNode.text();
          } else {
            text = $("body").text();
          }

          // Clean up whitespace
          text = text.replace(/\s+/g, " ").trim();

          // If we got meaningful text out of it
          if (text.length > 200) {
            extracted_text = text;
            fetch_successful = true;
          } else {
            logger.error("[URL_INTEL] Fetched HTML but extracted text was too short", { url: urlString, textLength: text.length });
            // If we couldn't parse the exact job description but we got the page title, use that + meta description
            const title = $("title").text().trim();
            const metaDesc = $('meta[name="description"]').attr("content")?.trim() || "";
            if (title || metaDesc) {
               extracted_text = `${title}\n\n${metaDesc}`;
               fetch_successful = true;
            }
          }
        } else {
           logger.error(`[URL_INTEL] Fetch returned status ${response.status}`, { url: urlString });
        }
      } catch (error) {
        logger.error("[URL_INTEL] Content extraction failed", { 
          url: urlString, 
          error: error instanceof Error ? error.message : "Unknown error" 
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
    };
  }
}

export default new UrlIntelligenceService();
