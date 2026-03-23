import DomainIntelligenceService, {
  DomainIntelligenceResult,
} from "./domainIntelligenceService";

type SuspiciousPatternResult = {
  suspicious: boolean;
  pattern?: string;
  reason?: string;
};

type CorporatePatternResult = {
  corporate: boolean;
  pattern?: string;
  reason?: string;
};

export type EmailTrustScore = {
  score: number;
  level: "high" | "medium" | "low";
  factors: string[];
  isFreeProvider: boolean;
  hasSuspiciousPatterns: boolean;
  hasCorporatePatterns: boolean;
};

export type EmailAnalysisResult = {
  email: string;
  analyzedAt: string;
  domain: string | null;
  isFreeProvider: boolean;
  suspiciousPatterns: SuspiciousPatternResult;
  corporatePatterns: CorporatePatternResult;
  domainIntelligence: DomainIntelligenceResult | { error: string } | null;
  trustScore: EmailTrustScore;
};

export type ExtractedEmailAnalysisResult = {
  email: string;
  success: boolean;
  data: EmailAnalysisResult | { error?: string };
};

export type AnalyzeEmailsFromTextResult = {
  emails: string[];
  analyses: ExtractedEmailAnalysisResult[];
  summary: {
    totalEmails: number;
    suspiciousEmails: number;
    corporateEmails: number;
    freeProviderEmails: number;
    averageTrustScore: number;
  };
};

export default class EmailAnalysisService {
  private readonly domainService: DomainIntelligenceService;
  private readonly freeEmailProviders: Set<string>;
  private readonly suspiciousPatterns: RegExp[];
  private readonly corporatePatterns: RegExp[];

  constructor() {
    this.domainService = new DomainIntelligenceService();

    this.freeEmailProviders = new Set([
      "gmail.com",
      "yahoo.com",
      "outlook.com",
      "hotmail.com",
      "aol.com",
      "icloud.com",
      "protonmail.com",
      "tutanota.com",
      "mail.com",
      "zoho.com",
      "yandex.com",
      "gmx.com",
      "inbox.com",
    ]);

    this.suspiciousPatterns = [
      /support\d*@/i,
      /hr\d*@/i,
      /recruit\d*@/i,
      /careers\d*@/i,
      /job\d*@/i,
      /info\d*@/i,
      /admin\d*@/i,
      /contact\d*@/i,
      /noreply*@/i,
      /no-reply*@/i,
      /\d{4,}@/i,
      /[a-z]+\d{3,}@/i,
      /[a-z]+\d+[a-z]+@/i,
    ];

    this.corporatePatterns = [
      /^[a-z]+\.[a-z]+@/i,
      /^[a-z]+_[a-z]+@/i,
      /^[a-z]+-[a-z]+@/i,
      /^[a-z]+[0-9]{1,2}@/i,
    ];
  }

  extractEmails(text: string): string[] {
    if (!text) return [];

    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const matches = text.match(emailRegex) || [];
    return [...new Set(matches.map((email) => email.toLowerCase()))];
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
    return emailRegex.test(email);
  }

  getDomainFromEmail(email: string): string | null {
    if (!email || !email.includes("@")) return null;
    return email.split("@")[1]?.toLowerCase() || null;
  }

  isFreeProvider(email: string): boolean {
    const domain = this.getDomainFromEmail(email);
    return domain ? this.freeEmailProviders.has(domain) : false;
  }

  hasSuspiciousPatterns(email: string): SuspiciousPatternResult {
    const localPart = email.split("@")[0]?.toLowerCase() || "";

    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(localPart)) {
        return {
          suspicious: true,
          pattern: pattern.toString(),
          reason: this.getPatternReason(pattern),
        };
      }
    }

    return { suspicious: false };
  }

  getPatternReason(pattern: RegExp): string {
    const patternStr = pattern.toString();

    if (patternStr.includes("support")) return "Generic support email";
    if (patternStr.includes("hr")) return "Generic HR email";
    if (patternStr.includes("recruit")) return "Generic recruitment email";
    if (patternStr.includes("careers")) return "Generic careers email";
    if (patternStr.includes("job")) return "Generic job email";
    if (patternStr.includes("info")) return "Generic info email";
    if (patternStr.includes("admin")) return "Generic admin email";
    if (patternStr.includes("contact")) return "Generic contact email";
    if (patternStr.includes("noreply") || patternStr.includes("no-reply")) {
      return "No-reply email address";
    }
    if (patternStr.includes("\\d{4,}")) return "Contains 4+ consecutive numbers";
    if (patternStr.includes("[a-z]+\\d{3,}")) return "Many numbers after name";
    if (patternStr.includes("[a-z]+\\d+[a-z]+")) return "Numbers mixed in name";

    return "Suspicious email pattern detected";
  }

  hasCorporatePatterns(email: string): CorporatePatternResult {
    const localPart = email.split("@")[0]?.toLowerCase() || "";

    for (const pattern of this.corporatePatterns) {
      if (pattern.test(localPart)) {
        return {
          corporate: true,
          pattern: pattern.toString(),
          reason: "Follows corporate naming convention",
        };
      }
    }

    return { corporate: false };
  }

  calculateEmailTrustScore(
    email: string,
    domainIntelligence: DomainIntelligenceResult | { error: string } | null = null
  ): EmailTrustScore {
    let score = 50;
    const factors: string[] = [];

    const isFree = this.isFreeProvider(email);
    const suspicious = this.hasSuspiciousPatterns(email);
    const corporate = this.hasCorporatePatterns(email);

    if (isFree) {
      score -= 15;
      factors.push("Uses free email provider");
    } else {
      score += 10;
      factors.push("Uses custom domain");
    }

    if (suspicious.suspicious) {
      score -= 25;
      factors.push(suspicious.reason || "Suspicious pattern detected");
    }

    if (corporate.corporate) {
      score += 15;
      factors.push(corporate.reason || "Corporate format detected");
    }

    if (domainIntelligence && !("error" in domainIntelligence) && domainIntelligence.trustScore) {
      const domainScore = domainIntelligence.trustScore.score;
      const domainWeight = 0.3;
      score = score * (1 - domainWeight) + domainScore * domainWeight;
      factors.push("Domain reputation considered");
    }

    const localPart = email.split("@")[0] || "";
    if (localPart.length < 3) {
      score -= 10;
      factors.push("Very short username");
    } else if (localPart.length > 20) {
      score -= 5;
      factors.push("Very long username");
    }

    const bounded = Math.max(0, Math.min(100, score));

    return {
      score: Math.round(bounded),
      level: bounded >= 70 ? "high" : bounded >= 40 ? "medium" : "low",
      factors,
      isFreeProvider: isFree,
      hasSuspiciousPatterns: suspicious.suspicious,
      hasCorporatePatterns: corporate.corporate,
    };
  }

  async analyzeEmail(
    email: string,
    includeDomainAnalysis = true
  ): Promise<EmailAnalysisResult> {
    if (!this.isValidEmail(email)) {
      throw new Error("Invalid email format");
    }

    console.log(`[EMAIL_ANALYSIS] Analyzing email: ${email}`);

    const result: EmailAnalysisResult = {
      email,
      analyzedAt: new Date().toISOString(),
      domain: this.getDomainFromEmail(email),
      isFreeProvider: this.isFreeProvider(email),
      suspiciousPatterns: this.hasSuspiciousPatterns(email),
      corporatePatterns: this.hasCorporatePatterns(email),
      domainIntelligence: null,
      trustScore: {
        score: 0,
        level: "low",
        factors: [],
        isFreeProvider: false,
        hasSuspiciousPatterns: false,
        hasCorporatePatterns: false,
      },
    };

    if (includeDomainAnalysis) {
      try {
        result.domainIntelligence = await this.domainService.analyzeDomain(email);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`[EMAIL_ANALYSIS] Domain analysis failed for ${email}:`, error);
        result.domainIntelligence = { error: message };
      }
    }

    result.trustScore = this.calculateEmailTrustScore(email, result.domainIntelligence);

    console.log(
      `[EMAIL_ANALYSIS] Analysis complete for ${email}: ${result.trustScore.score}/100 (${result.trustScore.level})`
    );

    return result;
  }

  async analyzeEmailsFromText(
    text: string,
    includeDomainAnalysis = true
  ): Promise<AnalyzeEmailsFromTextResult> {
    const emails = this.extractEmails(text);

    if (emails.length === 0) {
      return {
        emails: [],
        analyses: [],
        summary: {
          totalEmails: 0,
          suspiciousEmails: 0,
          corporateEmails: 0,
          freeProviderEmails: 0,
          averageTrustScore: 0,
        },
      };
    }

    console.log(`[EMAIL_ANALYSIS] Found ${emails.length} emails in text`);

    const analysesRaw = await Promise.allSettled(
      emails.map((email) => this.analyzeEmail(email, includeDomainAnalysis))
    );

    const analyses: ExtractedEmailAnalysisResult[] = analysesRaw.map((result, index) => ({
      email: emails[index],
      success: result.status === "fulfilled",
      data:
        result.status === "fulfilled"
          ? result.value
          : { error: result.reason instanceof Error ? result.reason.message : "Unknown error" },
    }));

    const successful = analyses
      .filter((item): item is { email: string; success: true; data: EmailAnalysisResult } => item.success)
      .map((item) => item.data);

    const summary = {
      totalEmails: emails.length,
      suspiciousEmails: successful.filter((item) => item.trustScore.level === "low").length,
      corporateEmails: successful.filter((item) => item.trustScore.hasCorporatePatterns).length,
      freeProviderEmails: successful.filter((item) => item.trustScore.isFreeProvider).length,
      averageTrustScore:
        successful.length > 0
          ? Math.round(
              successful.reduce((sum, item) => sum + item.trustScore.score, 0) /
                successful.length
            )
          : 0,
    };

    return {
      emails,
      analyses,
      summary,
    };
  }
}
