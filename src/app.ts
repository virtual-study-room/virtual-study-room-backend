const express = require("express");
const mongoose = require("mongoose");
import * as dotenv from "dotenv";
const port = process.env.PORT || 8080;
import { Application, Request, Response } from "express";
import { validateToken } from "./auth/jwt-auth";
const app: Application = express();

//parse body of requests as json
app.use(express.json());
app.use(validateToken);

//load in routes from our route files
const authRoutes = require("./routes/authRoutes");
app.use("/", authRoutes);
const toDoRoutes = require("./routes/toDoRoutes");
app.use("/", toDoRoutes);

//default route to check server status
app.get("/", (req: Request, res: Response) => {
  res.send("Express server running!");
});

//load in our dotenv
dotenv.config();

//connect to our database, then start our server
mongoose
  .connect(process.env.DB_CONN_STRING, { useNewUrlParser: true })
  .then(() => {
    app.listen(port, () => {
      console.log("Express app listening on port: " + port);
    });
  });
