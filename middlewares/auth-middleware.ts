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
