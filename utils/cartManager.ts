import config from "config";
import { Cart, ICart } from "../models/cart";
import { Types } from "mongoose";
import { DaoFactory } from "../daoLayer";
import { GiftCard, IGiftCard } from "../models/giftCard";
import { IPromoCode, PromoCode } from "../models/promoCode";

const giftCardDao = DaoFactory.getDao<IGiftCard>(GiftCard);
const cartDao = DaoFactory.getDao<ICart>(Cart);
const promoCodeDao = DaoFactory.getDao<IPromoCode>(PromoCode);

export type DISCOUNT_TYPE =
    | { type: "amount"; value: number }
    | { type: "percent"; value: number; maxDiscount: number };

/**
* @class CartManager
* @description Manages cart operations such as calculating totals, discounts, handling fees, and payable amounts.
*/
class CartManager {

    /**
    * @method getDeliveryDetails
    * @description Generates estimated delivery details (date, day, and time).
    * @returns {object} Delivery details including date, day of the week, and timestamp.
    */
    getDeliveryDetails() {
        const now = new Date();
        now.setDate(now.getDate() + 2);

        return {
            date: now.getDate(),
            day: now.getDay(),
            time: now.getTime()
        };
    };

    /**
    * @method getTotalCostAndQuantity
    * @description Calculates the total cost and total quantity of products in the cart.
    * @param {ICart} cart - The cart object containing products.
    * @returns {object} Object containing totalAmount and totalQuantity.
    */
    getTotalCostAndQuantity(cart: ICart): { totalAmount: number, totalQuantity: number } {
        const products = cart.products;
        let totalAmount = 0, totalQuantity = 0;
        products.forEach((product) => {
            totalQuantity += product.quantity;
            if (product.bookId && (product.bookId as any).price) {
                totalAmount += (product.bookId as any).price * product.quantity;
            }
        })

        return { totalAmount, totalQuantity };
    }

    /**
    * @method getHandlingFee
    * @description Generates a random handling fee (0-50).
    * @returns {number} Handling fee amount.
    */
    getHandlingFee(): number {
        return Math.floor(Math.random() * 51);
    }

    /**
    * @method getDeliveryCharges
    * @description Generates a random delivery charge (0-50).
    * @returns {number} Delivery charge amount.
    */
    getDeliveryCharges(): number {
        return Math.floor(Math.random() * 51);
    }

    /**
     * @method getGstCharges
     * @description Calculates the GST (Goods and Services Tax) based on the configured rate.
     * @param {number} cost - The total cost of items in the cart.
     * @returns {number} GST amount.
     */
    getGstCharges(cost: number): number {
        const gstRate: number = parseInt(config.get('GST'));

        return parseFloat(((cost * gstRate) / 100).toFixed(2));
    }

    /**
     * @method getDiscount
     * @description Computes a discount on the cart's total price, applying either a percentage-based or amount-based discount.
     * @param {number} cost - Total cost of the cart.
     * @returns {DISCOUNT_TYPE} Discount object containing type and value.
     */
    getDiscount(cost: number): DISCOUNT_TYPE {
        const maxValue = 100;
        const percent = Math.floor(Math.random() * 16);

        const calculatedDiscount = Math.floor((cost * percent) / 100);

        if (calculatedDiscount > maxValue) {
            return { type: "amount", value: maxValue };
        } else {
            return { type: "percent", value: percent, maxDiscount: calculatedDiscount };
        }
    }

    checkPromoCodeEligibility(promoCode: IPromoCode, cart: any, totalAmount: number, totalQuantity: number) {
        const { eligibility, expiryTimeStamp, usageLimit, usages } = promoCode;

        const eligible = {
            amount: {
                message: "",
                isApplicable: true
            },
            quantity: {
                message: "",
                isApplicable: true
            },
            authorId: {
                message: "",
                isApplicable: true,
                matchedAuthors: [] as string[],
                matchedAuthorPrice: 0
            },
            categoryId: {
                message: "",
                isApplicable: true,
                matchedCategories: [] as string[],
                matchedCategoryPrice: 0
            }
        }

        if (expiryTimeStamp && expiryTimeStamp < Date.now()) {
            throw { statusCode: 400, message: "Promo Code has expired" };
        }

        let useCount = 0;
        usages?.forEach(usage => useCount += usage.count);
        if (usageLimit && useCount >= usageLimit) {
            throw { statusCode: 400, message: "Maximum Usage Reached" };
        }

        if (eligibility) {
            if (eligibility.minValue) {
                if (totalAmount < eligibility.minValue) {
                    eligible.amount.isApplicable = false;
                    eligible.amount.message = `Promo code not applicable - Minimum ${eligibility.minValue} amount required.`;
                } else {
                    eligible.amount.isApplicable = true;
                }
            }
            if (eligibility.minItemCount) {
                if (totalQuantity < eligibility.minItemCount) {
                    eligible.quantity.isApplicable = false;
                    eligible.quantity.message = `Promo code not applicable: Minimum ${eligibility.minItemCount} item required.`;
                } else {
                    eligible.quantity.isApplicable = true;
                }
            }

            if (eligibility.categoryId && eligibility.categoryId.length > 0) {

                const cartCategoryIds = cart.products.map((product: any) => ({
                    category: product.bookId.category.toString(),
                    price: product.bookId.price
                }));

                const matchedCategories = eligibility.categoryId
                    .map((category: Types.ObjectId) => category.toString())
                    .filter((category) => cartCategoryIds.some((cartItem: any) => cartItem.category === category));

                const matchedCategoryPrice = cartCategoryIds.filter((cartItem: any) =>
                    matchedCategories.includes(cartItem.category)).reduce((total: number, item: any) => total + item.price, 0)

                if (matchedCategories.length === 0) {
                    eligible.categoryId.isApplicable = false;
                    eligible.categoryId.message = "Promo code not applicable - No matching category found in cart.";
                } else {
                    eligible.categoryId.isApplicable = true;
                    eligible.categoryId.matchedCategories = matchedCategories;
                    eligible.categoryId.matchedCategoryPrice = matchedCategoryPrice;
                }
            }

            if (eligibility.authorId && eligibility.authorId.length > 0) {

                const cartAuthorIds = cart.products.map((product: any) => ({
                    author: product.bookId.author.toString(),
                    price: product.bookId.price
                }));

                const matchedAuthors = eligibility.authorId
                    .map((author: Types.ObjectId) => author.toString())
                    .filter((author) => cartAuthorIds.includes(author));

                const matchedAuthorsPrice = cartAuthorIds.filter((cartItem: any) =>
                    matchedAuthors.includes(cartItem.author)).reduce((total: number, item: any) => total + item.price, 0)

                if (matchedAuthors.length === 0) {
                    eligible.authorId.isApplicable = false;
                    eligible.authorId.message = "Promo code not applicable - No matching Author found in cart.";
                } else {
                    eligible.authorId.isApplicable = true;
                    eligible.authorId.matchedAuthors = matchedAuthors;
                    eligible.authorId.matchedAuthorPrice = matchedAuthorsPrice;
                }
            }
        }
        const isEligible =
            eligible.amount.isApplicable &&
            eligible.quantity.isApplicable &&
            eligible.categoryId.isApplicable &&
            eligible.authorId.isApplicable;

        if (!isEligible) {
            return { status: false, eligible: eligible };
        }

        return { status: true, eligible: eligible };
    }

    getPromoCodeDiscount(promoCode: IPromoCode, totalAmount: number, eligible: any): number {
        const { typeDetail } = promoCode;
        const { type } = typeDetail;

        if (eligible.authorId.isApplicable && eligible.authorId.matchedCategoryPrice > 0) {
            if (type === "percent") {
                return (eligible.authorId.matchedAuthorPrice * (typeDetail.percent || 0)) / 100;
            }

            if (type === "percentage_with_max_value") {
                const percentageDiscount = (eligible.authorId.matchedAuthorPrice * (typeDetail.percentMaxValue?.percent || 0)) / 100;
                return Math.min(percentageDiscount, typeDetail.percentMaxValue?.maxValue || 0);
            }
        }
        if (eligible.categoryId.isApplicable && eligible.categoryId.matchedCategoryPrice > 0) {
            if (type === "percent") {
                return (eligible.categoryId.matchedCategoryPrice * (typeDetail.percent || 0)) / 100;
            }

            if (type === "percentage_with_max_value") {
                const percentageDiscount = (eligible.categoryId.matchedCategoryPrice * (typeDetail.percentMaxValue?.percent || 0)) / 100;
                return Math.min(percentageDiscount, typeDetail.percentMaxValue?.maxValue || 0);
            }
        }

        if (type === "value") {
            return typeDetail.value ?? 0;
        }
        if (type === "percent") {
            return (totalAmount * (typeDetail.percent || 0)) / 100;
        }

        if (type === "percentage_with_max_value") {
            const percentageDiscount = (totalAmount * (typeDetail.percentMaxValue?.percent || 0)) / 100;
            return Math.min(percentageDiscount, typeDetail.percentMaxValue?.maxValue || 0);
        }

        return 0;
    }

    async giftCardEligibility(giftCardId: Types.ObjectId) {
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

        return giftCard.amount;
    }

    async getPromoCode(promoCodeId: Types.ObjectId) {
        const promoFields = { _id: new Types.ObjectId(promoCodeId), status: 1 };
        const promoCode = await promoCodeDao.findOneByFields(promoFields);

        if (!promoCode) {
            throw { statusCode: 404, message: "Promo Code not found" };
        }

        return promoCode;
    }

    /**
     * @method getPayableAmount
     * @description Calculates the final payable amount after applying fees, taxes, and discounts.
     * @param {ICart} cart - The cart object containing products.
     * @returns {object} Object containing totalAmount, totalQuantity, handlingFee, deliveryCharges, gstCharges, discount, and payableAmount.
     */
    async getPayableAmount(cart: ICart, promoCode?: IPromoCode) {

        let giftCardPrice = 0;
        if (cart.giftCardId) {
            giftCardPrice = await this.giftCardEligibility(cart.giftCardId);
        }

        const { totalAmount, totalQuantity } = this.getTotalCostAndQuantity(cart);
        const handlingFee = this.getHandlingFee();
        const deliveryCharges = this.getDeliveryCharges();
        const gstCharges = this.getGstCharges(totalAmount);
        const discount = this.getDiscount(totalAmount);

        let promoCodePrice = 0;

        if (promoCode && promoCode._id == cart.promoCodeId) {
            const result = this.checkPromoCodeEligibility(promoCode, cart, totalAmount, totalQuantity);

            if (result.status === true) {
                promoCodePrice = this.getPromoCodeDiscount(promoCode, totalAmount, result.eligible);
            } else {
                return;
            }
        } else if (cart.promoCodeId) {
            const cartPromoCode = await this.getPromoCode(cart.promoCodeId);
            const result = this.checkPromoCodeEligibility(cartPromoCode, cart, totalAmount, totalQuantity);

            if (result.status === true) {
                promoCodePrice = this.getPromoCodeDiscount(cartPromoCode, totalAmount, result.eligible);
            } else {
                return;
            }
        }

        /**
        * The discount is applied based on its type:
        * - If it is a fixed amount discount, it is directly subtracted.
        * - If it is a percentage-based discount, the calculated `maxDiscount` is subtracted.
        */
        let payableAmount = null;
        if (discount.type === "amount")
            payableAmount = (totalAmount + handlingFee + deliveryCharges + gstCharges - discount.value - giftCardPrice - promoCodePrice).toFixed(2);
        else
            payableAmount = (totalAmount + handlingFee + deliveryCharges + gstCharges - discount.maxDiscount - giftCardPrice - promoCodePrice).toFixed(2);

        return {
            totalAmount: totalAmount,
            totalQuantity: totalQuantity,
            handlingFee: handlingFee,
            deliveryCharges: deliveryCharges,
            gstCharges: gstCharges,
            discount: discount,
            giftCardPrice: giftCardPrice,
            promoCodePrice: promoCodePrice,
            payableAmount: payableAmount
        }
    }
}

export const cartManager = new CartManager();