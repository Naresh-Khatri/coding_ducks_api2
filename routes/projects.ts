import { Router } from "express";
import {
  createProject,
  getProject,
  getUserProjects,
} from "../controllers/projects";
import { checkIfAuthenticated } from "../middlewares/auth-middleware";

const router = Router();

//TODO: add auth
router.post("/", [checkIfAuthenticated], createProject);
router.get("/user/", [checkIfAuthenticated], getUserProjects);
router.get("/:roomId", [], getProject);

export default router;
