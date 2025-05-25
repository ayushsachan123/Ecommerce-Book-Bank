import express from 'express';
import { adminController } from '../../controller/admin.controller';
import { Auth } from '../../middlewares/auth';
import { sendError, sendSuccess } from '../../utils/sendResponse';
import { SUCCESS } from '../../constants/success';
import { changePasswordSchema, createAdminSchema, createUserSchema, deleteAdminSchema, deleteUserSchema, loginSchema, updateAdminSchema, userIdParamSchema } from '../../schemas/adminSchema';
import { validateRequestBody, validateRequestParams } from '../../schemas';

const router = express.Router();

/**
 * @route POST /admin/login
 * @group Authentication - User authentication operations
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @description Authenticate a user and generate an access token
 */
router.post(
    '/login',
    validateRequestBody(loginSchema),
    async (req, res) => {
        try {
            let ipAddress: string = req.socket.remoteAddress ?? "N/A";
            if (ipAddress === "::1") ipAddress = "127.0.0.1";

            const data = await adminController.login(req.body.email, req.body.password, ipAddress);
            sendSuccess(res, SUCCESS.LOGIN_SUCCESSFULL, data);
        } catch (error: any) {
            sendError(res, error);
        }
    }
);

/**
 * @route POST /admin/createAdmin
 * @group Admins - Operations related to admin management
 * @param {object} body - Admin details
 * @param {string} body.name - Admin's name
 * @param {string} body.email - Admin's email
 * @param {string} body.password - Admin's password
 * @param {string} [body.phoneNo] - Admin's phone number (optional)
 * @security Admin or Super Admin access required
 * @description Create a new admin account
 */
router.post(
    '/createAdmin',
    validateRequestBody(createAdminSchema),
    Auth.verifyAdminOrSuperAdmin,
    Auth.verifySuperAdmin,
    async (req: any, res: any) => {
        try {
            const data = await adminController.createAdmin(req.body);
            sendSuccess(res, SUCCESS.PUT_200_DATA, data);
        } catch (error: any) {
            sendError(res, error);
        }
    });

/**
 * @route PUT /admin/updateAdmin/{userId}
 * @group Admins - Operations related to admin management
 * @param {string} userId - Admin's unique identifier
 * @param {object} body - Updated admin details
 * @param {string} [body.name] - Admin's updated name (optional)
 * @param {string} [body.email] - Admin's updated email (optional)
 * @param {string} [body.phoneNo] - Admin's updated phone number (optional)
 * @security Admin or Super Admin access required
 * @description Update an existing admin's details
 */
router.put(
    '/updateAdmin/:userId',
    validateRequestParams(userIdParamSchema),
    validateRequestBody(updateAdminSchema),
    Auth.verifyAdminOrSuperAdmin,
    Auth.verifyAdminPermission,
    async (req: any, res: any) => {
        try {
            const userId = req.params.userId;
            const data = await adminController.updateAdmin(userId, req.body);
            sendSuccess(res, SUCCESS.PUT_200_DATA, data);
        } catch (error: any) {
            sendError(res, error);
        }
    });

/**
 * @route GET /admin/getAdmin/{id}
 * @group Admins - Operations related to admin management
 * @param {string} id - Admin's unique identifier
 * @security Admin or Super Admin access required
 * @description Retrieve an admin's details by ID
 */
router.get(
    '/getAdmin/:id',
    validateRequestParams(userIdParamSchema),
    Auth.verifyAdminOrSuperAdmin,
    Auth.verifyAdminPermission,
    async (req: any, res: any) => {
        try {
            const data = await adminController.getAdminById(req.params.id);
            sendSuccess(res, SUCCESS.PUT_200_DATA, data);
        } catch (error: any) {
            sendError(res, error);
        }
    });

/**
 * @route GET /admin/getAllAdmins
 * @group Admins - Operations related to admin management
 * @security Super Admin access required
 * @description Retrieve all registered admins
 */
router.get(
    '/getAllAdmins',
    Auth.verifyAdminOrSuperAdmin,
    Auth.verifySuperAdmin,
    async (req: any, res: any) => {
        try {
            const data = await adminController.getAllAdmins();
            sendSuccess(res, SUCCESS.PUT_200_DATA, data);
        } catch (error: any) {
            sendError(res, error);
        }
    });

/**
 * @route DELETE /admin/deleteAdmin
 * @group Admins - Operations related to admin management
 * @param {string} email - Admin's email
 * @security Admin or Super Admin access required
 * @description Delete an admin account by email
 */
router.delete(
    '/deleteAdmin',
    validateRequestBody(deleteAdminSchema),
    Auth.verifyAdminOrSuperAdmin,
    Auth.verifyAdminPermission,
    async (req: any, res: any) => {
        try {
            const data = await adminController.deleteAdmin(req.body.email);
            sendSuccess(res, SUCCESS.PUT_200_DATA, data);
        } catch (error: any) {
            sendError(res, error);
        }
    });

/**
 * @route POST /admin/createUser
 * @group Users - Operations related to user management
 * @param {object} body - User details
 * @param {string} body.name - User's name
 * @param {string} body.email - User's email
 * @param {string} body.password - User's password
 * @param {string} [body.phoneNo] - User's phone number (optional)
 * @security Admin or Super Admin access required
 * @description Create a new user account
 */
router.post(
    '/createUser',
    validateRequestBody(createUserSchema),
    Auth.verifyAdminOrSuperAdmin,
    async (req: any, res: any) => {
        try {
            const data = await adminController.createUser(req.body);
            sendSuccess(res, SUCCESS.PUT_200_DATA, data);
        } catch (error: any) {
            sendError(res, error);
        }
    });

/**
 * @route PUT /admin/updateUser/{userId}
 * @group Users - Operations related to user management
 * @param {string} userId - User's unique identifier
 * @param {object} body - Updated user details
 * @param {string} [body.name] - User's updated name (optional)
 * @param {string} [body.email] - User's updated email (optional)
 * @param {string} [body.phoneNo] - User's updated phone number (optional)
 * @security Admin or Super Admin access required
 * @description Update an existing user's details
 */
router.put(
    '/updateUser/:userId',
    validateRequestParams(userIdParamSchema),
    validateRequestBody(createUserSchema),
    Auth.verifyAdminOrSuperAdmin,
    async (req: any, res: any) => {
        try {
            const userId = req.params.userId;
            const data = await adminController.updateUser(userId, req.body);
            sendSuccess(res, SUCCESS.PUT_200_DATA, data);
        } catch (error: any) {
            sendError(res, error);
        }
    });

/**
 * @route GET /admin/getUser/{id}
 * @group Users - Operations related to user management
 * @param {string} id - User's unique identifier
 * @security Admin or Super Admin access required
 * @description Retrieve a user's details by ID
 */
router.get(
    '/getUser/:id',
    validateRequestParams(userIdParamSchema),
    Auth.verifyAdminOrSuperAdmin,
    async (req: any, res: any) => {
        try {
            const data = await adminController.getUserById(req.params.id);
            sendSuccess(res, SUCCESS.PUT_200_DATA, data);
        } catch (error: any) {
            sendError(res, error);
        }
    });

/**
 * @route GET /admin/getAllUsers
 * @group Users - Operations related to user management
 * @security Admin or Super Admin access required
 * @description Retrieve all registered users
 */
router.get(
    '/getAllUsers',
    Auth.verifyAdminOrSuperAdmin,
    async (req: any, res: any) => {
        try {
            const data = await adminController.getAllUsers();
            sendSuccess(res, SUCCESS.PUT_200_DATA, data);
        } catch (error: any) {
            sendError(res, error);
        }
    });

/**
 * @route DELETE /admin/deleteUsers
 * @group Users - Operations related to user management
 * @param {string} email - User's email
 * @security Admin or Super Admin access required
 * @description Delete a user account by email
 */
router.delete(
    '/deleteUsers',
    validateRequestBody(deleteUserSchema),
    Auth.verifyAdminOrSuperAdmin,
    async (req: any, res: any) => {
        try {
            const data = await adminController.deleteUser(req.body.email);
            sendSuccess(res, SUCCESS.PUT_200_DATA, data);
        } catch (error: any) {
            sendError(res, error);
        }
    });

/**
 * @route POST users/changePassword
 * @group users - Operations related to the user management
 * @param {string} email - User's email (must provide the email)
 * @param {string} oldPassword - User's old password
 * @param {string} newPassword - User's new password
 * @param {string} confirmNewPassword - User's new password
 */
router.put(
    '/changePassword',
    validateRequestBody(changePasswordSchema),
    Auth.verifyAdminOrSuperAdmin,
    async (req: any, res: any) => {
        try {
            const data = await adminController.changePassword(req.body.data);
            sendSuccess(res, SUCCESS.PUT_200_DATA, data);
        } catch (error: any) {
            sendError(req, error);
        }
    });

export default router;