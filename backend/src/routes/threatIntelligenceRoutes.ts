import { Router } from "express";
import {
  logThreatIndicators,
  getThreatSummary,
  getDomainPatterns,
  analyzeThreatIntelligence,
  getThreatStats
} from "../controllers/threatIntelligenceController";
import { cacheMiddleware, threatIntelligenceCache } from "../middleware/cache";
import { authMiddleware, requireRole } from "../middleware/authMiddleware";
import { validateThreatAnalyzeInput, validateThreatLogInput } from "../middleware/zodValidation";
import {
  searchIndicators,
  getIndicatorStats,
  getLinkedIndicators,
  addManualIndicator
} from "../controllers/threatIndicatorController";

const threatRoutes = Router();

threatRoutes.use(authMiddleware);

// Core threat intelligence endpoints
threatRoutes.post("/log", requireRole(["ANALYST", "ADMIN"]), validateThreatLogInput, logThreatIndicators);
threatRoutes.get("/summary", cacheMiddleware(threatIntelligenceCache), getThreatSummary);
threatRoutes.get("/stats", cacheMiddleware(threatIntelligenceCache), getThreatStats);

// Pattern analysis endpoints
threatRoutes.get("/patterns/:domain", cacheMiddleware(threatIntelligenceCache), getDomainPatterns);
threatRoutes.post("/analyze", validateThreatAnalyzeInput, analyzeThreatIntelligence);

// Phase 7 Threat Indicator Endpoints
threatRoutes.get("/indicators/search", searchIndicators);
threatRoutes.get("/indicators/stats", cacheMiddleware(threatIntelligenceCache), getIndicatorStats);
threatRoutes.get("/indicators/linked/:investigationId", getLinkedIndicators);
threatRoutes.post("/indicators", requireRole(["ANALYST", "ADMIN"]), addManualIndicator);

export default threatRoutes;
