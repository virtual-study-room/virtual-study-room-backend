import { Router, Request, Response } from "express";
const express = require("express");
const router: Router = express.Router();
import { Photo } from "../models/photo";
import { PhotoList } from "../models/photo"
import { AuthorizedRequest, validateToken } from "../auth/jwt-auth";

router.post("/addPhoto", validateToken, async (req: AuthorizedRequest, res: Response) => {
    //handle db not being initialized yet
    const Photos: PhotoList = req.body;
    if(!req.username){
        res
        .status(400)
        .send("Wrong authorization")
        return
      } //type safe, preventing it from being undefined
    Photos.userID = req.username;
    const newPhotos: PhotoList = {
        userID: Photos.userID,
        photos: Photos.photos
    };

    try {
        //attempt to create new to do list in model if doesn't exist, 
        const savedPhotos = new Photo({
            userID: newPhotos.userID,
            photos: newPhotos.photos
        });

        const photoUnique = await Photo.findOne({
            userID: savedPhotos.userID,
        });

        if (photoUnique) {
            photoUnique.photos = savedPhotos.photos;
            await photoUnique.save();
            res
                .status(200)
                .send({message:"Successfully updated the photo list for " + savedPhotos.userID});
        }
        else {
            await savedPhotos.save();

            res
                .status(200)
                .send({message:"Successfully added a photo list for " + savedPhotos.userID});
        }

    } catch (error: any) {
        console.error(error);
        res.status(400).send(error.message);
    }
});




module.exports = router;