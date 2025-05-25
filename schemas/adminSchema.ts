import Joi from 'joi';

export const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        "string.email": "Invalid email format.",
        "any.required": "Email is required."
    }),
    password: Joi.string().min(4).required().messages({
        "string.min": "Password must be at least 6 characters long.",
        "any.required": "Password is required."
    })
});

export const createAdminSchema = Joi.object({
    name: Joi.string().required().messages({
        "any.required": "Name is required."
    }),
    email: Joi.string().email().required().messages({
        "string.email": "Invalid email format.",
        "any.required": "Email is required."
    }),
    password: Joi.string().min(4).required().messages({
        "string.min": "Password must be at least 6 characters long.",
        "any.required": "Password is required."
    }),
    phoneNo: Joi.string().optional().messages({
        "string.base": "Phone number must be a string."
    })
});

export const updateAdminSchema = Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().email().optional().messages({
        "string.email": "Invalid email format."
    }),
    phoneNo: Joi.string().optional().messages({
        "string.base": "Phone number must be a string."
    })
});

export const userIdParamSchema = Joi.object({
    id: Joi.string().required().messages({
        "any.required": "User ID is required."
    })
});

export const deleteAdminSchema = Joi.object({
    email: Joi.string().email().required().messages({
        "string.email": "Invalid email format.",
        "any.required": "Email is required."
    })
});

export const createUserSchema = Joi.object({
    name: Joi.string().required().messages({
        "any.required": "Name is required."
    }),
    email: Joi.string().email().required().messages({
        "string.email": "Invalid email format.",
        "any.required": "Email is required."
    }),
    password: Joi.string().min(6).required().messages({
        "string.min": "Password must be at least 6 characters long.",
        "any.required": "Password is required."
    }),
    phoneNo: Joi.string().optional().messages({
        "string.base": "Phone number must be a string."
    })
});

export const updateUserSchema = Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().email().optional().messages({
        "string.email": "Invalid email format."
    }),
    phoneNo: Joi.string().optional().messages({
        "string.base": "Phone number must be a string."
    })
});

export const deleteUserSchema = Joi.object({
    email: Joi.string().email().required().messages({
        "string.email": "Invalid email format.",
        "any.required": "Email is required."
    })
});

export const changePasswordSchema = Joi.object({
    email: Joi.string().email().required().messages({
        "string.email": "Invalid email format.",
        "any.required": "Email is required."
    }),
    oldPassword: Joi.string().min(6).required().messages({
        "string.min": "Old password must be at least 6 characters long.",
        "any.required": "Old password is required."
    }),
    newPassword: Joi.string().min(6).required().messages({
        "string.min": "New password must be at least 6 characters long.",
        "any.required": "New password is required."
    }),
    confirmNewPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
        "any.only": "Passwords do not match.",
        "any.required": "Confirm new password is required."
    })
});
