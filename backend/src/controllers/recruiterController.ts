import { Request, Response } from "express";
import threatIntelligenceService from "../services/threatIntelligenceService";

interface RecruiterCheckRequest {
  email?: string;
  domain?: string;
}

export async function checkRecruiter(req: Request, res: Response) {
  try {
    const { email, domain } = req.body as RecruiterCheckRequest;

    // Validate input - trim spaces and check for real values
    const trimmedEmail = typeof email === "string" ? email.trim() : "";
    const trimmedDomain = typeof domain === "string" ? domain.trim() : "";

    if (!trimmedEmail && !trimmedDomain) {
      res.status(400).json({
        error: "At least one of 'email' or 'domain' is required",
      });
      return;
    }

    let threatScore: any = null;
    let checkedDomain: string = "";

    // Prioritize explicit domain if provided
    if (trimmedDomain) {
      console.log(`🌐 Checking explicit domain: ${trimmedDomain}`);
      threatScore = await threatIntelligenceService.checkDomain(trimmedDomain);
      checkedDomain = trimmedDomain;
    } 
    // If no explicit domain, extract from email if provided
    else if (trimmedEmail) {
      console.log(`📧 Checking recruiter email: ${trimmedEmail}`);
      threatScore = await threatIntelligenceService.checkRecruiterEmail(trimmedEmail);
      const emailDomain = trimmedEmail.match(/@(.+)$/)?.[1];
      if (emailDomain) checkedDomain = emailDomain;
    }

    if (!threatScore) {
      res.status(400).json({ error: "Could not verify recruiter" });
      return;
    }

    // Determine verification status and transform response for frontend
    const isVerified = threatScore.threatLevel === "low";
    const riskScore = threatScore.score;
    
    // Capitalize risk level for frontend
    const riskLevelCapitalized = 
      threatScore.threatLevel.charAt(0).toUpperCase() + 
      threatScore.threatLevel.slice(1);

    // Count related scams/threats detected
    let relatedScams = 0;
    if (threatScore.sources?.googleSafeBrowsing) relatedScams++;
    if (threatScore.sources?.virustotal?.malicious) relatedScams += threatScore.sources.virustotal.malicious;

    // Format today's date for lastSeen
    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    res.json({
      email: email || undefined,
      domain: checkedDomain || threatScore.domain,
      riskScore, // Frontend expects riskScore, not riskPercentage
      riskLevel: riskLevelCapitalized, // Frontend expects capitalized: "High", "Medium", "Low"
      isVerified, // Frontend expects isVerified, not verified
      relatedScams, // Number of threats found
      lastSeen: today, // Activity date
      indicators: threatScore.details, // Frontend calls this "indicators"
      // Additional API response for reference
      verified: isVerified,
      riskPercentage: riskScore,
      threatScore: riskScore,
      details: threatScore.details,
      threats: {
        googleSafeBrowsing: threatScore.sources?.googleSafeBrowsing || false,
        virustotal: threatScore.sources?.virustotal,
        domainAge: threatScore.sources?.domainAge,
      },
      message: isVerified ? "Recruiter appears legitimate" : "⚠️ Potential threats detected",
    });
  } catch (error) {
    console.error("Recruiter check error:", error);
    res.status(500).json({
      error: "Failed to verify recruiter",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
