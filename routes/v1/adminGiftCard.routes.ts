import express from "express";
import { sendError, sendSuccess } from "../../utils/sendResponse";
import { SUCCESS } from "../../constants/success";
import { adminGiftCardController } from "../../controller/adminGiftCard.controller";
import { Auth } from "../../middlewares/auth";
import { validateRequestBody } from "../../schemas";
import { validateDeleteGiftCard, validateGetById, validateUpdateGiftCard } from "../../schemas/adminGiftCardSchema";

const router = express.Router();

/**
* @route PUT /updateGiftCart
* @group GiftCard - Admin operations on gift cards
* @param {string} giftId - The unique ObjectId of the gift card (Required)
* @param {string} name - Updated name of the gift card (Optional)
* @param {string} description - Updated description of the gift card (Optional)
* @param {number} amount - Updated amount of the gift card (Optional)
* @param {string} recipientId - The ObjectId of the recipient user (Optional)
* @param {number} expiryTimeStamp - The expiry duration in days (Optional)
* @returns {object} 200 - Gift card updated successfully
* @returns {object} 400 - Bad request (invalid parameters)
* @returns {object} 404 - Gift card or recipient not found
* @returns {object} 500 - Internal server error
*/
router.put('/update/:id',
    validateRequestBody(validateUpdateGiftCard),
    Auth.validateAccessToken,
    Auth.verifyAdminOrSuperAdmin,
    async (req: any, res: any) => {
        try {
            const data = await adminGiftCardController.updateGiftCart(req.body.giftCardId, req.body);
            sendSuccess(res, SUCCESS.PUT_200_DATA, data);
        } catch (error: any) {
            sendError(res, error);
        }
    });

/**
* @route GET /getAllGiftCard
* @group GiftCard - Admin operations on gift cards
* @returns {object} 200 - List of gift cards retrieved successfully
* @returns {object} 500 - Internal server error
*/
router.get('/getAllGiftCard',
    Auth.validateAccessToken,
    Auth.verifyAdminOrSuperAdmin,
    async (req: any, res: any) => {
        try {
            const data = await adminGiftCardController.getAllGiftCard();
            sendSuccess(res, SUCCESS.GET_200, data);
        } catch (error: any) {
            sendError(res, error);
        }
    });

/**
* @route GET /getById/{giftId}
* @group GiftCard - Admin operations on gift cards
* @param {string} giftId - The unique ObjectId of the gift card (Required)
* @returns {object} 200 - Gift card details retrieved successfully
* @returns {object} 404 - Gift card not found
* @returns {object} 500 - Internal server error
*/
router.get('/id/:id',
        validateRequestBody(validateGetById),
        Auth.validateAccessToken,
        Auth.verifyAdminOrSuperAdmin,
        async (req: any, res: any) => {
            try {
                const data = await adminGiftCardController.getById(req.params.id);
                sendSuccess(res, SUCCESS.GET_200, data);
            } catch (error: any) {
                sendError(res, error);
            }
        });

/**
* @route DELETE /deleteGiftCard
* @group GiftCard - Admin operations on gift cards
* @param {string} giftCardId - The unique ObjectId of the gift card to delete (Required)
* @param {string} [adminId] - The ObjectId of the admin performing the deletion (Optional, required for non-superadmin)
* @param {boolean} isSuperAdmin - Whether the request is from a SuperAdmin (Required)
* @param {string} [superAdminEmail] - Email of the SuperAdmin (Required if isSuperAdmin is true)
* @returns {object} 200 - Gift card deleted successfully
* @returns {object} 400 - Bad request (invalid parameters)
* @returns {object} 404 - Gift card not found
* @returns {object} 500 - Internal server error
*/
router.delete('/delete/:id',
    validateRequestBody(validateDeleteGiftCard),
    Auth.validateAccessToken,
    Auth.verifyAdminOrSuperAdmin,    
    async (req: any, res: any) => {
        try {
            const data = await adminGiftCardController.deleteGiftCard(req.body.giftCardId, req.body.adminId, req.body.isSuperAdmin, req.body.superAdminEmail);
            sendSuccess(res, SUCCESS.DELETE_204, data);
        } catch (error: any) {
            sendError(res, error);
        }
    });

export default router;