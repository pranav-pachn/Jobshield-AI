import { Router } from "express";
import { submitReport } from "../controllers/reportController";
import { authMiddleware } from "../middleware/authMiddleware";

const reportRoutes = Router();

reportRoutes.post("/submit", authMiddleware, submitReport);

export default reportRoutes;
