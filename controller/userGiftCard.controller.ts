import { Types, Model } from "mongoose";
import { DaoFactory } from "../daoLayer";
import { GiftCard, IGiftCard } from "../models/giftCard";
import { IUser, User } from "../models/user";
import config from "config";
import { Cart, ICart } from "../models/cart";
import { cartManager } from "../utils/cartManager";

const giftCardDao = DaoFactory.getDao<IGiftCard>(GiftCard);
const userDao = DaoFactory.getDao<IUser>(User);
const cartDao = DaoFactory.getDao<ICart>(Cart);

export const userGiftCardController = {

   /**
    * @route POST /create
    * @group GiftCard - Operations related to user gift cards
    * @param {boolean} isAdmin - Indicates if the issuer is an admin
    * @param {boolean} isSuperAdmin - Indicates if the issuer is a super admin
    * @param {string} userId - The unique ObjectId reference of the issuer (Required)
    * @param {string} superAdminEmail - Email of the super admin (Required if isSuperAdmin is true)
    * @param {object} data - Gift card details
    * @param {string} data.name - Name of the gift card (Required)
    * @param {string} data.description - Description of the gift card (Optional)
    * @param {number} data.amount - Amount of the gift card (Required)
    * @param {string} data.recipientId - ObjectId of the recipient (Required)
    * @param {string} data.currencyCode - Currency code (e.g., INR, USD, CAD, EUR)
    * @returns {object} 201 - Gift card successfully created
    * @returns {object} 400 - Bad request (missing or invalid parameters)
    * @returns {object} 404 - Issuer or recipient not found
    * @returns {object} 500 - Internal server error
   */
   createGiftCart: async (isAdmin: boolean, isSuperAdmin: boolean, userId: Types.ObjectId, superAdminEmail: string, data: IGiftCard) => {
      if (!isSuperAdmin) {
         const issuerExists = await userDao.findOneById(userId);
         if (!issuerExists) throw { statusCode: 404, message: "Issuer not found" };
      }

      if (!data.recipientId) {
         throw { statusCode: 400, message: "Recipient ID is required" };
      }

      const recipientExists = await userDao.findOneById(data.recipientId);
      if (!recipientExists) throw { statusCode: 404, message: "Recipient not found" };

      const expiryDays = parseInt(config.get('giftCardExpiryDays'));
      const expiryTimeStamp = Date.now() + expiryDays * 24 * 60 * 60 * 1000;

      const giftCardData = { ...data, expiryTimeStamp };

      if (isSuperAdmin) {
         giftCardData.issuerId = {
            userType: "SuperAdmin",
            email: superAdminEmail
         }
      } else if (isAdmin) {
         giftCardData.issuerId = {
            id: userId,
            userType: "Admin"
         }
      } else {
         giftCardData.issuerId = {
            id: userId,
            userType: "User"
         }
      }

      const newGiftCard = new GiftCard(giftCardData);
      const giftCard = await giftCardDao.create(newGiftCard);

      return giftCard;
   },

   /**
    * @route GET /all
    * @group GiftCard - Operations related to user gift cards
    * @param {string} userId - The unique ObjectId reference of the user (Required)
    * @param {string} tag - Filter for issued gift cards ('Issue')
    * @returns {object} 200 - List of gift cards
    * @returns {object} 400 - Bad request (missing parameters)
    * @returns {object} 500 - Internal server error
   */
   getAllGiftCard: async (userId: Types.ObjectId, tag?: string) => {
      if (!userId) {
         throw { statusCode: 400, message: "User ID is required" };
      }

      let field: Record<string, any> = { recipentId: userId };

      if (tag && tag === 'Issue') {
         field = { "issuerId": { id: userId } }
      }

      const giftCards = await giftCardDao.getAll(field);

      return giftCards;
   },

   /**
    * @route GET /getActiveGiftCard
    * @group GiftCard - Operations related to user gift cards
    * @param {string} userId - The unique ObjectId reference of the user (Required)
    * @returns {object} 200 - List of active gift cards
    * @returns {object} 400 - Bad request (missing parameters)
    * @returns {object} 500 - Internal server error
   */
   getActiveGiftCard: async (userId: Types.ObjectId) => {
      if (!userId) {
         throw { statusCode: 400, message: "User ID is required" };
      }

      const field = { recipentId: userId, "expiryTimeStamp": { $gt: Date.now() }, isRedeemed: false };
      const giftCards = await giftCardDao.getAll(field);

      return giftCards;
   },

   /**
    * @route PUT /applyGiftCard
    * @group GiftCard - Operations related to user gift cards
    * @param {string} userId - The unique ObjectId reference of the user (Required)
    * @param {string} giftCardId - The unique ObjectId reference of the gift card (Required)
    * @returns {object} 200 - Successfully applied gift card with updated price details
    * @returns {object} 400 - Gift card expired or already redeemed
    * @returns {object} 404 - Gift card or cart not found
    * @returns {object} 500 - Internal server error
   */
   applyGiftCard: async (userId: Types.ObjectId, giftCardId: Types.ObjectId) => {
      const giftCard = await giftCardDao.findOneById(giftCardId);

      if (!giftCard) {
         throw { statusCode: 404, message: "Gift Card not found" };
      }

      if (giftCard.isRedeemed) {
         throw { statusCode: 400, message: "Gift Card has already been redeemed" };
      }

      if (giftCard.expiryTimeStamp && giftCard.expiryTimeStamp < Date.now()) {
         throw { statusCode: 400, message: "Gift Card has expired" };
      }

      const cartModel = cartDao.getModel() as Model<ICart>;

      let cart: ICart | null = await cartModel.findOne({ userId: userId })
         .populate({
            path: "products.bookId addressId",
            select: "-deletedBy -createdAt -updatedAt -__v "
         });

      if (!cart) {
         throw { statusCode: 404, message: "Cart Not found" };
      }

      const field = { userId: userId };
      await cartDao.update(field,
         {
            $set: {
               giftCardId: giftCardId
            }
         },
         { new: true, runValidators: true }
      )

      cart = await cartModel.findOne({ userId: userId })
         .populate({
            path: "products.bookId addressId",
            select: "-deletedBy -createdAt -updatedAt -__v "
         });

      if (!cart) {
         throw { statusCode: 404, message: "Cart Not found" };
      }

      const priceBreakup = cartManager.getPayableAmount(cart);

      return priceBreakup;
   },

/**
 * @route PUT /removeGiftCard
 * @group cart - Operations related to cart and checkout
 * @param {string} userId - The unique ObjectId reference of the user (Required)
 * @param {string} giftCardId - The unique ObjectId reference of the gift card to be removed (Required)
 * @description Removes a gift card from the user's cart and recalculates the payable amount.
 * @returns {object} 200 - Successfully removed gift card and updated payable amount
 * @returns {object} 404 - Gift Card or Cart not found
 * @returns {object} 400 - Bad request (invalid parameters or missing required data)
 * @returns {object} 500 - Internal server error
 */
   removeGiftCard: async (userId: Types.ObjectId, giftCardId: Types.ObjectId) => {
      const giftCardFields = { _id: giftCardId, status: 1 };
      const giftCard = await giftCardDao.findOneByFields(giftCardFields);

      if (!giftCard) {
         throw { statusCode: 404, message: "Gift Card not found" };
      }

      const cartModel = cartDao.getModel() as Model<ICart>;
      let cart: ICart | null = await cartModel.findOne({ userId: userId })
         .populate({
            path: "products.bookId addressId",
            select: "-deletedBy -createdAt -updatedAt -__v "
         });

      if (!cart) {
         throw { statusCode: 404, message: "Cart Not found" };
      }

      const field = { userId: userId };
      await cartDao.update(field,
         {
            $unset: {
               giftCardId: true
            }
         },
         { new: true, runValidators: true }
      )

      cart = await cartModel.findOne({ userId: userId })
         .populate({
            path: "products.bookId addressId",
            select: "-deletedBy -createdAt -updatedAt -__v "
         });

      if (!cart) {
         throw { statusCode: 404, message: "Cart Not found" };
      }

      const payableAmount = await cartManager.getPayableAmount(cart);

      return payableAmount;
   }

}