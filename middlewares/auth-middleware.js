// import { NextFunction, Response } from "express";
// import { RequestWithUserAndFile } from "../custom_types/request.js";
import admin from "../firebase/firebase_service.js";

const getAuthToken = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    return req.headers.authorization.split(" ")[1];
  } else {
    return null;
  }
};

export const checkIfAuthenticated = async (req, res, next) => {
  try {
    const authToken = getAuthToken(req);
    // console.log(req.headers.authorization);
    if (!authToken) {
      return res.status(401).send({ message: "unauthorized", code: 401 });
    }
    const decodedToken = await admin.auth().verifyIdToken(authToken);
    req.user = decodedToken;
    next();
  } catch (err) {
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
