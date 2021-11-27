const mongoose = require("mongoose");
import { model, Schema, Model, Document } from "mongoose";
import * as bcrypt from "bcrypt";

//definition of what info a user should contain
export interface UserType extends Document {
  username: string;
  bio?: string;
  phone?: string;
}

export interface UserInfoType {
  username: string;
  bio?: string;
  phone?: string;
}

//mongoose's definition of our user with the same shape as our interface
const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  bio: { type: String, required: false },
  password: { type: String, required: true },
  phone : {type: String, required: false},
});

//mongoose hook to encrypt password before saving
UserSchema.pre("save", function (next) {
  //catching process not there
  if (!process.env.SALTING_ROUNDS) return;
  const user = this;
  console.log(user);
  if (!user.isModified || !user.isNew) {
    //don't rehash if old user
    next();
  } else {
    const saltingRounds = Number(process.env.SALTING_ROUNDS);
    bcrypt.hash(user.password, saltingRounds, (err, hash) => {
      if (err) {
        console.log("Error hashing password for user", user.username);
        console.log(err);
        next(err);
      } else {
        user.password = hash;
        next();
      }
    });
  }
});

//let our database add new users by exporting our User model
export const User: Model<UserType> = model("User", UserSchema);
