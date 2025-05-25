import {Schema, model, Document} from "mongoose";

export interface IEdition extends Document{
    ageGroup: number,
    language: string
}

const editionSchema = new Schema({
     ageGroup:{
        type: Number,
        required: true
     },
     language:{
        type: String,
        required: true
     }
});

export const Edition = model<IEdition>("Edition", editionSchema);