import { Router } from "express";
import { submitReport } from "../controllers/reportController";

const reportRoutes = Router();

reportRoutes.post("/submit", submitReport);

export default reportRoutes;
