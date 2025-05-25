import {Types, model, Schema, Document} from "mongoose";

export interface IDeletedBy {
    role: "Admin" | "SuperAdmin";
    id: Types.ObjectId;
    email: string;
}

export interface IGiftCard extends Document {
    name: string;
    description: string;
    amount: number;
    issuerId: {
        id?: Types.ObjectId,
        userType: "User" | "Admin" | "SuperAdmin",
        email?: string 
    };
    recipientId: Types.ObjectId;
    currencyCode: string;
    status: number,
    expiryTimeStamp?: number;
    isRedeemed: boolean;
    redeemedAt?: number;
    deletedBy?: IDeletedBy;
    createdAt: Date;
    updatedAt: Date;
}

const giftCardSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String
    },
    amount: {
        type: Number,
        min: [0, "It must be positive"],
        required: true
    },
    issuerId: {
        id: {
            type: Types.ObjectId
        },
        userType: {
            type: String,
            enum: ["User", "Admin", "SuperAdmin"],
            required: true
        },
        email: {
            type: String
        }
    },
    recipientId: {
        type: Types.ObjectId,
        required: true
    },
    currencyCode: {
        type: String,
        enum: ["INR", "USD", "CAD", "EUR"],
        default: "INR"
    },
    status: {
        type: Number,
        default: 1
    },
    expiryTimeStamp: {
        type: Number
    },
    isRedeemed: {
        type: Boolean,
        default: false
    },
    redeemedAt: {
        type: Number
    },
    deletedBy: {
        role: {
            type: String,
            enum: ['Admin', 'SuperAdmin'],
            // required: true
        },
        adminId: {
            type: Types.ObjectId,
            ref: "User",
        },
        email: {
            type: String,
            // required: true
        }
    },
    createdAt :{
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

export const GiftCard = model<IGiftCard>("GiftCard", giftCardSchema);