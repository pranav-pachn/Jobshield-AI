import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { 
  getOverview, 
  getTrends, 
  getThreats, 
  getPerformance 
} from "../controllers/intelligenceController";

const intelligenceRoutes = Router();

intelligenceRoutes.get("/overview", authMiddleware, getOverview);
intelligenceRoutes.get("/trends", authMiddleware, getTrends);
intelligenceRoutes.get("/threats", authMiddleware, getThreats);
intelligenceRoutes.get("/performance", authMiddleware, getPerformance);

export default intelligenceRoutes;
