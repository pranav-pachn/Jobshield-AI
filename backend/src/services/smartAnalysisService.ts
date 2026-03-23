import { analyzeJobText } from "./aiService";

type RiskLevel = "Low" | "Medium" | "High";

// ============ PREPROCESSING CONSTANTS ============
const STOPWORDS = new Set([
  // Common English words that don't add scam detection value
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could", "should",
  "may", "might", "must", "can", "i", "you", "he", "she", "it", "we", "they",
  "what", "which", "who", "when", "where", "why", "how", "all", "each", "every",
  "both", "few", "more", "most", "other", "some", "such", "no", "nor", "not",
  "only", "own", "same", "so", "than", "too", "very", "just", "if", "in", "on",
  "at", "by", "for", "of", "with", "to", "and", "or", "but", "as", "about",
  "during", "before", "after", "above", "below", "between", "through", "into",
  "up", "down", "out", "off", "over", "under", "again", "further", "then", "once",
  "here", "there", "this", "that", "these", "those", "am", "my", "your", "his",
  "her", "its", "our", "their", "me", "him", "us", "them",
]);

// High-value indicators for scam detection
const MONEY_KEYWORDS = [
  /(\$|\₹|usd|inr|salary|pay|wage|compensation|earning|bonus|payment|fee|cost|price|amount|money|deposit|investment)/i,
];

const URGENCY_KEYWORDS = [
  /\b(urgent|immediately|asap|now|quick|hurry|limited|slots|apply\s+now|don't\s+miss|act\s+fast|only|apply\s+today)\b/i,
];

const TARGET_LENGTH = 500; // Character limit after preprocessing

// ============ HELPER FUNCTIONS ============
function extractImportantLines(text: string): string {
  const lines = text.split(/\n|\.(?=\s)|;/).filter(line => line.trim());
  const importantLines: string[] = [];
  const seen = new Set<string>();

  // First pass: extract lines with money or urgency keywords
  for (const line of lines) {
    const normalized = line.toLowerCase().trim();
    if (seen.has(normalized)) continue; // Skip duplicates
    
    const hasMoney = MONEY_KEYWORDS.some(regex => regex.test(line));
    const hasUrgency = URGENCY_KEYWORDS.some(regex => regex.test(line));
    
    if (hasMoney || hasUrgency || importantLines.length < 2) {
      // Keep lines with money/urgency, or first couple lines for context
      if (importantLines.length < 8) { // Limit to ~8 important lines
        importantLines.push(line.trim());
        seen.add(normalized);
      }
    }
  }

  return importantLines.join(" ");
}

function removeStopwords(text: string): string {
  return text
    .split(/\s+/)
    .filter(word => !STOPWORDS.has(word.toLowerCase()))
    .join(" ");
}

function removeRepeatedContent(text: string): string {
  const words = text.split(/\s+/);
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const word of words) {
    const lower = word.toLowerCase();
    if (!seen.has(lower)) {
      unique.push(word);
      seen.add(lower);
    }
  }

  return unique.join(" ");
}

function cleanFormatting(text: string): string {
  return text
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // Remove zero-width characters
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/[^a-zA-Z0-9\s$₹.,!?()\-:;]/g, "") // Remove special chars except important ones
    .trim();
}

type SmartAnalysisResult = {
  scam_probability: number;
  risk_level: RiskLevel;
  confidence?: number;
  suspicious_phrases: string[];
  reasons: string[];
  component_scores?: {
    rule_score?: number;
    zero_shot_score?: number;
    similarity_score?: number;
  };
  phrase_details?: Array<{
    phrase: string;
    confidence: number;
    reason: string;
  }>;
  matching_templates?: string[];
  ai_invoked: boolean;
  ai_latency_ms: number;
  pipeline: {
    preprocessed_length: number;
    rule_score: number;
    heuristic_score: number;
    ai_triggered_by: "high_uncertainty" | "not_needed";
  };
};

type RuleMatch = {
  phrase: string;
  score: number;
  reason: string;
};

type PhraseDetail = {
  phrase: string;
  confidence: number;
  reason: string;
};

const RULE_PATTERNS: RuleMatch[] = [
  { phrase: "registration fee", score: 0.24, reason: "payment requested before onboarding" },
  { phrase: "training fee", score: 0.2, reason: "upfront payment request is suspicious" },
  { phrase: "wire transfer", score: 0.24, reason: "wire transfer request is a scam indicator" },
  { phrase: "gift card", score: 0.24, reason: "gift card payment method is high risk" },
  { phrase: "crypto payment", score: 0.24, reason: "crypto payment request is difficult to recover" },
  { phrase: "urgent hiring", score: 0.14, reason: "high-pressure urgency language detected" },
  { phrase: "start immediately", score: 0.12, reason: "pressure to act immediately" },
  { phrase: "no interview", score: 0.2, reason: "no-screening hiring flow is suspicious" },
  { phrase: "no experience needed", score: 0.12, reason: "overly broad qualification claim" },
  { phrase: "work from home", score: 0.08, reason: "common phrase in scam campaigns" },
  { phrase: "guaranteed income", score: 0.2, reason: "guaranteed earnings promise is suspicious" },
  { phrase: "limited slots", score: 0.1, reason: "scarcity pressure tactic detected" },
];

// ============ ENHANCED RULE DETECTION SIGNALS ============
// Suspicious domains commonly used in job scams
const SUSPICIOUS_DOMAINS = new Set([
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", // Free email instead of company domain
  "protonmail.com", "tutanota.com", "guerrillamail.com", // Anonymous email services
  "mail.ru", "yandex.ru", // Russian domain (often used in international scams)
  "163.com", "qq.com", // Chinese free email
  "temp-mail.org", "10minutemail.com", // Temporary email services
]);

// Shortened URL patterns (redirect/obfuscation tactics)
const SHORTENED_LINK_PATTERNS = [
  /bit\.ly\//i,
  /tinyurl\.com\//i,
  /goo\.gl\//i,
  /short\.link\//i,
  /ow\.ly\//i,
  /t\.co\//i,
  /adf\.ly\//i,
  /po\.st\//i,
  /is\.gd\//i,
  /tiny\.cc\//i,
  /u\.to\//i,
];

// Email pattern regex
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function deriveConfidenceFromScore(score: number): number {
  return clamp01(0.5 + Math.abs(score - 0.5));
}

/**
 * ENHANCED PREPROCESSING - Token Reduction Layer
 * 
 * Reduces input tokens by ~50% through:
 * 1. Extract important lines (money/urgency keywords)
 * 2. Remove stopwords
 * 3. Remove repeated content
 * 4. Clean unnecessary formatting
 * 5. Slice to 500 characters
 * 
 * Pipeline: text → important lines → stopword removal → deduplication → cleaning → truncation
 */
function preprocessText(input: string): string {
  // Step 1: Extract only important lines (money/urgency mentions)
  let processed = extractImportantLines(input);
  
  // Step 2: Remove stopwords to reduce noise
  processed = removeStopwords(processed);
  
  // Step 3: Remove repeated words to cut redundancy
  processed = removeRepeatedContent(processed);
  
  // Step 4: Clean formatting and special characters
  processed = cleanFormatting(processed);
  
  // Step 5: Aggressive truncation to reduce tokens
  processed = processed.slice(0, TARGET_LENGTH);
  
  return processed;
}

function calculateRiskLevel(score: number): RiskLevel {
  if (score >= 0.7) {
    return "High";
  }
  if (score >= 0.4) {
    return "Medium";
  }
  return "Low";
}

function evaluateRules(text: string): {
  ruleScore: number;
  suspiciousPhrases: string[];
  reasons: string[];
  phraseDetails: PhraseDetail[];
} {
  const lower = text.toLowerCase();
  const matchedPhrases: string[] = [];
  const matchedReasons: string[] = [];
  const phraseDetailMap = new Map<string, PhraseDetail>();
  let score = 0;

  const upsertPhraseDetail = (phrase: string, confidence: number, reason: string) => {
    const normalized = phrase.toLowerCase().trim();
    if (!normalized) {
      return;
    }

    const existing = phraseDetailMap.get(normalized);
    if (!existing || confidence > existing.confidence) {
      phraseDetailMap.set(normalized, { phrase, confidence: clamp01(confidence), reason });
    }
  };

  // ===== STANDARD PATTERN MATCHING =====
  for (const rule of RULE_PATTERNS) {
    if (lower.includes(rule.phrase)) {
      matchedPhrases.push(rule.phrase);
      matchedReasons.push(rule.reason);
      score += rule.score;
      upsertPhraseDetail(rule.phrase, rule.score, rule.reason);
    }
  }

  // ===== SALARY ANOMALY DETECTION =====
  const salaryMatch = text.match(/((?:\$|usd|inr|₹)\s?\d[\d,]*(?:\s*(?:\/|per)?\s*(?:day|week|month|hour|daily|weekly|monthly|hourly))?|\d[\d,]{3,}\s*(?:usd|\$)\s*(?:per\s*)?(?:day|week|month|hour|daily|weekly|monthly|hourly)?)/i);
  if (salaryMatch) {
    const salarySnippet = salaryMatch[0].trim();
    score += 0.18;
    matchedPhrases.push(salarySnippet || "unrealistic salary pattern");
    matchedReasons.push("compensation claim appears unusually high for a generic role");
    upsertPhraseDetail(
      salarySnippet || "unrealistic salary pattern",
      0.18,
      "compensation claim appears unusually high for a generic role",
    );
  }

  // ===== OFF-PLATFORM CONTACT DETECTION =====
  if (/(telegram|whatsapp|signal)\s?(only|message|contact)/i.test(lower)) {
    score += 0.16;
    matchedPhrases.push("off-platform contact only");
    matchedReasons.push("requests to move conversation to unverified private channels");
    upsertPhraseDetail(
      "off-platform contact only",
      0.16,
      "requests to move conversation to unverified private channels",
    );
  }

  // ===== SUSPICIOUS DOMAIN DETECTION (NEW) =====
  const emailMatches = text.match(EMAIL_REGEX) || [];
  for (const email of emailMatches) {
    const domain = email.split("@")[1]?.toLowerCase();
    if (domain && SUSPICIOUS_DOMAINS.has(domain)) {
      score += 0.14;
      matchedPhrases.push(`suspicious domain: ${domain}`);
      matchedReasons.push(`free email service (${domain}) instead of company domain suggests unprofessional recruiter`);
      upsertPhraseDetail(
        `suspicious domain: ${domain}`,
        0.14,
        `free email service (${domain}) instead of company domain suggests unprofessional recruiter`,
      );
      break; // Count once even if multiple emails
    }
  }

  // ===== GMAIL/YAHOO RECRUITER EMAIL DETECTION (NEW) =====
  // Specific check for free email pretending to be company recruiter
  const gmailYahooRecruiterPattern = /(?:hr|recruiter|hiring|[a-z]+\.jobs?|talent|staffing)@(gmail\.com|yahoo\.com|hotmail\.com)/i;
  if (gmailYahooRecruiterPattern.test(text)) {
    score += 0.18;
    matchedPhrases.push("generic recruiter email");
    matchedReasons.push("recruiter contact uses free email service (Gmail/Yahoo) instead of company domain - common phishing tactic");
    upsertPhraseDetail(
      "generic recruiter email",
      0.18,
      "recruiter contact uses free email service (Gmail/Yahoo) instead of company domain - common phishing tactic",
    );
  }

  // ===== SHORTENED LINK DETECTION (NEW) =====
  for (const pattern of SHORTENED_LINK_PATTERNS) {
    if (pattern.test(text)) {
      score += 0.15;
      const shortenerName = pattern.source.split("\\/")[0].replace(/[\\()\.]/g, "");
      matchedPhrases.push(`shortened link detected: ${shortenerName}`);
      matchedReasons.push("obfuscated links hide final destination - common phishing and scam tactic");
      upsertPhraseDetail(
        `shortened link detected: ${shortenerName}`,
        0.15,
        "obfuscated links hide final destination - common phishing and scam tactic",
      );
      break; // Count once even if multiple shortened links
    }
  }

  return {
    ruleScore: clamp01(score),
    suspiciousPhrases: Array.from(new Set(matchedPhrases)),
    reasons: Array.from(new Set(matchedReasons)),
    phraseDetails: Array.from(phraseDetailMap.values()),
  };
}

function evaluateHeuristic(text: string): number {
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const exclamations = (text.match(/!/g) || []).length;
  const hasUrl = /(https?:\/\/|www\.)/i.test(text);
  const uppercaseLetters = (text.match(/[A-Z]/g) || []).length;
  const alphaLetters = (text.match(/[A-Za-z]/g) || []).length;
  const uppercaseRatio = alphaLetters > 0 ? uppercaseLetters / alphaLetters : 0;

  let score = 0;

  if (wordCount < 18) {
    score += 0.12;
  }
  if (wordCount > 140) {
    score += 0.05;
  }
  if (exclamations >= 3) {
    score += 0.1;
  }
  if (hasUrl) {
    score += 0.06;
  }
  if (uppercaseRatio > 0.25) {
    score += 0.08;
  }

  return clamp01(score);
}

function shouldInvokeAi(ruleScore: number, heuristicScore: number): boolean {
  const blended = clamp01(ruleScore * 0.75 + heuristicScore * 0.25);

  // Confident low and confident high can skip AI to reduce cost.
  if (blended <= 0.2 || blended >= 0.8) {
    return false;
  }

  // Ambiguous middle band triggers AI for better precision.
  return true;
}

const KEYWORD_HINT_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: "payment", pattern: /\b(payment|pay|fee|deposit|investment|wire transfer|gift card|crypto payment)\b/i },
  { label: "urgent", pattern: /\b(urgent|asap|immediately|hurry|apply now|limited slots|act fast)\b/i },
  { label: "work from home", pattern: /\b(work from home|remote|wfh)\b/i },
  { label: "no interview", pattern: /\b(no interview|no experience needed|instant hire)\b/i },
  { label: "guaranteed income", pattern: /\b(guaranteed income|guaranteed earnings)\b/i },
  { label: "off-platform contact", pattern: /\b(telegram|whatsapp|signal)\b/i },
];

function buildKeywordPayload(text: string, suspiciousPhrases: string[]): string {
  const keywords: string[] = [];

  for (const rulePhrase of suspiciousPhrases) {
    if (rulePhrase && rulePhrase.trim().length > 0) {
      keywords.push(rulePhrase.trim());
    }
  }

  for (const hint of KEYWORD_HINT_PATTERNS) {
    if (hint.pattern.test(text)) {
      keywords.push(hint.label);
    }
  }

  const moneyMatches = text.match(/(?:₹|\$|usd|inr)\s?\d[\d,]*(?:\s*\/?\s*(?:day|week|month|hour))?/gi) || [];
  for (const money of moneyMatches.slice(0, 4)) {
    keywords.push(money.replace(/\s+/g, " ").trim());
  }

  const unique = Array.from(new Set(keywords.map((k) => k.toLowerCase().trim()))).filter(Boolean);

  if (unique.length === 0) {
    return text.slice(0, 220);
  }

  return unique.slice(0, 18).join(", ");
}

export async function analyzeJobWithSmartFlow(input: string): Promise<SmartAnalysisResult> {
  const cleanedText = preprocessText(input);
  const { ruleScore, suspiciousPhrases, reasons, phraseDetails } = evaluateRules(cleanedText);
  const heuristicScore = evaluateHeuristic(cleanedText);
  const preAiScore = clamp01(ruleScore * 0.75 + heuristicScore * 0.25);

  if (!shouldInvokeAi(ruleScore, heuristicScore)) {
    return {
      scam_probability: preAiScore,
      risk_level: calculateRiskLevel(preAiScore),
      confidence: deriveConfidenceFromScore(preAiScore),
      suspicious_phrases: suspiciousPhrases,
      reasons: reasons.length > 0 ? reasons : ["no strong scam indicators detected in rule and heuristic checks"],
      component_scores: {
        rule_score: ruleScore,
      },
      phrase_details: phraseDetails,
      ai_invoked: false,
      ai_latency_ms: 0,
      pipeline: {
        preprocessed_length: cleanedText.length,
        rule_score: ruleScore,
        heuristic_score: heuristicScore,
        ai_triggered_by: "not_needed",
      },
    };
  }

  const keywordPayload = buildKeywordPayload(cleanedText, suspiciousPhrases);
  const aiStart = Date.now();
  const aiResult = await analyzeJobText(keywordPayload);
  const aiLatency = Date.now() - aiStart;

  const finalScore = clamp01(
    aiResult.scam_probability * 0.6 + ruleScore * 0.3 + heuristicScore * 0.1,
  );
  const resolvedConfidence = aiResult.confidence ?? deriveConfidenceFromScore(finalScore);
  const mergedPhraseDetails = new Map<string, PhraseDetail>();

  for (const detail of phraseDetails) {
    mergedPhraseDetails.set(detail.phrase.toLowerCase(), detail);
  }

  for (const detail of aiResult.phrase_details || []) {
    const normalized = detail.phrase.toLowerCase();
    const existing = mergedPhraseDetails.get(normalized);

    if (!existing || detail.confidence > existing.confidence) {
      mergedPhraseDetails.set(normalized, {
        phrase: detail.phrase,
        confidence: clamp01(detail.confidence),
        reason: detail.reason,
      });
    }
  }

  return {
    scam_probability: finalScore,
    risk_level: calculateRiskLevel(finalScore),
    confidence: resolvedConfidence,
    suspicious_phrases: Array.from(new Set([...suspiciousPhrases, ...(aiResult.suspicious_phrases || [])])),
    reasons: Array.from(new Set([...(reasons || []), ...(aiResult.reasons || [])])),
    component_scores: {
      ...(aiResult.component_scores || {}),
      rule_score: ruleScore,
    },
    phrase_details: Array.from(mergedPhraseDetails.values()),
    matching_templates: aiResult.matching_templates,
    ai_invoked: true,
    ai_latency_ms: aiLatency,
    pipeline: {
      preprocessed_length: keywordPayload.length,
      rule_score: ruleScore,
      heuristic_score: heuristicScore,
      ai_triggered_by: "high_uncertainty",
    },
  };
}
