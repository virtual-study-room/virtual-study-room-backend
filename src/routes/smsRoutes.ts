const twilioNumber = String(process.env.TWILIO_NUMBER);
import { Router, Request, Response } from "express";
import { AuthorizedRequest, validateToken } from "../auth/jwt-auth";
import { User } from "../models/User";
import { Twilio } from "twilio";
const express = require("express");

const router: Router = express.Router();

interface TimerBody {
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
    if (!user) {
      res.status(401).send("Invalid authorization");
      return;
    }
    const msgRequestBody: TimerBody = req.body;
    const receivingNumber = await getUserPhone(user);
    if (!receivingNumber) {
      res.status(406).send("Need phone to send message to.");
    }
    const sendMsg = await client.messages.create({
      body: `${user}, you have scheduled a break for ${msgRequestBody.breakMinutes} minutes. You can get back to work later!`,
      from: twilioNumber,
      to: receivingNumber,
    });
    // console.log(sendMsg.status);
    // console.log(sendMsg);
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
    if (!user) {
      res.status(401).send("Invalid authorization");
      return;
    }
    const msgRequestBody: TimerBody = req.body;
    const receivingNumber = await getUserPhone(user);
    if (!receivingNumber) {
      res.status(406).send("Need phone to send message to.");
    }
    const sendMsg = await client.messages.create({
      body: `${user}, your scheduled break time has finished. Back to work!`,
      from: twilioNumber,
      to: receivingNumber,
    });
    // console.log(sendMsg.status);
    // console.log(sendMsg);
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
    if (!user) {
      res.status(401).send("Invalid authorization");
      return;
    }
    const receivingNumber = await getUserPhone(user);
    if (!receivingNumber) {
      res.status(406).send("Need phone to send message to.");
    }
    const msgRequestBody: TimerBody = req.body;
    const sendMsg = await client.messages.create({
      body: `${user}, you have set a timer to work for ${msgRequestBody.breakMinutes} minutes. Grind time starts now!`,
      from: twilioNumber,
      to: receivingNumber,
    });
    // console.log(sendMsg.status);
    // console.log(sendMsg);
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
    if (!user) {
      res.status(401).send("Invalid authorization");
      return;
    }
    const msgRequestBody: TimerBody = req.body;
    const receivingNumber = await getUserPhone(user);
    if (!receivingNumber) {
      res.status(406).send("Need phone to send message to.");
    }
    const sendMsg = await client.messages.create({
      body: `${user}, your scheduled work time has finished. Nice job!`,
      from: twilioNumber,
      to: receivingNumber,
    });
    //console.log(sendMsg.status);
    //console.log(sendMsg);
    res.status(200).send({
      msg: "Sent Message!",
    });
  }
);

async function getUserPhone(username: string) {
  const user = await User.findOne({
    username: username,
  });

  if (!user) {
    return "";
  } else {
    const phone: string | undefined = user.get("phone");
    if (!phone) return "";
    else return phone;
  }
}

module.exports = router;
