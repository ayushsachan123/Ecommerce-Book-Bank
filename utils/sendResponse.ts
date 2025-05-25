
export const sendSuccess = (res: any, response: {statusCode: number, message: string, data?: any}, data?: any) => {
    return res.status(response.statusCode).json({
        statusCode: response.statusCode,
        message: response.message,
        data: data ? data : null
    });
};

export const sendError = (res: any, error: any) => {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    return res.status(statusCode).json({
        statusCode: statusCode,
        message: message
    });
};