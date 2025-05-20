import config from "config";
import { DaoFactory } from "../daoLayer";
import * as bcrypt from "bcrypt";
import { createJwtToken } from "../utils/helpers";
import { ISession, IUser, User } from "../models/user";
import { sessionManager } from "../utils/sessionManager";
import { aes } from "../utils/aes";
import { Types } from "mongoose";
import { ERROR } from "../constants/error";

const usersDao = DaoFactory.getDao<IUser>(User);

export const UsersController = {

    /**
    * @route POST /users/create
    * @group Users - Operations related to user management
    * @param name - User's name (min: 3, max: 50 characters)
    * @param email - User's email (must be a valid email format)
    * @param password - User's password (min: 8 characters)
    * @param phoneNo - User's phone number (10 digits)
    * @param role - User role (default: 2 for regular user)
    * @returns {object} 201 - Successfully created user
    * @returns {Error} 400 - User already exists with this email
    * @returns {Error} 500 - Internal Server Error
    */
    signup: async (data: IUser) => {
        const { name, email, password } = data;
        let phoneNo = null;
        if (data?.phoneNo) phoneNo = data.phoneNo

        const existingUser = await usersDao.findOneByFields({ email });
        if (existingUser) {
            throw ERROR.USER_ALREADY_EXIST;
        }

        const encryptedPassword = await bcrypt.hash(password, 10);

        const newUser: IUser = new User({
            name,
            email,
            password: encryptedPassword,
            phoneNo,
            role: 0,
            createdOn: new Date(),
            updatedOn: new Date(),
        });

        const user = await usersDao.create(newUser);

        return user;
    },

    /**
    * @route GET /users/id/:id
    * @group Users - Operations related to user management
    * @param id - User ID
    * @returns {object} 200 - User data retrieved successfully
    * @returns {Error} 500 - Internal Server Error
    */
    getUserById: async (id: Types.ObjectId | string) => {
        const user = await usersDao.findOneById(id);

        if (!user) {
            throw ERROR.USER_DOESNOT_EXISTS;
        }

        return user;
    },

    /**
    * @route GET /users/all
    * @group Users - Operations related to user management
    * @returns {object} 200 - List of all users
    * @returns {Error} 500 - Internal Server Error
    */
    getAllUsers: async () => {
        const users = await usersDao.getAll({});
        if (!users || users.length === 0) {
            throw ERROR.USER_DOESNOT_EXISTS;
        }

        return users;
    },

    /**
    * @route GET /users/me
    * @group Users - Operations related to user management
    * @headers  Authorization - User authentication token
    * @returns {object} 200 - User data retrieved successfully
    * @returns {Error} 500 - Internal Server Error
    */
    getUserByToken: async (token: string) => {

        if (!token) {
            throw ERROR.TOKEN_REQUIRED;
        }
        /**
         * Get the token data from the token
         */
        let tokenData = (await sessionManager.verifyJwtToken(token)) as IUser;
        if (!tokenData || !tokenData.email) {
            throw ERROR.INVALID_TOKEN;
        }

        const user = await usersDao.findOneByFields({ email: tokenData.email });
        if (!user) {
            throw ERROR.USER_DOESNOT_EXISTS;
        }

        return user;
    },

    /**
    * @route POST /users/checkUserPresent
    * @group Users - Operations related to user management
    * @param email - User's email
    * @returns {object} 200 - Boolean result indicating if the user exists
    * @returns {Error} 500 - Internal Server Error
    */
    checkUserPresent: async (email: string) => {
        let user: IUser | null = await usersDao.findOneByFields({ email: email });

        return { result: !!user };
    },

    /**
    * @route POST /users/login
    * @group Users - User authentication
    * @param email - User's email
    * @param password - User's password
    * @returns {object} 200 - Login successful, returns encrypted access token
    * @returns {Error} 401 - Invalid email or password
    * @returns {Error} 500 - Internal Server Error
    */
    login: async (email: string, password: string, ipAddress: string) => {

        const user = (await usersDao.findOneByFields({ email })) as IUser | null;
        if (!user) {
            throw ERROR.USER_DOESNOT_EXISTS;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw ERROR.INCORRECT_EMAIL_PASSWORD;
        }

        const accessToken = createJwtToken({ id: user._id, email: user.email, role: user.role });

        const createdAt = Date.now();
        const expiresAt = createdAt + parseInt(config.get("ACCESS_TOKEN_EXPIRY_TIME"), 10) * 60 * 60 * 1000;

        const newSession: ISession = {
            accessToken,
            ipAddress,
            createdAt,
            expiresAt,
        };

        const existingSession = user.sessions.find(session => session.ipAddress === ipAddress);
        const maxSessions: number = parseInt(config.get('MAXIMUM_ACTIVE_SESSION'));

        if (!existingSession && user.sessions.length >= maxSessions) {
            throw { statusCode: 409, message: `You cannot log in on more than ${maxSessions} devices simultaneously.` };
        }

        if (existingSession) {
            await usersDao.update(
                user._id,
                {
                    $set: {
                        "sessions.$[elem].accessToken": accessToken,
                        "sessions.$[elem].createdAt": createdAt,
                        "sessions.$[elem].expiresAt": expiresAt,
                    },
                },
                {
                    arrayFilters: [{ "elem.ipAddress": ipAddress }],
                    new: true
                }
            );
        } else {
            await usersDao.update(user._id, {
                $push: { sessions: newSession }
            });
        }


        let encryptedAccessToken = accessToken;
        if (config.get('AUTH_VERSION') === 'v2') encryptedAccessToken = await aes.encrypt(accessToken);
        return { encryptedAccessToken };
    },

    /**
    * @route PUT /users/update/:userId
    * @group Users - Operations related to user management
    * @param userId.path.required - User ID
    * @param name.body.optional - User's name (min: 3, max: 50 characters)
    * @param email.body.optional - User's email (must be a valid email format)
    * @param phoneNo.body.optional - User's phone number (10 digits)
    * @param role.body.optional - User role (0 = Regular User, 1 = Admin)
    * @returns {object} 200 - Successfully updated user details
    * @returns {Error} 404 - User not found
    * @returns {Error} 500 - Internal Server Error
    */
    updateUserDetails: async (userId: Types.ObjectId | string, data: IUser) => {
        const { name, email, phoneNo } = data;

        const updatedUser = await usersDao.update(
            userId,
            {
                $set: {
                    ...(name && { name }),
                    ...(email && { email }),
                    ...(phoneNo && { phoneNo }),
                    updatedOn: new Date(),
                },
            },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            throw ERROR.USER_DOESNOT_EXISTS;
        }

        return updatedUser;
    },

    /**
    * @route DELETE /users/delete
    * @group Users - Operations related to user management
    * @param email.body.required - User's email
    * @returns {object} 200 - User deleted successfully
    * @returns {Error} 404 - User not found
    * @returns {Error} 500 - Internal Server Error
    */
    deleteUser: async (email: string) => {
        const deletedUser = await usersDao.delete({ email: email })

        if (!deletedUser) {
            throw ERROR.USER_DOESNOT_EXISTS;
        }
        return { data: true };

    },

/**
 * @route POST users/changePassword
 * @group Authentication - Operations related to user authentication
 * @param {object} body.body - Request body
 * @param {string} body.body.email - User's email address
 * @param {string} body.body.oldPassword - User's current password
 * @param {string} body.body.newPassword - New password to be set
 * @param {string} body.body.confirmNewPassword - Confirmation of the new password
 * @returns {object} 200 - Password changed successfully
 * @throws {Error} 400 - If new passwords do not match
 * @throws {Error} 401 - If old password is incorrect
 * @throws {Error} 404 - If user does not exist
 */
    changePassword: async (data: any) => {
        const user = await usersDao.findOneByFields({ email: data.email });

        if (!user) {
            throw ERROR.USER_DOESNOT_EXISTS;
        }

        const isPasswordValid = await bcrypt.compare(data.oldPassword, user.password);

        if (!isPasswordValid) {
            throw ERROR.INCORRECT_EMAIL_PASSWORD;
        } else {
            if (data.newPassword !== data.confirmNewPassword) {
                throw ({ statusCode: 400, messgae: "New passwords do not match" })
            }

            const encryptedPassword = await bcrypt.hash(data.newPassword, 10);
            await usersDao.update(user._id, { password: encryptedPassword });
        }

        return true;
    }

}