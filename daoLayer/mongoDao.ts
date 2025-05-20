import mongoose, {Types, Query, FilterQuery} from "mongoose";
import { IUser } from "../models/user";

/**
 * @class MongoDao
 * @description Generic Data Access Object (DAO) for MongoDB operations
 * @template T - A mongoose document type
 */
export class MongoDao<T extends Partial<mongoose.Document>>{
    private model: mongoose.Model<T>

    /**
     * @constructor
     * @param {mongoose.Model<T>} model - Mongoose model to be used for database operations
     */
    constructor(model: mongoose.Model<T>){
        this.model = model;
    }

    /**
     * @function getModel
     * @description Retrieves the underlying Mongoose model
     * @returns {mongoose.Model<T>} - The Mongoose model instance
     */
    getModel() : mongoose.Model<T>{
        return this.model;
    }

    /**
     * @group MongoDao - Generic DAO operations
     * @description Retrieves all records from the collection
     * @returns {Promise<T[]>} - Array of all documents in the collection
     */
    async getAll(filter: {}): Promise<T[]> {
        return (await this.model.find(filter).lean()) as T[];
    }
 
    /**
     * @group MongoDao - Generic DAO operations
     * @param {string} _id - The ID of the document to retrieve
     * @description Finds a document by its unique identifier
     * @returns {Promise<T | null>} - The found document or null if not found
     */
    async findOneById(id: Types.ObjectId | string){
        if(typeof id === 'string') id = new mongoose.Types.ObjectId(id);
        let data = await this.model.findById(id);
        return data;
    }

    /**
     * @group MongoDao - Generic DAO operations
     * @param {Object} fields - Search criteria for the document
     * @description Finds a document by specified fields
     * @returns {Promise<IUser | null>} - The matching document or null if not found
     */
    async findOneByFields(fields: Object): Promise< T | null>{
        const data: T | null = (await this.model.findOne(fields)) as T | null;
        return data;
    }

    /**
     * @group MongoDao - Generic DAO operations
     * @param {T} entity - The document object to create
     * @description Creates a new document in the collection
     * @returns {Promise<T>} - The created document
     */
    async create(entity: T){
       let data = await this.model.create(entity);
       return data;
    }

    /**
     * @group MongoDao - Generic DAO operations
     * @param {string} id - The ID of the document to update
     * @param {Object} entity - The updated data for the document
     * @param {Object} [options={}] - Additional update options
     * @description Updates an existing document by ID
     * @returns {Promise<void>}
     */
    async update(id: Types.ObjectId | string | Record<string, any> | undefined, entity: any, options = {}) {
        let query: Record<string, any>;
    
        if (id instanceof Types.ObjectId || (typeof id === "string" && mongoose.isValidObjectId(id))) {
            query = { _id: new mongoose.Types.ObjectId(id) }; 
        } else if (typeof id === "object" && id !== null) {
            query = id;  
        } else {
            throw new Error("Invalid ID or filter provided for update.");
        }
    
        return await this.model.findOneAndUpdate(query, entity, { new: true, runValidators: true, ...options });
    }
    

   /**
     * @group MongoDao - Generic DAO operations
     * @param {Object} payload - The criteria to delete a document
     * @description Deletes a document based on the provided criteria
     * @returns {Promise<T | null>} - The deleted document or null if not found
     */
    async delete(payload: object){
        return await this.model.findOneAndDelete(payload);
    }

}