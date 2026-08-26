import mongoose from "mongoose";
import { ThreatIndicator, IThreatIndicator, ThreatType, ThreatRiskLevel, ThreatSource } from "../models/ThreatIndicator";
import { normalizeIndicator } from "../utils/threatNormalizer";
import { logger } from "../utils/logger";

interface SearchThreatsParams {
  query?: string;
  type?: ThreatType;
  riskLevel?: ThreatRiskLevel;
  page?: number;
  limit?: number;
}

export class ThreatIndicatorService {
  /**
   * Look up an indicator by type and value
   */
  static async lookup(type: ThreatType, value: string): Promise<IThreatIndicator | null> {
    const normalizedValue = normalizeIndicator(type, value);
    if (!normalizedValue) return null;

    try {
      return await ThreatIndicator.findOne({ type, normalizedValue });
    } catch (error) {
      logger.error(`Error looking up threat indicator [${type}: ${normalizedValue}]:`, error);
      return null;
    }
  }

  /**
   * Create or update a threat indicator (upsert)
   */
  static async upsert(
    type: ThreatType,
    value: string,
    data: Partial<IThreatIndicator>
  ): Promise<IThreatIndicator | null> {
    const normalizedValue = normalizeIndicator(type, value);
    if (!normalizedValue) return null;

    try {
      const updateData = {
        ...data,
        type,
        value, // Store original value, but primary index is on normalized
        normalizedValue,
        lastSeen: new Date(),
      };

      // Ensure riskLevel is set if not provided during creation
      if (!updateData.riskLevel) {
        updateData.riskLevel = ThreatRiskLevel.MEDIUM;
      }

      const indicator = await ThreatIndicator.findOneAndUpdate(
        { type, normalizedValue },
        { 
          $set: updateData,
          $inc: { occurrenceCount: 1 },
          $setOnInsert: { firstSeen: new Date(), createdAt: new Date() }
        },
        { new: true, upsert: true }
      );

      return indicator;
    } catch (error) {
      logger.error(`Error upserting threat indicator [${type}: ${normalizedValue}]:`, error);
      return null;
    }
  }

  /**
   * Increment occurrence count without updating other data
   */
  static async incrementOccurrence(id: string | mongoose.Types.ObjectId): Promise<void> {
    try {
      await ThreatIndicator.findByIdAndUpdate(id, {
        $inc: { occurrenceCount: 1 },
        $set: { lastSeen: new Date() }
      });
    } catch (error) {
      logger.error(`Error incrementing occurrence for indicator ${id}:`, error);
    }
  }

  /**
   * Link an investigation to this indicator
   */
  static async linkInvestigation(
    id: string | mongoose.Types.ObjectId,
    investigationId: mongoose.Types.ObjectId
  ): Promise<void> {
    try {
      await ThreatIndicator.findByIdAndUpdate(id, {
        $addToSet: { linkedInvestigations: investigationId }
      });
    } catch (error) {
      logger.error(`Error linking investigation ${investigationId} to indicator ${id}:`, error);
    }
  }

  /**
   * Search and filter indicators
   */
  static async search({
    query,
    type,
    riskLevel,
    page = 1,
    limit = 20
  }: SearchThreatsParams) {
    const filter: any = {};
    
    if (query) {
      // Basic regex search on value or normalizedValue
      filter.$or = [
        { value: { $regex: query, $options: "i" } },
        { normalizedValue: { $regex: query, $options: "i" } }
      ];
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (riskLevel) {
      filter.riskLevel = riskLevel;
    }

    try {
      const skip = (page - 1) * limit;
      const [results, total] = await Promise.all([
        ThreatIndicator.find(filter)
          .sort({ lastSeen: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        ThreatIndicator.countDocuments(filter)
      ]);

      return {
        results,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error("Error searching threat indicators:", error);
      return { results: [], pagination: { total: 0, page, limit, totalPages: 0 } };
    }
  }

  /**
   * Get threat indicator statistics
   */
  static async getStats() {
    try {
      const [byType, byRisk] = await Promise.all([
        ThreatIndicator.aggregate([
          { $group: { _id: "$type", count: { $sum: 1 } } }
        ]),
        ThreatIndicator.aggregate([
          { $group: { _id: "$riskLevel", count: { $sum: 1 } } }
        ])
      ]);

      const total = byType.reduce((acc, curr) => acc + curr.count, 0);

      const typeStats = byType.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {} as Record<string, number>);

      const riskStats = byRisk.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {} as Record<string, number>);

      return {
        total,
        byType: typeStats,
        byRisk: riskStats
      };
    } catch (error) {
      logger.error("Error getting threat stats:", error);
      return { total: 0, byType: {}, byRisk: {} };
    }
  }

  /**
   * Get indicators linked to a specific investigation
   */
  static async getLinkedIndicators(investigationId: mongoose.Types.ObjectId | string) {
    try {
      return await ThreatIndicator.find({
        linkedInvestigations: new mongoose.Types.ObjectId(investigationId)
      }).lean();
    } catch (error) {
      logger.error(`Error getting indicators for investigation ${investigationId}:`, error);
      return [];
    }
  }
}
