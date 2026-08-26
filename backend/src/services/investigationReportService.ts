import { Investigation } from "../models/Investigation";
import { ThreatIndicatorService } from "./threatIndicatorService";
import { logger } from "../utils/logger";

export interface IInvestigationReport {
  investigationId: string;
  jobTitle: string;
  company: string;
  verdict: string;
  riskScore: number;
  confidence: number;
  status: string;
  evidence: Array<{
    source: string;
    description: string;
    quality: string;
  }>;
  timeline: any[];
  riskBreakdown: any;
  threatGraphData: any;
  recommendations: string[];
  createdAt: Date;
}

export class InvestigationReportService {
  /**
   * Generates a deterministic report based entirely on a stored Investigation trace.
   * Does NOT make any new AI calls.
   */
  static async generateReport(investigationId: string): Promise<IInvestigationReport | null> {
    try {
      const investigation = await Investigation.findOne({ investigationId }).lean();
      
      if (!investigation) {
        return null;
      }

      const input = investigation.input || {};
      const evalData = investigation.evaluation || {};
      const decisionData = investigation.decisionPolicy || {};
      const agentTraces = investigation.agentTraces || [];
      const linkedIndicatorIds = investigation.linkedIndicators || [];

      // 1. Executive Summary fields
      const verdict = decisionData.decision || "UNKNOWN";
      const riskScore = evalData.overall_risk?.score || 0;
      const confidence = evalData.confidence || 0;
      
      // 2. Evidence from traces
      const evidence: Array<{ source: string; description: string; quality: string }> = [];
      for (const trace of agentTraces) {
        if (trace.status === "SUCCESS" && trace.output) {
          // Content investigator reasons
          if (trace.agentName.includes("Content") && trace.output.reasons) {
            trace.output.reasons.forEach((r: string) => {
              evidence.push({ source: "Content Analysis", description: r, quality: "primary" });
            });
          }
          // Recruiter investigator reasons
          if (trace.agentName.includes("Recruiter") && trace.output.reasons) {
            trace.output.reasons.forEach((r: string) => {
              evidence.push({ source: "Recruiter Analysis", description: r, quality: "primary" });
            });
          }
          // Threat Intelligence matches
          if (trace.agentName.includes("Threat") && trace.output.matches) {
            trace.output.matches.forEach((m: any) => {
              evidence.push({ 
                source: `Threat Intel: ${m.sourceId || 'Known Database'}`, 
                description: m.evidence || m.content || "Known threat match", 
                quality: m.evidenceQuality || "secondary" 
              });
            });
          }
        }
      }

      // 3. Threat Graph Data
      // Resolve linked indicators to build nodes and edges
      const threatGraphData = await this.buildThreatGraph(investigationId, input, linkedIndicatorIds);

      // 4. Recommendations
      const recommendations = this.generateDeterministicRecommendations(verdict, evidence);

      return {
        investigationId: investigation.investigationId,
        jobTitle: input.jobText ? this.extractJobTitle(input.jobText) : "Unknown Position",
        company: input.company || "Unknown Company",
        verdict,
        riskScore,
        confidence,
        status: investigation.state,
        evidence,
        timeline: agentTraces, // Raw traces are mapped into timeline by frontend
        riskBreakdown: evalData,
        threatGraphData,
        recommendations,
        createdAt: investigation.createdAt
      };
    } catch (error) {
      logger.error(`Error generating report for ${investigationId}:`, error);
      return null;
    }
  }

  private static async buildThreatGraph(investigationId: string, input: any, indicatorIds: any[]) {
    const nodes: any[] = [];
    const links: any[] = [];
    
    // Add central investigation node
    nodes.push({
      id: investigationId,
      label: `Investigation ${investigationId.substring(0, 8)}`,
      type: "investigation",
      riskLevel: "medium"
    });

    if (!indicatorIds || indicatorIds.length === 0) {
      return { nodes, links };
    }

    try {
      // Get full indicator documents
      const mongoose = require("mongoose");
      const ThreatIndicator = mongoose.model("ThreatIndicator");
      
      const indicators = await ThreatIndicator.find({
        _id: { $in: indicatorIds }
      }).lean();

      for (const ind of indicators) {
        nodes.push({
          id: ind._id.toString(),
          label: ind.normalizedValue,
          type: ind.type.toLowerCase(),
          riskLevel: ind.riskLevel.toLowerCase()
        });
        
        links.push({
          source: investigationId,
          target: ind._id.toString(),
          relationship: "found_in"
        });
      }
    } catch (error) {
      logger.error("Error building threat graph:", error);
    }

    return { nodes, links };
  }

  private static generateDeterministicRecommendations(verdict: string, evidence: any[]): string[] {
    const recs = new Set<string>();
    
    // Base recommendations by verdict
    if (verdict === "SCAM") {
      recs.add("Do not proceed with this application.");
      recs.add("Cease all communication with the recruiter.");
    } else if (verdict === "HUMAN_REVIEW") {
      recs.add("Proceed with caution. Verify the company and recruiter through independent channels.");
    } else {
      recs.add("No critical threats detected. Standard job search precautions apply.");
      return Array.from(recs); // Safe doesn't need evidence-based recs typically
    }

    // Evidence-based recommendations
    const evidenceText = evidence.map(e => e.description.toLowerCase()).join(" ");
    
    if (evidenceText.includes("fee") || evidenceText.includes("payment") || evidenceText.includes("deposit")) {
      recs.add("Do not pay any registration, equipment, or processing fees.");
    }
    
    if (evidenceText.includes("personal") || evidenceText.includes("passport") || evidenceText.includes("ssn") || evidenceText.includes("social security")) {
      recs.add("Do not provide sensitive identity documents (SSN, passport, driver's license) before official onboarding.");
    }
    
    if (evidenceText.includes("telegram") || evidenceText.includes("whatsapp")) {
      recs.add("Request to communicate via official company email rather than messaging apps.");
    }
    
    if (evidenceText.includes("bank") || evidenceText.includes("credit card")) {
      recs.add("Do not share banking information or credit card details.");
    }
    
    if (evidenceText.includes("software") || evidenceText.includes("download") || evidenceText.includes("install")) {
      recs.add("Do not install unknown software or remote desktop applications provided by the recruiter.");
    }

    return Array.from(recs);
  }

  private static extractJobTitle(text: string): string {
    const lines = text.split("\n");
    for (const line of lines) {
      const match = line.match(/(?:title|position|role):\s*([A-Za-z0-9\s\-_]{5,50})/i);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return lines[0].substring(0, 50) + (lines[0].length > 50 ? "..." : "");
  }
}
