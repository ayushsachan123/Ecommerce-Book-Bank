import { Types, model, Schema, Document } from "mongoose";

export interface IDeletedBy {
    role: "Admin" | "SuperAdmin";
    id: Types.ObjectId;
    email: string;
}

export interface IEligibility {
    categoryId?: Array<Types.ObjectId>;
    authorId?: Array<Types.ObjectId>;
    minValue?: number;
    minItemCount?: number;
}

export interface ITypeDetail {
    type: "value" | "percent" | "percentage_with_max_value";
    percent?: number;
    value?: number;
    percentMaxValue?: {
        maxValue: number;
        percent: number;
    }
}

export interface IUsages {
    userId: Types.ObjectId;
    count: number
}

export interface IPromoCode extends Document {
    name: string;
    description?: string;
    usageLimit: number;
    eligibility: IEligibility;
    typeDetail: ITypeDetail;
    expiryTimeStamp?: number;
    currencyCode: string;
    issuerId: {
        id?: Types.ObjectId,
        userType: "Admin" | "SuperAdmin",
        email?: string
    };
    usages?: Array<IUsages>;
    status: number;
    deletedBy?: IDeletedBy;
    createdAt: Date;
    updatedAt: Date;
}

const promoCodeSchema = new Schema<IPromoCode>(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        description: {
            type: String,
            required: false,
        },
        usageLimit: {
            type: Number,
        },
        eligibility: {
            categoryId: [{
                type: Types.ObjectId,
                ref: "Category"
            }],
            authorId: [{
                type: Types.ObjectId,
                ref: "Author"
            }],
            minValue: {
                type: Number,
                required: false
            },
            minItemCount: {
                type: Number,
                required: false
            }
        },
        typeDetail: {
            type: {
                type: String,
                enum: ["value", "percent", "percentage_with_max_value"],
                required: true
            },
            value: {
                type: Number,
            },
            percent: {
                type: Number,
            },
            percentMaxValue: {
                maxValue: {
                    type: Number,
                },
                percent: {
                    type: Number,
                }
            }
        },
        expiryTimeStamp: {
            type: Number,
            required: false
        },
        currencyCode: {
            type: String,
            enum: ["INR", "USD", "CAD", "EUR"],
            default: "INR"
        },
        issuerId: {
            id: {
                type: Types.ObjectId,
                ref: "User"
            },
            userType: {
                type: String,
                enum: ["Admin", "SuperAdmin"],
                required: true
            },
            email: {
                type: String,
                required: false
            }
        },
        usages: [
            {
                userId: {
                    type: Types.ObjectId,
                    ref: "User",
                    required: true
                },
                count: {
                    type: Number,
                    required: true,
                    default: 0
                }
            }
        ],
        status: {
            type: Number,
            default: 1
        },
        deletedBy: {
            role: {
                type: String,
                enum: ["Admin", "SuperAdmin"],
                required: false
            },
            id: {
                type: Types.ObjectId,
                ref: "User",
                required: false
            },
            email: {
                type: String,
                required: false
            }
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

export const PromoCode = model<IPromoCode>("PromoCode", promoCodeSchema);