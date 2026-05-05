type RiskLevel = "Low" | "Medium" | "High";

type DomainIntelligence = {
  domain?: string;
  domain_age_days?: number;
  trust_score?: number;
  threat_level?: "low" | "medium" | "high";
  recently_registered?: boolean;
};

interface BuildRecruiterReadyReasonsParams {
  risk_level: RiskLevel;
  reasons?: string[];
  suspicious_phrases?: string[];
  domain_intelligence?: DomainIntelligence;
  community_report_count?: number;
  recruiter_email?: string;
  job_url?: string;
  threat_frequency?: number;
}

interface RecruiterReadyReasonResult {
  reasons: string[];
  summary_reasons: string[];
}

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "protonmail.com",
  "tutanota.com",
]);

const NORMALIZED_REASON_MAP = new Map<string, string>([
  ["payment requested before onboarding", "Requests payment before onboarding."],
  ["upfront payment request is suspicious", "Requests an upfront training or onboarding fee."],
  ["wire transfer request is a scam indicator", "Requests payment by wire transfer."],
  ["gift card payment method is high risk", "Requests payment by gift card."],
  ["crypto payment request is difficult to recover", "Requests payment in cryptocurrency."],
  ["high-pressure urgency language detected", "Uses pressure tactics to rush the candidate."],
  ["pressure to act immediately", "Pressures the candidate to act immediately."],
  ["no-screening hiring flow is suspicious", "Offers hiring without a real interview process."],
  ["overly broad qualification claim", "Claims almost anyone can qualify with little screening."],
  ["common phrase in scam campaigns", "Uses language commonly seen in scam job campaigns."],
  ["guaranteed earnings promise is suspicious", "Promises guaranteed income."],
  ["scarcity pressure tactic detected", "Uses scarcity language such as limited slots."],
  ["compensation claim appears unusually high for a generic role", "Offers compensation that appears unusually high for the role."],
  ["requests to move conversation to unverified private channels", "Pushes the conversation to private messaging apps."],
  ["obfuscated links hide final destination - common phishing and scam tactic", "Includes shortened or obfuscated links."],
  ["high confidence decision from rules", "Multiple high-confidence rule-based scam indicators were detected."],
  ["ai response parsing failed", "AI output could not be fully parsed, so fallback checks were used."],
  ["ai unavailable, using rules-based detection", "AI service was unavailable, so the result uses rules-based detection."],
  ["no strong scam indicators detected in rule and heuristic checks", "No strong scam indicators were detected in the job text."],
]);

function toSentenceCase(value: string): string {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) {
    return "";
  }

  const normalized = trimmed.replace(/[.!?]+$/, "");
  return normalized.charAt(0).toUpperCase() + normalized.slice(1) + ".";
}

function normalizeReasonText(reason: string): string {
  const trimmed = reason.trim();
  if (!trimmed) {
    return "";
  }

  const lowered = trimmed.toLowerCase();

  if (NORMALIZED_REASON_MAP.has(lowered)) {
    return NORMALIZED_REASON_MAP.get(lowered)!;
  }

  if (lowered.startsWith("free email service (")) {
    return "Recruiter uses a free email domain instead of a company domain.";
  }

  if (lowered.startsWith("recruiter contact uses free email service")) {
    return "Recruiter uses a free email domain instead of a company domain.";
  }

  if (lowered.startsWith("domain ") && lowered.includes("reported")) {
    return toSentenceCase(trimmed);
  }

  if (lowered.startsWith('phrase "') && lowered.includes("appears in")) {
    return toSentenceCase(trimmed);
  }

  return toSentenceCase(trimmed);
}

function dedupeReasons(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const normalized = value.trim();
    if (!normalized) {
      continue;
    }

    const key = normalized.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(normalized);
  }

  return result;
}

function getEmailDomain(email?: string): string | undefined {
  if (!email || !email.includes("@")) {
    return undefined;
  }

  return email.split("@")[1]?.toLowerCase();
}

function getUrlDomain(jobUrl?: string): string | undefined {
  if (!jobUrl) {
    return undefined;
  }

  try {
    return new URL(jobUrl).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

function getComparableDomain(domain?: string): string | undefined {
  if (!domain) {
    return undefined;
  }

  const clean = domain.toLowerCase().replace(/^www\./, "");
  const parts = clean.split(".").filter(Boolean);

  if (parts.length < 2) {
    return clean;
  }

  return parts.slice(-2).join(".");
}

export function buildRecruiterReadyReasons(
  params: BuildRecruiterReadyReasonsParams,
): RecruiterReadyReasonResult {
  const baseReasons = dedupeReasons((params.reasons || []).map(normalizeReasonText).filter(Boolean));
  const summaryReasons: string[] = [];

  for (const phrase of (params.suspicious_phrases || []).slice(0, 2)) {
    if (phrase?.trim()) {
      summaryReasons.push(`Contains suspicious phrase: "${phrase.trim()}"`);
    }
  }

  const domainAge = params.domain_intelligence?.domain_age_days;
  if (typeof domainAge === "number" && domainAge >= 0 && domainAge < 90) {
    summaryReasons.push(`Domain registered ${domainAge} day${domainAge === 1 ? "" : "s"} ago`);
  }

  const recruiterDomain = getComparableDomain(getEmailDomain(params.recruiter_email));
  const websiteDomain = getComparableDomain(
    params.domain_intelligence?.domain || getUrlDomain(params.job_url),
  );

  if (
    recruiterDomain &&
    websiteDomain &&
    recruiterDomain !== websiteDomain &&
    !FREE_EMAIL_DOMAINS.has(recruiterDomain)
  ) {
    summaryReasons.push("Recruiter email domain does not match the company website domain");
  }

  const recurrenceCount = Math.max(params.community_report_count || 0, params.threat_frequency || 0);
  if (recurrenceCount > 0) {
    summaryReasons.push(
      `Previously reported in ${recurrenceCount} scam case${recurrenceCount === 1 ? "" : "s"}`,
    );
  }

  if (params.domain_intelligence?.trust_score !== undefined && params.domain_intelligence.trust_score < 35) {
    summaryReasons.push("Domain reputation appears unusually weak for a legitimate employer");
  }

  const allReasons = dedupeReasons([...summaryReasons, ...baseReasons]);
  const fallback =
    params.risk_level === "Low"
      ? "No strong scam indicators were detected in the job text."
      : "Multiple scam indicators were detected in the job text.";
  const reasons = allReasons.length > 0 ? allReasons : [fallback];

  return {
    reasons,
    summary_reasons: reasons.slice(0, 4),
  };
}
