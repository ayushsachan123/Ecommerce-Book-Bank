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

export const validateCreatePromoCode = Joi.object({
    isAdmin: Joi.boolean().required(),
    isSuperAdmin: Joi.boolean().required(),
    id: objectId.required(),
    superAdminEmail: Joi.string().email().optional(),
    name: Joi.string().required(),
    description: Joi.string().optional(),
    usageLimit: Joi.number().min(1).required(),
    eligibility: Joi.object({
        categoryId: Joi.array().items(objectId).optional(),
        authorId: Joi.array().items(objectId).optional(),
        minValue: Joi.number().min(0).optional(),
        minItemCount: Joi.number().min(1).optional(),
    }).optional(),
    typeDetail: Joi.object({
        type: Joi.string().valid("value", "percent", "percentage_with_max_value").required(),
        value: Joi.number().optional(),
        percent: Joi.number().optional(),
        percentMaxValue: Joi.object({
            maxValue: Joi.number().required(),
            percent: Joi.number().required()
        }).optional(),
    }).required(),
    expiryTimeStamp: Joi.number().optional(),
    currencyCode: Joi.string().valid("INR", "USD", "CAD", "EUR").default("INR"),
    status: Joi.number().optional(),
});

export const validatePromoCodeId = Joi.object({
    id: objectId.required().messages({
        "any.required": "Promo Code ID is required."
    })
});

export const validateUpdatePromoCodeBody = Joi.object({
    name: Joi.string().optional(),
    description: Joi.string().optional(),
    usageLimit: Joi.number().min(1).optional(),
    eligibility: Joi.object({
        categoryId: Joi.array().items(objectId).optional(),
        authorId: Joi.array().items(objectId).optional(),
        minValue: Joi.number().min(0).optional(),
        minItemCount: Joi.number().min(1).optional(),
    }).optional(),
    typeDetail: Joi.object({
        type: Joi.string().valid("value", "percent", "percentage_with_max_value").optional(),
        value: Joi.number().optional(),
        percent: Joi.number().optional(),
        percentMaxValue: Joi.object({
            maxValue: Joi.number().optional(),
            percent: Joi.number().optional()
        }).optional(),
    }).optional(),
    expiryTimeStamp: Joi.number().optional(),
    currencyCode: Joi.string().valid("INR", "USD", "CAD", "EUR").optional(),
    status: Joi.number().optional(),
});

export const validateGetByIdPromoCode = Joi.object({
    id: objectId.required().messages({
        "any.required": "Promo Code ID is required."
    })
});

export const validateDeletePromoCodeBody = Joi.object({
    id: objectId.required().messages({
        "any.required": "Admin or SuperAdmin ID is required."
    }),
    isSuperAdmin: Joi.boolean().required().messages({
        "any.required": "SuperAdmin flag is required."
    }),
    superAdminEmail: Joi.string().email().when('isSuperAdmin', {
        is: true,
        then: Joi.required(),
        otherwise: Joi.optional()
    }).messages({
        "any.required": "SuperAdmin email is required when isSuperAdmin is true."
    })
});
