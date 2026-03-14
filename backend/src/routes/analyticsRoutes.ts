import { Router } from "express";
import { 
  getRiskDistribution, 
  getScamTrends, 
  getTopIndicators 
} from "../controllers/analyticsController";
// import { authMiddleware } from "../middleware/authMiddleware";

const analyticsRoutes = Router();

// Temporarily remove auth middleware for testing
// analyticsRoutes.use(authMiddleware);

analyticsRoutes.get("/risk-distribution", getRiskDistribution);
analyticsRoutes.get("/trends", getScamTrends);
analyticsRoutes.get("/top-indicators", getTopIndicators);

export default analyticsRoutes;
