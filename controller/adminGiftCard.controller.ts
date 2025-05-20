import { Types } from "mongoose";
import { DaoFactory } from "../daoLayer";
import { GiftCard, IGiftCard } from "../models/giftCard";
import { IUser, User } from "../models/user";
import { GIFTCART_STATUS } from "../constants/constants";

const giftCardDao = DaoFactory.getDao<IGiftCard>(GiftCard);
const userDao = DaoFactory.getDao<IUser>(User);

export const adminGiftCardController = {

/**
 * @route PUT /updateGiftCard
 * @group GiftCard - Admin operations on gift cards
 * @param {string} giftId - The unique ObjectId of the gift card (Required)
 * @param {string} name - The name of the gift card (Optional)
 * @param {string} description - Description of the gift card (Optional)
 * @param {number} amount - Amount associated with the gift card (Optional)
 * @param {string} recipientId - The unique ObjectId of the recipient (Optional)
 * @param {number} expiryTimeStamp - Expiry timestamp in days (Optional)
 * @returns {object} 200 - Gift card successfully updated
 * @returns {object} 400 - Bad request (invalid parameters)
 * @returns {object} 404 - Gift card or recipient not found
 * @returns {object} 500 - Internal server error
*/
    updateGiftCart: async (giftId: Types.ObjectId, updates: Partial<IGiftCard>) => {

        if (updates.recipientId) {
            const recipientExists = await userDao.findOneById(updates.recipientId);
            if (!recipientExists) throw { statusCode: 404, message: "Recipient not found" };
        }

        const existingGiftCard = await giftCardDao.findOneById(giftId);

        if (!existingGiftCard) {
            throw { statusCode: 404, message: "No Gift Card found" };
        }

        const updateFields: Record<string, any> = {
            ...(updates.name && { name: updates.name }),
            ...(updates.description && { description: updates.description }),
            ...(updates.amount && { amount: updates.amount }),
            ...(updates.recipientId && { recipientId: updates.recipientId }),
        };

        if (updates.expiryTimeStamp) {
            updateFields.expiryTimeStamp = Date.now() + updates.expiryTimeStamp * 24 * 60 * 60 * 1000;
        }

        const updatedGiftCard = await giftCardDao.update(
            giftId,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        return updatedGiftCard;
    },

/**
 * @route GET /getAllGiftCards
 * @group GiftCard - Admin operations on gift cards
 * @returns {object} 200 - List of gift cards
 * @returns {object} 500 - Internal server error
*/
    getAllGiftCard: async () => {
        const giftCard = await giftCardDao.getAll({});

        return giftCard;
    },

/**
 * @route GET /getGiftCardById
 * @group GiftCard - Admin operations on gift cards
 * @param {string} giftId - The unique ObjectId of the gift card (Required)
 * @returns {object} 200 - Gift card details
 * @returns {object} 404 - Gift card not found
 * @returns {object} 500 - Internal server error
*/
    getById: async (giftId: Types.ObjectId) => {
        const giftCard = await giftCardDao.findOneById(giftId);

        if (!giftCard) {
            throw { statusCode: 404, message: "No Gift Card Found" };
        }

        return giftCard;
    },

/**
 * @route DELETE /deleteGiftCard
 * @group GiftCard - Admin operations on gift cards
 * @param {string} giftCardId - The unique ObjectId of the gift card (Required)
 * @param {string} adminId - The unique ObjectId of the admin deleting the gift card (Optional)
 * @param {boolean} isSuperAdmin - Boolean flag to indicate if the user is a SuperAdmin (Required)
 * @param {string} superAdminEmail - Email of the SuperAdmin performing the delete action (Required if isSuperAdmin is true)
 * @returns {object} 200 - Gift card successfully deleted
 * @returns {object} 404 - Gift card not found
 * @returns {object} 500 - Internal server error
*/
    deleteGiftCard: async (giftCardId: Types.ObjectId | string, adminId: Types.ObjectId | null, isSuperAdmin: boolean, superAdminEmail: string | null) => {
        if (isSuperAdmin) {
            const deletedGiftCard = await giftCardDao.update(giftCardId, {
                status: GIFTCART_STATUS.DELETED, deletedBy: {
                    role: "SuperAdmin",
                    email: superAdminEmail
                }
            })

            return deletedGiftCard;
        }

        const deletedGiftCard = await giftCardDao.update(giftCardId, {
            status: GIFTCART_STATUS.DELETED, deletedBy: {
                role: "Admin",
                adminId: adminId
            }
        });

        if (!deletedGiftCard) throw {statsCode: 404, message: "giftCard not found"};

        return deletedGiftCard;
    }
}