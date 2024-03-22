import { Router } from "express";
import * as filesController from "../controllers/files";
import {
  checkIfAdmin,
  checkIfAuthenticated,
} from "../middlewares/auth-middleware";

const router = Router();

//TODO: add auth
router.get("/all", [checkIfAdmin], filesController.getAllFiles);
router.get("/:fileId", filesController.getFile);
router.post("/", [checkIfAuthenticated], filesController.createFile);
router.patch("/:id", filesController.updateFile);
router.delete("/:id", filesController.deleteFile);

export default router;
