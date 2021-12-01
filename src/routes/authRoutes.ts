import { Router, Request, Response } from "express";
const express = require("express");
const router: Router = express.Router();
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { User } from "../models/User";
import { UserInfoType } from "../models/User";
import { client, twilioNumber } from "../app";
import {
  AuthorizedRequest,
  validateToken,
  isValidToken,
} from "../auth/jwt-auth";

interface AuthRequestType {
  username: string;
  password: string;
}

router.post("/isValidToken", async (req: Request, res: Response) => {
  const userToken: string = req.body.authToken;
  const tokenUser = isValidToken(userToken);
  if (!tokenUser) {
    res.status(400).send({
      message: "Invalid Token",
    });
    return;
  } else {
    //get old profile info
    const userInfo = await User.findOne({
      username: tokenUser,
    });
    if (!userInfo) {
      res.status(400).send({
        message: "Invalid Token",
      });
      return;
    }
    const prevLogin: Date = userInfo.get("login");
    userInfo.login = new Date();
    await userInfo.save();
    res.status(200).send({
      username: tokenUser,
      prevLogin: prevLogin,
    });
  }
});

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
    phone: req.body.phone,
    login: new Date(),
  });

  if (
    newUser.phone &&
    newUser.phone.length != 12 &&
    newUser.phone.substring(0, 1) != "+1"
  ) {
    res.status(401).send("Invalid phone number format");
    return;
  }

  await newUser.save(async (err, user) => {
    if (!err) {
      //send phone number if exists
      if (newUser.phone) {
        await client.messages.create({
          body: `virtual-study-room: ${user.username}, you have successfully linked your phone number to your account!`,
          from: twilioNumber,
          to: newUser.phone,
        });
      }
      res.status(200).send({
        message: "Successfully registered: " + newUserProfile.username,
      });
    } else {
      res.status(500).send({ message: err.message });
    }
  });
});

router.post("/login", async (req: Request, res: Response) => {
  //handle process not being setup
  if (!process.env.JWT_SECRET) return;
  const requestInfo: AuthRequestType = req.body;
  try {
    //console.log(requestInfo);
    const userInfo = await User.findOne({
      username: requestInfo.username,
    });

    if (!userInfo) {
      res.status(401).send({ message: "Invalid username" });
      return;
    }

    //check to see if password matches
    const correctPassword = await bcrypt.compare(
      requestInfo.password,
      userInfo.get("password")
    );

    //generate JWT token if the password is valid
    if (correctPassword) {
      const prevLogin: Date = userInfo.get("login");
      userInfo.login = new Date();
      await userInfo.save();
      const payload = { username: userInfo.get("username") };
      const options = { expiresIn: "2d" };
      const token = jwt.sign(payload, process.env.JWT_SECRET, options);
      res.status(200).send({
        token: token,
        prevLogin: prevLogin,
      });
      return;
    } else {
      res.status(401).send({ message: "Invalid Password" });
      return;
    }

    //
  } catch (err: any) {
    console.error(err);
    res.status(400).send({ message: err.message });
  }
});

//route that finds user and returns its profile in the databaseif it exists
router.get(
  "/getInfo",
  validateToken,
  async (req: AuthorizedRequest, res: Response) => {
    const requestedUser = req.username;
    console.log(req.username);
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
        : res.status(404).send({
            message: "Error: Could not find requested user: " + requestedUser,
          });
    } catch (error: any) {
      console.error(error);
      res.status(400).send(error.message);
    }
  }
);

//route that tries to find user and updates details
router.post(
  "/updateInfo",
  validateToken,
  async (req: AuthorizedRequest, res: Response) => {
    const userInfo: UserInfoType = req.body;
    if (!req.username) {
      res.status(400).send("Wrong authorization");
      return;
    } //type safe, preventing it from being undefined
    userInfo.username = req.username;
    const updatedUserProfile: UserInfoType = {
      username: userInfo.username,
      bio: userInfo.bio,
      phone: userInfo.phone,
    };
    if (
      userInfo.phone &&
      userInfo.phone.length != 12 &&
      userInfo.phone.substring(0, 1) != "+1"
    ) {
      res.status(401).send("Invalid phone number format");
      return;
    }
    try {
      const userQuery = {
        username: updatedUserProfile.username,
      };
      const oldUser = await User.findOne(userQuery);
      if (oldUser) {
        //await User.updateOne(userQuery, { bio: updatedUserProfile.bio });
        oldUser.bio = updatedUserProfile.bio;
        oldUser.phone = updatedUserProfile.phone;
        await oldUser.save();
        res.status(200).send({
          message:
            "Successfully updated user info of: " + updatedUserProfile.username,
        });
      } else {
        res
          .status(404)
          .send(
            "Error: Could not find requested user: " +
              updatedUserProfile.username
          );
      }
    } catch (error: any) {
      console.error(error);
      res.status(400).send(error.message);
    }
  }
);

//route that deletes user data
router.delete(
  "/deleteInfo",
  validateToken,
  async (req: AuthorizedRequest, res: Response) => {
    const requestedUser = req.username;
    try {
      const userQuery = {
        username: requestedUser,
      };
      //attempt to find user in database
      const userInfo = await User.findOne(userQuery);
      if (userInfo) {
        await userInfo.delete();
        res.status(200).send({
          message: "Successfully deleted user info of: " + userQuery.username,
        });
      } else {
        res
          .status(404)
          .send("Error: Could not find requested user: " + userQuery.username);
      }
    } catch (error: any) {
      console.error(error);
      res.status(400).send(error.message);
    }
  }
);

// // add modify and add delete, plus structure

module.exports = router;
