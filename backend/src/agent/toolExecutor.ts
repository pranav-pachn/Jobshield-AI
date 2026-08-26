import { searchSimilarThreats, searchSimilarInvestigations } from "../knowledge/vectorSearchService";
import { KnowledgeItem } from "../models/KnowledgeItem";
import * as urlIntelligenceService from "../services/urlIntelligenceService";
import * as recruiterIntelligenceService from "../services/recruiterIntelligenceService";

export class ToolExecutor {
  async execute(name: string, args: any): Promise<string> {
    try {
      // Aggressive NoSQL injection defense
      const argsStr = JSON.stringify(args);
      if (argsStr && argsStr.includes('"$')) {
        return `Error executing ${name}: Invalid argument format. Injection attempts are blocked.`;
      }

      switch (name) {
        case "search_threat_knowledge":
          return await this.searchThreatKnowledge(args.query);
        case "analyze_url":
          return await this.analyzeUrl(args.url);
        case "analyze_recruiter":
          return await this.analyzeRecruiter(args.name, args.company, args.email);
        case "find_similar_cases":
          return await this.findSimilarCases(args.query);
        case "get_threat_record":
          return await this.getThreatRecord(args.id);
        default:
          return `Error: Tool ${name} not found.`;
      }
    } catch (err: any) {
      return `Error executing ${name}: ${err.message}`;
    }
  }

  private async searchThreatKnowledge(query: string): Promise<string> {
    if (!query || typeof query !== 'string') return "Invalid query parameter.";
    // Ensure we don't return raw MongoDB documents that could blow up context
    const results = await searchSimilarThreats(query, 3, 0.65);
    if (results.length === 0) return "No matching threat knowledge found.";
    
    return JSON.stringify(results.map(r => {
      const item = r.item;
      return `ID: ${item._id} | Category: ${item.category} | Similarity: ${r.similarity || 'N/A'} | Content: ${item.content.substring(0, 200)}`;
    }));
  }

  private async analyzeUrl(url: string): Promise<string> {
    if (!url || typeof url !== 'string') return "Invalid url parameter.";
    // Map to urlIntelligenceService
    const result = await urlIntelligenceService.default.analyzeUrl(url);
    return JSON.stringify({
      domain: result.domain,
      riskScore: result.url_risk,
      isSuspicious: result.url_risk === "High",
      signals: [result.url_risk_reason]
    });
  }

  private async analyzeRecruiter(name: string, company: string, email: string): Promise<string> {
    if (!email || typeof email !== 'string') return "Invalid email parameter.";
    const result = await recruiterIntelligenceService.default.verifyRecruiter({ recruiterName: name, company, email });
    return JSON.stringify({
      score: result.trust_score,
      signals: result.flags
    });
  }

  private async findSimilarCases(query: string): Promise<string> {
    if (!query) return "Invalid query parameter.";
    

    const results = await searchSimilarInvestigations(query, 3, 0.70);
    
    if (results.length === 0) {
      return JSON.stringify({ message: "No similar historical cases found." });
    }
    
    return JSON.stringify({
      matches: results.map((r: any) => ({
        investigationId: r.item._id,
        similarity: r.similarity || null,
        decision: r.item.risk_level,
        riskScore: Math.round((r.item.scam_probability || 0) * 100),
        createdAt: r.item.created_at,
        retrievalMethod: r.matchType === "semantic" ? "VECTOR" : "TEXT"
      }))
    });
  }

  private async getThreatRecord(id: string): Promise<string> {
    if (!id || typeof id !== 'string') return "Invalid id parameter.";
    // Protect against arbitrary NoSQL injection
    if (!/^[0-9a-fA-F]{24}$/.test(id)) return "Invalid MongoDB ObjectId format.";
    
    const record = await KnowledgeItem.findById(id).select("-embedding");
    if (!record) return "Threat record not found.";
    
    return JSON.stringify({
      id: record.id,
      title: record.title,
      content: record.content,
      category: record.category,
      severity: record.severity,
      source: record.source
    });
  }
}
