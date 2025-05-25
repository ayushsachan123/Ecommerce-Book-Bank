import {Schema, model} from "mongoose";

interface IImageProperty{
    name: String,
    imageURL: String
}

export interface IAuthor {
    first_Name: string,
    middle_Name: string,
    last_Name: string,
    age: number,
    country: string,
    images?: Array<IImageProperty>
} 

const imageSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    imageURL: {
        type: String,
        required: true
    }
})

const authorSchema = new Schema({
    first_Name: {
        type: String,
        required: true
    },
    middle_Name: {
        type: String,
    },
    last_Name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    images: {
        type: imageSchema
    }
})

export const Author = model<IAuthor>("Author", authorSchema);