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

export const validateApplyPromoCode = Joi.object({
    userId: objectId.required().messages({
        "any.required": "User ID is required."
    }),
    promoCodeId: objectId.required().messages({
        "any.required": "Promo Code ID is required."
    })
});

export const validateGetPromoCodeSuggestion = Joi.object({
    id: objectId.required().messages({
        "any.required": "User ID is required."
    })
});

export const validateRemovePromoCode = Joi.object({
    userId: objectId.required().messages({
        "any.required": "User ID is required."
    }),
    promoCodeId: objectId.required().messages({
        "any.required": "Promo Code ID is required."
    })
});
