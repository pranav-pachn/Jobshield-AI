const DomainIntelligenceService = require('./domainIntelligenceService');

class EmailAnalysisService {
  constructor() {
    this.domainService = new DomainIntelligenceService();
    
    // Common free email providers
    this.freeEmailProviders = new Set([
      'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com',
      'icloud.com', 'protonmail.com', 'tutanota.com', 'mail.com',
      'zoho.com', 'yandex.com', 'gmx.com', 'inbox.com'
    ]);

    // Suspicious email patterns
    this.suspiciousPatterns = [
      /support\d*@/i,           // support123@
      /hr\d*@/i,               // hr456@
      /recruit\d*@/i,          // recruit789@
      /careers\d*@/i,          // careers123@
      /job\d*@/i,              // job456@
      /info\d*@/i,             // info789@
      /admin\d*@/i,            // admin123@
      /contact\d*@/i,          // contact456@
      /noreply*@/i,            // noreply@
      /no-reply*@/i,           // no-reply@
      /\d{4,}@/i,             // 4+ consecutive numbers
      /[a-z]+\d{3,}@/i,       // letters + 3+ numbers
      /[a-z]+\d+[a-z]+@/i,     // mixed letters and numbers
    ];

    // Corporate email patterns (legitimate)
    this.corporatePatterns = [
      /^[a-z]+\.[a-z]+@/i,     // john.doe@
      /^[a-z]+_[a-z]+@/i,       // john_doe@
      /^[a-z]+-[a-z]+@/i,       // john-doe@
      /^[a-z]+[0-9]{1,2}@/i,    // john1@, john23@
    ];
  }

  /**
   * Extract email addresses from text
   */
  extractEmails(text) {
    if (!text) return [];
    
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const matches = text.match(emailRegex) || [];
    
    // Return unique emails
    return [...new Set(matches.map(email => email.toLowerCase()))];
  }

  /**
   * Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
    return emailRegex.test(email);
  }

  /**
   * Get domain from email
   */
  getDomainFromEmail(email) {
    if (!email || !email.includes('@')) return null;
    return email.split('@')[1].toLowerCase();
  }

  /**
   * Check if email uses free provider
   */
  isFreeProvider(email) {
    const domain = this.getDomainFromEmail(email);
    return this.freeEmailProviders.has(domain);
  }

  /**
   * Check for suspicious patterns in email
   */
  hasSuspiciousPatterns(email) {
    const localPart = email.split('@')[0].toLowerCase();
    
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(localPart)) {
        return {
          suspicious: true,
          pattern: pattern.toString(),
          reason: this.getPatternReason(pattern)
        };
      }
    }
    
    return { suspicious: false };
  }

  /**
   * Get human-readable reason for suspicious pattern
   */
  getPatternReason(pattern) {
    const patternStr = pattern.toString();
    
    if (patternStr.includes('support')) return 'Generic support email';
    if (patternStr.includes('hr')) return 'Generic HR email';
    if (patternStr.includes('recruit')) return 'Generic recruitment email';
    if (patternStr.includes('careers')) return 'Generic careers email';
    if (patternStr.includes('job')) return 'Generic job email';
    if (patternStr.includes('info')) return 'Generic info email';
    if (patternStr.includes('admin')) return 'Generic admin email';
    if (patternStr.includes('contact')) return 'Generic contact email';
    if (patternStr.includes('noreply') || patternStr.includes('no-reply')) return 'No-reply email address';
    if (patternStr.includes('\\d{4,}')) return 'Contains 4+ consecutive numbers';
    if (patternStr.includes('[a-z]+\\d{3,}')) return 'Many numbers after name';
    if (patternStr.includes('[a-z]+\\d+[a-z]+')) return 'Numbers mixed in name';
    
    return 'Suspicious email pattern detected';
  }

  /**
   * Check for corporate email patterns
   */
  hasCorporatePatterns(email) {
    const localPart = email.split('@')[0].toLowerCase();
    
    for (const pattern of this.corporatePatterns) {
      if (pattern.test(localPart)) {
        return {
          corporate: true,
          pattern: pattern.toString(),
          reason: 'Follows corporate naming convention'
        };
      }
    }
    
    return { corporate: false };
  }

  /**
   * Calculate email trust score
   */
  calculateEmailTrustScore(email, domainIntelligence = null) {
    let score = 50; // Base score
    let factors = [];

    const domain = this.getDomainFromEmail(email);
    const isFree = this.isFreeProvider(email);
    const suspicious = this.hasSuspiciousPatterns(email);
    const corporate = this.hasCorporatePatterns(email);

    // Free provider penalty
    if (isFree) {
      score -= 15;
      factors.push('Uses free email provider');
    } else {
      score += 10;
      factors.push('Uses custom domain');
    }

    // Suspicious patterns
    if (suspicious.suspicious) {
      score -= 25;
      factors.push(suspicious.reason);
    }

    // Corporate patterns
    if (corporate.corporate) {
      score += 15;
      factors.push(corporporate.reason);
    }

    // Domain intelligence integration
    if (domainIntelligence && domainIntelligence.trustScore) {
      const domainScore = domainIntelligence.trustScore.score;
      const domainWeight = 0.3; // 30% weight for domain score
      
      score = score * (1 - domainWeight) + domainScore * domainWeight;
      factors.push('Domain reputation considered');
    }

    // Local part analysis
    const localPart = email.split('@')[0];
    if (localPart.length < 3) {
      score -= 10;
      factors.push('Very short username');
    } else if (localPart.length > 20) {
      score -= 5;
      factors.push('Very long username');
    }

    // Normalize score
    score = Math.max(0, Math.min(100, score));

    return {
      score: Math.round(score),
      level: score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low',
      factors,
      isFreeProvider: isFree,
      hasSuspiciousPatterns: suspicious.suspicious,
      hasCorporatePatterns: corporate.corporate
    };
  }

  /**
   * Complete email analysis
   */
  async analyzeEmail(email, includeDomainAnalysis = true) {
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    console.log(`[EMAIL_ANALYSIS] Analyzing email: ${email}`);

    const result = {
      email,
      analyzedAt: new Date().toISOString(),
      domain: this.getDomainFromEmail(email),
      isFreeProvider: this.isFreeProvider(email),
      suspiciousPatterns: this.hasSuspiciousPatterns(email),
      corporatePatterns: this.hasCorporatePatterns(email),
      domainIntelligence: null,
      trustScore: null
    };

    // Domain analysis
    if (includeDomainAnalysis) {
      try {
        result.domainIntelligence = await this.domainService.analyzeDomain(email);
      } catch (error) {
        console.error(`[EMAIL_ANALYSIS] Domain analysis failed for ${email}:`, error);
        result.domainIntelligence = { error: error.message };
      }
    }

    // Calculate trust score
    result.trustScore = this.calculateEmailTrustScore(email, result.domainIntelligence);

    console.log(`[EMAIL_ANALYSIS] Analysis complete for ${email}: ${result.trustScore.score}/100 (${result.trustScore.level})`);

    return result;
  }

  /**
   * Extract and analyze all emails from text
   */
  async analyzeEmailsFromText(text, includeDomainAnalysis = true) {
    const emails = this.extractEmails(text);
    
    if (emails.length === 0) {
      return {
        emails: [],
        analysis: null,
        summary: {
          totalEmails: 0,
          suspiciousEmails: 0,
          corporateEmails: 0,
          freeProviderEmails: 0
        }
      };
    }

    console.log(`[EMAIL_ANALYSIS] Found ${emails.length} emails in text`);

    const analyses = await Promise.allSettled(
      emails.map(email => this.analyzeEmail(email, includeDomainAnalysis))
    );

    const results = analyses.map((result, index) => ({
      email: emails[index],
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : { error: result.reason?.message }
    }));

    const successfulAnalyses = results
      .filter(r => r.success)
      .map(r => r.data);

    const summary = {
      totalEmails: emails.length,
      suspiciousEmails: successfulAnalyses.filter(a => a.trustScore.level === 'low').length,
      corporateEmails: successfulAnalyses.filter(a => a.hasCorporatePatterns).length,
      freeProviderEmails: successfulAnalyses.filter(a => a.isFreeProvider).length,
      averageTrustScore: successfulAnalyses.length > 0 
        ? Math.round(successfulAnalyses.reduce((sum, a) => sum + a.trustScore.score, 0) / successfulAnalyses.length)
        : 0
    };

    return {
      emails,
      analyses: results,
      summary
    };
  }
}

module.exports = EmailAnalysisService;
