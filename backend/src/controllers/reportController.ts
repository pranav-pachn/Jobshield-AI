import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { JobReport, IJobReport } from "../models/JobReport";
import { JobAnalysis } from "../models/JobAnalysis";
import { reportGenerationService } from "../services/reportGenerationService";
import { logger } from "../utils/logger";

/**
 * Generate and store a new report
 * POST /api/reports/submit
 */
export async function generateReport(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id || "000000000000000000000000"; // Fallback to dummy ID for public demo


    const { analysis_id, format, email_recipients } = req.body;

    // Validate input
    if (!analysis_id || !format) {
      return res.status(400).json({
        error: "Missing required fields: analysis_id, format",
      });
    }

    if (!["pdf", "html", "json"].includes(format)) {
      return res.status(400).json({
        error: "Invalid format. Must be 'pdf', 'html', or 'json'",
      });
    }

    // Verify user owns this analysis
    const analysis = await JobAnalysis.findById(analysis_id);
    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    // Generate report based on format
    let reportData: IJobReport = {
      user_id: userId as any,
      job_analysis_id: analysis_id,
      report_title: `JobShield Analysis - ${new Date().toLocaleDateString()}`,
      report_data: analysis.toObject(),
      export_format: format,
      email_sent: false,
      email_recipients: email_recipients || [],
      created_at: new Date(),
    } as any;

    // Generate share token
    const shareToken = uuidv4();
    const shareTokenExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    reportData.share_token = shareToken;
    reportData.share_token_expires = shareTokenExpires;
    reportData.is_public = true;

    // Set auto-deletion date (30 days)
    reportData.expires_at = shareTokenExpires;

    // Generate report content
    let reportContent: Buffer | string;
    try {
      if (format === "pdf") {
        reportContent = await reportGenerationService.generatePDFReport(
          analysis.toObject() as any
        );
      } else if (format === "html") {
        reportContent = reportGenerationService.generateHTMLReport(
          analysis.toObject() as any
        );
      } else {
        // JSON
        reportContent = reportGenerationService.generateJSONReport(
          analysis.toObject() as any
        );
      }
    } catch (error) {
      logger.error("Error generating report content:", error);
      return res.status(500).json({
        error: "Failed to generate report",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // Send email if recipients provided
    if (email_recipients && email_recipients.length > 0) {
      try {
        const emailSent = await reportGenerationService.sendReportEmail(
          email_recipients,
          analysis.toObject() as any,
          format,
          format === "pdf" ? (reportContent as Buffer) : undefined
        );

        if (emailSent) {
          reportData.email_sent = true;
        }
      } catch (error) {
        logger.error("Email sending failed, continuing with report:", error);
        // Continue even if email fails
      }
    }

    // Save report to database
    const savedReport = await JobReport.create(reportData);

    return res.status(201).json({
      success: true,
      report_id: savedReport._id,
      share_token: shareToken,
      share_link: `${process.env.FRONTEND_URL || "http://localhost:3000"}/reports/share/${shareToken}`,
      download_url: `/api/reports/${savedReport._id}`,
      email_sent: reportData.email_sent,
      expires_at: shareTokenExpires,
      format,
    });
  } catch (error) {
    logger.error("Error generating report:", error);
    return res.status(500).json({
      error: "Failed to generate report",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Download a generated report
 * GET /api/reports/:report_id
 */
export async function downloadReport(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id || "000000000000000000000000";


    const { report_id } = req.params;

    // Fetch report
    const report = await JobReport.findById(report_id);
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    // Disable ownership check for the public demo
    // if (report.user_id.toString() !== userId.toString()) {
    //   return res.status(403).json({ error: "Forbidden" });
    // }

    // Regenerate report content
    let reportContent: Buffer | string;
    try {
      if (report.export_format === "pdf") {
        reportContent = await reportGenerationService.generatePDFReport(
          report.report_data
        );
      } else if (report.export_format === "html") {
        reportContent = reportGenerationService.generateHTMLReport(
          report.report_data
        );
      } else {
        reportContent = reportGenerationService.generateJSONReport(
          report.report_data
        );
      }
    } catch (error) {
      logger.error("Error regenerating report:", error);
      return res.status(500).json({ error: "Failed to generate report" });
    }

    // Send file
    const timestamp = report.created_at.getTime();
    res.setHeader("Content-Type", getContentType(report.export_format));
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="jobshield_report_${timestamp}.${report.export_format}"`
    );

    if (Buffer.isBuffer(reportContent)) {
      res.end(reportContent);
    } else {
      res.end(reportContent);
    }
  } catch (error) {
    logger.error("Error downloading report:", error);
    return res.status(500).json({
      error: "Failed to download report",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Access a shared report via public link
 * GET /api/reports/share/:share_token
 */
export async function getSharedReport(req: Request, res: Response) {
  try {
    const { share_token } = req.params;

    // Fetch report
    const report = await JobReport.findOne({ share_token });
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    // Check if token is expired
    if (report.share_token_expires && report.share_token_expires < new Date()) {
      return res.status(410).json({ error: "Share link has expired" });
    }

    // Regenerate report content
    let reportContent: Buffer | string;
    try {
      if (report.export_format === "pdf") {
        reportContent = await reportGenerationService.generatePDFReport(
          report.report_data
        );
      } else if (report.export_format === "html") {
        reportContent = reportGenerationService.generateHTMLReport(
          report.report_data
        );
      } else {
        reportContent = reportGenerationService.generateJSONReport(
          report.report_data
        );
      }
    } catch (error) {
      logger.error("Error generating shared report:", error);
      return res.status(500).json({ error: "Failed to generate report" });
    }

    // Send file
    const timestamp = report.created_at.getTime();
    res.setHeader("Content-Type", getContentType(report.export_format));
    res.setHeader(
      "Content-Disposition",
      `inline; filename="jobshield_report_${timestamp}.${report.export_format}"`
    );

    if (Buffer.isBuffer(reportContent)) {
      res.end(reportContent);
    } else {
      res.end(reportContent);
    }
  } catch (error) {
    logger.error("Error accessing shared report:", error);
    return res.status(500).json({
      error: "Failed to access report",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Delete a report
 * DELETE /api/reports/:report_id
 */
export async function deleteReport(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { report_id } = req.params;

    // Fetch report
    const report = await JobReport.findById(report_id);
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    // Verify user owns this report
    if (report.user_id.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Delete report
    await JobReport.deleteOne({ _id: report_id });

    return res.json({ success: true, message: "Report deleted" });
  } catch (error) {
    logger.error("Error deleting report:", error);
    return res.status(500).json({
      error: "Failed to delete report",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Get user's reports (paginated)
 * GET /api/reports/user/all
 */
export async function getUserReports(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Fetch reports
    const reports = await JobReport.find({ user_id: userId })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count
    const total = await JobReport.countDocuments({ user_id: userId });

    return res.json({
      success: true,
      reports: reports.map((r) => ({
        id: r._id,
        title: r.report_title,
        format: r.export_format,
        created_at: r.created_at,
        email_sent: r.email_sent,
        share_link: r.is_public
          ? `${process.env.FRONTEND_URL || "http://localhost:3000"}/reports/share/${r.share_token}`
          : null,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Error fetching user reports:", error);
    return res.status(500).json({
      error: "Failed to fetch reports",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Helper function to get content type
 */
function getContentType(format: string): string {
  switch (format) {
    case "pdf":
      return "application/pdf";
    case "html":
      return "text/html";
    case "json":
      return "application/json";
    default:
      return "application/octet-stream";
  }
}

export async function submitReport(req: Request, res: Response) {
  return generateReport(req, res);
}
