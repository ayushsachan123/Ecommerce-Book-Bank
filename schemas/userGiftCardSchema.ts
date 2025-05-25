import Joi from "joi";
import { Types } from "mongoose";

// Custom validation for ObjectId
const objectId = Joi.string()
    .custom((value, helpers) => {
        if (!Types.ObjectId.isValid(value)) {
            return helpers.error("any.invalid");
        }
        return value;
    }, "ObjectId validation")
    .messages({
        "any.invalid": "Invalid ObjectId format."
    });

// Schema for /create route
export const createGiftCardSchema = Joi.object({
    isAdmin: Joi.boolean().optional(),
    isSuperAdmin: Joi.boolean().optional(),
    id: objectId.required().messages({ "any.required": "User ID is required." }),
    superAdminEmail: Joi.string().email().optional(),
    name: Joi.string().required().messages({ "any.required": "Gift Card name is required." }),
    description: Joi.string().optional(),
    amount: Joi.number().min(1).required().messages({
        "number.base": "Amount must be a number.",
        "number.min": "Amount must be at least 1.",
        "any.required": "Amount is required."
    }),
    currencyCode: Joi.string().valid("INR", "USD", "CAD", "EUR").default("INR"),
    recipientId: objectId.required().messages({ "any.required": "Recipient ID is required." }),
    expiryTimeStamp: Joi.number().optional()
});

// Schema for /all route
export const getAllGiftCardSchema = Joi.object({
    id: objectId.required().messages({ "any.required": "User ID is required." }),
    tag: Joi.string().valid("Issue", "Received").optional()
});

// Schema for /getActiveGiftCard route
export const getActiveGiftCardSchema = Joi.object({
    id: objectId.required().messages({ "any.required": "User ID is required." })
});

// Schema for /applyGiftCard route
export const applyGiftCardSchema = Joi.object({
    id: objectId.required().messages({ "any.required": "User ID is required." }),
    giftCardId: objectId.required().messages({ "any.required": "Gift Card ID is required." })
});
