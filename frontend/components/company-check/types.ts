export interface CompanyCheckResult {
  domain: string;
  domainAge: string;
  sslStatus: "Secure" | "Insecure" | "Unknown";
  blacklistStatus: "Clean" | "Flagged";
  similarityMatch: number;
  riskLevel: "Low" | "Medium" | "High";
  knownAliases: string[];
}
