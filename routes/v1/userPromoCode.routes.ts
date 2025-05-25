import express from "express";
import { sendError, sendSuccess } from "../../utils/sendResponse";
import { SUCCESS } from "../../constants/success";
import { userPromoCodeController } from "../../controller/userPromoCode.controller";
import { Auth } from "../../middlewares/auth";
import { validateRequestBody } from "../../schemas";
import { validateApplyPromoCode, validateGetPromoCodeSuggestion, validateRemovePromoCode } from "../../schemas/userPromoCodeSchema";

const router = express.Router();

/**
 * @route PUT /applyPromoCode
 * @group PromoCode - Operations related to promo codes
 * @param {string} userId - The unique ObjectId reference of the user (Required)
 * @param {string} promoCodeId - The unique ObjectId reference of the promo code to be applied (Required)
 * @returns {object} 200 - Promo Code successfully applied
 * @returns {object} 400 - Bad request (missing or invalid parameters or invalid promo code)
 * @returns {object} 404 - Cart or Promo Code not found
 * @returns {object} 500 - Internal server error
 */
router.put('/applyPromoCode',
    validateRequestBody(validateApplyPromoCode), 
    Auth.validateAccessToken,
    async(req: any, res: any) => {
        try{
            const data = await userPromoCodeController.applyPromoCode(req.body.userId, req.body.promoCodeId);
            sendSuccess(res, SUCCESS.PUT_200_DATA, data);
        }catch(error: any){
            sendError(res, error);
        }
});

/**
 * @route GET /getSuggestion
 * @group PromoCode - Operations related to promo codes
 * @param {string} id - The unique ObjectId reference of the user (Required)
 * @returns {object} 200 - Successfully retrieved promo code suggestions
 * @returns {object} 400 - Bad request (missing or invalid parameters)
 * @returns {object} 404 - No suggestions found for the user
 * @returns {object} 500 - Internal server error
 */
router.get('/getSuggestion', 
    validateRequestBody(validateGetPromoCodeSuggestion),
    Auth.validateAccessToken,
    async(req: any, res: any) => {
        try{
            const data = await userPromoCodeController.getPromoCodeSuggestion(req.body.id);
            sendSuccess(res, SUCCESS.GET_200, data);
        }catch(error: any){
            sendError(res, error);
        }
});

/**
 * @route PUT /removePromoCode
 * @group PromoCode - Operations related to promo codes
 * @param {string} userId - The unique ObjectId reference of the user (Required)
 * @param {string} promoCodeId - The unique ObjectId reference of the promo code to be removed (Required)
 * @returns {object} 200 - Promo Code successfully removed
 * @returns {object} 400 - Bad request (missing or invalid parameters)
 * @returns {object} 404 - Promo Code not found or not applied
 * @returns {object} 500 - Internal server error
 */
router.put('/removePromoCode', 
    validateRequestBody(validateRemovePromoCode),
    Auth.validateAccessToken,
    async(req: any, res: any) => {
        try{
            const data = await userPromoCodeController.removePromoCode(req.body.userId, req.body.promoCodeId);
            sendSuccess(res, SUCCESS.PUT_200_DATA, data);
        }catch(error: any){
            sendError(res, error);
        }
});

export default router;