import { Application, Router, Request, Response } from "express";
const express = require("express");
const router: Router = express.Router();
import { db } from "../app";
interface UserInfoType {
  username: string;
  bio: string;
}

//route that tries to add a user's profile to the database
router.post("/addInfo", async (req: Request, res: Response) => {
  //handle db not being initialized yet
  if (!db) {
    console.log("DB not initialized yet!");
    res.status(400).send("Error connecting to database");
    return;
  }
  const userInfo: UserInfoType = req.body;
  const newUserProfile: UserInfoType = {
    username: userInfo.username,
    bio: userInfo.bio,
  };
  //attempt to add user info:
  try {
    const addResult = await db.collection("users").insertOne(newUserProfile);

    addResult
      ? res
          .status(200)
          .send("Successfully added user info of: " + newUserProfile.username)
      : res.status(500).send("Error adding new user.");
  } catch (error: any) {
    console.error(error);
    res.status(400).send(error.message);
  }
});

//route that finds user and returns its profile in the database
router.get("/getInfo", async (req: Request, res: Response) => {
  if (!db) {
    console.log("DB not initialized yet!");
    res.status(400).send("Error connecting to database");
    return;
  }

  const requestedUser = req.query.username;
  try {
    const userQuery = {
      username: requestedUser,
    };
    const userProfileResult = await db.collection("users").findOne(userQuery);
    userProfileResult
      ? res.status(200).send({
          user: userProfileResult,
        })
      : res.status(400).send("Failed to find requested user");
  } catch (error: any) {
    console.error(error);
    res.status(400).send(error.message);
  }
});

module.exports = router;
