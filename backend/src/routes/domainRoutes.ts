import { Router } from "express";
import {
  analyzeDomain,
  quickCheckDomain,
  bulkCheckDomains,
} from "../controllers/domainController";

const domainRoutes = Router();

/**
 * POST /api/domains/analyze
 * Analyze domain or email for security intelligence
 */
domainRoutes.post("/analyze", analyzeDomain);

/**
 * GET /api/domains/quick-check/:domain
 * Quick domain trust score check
 */
domainRoutes.get("/quick-check/:domain", quickCheckDomain);

/**
 * POST /api/domains/bulk-check
 * Bulk domain analysis for multiple domains
 */
domainRoutes.post("/bulk-check", bulkCheckDomains);

export default domainRoutes;
