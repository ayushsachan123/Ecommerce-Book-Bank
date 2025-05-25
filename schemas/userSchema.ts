import {Joi} from 'celebrate'

/**
 * @constant
 * @type {ObjectSchema}
 * 
 * @property {string} email - User's email (required).
 * @property {string} oldPassword - User's old password (required, min 4 characters).
 * @property {string} newPassword - New password (required, min 4 characters, must contain at least one uppercase letter, one lowercase letter, one number, and one special character).
 * @property {string} confirmNewPassword - Confirmation of the new password (must match `newPassword`).
 */
export const ChangePasswordSchema: Joi.ObjectSchema = Joi.object({
    email: Joi.string().required()
    .messages({
      'string.base': 'Email of the user must be a string.',
      'string.email': 'Please enter a valid email address.',
      'string.empty': 'Email of the user is empty.',
      'any.required': 'Email is required.',
    }),

    oldPassword: Joi.string().min(4).required().messages({
      'string.base': 'Old password must be a string.',
      'string.empty': 'Old password is required.',
      'string.min': 'Old password must be at least 4 characters long.',
      'any.required': 'Old password is required.',
    }),

    newPassword: Joi.string().min(4)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{4,}$/).required()
      .messages({
        'string.base': 'Password must be a string.',
        'string.empty': 'Password cannot be empty.',
        'string.min': 'Password must be at least 4 characters long.',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
        'any.required': 'Password is required.',
      }),
  
    confirmNewPassword: Joi.string()
      .valid(Joi.ref('newPassword')).required().messages({
        'string.base': 'Confirm password must be a string.',
        'string.empty': 'Confirm password cannot be empty.',
        'any.required': 'Confirm password is required.',
        'any.only': 'Confirm password must match the new password.',
      }),
  });

/**
 * @constant
 * @type {ObjectSchema}
 * 
 * @property {string} email - User's email (required).
 */
export const CheckUserPresentSchema: Joi.ObjectSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.base': 'Email must be a string.',
        'string.email': 'Please enter a valid email address.',
        'any.required': 'Email is required.'
    })
});

/**
 * @constant
 * @type {ObjectSchema}
 * 
 * @property {string} name - User's name (required, min 3 characters, max 30 characters).
 * @property {string} email - User's email (required).
 * @property {string} password - User's password (required, min 4 characters, must contain uppercase, lowercase, number, and special character).
 * @property {number} phoneNo - User's phone number (optional, exactly 10 digits).
 * @property {number} role - User role (required, either 0 or 1).
 */
  export const CreateUserSchema: Joi.ObjectSchema = Joi.object({
      name: Joi.string().min(3).max(30).required().messages({
          'string.base': 'Name must be a string.',
          'string.min': 'Name must be at least 3 characters long.',
          'string.max': 'Name must be no more than 30 characters long.',
          'any.required': 'Name is required.'
      }),
      email: Joi.string().email().required().messages({
          'string.base': 'Email must be a string.',
          'string.email': 'Please enter a valid email address.',
          'any.required': 'Email is required.'
      }),
      password: Joi.string().min(4).required().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{4,}$/).messages({
          'string.base': 'Password must be a string.',
          'string.min': 'Password must be at least 4 characters long.',
          'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character.',
          'any.required': 'Password is required.'
      }),
      phoneNo: Joi.number().min(1000000000).max(9999999999).optional().messages({
          'number.base': 'Phone number must be a valid number.',
          'number.min': 'Phone number must be 10 digits long.',
          'number.max': 'Phone number must be no more than 10 digits long.',
      }),
      role: Joi.number().valid(0, 1).required().messages({
          'number.base': 'Role must be a number.',
          'any.required': 'Role is required.',
          'any.only': 'Role must be either 0 or 1.'
      })
  });
  
/**
 * @constant
 * @type {ObjectSchema}
 * 
 * @property {string} email - User's email (required, must be a valid email address).
 * @property {string} password - User's password (required, must be at least 4 characters long).
 */
  export const LoginSchema: Joi.ObjectSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.base': 'Email must be a string.',
        'string.email': 'Please enter a valid email address.',
        'any.required': 'Email is required.'
    }),
    password: Joi.string().min(4).required().messages({
        'string.base': 'Password must be a string.',
        'string.min': 'Password must be at least 4 characters long.',
        'any.required': 'Password is required.'
    })
});

/**
 * @constant
 * @type {ObjectSchema}
 *
 * @property {string} name - User's name (optional, must be between 3-30 characters).
 * @property {string} email - User's email (optional, must be a valid email address).
 * @property {number} phoneNo - User's phone number (optional, must be exactly 10 digits).
 * @property {number} role - User's role (optional, must be either 0 or 1).
 */
  export const UpdateUserDetailsSchema: Joi.ObjectSchema = Joi.object({
    updates: Joi.object().keys({
        name: Joi.string().min(3).max(30).optional().messages({
            'string.base': 'Name must be a string.',
            'string.min': 'Name must be at least 3 characters.',
            'string.max': 'Name can be at most 30 characters.'
        }),
        email: Joi.string().email().optional().messages({
            'string.base': 'Email must be a string.',
            'string.email': 'Please enter a valid email address.'
        }),
        phoneNo: Joi.number().min(1000000000).max(9999999999).optional().messages({
            'number.base': 'Phone number must be a valid number.',
            'number.min': 'Phone number must be 10 digits long.',
            'number.max': 'Phone number must be 10 digits long.'
        }),
        role: Joi.number().valid(0, 1).optional().messages({
            'number.base': 'Role must be a number.',
            'any.only': 'Role must be either 0 or 1.'
        })
    }).min(1) 
});

/**
 * @constant
 * @type {ObjectSchema}
 * 
 * @property {string} email - User's email (required, must be a valid email address).
 */
export const DeleteUserSchema: Joi.ObjectSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.base': 'Email must be a string.',
        'string.email': 'Please enter a valid email address.',
        'string.empty': 'Email is required.',
        'any.required': 'Email is required.'
    })
});