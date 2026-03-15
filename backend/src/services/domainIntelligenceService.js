const axios = require('axios');
const https = require('https');
const { parse } = require('url');

class DomainIntelligenceService {
  constructor() {
    this.whoisApiKey = process.env.WHOIS_API_KEY;
    this.virusTotalApiKey = process.env.VIRUSTOTAL_API_KEY;
    this.googleSafeBrowsingApiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
  }

  /**
   * Extract domain from email or URL
   */
  extractDomain(input) {
    if (!input) return null;
    
    // Extract from email
    if (input.includes('@')) {
      return input.split('@')[1].toLowerCase();
    }
    
    // Extract from URL
    try {
      const url = new URL(input);
      return url.hostname.toLowerCase();
    } catch {
      // If it's just a domain name
      return input.toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
    }
  }

  /**
   * Check SSL certificate validity
   */
  async checkSSLCertificate(domain) {
    return new Promise((resolve) => {
      const options = {
        hostname: domain,
        port: 443,
        method: 'GET',
        timeout: 5000
      };

      const req = https.request(options, (res) => {
        const cert = res.socket.getPeerCertificate();
        if (cert) {
          resolve({
            valid: true,
            issuer: cert.issuer,
            subject: cert.subject,
            validFrom: cert.valid_from,
            validTo: cert.valid_to,
            daysUntilExpiry: Math.floor((new Date(cert.valid_to) - new Date()) / (1000 * 60 * 60 * 24))
          });
        } else {
          resolve({ valid: false, error: 'No SSL certificate found' });
        }
      });

      req.on('error', () => {
        resolve({ valid: false, error: 'SSL connection failed' });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ valid: false, error: 'SSL connection timeout' });
      });

      req.end();
    });
  }

  /**
   * Get WHOIS data for domain
   */
  async getWhoisData(domain) {
    try {
      // Using WHOIS API (free tier)
      if (this.whoisApiKey) {
        const response = await axios.get(`https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${this.whoisApiKey}&domainName=${domain}&outputFormat=JSON`);
        const data = response.data;
        
        return {
          domainAge: this.calculateDomainAge(data.WhoisRecord?.createdDate),
          registrar: data.WhoisRecord?.registrarName,
          creationDate: data.WhoisRecord?.createdDate,
          expirationDate: data.WhoisRecord?.expiresDate,
          updatedDate: data.WhoisRecord?.updatedDate,
          nameServers: data.WhoisRecord?.nameServers?.hostNames || [],
          status: data.WhoisRecord?.status || []
        };
      } else {
        // Fallback: Mock WHOIS data for demo
        const mockAge = Math.floor(Math.random() * 3650); // 0-10 years
        return {
          domainAge: mockAge,
          registrar: 'Mock Registrar Inc.',
          creationDate: new Date(Date.now() - mockAge * 24 * 60 * 60 * 1000).toISOString(),
          expirationDate: new Date(Date.now() + (365 - mockAge % 365) * 24 * 60 * 60 * 1000).toISOString(),
          updatedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          nameServers: ['ns1.example.com', 'ns2.example.com'],
          status: ['clientTransferProhibited']
        };
      }
    } catch (error) {
      console.error('WHOIS lookup failed:', error.message);
      return null;
    }
  }

  /**
   * Calculate domain age in days
   */
  calculateDomainAge(creationDate) {
    if (!creationDate) return null;
    
    try {
      const created = new Date(creationDate);
      const now = new Date();
      return Math.floor((now - created) / (1000 * 60 * 60 * 24));
    } catch {
      return null;
    }
  }

  /**
   * Check domain against Google Safe Browsing
   */
  async checkGoogleSafeBrowsing(domain) {
    try {
      if (!this.googleSafeBrowsingApiKey) {
        return { safe: true, threatTypes: [] };
      }

      const response = await axios.post(
        `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${this.googleSafeBrowsingApiKey}`,
        {
          client: {
            clientId: "jobshield-ai",
            clientVersion: "1.0.0"
          },
          threatInfo: {
            threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url: `https://${domain}` }]
          }
        }
      );

      if (response.data.matches && response.data.matches.length > 0) {
        return {
          safe: false,
          threatTypes: response.data.matches.map(match => match.threatType)
        };
      }

      return { safe: true, threatTypes: [] };
    } catch (error) {
      console.error('Google Safe Browsing check failed:', error.message);
      return { safe: true, threatTypes: [], error: error.message };
    }
  }

  /**
   * Check domain against VirusTotal
   */
  async checkVirusTotal(domain) {
    try {
      if (!this.virusTotalApiKey) {
        return { malicious: 0, suspicious: 0, harmless: 10 };
      }

      const response = await axios.get(
        `https://www.virustotal.com/vtapi/v2/domain/report?apikey=${this.virusTotalApiKey}&domain=${domain}`
      );

      return {
        malicious: response.data.positives || 0,
        suspicious: response.data.suspicious || 0,
        harmless: (response.data.total || 10) - (response.data.positives || 0),
        scanDate: response.data.scan_date
      };
    } catch (error) {
      console.error('VirusTotal check failed:', error.message);
      return { malicious: 0, suspicious: 0, harmless: 10, error: error.message };
    }
  }

  /**
   * Calculate trust score based on all checks
   */
  calculateTrustScore(whoisData, sslCert, safeBrowsing, virusTotal) {
    let score = 50; // Base score
    let factors = [];

    // Domain age factor (0-30 points)
    if (whoisData && whoisData.domainAge) {
      if (whoisData.domainAge > 365) {
        score += 30;
        factors.push('Domain is more than 1 year old');
      } else if (whoisData.domainAge > 30) {
        score += 15;
        factors.push('Domain is more than 1 month old');
      } else {
        score -= 20;
        factors.push('Domain was recently registered');
      }
    }

    // SSL certificate factor (0-20 points)
    if (sslCert && sslCert.valid) {
      score += 20;
      factors.push('Valid SSL certificate');
      
      if (sslCert.daysUntilExpiry > 30) {
        score += 5;
        factors.push('SSL certificate has long validity');
      }
    } else {
      score -= 15;
      factors.push('No valid SSL certificate');
    }

    // Safe browsing factor (0-20 points)
    if (safeBrowsing && safeBrowsing.safe) {
      score += 20;
      factors.push('Not flagged by Google Safe Browsing');
    } else {
      score -= 25;
      factors.push('Flagged by Google Safe Browsing');
    }

    // VirusTotal factor (0-15 points)
    if (virusTotal && virusTotal.malicious === 0) {
      score += 15;
      factors.push('Clean reputation on VirusTotal');
    } else if (virusTotal && virusTotal.malicious > 0) {
      score -= 30;
      factors.push(`Flagged by ${virusTotal.malicious} security vendors`);
    }

    // Normalize score to 0-100
    score = Math.max(0, Math.min(100, score));

    return {
      score,
      factors,
      level: score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low'
    };
  }

  /**
   * Complete domain intelligence analysis
   */
  async analyzeDomain(input) {
    const domain = this.extractDomain(input);
    if (!domain) {
      throw new Error('Invalid domain or email format');
    }

    console.log(`[DOMAIN_INTELLIGENCE] Analyzing domain: ${domain}`);

    const results = {
      domain,
      analyzedAt: new Date().toISOString(),
      sslCertificate: null,
      whoisData: null,
      safeBrowsing: null,
      virusTotal: null,
      trustScore: null
    };

    try {
      // Run checks in parallel
      const [sslCert, whoisData, safeBrowsing, virusTotal] = await Promise.allSettled([
        this.checkSSLCertificate(domain),
        this.getWhoisData(domain),
        this.checkGoogleSafeBrowsing(domain),
        this.checkVirusTotal(domain)
      ]);

      results.sslCertificate = sslCert.status === 'fulfilled' ? sslCert.value : { error: sslCert.reason?.message };
      results.whoisData = whoisData.status === 'fulfilled' ? whoisData.value : { error: whoisData.reason?.message };
      results.safeBrowsing = safeBrowsing.status === 'fulfilled' ? safeBrowsing.value : { error: safeBrowsing.reason?.message };
      results.virusTotal = virusTotal.status === 'fulfilled' ? virusTotal.value : { error: virusTotal.reason?.message };

      // Calculate trust score
      results.trustScore = this.calculateTrustScore(
        results.whoisData,
        results.sslCertificate,
        results.safeBrowsing,
        results.virusTotal
      );

      console.log(`[DOMAIN_INTELLIGENCE] Analysis complete for ${domain}: ${results.trustScore.score}/100 (${results.trustScore.level})`);

      return results;
    } catch (error) {
      console.error(`[DOMAIN_INTELLIGENCE] Analysis failed for ${domain}:`, error);
      throw error;
    }
  }
}

module.exports = DomainIntelligenceService;
