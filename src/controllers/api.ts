"use strict";

import { MyUser, MyUserDocument } from "./../models/MyUser";
import graph, {batch} from "fbgraph";
import { Response, Request, NextFunction } from "express";
import generatePassword from "password-generator";
import moment from "moment";
import { UserDocument } from "../models/User";
import casual from "casual";
import * as _ from "lodash";
import {TimingObjectDocument, TimingObject} from "../models/TimingObject";
import {stringify} from 'jsonstream';


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
    console.log(`Fetch quantity is: ${fetchQuantity}`);
    MyUser.find({}).sort({_id:1}).limit(fetchQuantity).cursor()
        .pipe( stringify())
        .pipe(res.type('json'));
    //TODO: send status
    //TODO: does this end?
};

export const getTotalNumberOfRecords = async (req: Request, res: Response) => {
    const num = await MyUser.countDocuments({});
    res.status(200);
    res.send({num});
};


function saveUser( user: MyUserDocument) {
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
    MyUser.find(queryObject).limit(batchSize || 1000).sort("_id")
        .cursor()
        .pipe(stringify())
        .pipe(res.type('json'));
}

export const saveTimingObject = (req: Request, res: Response) => {
    const timingObj = req.body;
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
    const genders = ['Male', 'Female', 'Gay', 'Lesbian', 'Transgender', 'Undefined'];
    const recordsToCreate: number = parseInt(req.params.quantity);
    const isSave: boolean = req.params.save === "true";
    const timeObj = moment();
    const currentMilis = timeObj.add(1, "months");
    const generatedUsers: MyUserDocument[] = [];
    for (let i = 1; i <= recordsToCreate; i++) {
        const name = casual.username;
        const cardType = casual.card_type;
        const generatedUser: MyUserDocument = new MyUser({
            email: casual.email,
            password: generatePassword(),
            passwordResetToken: casual.password,
            passwordResetExpires: currentMilis.add(Math.random() * 3, "d").toDate(),
            facebook: "https://www.facebook.com/" + name,
            name: name,
            firstName: casual.first_name,
            lastName: casual.last_name,
            gender: genders[_.random(genders.length-1)],
            country: casual.country,
            city: casual.city,
            zip: casual.zip( 9),
            address: casual.address,
            lat: casual.latitude,
            long: casual.longitude,
            website: casual.url,
            ip: casual.ip,
            company: casual.company_name,
            cardType,
            cardNumber: casual.card_number(cardType),
            cardExp: casual.card_exp
        });
        if (isSave) {
            saveUser(generatedUser);

        }

        generatedUsers.push(generatedUser);

    }

    res.status(200);
    res.send({data: generatedUsers});
};

