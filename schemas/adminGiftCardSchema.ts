import Joi from "joi";
import { Types } from "mongoose";

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

export const validateUpdateGiftCard = Joi.object({
    giftCardId: objectId.required().messages({
        "any.required": "Gift Card ID is required."
    }),
    name: Joi.string().optional(),
    description: Joi.string().optional(),
    amount: Joi.number().min(0).optional(),
    recipientId: objectId.optional(),
    expiryTimeStamp: Joi.number().optional()
});

export const validateGetById = Joi.object({
    id: objectId.required().messages({
        "any.required": "Gift Card ID is required."
    })
});

export const validateDeleteGiftCard = Joi.object({
    giftCardId: objectId.required().messages({
        "any.required": "Gift Card ID is required."
    }),
    adminId: objectId.optional(),
    isSuperAdmin: Joi.boolean().required(),
    superAdminEmail: Joi.string().email().optional()
});
