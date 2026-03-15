import ScamEntity, { IScamEntity } from "../models/ScamEntity";

/**
 * Service for extracting scam entities (emails, domains, wallets, phone numbers) from text
 * Uses regex patterns and text analysis to identify suspicious contact information
 */
class ScamEntityExtractionService {
  /**
   * Email pattern - matches common email formats
   */
  private emailPattern = /([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;

  /**
   * Domain pattern - matches domain names
   */
  private domainPattern = /(?:(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)|([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+))/gi;

  /**
   * Wallet pattern - matches common crypto wallet addresses (Bitcoin, Ethereum, etc.)
   */
  private walletPatterns = {
    bitcoin: /\b([13][a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,59})\b/g, // P2PKH, P2SH, Bech32
    ethereum: /\b(0x[a-fA-F0-9]{40})\b/g,
    ripple: /\b(r[a-zA-Z0-9]{25,34})\b/g,
    monero: /\b(4[0-9AB][1-9A-HJ-NP-Za-km-z]{93})\b/g, // Monero mainnet
    usdt: /\b(0x[a-fA-F0-9]{40})\b/g,
  };

  /**
   * Phone number patterns - matches common international phone formats
   */
  private phonePatterns = [
    /\+?1?\s?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g, // US/Canada
    /\+?[0-9]{1,3}\s?[-.\s]?\(?[0-9]{1,4}\)?[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,9}/g, // International
    /\b[0-9]{10,15}\b/g, // Generic 10-15 digit numbers
  ];

  /**
   * Extract all entities from job text
   */
  async extractEntities(
    jobText: string,
    jobAnalysisId?: string,
    jobReportId?: string
  ): Promise<{
    emails: string[];
    domains: string[];
    wallets: string[];
    phoneNumbers: string[];
    recruiterNames: string[];
  }> {
    if (!jobText || typeof jobText !== "string") {
      return {
        emails: [],
        domains: [],
        wallets: [],
        phoneNumbers: [],
        recruiterNames: [],
      };
    }

    const normalizedText = jobText.toLowerCase();

    // Extract all entity types
    const emails = this.extractEmails(jobText);
    const domains = this.extractDomains(normalizedText, emails);
    const wallets = this.extractWallets(jobText);
    const phoneNumbers = this.extractPhones(jobText);
    const recruiterNames = this.extractRecruiterNames(jobText);

    // Cache extracted entities in database
    if (jobAnalysisId || jobReportId) {
      await this.cacheEntities({
        jobAnalysisId,
        jobReportId,
        emails,
        domains,
        wallets,
        phoneNumbers,
        recruiterNames,
        extractedAt: new Date(),
        metadata: {
          sourceJobText: jobText.substring(0, 200), // Store first 200 chars for reference
          extractionMethod: "regex",
          confidence: 100,
        },
      });
    }

    return {
      emails,
      domains,
      wallets,
      phoneNumbers,
      recruiterNames,
    };
  }

  /**
   * Extract email addresses from text
   */
  private extractEmails(text: string): string[] {
    const matches = text.match(this.emailPattern) || [];
    return this.normalizeAndDedup(matches, (e) => e.toLowerCase());
  }

  /**
   * Extract domain names from text (excluding common false positives)
   */
  private extractDomains(text: string, alreadyFoundEmails: string[]): string[] {
    const domains = new Set<string>();

    // Extract from URLs
    const urlPattern = /(https?:\/\/)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
    let match;
    while ((match = urlPattern.exec(text)) !== null) {
      const domain = match[2].toLowerCase();
      if (this.isValidDomain(domain) && !this.isCommonDomain(domain)) {
        domains.add(domain);
      }
    }

    // Extract email domains
    alreadyFoundEmails.forEach((email) => {
      const domain = email.split("@")[1]?.toLowerCase();
      if (domain && this.isValidDomain(domain) && !this.isCommonDomain(domain)) {
        domains.add(domain);
      }
    });

    return Array.from(domains);
  }

  /**
   * Extract cryptocurrency wallet addresses
   */
  private extractWallets(text: string): string[] {
    const wallets = new Set<string>();

    // Try each wallet pattern
    Object.entries(this.walletPatterns).forEach(([type, pattern]) => {
      const matches = text.match(pattern) || [];
      matches.forEach((wallet) => {
        if (this.isValidWallet(wallet)) {
          wallets.add(wallet.toLowerCase());
        }
      });
    });

    return Array.from(wallets);
  }

  /**
   * Extract phone numbers from text
   */
  private extractPhones(text: string): string[] {
    const phones = new Set<string>();

    this.phonePatterns.forEach((pattern) => {
      const matches = text.match(pattern) || [];
      matches.forEach((phone) => {
        const cleaned = phone.replace(/[^\d+]/g, "");
        // Filter: must be at least 10 digits
        if (cleaned.replace(/\D/g, "").length >= 10) {
          phones.add(cleaned);
        }
      });
    });

    return Array.from(phones);
  }

  /**
   * Extract recruiter names (heuristic: capitalized words after "recruiter", "from", etc.)
   */
  private extractRecruiterNames(text: string): string[] {
    const names = new Set<string>();
    const namePatterns = [
      /(?:recruiter|contact|message|reach out to|call|contact)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
      /(?:my name is|i'm|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
    ];

    namePatterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const name = match[1]?.trim();
        if (name && name.length > 2 && name.length < 50 && !this.isStopword(name)) {
          names.add(name);
        }
      }
    });

    return Array.from(names);
  }

  /**
   * Cache extracted entities to database
   */
  private async cacheEntities(entityData: Partial<IScamEntity>): Promise<void> {
    try {
      const existingEntity = await ScamEntity.findOne({
        $or: [{ jobAnalysisId: entityData.jobAnalysisId }, { jobReportId: entityData.jobReportId }],
      });

      if (existingEntity) {
        // Update existing
        Object.assign(existingEntity, entityData);
        await existingEntity.save();
      } else {
        // Create new
        const newEntity = new ScamEntity(entityData);
        await newEntity.save();
      }
    } catch (error) {
      console.error("Error caching scam entities:", error);
      // Non-blocking error - continue even if cache fails
    }
  }

  /**
   * Validate domain format
   */
  private isValidDomain(domain: string): boolean {
    if (!domain || domain.length > 255) return false;
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  }

  /**
   * Check if domain is too common (reduces noise)
   */
  private isCommonDomain(domain: string): boolean {
    const commonDomains = [
      "gmail.com",
      "yahoo.com",
      "outlook.com",
      "hotmail.com",
      "protonmail.com",
      "amazon.com",
      "google.com",
      "microsoft.com",
      "apple.com",
      "github.com",
      "linkedin.com",
      "facebook.com",
      "twitter.com",
      "instagram.com",
    ];
    return commonDomains.includes(domain.toLowerCase());
  }

  /**
   * Validate wallet address format
   */
  private isValidWallet(wallet: string): boolean {
    if (!wallet || wallet.length < 20) return false;
    // Additional validation could be added here
    return /^[a-zA-Z0-9]{20,}$/.test(wallet);
  }

  /**
   * Filter out common stopwords/false positives
   */
  private isStopword(text: string): boolean {
    const stopwords = ["the", "and", "or", "is", "at", "by", "for", "from", "in", "of", "to", "with"];
    return stopwords.includes(text.toLowerCase());
  }

  /**
   * Normalize, deduplicate, and filter entities
   */
  private normalizeAndDedup(items: string[], normalizer: (item: string) => string): string[] {
    const seen = new Set<string>();
    return items
      .map((item) => {
        const normalized = normalizer(item);
        return normalized && normalized.length > 0 ? normalized : null;
      })
      .filter((item): item is string => {
        if (!item) return false;
        if (seen.has(item)) return false;
        seen.add(item);
        return true;
      });
  }

  /**
   * Retrieve cached entities for a job analysis/report
   */
  async getCachedEntities(jobAnalysisId?: string, jobReportId?: string): Promise<IScamEntity | null> {
    if (!jobAnalysisId && !jobReportId) return null;
    return ScamEntity.findOne({
      $or: [{ jobAnalysisId }, { jobReportId }],
    });
  }

  /**
   * Get all cached entities for correlation analysis
   */
  async getAllCachedEntities(limit: number = 1000): Promise<IScamEntity[]> {
    return ScamEntity.find().limit(limit).sort({ extractedAt: -1 });
  }
}

export default new ScamEntityExtractionService();
