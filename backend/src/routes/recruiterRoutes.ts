import { Router } from "express";
import { checkRecruiter } from "../controllers/recruiterController";

const recruiterRoutes = Router();

recruiterRoutes.post("/check", checkRecruiter);

export default recruiterRoutes;
