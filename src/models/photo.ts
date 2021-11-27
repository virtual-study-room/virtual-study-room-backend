const mongoose = require("mongoose");
import { ObjectID } from "bson";
import { model, Schema, Model, Document } from "mongoose";

//definition of what info a to do list should contain
export interface PhotoListBody extends Document {
    userID: string;
    photos?: string[];
}

export interface PhotoList {
    userID: string;
    photos?: string[]
}

//mongoose's definition of our to list with the same shape as our interface
const PhotoSchema: Schema = new Schema({
    userID: { type: String, required: true },
    photos: { type: Array, required: false }
});


//let our database add new Photolists by exporting our photo model
export const Photo: Model<PhotoListBody> = model("Photo", PhotoSchema);