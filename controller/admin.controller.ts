import config from "config";
import { DaoFactory } from "../daoLayer";
import * as bcrypt from "bcrypt";
import { createJwtToken, isSuperAdmin } from "../utils/helpers";
import { ISession, IUser, User } from "../models/user";
import { aes } from "../utils/aes";
import { ERROR } from "../constants/error";
import { Types } from "mongoose";

const usersDao = DaoFactory.getDao<IUser>(User);

export const adminController = {

    /**
    * @route POST /admin/login
    * @group Authentication - User authentication operations
    * @param {string} email - User's email
    * @param {string} password - User's password
    * @param {string} ipAddress - User's IP address
    * @returns {object} 200 - Successfully logged in, returns encrypted access token
    * @returns {Error} 400 - Incorrect email or password
    * @returns {Error} 401 - Unauthorized access
    * @returns {Error} 409 - Maximum active sessions exceeded
    * @returns {Error} 500 - Internal Server Error
    */
    login: async (email: string, password: string, ipAddress: string) => {
        if (!email || !password) {
            throw ERROR.INCORRECT_EMAIL_PASSWORD;
        }

        let accessToken: string | null = null;
        const response = await isSuperAdmin(email, password);
        
        if (response.success) {
            accessToken = createJwtToken({ id: response.superAdminId, email: email, role: 2 });
            // const encryptedAccessToken = await aes.encrypt(accessToken);
            const encryptedAccessToken = accessToken;
            return { encryptedAccessToken };
        }

        const user = (await usersDao.findOneByFields({ email })) as IUser | null;
        if (!user) {
            throw ERROR.USER_DOESNOT_EXISTS;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw ERROR.INCORRECT_EMAIL_PASSWORD;
        }

        if (user.role === 0) throw ERROR.UNAUTHORIZED_401;

        accessToken = createJwtToken({ id: user._id, email: user.email, role: user.role });

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

        // const encryptedAccessToken = await aes.encrypt(accessToken);
        const encryptedAccessToken = accessToken;
        return { encryptedAccessToken };
    },

    /**
    * @route POST /admin/createAdmin
    * @group Admins - Operations related to admin management
    * @param {string} name - Admin's name
    * @param {string} email - Admin's email (must be unique)
    * @param {string} password - Admin's password (min: 8 characters)
    * @param {string} phoneNo - Admin's phone number (optional)
    * @returns {object} 201 - Successfully created admin
    * @returns {Error} 400 - Admin already exists with this email
    * @returns {Error} 500 - Internal Server Error
    */
    createAdmin: async (data: IUser) => {
        const { name, email, password } = data;
        let phoneNo = null;
        if (data.phoneNo) phoneNo = data.phoneNo

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
            role: 1,
            createdOn: new Date(),
            updatedOn: new Date(),
        });

        const user = await usersDao.create(newUser);

        return user;
    },

    /**
    * @route PUT /admin/updateAdmin/:userId
    * @group Admins - Operations related to admin management
    * @param {string} userId - Admin ID
    * @param {string} name - Admin's updated name (optional)
    * @param {string} email - Admin's updated email (optional)
    * @param {string} phoneNo - Admin's updated phone number (optional)
    * @returns {object} 200 - Successfully updated admin details
    * @returns {Error} 404 - Admin does not exist
    * @returns {Error} 500 - Internal Server Error
    */
    updateAdmin: async (userId: Types.ObjectId | string, data: IUser) => {
        const { name, email, phoneNo } = data;

        const updatedUser = await User.findByIdAndUpdate(
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
    * @route GET /admin/getAdmin/:id
    * @group Admins - Operations related to admin management
    * @param {string} id - Admin ID
    * @returns {object} 200 - Successfully retrieved admin details
    * @returns {Error} 404 - Admin does not exist
    * @returns {Error} 500 - Internal Server Error
    */
    getAdminById: async (id: Types.ObjectId | string) => {
        const user = await usersDao.findOneById(id);

        if (!user) {
            throw ERROR.USER_DOESNOT_EXISTS;
        }

        return user;
    },

    /**
    * @route GET /admin/getAllAdmins
    * @group Admins - Operations related to admin management
    * @returns {object} 200 - Successfully retrieved all admins
    * @returns {Error} 404 - No admins found
    * @returns {Error} 500 - Internal Server Error
    */
    getAllAdmins: async () => {
        const users = await usersDao.getAll({});
        if (!users || users.length === 0) {
            throw ERROR.USER_DOESNOT_EXISTS;
        }

        return users;
    },

    /**
    * @route DELETE /admin/deleteAdmin
    * @group Admins - Operations related to admin management
    * @param {string} email - Admin email to delete
    * @returns {object} 200 - Successfully deleted admin
    * @returns {Error} 404 - Admin does not exist
    * @returns {Error} 500 - Internal Server Error
    */
    deleteAdmin: async (email: string) => {
        const deletedUser = await usersDao.delete({ email: email })

        if (!deletedUser) {
            throw ERROR.USER_DOESNOT_EXISTS;
        }
        return { data: true };

    },

    /**
    * @route POST /admin/createUser
    * @group Users - Operations related to user management
    * @param {string} name - User's name
    * @param {string} email - User's email (must be unique)
    * @param {string} password - User's password (min: 8 characters)
    * @param {string} phoneNo - User's phone number (optional)
    * @returns {object} 201 - Successfully created user
    * @returns {Error} 400 - User already exists with this email
    * @returns {Error} 500 - Internal Server Error
    */
    createUser: async (data: IUser) => {
        const { name, email, password } = data;
        let phoneNo = null;
        if (data.phoneNo) phoneNo = data.phoneNo

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
    * @route PUT /admin/updateUser/:userId
    * @group Users - Operations related to user management
    * @param {string} userId - User ID
    * @param {string} name - User's updated name (optional)
    * @param {string} email - User's updated email (optional)
    * @param {string} phoneNo - User's updated phone number (optional)
    * @returns {object} 200 - Successfully updated user details
    * @returns {Error} 404 - User does not exist
    * @returns {Error} 500 - Internal Server Error
    */
    updateUser: async (userId: Types.ObjectId | string, data: IUser) => {
        const { name, email, phoneNo } = data;

        const updatedUser = await User.findByIdAndUpdate(
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
    * @route GET /admin/getUser/:id
    * @group Users - Operations related to user management
    * @param {string} id - User ID
    * @returns {object} 200 - Successfully retrieved user details
    * @returns {Error} 404 - User does not exist
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
    * @route GET /admin/getAllUsers
    * @group Users - Operations related to user management
    * @returns {object} 200 - Successfully retrieved all users
    * @returns {Error} 404 - No users found
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
    * @route DELETE /admin/deleteUsers
    * @group Users - Operations related to user management
    * @param {string} email - User email to delete
    * @returns {object} 200 - Successfully deleted user
    * @returns {Error} 404 - User does not exist
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