import { Router } from "express";
import { authMiddleware, requireRole } from "../middleware/authMiddleware";
import { ThreatCampaign } from "../models/ThreatCampaign";
import { logger } from "../utils/logger";

const campaignRoutes = Router();

// Dashboard access requires ANALYST or ADMIN
campaignRoutes.use(authMiddleware);
campaignRoutes.use(requireRole(["ANALYST", "ADMIN"]));

// List all active campaigns
campaignRoutes.get("/", async (req, res) => {
  try {
    const campaigns = await ThreatCampaign.find()
      .sort({ updatedAt: -1 })
      .populate('linkedInvestigationIds', 'investigationId state finalDecision createdAt')
      .populate('linkedRecruiterProfileIds', 'names emails riskLevel')
      .lean();
    res.json(campaigns);
  } catch (error) {
    logger.error("Error fetching campaigns:", error);
    res.status(500).json({ error: "Failed to fetch campaigns" });
  }
});

// Get a specific campaign
campaignRoutes.get("/:id", async (req, res) => {
  try {
    const campaign = await ThreatCampaign.findOne({ campaignId: req.params.id })
      .populate('linkedInvestigationIds', 'investigationId state finalDecision createdAt')
      .populate('linkedRecruiterProfileIds', 'names emails riskLevel totalInvestigations')
      .lean();
      
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    res.json(campaign);
  } catch (error) {
    logger.error("Error fetching campaign details:", error);
    res.status(500).json({ error: "Failed to fetch campaign details" });
  }
});

export default campaignRoutes;
