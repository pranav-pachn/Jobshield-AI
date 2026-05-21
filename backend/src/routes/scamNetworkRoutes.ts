import { Router } from "express";
import {
  correlateScamNetworks,
  getNetworkGraph,
  extractEntities,
  getAnalysisNetworks,
  getAnalysisEntities,
  getNetworkStats,
} from "../controllers/scamNetworkController";
import { authMiddleware } from "../middleware/authMiddleware";

const scamNetworkRoutes = Router();

scamNetworkRoutes.use(authMiddleware);

// Admin/static routes FIRST (before parameterized routes)
scamNetworkRoutes.post("/correlate", correlateScamNetworks);
scamNetworkRoutes.get("/stats/summary", getNetworkStats);
scamNetworkRoutes.post("/entities/extract", extractEntities);

// Parameterized routes AFTER
scamNetworkRoutes.get("/:jobAnalysisId", getNetworkGraph);
scamNetworkRoutes.get("/:jobAnalysisId/networks", getAnalysisNetworks);
scamNetworkRoutes.get("/:jobAnalysisId/entities", getAnalysisEntities);

export default scamNetworkRoutes;
