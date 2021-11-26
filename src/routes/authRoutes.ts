import { Router, Request, Response } from "express";
const express = require("express");
const router: Router = express.Router();
import * as bcrypt from "bcrypt";
import { User } from "../models/User";

interface UserInfoType {
  username: string;
  bio?: string;
}

interface AuthRequestType {
  username: string;
  password: string;
}

//route that tries to add a user's profile to the database if it doesn't exist yet
router.post("/register", async (req: Request, res: Response) => {
  //handle db not being initialized yet
  const userInfo: AuthRequestType = req.body;
  const newUserProfile: AuthRequestType = {
    username: userInfo.username,
    password: userInfo.password,
  };
  //attempt to add user info of a new user:
  //attempt to create new user in model if doesn't exist, throw error if user is already there.
  const newUser = new User({
    username: newUserProfile.username,
    password: userInfo.password,
  });

  await newUser.save((err, user) => {
    if (!err) {
      res
        .status(200)
        .send("Successfully registered: " + newUserProfile.username);
    } else {
      res.status(500).send(err.message);
    }
  });
});

router.post("/login", async (req: Request, res: Response) => {
  const requestInfo: AuthRequestType = req.body;
  try {
    const userInfo = await User.findOne({
      username: requestInfo.username,
      //TODO: Fix any
    });

    if (!userInfo) {
      res.status(401).send("Invalid username");
      return;
    }

    //check to see if password matches
    const correctPassword = await bcrypt.compare(
      requestInfo.password,
      userInfo.get("password")
    );

    if (!correctPassword) {
      res.status(401).send("Invalid Password");
      return;
    } else {
      res.status(200).send("User signed in.");
      return;
    }

    //
  } catch (err: any) {
    console.error(err);
    res.status(400).send(err.message);
  }
});

//route that finds user and returns its profile in the databaseif it exists
router.get("/getInfo", async (req: Request, res: Response) => {
  const requestedUser = req.query.username;
  try {
    const userQuery = {
      username: requestedUser,
    };
    //attempt to find user in database
    const userInfo = await User.findOne(userQuery);

    //if the user exists, send its info back in response. If not, throw error saying user could not be found.
    userInfo
      ? res.status(200).send({
          user: userInfo,
        })
      : res
          .status(404)
          .send("Error: Could not find requested user: " + requestedUser);
  } catch (error: any) {
    console.error(error);
    res.status(400).send(error.message);
  }
});

//route that tries to find user and updates details
router.post("/updateInfo", async (req: Request, res: Response) => {
  const userInfo: UserInfoType = req.body;
  const updatedUserProfile: UserInfoType = {
    username: userInfo.username,
    bio: userInfo.bio,
  };
  try {
    const userQuery = {
      username: updatedUserProfile.username,
    };
    const oldUser = await User.findOne(userQuery);
    if (oldUser) {
      //await User.updateOne(userQuery, { bio: updatedUserProfile.bio });
      oldUser.bio = updatedUserProfile.bio;
      await oldUser.save();
      res
        .status(200)
        .send(
          "Successfully updated user info of: " + updatedUserProfile.username
        );
    } else {
      res
        .status(404)
        .send(
          "Error: Could not find requested user: " + updatedUserProfile.username
        );
    }
  } catch (error: any) {
    console.error(error);
    res.status(400).send(error.message);
  }
});

//route that deletes user data
router.delete("/deleteInfo", async (req: Request, res: Response) => {
  const requestedUser = req.query.username;
  try {
    const userQuery = {
      username: requestedUser,
    };
    //attempt to find user in database
    const userInfo = await User.findOne(userQuery);
    if (userInfo) {
      await userInfo.delete();
      res
        .status(200)
        .send("Successfully deleted user info of: " + userQuery.username);
    } else {
      res
        .status(404)
        .send("Error: Could not find requested user: " + userQuery.username);
    }
  } catch (error: any) {
    console.error(error);
    res.status(400).send(error.message);
  }
});

// // add modify and add delete, plus structure

module.exports = router;
