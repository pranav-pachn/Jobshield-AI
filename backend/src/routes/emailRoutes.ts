import { Router } from "express";
import EmailAnalysisService from "../services/emailAnalysisService";

const router = Router();
const emailService = new EmailAnalysisService();

type AnalyzeBody = {
  email?: string;
  includeDomainAnalysis?: boolean;
};

type ExtractBody = {
  text?: string;
  includeDomainAnalysis?: boolean;
};

type BulkBody = {
  emails?: string[];
  includeDomainAnalysis?: boolean;
};

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

router.post("/analyze", async (req, res) => {
  try {
    const { email, includeDomainAnalysis = true } = req.body as AnalyzeBody;

    if (!email) {
      return res.status(400).json({ error: "Email address is required" });
    }

    console.log(`[EMAIL_API] Received analysis request for: ${email}`);
    const analysis = await emailService.analyzeEmail(email, includeDomainAnalysis);

    return res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("[EMAIL_API] Analysis failed:", error);
    return res.status(500).json({
      error: "Email analysis failed",
      message: toErrorMessage(error),
    });
  }
});

router.post("/extract-and-analyze", async (req, res) => {
  try {
    const { text, includeDomainAnalysis = true } = req.body as ExtractBody;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text content is required" });
    }

    console.log(`[EMAIL_API] Extracting and analyzing emails from text (${text.length} chars)`);
    const analysis = await emailService.analyzeEmailsFromText(text, includeDomainAnalysis);

    return res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("[EMAIL_API] Extract and analyze failed:", error);
    return res.status(500).json({
      error: "Email extraction and analysis failed",
      message: toErrorMessage(error),
    });
  }
});

router.get("/quick-check/:email", async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: "Email parameter required" });
    }

    console.log(`[EMAIL_API] Quick check for: ${email}`);
    const analysis = await emailService.analyzeEmail(email, false);

    return res.json({
      success: true,
      data: {
        email: analysis.email,
        trustScore: analysis.trustScore,
        isFreeProvider: analysis.isFreeProvider,
        hasSuspiciousPatterns: analysis.suspiciousPatterns.suspicious,
        hasCorporatePatterns: analysis.corporatePatterns.corporate,
        domain: analysis.domain,
      },
    });
  } catch (error) {
    console.error("[EMAIL_API] Quick check failed:", error);
    return res.status(500).json({
      error: "Quick email check failed",
      message: toErrorMessage(error),
    });
  }
});

router.post("/bulk-check", async (req, res) => {
  try {
    const { emails, includeDomainAnalysis = true } = req.body as BulkBody;

    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: "Array of emails is required" });
    }

    if (emails.length > 10) {
      return res.status(400).json({ error: "Maximum 10 emails per request" });
    }

    console.log(`[EMAIL_API] Bulk check for ${emails.length} emails`);

    const results = await Promise.allSettled(
      emails.map((email) => emailService.analyzeEmail(email, includeDomainAnalysis))
    );

    const analyses = results.map((result, index) => ({
      email: emails[index],
      success: result.status === "fulfilled",
      data:
        result.status === "fulfilled"
          ? result.value
          : { error: result.reason instanceof Error ? result.reason.message : "Unknown error" },
    }));

    const successful = analyses.filter(
      (item): item is { email: string; success: true; data: Awaited<ReturnType<typeof emailService.analyzeEmail>> } =>
        item.success
    );

    const averageTrustScore =
      successful.length > 0
        ? successful.reduce((sum, item) => sum + item.data.trustScore.score, 0) / successful.length
        : 0;

    const summary = {
      totalEmails: emails.length,
      successfulAnalyses: successful.length,
      failedAnalyses: analyses.length - successful.length,
      averageTrustScore,
    };

    return res.json({
      success: true,
      data: {
        summary,
        results: analyses,
      },
    });
  } catch (error) {
    console.error("[EMAIL_API] Bulk check failed:", error);
    return res.status(500).json({
      error: "Bulk email check failed",
      message: toErrorMessage(error),
    });
  }
});

export default router;
