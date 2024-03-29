import { Router } from "express";
import fileUpload from "express-fileupload";
import * as examsController from "../controllers/exams";

import { addUserToRequest, checkIfAuthenticated } from "../middlewares/auth-middleware";

const router = Router();
router.use(fileUpload());

//TODO: add auth
router.get("/", [addUserToRequest], examsController.getAllExams);
router.get("/slug/:slug", examsController.getExamUsingSlug);
router.get("/id/:examId", examsController.getExamUsingId);
router.get(
  "/getProgress/:examId",
  [checkIfAuthenticated],
  examsController.getUserProgress
);
router.post("/", [checkIfAuthenticated], examsController.createExam);
router.post(
  "/feedback",
  [checkIfAuthenticated],
  examsController.createFeedback
);
router.patch("/:examId", [checkIfAuthenticated], examsController.updateExam);
router.delete("/:examId", [checkIfAuthenticated], examsController.deleteExam);

export default router;
