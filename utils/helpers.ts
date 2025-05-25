import { CONSTANT_VALUE } from "../constants/constants";
import { sign, verify } from "jsonwebtoken";
import config from 'config';
import { aes } from "./aes";
import * as bcrypt from "bcrypt";
import { Author } from "../models/author";
import { Types } from "mongoose";

/**
 * @param limit - The number of records per page (optional).
 * @param page - The current page number (optional).
 * @returns {Promise<{ limit: number; offset: number }>} - Returns an object containing the `limit` and `offset` values.
 */
export const getLimitOffset = (limit?: number, page?: number) => {
    try {
        if (limit) {
            limit = Math.abs(limit);
        } else {
            limit = CONSTANT_VALUE.MIN_LIMIT;
        }

        if (page && page != 0) {
            page = Math.abs(page);
        } else {
            page = CONSTANT_VALUE.PAGE;
        }
        /**
         * Calculate offset based on the page number and limit
         */
        let offset: number = (page - 1) * limit;
        offset = offset < 0 ? 0 : offset;

        return { limit, offset };

    } catch (error: any) {
        /**
         * Return default values in case of error
         */
        return { limit: CONSTANT_VALUE.MIN_LIMIT, offset: 0 };
    }
}

export const getPaginatedData = async(model:any, query: any, filters : any) => {
    const result: { limit: number, offset: number } = getLimitOffset(query.limit, query.page);

    let entity = await model.find(filters)
        .populate(query.populate || "")
        .sort({ [query.sortField]: query.sortOrder })
        .skip(result.offset)
        .limit(result.limit + 1);

    const nextPage: boolean = entity.length > result.limit;
    if (nextPage) entity.pop();

    return {
        data: {
            page: query.page, limit: result.limit, nextPage: nextPage? 1: -1,
            items: entity, totalCount: entity.length
        }
    };
}

/**
 * @description Generates a JSON Web Token (JWT) using a secret key.
 * @param {object} payload - The payload data to encode in the JWT.
 * @returns {string} - The generated JWT token.
 */
export const createJwtToken = (payload: object) => {
    return sign(payload, <string>config.get('JWT_SECRET_KEY'));
}

/**
 * @description Encrypts a given string using AES encryption.
 * @param {string} payload - The string to be encrypted.
 * @returns {Promise<string>} - The encrypted string.
 */
export const aesEncryption = async (payload: string) => {
    return aes.encrypt(payload);
}

const verifyPassword = async (adminPasswod: string, password: string) => {
    const isPasswordValid = await bcrypt.compare(adminPasswod, password);
    if (!isPasswordValid) {
        return false;
    }
    return true;
}

export const isSuperAdmin = async (email: string, password: string) => {
    const superAdmin: any = config.get('SUPERADMINS');

    for (let i = 0; i < superAdmin.length; i++) {
      
        let checkedPassword: boolean = await verifyPassword(password, superAdmin[i].password);
        
        if (superAdmin[i].email === email && checkedPassword) {
            const superAdminId = superAdmin[i].id;
            return {superAdminId: superAdminId, success: true};
        }
    }

    return {success: false};
}

export const getAuthorIds = async (query: string): Promise<Types.ObjectId[]> => {
    const authors = await Author.find({
        $or: [
            { first_Name: new RegExp(query, "i") },
            { middle_Name: new RegExp(query, "i") },
            { last_Name: new RegExp(query, "i") }
        ]
    }).select("_id");

    return authors.map(author => author._id);
}