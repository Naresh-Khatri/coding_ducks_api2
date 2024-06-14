import { Router } from "express";
import * as challengesController from "../controllers/ui-challenges";

import {
  addUserToRequest,
  checkIfAdmin,
  checkIfAuthenticated,
} from "../middlewares/auth-middleware";

const router = Router();

//TODO: add auth

router.get("/", [addUserToRequest], challengesController.getAllChallenges);
router.get("/:idOrSlug", challengesController.getChallenge);

router.get("/:challengeId/attempts", challengesController.getAttempts);
router.get(
  "/:challengeSlug/attempts/:attemptId",
  challengesController.getAttempt
);
router.post(
  "/:challengeId/start",
  [checkIfAuthenticated],
  challengesController.createDummyAttempt
);
router.post(
  "/:challengeId/submit",
  [checkIfAuthenticated],
  challengesController.submitAttempt
);
router.patch(
  "/:challengeId/attempts/:attemptId",
  [checkIfAuthenticated],
  challengesController.updateAttempt
);

// admin stuff
router.post(
  "/",
  [checkIfAuthenticated, checkIfAdmin],
  challengesController.createChallenge
);
router.patch(
  "/:challengeId",
  [checkIfAuthenticated, checkIfAdmin],
  challengesController.updateChallenge
);
router.delete(
  "/:challengeId",
  [checkIfAuthenticated, checkIfAdmin],
  challengesController.deleteChallenge
);
// take screenshot
router.post('/get-screenshot', challengesController.captureScreenshot);

export default router;
