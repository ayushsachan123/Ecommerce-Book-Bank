import Joi from "joi";
import { Types } from "mongoose";

// Custom validation for MongoDB ObjectId
const objectId = Joi.string()
    .custom((value, helpers) => {
        if (!Types.ObjectId.isValid(value)) {
            return helpers.error("any.invalid");
        }
        return value;
    }, "ObjectId validation")
    .messages({
        "any.invalid": "Invalid ObjectId format.",
    });

// Schema for product items inside the cart
const productSchema = Joi.object({
    bookId: objectId.required().messages({
        "any.required": "Book ID is required.",
    }),
    quantity: Joi.number().integer().min(1).required().messages({
        "number.base": "Quantity must be a number.",
        "number.integer": "Quantity must be an integer.",
        "number.min": "Quantity must be at least 1.",
        "any.required": "Quantity is required.",
    }),
});

// Schema for adding books to the cart
export const addToCartSchema = Joi.object({
    userId: objectId.required(),
    addressId: objectId.optional(),
    products: Joi.array().items(productSchema).min(1).required().messages({
        "array.base": "Products must be an array.",
        "array.min": "At least one product is required.",
        "any.required": "Products are required.",
    }),
    currencyCode: Joi.string().valid("INR", "USD", "CAD", "EUR").optional().messages({
        "string.base": "Currency code must be a string.",
        "any.only": "Currency code must be one of [INR, USD, CAD, EUR].",
    }),
    tip: Joi.number().min(0).optional().messages({
        "number.base": "Tip must be a number.",
        "number.min": "Tip must be at least 0.",
    }),
});

// Schema for removing books from the cart
export const removeFromCartSchema = Joi.object({
    userId: objectId.required(),
    products: Joi.array().items(
        Joi.object({
            bookId: objectId.required(),
            quantity: Joi.number().integer().min(1).optional(),
        })
    ).min(1).required().messages({
        "array.base": "Products must be an array.",
        "array.min": "At least one product is required.",
        "any.required": "Products are required.",
    }),
});

// Schema for getting cart details
export const getCartSchema = Joi.object({
    id: objectId.required(),
});

// Schema for clearing the cart
export const clearCartSchema = Joi.object({
    userId: objectId.required(),
});
