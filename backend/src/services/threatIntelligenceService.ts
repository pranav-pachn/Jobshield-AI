/**
 * Threat Intelligence Service
 * Integrates with external security APIs:
 * - Google Safe Browsing API (domain/URL safety)
 * - VirusTotal API (domain reputation)
 * - WHOIS API (domain registration info)
 */

import axios from 'axios';

interface DomainThreatScore {
  domain: string;
  isSuspicious: boolean;
  threatLevel: 'low' | 'medium' | 'high';
  score: number; // 0-100
  sources: {
    googleSafeBrowsing?: boolean;
    virustotal?: {
      malicious: number;
      suspicious: number;
      undetected: number;
    };
    domainAge?: number;
  };
  details: string[];
}

class ThreatIntelligenceService {
  private googleSafeBrowsingApiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
  private virusTotalApiKey = process.env.VIRUSTOTAL_API_KEY;
  private whoisApiKey = process.env.WHOIS_API_KEY;

  /**
   * Check domain using multiple threat intelligence sources
   */
  async checkDomain(domain: string): Promise<DomainThreatScore> {
    console.log(`🔍 Checking threat intelligence for domain: ${domain}`);

    const details: string[] = [];
    let score = 0;

    // 1. Check with Google Safe Browsing (if API key available)
    let googleThreat = false;
    if (this.googleSafeBrowsingApiKey) {
      try {
        googleThreat = await this.checkGoogleSafeBrowsing(domain);
        if (googleThreat) {
          details.push('🚨 Flagged by Google Safe Browsing');
          score += 40;
        } else {
          details.push('✅ Clean by Google Safe Browsing');
        }
      } catch (error) {
        console.warn('Google Safe Browsing check failed:', error);
        details.push('⚠️ Google Safe Browsing check unavailable');
      }
    } else {
      console.warn('Google Safe Browsing API key not configured');
    }

    // 2. Check with VirusTotal (if API key available)
    let virusTotalData: any = null;
    if (this.virusTotalApiKey) {
      try {
        virusTotalData = await this.checkVirusTotal(domain);
        if (virusTotalData && (virusTotalData.malicious > 0 || virusTotalData.suspicious > 0)) {
          details.push(
            `⚠️ VirusTotal: ${virusTotalData.malicious} malicious, ${virusTotalData.suspicious} suspicious`
          );
          score += virusTotalData.malicious * 15 + virusTotalData.suspicious * 8;
        } else {
          details.push('✅ VirusTotal reputation clean');
        }
      } catch (error) {
        console.warn('VirusTotal check failed:', error);
        details.push('⚠️ VirusTotal check unavailable');
      }
    } else {
      console.warn('VirusTotal API key not configured');
    }

    // 3. Check domain age (if WHOIS API available)
    let domainAge = null;
    if (this.whoisApiKey) {
      try {
        domainAge = await this.checkDomainAge(domain);
        if (domainAge && domainAge < 30) {
          details.push(`⚠️ Very new domain (${domainAge} days old)`);
          score += 25;
        } else if (domainAge) {
          details.push(`Domain age: ${domainAge} days`);
        }
      } catch (error) {
        console.warn('WHOIS check failed:', error);
        details.push('⚠️ Domain age check unavailable');
      }
    } else {
      console.warn('WHOIS API key not configured');
    }

    // 4. Apply heuristics
    const heuristicScore = this.applyHeuristics(domain);
    if (heuristicScore > 0) {
      details.push(`⚠️ Heuristic threats detected: +${heuristicScore} points`);
      score += heuristicScore;
    }

    // Cap score at 100
    score = Math.min(score, 100);

    const threatLevel: 'low' | 'medium' | 'high' =
      score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
    const isSuspicious = threatLevel !== 'low';

    console.log(`✅ Domain check complete: ${domain} (Score: ${score}, Level: ${threatLevel})`);

    return {
      domain,
      isSuspicious,
      threatLevel,
      score,
      sources: {
        googleSafeBrowsing: googleThreat,
        virustotal: virusTotalData,
        domainAge: domainAge ?? undefined,
      },
      details,
    };
  }

  /**
   * Check URL with Google Safe Browsing API
   */
  private async checkGoogleSafeBrowsing(domain: string): Promise<boolean> {
    try {
      const url = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${this.googleSafeBrowsingApiKey}`;

      const response = await axios.post(url, {
        client: { clientId: 'jobshield-ai', clientVersion: '1.0' },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url: `https://${domain}` }],
        },
      });

      return response.data.matches && response.data.matches.length > 0;
    } catch (error) {
      console.error('Google Safe Browsing API error:', error);
      throw error;
    }
  }

  /**
   * Check domain reputation with VirusTotal API
   */
  private async checkVirusTotal(domain: string): Promise<any> {
    try {
      const url = `https://www.virustotal.com/api/v3/domains/${domain}`;

      const response = await axios.get(url, {
        headers: {
          'x-apikey': this.virusTotalApiKey,
        },
      });

      const stats = response.data.data.attributes.last_analysis_stats;
      return {
        malicious: stats.malicious || 0,
        suspicious: stats.suspicious || 0,
        undetected: stats.undetected || 0,
      };
    } catch (error) {
      console.error('VirusTotal API error:', error);
      throw error;
    }
  }

  /**
   * Check domain age with WHOIS API
   */
  private async checkDomainAge(domain: string): Promise<number | null> {
    try {
      // Using whoisapi from whoisxmlapi.com
      const url = `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${this.whoisApiKey}&domainName=${domain}&outputFormat=JSON`;

      const response = await axios.get(url);

      if (response.data.WhoisRecord && response.data.WhoisRecord.createdDate) {
        const createdDate = new Date(response.data.WhoisRecord.createdDate);
        const age = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        return age;
      }

      return null;
    } catch (error) {
      console.error('WHOIS API error:', error);
      throw error;
    }
  }

  /**
   * Apply heuristic rules to detect suspicious patterns
   */
  private applyHeuristics(domain: string): number {
    let score = 0;

    // Check for common scam domain patterns
    const suspiciousPatterns = [
      /^(?!.*\.(?:gov|edu|org|com|net)$).*(?:quick|fast|easy|earn|money|cash|instant|urgent|guarantee)/i,
      /^(?:.*-jobs?|-hiring-|-careers?|-apply|-jobs?-|jobs?-.*)/i,
      /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, // IP address
      /^test|demo|temp|temporary|fake|spam/i,
      /hyphens.*hyphens|many-many-hyphens/i, // Too many hyphens
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(domain)) {
        score += 10;
        break;
      }
    }

    return Math.min(score, 30);
  }

  /**
   * Check recruiter email domain
   */
  async checkRecruiterEmail(email: string): Promise<DomainThreatScore | null> {
    try {
      const domainMatch = email.match(/@(.+)$/);
      if (!domainMatch) {
        console.warn(`Invalid email format: ${email}`);
        return null;
      }

      const domain = domainMatch[1];
      console.log(`📧 Extracted domain from email: ${domain}`);
      return await this.checkDomain(domain);
    } catch (error) {
      console.error(`Error checking recruiter email: ${error}`);
      return null;
    }
  }
}

export default new ThreatIntelligenceService();
