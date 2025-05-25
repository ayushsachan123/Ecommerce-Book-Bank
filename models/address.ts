import { Types, model, Document, Schema } from "mongoose";

export interface IAddress extends Document {
    userId: Types.ObjectId;
    country: string;
    recepientName: string;
    phones: [
        {
            countryCode: string,
            phoneNumber: string
        }
    ];
    houseNo: string;
    city: string;
    landmark?: string;
    pincode: number;
    state: string;
    tag: "Home" | "Office" | string;
}

const addressSchema = new Schema({
    userId: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    },
    country: {
        type: String,
        required: true
    },
    recepientName: {
        type: String,
        required: true
    },
    phones: [
        {
            countryCode: {
                type: String,
            },
            phoneNumber: {
                type: String
            }
        }
    ],
    houseNo: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    landmark: {
        type: String
    },
    pincode: {
        type: Number,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    tag: {
        type: String,
        enum: {
            values: ["Home", "Office"],
            message: "Tag must be either 'Home', 'Office', or a custom value",
        },
        default: "Home"
    }
});

export const Address = model<IAddress>("Address", addressSchema);