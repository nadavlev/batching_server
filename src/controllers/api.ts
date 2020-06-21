"use strict";

import { MyUser, MyUserDocument } from "./../models/MyUser";
import graph, {batch} from "fbgraph";
import { Response, Request, NextFunction } from "express";
import { LoremIpsum } from "lorem-ipsum";
import generatePassword from "password-generator";
import moment from "moment";
import { UserDocument } from "../models/User";
import casual from "casual";
import * as _ from "lodash";
import {TimingObjectDocument, TimingObject} from "../models/TimingObject";


/**
 * GET /api
 * List of API examples.
 */
export const getApi = (req: Request, res: Response) => {
    res.render("api/index", {
        title: "API Examples"
    });
};

/**
 * GET /api/facebook
 * Facebook API example.
 */
export const getFacebook = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as UserDocument;
    const token = user.tokens.find((token: any) => token.kind === "facebook");
    graph.setAccessToken(token.accessToken);
    graph.get(`${user.facebook}?fields=id,name,email,first_name,last_name,gender,link,locale,timezone`, (err: Error, results: graph.FacebookUser) => {
        if (err) { return next(err); }
        res.render("api/facebook", {
            title: "Facebook API",
            profile: results
        });
    });
};

export const getInitialTest = (req: Request, res: Response) => {

    const fetchQuantity = _.parseInt(req.query.fetchQuantity) || 1000;
    MyUser.find({}, (err, users) => {
        if (err) console.error(err);
        const resObject = {startTime: (new Date).getTime(), actualFetchQuantity: fetchQuantity, data: users };
        res.status(200);
        res.send(resObject);
    }).sort({_id:1}).limit(fetchQuantity);
};

export const getTotalNumberOfRecords = async (req: Request, res: Response) => {
    const num = await MyUser.count({});
    res.status(200);
    res.send({num});
};


function saveUser( user: MyUserDocument) {
    console.log(user);
    user.save();
}

function saveUsers(users: MyUserDocument[]) {
    for (const user in users) {
        saveUser(users[user]);
    }
}

export const constantBatchSize = (req: Request, res: Response) => {
    const batchSize: number = +req.query.batchSize;
    const currentId: string = req.query.currentId || "5e83494d880c17b508395401";
    const queryObject: any = req.query.currentId ? {_id: {$gt: currentId}} : {};
    MyUser.find(queryObject).limit(batchSize || 1000).sort("_id").exec((err, users: MyUserDocument[]) => {
        if (err) console.error(err);
        res.status(200);
        res.send({"data": users});
    });

};

export const saveTimingObject = (req: Request, res: Response) => {
    const timingObj = req.body;
    console.log(timingObj);
    const timingObject: TimingObjectDocument = new TimingObject({
        ...timingObj
    });
    timingObject.save().then(() => {
        res.status(200);
        res.send({status: "saved"});
    }, () => {
        res.status(500);
        res.send({status: "Not Saved"});
    });
};

export const generateData = (req: Request, res: Response) => {
    const lorem = new LoremIpsum({
        sentencesPerParagraph: {
          max: 8,
          min: 4
        },
        wordsPerSentence: {
          max: 16,
          min: 4
        }
      });
      
    const recordsToCreate: number = parseInt(req.params.quantity);
    const isSave: boolean = req.params.save === "true";
    const timeObj = moment();
    const currentMilis = timeObj.add(1, "months");
    const generatedUsers: MyUserDocument[] = [];
    for (let i = 1; i <= recordsToCreate; i++) {
        const firstName: string = casual.first_name;
        const lastName: string = casual.last_name;
        const name = firstName + "_"+ lastName;
        const domain: string = lorem.generateWords(1);
        const generatedUser: MyUserDocument = new MyUser({
            email: name+i+"@"+ domain +".com",
            password: generatePassword(),
            passwordResetToken: generatePassword(),
            passwordResetExpires: currentMilis.add(Math.random() * 3, "d").toDate(),
            facebook: "https://www.facebook.com/" + name + i,
            tokens: [
                {
                    accessToken: lorem.generateWords(3),
                    kind: "123"
                }
            ],
            profile: {
                name: name,
                gender: "string",
                location: "string",
                website: "www."+domain+".com",
                picture: "string"
            },
            gravatar: (num: number) => { return "1".repeat(num); }
        });
        generatedUsers.push(generatedUser);
    }
    if (isSave) {
        saveUsers(generatedUsers);
    }
    else {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.send({data: generatedUsers});
    }
};

