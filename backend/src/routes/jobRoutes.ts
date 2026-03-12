import { Router } from "express";
import { analyzeJob } from "../controllers/jobController";

const jobRoutes = Router();

jobRoutes.post("/analyze", analyzeJob);

export default jobRoutes;
