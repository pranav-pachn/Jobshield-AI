import { Request, Response } from "express";
import scamNetworkCorrelationService from "../services/scamNetworkCorrelationService";
import networkGraphDataMapper from "../services/networkGraphDataMapper";
import scamEntityExtractionService from "../services/scamEntityExtractionService";
import { logger } from "../utils/logger";

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

    const graphData = await networkGraphDataMapper.generateNetworkGraph(jobAnalysisId);
    const summary = await networkGraphDataMapper.getNetworkSummary(jobAnalysisId);

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
