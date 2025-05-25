import { Schema, Types, Document, model } from "mongoose";

export interface IProducts {
    bookId: Types.ObjectId,
    quantity: number
}

export interface ICart extends Document {
    userId: Types.ObjectId,
    addressId: Types.ObjectId,
    delivery: {
        date: number,
        day: number,
        time: number
    },
    products: IProducts[],
    currencyCode: string,
    tip: number,
    giftCardId: Types.ObjectId,
    promoCodeId:Types.ObjectId,
    createdAt: Date,
    updatedAt: Date
}

const productSchema = new Schema({
    bookId: {
        type: Types.ObjectId,
        ref: "Book",
        required: true
    },
    quantity: {
        type: Number,
        default: 1,
        min: [1, "Quantity must be positive"],
        required: true,
    }
})

const cartSchema = new Schema({
    userId: {
        type: Types.ObjectId,
        unique: true,
        ref: "User",
        required: true
    },
    addressId: {
        type: Types.ObjectId,
        ref: "Address",
        // required: true
    },
    delivery: {
        date: {
            type: Number,
            // required: true
        },
        day: {
            type: Number,
            // required: true
        },
        time: {
            type: Number,
            // required: true
        }
    },
    products: [productSchema],
    currencyCode: {
        type: String,
        enum: ["INR", "USD", "CAD", "EUR"],
        default: "INR"
    },
    tip: {
        type: Number,
        min: [0, "Tip must be positive"],
        default: 0
    },
    giftCardId: {
        type: Types.ObjectId
    },
    promoCodeId: {
        type: Types.ObjectId
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

export const Cart = model<ICart>("Cart", cartSchema);