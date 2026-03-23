import PDFKit from "pdfkit";
// @ts-ignore - nodemailer doesn't have type definitions
import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";
import { logger } from "../utils/logger";

interface AnalysisData {
  _id?: string;
  scam_probability: number;
  risk_level: "Low" | "Medium" | "High";
  reasons: string[];
  suspicious_phrases: string[];
  evidence_sources?: Array<{
    source: string;
    description: string;
    confidence: number;
  }>;
  domain_intelligence?: {
    domain?: string;
    domain_age_days?: number;
    trust_score?: number;
    threat_level?: "low" | "medium" | "high";
    recently_registered?: boolean;
  };
  similar_patterns?: Array<{
    pattern: string;
    frequency: number;
    confidence: number;
  }>;
  community_report_count?: number;
  confidence_level?: "High" | "Medium" | "Low";
  confidence_reason?: string;
  source_links?: Array<{
    title: string;
    url: string;
    category: string;
  }>;
  component_scores?: {
    rule_score: number;
    zero_shot_score: number;
    similarity_score: number;
  };
  created_at?: Date;
}

export class ReportGenerationService {
  private pdfOptions = {
    size: "A4",
    margin: 40,
    lineGap: 4,
    fontSize: 11,
  };

  /**
   * Generate PDF report with all analysis data
   */
  generatePDFReport(analysisData: AnalysisData): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      try {
        const doc = new PDFKit(this.pdfOptions);
        const chunks: Buffer[] = [];

        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        // Header
        doc
          .fontSize(24)
          .font("Helvetica-Bold")
          .text("JobShield-AI Analysis Report", { align: "center" });
        doc.moveDown(0.5);
        doc
          .fontSize(12)
          .font("Helvetica")
          .text(
            `Report Generated: ${new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}`,
            { align: "center" }
          );
        doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
        doc.moveDown(1);

        // Executive Summary
        this.addSection(doc, "Executive Summary", 14);
        const riskColor: Record<string, string> = {
          High: "#D32F2F",
          Medium: "#F57C00",
          Low: "#388E3C",
        };
        doc
          .font("Helvetica-Bold")
          .fillColor(riskColor[analysisData.risk_level] || "#000000")
          .text(`Risk Level: ${analysisData.risk_level}`, 50, doc.y)
          .fillColor("#000000");
        doc
          .font("Helvetica")
          .text(
            `Scam Probability: ${(analysisData.scam_probability * 100).toFixed(1)}%`
          )
          .moveDown(0.5);

        // Panel 1: Why It Was Flagged
        doc.fontSize(12);
        this.addSection(doc, "1. Why It Was Flagged", 12);
        doc.font("Helvetica").fontSize(10);
        if (analysisData.reasons && analysisData.reasons.length > 0) {
          analysisData.reasons.slice(0, 5).forEach((reason, idx) => {
            doc.text(`${idx + 1}. ${reason}`);
          });
        }
        doc.moveDown(0.5);

        // Panel 2: Evidence Sources
        this.addSection(doc, "2. Evidence Sources", 12);
        doc.font("Helvetica").fontSize(10);
        if (
          analysisData.evidence_sources &&
          analysisData.evidence_sources.length > 0
        ) {
          analysisData.evidence_sources.forEach((source) => {
            const percentage = (source.confidence * 100).toFixed(0);
            doc.text(
              `• ${source.source}: ${source.description} (${percentage}% confidence)`
            );
          });
        } else {
          doc.text("• Rule-based Detection");
          doc.text("• Machine Learning Classification");
          doc.text("• Pattern Similarity Analysis");
        }
        doc.moveDown(0.5);

        // Panel 3: Domain Intelligence
        this.addSection(doc, "3. Domain Intelligence", 12);
        doc.font("Helvetica").fontSize(10);
        if (analysisData.domain_intelligence) {
          const di = analysisData.domain_intelligence;
          doc.text(`Domain: ${di.domain || "N/A"}`);
          if (di.domain_age_days !== undefined) {
            const days = di.domain_age_days;
            const years = Math.floor(days / 365);
            const months = Math.floor((days % 365) / 30);
            const ageStr =
              years > 0
                ? `${years}y ${months}m`
                : months > 0
                  ? `${months}m`
                  : `${days}d`;
            doc.text(`Domain Age: ${ageStr}`);
            if (di.recently_registered) {
              doc.fillColor("#D32F2F").text("⚠ Recently Registered");
              doc.fillColor("#000000");
            }
          }
          if (di.trust_score !== undefined) {
            doc.text(`Trust Score: ${di.trust_score}/100`);
          }
          if (di.threat_level) {
            doc.text(`Threat Level: ${di.threat_level.toUpperCase()}`);
          }
        }
        doc.moveDown(0.5);

        // Panel 4: Similar Patterns
        this.addSection(doc, "4. Similar Scam Patterns", 12);
        doc.font("Helvetica").fontSize(10);
        if (
          analysisData.similar_patterns &&
          analysisData.similar_patterns.length > 0
        ) {
          analysisData.similar_patterns.slice(0, 5).forEach((pattern) => {
            doc.text(`• ${pattern.pattern} (${pattern.frequency} reports)`);
          });
        } else {
          doc.text("No similar patterns found in database.");
        }
        doc.moveDown(0.5);

        // Panel 5: Community Reports
        this.addSection(doc, "5. Community Reports", 12);
        doc.font("Helvetica").fontSize(10);
        const reportCount = analysisData.community_report_count || 0;
        doc.text(
          `${reportCount} user-flagged reports related to similar patterns.`
        );
        doc.moveDown(0.5);

        // Panel 6: Confidence Level
        this.addSection(doc, "6. Confidence Level", 12);
        doc.font("Helvetica").fontSize(10);
        const confidence = analysisData.confidence_level || "Medium";
        doc.text(`Confidence: ${confidence}`);
        if (analysisData.confidence_reason) {
          doc.text(`Reason: ${analysisData.confidence_reason}`);
        }
        doc.moveDown(0.5);

        // Panel 7: Source Links
        this.addSection(doc, "7. Learn More", 12);
        doc.font("Helvetica").fontSize(10);
        if (analysisData.source_links && analysisData.source_links.length > 0) {
          analysisData.source_links.forEach((link) => {
            doc.text(`• ${link.title}`);
            doc.text(`  ${link.url}`, { link: link.url });
          });
        } else {
          doc.text("• FTC Fraud Warnings: www.ftc.gov");
          doc.text("• Consumer Protection: www.consumeradvocacy.org");
          doc.text("• LinkedIn Scam Guide: www.linkedin.com/safety");
        }

        // Footer
        doc.moveDown(2);
        doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
        doc.fontSize(8).font("Helvetica");
        doc.text(
          `Analysis ID: ${analysisData._id || "N/A"} | Generated: ${new Date().toISOString()}`,
          50,
          doc.y + 10,
          { align: "center" }
        );

        doc.end();
      } catch (error) {
        logger.error("Error generating PDF report:", error);
        reject(error);
      }
    }) as Promise<Buffer>;
  }

  /**
   * Generate HTML report with Tailwind-like styling
   */
  generateHTMLReport(analysisData: AnalysisData): string {
    const riskColor: Record<string, string> = {
      High: "#DC2626",
      Medium: "#EA580C",
      Low: "#16A34A",
    };

    const riskBgColor: Record<string, string> = {
      High: "#FEE2E2",
      Medium: "#FFEDD5",
      Low: "#DCFCE7",
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JobShield-AI Analysis Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1F2937;
            background: #F9FAFB;
            padding: 40px 20px;
        }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        h1 { font-size: 28px; font-weight: bold; text-align: center; margin-bottom: 10px; color: #111827; }
        .header-date { text-align: center; color: #6B7280; font-size: 14px; margin-bottom: 30px; }
        .divider { border-top: 1px solid #E5E7EB; margin: 30px 0; }
        h2 { font-size: 18px; font-weight: 600; margin-top: 30px; margin-bottom: 15px; color: #111827; }
        h3 { font-size: 16px; font-weight: 600; margin-top: 20px; margin-bottom: 10px; }
        .summary-box { 
            padding: 20px; 
            border-radius: 6px;
            margin-bottom: 20px;
            background: ${riskBgColor[analysisData.risk_level] || "#F3F4F6"};
            border-left: 4px solid ${riskColor[analysisData.risk_level] || "#6B7280"};
        }
        .risk-level { font-size: 20px; font-weight: bold; color: ${riskColor[analysisData.risk_level] || "#000"}; }
        .probability { font-size: 14px; color: #6B7280; margin-top: 8px; }
        .section { margin: 20px 0; }
        ul { margin-left: 20px; }
        li { margin: 8px 0; }
        .metadata { 
            border-top: 1px solid #E5E7EB;
            margin-top: 30px;
            padding-top: 20px;
            font-size: 12px;
            color: #6B7280;
            text-align: center;
        }
        a { color: #2563EB; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .warning { color: #DC2626; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <h1>JobShield-AI Analysis Report</h1>
        <div class="header-date">Generated ${new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}</div>
        
        <div class="divider"></div>
        
        <h2>Executive Summary</h2>
        <div class="summary-box">
            <div class="risk-level">${analysisData.risk_level} Risk</div>
            <div class="probability">Scam Probability: ${(analysisData.scam_probability * 100).toFixed(1)}%</div>
        </div>
        
        <h2>1. Why It Was Flagged</h2>
        <div class="section">
            <ul>
                ${analysisData.reasons
                  ?.slice(0, 5)
                  .map((r) => `<li>${r}</li>`)
                  .join("") || "<li>Analysis in progress...</li>"}
            </ul>
        </div>
        
        <h2>2. Evidence Sources</h2>
        <div class="section">
            <ul>
                ${
                  analysisData.evidence_sources && analysisData.evidence_sources.length > 0
                    ? analysisData.evidence_sources
                        .map(
                          (e) =>
                            `<li>${e.source}: ${e.description} (${(e.confidence * 100).toFixed(0)}% confidence)</li>`
                        )
                        .join("")
                    : `<li>Rule-based Detection</li>
                       <li>Machine Learning Classification</li>
                       <li>Pattern Similarity Analysis</li>`
                }
            </ul>
        </div>
        
        <h2>3. Domain Intelligence</h2>
        <div class="section">
            ${
              analysisData.domain_intelligence
                ? `
                <ul>
                    <li>Domain: ${analysisData.domain_intelligence.domain || "N/A"}</li>
                    ${
                      analysisData.domain_intelligence.domain_age_days !== undefined
                        ? `<li>Domain Age: ${this.formatDays(analysisData.domain_intelligence.domain_age_days)}${analysisData.domain_intelligence.recently_registered ? ' <span class="warning">⚠ Recently Registered</span>' : ""}</li>`
                        : ""
                    }
                    ${analysisData.domain_intelligence.trust_score !== undefined ? `<li>Trust Score: ${analysisData.domain_intelligence.trust_score}/100</li>` : ""}
                    ${analysisData.domain_intelligence.threat_level ? `<li>Threat Level: ${analysisData.domain_intelligence.threat_level.toUpperCase()}</li>` : ""}
                </ul>
                `
                : "<p>Domain information not available.</p>"
            }
        </div>
        
        <h2>4. Similar Scam Patterns</h2>
        <div class="section">
            <ul>
                ${
                  analysisData.similar_patterns && analysisData.similar_patterns.length > 0
                    ? analysisData.similar_patterns
                        .slice(0, 5)
                        .map((p) => `<li>${p.pattern} (${p.frequency} reports)</li>`)
                        .join("")
                    : "<li>No similar patterns found.</li>"
                }
            </ul>
        </div>
        
        <h2>5. Community Reports</h2>
        <div class="section">
            <p>${analysisData.community_report_count || 0} user-flagged reports related to similar patterns.</p>
        </div>
        
        <h2>6. Confidence Level</h2>
        <div class="section">
            <p><strong>Confidence:</strong> ${analysisData.confidence_level || "Medium"}</p>
            ${analysisData.confidence_reason ? `<p><strong>Reason:</strong> ${analysisData.confidence_reason}</p>` : ""}
        </div>
        
        <h2>7. Learn More</h2>
        <div class="section">
            <ul>
                ${
                  analysisData.source_links && analysisData.source_links.length > 0
                    ? analysisData.source_links
                        .map((l) => `<li><a href="${l.url}" target="_blank">${l.title}</a></li>`)
                        .join("")
                    : `<li><a href="https://www.ftc.gov" target="_blank">FTC Fraud Warnings</a></li>
                       <li><a href="https://www.consumeradvocacy.org" target="_blank">Consumer Protection</a></li>
                       <li><a href="https://www.linkedin.com/safety" target="_blank">LinkedIn Scam Guide</a></li>`
                }
            </ul>
        </div>
        
        <div class="metadata">
            <p>Analysis ID: ${analysisData._id || "N/A"}</p>
            <p>Generated: ${new Date().toISOString()}</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Generate JSON report
   */
  generateJSONReport(analysisData: AnalysisData): string {
    return JSON.stringify(
      {
        metadata: {
          generatedAt: new Date().toISOString(),
          reportVersion: "1.0",
          analysisId: analysisData._id,
        },
        summary: {
          riskLevel: analysisData.risk_level,
          scamProbability: analysisData.scam_probability,
          confidenceLevel: analysisData.confidence_level,
        },
        analysis: analysisData,
      },
      null,
      2
    );
  }

  /**
   * Send report via email using SendGrid or Nodemailer
   */
  async sendReportEmail(
    recipients: string[],
    analysisData: AnalysisData,
    format: "pdf" | "html" | "json",
    pdfBuffer?: Buffer
  ): Promise<boolean> {
    try {
      const subject = `JobShield-AI Analysis Report - ${new Date().toLocaleDateString()}`;
      const useHtml = await this.generateHTMLReport(analysisData);

      // Try SendGrid first if API key is configured
      if (process.env.SENDGRID_API_KEY) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const msg: any = {
          to: recipients,
          from: process.env.SENDGRID_FROM_EMAIL || "noreply@jobshield.ai",
          subject,
          html: useHtml,
          replyTo: process.env.SENDGRID_REPLY_EMAIL || "support@jobshield.ai",
        };

        // Attach PDF if format is PDF
        if (format === "pdf" && pdfBuffer) {
          msg.attachments = [
            {
              content: pdfBuffer.toString("base64"),
              filename: `jobshield_report_${Date.now()}.pdf`,
              type: "application/pdf",
              disposition: "attachment",
            },
          ];
        }

        await sgMail.send(msg);
        logger.info(`Report sent via SendGrid to ${recipients.join(", ")}`);
        return true;
      }

      // Fallback to Nodemailer if SendGrid not configured
      const transporter = nodemailer.createTransport({
        service: "gmail", // Or configure based on your email provider
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions: any = {
        from: process.env.EMAIL_FROM || "noreply@jobshield.ai",
        to: recipients.join(","),
        subject,
        html: useHtml,
      };

      // Attach PDF if format is PDF
      if (format === "pdf" && pdfBuffer) {
        mailOptions.attachments = [
          {
            filename: `jobshield_report_${Date.now()}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ];
      }

      await transporter.sendMail(mailOptions);
      logger.info(`Report sent via Nodemailer to ${recipients.join(", ")}`);
      return true;
    } catch (error) {
      logger.error("Error sending report email:", error);
      return false;
    }
  }

  /**
   * Helper to format days to readable format
   */
  private formatDays(days: number): string {
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    const remainingDays = days % 30;

    if (years > 0) {
      return `${years}y ${months}m`;
    }
    if (months > 0) {
      return `${months}m`;
    }
    return `${remainingDays}d`;
  }

  /**
   * Helper to add a section header to PDF
   */
  private addSection(doc: PDFKit.PDFDocument, title: string, fontSize: number = 12) {
    doc.fontSize(fontSize).font("Helvetica-Bold").text(title);
    doc.moveDown(0.3);
  }
}

export const reportGenerationService = new ReportGenerationService();
