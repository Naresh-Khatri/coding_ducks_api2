import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()
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

export const checkIfAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authToken = getAuthToken(req);
    // console.log(req.headers.authorization);
    if (!authToken) {
      return res.status(401).send({ message: "unauthorized", code: 401 });
    }
    const decodedUser = await admin.auth().verifyIdToken(authToken);
    const userInDB = await prisma.user.findUnique({
      where: {
        googleUID: decodedUser.user_id
      },
      select: {
        id: true,
        isAdmin: true,

      }
    })
    req.user = { ...decodedUser, userId: userInDB?.id, isAdmin: userInDB?.isAdmin };
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
