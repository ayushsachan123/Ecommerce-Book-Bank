import {Schema, model, Document} from "mongoose";

export interface ICategory extends Document {
    name: string,
    description: string,
    image: string[]
}

const categorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: [String],
        required: true
    }
})

export const Category = model<ICategory>("Category", categorySchema);