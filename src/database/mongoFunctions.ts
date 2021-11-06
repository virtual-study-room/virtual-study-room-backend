const mongoDB = require("mongodb");
import { MongoClient, Db } from "mongodb";
var mongoClient = require("mongodb").MongoClient;
import * as dotenv from "dotenv";
export type DatabaseType = Db | null;
//function to connect to database
export async function connectToDatabase(): Promise<Db | null> {
  dotenv.config();
  if (!process.env.DB_CONN_STRING || !process.env.DB_NAME) {
    console.log("Unable to Connect To Database!");
    return null;
  }
  const client: MongoClient = new MongoClient(process.env.DB_CONN_STRING);
  await client.connect();
  const db: Db = client.db(process.env.DB_NAME);

  return db;
}
