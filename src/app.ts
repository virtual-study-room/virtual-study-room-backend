const express = require("express");
const port = process.env.PORT || 8080;
import { Application, Request, Response } from "express";
import { connectToDatabase, DatabaseType } from "./database/mongoFunctions";

const app: Application = express();

let db: DatabaseType = null;

//function that attempts to connect to our database
async function connectDB(): Promise<boolean> {
  const res = await connectToDatabase();
  if (!res) {
    console.log("Error connecting to database!");
    return false;
  }
  db = res;
  return true;
}
export { db };

//parse body of requests as json
app.use(express.json());

//load in routes from our route files
const authRoutes = require("./routes/authRoutes");
app.use("/", authRoutes);
app.get("/", (req: Request, res: Response) => {
  res.send("Express server running!");
});

//set up server once database is connected
connectDB().then(() => {
  app.listen(port, () => {
    console.log("Listening on port: " + port);
  });
});
