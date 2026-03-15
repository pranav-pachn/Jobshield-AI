import { Request, Response } from "express";
import threatIntelligenceService from "../services/threatIntelligenceService";

interface RecruiterCheckRequest {
  email?: string;
  domain?: string;
}

export async function checkRecruiter(req: Request, res: Response) {
  try {
    const { email, domain } = req.body as RecruiterCheckRequest;

    // Validate input
    if (!email && !domain) {
      res.status(400).json({
        error: "At least one of 'email' or 'domain' is required",
      });
      return;
    }

    let threatScore: any = null;

    // Check email domain if provided
    if (email) {
      console.log(`📧 Checking recruiter email: ${email}`);
      threatScore = await threatIntelligenceService.checkRecruiterEmail(email);
    }

    // Check domain if provided (or if email check didn't work)
    if (domain && !threatScore) {
      console.log(`🌐 Checking domain: ${domain}`);
      threatScore = await threatIntelligenceService.checkDomain(domain);
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
      email,
      domain: threatScore.domain,
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
