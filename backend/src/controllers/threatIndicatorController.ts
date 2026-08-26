import { Request, Response } from "express";
import { ThreatIndicatorService } from "../services/threatIndicatorService";
import { ThreatType, ThreatRiskLevel } from "../models/ThreatIndicator";
import { logger } from "../utils/logger";

export const searchIndicators = async (req: Request, res: Response) => {
  try {
    const { query, type, riskLevel, page, limit } = req.query;

    const results = await ThreatIndicatorService.search({
      query: query as string,
      type: type as ThreatType,
      riskLevel: riskLevel as ThreatRiskLevel,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20,
    });

    res.json(results);
  } catch (error) {
    logger.error("Error searching indicators:", error);
    res.status(500).json({ error: "Failed to search indicators" });
  }
};

export const getIndicatorStats = async (req: Request, res: Response) => {
  try {
    const stats = await ThreatIndicatorService.getStats();
    res.json(stats);
  } catch (error) {
    logger.error("Error getting indicator stats:", error);
    res.status(500).json({ error: "Failed to get stats" });
  }
};

export const getLinkedIndicators = async (req: Request, res: Response) => {
  try {
    const { investigationId } = req.params as { investigationId: string };
    if (!investigationId) {
      return res.status(400).json({ error: "Investigation ID is required" });
    }

    const indicators = await ThreatIndicatorService.getLinkedIndicators(investigationId);
    res.json(indicators);
  } catch (error) {
    logger.error("Error getting linked indicators:", error);
    res.status(500).json({ error: "Failed to get linked indicators" });
  }
};

export const addManualIndicator = async (req: Request, res: Response) => {
  try {
    const { type, value, riskLevel, metadata } = req.body;
    
    if (!type || !value) {
      return res.status(400).json({ error: "Type and value are required" });
    }

    const indicator = await ThreatIndicatorService.upsert(
      type as ThreatType,
      value,
      {
        riskLevel: riskLevel as ThreatRiskLevel || ThreatRiskLevel.MEDIUM,
        metadata,
        source: "MANUAL" as any, // ThreatSource.MANUAL
      }
    );

    if (!indicator) {
      return res.status(400).json({ error: "Failed to normalize or save indicator" });
    }

    res.status(201).json(indicator);
  } catch (error) {
    logger.error("Error adding manual indicator:", error);
    res.status(500).json({ error: "Failed to add indicator" });
  }
};
