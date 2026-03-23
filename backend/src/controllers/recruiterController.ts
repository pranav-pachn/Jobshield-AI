import { Request, Response } from "express";
import recruiterIntelligenceService, {
  RecruiterVerifyInput,
} from "../services/recruiterIntelligenceService";

export async function checkRecruiter(req: Request, res: Response) {
  try {
    const { recruiterName, company, email, website, phone } = req.body;

    // Build input — at least email or company is required
    const input: RecruiterVerifyInput = {
      recruiterName: typeof recruiterName === "string" ? recruiterName.trim() : undefined,
      company: typeof company === "string" ? company.trim() : undefined,
      email: typeof email === "string" ? email.trim() : undefined,
      website: typeof website === "string" ? website.trim() : undefined,
      phone: typeof phone === "string" ? phone.trim() : undefined,
    };

    // Validate: need at least email or company
    if (!input.email && !input.company) {
      res.status(400).json({
        error: "At least one of 'email' or 'company' is required",
      });
      return;
    }

    console.log(`🔍 Recruiter Intelligence check: email=${input.email}, company=${input.company}, website=${input.website}`);

    const result = await recruiterIntelligenceService.verifyRecruiter(input);

    res.json(result);
  } catch (error) {
    console.error("Recruiter check error:", error);
    res.status(500).json({
      error: "Failed to verify recruiter",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
