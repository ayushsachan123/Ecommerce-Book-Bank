import auth from 'basic-auth'
import config from 'config'
import { aes } from '../utils/aes';
import { sessionManager } from '../utils/sessionManager';
import { sendError } from '../utils/sendResponse';
import { ERROR } from '../constants/error';

/**
 * @class Auth
 * @description Provides authentication methods including Basic Authentication, JWT validation, and token decryption.
 */
export class Auth {

    /**
     * @description Validates username and password against stored credentials.
     * @param {string} name - Username input.
     * @param {string} pass - Password input.
     * @returns {boolean} - Returns true if credentials match, otherwise false.
     */
    static check(name: string, pass: string): boolean {
        if (name === config.get('userName') && pass === config.get('password')) {
            return true;
        }
        return false;
    }

    /**
     * @description Middleware for handling basic authentication.
     * @param {any} req - Express request object.
     * @param {any} res - Express response object.
     * @param {Function} next - Callback to proceed to the next middleware.
     */
    static async basicAuth(req: any, res: any, next: () => void) {
        const credentials = auth(req);
        /**
         * Check if credentials match stored values
         */
        if (credentials && Auth.check(credentials.name, credentials.pass)) {
            next();
        }
        else {
            // res.status(401).json({message: "Unauthorized Access"});
            sendError(res, ERROR.UNAUTHORIZED_401);
        }
    }

    /**
     * @description Middleware for validating access tokens.
     * @param {any} req - Express request object.
     * @param {any} res - Express response object.
     * @param {Function} next - Callback to proceed to the next middleware.
     */
    static async validateAccessToken(req: any, res: any, next: () => void) {
        const tokenHeaderKey = config.get('TOKEN_HEADER_KEY');
        try {
            /**
             * Extract token from header
             */
            const token = req.header(tokenHeaderKey);
            const tokenData = await sessionManager.verifyJwtToken(token);
            
            req.body.isSuperAdmin = false;
            req.body.isAdmin = false;
            req.body.isAdminOrSuperAdmin = false;
            req.body.id = tokenData.id;
            /**
             * Check token expiry and refresh if necessary
             */
            if(tokenData.role === 2) {
                req.body.isSuperAdmin = true;
                req.body.isAdminOrSuperAdmin = true;
                req.body.superAdminEmail = tokenData.email;
                return next();
            }
            const result: any = await sessionManager.checkTokenExpiry(token);

            if (!result.isValid && !result.refreshToken) {
                sendError(res, ERROR.UNAUTHORIZED_401);
            }

            req.tokenData = tokenData;
            if(tokenData.role === 1) {
                req.body.isAdmin = true;
                req.body.isAdminOrSuperAdmin = true;
            }

            next();

        } catch (error: any) {
            res.status(401).json(error);
        }
    }

    /**
     * @description Middleware for decrypting encrypted access tokens.
     * @param {any} req - Express request object.
     * @param {any} res - Express response object.
     * @param {Function} next - Callback to proceed to the next middleware.
     */

    static async decryptAccessToken(req: any, res: any, next: () => void) {
        if (config.get('AUTH_VERSION') === 'v1') return next();

        try {
            const tokenHeaderKey = config.get<string>('TOKEN_HEADER_KEY');
            const encryptedToken = req.headers[tokenHeaderKey];

            if (!encryptedToken) {
                sendError(res, ERROR.TOKEN_REQUIRED);
            }
            /**
             * Decrypt the token
             */
            const decryptedToken = await aes.decrypt(encryptedToken);
            if (!decryptedToken) {
                sendError(res, ERROR.UNAUTHORIZED_401);
            }
            /**
             * Replace the encrypted token with the decrypted version
             */
            req.headers[tokenHeaderKey] = decryptedToken;

            next();

        } catch (error) {
            sendError(res, ERROR.INTERNAL_SERVER_ERROR_500);
        }
    }

    static async verifyAdminOrSuperAdmin(req: any, res: any, next: () => void) {
        const tokenHeaderKey = config.get('TOKEN_HEADER_KEY');

        try {
            const token = req.header(tokenHeaderKey);
            const tokenData = await sessionManager.verifyJwtToken(token);

            if (!tokenData) {
                return sendError(res, ERROR.UNAUTHORIZED_401);
            }

            req.tokenData = tokenData;
            req.body.isSuperAdmin = false;
            if (tokenData.role === 2) {
                const superAdminList: any = config.get('SUPERADMINS');
                const isSuperAdmin = superAdminList.some((admin: any) => admin.email === tokenData.email);

                if (isSuperAdmin) {
                    req.body.isSuperAdmin = true;
                    req.body.superAdminEmail = tokenData.email;
                    return next();
                }
            }

            if (tokenData.role === 1) {
                return next();
            }

            sendError(res, ERROR.UNAUTHORIZED_401);
        } catch (error: any) {
            return sendError(res, ERROR.INTERNAL_SERVER_ERROR_500);
        }
    }

    static async verifySuperAdmin(req: any, res: any, next: () => void) {
       try{
        if(req.body.isSuperAdmin) return next();

        return sendError(res, ERROR.UNAUTHORIZED_401);

       }catch(error: any){
        return sendError(res, ERROR.INTERNAL_SERVER_ERROR_500);
       }

    }

    static async verifyAdminPermission(req: any, res: any, next: () => void) {
        const tokenHeaderKey = config.get('TOKEN_HEADER_KEY');
        try {
            const token = req.header(tokenHeaderKey);
            const tokenData = await sessionManager.verifyJwtToken(token);
            req.tokenData = tokenData;

            const adminId = tokenData.id;
            const userId = req.body?.id || req.params?.id;

            /**
         * If Super Admin then ByPass the Admin Permission
         */
            if (req.body.isSuperAdmin) return next();

            if (adminId === userId) {
               return next();
            } else {
                sendError(res, ERROR.UNAUTHORIZED_401);
            }

        } catch (error: any) {
            sendError(res, ERROR.INTERNAL_SERVER_ERROR_500);
        }

    }
}
