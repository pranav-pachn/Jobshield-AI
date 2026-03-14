import { JobAnalysis, IJobAnalysis } from "../models/JobAnalysis";
import { logger } from "../utils/logger";

export interface RiskDistribution {
  Low: number;
  Medium: number;
  High: number;
}

export interface TrendData {
  date: string;
  high: number;
  medium: number;
  low: number;
}

export interface TopIndicator {
  phrase: string;
  count: number;
}

export async function getRiskDistribution(): Promise<RiskDistribution> {
  try {
    const result = await JobAnalysis.aggregate([
      {
        $group: {
          _id: "$risk_level",
          count: { $sum: 1 }
        }
      }
    ]);

    const distribution: RiskDistribution = {
      Low: 0,
      Medium: 0,
      High: 0
    };

    result.forEach(item => {
      if (item._id in distribution) {
        distribution[item._id as keyof RiskDistribution] = item.count;
      }
    });

    logger.info("[ANALYTICS] Retrieved risk distribution", distribution);
    return distribution;
  } catch (error) {
    logger.error("[ANALYTICS] Failed to retrieve risk distribution", {
      error: error instanceof Error ? error.message : "Unknown error"
    });
    return { Low: 0, Medium: 0, High: 0 };
  }
}

export async function getScamTrends(days: number = 30): Promise<TrendData[]> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const result = await JobAnalysis.aggregate([
      {
        $match: {
          created_at: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
            risk_level: "$risk_level"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.date",
          high: {
            $sum: {
              $cond: [{ $eq: ["$_id.risk_level", "High"] }, "$count", 0]
            }
          },
          medium: {
            $sum: {
              $cond: [{ $eq: ["$_id.risk_level", "Medium"] }, "$count", 0]
            }
          },
          low: {
            $sum: {
              $cond: [{ $eq: ["$_id.risk_level", "Low"] }, "$count", 0]
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          date: "$_id",
          high: 1,
          medium: 1,
          low: 1,
          _id: 0
        }
      }
    ]);

    logger.info("[ANALYTICS] Retrieved scam trends", {
      days,
      resultCount: result.length
    });

    return result as TrendData[];
  } catch (error) {
    logger.error("[ANALYTICS] Failed to retrieve scam trends", {
      error: error instanceof Error ? error.message : "Unknown error",
      days
    });
    return [];
  }
}

export async function getTopIndicators(limit: number = 10): Promise<TopIndicator[]> {
  try {
    const result = await JobAnalysis.aggregate([
      {
        $match: {
          suspicious_phrases: { $exists: true, $ne: [] }
        }
      },
      {
        $unwind: "$suspicious_phrases"
      },
      {
        $group: {
          _id: "$suspicious_phrases",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: limit
      },
      {
        $project: {
          phrase: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    logger.info("[ANALYTICS] Retrieved top indicators", {
      limit,
      resultCount: result.length
    });

    return result as TopIndicator[];
  } catch (error) {
    logger.error("[ANALYTICS] Failed to retrieve top indicators", {
      error: error instanceof Error ? error.message : "Unknown error",
      limit
    });
    return [];
  }
}
