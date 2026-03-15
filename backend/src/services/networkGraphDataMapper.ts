import { Node, Edge } from "reactflow";
import ScamNetwork, { IScamNetwork } from "../models/ScamNetwork";
import { JobAnalysis, IJobAnalysis } from "../models/JobAnalysis";
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
        // Return just the main analysis node
        return {
          nodes: [this.createAnalysisNode(mainAnalysis, jobAnalysisId, true)],
          edges: [],
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

      const relatedAnalyses = await JobAnalysis.find({
        _id: { $in: Array.from(relatedAnalysisIds) },
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
   * Create a job analysis node
   */
  private createAnalysisNode(analysis: IJobAnalysis, nodeId: string, isMainNode: boolean): Node {
    const colors = this.nodeColors.analysis;
    const riskLevel = analysis.risk_level?.toLowerCase() as "high" | "medium" | "low" | undefined;
    const borderColor = riskLevel ? this.riskColors[riskLevel] : colors.border;

    return {
      id: nodeId,
      data: {
        label: `Job Analysis${isMainNode ? " (Main)" : ""}`,
        nodeType: "analysis",
        threat: riskLevel || "low",
        riskScore: analysis.scam_probability,
        details: `Risk: ${analysis.risk_level}, Score: ${analysis.scam_probability}%`,
        connections: 0,
      },
      position: { x: 0, y: 0 }, // Layout will position these
      style: {
        background: colors.bg,
        border: `2px solid ${borderColor}`,
        borderRadius: "8px",
        padding: "10px",
        fontSize: "12px",
        color: colors.text,
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
  private createEntityNode(
    entityType: "domain" | "email" | "wallet" | "phone" | "recruiter",
    value: string,
    nodeId: string,
    confidence: number
  ): Node {
    const colors = this.nodeColors[entityType as keyof typeof this.nodeColors] || this.nodeColors.domain;
    const displayValue = value.length > 20 ? value.substring(0, 17) + "..." : value;

    return {
      id: nodeId,
      data: {
        label: displayValue,
        nodeType: "entity",
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
