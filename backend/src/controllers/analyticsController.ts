import { Request, Response } from "express";
import { 
  getRiskDistribution as getRiskDistributionService,
  getScamTrends as getScamTrendsService,
  getTopIndicators as getTopIndicatorsService
} from "../services/analyticsService";
import { logger } from "../utils/logger";

export async function getRiskDistribution(req: Request, res: Response) {
  try {
    const distribution = await getRiskDistributionService();
    logger.info("[ANALYTICS_CONTROLLER] Retrieved risk distribution", distribution);
    return res.json(distribution);
  } catch (error) {
    logger.error("[ANALYTICS_CONTROLLER] Failed to retrieve risk distribution", error);
    return res.status(500).json({ message: "Failed to retrieve risk distribution" });
  }
}

export async function getScamTrends(req: Request, res: Response) {
  try {
    const daysParam = req.query.days;
    let days = 30; // default

    if (daysParam !== undefined) {
      const parsedDays = parseInt(daysParam as string);
      if (isNaN(parsedDays) || parsedDays < 1) {
        return res.status(400).json({ message: "Days parameter must be a positive integer" });
      }
      if (parsedDays > 365) {
        return res.status(400).json({ message: "Days parameter cannot exceed 365" });
      }
      days = parsedDays;
    }

    const trends = await getScamTrendsService(days);
    logger.info("[ANALYTICS_CONTROLLER] Retrieved scam trends", {
      days,
      resultCount: trends.length
    });
    return res.json(trends);
  } catch (error) {
    logger.error("[ANALYTICS_CONTROLLER] Failed to retrieve scam trends", error);
    return res.status(500).json({ message: "Failed to retrieve scam trends" });
  }
}

export async function getTopIndicators(req: Request, res: Response) {
  try {
    const limitParam = req.query.limit;
    let limit = 10; // default

    if (limitParam !== undefined) {
      const parsedLimit = parseInt(limitParam as string);
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        return res.status(400).json({ message: "Limit parameter must be a positive integer" });
      }
      if (parsedLimit > 50) {
        return res.status(400).json({ message: "Limit parameter cannot exceed 50" });
      }
      limit = parsedLimit;
    }

    const indicators = await getTopIndicatorsService(limit);
    logger.info("[ANALYTICS_CONTROLLER] Retrieved top indicators", {
      limit,
      resultCount: indicators.length
    });
    return res.json(indicators);
  } catch (error) {
    logger.error("[ANALYTICS_CONTROLLER] Failed to retrieve top indicators", error);
    return res.status(500).json({ message: "Failed to retrieve top indicators" });
  }
}
