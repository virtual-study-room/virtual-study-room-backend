const mongoose = require("mongoose");
import { ObjectID } from "bson";
import { model, Schema, Model, Document } from "mongoose";

//definition of what info a user should contain
export interface ToDoListBody extends Document {
    userID: string;
    title: string;
    date: Date;
    trashed: boolean;
    items?: string[];
}

export interface ToDoList {
    userID: string;
    title: string;
    date?: Date;
    trashed?: boolean;
    items?: string[];
}

//mongoose's definition of our user with the same shape as our interface
const ToDoSchema: Schema = new Schema({
    userID: { type: String, required: true },
    title: { type: String, required: true },
    date: { type: String, required: false, },
    trashed: { type: Boolean, required: false, },
    items: { type: Array, required: false }
});


//let our database add new ToDoLists by exporting our User model
export const ToDo: Model<ToDoListBody> = model("ToDo", ToDoSchema);
