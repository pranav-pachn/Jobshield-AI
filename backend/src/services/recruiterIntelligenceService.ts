/**
 * Recruiter Intelligence Service
 * 
 * Answers: "Can this recruiter or company be trusted?"
 * 
 * Orchestrates 5 intelligence checks:
 * 1. Email Intelligence — free provider, identity mismatch, suspicious patterns
 * 2. Domain Intelligence — WHOIS age, SSL, SafeBrowsing, VirusTotal
 * 3. Company Verification — known companies list + domain cross-reference
 * 4. URL Safety — SafeBrowsing + VirusTotal on website
 * 5. Pattern-Based Red Flags — suspicious strings in all inputs
 */

import DomainIntelligenceService, {
  DomainIntelligenceResult,
} from "./domainIntelligenceService";
import EmailAnalysisService from "./emailAnalysisService";
import knownCompanies from "../data/knownCompanies.json";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RecruiterVerifyInput {
  recruiterName?: string;
  company?: string;
  email?: string;
  website?: string;
  phone?: string;
}

export interface RecruiterFlag {
  type: "critical" | "warning" | "info";
  message: string;
  category: "email" | "domain" | "company" | "url" | "pattern";
}

export interface CheckDetail {
  name: string;
  status: "pass" | "fail" | "warn" | "skip";
  message: string;
}

export interface RecruiterVerifyResult {
  trust_score: number;
  risk_level: "High" | "Medium" | "Low";
  flags: RecruiterFlag[];
  checks: {
    email: CheckDetail[];
    domain: CheckDetail[];
    company: CheckDetail[];
    url: CheckDetail[];
    patterns: CheckDetail[];
  };
  recommendation: string;
  recruiterName?: string;
  company?: string;
  email?: string;
  website?: string;
}

// ─── Free email providers ────────────────────────────────────────────────────

const FREE_EMAIL_PROVIDERS = new Set([
  "gmail.com", "yahoo.com", "outlook.com", "hotmail.com",
  "aol.com", "icloud.com", "protonmail.com", "tutanota.com",
  "mail.com", "zoho.com", "yandex.com", "gmx.com", "inbox.com",
  "live.com", "msn.com", "rediffmail.com", "mail.ru",
  "proton.me", "pm.me",
]);

// ─── Suspicious patterns ────────────────────────────────────────────────────

const SUSPICIOUS_STRINGS = [
  "urgent", "hiring-now", "job-offer", "quick-money", "earn-fast",
  "work-from-home", "no-experience", "guaranteed", "payment",
  "registration-fee", "processing-fee", "advance-fee", "pay-to-apply",
  "whatsapp-only", "telegram-only", "contact-whatsapp",
  "send-money", "wire-transfer", "crypto-payment",
  "limited-time", "act-now", "immediate-start",
];

// ─── Known Company lookup ───────────────────────────────────────────────────

interface KnownCompany {
  name: string;
  domains: string[];
}

const KNOWN_COMPANIES: KnownCompany[] = knownCompanies;

function findKnownCompany(companyName: string): KnownCompany | null {
  const normalized = companyName.toLowerCase().replace(/[\s\-_.&']+/g, "");
  for (const known of KNOWN_COMPANIES) {
    const knownNormalized = known.name.toLowerCase().replace(/[\s\-_.&']+/g, "");
    if (knownNormalized === normalized) return known;
    // Partial match: if input contains known name or vice versa
    if (normalized.includes(knownNormalized) || knownNormalized.includes(normalized)) {
      return known;
    }
  }
  return null;
}

// ─── Levenshtein distance for fuzzy / lookalike detection ───────────────────

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[m][n];
}

function extractBaseDomain(domain: string): string {
  // e.g. "tcs-careers-now.xyz" → "tcs-careers-now"
  return domain.split(".")[0].toLowerCase();
}

function isLookalikeDomain(inputDomain: string): { isLookalike: boolean; impersonating?: string } {
  const inputBase = extractBaseDomain(inputDomain).replace(/[\-_]/g, "");

  for (const company of KNOWN_COMPANIES) {
    for (const officialDomain of company.domains) {
      const officialBase = extractBaseDomain(officialDomain).replace(/[\-_]/g, "");

      // Exact match = legitimate, not lookalike
      if (inputDomain.toLowerCase() === officialDomain.toLowerCase()) {
        return { isLookalike: false };
      }

      // If input base CONTAINS official base but is not exactly it → lookalike
      // e.g. inputBase="tcscareers" contains officialBase="tcs"
      if (inputBase !== officialBase && inputBase.includes(officialBase) && inputBase.length > officialBase.length) {
        return { isLookalike: true, impersonating: company.name };
      }

      // Levenshtein distance: if very close but not exact → typosquatting
      const distance = levenshtein(inputBase, officialBase);
      if (distance > 0 && distance <= 2 && officialBase.length >= 4) {
        return { isLookalike: true, impersonating: company.name };
      }
    }
  }

  return { isLookalike: false };
}

// ─── Main Service ───────────────────────────────────────────────────────────

class RecruiterIntelligenceService {
  private domainService: DomainIntelligenceService;
  private emailService: EmailAnalysisService;

  constructor() {
    this.domainService = new DomainIntelligenceService();
    this.emailService = new EmailAnalysisService();
  }

  async verifyRecruiter(input: RecruiterVerifyInput): Promise<RecruiterVerifyResult> {
    let score = 100;
    const flags: RecruiterFlag[] = [];
    const checks: RecruiterVerifyResult["checks"] = {
      email: [],
      domain: [],
      company: [],
      url: [],
      patterns: [],
    };

    const { recruiterName, company, email, website, phone } = input;
    const emailDomain = email ? email.split("@")[1]?.toLowerCase() : null;
    const websiteDomain = website ? this.domainService.extractDomain(website) : null;
    const primaryDomain = websiteDomain || emailDomain;

    // ══════════════════════════════════════════════════════════════════════
    // 1. EMAIL INTELLIGENCE
    // ══════════════════════════════════════════════════════════════════════
    if (email && emailDomain) {
      // 1a. Free email provider check
      if (FREE_EMAIL_PROVIDERS.has(emailDomain)) {
        score -= 40;
        flags.push({
          type: "critical",
          message: `Uses free email domain (@${emailDomain}). Legitimate recruiters use company email.`,
          category: "email",
        });
        checks.email.push({
          name: "Free Email Provider",
          status: "fail",
          message: `@${emailDomain} is a free/personal email provider`,
        });
      } else {
        checks.email.push({
          name: "Free Email Provider",
          status: "pass",
          message: `Uses custom domain @${emailDomain}`,
        });
      }

      // 1b. Identity mismatch: company provided but email domain doesn't match
      if (company) {
        const knownCompany = findKnownCompany(company);
        if (knownCompany) {
          const emailMatchesOfficial = knownCompany.domains.some(
            (d) => d.toLowerCase() === emailDomain
          );
          if (emailMatchesOfficial) {
            score += 5; // small bonus
            checks.email.push({
              name: "Email-Company Match",
              status: "pass",
              message: `Email domain @${emailDomain} matches ${knownCompany.name}'s official domain`,
            });
          } else if (FREE_EMAIL_PROVIDERS.has(emailDomain)) {
            // Already penalized above, add specific mismatch flag
            score -= 25;
            flags.push({
              type: "critical",
              message: `Claims to be from ${company} but uses a personal @${emailDomain} email — classic impersonation tactic.`,
              category: "email",
            });
            checks.email.push({
              name: "Email-Company Match",
              status: "fail",
              message: `${company} recruiters would use @${knownCompany.domains[0]}, not @${emailDomain}`,
            });
          } else {
            // Custom domain but not matching official
            score -= 15;
            flags.push({
              type: "warning",
              message: `Email domain @${emailDomain} does not match ${company}'s known domains (${knownCompany.domains.join(", ")}).`,
              category: "email",
            });
            checks.email.push({
              name: "Email-Company Match",
              status: "warn",
              message: `Expected domain from ${knownCompany.domains.join("/")} but got @${emailDomain}`,
            });
          }
        }
      }

      // 1c. Suspicious email username patterns
      const suspiciousResult = this.emailService.hasSuspiciousPatterns(email);
      if (suspiciousResult.suspicious) {
        score -= 10;
        flags.push({
          type: "warning",
          message: `Suspicious email pattern: ${suspiciousResult.reason}`,
          category: "email",
        });
        checks.email.push({
          name: "Email Pattern",
          status: "warn",
          message: suspiciousResult.reason || "Suspicious username pattern",
        });
      } else {
        const corporateResult = this.emailService.hasCorporatePatterns(email);
        if (corporateResult.corporate) {
          checks.email.push({
            name: "Email Pattern",
            status: "pass",
            message: "Follows corporate naming convention (e.g., first.last@)",
          });
        } else {
          checks.email.push({
            name: "Email Pattern",
            status: "pass",
            message: "No suspicious patterns detected",
          });
        }
      }
    } else {
      checks.email.push({
        name: "Email Analysis",
        status: "skip",
        message: "No email provided",
      });
    }

    // ══════════════════════════════════════════════════════════════════════
    // 2. DOMAIN INTELLIGENCE
    // ══════════════════════════════════════════════════════════════════════
    if (primaryDomain) {
      try {
        const domainResult: DomainIntelligenceResult = await this.domainService.analyzeDomain(primaryDomain);

        // 2a. Domain age (WHOIS)
        if (domainResult.whoisData && !("error" in domainResult.whoisData)) {
          const age = domainResult.whoisData.domainAge;
          if (age !== null && age < 30) {
            score -= 30;
            flags.push({
              type: "critical",
              message: `Domain registered only ${age} days ago — most scam domains are very new.`,
              category: "domain",
            });
            checks.domain.push({
              name: "Domain Age",
              status: "fail",
              message: `Only ${age} days old (registered ${domainResult.whoisData.creationDate || "recently"})`,
            });
          } else if (age !== null && age < 180) {
            score -= 10;
            flags.push({
              type: "warning",
              message: `Domain is relatively new (${age} days old).`,
              category: "domain",
            });
            checks.domain.push({
              name: "Domain Age",
              status: "warn",
              message: `${age} days old — less than 6 months`,
            });
          } else if (age !== null) {
            checks.domain.push({
              name: "Domain Age",
              status: "pass",
              message: `${age} days old (${Math.floor(age / 365)}+ years)`,
            });
          }
        } else {
          checks.domain.push({
            name: "Domain Age",
            status: "skip",
            message: "WHOIS data unavailable",
          });
        }

        // 2b. SSL Certificate
        if ("valid" in domainResult.sslCertificate) {
          if (domainResult.sslCertificate.valid) {
            checks.domain.push({
              name: "SSL Certificate",
              status: "pass",
              message: `Valid SSL certificate from ${(domainResult.sslCertificate.issuer as any)?.O || "trusted CA"}`,
            });
          } else {
            score -= 10;
            flags.push({
              type: "warning",
              message: "Website does not have a valid SSL certificate (no HTTPS).",
              category: "domain",
            });
            checks.domain.push({
              name: "SSL Certificate",
              status: "fail",
              message: domainResult.sslCertificate.error || "No valid SSL",
            });
          }
        }

        // 2c. Google Safe Browsing
        if ("safe" in domainResult.safeBrowsing) {
          if (!domainResult.safeBrowsing.safe) {
            score -= 50;
            flags.push({
              type: "critical",
              message: `Website flagged by Google Safe Browsing: ${domainResult.safeBrowsing.threatTypes.join(", ")}`,
              category: "url",
            });
            checks.url.push({
              name: "Google Safe Browsing",
              status: "fail",
              message: `Threats: ${domainResult.safeBrowsing.threatTypes.join(", ")}`,
            });
          } else {
            checks.url.push({
              name: "Google Safe Browsing",
              status: "pass",
              message: "Not flagged as malicious",
            });
          }
        } else {
          checks.url.push({
            name: "Google Safe Browsing",
            status: "skip",
            message: "Check unavailable",
          });
        }

        // 2d. VirusTotal
        if ("malicious" in domainResult.virusTotal) {
          if (domainResult.virusTotal.malicious > 0) {
            score -= Math.min(50, domainResult.virusTotal.malicious * 15);
            flags.push({
              type: "critical",
              message: `Flagged by ${domainResult.virusTotal.malicious} security vendors on VirusTotal.`,
              category: "url",
            });
            checks.url.push({
              name: "VirusTotal",
              status: "fail",
              message: `${domainResult.virusTotal.malicious} malicious, ${domainResult.virusTotal.suspicious} suspicious`,
            });
          } else if (domainResult.virusTotal.suspicious > 0) {
            score -= domainResult.virusTotal.suspicious * 5;
            checks.url.push({
              name: "VirusTotal",
              status: "warn",
              message: `${domainResult.virusTotal.suspicious} suspicious detections`,
            });
          } else {
            checks.url.push({
              name: "VirusTotal",
              status: "pass",
              message: "Clean reputation",
            });
          }
        } else {
          checks.url.push({
            name: "VirusTotal",
            status: "skip",
            message: "Check unavailable",
          });
        }

        // 2e. Domain lookalike detection
        const lookalike = isLookalikeDomain(primaryDomain);
        if (lookalike.isLookalike) {
          score -= 45;
          flags.push({
            type: "critical",
            message: `Domain "${primaryDomain}" appears to impersonate ${lookalike.impersonating}. This is a common phishing tactic.`,
            category: "domain",
          });
          checks.domain.push({
            name: "Lookalike Detection",
            status: "fail",
            message: `Possible impersonation of ${lookalike.impersonating}`,
          });
        } else {
          checks.domain.push({
            name: "Lookalike Detection",
            status: "pass",
            message: "No domain impersonation detected",
          });
        }
      } catch (error) {
        console.error("Domain intelligence failed:", error);
        checks.domain.push({
          name: "Domain Analysis",
          status: "skip",
          message: `Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    } else {
      checks.domain.push({
        name: "Domain Analysis",
        status: "skip",
        message: "No domain or website provided",
      });
      checks.url.push({
        name: "URL Safety",
        status: "skip",
        message: "No website URL provided",
      });
    }

    // ══════════════════════════════════════════════════════════════════════
    // 3. COMPANY VERIFICATION
    // ══════════════════════════════════════════════════════════════════════
    if (company) {
      const knownCompany = findKnownCompany(company);
      if (knownCompany) {
        // Company is known — check if domain matches
        if (primaryDomain) {
          const domainMatchesOfficial = knownCompany.domains.some(
            (d) => d.toLowerCase() === primaryDomain.toLowerCase()
          );
          if (domainMatchesOfficial) {
            checks.company.push({
              name: "Company Verification",
              status: "pass",
              message: `${knownCompany.name} is a verified company, and the domain matches their official records`,
            });
          } else {
            // Company known but domain doesn't match
            score -= 15;
            flags.push({
              type: "warning",
              message: `Company "${company}" is known, but the provided domain (${primaryDomain}) does not match their official domains.`,
              category: "company",
            });
            checks.company.push({
              name: "Company Verification",
              status: "warn",
              message: `${knownCompany.name} is verified but domain mismatch — official domains: ${knownCompany.domains.join(", ")}`,
            });
          }
        } else {
          // Company known, no domain to verify
          checks.company.push({
            name: "Company Verification",
            status: "pass",
            message: `${knownCompany.name} is a verified company`,
          });
        }
      } else {
        // Company not in known list
        score -= 15;
        flags.push({
          type: "info",
          message: `Company "${company}" is not in our verified database. This does not mean it's fake — it may be a smaller or newer company.`,
          category: "company",
        });
        checks.company.push({
          name: "Company Verification",
          status: "warn",
          message: "Not found in verified companies database",
        });
      }
    } else {
      checks.company.push({
        name: "Company Verification",
        status: "skip",
        message: "No company name provided",
      });
    }

    // ══════════════════════════════════════════════════════════════════════
    // 4. PATTERN-BASED RED FLAGS
    // ══════════════════════════════════════════════════════════════════════
    const allText = [
      recruiterName || "",
      company || "",
      email || "",
      website || "",
      phone || "",
    ].join(" ").toLowerCase();

    const detectedPatterns: string[] = [];
    for (const pattern of SUSPICIOUS_STRINGS) {
      if (allText.includes(pattern.replace(/-/g, "")) || allText.includes(pattern.replace(/-/g, " "))) {
        detectedPatterns.push(pattern);
      }
    }

    // Check for heavy numeric suffixes in email username
    if (email) {
      const localPart = email.split("@")[0];
      if (/\d{4,}/.test(localPart)) {
        detectedPatterns.push("numeric-heavy-username");
      }
    }

    // Check for phone number mismatches (e.g., non-standard formats)
    if (phone) {
      const digitsOnly = phone.replace(/\D/g, "");
      if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        flags.push({
          type: "warning",
          message: "Phone number appears to be invalid (unusual length).",
          category: "pattern",
        });
        checks.patterns.push({
          name: "Phone Validation",
          status: "warn",
          message: `Phone number has ${digitsOnly.length} digits — expected 7-15`,
        });
      } else {
        checks.patterns.push({
          name: "Phone Validation",
          status: "pass",
          message: "Phone number format appears valid",
        });
      }
    }

    if (detectedPatterns.length > 0) {
      score -= Math.min(30, detectedPatterns.length * 15);
      flags.push({
        type: "warning",
        message: `Suspicious keywords detected: ${detectedPatterns.map(p => `"${p}"`).join(", ")}`,
        category: "pattern",
      });
      checks.patterns.push({
        name: "Red Flag Patterns",
        status: "fail",
        message: `${detectedPatterns.length} suspicious pattern(s) found`,
      });
    } else {
      checks.patterns.push({
        name: "Red Flag Patterns",
        status: "pass",
        message: "No suspicious patterns detected",
      });
    }

    // ══════════════════════════════════════════════════════════════════════
    // FINAL SCORING
    // ══════════════════════════════════════════════════════════════════════
    score = Math.max(0, Math.min(100, score));

    const risk_level: "High" | "Medium" | "Low" =
      score <= 32 ? "High" : score <= 65 ? "Medium" : "Low";

    const recommendation =
      risk_level === "High"
        ? "Do NOT proceed with this recruiter. Multiple high-risk indicators detected."
        : risk_level === "Medium"
          ? "Proceed with caution. Verify the recruiter's identity independently before sharing personal information."
          : "This recruiter appears legitimate based on available data. Exercise normal caution.";

    return {
      trust_score: score,
      risk_level,
      flags,
      checks,
      recommendation,
      recruiterName,
      company,
      email,
      website: website || (primaryDomain ? `https://${primaryDomain}` : undefined),
    };
  }
}

export default new RecruiterIntelligenceService();
