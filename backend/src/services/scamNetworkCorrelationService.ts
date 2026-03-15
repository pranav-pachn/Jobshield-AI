import ScamNetwork, { IScamNetwork, CorrelationType } from "../models/ScamNetwork";
import ScamEntity, { IScamEntity } from "../models/ScamEntity";
import { JobAnalysis, IJobAnalysis } from "../models/JobAnalysis";
import scamEntityExtractionService from "./scamEntityExtractionService";
import { v4 as uuidv4 } from "uuid";

/**
 * Service for building and managing scam network correlations
 * Identifies relationships between scam reports based on shared entities
 */
class ScamNetworkCorrelationService {
  /**
   * Confidence weights for different correlation types
   */
  private confidenceWeights = {
    shared_wallet: 0.95,
    shared_email_exact: 0.85,
    shared_email_domain: 0.65,
    shared_phone: 0.75,
    textual_similarity: 0.45,
  };

  /**
   * Main correlation function - processes job analyses and builds scam network
   * @param maxAnalysesToProcess - Limit for processing (for performance)
   */
  async correlateScamEntities(maxAnalysesToProcess: number = 500): Promise<{
    networksCreated: number;
    correlationsFound: number;
    totalReportsLinked: number;
  }> {
    try {
      console.log(`Starting scam entity correlation (max ${maxAnalysesToProcess} analyses)...`);

      // Get high-risk job analyses (only process likely scams)
      const jobAnalyses = await JobAnalysis.find({ risk_level: "High" })
        .limit(maxAnalysesToProcess)
        .sort({ created_at: -1 });

      if (!jobAnalyses || jobAnalyses.length === 0) {
        console.log("No job analyses found for correlation");
        return { networksCreated: 0, correlationsFound: 0, totalReportsLinked: 0 };
      }

      console.log(`Processing ${jobAnalyses.length} high-risk job analyses...`);

      // Extract entities for all analyses
      const analysesWithEntities: Array<{
        analysis: IJobAnalysis;
        entities: Awaited<ReturnType<typeof scamEntityExtractionService.extractEntities>>;
      }> = [];

      for (const analysis of jobAnalyses) {
        const entities = await scamEntityExtractionService.extractEntities(
          analysis.job_text,
          analysis._id?.toString()
        );
        if (entities && (entities.emails.length > 0 || entities.domains.length > 0 || entities.wallets.length > 0)) {
          analysesWithEntities.push({ analysis, entities });
        }
      }

      console.log(`Found ${analysesWithEntities.length} analyses with extractable entities`);

      // Build correlation groups
      const correlationGroups = this.buildCorrelationGroups(analysesWithEntities);

      console.log(`Identified ${correlationGroups.length} correlation groups`);

      // Store correlations in database
      let networksCreated = 0;
      let totalReportsLinked = 0;

      for (const group of correlationGroups) {
        const network = await this.storeCorrelationGroup(group);
        if (network) {
          networksCreated++;
          totalReportsLinked += group.linkedAnalysisIds.length;
        }
      }

      console.log(`Correlation complete: ${networksCreated} networks created, ${totalReportsLinked} reports linked`);

      return {
        networksCreated,
        correlationsFound: correlationGroups.length,
        totalReportsLinked,
      };
    } catch (error) {
      console.error("Error during scam entity correlation:", error);
      throw error;
    }
  }

  /**
   * Build correlation groups from analyses with extracted entities
   */
  private buildCorrelationGroups(
    analysesWithEntities: Array<{
      analysis: IJobAnalysis;
      entities: Awaited<ReturnType<typeof scamEntityExtractionService.extractEntities>>;
    }>
  ): Array<{
    correlationType: CorrelationType;
    entitiesInvolved: Array<{ type: string; value: string; confidence: number }>;
    linkedAnalysisIds: string[];
    confidence: number;
  }> {
    const groups: Array<{
      correlationType: CorrelationType;
      entitiesInvolved: Array<{ type: string; value: string; confidence: number }>;
      linkedAnalysisIds: string[];
      confidence: number;
    }> = [];

    const processed = new Set<string>();

    for (let i = 0; i < analysesWithEntities.length; i++) {
      const { analysis: analysis1, entities: entities1 } = analysesWithEntities[i];
      const id1 = analysis1._id?.toString() || "";

      for (let j = i + 1; j < analysesWithEntities.length; j++) {
        const { analysis: analysis2, entities: entities2 } = analysesWithEntities[j];
        const id2 = analysis2._id?.toString() || "";

        // Check for correlations
        const correlations = this.findCorrelations(entities1, entities2, id1, id2);

        for (const correlation of correlations) {
          const groupKey = this.generateGroupKey(correlation.linkedAnalysisIds, correlation.correlationType);

          if (!processed.has(groupKey)) {
            groups.push(correlation);
            processed.add(groupKey);
          }
        }
      }
    }

    return groups;
  }

  /**
   * Find all correlations between two analyses
   */
  private findCorrelations(
    entities1: Awaited<ReturnType<typeof scamEntityExtractionService.extractEntities>>,
    entities2: Awaited<ReturnType<typeof scamEntityExtractionService.extractEntities>>,
    id1: string,
    id2: string
  ): Array<{
    correlationType: CorrelationType;
    entitiesInvolved: Array<{ type: string; value: string; confidence: number }>;
    linkedAnalysisIds: string[];
    confidence: number;
  }> {
    const correlations: Array<{
      correlationType: CorrelationType;
      entitiesInvolved: Array<{ type: string; value: string; confidence: number }>;
      linkedAnalysisIds: string[];
      confidence: number;
    }> = [];

    // Check exact email matches
    const sharedEmails = this.findSharedItems(entities1.emails, entities2.emails);
    if (sharedEmails.length > 0) {
      correlations.push({
        correlationType: "shared_email_exact",
        entitiesInvolved: sharedEmails.map((email) => ({
          type: "email",
          value: email,
          confidence: 90,
        })),
        linkedAnalysisIds: [id1, id2],
        confidence: this.confidenceWeights.shared_email_exact * 100,
      });
    }

    // Check domain matches
    const sharedDomains = this.findSharedItems(entities1.domains, entities2.domains);
    if (sharedDomains.length > 0) {
      correlations.push({
        correlationType: "shared_email_domain",
        entitiesInvolved: sharedDomains.map((domain) => ({
          type: "domain",
          value: domain,
          confidence: 85,
        })),
        linkedAnalysisIds: [id1, id2],
        confidence: this.confidenceWeights.shared_email_domain * 100,
      });
    }

    // Check wallet matches
    const sharedWallets = this.findSharedItems(entities1.wallets, entities2.wallets);
    if (sharedWallets.length > 0) {
      correlations.push({
        correlationType: "shared_wallet",
        entitiesInvolved: sharedWallets.map((wallet) => ({
          type: "wallet",
          value: wallet,
          confidence: 95,
        })),
        linkedAnalysisIds: [id1, id2],
        confidence: this.confidenceWeights.shared_wallet * 100,
      });
    }

    // Check phone number matches
    const sharedPhones = this.findSharedItems(entities1.phoneNumbers, entities2.phoneNumbers);
    if (sharedPhones.length > 0) {
      correlations.push({
        correlationType: "shared_phone",
        entitiesInvolved: sharedPhones.map((phone) => ({
          type: "phone",
          value: phone,
          confidence: 80,
        })),
        linkedAnalysisIds: [id1, id2],
        confidence: this.confidenceWeights.shared_phone * 100,
      });
    }

    return correlations;
  }

  /**
   * Find shared items between two arrays (case-insensitive)
   */
  private findSharedItems(array1: string[], array2: string[]): string[] {
    const normalized1 = new Set(array1.map((item) => item.toLowerCase()));
    return array2.filter((item) => normalized1.has(item.toLowerCase()));
  }

  /**
   * Generate unique key for a correlation group
   */
  private generateGroupKey(analysisIds: string[], correlationType: CorrelationType): string {
    const sortedIds = [...analysisIds].sort();
    return `${sortedIds.join("_")}_${correlationType}`;
  }

  /**
   * Store correlation group in database
   */
  private async storeCorrelationGroup(group: {
    correlationType: CorrelationType;
    entitiesInvolved: Array<{ type: string; value: string; confidence: number }>;
    linkedAnalysisIds: string[];
    confidence: number;
  }): Promise<IScamNetwork | null> {
    try {
      // Get related job analyses for metadata
      const relatedAnalyses = await JobAnalysis.find({
        _id: { $in: group.linkedAnalysisIds },
      });

      const highestRiskLevel = relatedAnalyses.length > 0 ? relatedAnalyses[0].risk_level : "medium";
      const averageRiskScore =
        relatedAnalyses.reduce((sum: number, a: any) => sum + (a.scam_probability || 0), 0) / Math.max(relatedAnalyses.length, 1);

      const network = new ScamNetwork({
        networkId: `scam_ring_${uuidv4()}`,
        entitiesInvolved: group.entitiesInvolved,
        correlationType: group.correlationType,
        confidence: Math.round(group.confidence),
        linkedJobAnalysisIds: group.linkedAnalysisIds,
        totalReportsLinked: group.linkedAnalysisIds.length,
        createdAt: new Date(),
        lastUpdated: new Date(),
        metadata: {
          correlationDetails: `${group.linkedAnalysisIds.length} scam reports linked via ${group.correlationType}`,
          highestRiskLevel: highestRiskLevel as "high" | "medium" | "low",
          averageRiskScore: Math.round(averageRiskScore),
        },
      });

      await network.save();
      return network;
    } catch (error) {
      console.error("Error storing correlation group:", error);
      return null;
    }
  }

  /**
   * Get all correlation networks for a specific job analysis
   */
  async getNetworksForAnalysis(jobAnalysisId: string): Promise<IScamNetwork[]> {
    return ScamNetwork.find({
      linkedJobAnalysisIds: jobAnalysisId,
    }).sort({ confidence: -1 });
  }

  /**
   * Get all entities involved in a network
   */
  async getNetworkEntities(networkId: string): Promise<Array<{ type: string; value: string }> | null> {
    const network = await ScamNetwork.findOne({ networkId });
    if (!network) return null;

    return network.entitiesInvolved.map((entity) => ({
      type: entity.type,
      value: entity.value,
    }));
  }

  /**
   * Get scam ring size (number of analyses in correlation group)
   */
  async getScamRingSize(networkId: string): Promise<number> {
    const network = await ScamNetwork.findOne({ networkId });
    return network ? network.totalReportsLinked : 0;
  }

  /**
   * Get all networks (paginated)
   */
  async getAllNetworks(limit: number = 100, skip: number = 0): Promise<IScamNetwork[]> {
    return ScamNetwork.find()
      .sort({ confidence: -1, createdAt: -1 })
      .limit(limit)
      .skip(skip);
  }

  /**
   * Get networks by correlation type
   */
  async getNetworksByType(correlationType: CorrelationType, limit: number = 100): Promise<IScamNetwork[]> {
    return ScamNetwork.find({ correlationType })
      .sort({ confidence: -1 })
      .limit(limit);
  }
}

export default new ScamNetworkCorrelationService();
