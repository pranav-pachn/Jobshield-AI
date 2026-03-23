export {};

const RULE_PATTERNS = [
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

const SUSPICIOUS_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "protonmail.com",
  "tutanota.com",
  "guerrillamail.com",
  "mail.ru",
  "yandex.ru",
  "163.com",
  "qq.com",
  "temp-mail.org",
  "10minutemail.com",
]);

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

const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

type RuleResult = {
  ruleScore: number;
  suspiciousPhrases: string[];
  reasons: string[];
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function evaluateRules(text: string): RuleResult {
  const lower = text.toLowerCase();
  const matchedPhrases: string[] = [];
  const matchedReasons: string[] = [];
  let score = 0;

  for (const rule of RULE_PATTERNS) {
    if (lower.includes(rule.phrase)) {
      matchedPhrases.push(rule.phrase);
      matchedReasons.push(rule.reason);
      score += rule.score;
    }
  }

  if (/\$\s?\d{4,}|\d{4,}\s?(usd|\$|per week|weekly)/i.test(text)) {
    score += 0.18;
    matchedPhrases.push("unrealistic salary pattern");
    matchedReasons.push("compensation claim appears unusually high for a generic role");
  }

  if (/(telegram|whatsapp|signal)\s?(only|message|contact)/i.test(lower)) {
    score += 0.16;
    matchedPhrases.push("off-platform contact only");
    matchedReasons.push("requests to move conversation to unverified private channels");
  }

  const emailMatches = text.match(EMAIL_REGEX) || [];
  for (const email of emailMatches) {
    const domain = email.split("@")[1]?.toLowerCase();
    if (domain && SUSPICIOUS_DOMAINS.has(domain)) {
      score += 0.14;
      matchedPhrases.push(`suspicious domain: ${domain}`);
      matchedReasons.push(
        `free email service (${domain}) instead of company domain suggests unprofessional recruiter`
      );
      break;
    }
  }

  const gmailYahooRecruiterPattern =
    /(?:hr|recruiter|hiring|[a-z]+\.jobs?|talent|staffing)@(gmail\.com|yahoo\.com|hotmail\.com)/i;
  if (gmailYahooRecruiterPattern.test(text)) {
    score += 0.18;
    matchedPhrases.push("generic recruiter email");
    matchedReasons.push(
      "recruiter contact uses free email service (Gmail/Yahoo) instead of company domain - common phishing tactic"
    );
  }

  for (const pattern of SHORTENED_LINK_PATTERNS) {
    if (pattern.test(text)) {
      score += 0.15;
      const shortenerName = pattern.source.split("\\/")[0].replace(/[\\()\.]/g, "");
      matchedPhrases.push(`shortened link detected: ${shortenerName}`);
      matchedReasons.push("obfuscated links hide final destination - common phishing and scam tactic");
      break;
    }
  }

  return {
    ruleScore: clamp01(score),
    suspiciousPhrases: Array.from(new Set(matchedPhrases)),
    reasons: Array.from(new Set(matchedReasons)),
  };
}

const testCases: Array<{ name: string; input: string; expectedFlags: string[] }> = [
  {
    name: "Classic Scam: Registration Fee + Gmail",
    input:
      "We are hiring data entry specialists. No experience needed! Registration fee is $200. Contact: hiring.jobs@gmail.com. Work from home. $5000/week guaranteed. Limited slots!",
    expectedFlags: [
      "registration fee",
      "no experience needed",
      "work from home",
      "unrealistic salary pattern",
      "generic recruiter email",
    ],
  },
  {
    name: "Clean Job - No Red Flags",
    input:
      "Senior Software Engineer - Remote. 5+ years TypeScript/React required. Salary: $120k-150k based on experience. Apply at careers@techcompany.com. Full healthcare benefits.",
    expectedFlags: [],
  },
];

console.log("=".repeat(90));
console.log("STEP 2 - RULE-BASED DETECTION (TypeScript)");
console.log("=".repeat(90));
console.log();

for (const testCase of testCases) {
  console.log(`Test: ${testCase.name}`);
  console.log("-".repeat(90));

  const result = evaluateRules(testCase.input);

  console.log(`\nRule Score: ${(result.ruleScore * 100).toFixed(1)}%`);
  console.log(`Detected Red Flags (${result.suspiciousPhrases.length}):`);

  result.suspiciousPhrases.forEach((phrase, idx) => {
    console.log(`  ${idx + 1}. \"${phrase}\" -> ${result.reasons[idx]}`);
  });

  const detectedSet = new Set(result.suspiciousPhrases.map((p) => p.split(":")[0].trim()));
  const expectedSet = new Set(testCase.expectedFlags.map((f) => f.split(":")[0].trim()));

  let allMatched = true;
  for (const expected of expectedSet) {
    let found = false;
    for (const detected of detectedSet) {
      if (detected.includes(expected) || expected.includes(detected)) {
        found = true;
        break;
      }
    }
    if (!found) {
      allMatched = false;
    }
  }

  if (allMatched && testCase.expectedFlags.length === result.suspiciousPhrases.length) {
    console.log("PASS - All expected flags detected");
  } else {
    console.log(
      `PARTIAL - Got ${result.suspiciousPhrases.length}, expected ${testCase.expectedFlags.length}`
    );
  }

  console.log();
}
