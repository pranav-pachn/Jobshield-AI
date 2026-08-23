import { Request, Response } from "express";
import { 
  getAnalyticsOverview, 
  getScamTrends, 
  getThreatSummary, 
  getPerformanceMetrics 
} from "../services/intelligenceService";
import { logger } from "../utils/logger";

export const getOverview = async (req: Request, res: Response) => {
  try {
    const overview = await getAnalyticsOverview();
    res.status(200).json(overview);
  } catch (error) {
    logger.error("[INTELLIGENCE_CONTROLLER] Error fetching overview", { error });
    res.status(500).json({ error: "Failed to fetch analytics overview" });
  }
};

export const getTrends = async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const trends = await getScamTrends(days);
    res.status(200).json(trends);
  } catch (error) {
    logger.error("[INTELLIGENCE_CONTROLLER] Error fetching trends", { error });
    res.status(500).json({ error: "Failed to fetch scam trends" });
  }
};

export const getThreats = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const threats = await getThreatSummary(limit);
    res.status(200).json(threats);
  } catch (error) {
    logger.error("[INTELLIGENCE_CONTROLLER] Error fetching threats", { error });
    res.status(500).json({ error: "Failed to fetch threat summary" });
  }
};

export const getPerformance = async (req: Request, res: Response) => {
  try {
    const metrics = await getPerformanceMetrics();
    res.status(200).json(metrics);
  } catch (error) {
    logger.error("[INTELLIGENCE_CONTROLLER] Error fetching performance", { error });
    res.status(500).json({ error: "Failed to fetch performance metrics" });
  }
};
