import * as jwt from "jsonwebtoken";
import { Router, Request, Response, NextFunction } from "express";
const express = require("express");
//interface for express middleware of requests
export interface AuthorizedRequest extends Request {
  username?: string;
}
//function to validate JWT tokens, and return requests with the user's username if necessary
export function validateToken(
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction
) {
  //handle process not set up

  const authorizationHeader = req.headers.authorization;
  let result;
  if (authorizationHeader) {
    //auth looks like Bearer <TOKEN>
    const authToken = req.headers.authorization?.split(" ")[1];
    if (!authToken || !process.env.JWT_SECRET) {
      console.log("Error!");
      return;
    }
    try {
      const result = jwt.verify(authToken, process.env.JWT_SECRET);
      if (typeof result == "string") {
        res.status(400).send("result is string");
        return;
      }
      req.username = result.username;
      next();
    } catch (error: any) {
      console.error(error);
      res.status(400).send(error.message);
    }
  } else {
    res.status(400).send("Needs authorization header");
  }
}
