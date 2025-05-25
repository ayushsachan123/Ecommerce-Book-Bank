import { DaoFactory } from "../daoLayer";
import { verify, JwtPayload } from "jsonwebtoken";
import config from 'config';
import { IUser, User } from "../models/user";
import { createJwtToken } from "./helpers";
import { ERROR } from "../constants/error";

/**
 * @class SessionManager
 * @description Manages user sessions, JWT verification, token expiration checks, and refresh token generation.
 */
class SessionManager {
    userDao;
    constructor() {
        this.userDao = DaoFactory.getDao<IUser>(User);
    }

    /**
     * @description Verifies a JWT token using the configured secret key.
     * @param {string} payload - The JWT token to be verified.
     * @returns {object | string} - Decoded token data if valid, otherwise throws an error.
     */
    async verifyJwtToken(payload: string): Promise<JwtPayload> {
        return (verify(payload, config.get('JWT_SECRET_KEY'))) as JwtPayload;
    }

    /**
     * @description Generates a new refresh token for a user session.
     * @param {string} token - The existing access token.
     * @param {IUser} user - The user object associated with the session.
     * @returns {Promise<{refreshToken: string}>} - The newly generated refresh token.
     */
    async generateRefreshToken(token: any, user: any) : Promise<{refreshToken : string}> {
        const currentTime = Date.now();
        const expiryTime = parseInt(config.get('REFRESH_TOKEN_EXPIRY_TIME'), 10) * 60 * 60 * 1000;
        const expiresAt = currentTime + expiryTime;

        const payload = {
            id: user.id,
            name: user.name,
            email: user.email
        };

        const newRefreshToken = createJwtToken(payload);

        const currentSession = user.sessions.findIndex(
            (sess: { accessToken: string }) => sess.accessToken === token
        );

        if (currentSession === -1) {
            throw ERROR.SESSION_NOT_FOUND;
        }

        user.sessions[currentSession].refreshToken = {
            token: newRefreshToken,
            createdAt: currentTime,
            expiresAt: expiresAt
        };

        await user.save();

        return { refreshToken: newRefreshToken };
    }

   /**
     * @description Checks if a token is expired and handles refresh token logic.
     * @param {string} token - The access token to be checked.
     * @returns {Promise<{isValid: boolean, refreshToken?: string}>} - Object indicating if the token is valid and, if expired, a refresh token if available.
     */
    async checkTokenExpiry(token: any): Promise<{isValid : boolean, refreshToken ?: string }> {
        const payload: any = verify(token, config.get('JWT_SECRET_KEY'));
        const user: IUser | null = await this.userDao.findOneByFields({email:payload.email})

        if (!user) throw ERROR.USER_DOESNOT_EXISTS;

        const currentTime = Date.now();

        const currentSession = user.sessions.find((sess: { accessToken: any }) => sess.accessToken === token);

        if (!currentSession) {
            throw ERROR.TOKEN_NOT_FOUND;
        }
      
        /**
         * If current accessToken is expired
         */
        if (currentSession.expiresAt < currentTime) {

            /**
             * If a refresh token is already present for the current access token
             */
            if (currentSession.refreshToken) {
                /**
                 * If refresh token is expired
                 */
                if (currentSession.refreshToken.expiresAt < currentTime) {
                    return { isValid: false };
                } else {

                    return { isValid: false, refreshToken : currentSession.refreshToken.token }
                }
            }
            else {
                const refreshTokenRequest = await this.generateRefreshToken(token, user);
                return { isValid: false, refreshToken: refreshTokenRequest.refreshToken }
            }
        }

        return {isValid : true}
    }

}

export const sessionManager = new SessionManager();