import { InvestigationFeedback, FeedbackStatus, FeedbackType } from "../models/InvestigationFeedback";
import { KnowledgeItem, KnowledgeStatus, TrustLevel } from "../models/KnowledgeItem";
import { LearningEvent } from "../models/LearningEvent";
import ScamEntity from "../models/ScamEntity";
import { ThreatCampaign } from "../models/ThreatCampaign";
import mongoose from "mongoose";
import axios from "axios";
import { env } from "../config/env";
import { logger } from "../utils/logger";

export class LearningService {
  /**
   * Review and approve feedback, promoting it to Knowledge and potentially confirming a campaign.
   */
  static async approveFeedback(
    feedbackId: string | mongoose.Types.ObjectId,
    reviewerId: string | mongoose.Types.ObjectId,
    knowledgeContent: string,
    knowledgeCategory: string,
    options: { overrideConflict?: boolean, overrideDuplicate?: boolean } = {}
  ) {
    let session: mongoose.ClientSession | null = null;
    let useTransaction = false;

    try {
      // Attempt to start a transaction. 
      // This will fail if the DB does not support replica sets (e.g., local standalone).
      session = await mongoose.startSession();
      session.startTransaction();
      useTransaction = true;
    } catch (e) {
      logger.warn(`[LearningService] Transactions not supported, falling back to non-transactional idempotent workflow. Error: ${e}`);
      if (session) {
        await session.endSession();
        session = null;
      }
    }

    try {
      const feedback = await InvestigationFeedback.findById(feedbackId).session(session);
      if (!feedback) {
        throw new Error("Feedback not found");
      }
      
      if (feedback.status === FeedbackStatus.CONFIRMED) {
        // Idempotent: Already confirmed
        logger.info(`Feedback ${feedbackId} is already CONFIRMED, skipping approval workflow`);
        return { knowledge: null, confirmedCampaignId: null };
      }

      if (feedback.status !== FeedbackStatus.PENDING) {
        throw new Error(`Cannot approve feedback in state ${feedback.status}`);
      }

      // Step 2: Mark Feedback as CONFIRMED
      feedback.status = FeedbackStatus.CONFIRMED;
      feedback.reviewedBy = reviewerId;
      feedback.reviewedAt = new Date();
      await feedback.save({ session: session });

      // Step 3: Create KnowledgeItem (Idempotent: check if already exists for this feedback)
      let knowledge = await KnowledgeItem.findOne({ 'provenance.sourceFeedbackId': feedback._id }).session(session);
      
      if (!knowledge) {
        knowledge = new KnowledgeItem({
          title: `Analyst Verified Pattern: ${knowledgeCategory}`,
          content: knowledgeContent,
          category: knowledgeCategory,
          severity: "HIGH",
          source: "User Feedback",
          sourceType: "ANALYST_FEEDBACK",
          status: KnowledgeStatus.APPROVED,
          trustLevel: TrustLevel.ANALYST_VERIFIED,
          provenance: {
            sourceType: "ANALYST_FEEDBACK",
            sourceInvestigationId: feedback.investigationId,
            sourceFeedbackId: feedback._id,
            submittedBy: feedback.submittedBy,
            validatedBy: reviewerId,
            validatedAt: new Date(),
            confidenceScore: 1.0 // Fully trusted
          }
        });
        await knowledge.save({ session: session });

        feedback.knowledgeItemId = knowledge._id as mongoose.Types.ObjectId;
        await feedback.save({ session: session });

        // Step 4: Create LearningEvent for Knowledge Creation
        const knowledgeEvent = new LearningEvent({
          feedbackId: feedback._id,
          investigationId: feedback.investigationId,
          knowledgeItemId: knowledge._id,
          action: "KNOWLEDGE_CREATED",
          performedBy: reviewerId
        });
        await knowledgeEvent.save({ session: session });
      }

      // Step 5: Campaign Confirmation logic
      let confirmedCampaignId = null;
      const scamEntity = await ScamEntity.findOne({ jobAnalysisId: feedback.investigationId }).session(session);
      
      if (scamEntity && (scamEntity as any).linkedCampaignIds && (scamEntity as any).linkedCampaignIds.length > 0) {
        const campaign = await ThreatCampaign.findById((scamEntity as any).linkedCampaignIds[0]).session(session);
        
        if (campaign && campaign.status !== "CONFIRMED") {
          // Threshold check: Must have at least 2 linked investigations or analyst discretion
          if (campaign.linkedInvestigationIds.length >= 2) {
            campaign.status = "CONFIRMED";
            campaign.confidence = 98; // High confidence due to human validation
            await campaign.save({ session: session });
            
            confirmedCampaignId = campaign.campaignId;

            // Audit the campaign confirmation
            const campaignEvent = new LearningEvent({
              feedbackId: feedback._id,
              investigationId: feedback.investigationId,
              campaignId: campaign.campaignId,
              action: "CAMPAIGN_CONFIRMED",
              performedBy: reviewerId
            });
            await campaignEvent.save({ session: session });
          }
        } else if (campaign && campaign.status === "CONFIRMED") {
           confirmedCampaignId = campaign.campaignId;
        }
      }

      if (useTransaction && session) {
        await session.commitTransaction();
      }

      // Post-transaction: Generate Embeddings
      try {
        const embeddingResponse = await axios.post(`${env.aiServiceUrl}/api/embed`, {
          text: knowledgeContent,
          model: "all-MiniLM-L6-v2"
        });

        if (embeddingResponse.data?.embedding) {
          knowledge.embedding = embeddingResponse.data.embedding;
          knowledge.status = KnowledgeStatus.ACTIVE; // Available for RAG
          await knowledge.save();
        }
      } catch (embedError) {
        logger.error(`Embedding failed for knowledge ${knowledge._id}:`, embedError);
      }

      return { knowledge, confirmedCampaignId };
    } catch (error) {
      if (useTransaction && session) {
        await session.abortTransaction();
      }
      logger.error(`Error approving feedback ${feedbackId}:`, error);
      throw error;
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  }

  /**
   * Reject feedback

   */
  static async rejectFeedback(
    feedbackId: string | mongoose.Types.ObjectId,
    reviewerId: string | mongoose.Types.ObjectId
  ) {
    let session: mongoose.ClientSession | null = null;
    let useTransaction = false;

    try {
      session = await mongoose.startSession();
      session.startTransaction();
      useTransaction = true;
    } catch (e) {
      logger.warn(`[LearningService] Transactions not supported for rejectFeedback, falling back. Error: ${e}`);
      if (session) {
        await session.endSession();
        session = null;
      }
    }

    try {
      let feedback = await InvestigationFeedback.findById(feedbackId).session(session);
      if (!feedback) {
        throw new Error("Feedback not found");
      }

      if (feedback.status === FeedbackStatus.REJECTED) {
        // Idempotent
        logger.info(`Feedback ${feedbackId} is already REJECTED, skipping`);
        return feedback;
      }

      feedback.status = FeedbackStatus.REJECTED;
      feedback.reviewedBy = reviewerId as mongoose.Types.ObjectId;
      feedback.reviewedAt = new Date();
      await feedback.save({ session: session });

      const rejectEvent = new LearningEvent({
        feedbackId: feedback._id,
        investigationId: feedback.investigationId,
        action: "FEEDBACK_REJECTED",
        performedBy: reviewerId
      });
      await rejectEvent.save({ session: session });

      if (useTransaction && session) {
        await session.commitTransaction();
      }

      return feedback;
    } catch (error) {
      if (useTransaction && session) {
        await session.abortTransaction();
      }
      logger.error(`Error rejecting feedback ${feedbackId}:`, error);
      throw error;
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  }

  /**
   * List pending feedback
   */
  static async getPendingFeedback() {
    try {
      return await InvestigationFeedback.find({ 
        status: FeedbackStatus.PENDING 
      })
      .sort({ submittedAt: -1 })
      .populate("submittedBy", "email role")
      .lean(); 
    } catch (error) {
      logger.error("Error getting pending feedback:", error);
      throw error;
    }
  }
}
