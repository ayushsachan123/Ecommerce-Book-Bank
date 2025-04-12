
const ERROR_CODES = {
    400: 400,
    401: 401,
    403: 403,
    404: 404,
    409: 409,
    429: 429,
    500: 500,
    503: 503
};

export const ERROR = Object.freeze({

    //User
    ACCOUNT_BLOCKED: {
        statusCode: ERROR_CODES[401],
        message: 'Your account has been blocked. Please contact admin'
    },
    USER_DOESNOT_EXISTS: {
        statusCode: ERROR_CODES[404],
        message: 'User does not exist'
    },
    USER_ALREADY_EXIST : {
        statusCode : ERROR_CODES[400],
        message : "User Already exists."
    },
    INAVLID_STATUS: {
        statusCode: ERROR_CODES[404],
        message: 'Invalid status'
    },
    VALIDATION_ERROR_400: {
        statusCode: ERROR_CODES[400],
        message: 'Validation errors in your request',
        errors: [] 
    },
    INTERNAL_SERVER_ERROR_500: {
        statusCode: ERROR_CODES[500],
        message: 'Internal server error',
        errors: []
    },
    UNAUTHORIZED_401: {
        statusCode: ERROR_CODES[401],
        message: 'Unauthorized Access'
    },
    INVALID_OTP: {
        statusCode: ERROR_CODES[403],
        message: 'Invalid OTP!'
    },
    LOGIN_SESSION_EXPIRED_401: {
        statusCode: ERROR_CODES[401],
        type: 'SESSION_EXPIRED',
        message: 'Your login session is expired! Please login again.'
    },
    PHONE_ALREADY_EXISTS: {
        statusCode: ERROR_CODES[403],
        type: 'PHONE_ALREADY_EXISTS',
        message: 'Phone number already exists.'
    },
    INCORRECT_EMAIL_PASSWORD : {
        statusCode :ERROR_CODES[401],
        message : "Invalid email or password"
    }, 
    ADMIN_UNAUTHORIZED : {
        statusCode : ERROR_CODES[401],
        message : "Only admin can perform this task"
    },
    EMAIL_CANNOT_BE_UPDATED : {
        statusCode : ERROR_CODES[400],
        message : "Email cannot be updated."
    },
    INVALID_TOKEN : {
        statusCode : ERROR_CODES[403],
        message : "Invalid token."
    },
    TOKEN_REQUIRED : {
        statusCode : ERROR_CODES[401],
        message : "Token is required."
    },
    SESSION_NOT_FOUND : {
        statusCode : ERROR_CODES[404],
        message : "Session not found for the provided token."
    },
    TOKEN_NOT_FOUND : {
        statusCode : ERROR_CODES[404],
        message : "Token not found."
    },

    //Book
    BOOK_ALREADY_EXIST : {
        statusCode : ERROR_CODES[400],
        message : "Book Already exists."
    },
    BOOK_DOESNOT_EXISTS: {
        statusCode: ERROR_CODES[404],
        message: 'Book does not exist'
    },
})