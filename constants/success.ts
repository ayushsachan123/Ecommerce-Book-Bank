const SUCCESS_CODES = {
    200: 200,
    201: 201,
    204: 204
};

export const SUCCESS = Object.freeze({
    // GET response
    GET_200: {
        statusCode: SUCCESS_CODES[200],
        message: 'Success'
    },
    GET_200_DATA: {
        statusCode: SUCCESS_CODES[200],
        message: 'Success',
        data: null 
    },
    // POST response
    POST_201: {
        statusCode: SUCCESS_CODES[201],
        message: 'The item was created successfully.'
    },
    POST_201_DATA: {
        statusCode: SUCCESS_CODES[201],
        message: 'Inserted',
        response: null 
    },
    //PUT response
    PUT_200_DATA: {
        statusCode: SUCCESS_CODES[200],
        message: 'Updated',
        response: null
    },
    PUT_204: {
        statusCode: SUCCESS_CODES[204],
        message: 'Updated'
    },
    //PATCH response
    PATCH_200_DATA: {
        statusCode: SUCCESS_CODES[200],
        message: 'Updated',
        response: null 
    },
    PATCH_204: {
        statusCode: SUCCESS_CODES[204],
        message: 'Updated'
    },
    // DELETE response
    DELETE_204: {
        statusCode: SUCCESS_CODES[204],
        message: 'Deleted'
    },
    EMAIL_SUCCESS: {
        statusCode: 200,
        message: 'Please check your email',
        response: {}
    },
    LOGIN_SUCCESSFULL : {
        statusCode : SUCCESS_CODES[200],
        message : 'Logged in successfully!'
    },
    NOT_FOUND : {
        statusCode : SUCCESS_CODES[204],
        message : 'Resource not found'
    }
});


export const SUCCESS_MESSAGE = {
    SUCCESS: "SUCCESS"
}