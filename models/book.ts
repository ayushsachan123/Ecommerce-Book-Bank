import { Schema, model, Types } from 'mongoose';

interface IImageProperty {
    name: String,
    imageURL: String
}

interface IDescription {
    short: string,
    long: string
}

export interface IDeletedBy {
    role: "Admin" | "SuperAdmin";
    id: Types.ObjectId;
    email: string;
}

export interface IBook {
    _id: Types.ObjectId | string;
    author: Types.ObjectId;
    title: String | { $regex: RegExp };
    description: IDescription;
    price?: Number;
    edition?: Types.ObjectId;
    images?: Array<IImageProperty>;
    category?: Types.ObjectId;
    pages?: Number;
    status: Number;
    deletedBy?: IDeletedBy;
    maxQuantity?: number;
    // createdAt: Date;
}

const descriptionSchema = new Schema({
    short: {
        type: String,
    },
    long: {
        type: String,
    }
})

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

export const bookSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: Types.ObjectId,
        ref: "Author",
        // required: true
    },
    description: {
        type: descriptionSchema,
        // required: true
    },
    price: {
        type: Number,
        require: true
    },
    edition: {
        type: Types.ObjectId,
        ref: "Edition",
        // required: true
    },
    images: {
        type: Array<typeof imageSchema>
    },
    category: {
        type: Array<Types.ObjectId>,
        ref: "Category",
        //  required: true
    },
    pages: {
        type: Number
    },
    status: {
        type: Number,
        default: 1
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
    maxQuantity: {
        type: Number,
        // required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

export const Book = model<IBook>("Book", bookSchema);
