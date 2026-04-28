import { logger } from "../utils/logger";

export interface ExtractedIndicators {
  email_domain?: string;
  website_domain?: string;
  phone_numbers: string[];
  job_title?: string;
  suspicious_phrases: string[];
  salary_pattern: "low_unrealistic" | "high_unrealistic" | "normal" | "suspicious";
  threat_category?: "phishing" | "fake_job" | "identity_theft" | "financial_scam" | "other";
}

export class ThreatIndicatorExtractionService {
  
  // Common suspicious phrases in job scams
  private static readonly SUSPICIOUS_PHRASES = [
    // Payment/fee related
    "registration fee", "processing fee", "application fee", "security deposit",
    "pay to work", "buy equipment", "purchase software", "investment required",
    "training fee", "background check fee", "administrative fee",
    
    // Urgency and pressure
    "urgent hiring", "immediate start", "limited positions", "act fast",
    "don't miss out", "offer expires", "immediate interview", "hire today",
    
    // Unrealistic promises
    "earn weekly", "daily payment", "get rich quick", "unlimited earning",
    "six figure income", "work from home", "no experience required",
    "no interview needed", "guaranteed job", "instant hiring",
    
    // Personal information requests
    "bank account", "credit card", "social security", "passport copy",
    "driver's license", "personal information", "verification required",
    
    // Communication methods
    "telegram only", "whatsapp interview", "signal chat", "discord hiring",
    "gmail account", "personal email", "off-platform communication",
    
    // Job title red flags
    "mystery shopper", "package handler", "payment processor", "account manager",
    "financial assistant", "data entry specialist", "virtual assistant"
  ];

  // Salary pattern detection
  private static readonly SALARY_PATTERNS = {
    high_unrealistic: [
      /\$?\d{4,}\s*(?:per|\/)\s*(?:week|wk|hour|hr)/i,  // $1000+ per week/hour
      /\$?\d{5,}\s*(?:per|\/)\s*month/i,                 // $10000+ per month
      /\$?\d{6,}\s*(?:per|\/)\s*year/i,                 // $100000+ per year (normal)
      /unlimited\s*(?:salary|income|earning)/i,
      /six\s*figure/i,
      /\$?\d{3,}\s*(?:per|\/)\s*day/i                    // $100+ per day
    ],
    low_unrealistic: [
      /\$?\d{1,2}\s*(?:per|\/)\s*hour/i,                 // Under $10/hour
      /\$?\d{1,3}\s*(?:per|\/)\s*week/i,                // Under $100/week
      /\$?\d{2,3}\s*(?:per|\/)\s*month/i,                // Under $100/month
      /minimum\s*wage/i,
      /entry\s*level.*\$\d{1,2}/i
    ],
    suspicious: [
      /\$\$\$/i,
      /earn.*potential/i,
      /commission\s*only/i,
      /uncapped\s*earning/i
    ]
  };

  // Phone number patterns (international)
  private static readonly PHONE_PATTERNS = [
    /\+?1?[-.\s]?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/, // US format
    /\+?(\d{1,3})[-.\s]?(\d{1,4})[-.\s]?(\d{1,4})[-.\s]?(\d{1,9})/, // International
    /\d{10,15}/, // Simple 10-15 digit numbers
  ];

  // Email domain extraction
  private static readonly EMAIL_PATTERNS = [
    /\b[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.[A-Z|a-z]{2,})\b/g,
  ];

  // Website/domain extraction
  private static readonly DOMAIN_PATTERNS = [
    /https?:\/\/(?:www\.)?([A-Za-z0-9.-]+\.[A-Z|a-z]{2,})/g,
    /www\.([A-Za-z0-9.-]+\.[A-Z|a-z]{2,})/g,
    /([A-Za-z0-9.-]+\.(?:com|net|org|info|biz|xyz|online|site|co|io|app))/g,
  ];

  // Job title extraction patterns
  private static readonly JOB_TITLE_PATTERNS = [
    /(?:position|job|role|title)[:\s]+([A-Za-z0-9\s\-_]{5,50})/i,
    /(?:hiring|recruiting|looking for)\s+([A-Za-z0-9\s\-_]{5,50})/i,
    /^([A-Za-z0-9\s\-_]{5,50})\s*(?:position|job|role)/im,
  ];

  /**
   * Extract threat indicators from job text
   */
  static extractIndicators(jobText: string): ExtractedIndicators {
    const text = jobText.toLowerCase();
    
    logger.info("Extracting threat indicators from job text", {
      textLength: jobText.length,
      textSample: jobText.substring(0, 100)
    });

    const indicators: ExtractedIndicators = {
      phone_numbers: [],
      suspicious_phrases: [],
      salary_pattern: "normal"
    };

    // Extract email domains
    const emailMatches = jobText.match(ThreatIndicatorExtractionService.EMAIL_PATTERNS[0]);
    if (emailMatches) {
      const domains = [...new Set(emailMatches.map(email => {
        const match = email.match(/@([A-Za-z0-9.-]+\.[A-Z|a-z]{2,})/);
        return match ? match[1].toLowerCase() : undefined;
      }).filter(Boolean))];
      
      if (domains.length > 0) {
        indicators.email_domain = domains[0]; // Primary email domain
        logger.info("Extracted email domains", { domains, primary: indicators.email_domain });
      }
    }

    // Extract website domains
    const domainMatches = jobText.match(ThreatIndicatorExtractionService.DOMAIN_PATTERNS[0]) ||
                         jobText.match(ThreatIndicatorExtractionService.DOMAIN_PATTERNS[1]) ||
                         jobText.match(ThreatIndicatorExtractionService.DOMAIN_PATTERNS[2]);
    
    if (domainMatches) {
      const domains = [...new Set(domainMatches.map(domain => {
        // Clean up the domain extraction
        return domain.replace(/^(https?:\/\/|www\.)/, '').toLowerCase().split('/')[0];
      }).filter(Boolean))];
      
      if (domains.length > 0) {
        indicators.website_domain = domains[0]; // Primary website domain
        logger.info("Extracted website domains", { domains, primary: indicators.website_domain });
      }
    }

    // Extract phone numbers
    for (const pattern of ThreatIndicatorExtractionService.PHONE_PATTERNS) {
      const matches = jobText.match(pattern);
      if (matches) {
        indicators.phone_numbers.push(...matches);
      }
    }
    indicators.phone_numbers = [...new Set(indicators.phone_numbers)];
    
    if (indicators.phone_numbers.length > 0) {
      logger.info("Extracted phone numbers", { count: indicators.phone_numbers.length });
    }

    // Extract job title
    for (const pattern of ThreatIndicatorExtractionService.JOB_TITLE_PATTERNS) {
      const match = jobText.match(pattern);
      if (match && match[1]) {
        indicators.job_title = match[1].trim();
        logger.info("Extracted job title", { title: indicators.job_title });
        break;
      }
    }

    // Extract suspicious phrases
    indicators.suspicious_phrases = ThreatIndicatorExtractionService.SUSPICIOUS_PHRASES.filter(phrase => 
      text.includes(phrase.toLowerCase())
    );

    // Detect salary pattern
    indicators.salary_pattern = this.detectSalaryPattern(jobText);
    
    // Classify threat category
    indicators.threat_category = this.classifyThreatCategory(indicators);

    logger.info("Completed threat indicator extraction", {
      emailDomain: indicators.email_domain,
      websiteDomain: indicators.website_domain,
      phoneCount: indicators.phone_numbers.length,
      suspiciousPhrasesCount: indicators.suspicious_phrases.length,
      salaryPattern: indicators.salary_pattern,
      threatCategory: indicators.threat_category
    });

    return indicators;
  }

  /**
   * Detect salary pattern from job text
   */
  private static detectSalaryPattern(text: string): "low_unrealistic" | "high_unrealistic" | "normal" | "suspicious" {
    const lowerText = text.toLowerCase();

    // Check for high unrealistic patterns
    for (const pattern of ThreatIndicatorExtractionService.SALARY_PATTERNS.high_unrealistic) {
      if (pattern.test(lowerText)) {
        return "high_unrealistic";
      }
    }

    // Check for low unrealistic patterns
    for (const pattern of ThreatIndicatorExtractionService.SALARY_PATTERNS.low_unrealistic) {
      if (pattern.test(lowerText)) {
        return "low_unrealistic";
      }
    }

    // Check for suspicious patterns
    for (const pattern of ThreatIndicatorExtractionService.SALARY_PATTERNS.suspicious) {
      if (pattern.test(lowerText)) {
        return "suspicious";
      }
    }

    return "normal";
  }

  /**
   * Classify threat category based on indicators
   */
  private static classifyThreatCategory(indicators: ExtractedIndicators): "phishing" | "fake_job" | "identity_theft" | "financial_scam" | "other" {
    const { suspicious_phrases, email_domain, website_domain } = indicators;

    // Financial scam indicators
    const financialKeywords = ["fee", "payment", "deposit", "investment", "buy", "purchase"];
    if (suspicious_phrases.some(phrase => financialKeywords.some(keyword => phrase.includes(keyword)))) {
      return "financial_scam";
    }

    // Identity theft indicators
    const identityKeywords = ["personal information", "bank account", "credit card", "passport", "license"];
    if (suspicious_phrases.some(phrase => identityKeywords.some(keyword => phrase.includes(keyword)))) {
      return "identity_theft";
    }

    // Phishing indicators
    if (email_domain && (email_domain.includes("gmail.com") || email_domain.includes("yahoo.com") || email_domain.includes("outlook.com"))) {
      if (suspicious_phrases.length > 2) {
        return "phishing";
      }
    }

    // Fake job indicators
    const fakeJobKeywords = ["no experience", "no interview", "guaranteed job", "immediate start"];
    if (suspicious_phrases.some(phrase => fakeJobKeywords.some(keyword => phrase.includes(keyword)))) {
      return "fake_job";
    }

    return "other";
  }

  /**
   * Generate text hash for deduplication
   */
  static generateTextHash(text: string): string {
    // Simple hash function - in production, use crypto
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Create job text sample for storage
   */
  static createJobTextSample(text: string): string {
    return text.substring(0, 200).replace(/\s+/g, ' ').trim();
  }
}

export default ThreatIndicatorExtractionService;
