import { DaoFactory } from "../daoLayer";
import { IPromoCode, PromoCode } from "../models/promoCode";
import { Types, Model } from "mongoose";
import { IUser, User } from "../models/user";
import { Cart, ICart } from "../models/cart";
import { cartManager } from "../utils/cartManager";
import { promoCodeManager } from "../utils/promoCodeManager";

const userDao = DaoFactory.getDao<IUser>(User);
const promoCodeDao = DaoFactory.getDao<IPromoCode>(PromoCode);
const cartDao = DaoFactory.getDao<ICart>(Cart);

export const userPromoCodeController = {

/**
 * @route POST /applyPromoCode
 * @group promoCode - Operations related to promo codes
 * @param {string} userId - The unique ObjectId reference of the user (Required)
 * @param {string} promoCodeId - The unique ObjectId reference of the promo code (Required)
 * @description Applies a valid promo code to the user's cart, recalculating the payable amount.
 * @returns {object} 200 - Successfully applied promo code with updated price details
 * @returns {object} 404 - Promo Code or Cart not found
 * @returns {object} 400 - Promo Code is not eligible or another error occurred
*/
    applyPromoCode: async (userId: Types.ObjectId, promoCodeId: Types.ObjectId) => {
        const promoFields = { _id: new Types.ObjectId(promoCodeId), status: 1 };
        const promoCode = await promoCodeDao.findOneByFields(promoFields);

        if (!promoCode) {
            throw { statusCode: 404, message: "Promo Code not found" };
        }

        const cartModel = cartDao.getModel() as Model<ICart>;
        let cart: ICart | null = await cartModel.findOne({ userId: userId })
            .populate({
                path: "products.bookId",
                select: "-deletedBy -createdAt -updatedAt -__v "
            });

        if (!cart) {
            throw { statusCode: 404, messgae: "Cart Not Found" }
        }

        const totalCostAndQuantity = cartManager.getTotalCostAndQuantity(cart);
        const eligibility = cartManager.checkPromoCodeEligibility(promoCode, cart, totalCostAndQuantity.totalAmount, totalCostAndQuantity.totalQuantity);

        if (eligibility.status === false) {
            throw { statusCode: 400, message: "PromoCode Not Eligible" };
        }

        const field = { userId: userId };
       const updatedCart =  await cartDao.update(field,
            {
                $set: {
                    promoCodeId: promoCodeId
                }
            },
            { new: true, runValidators: true }
        )

        if(!updatedCart){
            throw {statusCode: 400, message:"Something Went Wrong"}
        }

        cart = await cartModel.findOne({ userId: userId })
            .populate({
                path: "products.bookId",
                select: "-deletedBy -createdAt -updatedAt -__v "
            });

            if (!cart) {
                throw { statusCode: 404, messgae: "Cart Not Found" }
            }
         
        const priceBreakup = await cartManager.getPayableAmount(cart, promoCode);

        return priceBreakup;
    },

/**
 * @route GET /getPromoCodeSuggestion
 * @group promoCode - Operations related to promo codes
 * @param {string} userId - The unique ObjectId reference of the user (Required)
 * @description Provides a list of suggested promo codes based on the user's cart details and eligibility criteria.
 * @returns {object} 200 - List of applicable and non-applicable promo codes
 * @returns {object} 404 - Cart not found or no promo codes available
 * @returns {object} 400 - Something went wrong
*/
    getPromoCodeSuggestion: async (userId: Types.ObjectId) => {

        const cartModel = cartDao.getModel() as Model<ICart>;
        const cart: ICart | null = await cartModel.findOne({ userId: userId })
            .populate({
                path: "products.bookId",
                select: "-deletedBy -createdAt -updatedAt -__v "
            });

        if (!cart) {
            throw { statusCode: 404, message: "Cart Not Found" }
        }

        const amountAndQuantity = cartManager.getTotalCostAndQuantity(cart);
        const result = promoCodeManager.getSuggestion(cart);

        const matchingPromoCodes = await promoCodeDao.getAll({
            $or: [
                { "eligibility.categoryId": { $in: result.categoryObjectIds } },
                { "eligibility.authorId": { $in: result.authorObjectIds } },
                { "eligibility.categoryId": { $exists: false } },
                { "eligibility.authorId": { $exists: false } }
            ]
        });

        let applicablePromoCodes = [];
        let notApplicablePromoCodes = [];
        for (const promoCode of matchingPromoCodes) {
            try {
                const eligibilityResult = await cartManager.checkPromoCodeEligibility(
                    promoCode, cart, amountAndQuantity.totalAmount, amountAndQuantity.totalQuantity
                );
                console.log(eligibilityResult);
                if (eligibilityResult?.status) {
                    applicablePromoCodes.push({
                        promoCode,
                        details: eligibilityResult.eligible
                    });
                } else {
                    notApplicablePromoCodes.push({
                        promoCode,
                        details: eligibilityResult.eligible
                    });
                }
            } catch (error) {
                throw { statusCode: 404, message: "Something went Wrong" }
            }
        }

        applicablePromoCodes = applicablePromoCodes.map((applicablePromoCode) => { return { ...applicablePromoCode.promoCode, isApplicable: true } })
        notApplicablePromoCodes = notApplicablePromoCodes.map((naPromo) => {
            return {
                ...naPromo.promoCode,
                isApplicable: false,
                message: promoCodeManager.notApplcableMessage(naPromo.details)
            }
        })

        return [...applicablePromoCodes, ...notApplicablePromoCodes]
    },

/**
 * @route PUT /removePromoCode
 * @group promoCode - Operations related to promo codes
 * @param {string} userId - The unique ObjectId reference of the user (Required)
 * @param {string} promoCodeId - The unique ObjectId reference of the promo code to be removed (Required)
 * @description Removes an applied promo code from the user's cart and updates the payable amount.
 * @returns {object} 200 - Successfully removed the promo code with updated payable amount
 * @returns {object} 404 - Promo Code or Cart not found
 * @returns {object} 400 - Something went wrong
*/
    removePromoCode: async (userId: Types.ObjectId, promoCodeId: Types.ObjectId) => {

        const promoFields = { _id: promoCodeId, status: 1 };
        const promoCode = await promoCodeDao.findOneByFields(promoFields);

        if (!promoCode) {
            throw { statusCode: 404, message: "Promo Code not found" };
        }

        const field = { userId: userId };
        const updatedCart = await cartDao.update(field,
            {
                $unset: {
                    promoCodeId: true
                }
            },
            { new: true, runValidators: true }
        )
        
        if(!updatedCart){
            throw {statusCode: 400, message: "Something Went wrong"};
        }

        const cartModel = cartDao.getModel() as Model<ICart>;
        const cart: ICart | null = await cartModel.findOne({ userId: userId })
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