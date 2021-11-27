const twilioNumber = String(process.env.TWILIO_NUMBER);
import { Router, Request, Response } from "express";
import { AuthorizedRequest, validateToken } from "../auth/jwt-auth";
import { User } from "../models/User";
import { Twilio } from "twilio";
const express = require("express");

const router: Router = express.Router();

interface TimerBody {
  receivingNumber: string;
  breakMinutes: number;
}
let accountSID = process.env.TWILIO_ACCOUNT_SID;
let authToken = process.env.TWILIO_AUTH_TOKEN;
if (!accountSID) accountSID = "";
if (!authToken) authToken = "";
const client = new Twilio(accountSID, authToken);
router.post(
  "/setBreakTimer",
  validateToken,
  async (req: AuthorizedRequest, res: Response) => {
    const user = req.username;
    const msgRequestBody: TimerBody = req.body;
    const theUser = User.findOne({
      username: user,
    });
    //TODO: Change receiving number to use the user's # in the database!
    const sendMsg = await client.messages.create({
      body: `${user}, you have scheduled a break for ${msgRequestBody.breakMinutes} minutes. You can get back to work later!`,
      from: twilioNumber,
      to: msgRequestBody.receivingNumber,
    });
    console.log(sendMsg.status);
    console.log(sendMsg);
    res.status(200).send({
      msg: "Sent Message!",
    });
  }
);

router.post(
  "/completedBreakTime",
  validateToken,
  async (req: AuthorizedRequest, res: Response) => {
    const user = req.username;
    const msgRequestBody: TimerBody = req.body;
    const theUser = User.findOne({
      username: user,
    });
    //TODO: Change receiving number to use the user's # in the database!
    const sendMsg = await client.messages.create({
      body: `${user}, your scheduled break time has finished. Back to work!`,
      from: twilioNumber,
      to: msgRequestBody.receivingNumber,
    });
    console.log(sendMsg.status);
    console.log(sendMsg);
    res.status(200).send({
      msg: "Sent Message!",
    });
  }
);

router.post(
  "/setStudyTimer",
  validateToken,
  async (req: AuthorizedRequest, res: Response) => {
    const user = req.username;
    const msgRequestBody: TimerBody = req.body;
    const theUser = User.findOne({
      username: user,
    });
    //TODO: Change receiving number to use the user's # in the database!
    const sendMsg = await client.messages.create({
      body: `${user}, you have set a timer to work for ${msgRequestBody.breakMinutes} minutes. Grind time starts now!`,
      from: twilioNumber,
      to: msgRequestBody.receivingNumber,
    });
    console.log(sendMsg.status);
    console.log(sendMsg);
    res.status(200).send({
      msg: "Sent Message!",
    });
  }
);

router.post(
  "/completedStudyTime",
  validateToken,
  async (req: AuthorizedRequest, res: Response) => {
    const user = req.username;
    const msgRequestBody: TimerBody = req.body;
    const theUser = User.findOne({
      username: user,
    });
    //TODO: Change receiving number to use the user's # in the database!
    const sendMsg = await client.messages.create({
      body: `${user}, your scheduled work time has finished. Nice job!`,
      from: twilioNumber,
      to: msgRequestBody.receivingNumber,
    });
    //console.log(sendMsg.status);
    //console.log(sendMsg);
    res.status(200).send({
      msg: "Sent Message!",
    });
  }
);

module.exports = router;
