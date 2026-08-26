import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import recruiterProfileService from "../services/recruiterProfileService";
import { RecruiterProfile } from "../models/RecruiterProfile";
import { logger } from "../utils/logger";

const recruiterProfileRoutes = Router();

recruiterProfileRoutes.use(authMiddleware);

// Search profiles by email or domain
recruiterProfileRoutes.get("/search", async (req, res) => {
  try {
    const { email, domain, phone } = req.query;
    if (!email && !domain && !phone) {
      return res.status(400).json({ error: "Missing search parameter" });
    }
    
    const query: any = {};
    if (email) query.emails = email as string;
    if (domain) query.domains = domain as string;
    if (phone) query.phones = phone as string;
    
    const profiles = await RecruiterProfile.find(query).limit(10).lean();
    res.json(profiles);
  } catch (error) {
    logger.error("Error searching recruiter profiles:", error);
    res.status(500).json({ error: "Failed to search profiles" });
  }
});

// Get intelligence dossier
recruiterProfileRoutes.get("/:id", async (req, res) => {
  try {
    const intelligence = await recruiterProfileService.getRecruiterIntelligence(req.params.id);
    if (!intelligence) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json(intelligence);
  } catch (error) {
    logger.error("Error getting recruiter intelligence:", error);
    res.status(500).json({ error: "Failed to get intelligence" });
  }
});

export default recruiterProfileRoutes;
