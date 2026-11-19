import axios from "axios";
import * as cheerio from "cheerio";
import { validateUrlForSSRF } from "../utils/ssrfValidator";
import { logger } from "../utils/logger";

// ─── Supported Platforms Configuration ───────────────────────────────────────

const TRUSTED_JOB_PLATFORMS: Record<string, string> = {
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
  "smartrecruiters.com": "SmartRecruiters",
  "ziprecruiter.com": "ZipRecruiter",
  "dice.com": "Dice",
  "upwork.com": "Upwork",
  "fiverr.com": "Fiverr",
  "remoteok.com": "RemoteOK",
  "weworkremotely.com": "WeWorkRemotely",
};

const SUSPICIOUS_COMMUNICATION_PLATFORMS: Record<string, string> = {
  "t.me": "Telegram",
  "telegram.me": "Telegram",
  "wa.me": "WhatsApp",
  "chat.whatsapp.com": "WhatsApp Group",
  "discord.gg": "Discord",
  "discord.com": "Discord",
  "craigslist.org": "Craigslist",
};

// ─── Output Types ─────────────────────────────────────────────────────────────

export interface ExtractedJobData {
  jobTitle?: string;
  company?: string;
  companyDomain?: string;
  location?: string;
  salary?: string;
  employmentType?: string;
  experience?: string;
  description: string;
  recruiterName?: string;
  recruiterEmail?: string;
  recruiterPhone?: string;
  sourcePlatform?: string;
  originalUrl: string;
}

export interface JobExtractionResult {
  success: boolean;
  url: string;
  domain: string;
  platform: string;
  platformTrust: "High" | "Medium" | "Low";
  isBlockedOrRequiresAuth?: boolean;
  error?: string;
  extracted?: ExtractedJobData;
  metadata?: {
    hasJsonLd: boolean;
    hasMetaTags: boolean;
    contentLength: number;
  };
}

// ─── Extraction Service ───────────────────────────────────────────────────────

export class JobExtractorService {
  /**
   * Identifies the platform name and platform trust level from a domain.
   */
  public detectPlatform(domain: string): { platform: string; platformTrust: "High" | "Medium" | "Low" } {
    const cleanDomain = domain.toLowerCase().replace(/^www\./, "");

    for (const [key, name] of Object.entries(TRUSTED_JOB_PLATFORMS)) {
      if (cleanDomain === key || cleanDomain.endsWith(`.${key}`)) {
        return { platform: name, platformTrust: "High" };
      }
    }

    for (const [key, name] of Object.entries(SUSPICIOUS_COMMUNICATION_PLATFORMS)) {
      if (cleanDomain === key || cleanDomain.endsWith(`.${key}`)) {
        return { platform: name, platformTrust: "Low" };
      }
    }

    return { platform: "External / Company Portal", platformTrust: "Medium" };
  }

  /**
   * Safely extracts text and structured data from a job posting URL with SSRF protection.
   */
  public async extractFromUrl(rawUrl: string): Promise<JobExtractionResult> {
    const trimmedUrl = rawUrl.trim();

    // 1. SSRF Validation
    const ssrfCheck = await validateUrlForSSRF(trimmedUrl);
    if (!ssrfCheck.isSafe) {
      logger.warn("[JOB_EXTRACTOR] SSRF check rejected URL", { rawUrl: trimmedUrl, reason: ssrfCheck.reason });
      return {
        success: false,
        url: trimmedUrl,
        domain: "unknown",
        platform: "Unknown",
        platformTrust: "Low",
        error: ssrfCheck.reason || "The provided URL is not accessible or poses a security risk.",
        isBlockedOrRequiresAuth: false,
      };
    }

    const safeUrl = ssrfCheck.sanitizedUrl || trimmedUrl;
    let urlObj: URL;
    try {
      urlObj = new URL(safeUrl);
    } catch {
      return {
        success: false,
        url: trimmedUrl,
        domain: "unknown",
        platform: "Unknown",
        platformTrust: "Low",
        error: "Malformed URL.",
      };
    }

    const domain = urlObj.hostname.toLowerCase().replace(/^www\./, "");
    const { platform, platformTrust } = this.detectPlatform(domain);

    // If target is an instant messaging link (Telegram/WhatsApp), we cannot scrape HTML job content
    if (platformTrust === "Low" && (domain.includes("t.me") || domain.includes("wa.me") || domain.includes("whatsapp"))) {
      return {
        success: false,
        url: safeUrl,
        domain,
        platform,
        platformTrust,
        isBlockedOrRequiresAuth: true,
        error: `This URL points to ${platform}, which requires direct app access. Please paste the recruitment message directly into the analyzer.`,
      };
    }

    // 2. Fetch HTML with strict timeouts, size limits, and redirect validation
    try {
      const response = await axios.get(safeUrl, {
        timeout: 8000,
        maxContentLength: 2.5 * 1024 * 1024, // 2.5 MB maximum
        maxBodyLength: 2.5 * 1024 * 1024,
        maxRedirects: 5,
        beforeRedirect: (options) => {
          // Validate each redirect destination against SSRF
          const nextUrl = options.href || `${options.protocol}//${options.host}${options.path}`;
          validateUrlForSSRF(nextUrl).then((result) => {
            if (!result.isSafe) {
              throw new Error(`Unsafe redirect destination blocked: ${result.reason}`);
            }
          });
        },
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        validateStatus: (status) => status >= 200 && status < 400,
      });

      const contentType = response.headers["content-type"] || "";
      if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
        return {
          success: false,
          url: safeUrl,
          domain,
          platform,
          platformTrust,
          error: "The provided URL did not return an HTML web page.",
        };
      }

      const html = typeof response.data === "string" ? response.data : String(response.data);
      const parsedData = this.parseJobHtml(html, safeUrl, domain, platform);

      if (!parsedData.description || parsedData.description.length < 80) {
        return {
          success: false,
          url: safeUrl,
          domain,
          platform,
          platformTrust,
          isBlockedOrRequiresAuth: true,
          error:
            "We couldn't automatically retrieve this job posting. Paste the job description or recruiter message below to continue.",
        };
      }

      return {
        success: true,
        url: safeUrl,
        domain,
        platform,
        platformTrust,
        extracted: parsedData,
        metadata: {
          hasJsonLd: Boolean(parsedData.jobTitle && parsedData.company),
          hasMetaTags: true,
          contentLength: parsedData.description.length,
        },
      };
    } catch (err: any) {
      logger.warn("[JOB_EXTRACTOR] HTML fetch error", {
        url: safeUrl,
        message: err.message,
        status: err.response?.status,
      });

      // Distinguish bot protection / auth walls
      const status = err.response?.status;
      const isBlocked = status === 401 || status === 403 || status === 429 || status === 999;

      return {
        success: false,
        url: safeUrl,
        domain,
        platform,
        platformTrust,
        isBlockedOrRequiresAuth: isBlocked,
        error:
          "We couldn't automatically retrieve this job posting. Paste the job description or recruiter message below to continue.",
      };
    }
  }

  /**
   * Extracts structured job information from HTML using JSON-LD, meta tags, and semantic DOM trees.
   */
  private parseJobHtml(html: string, originalUrl: string, domain: string, platform: string): ExtractedJobData {
    const $ = cheerio.load(html);

    // Strip executable and irrelevant DOM nodes
    $("script:not([type='application/ld+json']), style, noscript, iframe, svg, img, form, nav, footer, header").remove();

    let jobTitle: string | undefined;
    let company: string | undefined;
    let companyDomain: string | undefined;
    let location: string | undefined;
    let salary: string | undefined;
    let employmentType: string | undefined;
    let experience: string | undefined;
    let description = "";

    // ── Strategy A: Parse Schema.org JobPosting JSON-LD ──
    $('script[type="application/ld+json"]').each((_, elem) => {
      try {
        const rawJson = $(elem).html();
        if (!rawJson) return;
        const data = JSON.parse(rawJson);

        const postings: any[] = [];
        if (Array.isArray(data)) {
          postings.push(...data);
        } else if (data["@graph"] && Array.isArray(data["@graph"])) {
          postings.push(...data["@graph"]);
        } else {
          postings.push(data);
        }

        for (const item of postings) {
          const itemType = String(item["@type"] || "").toLowerCase();
          if (itemType.includes("jobposting")) {
            if (!jobTitle && item.title) jobTitle = String(item.title).trim();
            if (!company && item.hiringOrganization?.name) company = String(item.hiringOrganization.name).trim();
            if (!companyDomain && item.hiringOrganization?.sameAs) {
              try {
                companyDomain = new URL(item.hiringOrganization.sameAs).hostname.replace(/^www\./, "");
              } catch {}
            }
            if (!location && item.jobLocation) {
              const loc = item.jobLocation;
              if (typeof loc === "string") {
                location = loc.trim();
              } else if (loc.address) {
                const addr = loc.address;
                const parts = [addr.addressLocality, addr.addressRegion, addr.addressCountry].filter(Boolean);
                if (parts.length > 0) location = parts.join(", ");
              }
            }
            if (!salary && item.baseSalary) {
              const sal = item.baseSalary;
              if (typeof sal === "string") {
                salary = sal.trim();
              } else if (sal.value) {
                const val = sal.value;
                const curr = sal.currency || "$";
                if (typeof val === "object" && (val.minValue || val.maxValue)) {
                  salary = `${curr} ${val.minValue ?? ""} - ${val.maxValue ?? ""} ${val.unitText ? `/ ${val.unitText}` : ""}`.trim();
                } else {
                  salary = `${curr} ${val} ${sal.unitText ? `/ ${sal.unitText}` : ""}`.trim();
                }
              }
            }
            if (!employmentType && item.employmentType) {
              employmentType = Array.isArray(item.employmentType) ? item.employmentType.join(", ") : String(item.employmentType);
            }
            if (!description && item.description) {
              const $desc = cheerio.load(String(item.description));
              description = $desc.text().replace(/\s+/g, " ").trim();
            }
          }
        }
      } catch {
        // Continue fallback strategies on JSON-LD parse errors
      }
    });

    // ── Strategy B: OpenGraph & Standard Meta Tags ──
    if (!jobTitle) {
      const ogTitle = $('meta[property="og:title"]').attr("content") || $('meta[name="twitter:title"]').attr("content") || $("title").text();
      if (ogTitle) {
        // Clean title separators (e.g. "Software Engineer | Acme Corp | LinkedIn")
        const parts = ogTitle.split(/[-–—|•]/);
        jobTitle = parts[0]?.trim();
        if (!company && parts.length > 1 && parts[1]?.trim().length > 1 && parts[1].trim().length < 50) {
          company = parts[1].trim();
        }
      }
    }

    if (!company) {
      const siteName = $('meta[property="og:site_name"]').attr("content");
      if (siteName && siteName.toLowerCase() !== platform.toLowerCase()) {
        company = siteName.trim();
      }
    }

    if (!description) {
      const metaDesc =
        $('meta[property="og:description"]').attr("content") ||
        $('meta[name="twitter:description"]').attr("content") ||
        $('meta[name="description"]').attr("content");
      if (metaDesc && metaDesc.length > 50) {
        description = metaDesc.trim();
      }
    }

    // ── Strategy C: Semantic DOM Selectors ──
    if (!jobTitle) {
      const h1Text = $("h1").first().text().replace(/\s+/g, " ").trim();
      if (h1Text && h1Text.length > 3 && h1Text.length < 120) {
        jobTitle = h1Text;
      }
    }

    if (!company) {
      const compElem = $('[class*="company-name"], [class*="employer"], [data-company-name="true"], [class*="companyName"]').first();
      if (compElem.length > 0) {
        const compText = compElem.text().replace(/\s+/g, " ").trim();
        if (compText && compText.length > 1 && compText.length < 80) {
          company = compText;
        }
      }
    }

    if (!location) {
      const locElem = $('[class*="location"], [class*="workplace"], [data-automation-id="jobLocation"]').first();
      if (locElem.length > 0) {
        const locText = locElem.text().replace(/\s+/g, " ").trim();
        if (locText && locText.length < 80) {
          location = locText;
        }
      }
    }

    // Main description body extraction
    if (!description || description.length < 200) {
      const bodyCandidate = $(
        '[class*="job-description"], [class*="jobDescription"], [id*="job-description"], [class*="posting-content"], main, article'
      ).first();

      let extractedBody = "";
      if (bodyCandidate.length > 0) {
        extractedBody = bodyCandidate.text().replace(/\s+/g, " ").trim();
      } else {
        extractedBody = $("body").text().replace(/\s+/g, " ").trim();
      }

      if (extractedBody.length > description.length) {
        description = extractedBody;
      }
    }

    // ── Strategy D: Regex Contact & Recruiter Extraction from Description ──
    let recruiterEmail: string | undefined;
    let recruiterPhone: string | undefined;

    if (description) {
      // Email pattern (filtering common generic domains)
      const emailMatch = description.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
      if (emailMatch) {
        const found = emailMatch[0].toLowerCase();
        if (!found.includes("example.com") && !found.includes("sentry.io") && !found.includes("support@")) {
          recruiterEmail = found;
        }
      }

      // Phone pattern (e.g. +1 555-123-4567 or +91 9876543210)
      const phoneMatch = description.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/);
      if (phoneMatch) {
        recruiterPhone = phoneMatch[0].trim();
      }

      // Salary regex pattern if not already found
      if (!salary) {
        const salaryMatch = description.match(/(?:salary|compensation|pay|rate)[:\s]*([$₹£€]\s*[\d,]+(?:\s*-\s*[$₹£€]?\s*[\d,]+)?(?:\s*(?:per|\/)\s*(?:year|annum|hr|hour|month|wk|week))?)/i);
        if (salaryMatch) {
          salary = salaryMatch[1].trim();
        }
      }
    }

    // Sanitize and limit description length to a safe 20,000 characters
    description = description.slice(0, 20000).trim();

    return {
      jobTitle: jobTitle?.slice(0, 200),
      company: company?.slice(0, 150),
      companyDomain,
      location: location?.slice(0, 150),
      salary: salary?.slice(0, 100),
      employmentType: employmentType?.slice(0, 80),
      experience: experience?.slice(0, 100),
      description,
      recruiterEmail,
      recruiterPhone,
      sourcePlatform: platform,
      originalUrl,
    };
  }
}

export default new JobExtractorService();
