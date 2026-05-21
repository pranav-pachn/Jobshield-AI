import { Router } from "express";
import {
  analyzeDomain,
  quickCheckDomain,
  bulkCheckDomains,
} from "../controllers/domainController";
import { validateDomainAnalyzeInput, validateDomainBulkCheckInput } from "../middleware/zodValidation";

const domainRoutes = Router();

/**
 * POST /api/domains/analyze
 * Analyze domain or email for security intelligence
 */
domainRoutes.post("/analyze", validateDomainAnalyzeInput, analyzeDomain);

/**
 * GET /api/domains/quick-check/:domain
 * Quick domain trust score check
 */
domainRoutes.get("/quick-check/:domain", quickCheckDomain);

/**
 * POST /api/domains/bulk-check
 * Bulk domain analysis for multiple domains
 */
domainRoutes.post("/bulk-check", validateDomainBulkCheckInput, bulkCheckDomains);

export default domainRoutes;
