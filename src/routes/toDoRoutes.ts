import { Router, Request, Response } from "express";
const express = require("express");
const router: Router = express.Router();
import { ToDo } from "../models/toDo";
import { ToDoList } from "../models/toDo"

router.post("/addToDo", async (req: Request, res: Response) => {
    //handle db not being initialized yet
    const ToDoInfo: ToDoList = req.body;
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
                .send("Successfully added a to-do list for " + newToDoList.userID);
        }

    } catch (error: any) {
        console.error(error);
        res.status(400).send(error.message);
    }
});

router.get("/getToDo", async (req: Request, res: Response) => {
    const requestedListOwner = req.query.userID;
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
            const requestedList = req.query.title;
            const titleQuery = {
                title: requestedList,
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

module.exports = router;