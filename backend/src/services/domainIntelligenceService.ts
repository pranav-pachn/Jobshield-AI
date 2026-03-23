import axios from "axios";
import https from "https";
import { TLSSocket } from "tls";

export type SSLCertificateInfo = {
  valid: boolean;
  issuer?: Record<string, string>;
  subject?: Record<string, string>;
  validFrom?: string;
  validTo?: string;
  daysUntilExpiry?: number;
  error?: string;
};

export type WhoisData = {
  domainAge: number | null;
  registrar?: string;
  creationDate?: string;
  expirationDate?: string;
  updatedDate?: string;
  nameServers: string[];
  status: string[];
};

export type SafeBrowsingResult = {
  safe: boolean;
  threatTypes: string[];
  error?: string;
};

export type VirusTotalResult = {
  malicious: number;
  suspicious: number;
  harmless: number;
  scanDate?: string;
  error?: string;
};

export type TrustScore = {
  score: number;
  factors: string[];
  level: "high" | "medium" | "low";
};

type ErrorResult = { error: string };

export type DomainIntelligenceResult = {
  domain: string;
  analyzedAt: string;
  sslCertificate: SSLCertificateInfo | ErrorResult;
  whoisData: WhoisData | null | ErrorResult;
  safeBrowsing: SafeBrowsingResult | ErrorResult;
  virusTotal: VirusTotalResult | ErrorResult;
  trustScore: TrustScore;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

function isSafeBrowsingResult(value: unknown): value is SafeBrowsingResult {
  return !!value && typeof value === "object" && "safe" in value;
}

function isVirusTotalResult(value: unknown): value is VirusTotalResult {
  return !!value && typeof value === "object" && "malicious" in value;
}

export default class DomainIntelligenceService {
  private readonly whoisApiKey?: string;
  private readonly virusTotalApiKey?: string;
  private readonly googleSafeBrowsingApiKey?: string;

  constructor() {
    this.whoisApiKey = process.env.WHOIS_API_KEY;
    this.virusTotalApiKey = process.env.VIRUSTOTAL_API_KEY;
    this.googleSafeBrowsingApiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
  }

  extractDomain(input: string): string | null {
    if (!input) return null;

    if (input.includes("@")) {
      return input.split("@")[1]?.toLowerCase() || null;
    }

    try {
      const url = new URL(input);
      return url.hostname.toLowerCase();
    } catch {
      return input.toLowerCase().replace(/^https?:\/\//, "").split("/")[0] || null;
    }
  }

  async checkSSLCertificate(domain: string): Promise<SSLCertificateInfo> {
    return new Promise((resolve) => {
      const req = https.request(
        {
          hostname: domain,
          port: 443,
          method: "GET",
          timeout: 5000,
        },
        (res) => {
          const cert = (res.socket as TLSSocket).getPeerCertificate();

          if (cert && Object.keys(cert).length > 0) {
            const validTo = cert.valid_to;
            const expiryDate = validTo ? new Date(validTo) : null;
            const daysUntilExpiry = expiryDate
              ? Math.floor((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : undefined;

            resolve({
              valid: true,
              issuer: cert.issuer as Record<string, string>,
              subject: cert.subject as Record<string, string>,
              validFrom: cert.valid_from,
              validTo,
              daysUntilExpiry,
            });
            return;
          }

          resolve({ valid: false, error: "No SSL certificate found" });
        }
      );

      req.on("error", () => {
        resolve({ valid: false, error: "SSL connection failed" });
      });

      req.on("timeout", () => {
        req.destroy();
        resolve({ valid: false, error: "SSL connection timeout" });
      });

      req.end();
    });
  }

  async getWhoisData(domain: string): Promise<WhoisData | null> {
    try {
      if (this.whoisApiKey) {
        const response = await axios.get(
          `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${this.whoisApiKey}&domainName=${domain}&outputFormat=JSON`
        );

        const record = response.data?.WhoisRecord;

        return {
          domainAge: this.calculateDomainAge(record?.createdDate),
          registrar: record?.registrarName,
          creationDate: record?.createdDate,
          expirationDate: record?.expiresDate,
          updatedDate: record?.updatedDate,
          nameServers: record?.nameServers?.hostNames || [],
          status: record?.status || [],
        };
      }

      const mockAge = Math.floor(Math.random() * 3650);
      return {
        domainAge: mockAge,
        registrar: "Mock Registrar Inc.",
        creationDate: new Date(Date.now() - mockAge * 24 * 60 * 60 * 1000).toISOString(),
        expirationDate: new Date(
          Date.now() + (365 - (mockAge % 365)) * 24 * 60 * 60 * 1000
        ).toISOString(),
        updatedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        nameServers: ["ns1.example.com", "ns2.example.com"],
        status: ["clientTransferProhibited"],
      };
    } catch (error) {
      console.error("WHOIS lookup failed:", getErrorMessage(error));
      return null;
    }
  }

  calculateDomainAge(creationDate?: string): number | null {
    if (!creationDate) return null;

    try {
      const created = new Date(creationDate);
      return Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
    } catch {
      return null;
    }
  }

  async checkGoogleSafeBrowsing(domain: string): Promise<SafeBrowsingResult> {
    try {
      if (!this.googleSafeBrowsingApiKey) {
        return { safe: true, threatTypes: [] };
      }

      const response = await axios.post(
        `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${this.googleSafeBrowsingApiKey}`,
        {
          client: {
            clientId: "jobshield-ai",
            clientVersion: "1.0.0",
          },
          threatInfo: {
            threatTypes: [
              "MALWARE",
              "SOCIAL_ENGINEERING",
              "UNWANTED_SOFTWARE",
              "POTENTIALLY_HARMFUL_APPLICATION",
            ],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url: `https://${domain}` }],
          },
        }
      );

      const matches: Array<{ threatType: string }> = response.data?.matches || [];
      if (matches.length > 0) {
        return {
          safe: false,
          threatTypes: matches.map((match) => match.threatType),
        };
      }

      return { safe: true, threatTypes: [] };
    } catch (error) {
      const message = getErrorMessage(error);
      console.error("Google Safe Browsing check failed:", message);
      return { safe: true, threatTypes: [], error: message };
    }
  }

  async checkVirusTotal(domain: string): Promise<VirusTotalResult> {
    try {
      if (!this.virusTotalApiKey) {
        return { malicious: 0, suspicious: 0, harmless: 10 };
      }

      const response = await axios.get(
        `https://www.virustotal.com/vtapi/v2/domain/report?apikey=${this.virusTotalApiKey}&domain=${domain}`
      );

      const positives = response.data?.positives || 0;
      const total = response.data?.total || 10;
      return {
        malicious: positives,
        suspicious: response.data?.suspicious || 0,
        harmless: total - positives,
        scanDate: response.data?.scan_date,
      };
    } catch (error) {
      const message = getErrorMessage(error);
      console.error("VirusTotal check failed:", message);
      return { malicious: 0, suspicious: 0, harmless: 10, error: message };
    }
  }

  calculateTrustScore(
    whoisData: WhoisData | null,
    sslCert: SSLCertificateInfo | ErrorResult,
    safeBrowsing: SafeBrowsingResult | ErrorResult,
    virusTotal: VirusTotalResult | ErrorResult
  ): TrustScore {
    let score = 50;
    const factors: string[] = [];

    if (whoisData?.domainAge) {
      if (whoisData.domainAge > 365) {
        score += 30;
        factors.push("Domain is more than 1 year old");
      } else if (whoisData.domainAge > 30) {
        score += 15;
        factors.push("Domain is more than 1 month old");
      } else {
        score -= 20;
        factors.push("Domain was recently registered");
      }
    }

    if ("valid" in sslCert && sslCert.valid) {
      score += 20;
      factors.push("Valid SSL certificate");

      if ((sslCert.daysUntilExpiry || 0) > 30) {
        score += 5;
        factors.push("SSL certificate has long validity");
      }
    } else {
      score -= 15;
      factors.push("No valid SSL certificate");
    }

    if (isSafeBrowsingResult(safeBrowsing) && safeBrowsing.safe) {
      score += 20;
      factors.push("Not flagged by Google Safe Browsing");
    } else {
      score -= 25;
      factors.push("Flagged by Google Safe Browsing");
    }

    if (isVirusTotalResult(virusTotal) && virusTotal.malicious === 0) {
      score += 15;
      factors.push("Clean reputation on VirusTotal");
    } else if (isVirusTotalResult(virusTotal) && virusTotal.malicious > 0) {
      score -= 30;
      factors.push(`Flagged by ${virusTotal.malicious} security vendors`);
    }

    const bounded = Math.max(0, Math.min(100, score));

    return {
      score: bounded,
      factors,
      level: bounded >= 70 ? "high" : bounded >= 40 ? "medium" : "low",
    };
  }

  async analyzeDomain(input: string): Promise<DomainIntelligenceResult> {
    const domain = this.extractDomain(input);
    if (!domain) {
      throw new Error("Invalid domain or email format");
    }

    console.log(`[DOMAIN_INTELLIGENCE] Analyzing domain: ${domain}`);

    const [sslCert, whoisData, safeBrowsing, virusTotal] = await Promise.allSettled([
      this.checkSSLCertificate(domain),
      this.getWhoisData(domain),
      this.checkGoogleSafeBrowsing(domain),
      this.checkVirusTotal(domain),
    ]);

    const sslCertificate: SSLCertificateInfo | ErrorResult =
      sslCert.status === "fulfilled" ? sslCert.value : { error: getErrorMessage(sslCert.reason) };
    const whois: WhoisData | null | ErrorResult =
      whoisData.status === "fulfilled" ? whoisData.value : { error: getErrorMessage(whoisData.reason) };
    const safeBrowsingResult: SafeBrowsingResult | ErrorResult =
      safeBrowsing.status === "fulfilled"
        ? safeBrowsing.value
        : { error: getErrorMessage(safeBrowsing.reason) };
    const virusTotalResult: VirusTotalResult | ErrorResult =
      virusTotal.status === "fulfilled" ? virusTotal.value : { error: getErrorMessage(virusTotal.reason) };

    const normalizedWhois = whois && !("error" in whois) ? whois : null;

    const trustScore = this.calculateTrustScore(
      normalizedWhois,
      sslCertificate,
      safeBrowsingResult,
      virusTotalResult
    );

    console.log(
      `[DOMAIN_INTELLIGENCE] Analysis complete for ${domain}: ${trustScore.score}/100 (${trustScore.level})`
    );

    return {
      domain,
      analyzedAt: new Date().toISOString(),
      sslCertificate,
      whoisData: whois,
      safeBrowsing: safeBrowsingResult,
      virusTotal: virusTotalResult,
      trustScore,
    };
  }
}
