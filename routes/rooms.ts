import { Router } from "express";
import * as roomsController from "../controllers/rooms";
import {
  checkIfAdmin,
  checkIfAuthenticated,
  checkIfUserAllowedInRoom,
  checkIfUserIsOwnerOfRoom,
} from "../middlewares/auth-middleware";

const router = Router();

//TODO: add auth
router.get("/all", [checkIfAdmin], roomsController.getAllRooms);
router.get("/", roomsController.getPublicRooms);
router.post("/", [checkIfAuthenticated], roomsController.createRoom);
router.get("/:roomId", [checkIfUserAllowedInRoom], roomsController.getRoom);
router.get("/:roomId/msgs", [checkIfUserAllowedInRoom], roomsController.getRoomMsgs);
router.get(
  "/name/:roomname",
  [checkIfUserAllowedInRoom],
  roomsController.getRoomWithName
);
router.patch("/:roomId", [checkIfAuthenticated], roomsController.updateRoom);
router.patch(
  "/:roomId/updateAllowList",
  [checkIfAuthenticated],
  roomsController.updateAllowList
);

router.patch(
  "/:roomId/updateContents",
  [checkIfAuthenticated],
  roomsController.updateRoomContents
);
router.delete(
  "/:roomId",
  [checkIfAuthenticated, checkIfUserIsOwnerOfRoom],
  roomsController.deleteRoom
);
``;
export default router;
