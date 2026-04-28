import { Router } from "express";
import {
  logThreatIndicators,
  getThreatSummary,
  getDomainPatterns,
  analyzeThreatIntelligence,
  getThreatStats
} from "../controllers/threatIntelligenceController";
import { cacheMiddleware, threatIntelligenceCache } from "../middleware/cache";

const threatRoutes = Router();

// Core threat intelligence endpoints
threatRoutes.post("/log", logThreatIndicators);
threatRoutes.get("/summary", cacheMiddleware(threatIntelligenceCache), getThreatSummary);
threatRoutes.get("/stats", cacheMiddleware(threatIntelligenceCache), getThreatStats);

// Pattern analysis endpoints
threatRoutes.get("/patterns/:domain", cacheMiddleware(threatIntelligenceCache), getDomainPatterns);
threatRoutes.post("/analyze", analyzeThreatIntelligence);

export default threatRoutes;
