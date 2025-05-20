import { Types, Model } from "mongoose";
import { Cart, ICart } from "../models/cart";
import { DaoFactory } from "../daoLayer";
import { ERROR } from "../constants/error";
import { cartManager } from "../utils/cartManager";
import { Address, IAddress } from "../models/address";
import { Book, IBook } from "../models/book";
import { IGiftCard } from "../models/giftCard";
import { IPromoCode } from "../models/promoCode";

const bookDao = DaoFactory.getDao<IBook>(Book);
const cartDao = DaoFactory.getDao<ICart>(Cart);
const addressDao = DaoFactory.getDao<IAddress>(Address);

/**
 * @route POST /createAddress
 * @group cart - Operations related to cart and checkout
 * @param {string} userId - The unique ObjectId reference of the user (Required)
 * @param {string} country - The country of the address (Required)
 * @param {string} recepientName - The full name of the recipient (Required)
 * @param {array} phones - Array of phone numbers associated with the address
 * @param {string} phones.countryCode - Country code of the phone number
 * @param {string} phones.phoneNumber - Phone number of the recipient
 * @param {string} houseNo - House/Apartment number or name (Required)
 * @param {string} city - City of the address (Required)
 * @param {string} landmark - Additional landmark details (Optional)
 * @param {number} pincode - Postal/ZIP code of the address (Required)
 * @param {string} state - State or province (Required)
 * @param {string} tag - Type of address (e.g., "Home", "Office", or custom) (Defaults to "Home")
 * @description Creates a new address for the user, which can be used during checkout.
 * @returns {object} 201 - Address successfully created
 * @returns {object} 400 - Bad request (missing or invalid parameters)
 * @returns {object} 500 - Internal server error
 */
export const cartController = {

    createAddress: async (data: IAddress) => {
        const newAddress = new Address(data);
        const address = await addressDao.create(newAddress);

        return address;
    },

    /**
     * This is an internal controller. There is not any route for this
     */
    createCart: async (data: ICart) => {
        /**
         * Check if the product quantity is less than the Book maxQuantity
         */

        const newProducts = data.products;
        const newCart = new Cart(data);
        const cart = await cartDao.create(newCart);

        return cart;
    },

    /**
 * @route GET /cart/{id}
 * @group Cart - Operations related to cart management
 * @param {string} id.path.required - User ID (ObjectId or string)
 * @returns {object} 200 - Successfully retrieved cart details with price breakup
 */
    getCart: async (id: Types.ObjectId | string, promoCodeFunction?: 'apply' | 'remove') => {
        const cartModel = cartDao.getModel() as Model<ICart>;

        const cart: ICart | null = await cartModel.findOne({ userId: id })
            .populate({
                path: "products.bookId addressId",
                select: "-deletedBy -createdAt -updatedAt -__v "
            });

        if (!cart) return { cart: false };

        const priceBreakup = await cartManager.getPayableAmount(cart);

        return { cart, priceBreakup };
    },

    /**
 * @route POST /cart/add
 * @group Cart - Operations related to cart management
 * @param {ICart.model} body.body.required - Cart update details (userId, products, addressId, tip, etc.)
 * @returns {object} 200 - Successfully added book(s) to cart
 */
    addBookToCart: async (updates: ICart) => {
        const cart = await cartDao.findOneByFields({ userId: updates.userId });

        if (updates.tip) {
            updates.tip = Math.max(updates.tip, 0);
        }
        
        /**
         * Checking If the duplicate bookID exist or not
         */
        const bookIdSet = new Set();
        for (const product of updates.products) {
            if (bookIdSet.has(product.bookId.toString())) {
                throw new Error(`Duplicate bookId found: ${product.bookId}`);
            }
            bookIdSet.add(product.bookId.toString());
        }

        const bookModel = bookDao.getModel() as Model<IBook>;

        /**
         * Checking if all the Book Present in the database or not
         */
        const bookIds = updates.products.map(product => product.bookId);
        const books: Array<IBook> = await bookModel.find({ _id: { $in: bookIds } });
        if (books.length !== bookIds.length) {
            throw { statusCode: 404, message: "Book not found" };
        }

        /**
         * Making the Key: value pair of the book._id: maxQuantity
         */
        const bookMap = books.reduce((acc, book) => {
            acc[book._id.toString()] =  book.maxQuantity ?? undefined;
            return acc;
        }, {} as Record<string, number | undefined>);

        /**
         * updating the value of the quantity according to the permissible limit of the book's Quantity 
         */
        updates.products = updates.products.map(product => {
            const maxQuantity = bookMap[product.bookId.toString()];
            return {
                bookId: product.bookId,
                quantity: maxQuantity !== undefined ? Math.min(product.quantity, maxQuantity) : product.quantity
            };
        });

        if (!cart) {
            return await cartController.createCart(updates);
        }

        const cartProducts = cart.products;

        /**
         * Updating the quantity of the book if book is present else Add Book in the cart
         */
        updates.products.forEach((newProduct) => {
            const existingProductIndex = cartProducts.findIndex(
                (cartItem) => cartItem.bookId.toString() === newProduct.bookId.toString()
            );

            const maxQuantity = bookMap[newProduct.bookId.toString()];

            if (existingProductIndex !== -1) {
                
                const currentQuantity = cartProducts[existingProductIndex].quantity;
                cartProducts[existingProductIndex].quantity = maxQuantity !== undefined ? Math.min(currentQuantity + newProduct.quantity, maxQuantity) 
                : currentQuantity + newProduct.quantity;
            } else {
                newProduct.quantity = maxQuantity !== undefined ? Math.min(newProduct.quantity, maxQuantity) : newProduct.quantity;
                cartProducts.push(newProduct);
            }
        });

        const cartId: Types.ObjectId = cart._id as Types.ObjectId;
        const deliveryDetails = cartManager.getDeliveryDetails();
        const updatedCart = await cartDao.update(
            cartId,
            {
                $set:
                {
                    userId: updates.userId,
                    addressId: updates?.addressId,
                    products: cartProducts,
                    countryCode: updates?.currencyCode,
                    tip: updates.tip,
                    delivery: {
                        date: deliveryDetails.date,
                        day: deliveryDetails.day,
                        time: deliveryDetails.time
                    }
                }
            },
            { new: true, runValidators: true }
        );

        return { cart: true, updatedCart };
    },

    /**
 * @route DELETE /cart/remove
 * @group Cart - Operations related to cart management
 * @param {ICart.model} body.body.required - Cart update details (userId, products)
 * @returns {object} 200 - Successfully removed book(s) from cart
 */
    removeBookFromCart: async (updates: ICart) => {
        const cart = await cartDao.findOneByFields({ userId: updates.userId });
        if (!cart) {
            return { cart: false };
        }

        const cartProducts = cart.products;
        const newProducts = updates.products;

        newProducts.forEach((newProduct) => {
            const existingProductIndex = cartProducts.findIndex(
                (cartItem) => cartItem.bookId.toString() === newProduct.bookId.toString()
            );

            if (existingProductIndex !== -1) {
                const existingProduct = cartProducts[existingProductIndex];

                if (newProduct.quantity && newProduct.quantity < existingProduct.quantity) {
                    cartProducts[existingProductIndex].quantity -= newProduct.quantity;
                } else {

                    cartProducts.splice(existingProductIndex, 1);
                }
            } else {
                throw { statusCode: 404, message: "Product does not exist in the cart" };
            }
        });

        if (cartProducts.length === 0) {
            return await cartController.clearCart(updates.userId);
        }

        const cartId: Types.ObjectId = cart._id as Types.ObjectId;
        const updatedCart = await cartDao.update(
            cartId,
            { $set: { products: cartProducts } },
            { new: true, runValidators: true }
        );

        return { cart: true, updatedCart };
    },

    /**
 * @route DELETE /cart/clear/{userId}
 * @group Cart - Operations related to cart management
 * @param {string} userId.path.required - User ID
 * @returns {object} 200 - Successfully cleared the cart
 * @returns {Error} 500 - Internal Server Error
 */
    clearCart: async (userId: Types.ObjectId) => {
        await cartDao.delete({ userId: userId });
        return { cartDeleted: true, message: "Cart has been deleted" };

    }

}