const mongoose = require("mongoose");
import { model, Schema, Model, Document } from "mongoose";

//definition of what info a user should contain
interface UserType extends Document {
  username: string;
  bio?: string;
}

//mongoose's definition of our user with the same shape as our interface
const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  bio: { type: String, required: false },
});

//let our database add new users by exporting our User model
export const User: Model<UserType> = model("User", UserSchema);
