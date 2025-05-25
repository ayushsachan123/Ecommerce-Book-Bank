import { Types } from "mongoose";
import { ICart } from "../models/cart";

class PromoCodeManager {

    getSuggestion(cart: any) {
        if (!cart || !cart.products || cart.products.length === 0) {
            throw { statusCode: 400, message: "Cart is empty" };
        }
        const uniqueCategoryIds = new Set<string>();
        const uniqueAuthorIds = new Set<string>();

        cart.products.forEach((product: any) => {
            if (product.bookId.category) {
                uniqueCategoryIds.add(product.bookId.category.toString());
            }
            if (product.bookId.author) {
                uniqueAuthorIds.add(product.bookId.author.toString());
            }
        });

        const categoryObjectIds = Array.from(uniqueCategoryIds).map(id => new Types.ObjectId(id));
        const authorObjectIds = Array.from(uniqueAuthorIds).map(id => new Types.ObjectId(id));

        return { categoryObjectIds, authorObjectIds };
    }

    notApplcableMessage(details: any) {
        if(details.amount.message.length > 0){
            return details.amount.message;
        }else if(details.quantity.message.length > 0){
            return details.quantity.message;
        }else if(details.authorId.message.length > 0){
            return details.authorId.message;
        }else{
            return details.categoryId.message;
        }
    }

}

export const promoCodeManager = new PromoCodeManager();