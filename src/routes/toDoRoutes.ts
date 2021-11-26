import { Router, Request, Response } from "express";
const express = require("express");
const router: Router = express.Router();
import { ToDo } from "../models/toDo";
import { ToDoList } from "../models/toDo"
import { AuthorizedRequest, validateToken } from "../auth/jwt-auth";

router.post("/addToDo", validateToken, async (req: AuthorizedRequest, res: Response) => {
    //handle db not being initialized yet
    const ToDoInfo: ToDoList = req.body;
    if(!req.username){
        res
        .status(400)
        .send("Wrong authorization")
        return
      } //type safe, preventing it from being undefined
    ToDoInfo.userID = req.username;
    const newToDoList: ToDoList = {
        userID: ToDoInfo.userID,
        title: ToDoInfo.title,
        date: new Date(),
        trashed: false,
        items: ToDoInfo.items
    };

    try {
        //attempt to create new to do list in model if doesn't exist, 
        const newList = new ToDo({
            userID: newToDoList.userID,
            title: newToDoList.title,
            date: newToDoList.date,
            trashed: newToDoList.trashed,
            items: newToDoList.items
        });

        const listUnique = await ToDo.findOne({
            userID: newList.userID,
            title: newList.title
        });

        if (listUnique) {
            res
                .status(404)
                .send("Error: List already exists for requested user");
        }
        else {
            await newList.save();

            res
                .status(200)
                .send({message:"Successfully added a to-do list for " + newToDoList.userID});
        }

    } catch (error: any) {
        console.error(error);
        res.status(400).send(error.message);
    }
});

router.get("/getToDo", validateToken, async (req: AuthorizedRequest, res: Response) => {
    const requestedListOwner = req.username;
    try {
        const userQuery = {
            userID: requestedListOwner,
        };
        //attempt to find user in database
        const ListOwner = await ToDo.find(userQuery);

        //if the user exists, send its info back in response. If not, throw error saying user could not be found.
        if (ListOwner.length === 0) {
            res
                .status(404)
                .send("Error: Could not find requested user: " + userQuery.userID);
        }
        else {
            //then now look through the titles
            const requestedList: ToDoList = req.body;
            const titleQuery = {
                title: requestedList.title,
            };
            const ListTitle = await ToDo.findOne(titleQuery);
            if (!ListTitle) {
                res
                    .status(404)
                    .send("Error: Could not find requested to do list: " + titleQuery.title);
            }
            else {
                res.status(200).send({
                    toDo: ListTitle
                })
            }
        }

    }
    catch (error: any) {
        console.error(error);
        res.status(400).send(error.message);
    }

});

router.post("/editToDo", validateToken, async (req: AuthorizedRequest, res: Response) => {
    const requestedList: ToDoList = req.body; // only put title, and items
    if(!req.username){
        res
        .status(400)
        .send("Wrong authorization")
        return
      } //type safe, preventing it from being undefined
    requestedList.userID = req.username;
    try {
        const userQuery = {
            userID: requestedList.userID,
        };
        //attempt to find user in database
        const ListOwner = await ToDo.find(userQuery);

        //if the user exists, send its info back in response. If not, throw error saying user could not be found.
        if (ListOwner.length === 0) {
            res
                .status(404)
                .send("Error: Could not find requested user: " + userQuery.userID);
        }
        else {
            //then now look through the titles
            const titleQuery = {
                title: requestedList.title,
            };
            const pulledList = await ToDo.findOne(titleQuery);
            
            if (!pulledList) {
                res
                    .status(404)
                    .send("Error: Could not find requested to do list: " + titleQuery.title);
            }
            else {
                pulledList.items = requestedList.items;
                await pulledList.save();
                res
                .status(200)
                .send({message: "Successfully updated user info of: " + req.username});
                }
            }
        }
    catch (error: any) {
        console.error(error);
        res.status(400).send(error.message);
    }
});

router.delete("/trashToDo", validateToken, async (req: AuthorizedRequest, res: Response) => {
    const requestedList: ToDoList = req.body; // only put title, run twice to delete
    if(!req.username){
        res
        .status(400)
        .send("Wrong authorization")
        return
      } //type safe, preventing it from being undefined
    requestedList.userID = req.username;
    try {
        const userQuery = {
            userID: requestedList.userID,
        };
        //attempt to find user in database
        const ListOwner = await ToDo.find(userQuery);

        //if the user exists, send its info back in response. If not, throw error saying user could not be found.
        if (ListOwner.length === 0) {
            res
                .status(404)
                .send("Error: Could not find requested user: " + userQuery.userID);
        }
        else {
            //then now look through the titles
            const titleQuery = {
                title: requestedList.title,
            };
            const pulledList = await ToDo.findOne(titleQuery);
            
            if (!pulledList) {
                res
                    .status(404)
                    .send("Error: Could not find requested to do list: " + titleQuery.title);
            }
            else {
                if(pulledList.trashed === false){
                    pulledList.trashed = true
                await pulledList.save();
                res
                .status(200)
                .send({message: "Successfully put " + pulledList.title + " in the trash can for " + req.username});
                }
                else if(pulledList.trashed === true){
                    await pulledList.delete();
                    res
                    .status(200)
                    .send({message: "Successfully trashed " + pulledList.title + " for " + req.username});
                }
            }
            }
        }
    catch (error: any) {
        console.error(error);
        res.status(400).send(error.message);
    }
});

module.exports = router;
