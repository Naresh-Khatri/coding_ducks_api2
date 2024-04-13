import prisma from "../lib/prisma";
import { NextFunction, Response, Request } from "express";
// import { RequestWithUserAndFile } from "../custom_types/request.js";
import admin from "../firebase/firebase_service.js";

const getAuthToken = (req: Request) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    return req.headers.authorization.split(" ")[1];
  } else {
    return null;
  }
};

export const addUserToRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authToken = getAuthToken(req);
    if (!authToken) {
      return next();
    }
    const decodedUser = await admin.auth().verifyIdToken(authToken);
    const userInDB = await prisma.user.findUnique({
      where: {
        googleUID: decodedUser.user_id,
      },
      select: {
        id: true,
        isAdmin: true,
        isNoob: true,
      },
    });
    if (!userInDB) return next();
    req.user = {
      ...decodedUser,
      userId: userInDB?.id,
      isAdmin: userInDB?.isAdmin,
      isNoob: userInDB?.isNoob,
    };
    next();
  } catch (err: any) {
    next();
  }
};

export const checkIfAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authToken = getAuthToken(req);
    // console.log(req.headers.authorization);
    if (!authToken) {
      return res.status(401).send({ message: "unauthorized", code: 401 });
    }
    const decodedUser = await admin.auth().verifyIdToken(authToken);
    const userInDB = await prisma.user.findUnique({
      where: {
        googleUID: decodedUser.user_id,
      },
      select: {
        id: true,
        isAdmin: true,
        isNoob: true,
      },
    });
    if (!userInDB) return new Error("User not found");
    req.user = {
      ...decodedUser,
      userId: userInDB?.id,
      isAdmin: userInDB?.isAdmin,
      isNoob: userInDB?.isNoob,
    };
    next();
  } catch (err: any) {
    // console.error(err);
    console.error(err.code);
    if (err.code === "auth/argument-error") {
      console.log("You have not provided a token.");
      return res.status(401).send({ message: "unauthorized", code: 401 });
    } else if (err.code === "auth/id-token-expired") {
      return res.status(401).send({ message: "token expired", code: 401 });
    } else {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  }
};

export const checkIfAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(401).send({ message: "admins only", code: 401 });
    }
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

export const checkRoleInRoom = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roomId } = req.params;
    const dbRoom = await prisma.room.findFirst({
      where: {
        id: +roomId,
      },
      select: {
        ownerId: true,
        isPublic: true,
        allowedUsers: {
          select: {
            id: true,
          },
        },
      },
    });
    if (!dbRoom) {
      return res.status(404).send({ message: "room not found!", code: 404 });
    }

    const authToken = getAuthToken(req);
    // console.log(req.headers.authorization);
    /**
     * USER NOT LOGGED IN
     */
    if (!authToken) {
      if (dbRoom.isPublic) {
        req.roomRole = "guest";
        return next();
      } else {
        req.roomRole = "none";
        return res.status(409).send({ message: "unauthorized", code: 409 });
      }
    }

    const decodedUser = await admin.auth().verifyIdToken(authToken);
    const dbUser = await prisma.user.findFirst({
      where: { googleUID: decodedUser.uid },
      select: {
        id: true,
      },
    });
    if (!dbUser) {
      return res.status(404).send({ message: "user not found!", code: 404 });
    }
    /**
     * USER IS OWNER
     */
    if (dbRoom.ownerId === dbUser.id) {
      req.roomRole = "owner";
      return next();
    }
    /**
     * USER IS ALLOWED IN ROOM
     */
    const userInAllowedList = dbRoom?.allowedUsers.some(
      (user) => user.id === dbUser?.id
    );
    if (userInAllowedList) {
      req.roomRole = "contributor";
      return next();
    }
    /**
     * USER IS NOT ALLOWED IN ROOM
     */
    if (!userInAllowedList) {
      if (dbRoom.isPublic) {
        req.roomRole = "guest";
        return next();
      } else {
        req.roomRole = "requester";
        return next();
      }
    }
  } catch (err: any) {
    // console.error(err);
    console.error(err.code);
    if (err.code === "auth/argument-error") {
      console.log("You have not provided a token.");
      return res.status(401).send({ message: "unauthorized", code: 401 });
    } else if (err.code === "auth/id-token-expired") {
      return res.status(401).send({ message: "token expired", code: 401 });
    } else {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  }
};
export const checkIfUserIsOwnerOfRoom = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roomId } = req.params;
    console.log("hello", roomId);
    const dbRoom = await prisma.room.findFirst({
      where: {
        id: +roomId,
      },
      select: {
        ownerId: true,
      },
    });
    console.log(dbRoom);

    if (dbRoom?.ownerId === req.user.userId) {
      return next();
    }
    return res.status(409).send({ message: "unauthorized", code: 409 });
  } catch (err: any) {
    // console.error(err);
    console.error(err.code);
    if (err.code === "auth/argument-error") {
      console.log("You have not provided a token.");
      return res.status(401).send({ message: "unauthorized", code: 401 });
    } else if (err.code === "auth/id-token-expired") {
      return res.status(401).send({ message: "token expired", code: 401 });
    } else {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  }
};
