import { Router } from "express";
import {
  logThreatIndicators,
  getThreatSummary,
  getDomainPatterns,
  analyzeThreatIntelligence,
  getThreatStats
} from "../controllers/threatIntelligenceController";
import { cacheMiddleware, threatIntelligenceCache } from "../middleware/cache";
import { authMiddleware } from "../middleware/authMiddleware";
import { validateThreatAnalyzeInput, validateThreatLogInput } from "../middleware/zodValidation";

const threatRoutes = Router();

threatRoutes.use(authMiddleware);

// Core threat intelligence endpoints
threatRoutes.post("/log", validateThreatLogInput, logThreatIndicators);
threatRoutes.get("/summary", cacheMiddleware(threatIntelligenceCache), getThreatSummary);
threatRoutes.get("/stats", cacheMiddleware(threatIntelligenceCache), getThreatStats);

// Pattern analysis endpoints
threatRoutes.get("/patterns/:domain", cacheMiddleware(threatIntelligenceCache), getDomainPatterns);
threatRoutes.post("/analyze", validateThreatAnalyzeInput, analyzeThreatIntelligence);

export default threatRoutes;
