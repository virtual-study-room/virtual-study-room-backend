const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
import * as dotenv from "dotenv";
const port = process.env.PORT || 8080;
import { Application, Request, Response } from "express";
const app: Application = express();

//parse body of requests as json
app.use(express.json());

//load in our dotenv
dotenv.config();
//load in routes from our route files
const authRoutes = require("./routes/authRoutes");
app.use("/", authRoutes);
const toDoRoutes = require("./routes/toDoRoutes");
app.use("/", toDoRoutes);
const photoRoutes = require("./routes/photoRoutes");
app.use("/", photoRoutes);

const smsRoutes = require("./routes/smsRoutes");
app.use("/", smsRoutes);

//default route to check server status
app.get("/", (req: Request, res: Response) => {
  res.send({ message: "Express server running!" });
  //instead of
  //res.send("Express Server Running!");
});

//connect to our database, then start our server
mongoose
  .connect(process.env.DB_CONN_STRING, { useNewUrlParser: true })
  .then(() => {
    app.listen(port, () => {
      console.log("Express app listening on port: " + port);
    });
  });
