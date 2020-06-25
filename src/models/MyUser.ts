import { AuthToken } from "./User";
import * as mongoose from "mongoose";

export type MyUserDocument = mongoose.Document & {
    email: string;
    password: string;
    passwordResetToken: string;
    passwordResetExpires: Date;
    facebook: string;
    name: string;
    firstName: string;
    lastName: string;
    gender: string;
    country: string;
    city: string;
    zip: string;
    address: string;
    lat: string;
    long: string;
    website: string;
    ip: string;
    company: string;
    cardType: string;
    cardNumber: number;
    cardExp: string;
}

const myUserSchema = new mongoose.Schema({
    email: String,
    password: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    facebook: String,
    name: String,
    firstName: String,
    lastName: String,
    gender: String,
    country: String,
    city: String,
    zip: String,
    address: String,
    lat: String,
    long: String,
    website: String,
    ip: String,
    company: String,
    cardType: String,
    cardNumber: Number,
    cardExp: String
    }, { timestamps: true });

export const MyUser = mongoose.model<MyUserDocument>("myUser", myUserSchema);
