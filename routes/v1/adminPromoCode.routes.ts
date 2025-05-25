import express from "express";
import { sendError, sendSuccess } from "../../utils/sendResponse";
import { SUCCESS } from "../../constants/success";
import { adminPromoCodeController } from "../../controller/adminPromoCode.controller";
import { Auth } from "../../middlewares/auth";
import { validateRequestBody, validateRequestParams } from "../../schemas";
import { validateCreatePromoCode, validateDeletePromoCodeBody, validateGetByIdPromoCode, validatePromoCodeId, validateUpdatePromoCodeBody } from "../../schemas/adminPromoCodeSchema";

const router = express.Router();

/**
 * @route POST /create
 * @group PromoCode - Operations related to promo codes
 * @param {boolean} isAdmin - Flag indicating if the user is an Admin (Required)
 * @param {boolean} isSuperAdmin - Flag indicating if the user is a SuperAdmin (Required)
 * @param {string} id - The unique ObjectId reference of the Admin or SuperAdmin (Required)
 * @param {string} superAdminEmail - Email of the SuperAdmin (Required if isSuperAdmin is true)
 * @param {object} body - Promo code data (Required)
 * @returns {object} 201 - Promo Code successfully created
 * @returns {object} 400 - Bad request (missing or invalid parameters)
 * @returns {object} 500 - Internal server error
 */
router.post('/create', 
    validateRequestBody(validateCreatePromoCode),
    Auth.validateAccessToken,
    Auth.verifyAdminOrSuperAdmin,
    async(req: any, res: any) => {
        try{
            const data = await adminPromoCodeController.createPromoCode(req.body.isAdmin, req.body.isSuperAdmin, req.body.id, req.body.superAdminEmail, req.body);
            sendSuccess(res, SUCCESS.POST_201_DATA, data);
        }catch(error: any){
            sendError(res, error);
        }
});

/**
 * @route PUT /update/:id
 * @group PromoCode - Operations related to promo codes
 * @param {string} id - The unique ObjectId reference of the promo code to be updated (Required)
 * @param {object} body - Promo code data to be updated (Required)
 * @returns {object} 200 - Promo Code successfully updated
 * @returns {object} 400 - Bad request (missing or invalid parameters)
 * @returns {object} 404 - Promo Code not found
 * @returns {object} 500 - Internal server error
 */
router.put('/update/:id',
    validateRequestParams(validatePromoCodeId),
    validateRequestBody(validateUpdatePromoCodeBody), 
    Auth.validateAccessToken,
    Auth.verifyAdminOrSuperAdmin,
    async(req: any, res: any) => {
        try{
            const data = await adminPromoCodeController.updatePromoCode(req.params.id, req.body);
            sendSuccess(res, SUCCESS.PUT_200_DATA, data);
        }catch(error: any){
            sendError(res, error);
        }
});

/**
 * @route GET /all
 * @group PromoCode - Operations related to promo codes
 * @returns {object} 200 - Successfully retrieved all promo codes
 * @returns {object} 500 - Internal server error
 */
router.get('/all',
    Auth.validateAccessToken,
    Auth.verifyAdminOrSuperAdmin, 
    async(req: any, res: any) => {
        try{
            const data = await adminPromoCodeController.getAllPromoCode();
            sendSuccess(res, SUCCESS.GET_200, data);
        }catch(error: any){
            sendError(res, error);
        }
});

/**
 * @route GET /getById/:id
 * @group PromoCode - Operations related to promo codes
 * @param {string} id - The unique ObjectId reference of the promo code (Required)
 * @returns {object} 200 - Successfully retrieved promo code details
 * @returns {object} 404 - Promo Code not found
 * @returns {object} 500 - Internal server error
 */
router.get('/getById/:id', 
    validateRequestParams(validateGetByIdPromoCode),
    Auth.validateAccessToken,
    Auth.verifyAdminOrSuperAdmin,
    async(req: any, res: any) => {
        try{
            const data = await adminPromoCodeController.getByIdPromoCode(req.params.id);
            sendSuccess(res, SUCCESS.GET_200, data);
        }catch(error: any){
            sendError(res, error);
        }
});

/**
 * @route DELETE /delete/:id
 * @group PromoCode - Operations related to promo codes
 * @param {string} id - The unique ObjectId reference of the promo code to be deleted (Required)
 * @param {string} body.id - The unique ObjectId reference of the Admin or SuperAdmin initiating the delete (Required)
 * @param {boolean} body.isSuperAdmin - Flag indicating if the user is a SuperAdmin (Required)
 * @param {string} body.superAdminEmail - Email of the SuperAdmin (Required if isSuperAdmin is true)
 * @returns {object} 204 - Promo Code successfully deleted
 * @returns {object} 404 - Promo Code not found
 * @returns {object} 500 - Internal server error
 */
router.delete('/delete/:id',
    validateRequestParams(validateGetByIdPromoCode),
    validateRequestBody(validateDeletePromoCodeBody),
    Auth.validateAccessToken,
    Auth.verifyAdminOrSuperAdmin, 
    async(req: any, res: any) => {
        try{
            const data = await adminPromoCodeController.deletePromoCode(req.params.id, req.body.id, req.body.isSuperAdmin, req.body.superAdminEmail);
            sendSuccess(res, SUCCESS.DELETE_204, data);
        }catch(error: any){
            sendError(res, error);
        }
});

export default router;