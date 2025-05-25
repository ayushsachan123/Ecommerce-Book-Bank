import express from "express";
import { sendError, sendSuccess } from "../../utils/sendResponse";
import { cartController } from "../../controller/cart.controller";
import { SUCCESS } from "../../constants/success";
import { Auth } from "../../middlewares/auth";
import { addToCartSchema, clearCartSchema, getCartSchema, removeFromCartSchema } from "../../schemas/cartSchema";
import { validateRequestBody } from "../../schemas";

const router = express.Router();

/**
 * @route POST /createAddress
 * @group Address - Operations related to user addresses
 * @param {string} userId - The unique ObjectId reference of the user (Required)
 * @param {string} country - The country of the address (Required)
 * @param {string} recepientName - The full name of the recipient (Required)
 * @param {array} phones - Array of phone numbers associated with the address
 * @param {string} phones.countryCode - Country code of the phone number (Optional)
 * @param {string} phones.phoneNumber - Phone number of the recipient (Optional)
 * @param {string} houseNo - House/Apartment number or name (Required)
 * @param {string} city - City of the address (Required)
 * @param {string} landmark - Additional landmark details (Optional)
 * @param {number} pincode - Postal/ZIP code of the address (Required)
 * @param {string} state - State or province (Required)
 * @param {string="Home","Office"} tag - Type of address (Defaults to "Home")
 * @description Creates a new address for the user, which can be used during checkout.
 * @returns {object} 201 - Address successfully created
 * @returns {object} 400 - Bad request (missing or invalid parameters)
 * @returns {object} 500 - Internal server error
 */
router.post(
    '/createAddress',
    Auth.validateAccessToken,
    async (req: any, res: any) => {
        try {
            const data = await cartController.createAddress(req.body);
            sendSuccess(res, SUCCESS.POST_201_DATA, data);
        } catch (error: any) {
            sendError(res, error);
        }
    });

/**
 * @route PUT /cart/addToCart
 * @group Cart - Operations related to cart management
 * @param {ICart.model} body.body.required - Cart update details (userId, products, addressId, tip, etc.)
 * @returns {object} 200 - Successfully added book(s) to cart
 * @returns {Error} 500 - Internal Server Error
 * @description Adds books to the user's cart. If the cart doesn't exist, a new one is created.
 */
router.put(
    '/addToCart',
    validateRequestBody(addToCartSchema),
    Auth.validateAccessToken,
    async (req: any, res: any) => {
        try {
            const data = await cartController.addBookToCart(req.body);
            sendSuccess(res, SUCCESS.PUT_200_DATA, data);
        } catch (error: any) {
            sendError(res, error);
        }
    });

/**
 * @route PUT /cart/removeFromCart
 * @group Cart - Operations related to cart management
 * @param {ICart.model} body.body.required - Cart update details (userId, products)
 * @returns {object} 200 - Successfully removed book(s) from cart
 * @returns {Error} 400 - Invalid input data
 * @returns {Error} 500 - Internal Server Error
 * @description Removes books from the user's cart. If quantity is less than existing, it decreases the count; otherwise, removes the item.
 */
router.put(
    '/removeFromCart',
    validateRequestBody(removeFromCartSchema),
    Auth.validateAccessToken,
    async (req: any, res: any) => {
        try {
            const data = await cartController.removeBookFromCart(req.body);
            sendSuccess(res, SUCCESS.PUT_200_DATA, data);
        } catch (error: any) {
            sendError(res, error);
        }
    });

/**
* @route GET /cart/getCart/{id}
* @group Cart - Operations related to cart management
* @param {string} id.path.required - User ID (ObjectId or string)
* @returns {object} 200 - Successfully retrieved cart details with price breakup
* @returns {Error} 500 - Internal Server Error
* @description Fetches the cart details for a given user ID.
*/
router.get(
    '/getCart/:id',
    // validateRequestBody(getCartSchema),
    Auth.validateAccessToken,
    async (req: any, res: any) => {
        try {
            const data = await cartController.getCart(req.params.id);
            sendSuccess(res, SUCCESS.GET_200, data);
        } catch (error: any) {
            sendError(res, error);
        }
    });


/**
* @route DELETE /cart/clearCart
* @group Cart - Operations related to cart management
* @param {string} userId.body.required - User ID
* @returns {object} 200 - Successfully cleared the cart
* @returns {Error} 500 - Internal Server Error
* @description Clears all items in the user's cart.
*/
router.delete(
    '/clearCart',
    validateRequestBody(clearCartSchema),
    Auth.validateAccessToken,
    async (req: any, res: any) => {
        try {
            const data = await cartController.clearCart(req.body.userId);
            sendSuccess(res, SUCCESS.DELETE_204, data);
        } catch (error: any) {
            sendError(res, error);
        }
    });

export default router;