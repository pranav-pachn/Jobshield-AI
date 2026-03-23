import { Request, Response } from "express";
import scamNetworkCorrelationService from "../services/scamNetworkCorrelationService";
import networkGraphDataMapper from "../services/networkGraphDataMapper";
import scamEntityExtractionService from "../services/scamEntityExtractionService";
import { logger } from "../utils/logger";
import ScamNetwork from "../models/ScamNetwork";
import { JobAnalysis } from "../models/JobAnalysis";
import mongoose from "mongoose";

/**
 * Trigger scam entity correlation/network building
 * POST /api/scam-networks/correlate
 */
export async function correlateScamNetworks(req: Request, res: Response) {
  try {
    const { maxAnalysesToProcess } = req.body;
    const limit = maxAnalysesToProcess || 500;

    if (limit < 1 || limit > 2000) {
      return res
        .status(400)
        .json({ message: "maxAnalysesToProcess must be between 1 and 2000" });
    }

    logger.info("[SCAM_NETWORK_CONTROLLER] Starting scam network correlation", {
      maxAnalysesToProcess: limit,
    });

    const result = await scamNetworkCorrelationService.correlateScamEntities(limit);

    logger.info("[SCAM_NETWORK_CONTROLLER] Scam network correlation completed", result);

    return res.json({
      message: "Scam network correlation completed successfully",
      ...result,
    });
  } catch (error) {
    logger.error("[SCAM_NETWORK_CONTROLLER] Failed to correlate scam networks", error);
    return res.status(500).json({
      message: "Failed to correlate scam networks",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Get network graph data for a specific job analysis
 * GET /api/scam-networks/:jobAnalysisId
 */
export async function getNetworkGraph(req: Request, res: Response) {
  try {
    const jobAnalysisId = Array.isArray(req.params.jobAnalysisId)
      ? req.params.jobAnalysisId[0]
      : req.params.jobAnalysisId;

    if (!jobAnalysisId) {
      return res.status(400).json({ message: "jobAnalysisId is required" });
    }

    logger.info("[SCAM_NETWORK_CONTROLLER] Fetching network graph", {
      jobAnalysisId,
    });

    // Direct implementation for testing
    // Get the main analysis
    const mainAnalysis = await JobAnalysis.findById(jobAnalysisId);
    if (!mainAnalysis) {
      return res.json({
        nodes: [{
          id: jobAnalysisId,
          data: {
            label: "Job Analysis (Not Found)",
            nodeType: "analysis",
            threat: "low",
            details: "Analysis not found"
          },
          position: { x: 0, y: 0 }
        }],
        edges: [],
        metadata: { totalNetworks: 0, totalLinkedAnalyses: 0, correlationTypes: [] },
        summary: { nodeCount: 1, edgeCount: 0, uniqueEntities: 0, correlationSources: [], highestConfidence: 0, averageConfidence: 0 }
      });
    }

    // Get networks for this analysis - use raw collection for now
    console.log(`[DEBUG] Searching for networks with analysisId: ${jobAnalysisId}`);
    
    const db = mongoose.connection.db;
    console.log(`[DEBUG] Database name: ${db.databaseName}`);
    
    // First, let's see what's in the collection
    const allDocs = await db.collection('scamnetworks').find({}).toArray();
    console.log(`[DEBUG] Total documents in scamnetworks: ${allDocs.length}`);
    
    if (allDocs.length > 0) {
      console.log(`[DEBUG] Sample document:`, JSON.stringify(allDocs[0], null, 2));
    }
    
    const networks = await db.collection('scamnetworks').find({
      linkedJobAnalysisIds: jobAnalysisId,
    }).toArray();
    
    console.log(`[DEBUG] Found ${networks.length} networks`);
    networks.forEach((n: any, i: number) => {
      console.log(`[DEBUG] Network ${i + 1}: ${n.networkId}, correlationType: ${n.correlationType}`);
    });

    // Create graph structure
    const nodes: any[] = [];
    const edges: any[] = [];

    // Add main analysis node
    nodes.push({
      id: jobAnalysisId,
      data: {
        label: "Job Analysis (Main)",
        nodeType: "analysis",
        threat: mainAnalysis.risk_level?.toLowerCase() || "low",
        riskScore: mainAnalysis.scam_probability,
        details: `Risk: ${mainAnalysis.risk_level}, Score: ${mainAnalysis.scam_probability}%`,
        connections: networks.length,
        isMainNode: true
      },
      position: { x: 400, y: -200 },
      style: {
        background: "#064e3b",
        border: `2px solid ${mainAnalysis.risk_level === 'High' ? '#ef4444' : mainAnalysis.risk_level === 'Medium' ? '#f59e0b' : '#10b981'}`,
        borderRadius: "8px",
        padding: "10px",
        fontSize: "12px",
        color: "#a7f3d0",
        fontWeight: "bold",
        minWidth: "120px",
        textAlign: "center"
      },
      className: "main-node"
    });

    // Add entity nodes and edges
    let nodeCounter = 0;
    const correlationTypeSet = new Set<string>();
    
    networks.forEach((network: any, networkIndex: number) => {
      correlationTypeSet.add(network.correlationType);
      
      network.entitiesInvolved.forEach((entity: any) => {
        const nodeId = `entity_${entity.type}_${entity.value.replace(/[^a-zA-Z0-9]/g, '_')}`;
        
        // Add entity node
        nodes.push({
          id: nodeId,
          data: {
            label: entity.value.length > 20 ? entity.value.substring(0, 17) + "..." : entity.value,
            nodeType: "entity",
            entityType: entity.type,
            threat: entity.confidence > 80 ? "high" : entity.confidence > 50 ? "medium" : "low",
            details: entity.value,
            confidence: entity.confidence
          },
          position: { 
            x: 200 + (nodeCounter % 3) * 200, 
            y: 100 + Math.floor(nodeCounter / 3) * 150 
          },
          style: {
            background: entity.type === 'domain' ? '#7f1d1d' : entity.type === 'email' ? '#4c1d95' : entity.type === 'wallet' ? '#92400e' : '#1e3a8a',
            border: entity.type === 'domain' ? '#ef4444' : entity.type === 'email' ? '#a78bfa' : entity.type === 'wallet' ? '#f59e0b' : '#3b82f6',
            borderRadius: "6px",
            padding: "8px",
            fontSize: "11px",
            color: entity.type === 'domain' ? '#fca5a5' : entity.type === 'email' ? '#ddd6fe' : entity.type === 'wallet' ? '#fde68a' : '#93c5fd',
            minWidth: "100px",
            textAlign: "center"
          }
        });

        // Add edge from analysis to entity
        edges.push({
          id: `edge_${jobAnalysisId}_${nodeId}_${networkIndex}`,
          source: jobAnalysisId,
          target: nodeId,
          animated: true,
          label: `${network.correlationType} (${network.confidence}%)`,
          style: {
            stroke: '#3b82f6',
            strokeWidth: 2,
            opacity: 0.8
          },
          markerEnd: {
            type: "arrowclosed" as any,
            color: '#3b82f6'
          },
          data: {
            correlationType: network.correlationType,
            confidence: network.confidence,
            riskLevel: network.confidence > 80 ? "high" : network.confidence > 50 ? "medium" : "low"
          }
        });

        nodeCounter++;
      });
    });

    const graphData = {
      nodes,
      edges,
      metadata: {
        totalNetworks: networks.length,
        totalLinkedAnalyses: 1,
        correlationTypes: Array.from(correlationTypeSet)
      }
    };

    const summary = {
      nodeCount: graphData.nodes.length,
      edgeCount: graphData.edges.length,
      uniqueEntities: graphData.nodes.length - 1, // Exclude main analysis
      correlationSources: Array.from(correlationTypeSet),
      highestConfidence: networks.length > 0 ? Math.max(...networks.map((n: any) => n.confidence)) : 0,
      averageConfidence: networks.length > 0 ? Math.round(networks.reduce((sum: number, n: any) => sum + n.confidence, 0) / networks.length) : 0
    };

    logger.info("[SCAM_NETWORK_CONTROLLER] Network graph retrieved", {
      jobAnalysisId,
      nodeCount: graphData.nodes.length,
      edgeCount: graphData.edges.length,
    });

    return res.json({
      nodes: graphData.nodes,
      edges: graphData.edges,
      metadata: graphData.metadata,
      summary,
    });
  } catch (error) {
    logger.error("[SCAM_NETWORK_CONTROLLER] Failed to fetch network graph", error);
    return res.status(500).json({
      message: "Failed to fetch network graph",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Extract entities from job text
 * POST /api/scam-networks/entities/extract
 */
export async function extractEntities(req: Request, res: Response) {
  try {
    const { jobText, jobAnalysisId, jobReportId } = req.body;

    if (!jobText || typeof jobText !== "string") {
      return res.status(400).json({ message: "jobText is required and must be a string" });
    }

    logger.info("[SCAM_NETWORK_CONTROLLER] Extracting entities", {
      jobAnalysisId,
      jobReportId,
      textLength: jobText.length,
    });

    const entities = await scamEntityExtractionService.extractEntities(
      jobText,
      jobAnalysisId,
      jobReportId
    );

    logger.info("[SCAM_NETWORK_CONTROLLER] Entities extracted", {
      emailCount: entities.emails.length,
      domainCount: entities.domains.length,
      walletCount: entities.wallets.length,
      phoneCount: entities.phoneNumbers.length,
    });

    return res.json({
      entities,
      summary: {
        totalEntitiesFound:
          entities.emails.length +
          entities.domains.length +
          entities.wallets.length +
          entities.phoneNumbers.length,
        emailCount: entities.emails.length,
        domainCount: entities.domains.length,
        walletCount: entities.wallets.length,
        phoneCount: entities.phoneNumbers.length,
        recruiterCount: entities.recruiterNames.length,
      },
    });
  } catch (error) {
    logger.error("[SCAM_NETWORK_CONTROLLER] Failed to extract entities", error);
    return res.status(500).json({
      message: "Failed to extract entities",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Get all networks for a job analysis
 * GET /api/scam-networks/:jobAnalysisId/networks
 */
export async function getAnalysisNetworks(req: Request, res: Response) {
  try {
    const jobAnalysisId = Array.isArray(req.params.jobAnalysisId)
      ? req.params.jobAnalysisId[0]
      : req.params.jobAnalysisId;

    if (!jobAnalysisId) {
      return res.status(400).json({ message: "jobAnalysisId is required" });
    }

    logger.info("[SCAM_NETWORK_CONTROLLER] Fetching networks for analysis", {
      jobAnalysisId,
    });

    const networks = await scamNetworkCorrelationService.getNetworksForAnalysis(jobAnalysisId);

    return res.json({
      jobAnalysisId,
      networkCount: networks.length,
      networks,
    });
  } catch (error) {
    logger.error("[SCAM_NETWORK_CONTROLLER] Failed to fetch networks", error);
    return res.status(500).json({
      message: "Failed to fetch networks",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Get cached entities for a job analysis
 * GET /api/scam-networks/:jobAnalysisId/entities
 */
export async function getAnalysisEntities(req: Request, res: Response) {
  try {
    const jobAnalysisId = Array.isArray(req.params.jobAnalysisId)
      ? req.params.jobAnalysisId[0]
      : req.params.jobAnalysisId;

    if (!jobAnalysisId) {
      return res.status(400).json({ message: "jobAnalysisId is required" });
    }

    logger.info("[SCAM_NETWORK_CONTROLLER] Fetching cached entities", {
      jobAnalysisId,
    });

    const cachedEntity = await scamEntityExtractionService.getCachedEntities(jobAnalysisId);

    if (!cachedEntity) {
      return res.status(404).json({
        message: "No cached entities found for this analysis",
        jobAnalysisId,
      });
    }

    return res.json({
      jobAnalysisId,
      entities: cachedEntity,
    });
  } catch (error) {
    logger.error("[SCAM_NETWORK_CONTROLLER] Failed to fetch cached entities", error);
    return res.status(500).json({
      message: "Failed to fetch cached entities",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Get network statistics (admin endpoint)
 * GET /api/scam-networks/stats/summary
 */
export async function getNetworkStats(req: Request, res: Response) {
  try {
    logger.info("[SCAM_NETWORK_CONTROLLER] Fetching network statistics");

    // Query parameters for filtering
    const correlationType = req.query.correlationType as string | undefined;
    const confidenceMin = req.query.confidenceMin
      ? parseFloat(req.query.confidenceMin as string)
      : 0;
    const confidenceMax = req.query.confidenceMax
      ? parseFloat(req.query.confidenceMax as string)
      : 1;
    const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string), 2000) : 1000;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

    // Validate confidence thresholds
    if (isNaN(confidenceMin) || isNaN(confidenceMax)) {
      return res.status(400).json({
        message: "confidenceMin and confidenceMax must be valid numbers between 0 and 1",
      });
    }

    if (confidenceMin < 0 || confidenceMin > 1 || confidenceMax < 0 || confidenceMax > 1) {
      return res.status(400).json({
        message: "Confidence values must be between 0 and 1",
      });
    }

    logger.info("[SCAM_NETWORK_CONTROLLER] Network stats filters", {
      correlationType,
      confidenceMin,
      confidenceMax,
      limit,
      offset,
    });

    // Fetch networks with limit for performance
    let networks = await scamNetworkCorrelationService.getAllNetworks(1000);

    // Apply filters
    if (correlationType) {
      networks = networks.filter((n) => n.correlationType === correlationType);
    }

    networks = networks.filter(
      (n) => n.confidence >= confidenceMin && n.confidence <= confidenceMax
    );

    // Calculate totals before pagination
    const totalNetworks = networks.length;
    const typeGroups = new Map<string, number>();

    networks.forEach((network) => {
      const count = typeGroups.get(network.correlationType) || 0;
      typeGroups.set(network.correlationType, count + 1);
    });

    const totalReportsInNetworks = networks.reduce((sum, n) => sum + n.totalReportsLinked, 0);
    const averageConfidence =
      networks.length > 0
        ? Math.round(networks.reduce((sum, n) => sum + n.confidence, 0) / networks.length)
        : 0;

    // Apply pagination
    const paginatedNetworks = networks.slice(offset, offset + limit);

    return res.json({
      totalNetworks,
      displayedNetworks: paginatedNetworks.length,
      networksByType: Object.fromEntries(typeGroups),
      totalReportsInNetworks,
      averageConfidence,
      networks: paginatedNetworks,
      pagination: {
        offset,
        limit,
        hasMore: offset + limit < totalNetworks,
      },
      filters: {
        correlationType: correlationType || 'all',
        confidenceMin,
        confidenceMax,
      },
    });
  } catch (error) {
    logger.error("[SCAM_NETWORK_CONTROLLER] Failed to fetch network statistics", error);
    return res.status(500).json({
      message: "Failed to fetch network statistics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
