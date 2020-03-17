"use strict";

import graph from "fbgraph";
import { Response, Request, NextFunction } from "express";
import { LoremIpsum } from "lorem-ipsum";
import generatePassword from "password-generator";
import moment from "moment";
import { UserDocument } from "../models/User";
import { MyUserDocument, MyUesr } from "../models/MyUser";
import casual from "casual";


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

export const getIniitialTest = (req: Request, res: Response) => {
    const data = {body: "Initial test" + (new Date).getTime()};
    res.send(data);
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
    for (let i = 0; i <= recordsToCreate; i++) {
        const firstName: string = casual.first_name;
        const lastName: string = casual.last_name;
        const name = firstName + "_"+ lastName;
        const domain: string = lorem.generateWords(1);
        const generatedUser: MyUserDocument = new MyUesr({
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
        res.send({data: generatedUsers});
    }
};

