import {Schema, model, Types} from 'mongoose';
import { USER_ROLES } from '../constants/userRoles';

export interface IRefreshToken {
   token: string;
   createdAt: number;
   expiresAt: number;
}

export interface ISession {
   accessToken: string;
   refreshToken?: IRefreshToken;
   ipAddress: string,
   createdAt: number;
   expiresAt: number;
}

export interface IUser {
   _id ?:Types.ObjectId | string | undefined;
   name: string,
   email: string,
   password: string,
   phoneNo?: number,
   role: number,
   sessions: ISession[],
   createdOn: Date,
   updatedOn: Date
}

const refreshSchema = new Schema({
      token: {
         type: String,
      },
      createdAt:{
         type: Number
      },
      expiresAt: {
         type: Number
      }
});

const sessionSchema = new Schema({
    accessToken:{
      type: String,
      // required: true
    },
    refreshToken: refreshSchema,
    ipAddress: {
      type: String,
      // required: true
    },
    createdAt: {
      type: Number,
      // required: true
    },
    expiresAt: {
      type: Number,
      // required: true
   }
})

export const userSchema = new Schema({
   name:{
    type: String,
    required: true
   },
   email:{
    type: String,
    required: true
   },
   password: {
    type: String,
    required: true
   },
   phoneNo:{
    type: Number,
    required: true
   },
   role: {
    type: Number, 
    default: USER_ROLES.USER
   },
   sessions: {
     type: [sessionSchema],
   //   required: true
   },
   createdOn:{
    type: Date,
    default: Date.now,
   },
   updatedOn:{
    type: Date,
    default: Date.now
   }
});

export const User = model<IUser>('User', userSchema);