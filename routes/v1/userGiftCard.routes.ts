import express from "express";
import { sendError, sendSuccess } from "../../utils/sendResponse";
import { SUCCESS } from "../../constants/success";
import { userGiftCardController } from "../../controller/userGiftCard.controller";
import { Auth } from "../../middlewares/auth";
import { validateRequestBody } from "../../schemas";
import { applyGiftCardSchema, createGiftCardSchema, getActiveGiftCardSchema, getAllGiftCardSchema } from "../../schemas/userGiftCardSchema";


const router = express.Router();

/**
 * @route POST /create
 * @group GiftCard - Operations related to gift cards
 * @param {boolean} isAdmin - Indicates if the user is an Admin (Optional)
 * @param {boolean} isSuperAdmin - Indicates if the user is a SuperAdmin (Optional)
 * @param {string} id - The unique ObjectId reference of the user (Required)
 * @param {string} superAdminEmail - Email of the SuperAdmin (Optional)
 * @param {string} name - Name of the Gift Card (Required)
 * @param {string} description - Description of the Gift Card (Optional)
 * @param {number} amount - Amount on the Gift Card (Required)
 * @param {string} currencyCode - Currency Code (Enum: [INR, USD, CAD, EUR], Defaults to INR)
 * @param {string} recipientId - The unique ObjectId reference of the recipient (Required)
 * @param {number} expiryTimeStamp - Expiration timestamp in milliseconds (Optional)
 * @returns {object} 201 - Gift Card successfully created
 * @returns {object} 400 - Bad request (missing or invalid parameters)
 * @returns {object} 500 - Internal server error
*/
router.post('/create',
    validateRequestBody(createGiftCardSchema),
    Auth.validateAccessToken,
    async (req: any, res: any) => {
        try {
            const data = await userGiftCardController.createGiftCart(req.body.isAdmin, req.body.isSuperAdmin, req.body.id, req.body.superAdminEmail, req.body);
            sendSuccess(res, SUCCESS.POST_201_DATA, data);
        } catch (error: any) {
            sendError(res, error);
        }
    });

/**
 * @route GET /all
 * @group GiftCard - Operations related to gift cards
 * @param {string} id - The unique ObjectId reference of the user (Required)
 * @param {string} tag - Filter tag (Optional, Enum: [Issue, Received])
 * @returns {object} 200 - List of gift cards
 * @returns {object} 400 - Bad request (missing or invalid parameters)
 * @returns {object} 500 - Internal server error
*/
router.get('/all',
    validateRequestBody(getAllGiftCardSchema),
    Auth.validateAccessToken,
    async (req: any, res: any) => {
        try {
            const data = await userGiftCardController.getAllGiftCard(req.body.id, req.body?.tag);
            sendSuccess(res, SUCCESS.GET_200, data);
        } catch (error: any) {
            sendError(res, error);
        }
    });

/**
 * @route GET /getActiveGiftCard
 * @group GiftCard - Operations related to gift cards
 * @param {string} id - The unique ObjectId reference of the user (Required)
 * @returns {object} 200 - List of active gift cards
 * @returns {object} 400 - Bad request (missing or invalid parameters)
 * @returns {object} 500 - Internal server error
*/
router.get('/getActiveGiftCard',
    validateRequestBody(getActiveGiftCardSchema),
    Auth.validateAccessToken,
    async (req: any, res: any) => {
        try {
            const data = await userGiftCardController.getActiveGiftCard(req.body.id);
            sendSuccess(res, SUCCESS.GET_200, data);
        } catch (error: any) {
            sendError(res, error);
        }
    });

/**
 * @route PUT /applyGiftCard
 * @group GiftCard - Operations related to gift cards
 * @param {string} id - The unique ObjectId reference of the user (Required)
 * @param {string} giftCardId - The unique ObjectId reference of the gift card to be applied (Required)
 * @returns {object} 200 - Gift Card successfully applied
 * @returns {object} 400 - Bad request (missing or invalid parameters or invalid gift card)
 * @returns {object} 404 - Cart or Gift Card not found
 * @returns {object} 500 - Internal server error
*/
router.put('/applyGiftCard',
    validateRequestBody(applyGiftCardSchema),
    Auth.validateAccessToken,
    async (req: any, res: any) => {
        try {
            const data = await userGiftCardController.applyGiftCard(req.body.id, req.body.giftCardId);
            sendSuccess(res, SUCCESS.GET_200, data);
        } catch (error: any) {
            sendError(res, error);
        }
    });

/**
 * @route PUT /removeGiftCard
 * @group GiftCard - Operations related to gift cards
 * @param {string} userId - The unique ObjectId reference of the user (Required)
 * @param {string} giftCardId - The unique ObjectId reference of the gift card to be removed (Required)
 * @returns {object} 200 - Gift Card successfully removed
 * @returns {object} 404 - Gift Card not found
 * @returns {object} 500 - Internal server error
 */
router.put('/removeGiftCard',
    Auth.validateAccessToken,
    async (req: any, res: any) => {
        try {
            const data = await userGiftCardController.removeGiftCard(req.body.userId, req.body.giftCardId);
            sendSuccess(res, SUCCESS.PUT_200_DATA, data);
        } catch (error: any) {
            sendError(res, error);
        }
    });

export default router;