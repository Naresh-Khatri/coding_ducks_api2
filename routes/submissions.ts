import { Router } from "express";
import {
  getSubmissions,
  getSubmissionById,
  getLastSubmission,
  getSubmissionsByCurrentUserAndProblemId,
} from "../controllers/submissions";
import { checkIfAuthenticated } from "../middlewares/auth-middleware";

const router = Router();

//TODO: add auth
router.get("/", checkIfAuthenticated, getSubmissions);
router.get("/last", checkIfAuthenticated, getLastSubmission);
router.get("/:submissionId", checkIfAuthenticated, getSubmissionById);
router.get(
  "/current-user/:problemId",
  checkIfAuthenticated,
  getSubmissionsByCurrentUserAndProblemId
);

export default router;
