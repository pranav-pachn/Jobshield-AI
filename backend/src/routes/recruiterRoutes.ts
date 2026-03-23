import { Router } from "express";
import { checkRecruiter } from "../controllers/recruiterController";
// import { authMiddleware } from "../middleware/authMiddleware";

const recruiterRoutes = Router();

// Temporarily remove auth middleware for testing
recruiterRoutes.post("/check", checkRecruiter);

export default recruiterRoutes;
