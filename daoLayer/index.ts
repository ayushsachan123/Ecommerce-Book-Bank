import config from "config";
import { Document, Model } from "mongoose";
import { firebaseDao } from "./firebaseDao";
import { MongoDao } from "./mongoDao";

/**
 * @class DaoFactory
 * @description Factory class to provide the appropriate Data Access Object (DAO) based on configuration.
 */
export class DaoFactory {

    /**
     * @template T - Type representing the structure of the data
     * @param {Model<T> | string} payload - Either a Mongoose model (for MongoDB) or a collection name (for Firebase)
     * @description Returns the appropriate DAO instance based on the configuration.
     * @throws {Error} Throws an error if the DAO type is invalid.
     * @returns {MongoDao<T> | firebaseDao<T>} - Returns an instance of either `MongoDao` (for MongoDB) or `firebaseDao` (for Firebase).
     */
    static getDao<T extends Partial<Document>>(payload: Model<T> | string) {
        if (config.get("DAO") === "MONGO") {
            return new MongoDao<T>(payload as Model<T>);
        }
        else if (config.get("DAO") === "firebase") {
            return new firebaseDao<T>(payload as string);
        }
         else {
            throw new Error("Invalid DAO type in configuration");
        }
    }
}
