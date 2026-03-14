import { Router } from "express";
import { checkRecruiter } from "../controllers/recruiterController";
import { authMiddleware } from "../middleware/authMiddleware";

const recruiterRoutes = Router();

recruiterRoutes.post("/check", authMiddleware, checkRecruiter);

export default recruiterRoutes;
