import { DaoFactory } from "../daoLayer";
import { IPromoCode, PromoCode } from "../models/promoCode";
import { Types } from "mongoose";
import { IUser, User } from "../models/user";
import { PROMOCODE_STATUS } from "../constants/constants";

const userDao = DaoFactory.getDao<IUser>(User);
const promoCodeDao = DaoFactory.getDao<IPromoCode>(PromoCode);

export const adminPromoCodeController = {

    /**
     * @route POST /createPromoCode
     * @group PromoCode - Operations related to promotional codes
     * @param {boolean} isAdmin - Indicates if the requester is an Admin (Required)
     * @param {boolean} isSuperAdmin - Indicates if the requester is a SuperAdmin (Required)
     * @param {string} userId - The unique ObjectId reference of the Admin or SuperAdmin (Required)
     * @param {string} superAdminEmail - The email of the SuperAdmin (Required if isSuperAdmin is true)
     * @param {string} name - The name of the promo code (Required)
     * @param {string} description - A short description of the promo code (Optional)
     * @param {number} usageLimit - Maximum number of times the promo code can be used (Required)
     * @param {object} eligibility - Conditions required to use the promo code (Optional)
     * @param {array} eligibility.categoryId - Array of eligible category IDs (Optional)
     * @param {array} eligibility.authorId - Array of eligible author IDs (Optional)
     * @param {number} eligibility.minValue - Minimum order value required (Optional)
     * @param {number} eligibility.minItemCount - Minimum number of items required in the order (Optional)
     * @param {object} typeDetail - Details about the promo code type (Required)
     * @param {string} typeDetail.type - The type of promo code ("value", "percent", or "percentage_with_max_value")
     * @param {number} typeDetail.value - Fixed discount value (if applicable)
     * @param {number} typeDetail.percent - Discount percentage (if applicable)
     * @param {object} typeDetail.percentMaxValue - Maximum discount limit for percentage-based promo codes (Optional)
     * @param {number} typeDetail.percentMaxValue.maxValue - Maximum discount value allowed (Optional)
     * @param {number} typeDetail.percentMaxValue.percent - Percentage discount value (Optional)
     * @param {number} expiryTimeStamp - Expiry timestamp for the promo code (Optional)
     * @param {string} currencyCode - Currency code for the promo code (e.g., "INR", "USD") (Required)
     * @returns {object} 201 - Promo Code successfully created
     * @returns {object} 404 - Admin or SuperAdmin not found
     * @returns {object} 500 - Internal server error
     */
    createPromoCode: async (isAdmin: boolean, isSuperAdmin: boolean, userId: Types.ObjectId, superAdminEmail: string, data: IPromoCode) => {

        if (!isSuperAdmin) {
            const issuerExists = await userDao.findOneById(userId);
            if (!issuerExists) throw { statusCode: 404, message: "Admin not found" };
        }

        let promoCodeData = data;
        console.log(data);
        if (isSuperAdmin) {
            promoCodeData.issuerId = {
                userType: "SuperAdmin",
                email: superAdminEmail
            }
        } else if (isAdmin) {
            promoCodeData.issuerId = {
                id: userId,
                userType: "Admin"
            }
        }

        const newPromoCode = new PromoCode(promoCodeData);
        const promoCode = await promoCodeDao.create(newPromoCode);

        return promoCode;
    },

    /**
     * @route PUT /updatePromoCode
     * @group PromoCode - Operations related to Promo Codes
     * @param {string} promoCodeId - The unique ObjectId reference of the Promo Code to be updated (Required)
     * @param {object} updates - The fields to be updated in the Promo Code (Required)
     * @param {string} updates.name - Updated name of the Promo Code (Optional)
     * @param {string} updates.description - Updated description of the Promo Code (Optional)
     * @param {number} updates.usageLimit - Updated usage limit for the Promo Code (Optional)
     * @param {object} updates.eligibility - Updated eligibility criteria (Optional)
     * @param {object} updates.typeDetail - Updated type details such as discount type and value (Optional)
     * @param {number} updates.expiryTimeStamp - Updated expiry timestamp (Optional)
     * @param {string} updates.currencyCode - Updated currency code (Optional)
     * @returns {object} 200 - Promo Code successfully updated
     * @returns {object} 404 - Promo Code not found
     * @returns {object} 500 - Internal server error
    */
    updatePromoCode: async (promoCodeId: Types.ObjectId, updates: Partial<IPromoCode>) => {

        const existingPromoCode = await promoCodeDao.findOneById(promoCodeId);

        if (!existingPromoCode) {
            throw { statusCode: 404, message: "No Promo Code found" };
        }

        const updatedGiftCard = await promoCodeDao.update(
            promoCodeId,
            { $set: updates },
            { new: true, runValidators: true }
        );

        return updatedGiftCard;
    },

    /**
     * @route GET /getAllPromoCode
     * @group PromoCode - Operations related to Promo Codes
     * @description Fetches all existing Promo Codes.
     * @returns {object} 200 - List of all Promo Codes
     * @returns {object} 500 - Internal server error
    */
    getAllPromoCode: async () => {
        const promoCode = await promoCodeDao.getAll({});

        return promoCode;
    },

    /**
     * @route GET /getByIdPromoCode/:id
     * @group PromoCode - Operations related to Promo Codes
     * @param {string} id - The unique ObjectId reference of the Promo Code to be retrieved (Required)
     * @description Fetches a specific Promo Code by its ID.
     * @returns {object} 200 - Promo Code details retrieved successfully
     * @returns {object} 404 - Promo Code not found
     * @returns {object} 500 - Internal server error
    */
    getByIdPromoCode: async (promoCodeId: Types.ObjectId) => {
        const promoCode = await promoCodeDao.findOneById(promoCodeId);

        if (!promoCode) {
            throw { statusCode: 404, message: "No Promo Code Found" };
        }

        return promoCode;
    },

    /**
     * @route DELETE /deletePromoCode/:id
     * @group PromoCode - Operations related to Promo Codes
     * @param {string} promoCodeId - The unique ObjectId reference of the Promo Code to be deleted (Required)
     * @param {string} adminId - The unique ObjectId reference of the Admin performing the deletion (Required if not a SuperAdmin)
     * @param {boolean} isSuperAdmin - Flag indicating if the requester is a SuperAdmin (Required)
     * @param {string} superAdminEmail - Email address of the SuperAdmin performing the deletion (Required if isSuperAdmin is true)
     * @description Soft deletes a Promo Code by changing its status to DELETED.
     * @returns {object} 200 - Promo Code successfully deleted
     * @returns {object} 404 - Promo Code not found
     * @returns {object} 500 - Internal server error
    */
    deletePromoCode: async (promoCodeId: Types.ObjectId | string, adminId: Types.ObjectId | null, isSuperAdmin: boolean, superAdminEmail: string | null) => {
        if (isSuperAdmin) {
            const deletedPromoCode = await promoCodeDao.update(promoCodeId, {
                status: PROMOCODE_STATUS.DELETED, deletedBy: {
                    role: "SuperAdmin",
                    email: superAdminEmail
                }
            })

            return deletedPromoCode;
        }
        const deletedPromoCode = await promoCodeDao.update(promoCodeId, {
            status: PROMOCODE_STATUS.DELETED, deletedBy: {
                role: "Admin",
                id: adminId
            }
        });

        if (!deletedPromoCode) throw { statsCode: 404, message: "Promo Code not found" };

        return deletedPromoCode;
    }
}