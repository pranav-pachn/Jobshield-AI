import { Node, Edge } from "reactflow";
import ScamNetwork, { IScamNetwork } from "../models/ScamNetwork";
import { JobAnalysis, IJobAnalysis } from "../models/JobAnalysis";
import scamEntityExtractionService from "./scamEntityExtractionService";
import {
  CorrelationType,
  CORRELATION_CONFIDENCE,
  CORRELATION_LABELS,
  CORRELATION_COLORS,
  RiskLevel,
  getRiskLevelFromConfidence,
} from "../utils/correlationTypes";

/**
 * Maps scam network data from MongoDB to ReactFlow node/edge format
 * Handles visualization of scam correlations as interactive graphs
 */
class NetworkGraphDataMapper {
  /**
   * Color scheme for different entity types
   */
  private nodeColors = {
    domain: { bg: "#7f1d1d", border: "#ef4444", text: "#fca5a5" },
    email: { bg: "#4c1d95", border: "#a78bfa", text: "#ddd6fe" },
    wallet: { bg: "#92400e", border: "#f59e0b", text: "#fde68a" },
    phone: { bg: "#1e3a8a", border: "#3b82f6", text: "#93c5fd" },
    analysis: { bg: "#064e3b", border: "#10b981", text: "#a7f3d0" },
  };

  /**
   * Risk level to color mapping for threat badges
   */
  private riskColors = {
    high: "#ef4444",
    medium: "#f59e0b",
    low: "#10b981",
  };

  /**
   * Generate ReactFlow nodes and edges for a job analysis and its correlations
   */
  async generateNetworkGraph(jobAnalysisId: string): Promise<{
    nodes: Node[];
    edges: Edge[];
    metadata: {
      totalNetworks: number;
      totalLinkedAnalyses: number;
      correlationTypes: string[];
    };
  }> {
    try {
      // Get the main analysis
      const mainAnalysis = await JobAnalysis.findById(jobAnalysisId);
      if (!mainAnalysis) {
        return { nodes: [], edges: [], metadata: { totalNetworks: 0, totalLinkedAnalyses: 0, correlationTypes: [] } };
      }

      // Get all networks for this analysis
      const networks = await ScamNetwork.find({
        linkedJobAnalysisIds: jobAnalysisId,
      });

      if (networks.length === 0) {
        // Build local entity chain even when there are no cross-analysis correlations
        const { nodes: localNodes, edges: localEdges } = await this.buildLocalEntityChain(mainAnalysis, jobAnalysisId);
        const mainNode = this.createAnalysisNode(mainAnalysis, jobAnalysisId, true);
        // Fix the main node position to the top centre
        mainNode.position = { x: 400, y: -200 };
        return {
          nodes: [mainNode, ...localNodes],
          edges: localEdges,
          metadata: {
            totalNetworks: 0,
            totalLinkedAnalyses: 1,
            correlationTypes: [],
          },
        };
      }

      // Get all related analyses
      const relatedAnalysisIds = new Set<string>();
      networks.forEach((network) => {
        network.linkedJobAnalysisIds.forEach((id) => {
          relatedAnalysisIds.add(id.toString());
        });
      });

      // Exclude the main analysis ID to prevent duplicate nodes
      const relatedAnalysisIdsWithoutMain = Array.from(relatedAnalysisIds).filter(
        (id) => id !== jobAnalysisId
      );

      const relatedAnalyses = await JobAnalysis.find({
        _id: { $in: relatedAnalysisIdsWithoutMain },
      });

      // Build analysis map for quick lookup
      const analysisMap = new Map<string, IJobAnalysis>();
      relatedAnalyses.forEach((analysis: IJobAnalysis) => {
        analysisMap.set(analysis._id?.toString() || "", analysis);
      });
      analysisMap.set(jobAnalysisId, mainAnalysis);

      // Create nodes
      const nodes: Node[] = [];
      const entityNodeMap = new Map<string, Node>(); // Track entity nodes to avoid duplicates
      const correlationTypeSet = new Set<string>();

      // Add main analysis node
      nodes.push(this.createAnalysisNode(mainAnalysis, jobAnalysisId, true));

      // Add related analysis nodes
      relatedAnalyses.forEach((analysis: IJobAnalysis) => {
        nodes.push(this.createAnalysisNode(analysis, analysis._id?.toString() || "", false));
      });

      // Add entity nodes and collect edges
      const edges: Edge[] = [];

      networks.forEach((network, index) => {
        correlationTypeSet.add(network.correlationType);

        // Create entity nodes
        network.entitiesInvolved.forEach((entity) => {
          const nodeId = `entity_${entity.type}_${entity.value}`;

          if (!entityNodeMap.has(nodeId)) {
            const node = this.createEntityNode(entity.type as any, entity.value, nodeId, entity.confidence);
            entityNodeMap.set(nodeId, node);
            nodes.push(node);
          }

          // Create edges from analyses to entities
          network.linkedJobAnalysisIds.forEach((analysisId, idx) => {
            const edgeId = `edge_${analysisId}_${nodeId}_${idx}`;
            edges.push(this.createEdge(analysisId, nodeId, network.correlationType, network.confidence, edgeId));
          });

          // Create edges between related entities in the same correlation
          if (network.entitiesInvolved.length > 1) {
            network.entitiesInvolved.forEach((otherEntity, idx) => {
              if (otherEntity.value !== entity.value) {
                const otherNodeId = `entity_${otherEntity.type}_${otherEntity.value}`;
                const edgeId = `edge_entity_${nodeId}_${otherNodeId}`;

                if (!edges.find((e) => e.id === edgeId)) {
                  edges.push(this.createEntityToEntityEdge(nodeId, otherNodeId, network.correlationType));
                }
              }
            });
          }
        });
      });

      // Merge cross-analysis edges with the local entity chain
      const { nodes: localNodes, edges: localEdges } = await this.buildLocalEntityChain(mainAnalysis, jobAnalysisId);

      // Position the main node at the top centre
      const mainNode = nodes[0]; // first node is always the main analysis node
      if (mainNode) mainNode.position = { x: 400, y: -200 };

      // Merge local nodes (avoiding duplicate IDs)
      const existingIds = new Set(nodes.map((n) => n.id));
      localNodes.forEach((n) => { if (!existingIds.has(n.id)) nodes.push(n); });
      edges.push(...localEdges);

      return {
        nodes,
        edges,
        metadata: {
          totalNetworks: networks.length,
          totalLinkedAnalyses: relatedAnalysisIds.size,
          correlationTypes: Array.from(correlationTypeSet),
        },
      };
    } catch (error) {
      console.error("Error generating network graph:", error);
      return { nodes: [], edges: [], metadata: { totalNetworks: 0, totalLinkedAnalyses: 0, correlationTypes: [] } };
    }
  }

  /**
   * Build the local entity chain for an individual job analysis:
   *   Job Post → Recruiter Email(s) → Domain(s) → Scam Reports (wallets/phones)
   * Uses entity extraction on the job's own text.
   */
  private async buildLocalEntityChain(
    mainAnalysis: IJobAnalysis,
    jobAnalysisId: string
  ): Promise<{ nodes: Node[]; edges: Edge[] }> {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const jobText = (mainAnalysis as any).job_text || "";
    const entities = await scamEntityExtractionService.extractEntities(jobText, jobAnalysisId);

    // Layout constants
    const JOB_X = 400;
    const JOB_Y = 0;
    const EMAIL_Y = 180;
    const DOMAIN_Y = 360;
    const REPORT_Y = 540;
    const H_SPACING = 200;

    // ── Email nodes (Recruiter) ──────────────────────────────────
    const emailNodes: string[] = [];
    entities.emails.forEach((email, i) => {
      const nodeId = `local_email_${i}`;
      emailNodes.push(nodeId);
      const xPos = JOB_X + (i - (entities.emails.length - 1) / 2) * H_SPACING;
      nodes.push({
        id: nodeId,
        data: {
          label: email.length > 20 ? email.substring(0, 17) + "..." : email,
          nodeType: "recruiter",
          threat: "medium",
          details: email,
          connections: 1,
        },
        position: { x: xPos, y: EMAIL_Y },
        type: "customNode",
      });
      // Job → Email
      edges.push({
        id: `edge_job_email_${i}`,
        source: jobAnalysisId,
        target: nodeId,
        animated: true,
        label: "contacted via",
        labelStyle: { fill: "#a78bfa", fontSize: 10 },
        style: { stroke: "#a78bfa", strokeWidth: 2 },
        markerEnd: { type: "arrowclosed" as any, color: "#a78bfa" },
      });
    });

    // ── Domain nodes ────────────────────────────────────────────
    const domainNodes: string[] = [];
    entities.domains.forEach((domain, i) => {
      const nodeId = `local_domain_${i}`;
      domainNodes.push(nodeId);
      const xPos = JOB_X + (i - (entities.domains.length - 1) / 2) * H_SPACING;
      nodes.push({
        id: nodeId,
        data: {
          label: domain.length > 20 ? domain.substring(0, 17) + "..." : domain,
          nodeType: "domain",
          threat: "high",
          details: domain,
          connections: 1,
        },
        position: { x: xPos, y: DOMAIN_Y },
        type: "customNode",
      });

      // Wire domain to the email that owns it, if possible. Otherwise fall back to the first email, or the job if no emails exist.
      const ownerEmail = entities.emails.find((e) => e.split("@")[1]?.toLowerCase() === domain.toLowerCase());
      const ownerEmailIdx = ownerEmail ? entities.emails.indexOf(ownerEmail) : -1;
      const sourceId = ownerEmailIdx >= 0 
        ? `local_email_${ownerEmailIdx}` 
        : (emailNodes.length > 0 ? emailNodes[i % emailNodes.length] : jobAnalysisId);
        
      edges.push({
        id: `edge_domain_${i}`,
        source: sourceId,
        target: nodeId,
        animated: true,
        label: "hosted on",
        labelStyle: { fill: "#ef4444", fontSize: 10 },
        style: { stroke: "#ef4444", strokeWidth: 2 },
        markerEnd: { type: "arrowclosed" as any, color: "#ef4444" },
      });
    });

    // ── Scam Report nodes (wallets + phones) ─────────────────────
    const reportEntities = [
      ...entities.wallets.map((v) => ({ kind: "wallet", value: v })),
      ...entities.phoneNumbers.map((v) => ({ kind: "phone", value: v })),
    ];
    reportEntities.forEach(({ kind, value }, i) => {
      const nodeId = `local_report_${i}`;
      const xPos = JOB_X + (i - (reportEntities.length - 1) / 2) * H_SPACING;
      const shortLabel = value.length > 20 ? value.substring(0, 17) + "..." : value;
      nodes.push({
        id: nodeId,
        data: {
          label: shortLabel,
          nodeType: "report",
          threat: kind === "wallet" ? "high" : "medium",
          details: `${kind === "wallet" ? "💳 Wallet" : "📞 Phone"}: ${value}`,
          connections: 1,
        },
        position: { x: xPos, y: REPORT_Y },
        type: "customNode",
      });
      // Connect from a domain if one exists, else from email if one exists, else from job
      let sourceId = jobAnalysisId;
      if (domainNodes.length > 0) {
        sourceId = domainNodes[i % domainNodes.length];
      } else if (emailNodes.length > 0) {
        sourceId = emailNodes[i % emailNodes.length];
      }
      
      edges.push({
        id: `edge_report_${i}`,
        source: sourceId,
        target: nodeId,
        animated: true,
        label: kind === "wallet" ? "payment via" : "contact via",
        labelStyle: { fill: "#f59e0b", fontSize: 10 },
        style: { stroke: "#f59e0b", strokeWidth: 2, strokeDasharray: "4,3" },
        markerEnd: { type: "arrowclosed" as any, color: "#f59e0b" },
      });
    });

    return { nodes, edges };
  }


  private createAnalysisNode(analysis: IJobAnalysis, nodeId: string, isMainNode: boolean): Node {
    const colors = this.nodeColors.analysis;
    const riskLevel = analysis.risk_level?.toLowerCase() as "high" | "medium" | "low" | undefined;
    const borderColor = riskLevel ? this.riskColors[riskLevel] : colors.border;

    // Use job title as label, fall back to 'Job Post'
    const jobLabel = (analysis as any).job_title
      ? String((analysis as any).job_title).slice(0, 20)
      : "Job Post";

    return {
      id: nodeId,
      data: {
        label: jobLabel,
        nodeType: "job",
        threat: riskLevel || "low",
        riskScore: analysis.scam_probability,
        details: `Risk: ${analysis.risk_level}, Score: ${analysis.scam_probability}%`,
        connections: 0,
        isMainNode,
      },
      position: { x: 0, y: 0 }, // Layout will position these
      style: {
        background: this.nodeColors.analysis.bg,
        border: `2px solid ${borderColor}`,
        borderRadius: "8px",
        padding: "10px",
        fontSize: "12px",
        color: this.nodeColors.analysis.text,
        fontWeight: isMainNode ? "bold" : "normal",
        minWidth: "120px",
        textAlign: "center",
      },
      className: isMainNode ? "main-node" : "related-node",
    };
  }

  /**
   * Create an entity node (domain, email, wallet, phone)
   */
  /**
   * Map backend entity types to frontend node types
   * Frontend CustomNode handles: 'job' | 'recruiter' | 'domain' | 'report'
   */
  private mapEntityTypeToNodeType(entityType: string): "job" | "recruiter" | "domain" | "report" {
    switch (entityType) {
      case "email":
        return "recruiter";
      case "wallet":
      case "phone":
        return "report";
      case "domain":
        return "domain";
      default:
        return "domain";
    }
  }

  private createEntityNode(
    entityType: "domain" | "email" | "wallet" | "phone" | "recruiter",
    value: string,
    nodeId: string,
    confidence: number
  ): Node {
    // Map to a color key that exists in nodeColors
    const colorKey = entityType === "recruiter" ? "email" : entityType;
    const colors = this.nodeColors[colorKey as keyof typeof this.nodeColors] || this.nodeColors.domain;
    const displayValue = value.length > 20 ? value.substring(0, 17) + "..." : value;
    // Map to frontend-compatible node type
    const frontendNodeType = this.mapEntityTypeToNodeType(entityType);

    return {
      id: nodeId,
      data: {
        label: displayValue,
        nodeType: frontendNodeType,
        entityType,
        threat: confidence > 80 ? "high" : confidence > 50 ? "medium" : "low",
        details: value,
        confidence,
      },
      position: { x: 0, y: 0 },
      style: {
        background: colors.bg,
        border: `2px solid ${colors.border}`,
        borderRadius: "6px",
        padding: "8px",
        fontSize: "11px",
        color: colors.text,
        minWidth: "100px",
        textAlign: "center",
      },
    };
  }

  /**
   * Create edge from analysis to entity
   */
  private createEdge(
    sourceId: string,
    targetId: string,
    correlationType: string,
    confidence: number,
    edgeId: string
  ): Edge {
    const correlationLabel =
      CORRELATION_LABELS[correlationType as CorrelationType] || correlationType;
    const edgeColor =
      CORRELATION_COLORS[correlationType as CorrelationType] || "#6b7280";
    const riskLevel = getRiskLevelFromConfidence(confidence);

    return {
      id: edgeId,
      source: sourceId,
      target: targetId,
      animated: true,
      label: `${correlationLabel} (${Math.round(confidence * 100)}%)`,
      style: {
        stroke: edgeColor,
        strokeWidth: Math.max(1, Math.min(4, (confidence * 100) / 30)),
        opacity: 0.8,
      },
      markerEnd: {
        type: "arrowclosed" as any,
        color: edgeColor,
      },
      data: {
        correlationType,
        confidence: Math.round(confidence * 100),
        riskLevel,
        label: correlationLabel,
        color: edgeColor,
      },
    };
  }

  /**
   * Create edge between two entities
   */
  private createEntityToEntityEdge(sourceId: string, targetId: string, correlationType: string): Edge {
    const edgeColor =
      CORRELATION_COLORS[correlationType as CorrelationType] || "#6b7280";
    const correlationLabel =
      CORRELATION_LABELS[correlationType as CorrelationType] || correlationType;

    return {
      id: `edge_entity_${sourceId}_${targetId}`,
      source: sourceId,
      target: targetId,
      animated: false,
      style: {
        stroke: edgeColor,
        strokeWidth: 2,
        strokeDasharray: "5,5",
        opacity: 0.5,
      },
      data: {
        correlationType,
        label: correlationLabel,
        entityToEntity: true,
      },
    };
  }

  /**
   * Get summary statistics for a network
   */
  async getNetworkSummary(jobAnalysisId: string): Promise<{
    nodeCount: number;
    edgeCount: number;
    uniqueEntities: number;
    correlationSources: string[];
    highestConfidence: number;
    averageConfidence: number;
  }> {
    const networks = await ScamNetwork.find({
      linkedJobAnalysisIds: jobAnalysisId,
    });

    const uniqueEntities = new Set<string>();
    const correlationSources = new Set<string>();
    let totalConfidence = 0;
    let maxConfidence = 0;

    networks.forEach((network) => {
      correlationSources.add(network.correlationType);
      totalConfidence += network.confidence;
      maxConfidence = Math.max(maxConfidence, network.confidence);

      network.entitiesInvolved.forEach((entity) => {
        uniqueEntities.add(`${entity.type}:${entity.value}`);
      });
    });

    return {
      nodeCount: networks.length + 1, // +1 for main analysis
      edgeCount: networks.reduce((sum, n) => sum + n.entitiesInvolved.length, 0),
      uniqueEntities: uniqueEntities.size,
      correlationSources: Array.from(correlationSources),
      highestConfidence: maxConfidence,
      averageConfidence: networks.length > 0 ? Math.round(totalConfidence / networks.length) : 0,
    };
  }
}

export default new NetworkGraphDataMapper();
