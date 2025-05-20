import { getDatabase, ref, set, get, update, remove, child, DatabaseReference, push, query, orderByChild, equalTo } from "firebase/database";
import {FirebaseDb} from "../databases/firebaseDB";
import {Types} from "mongoose";

/**
 * @class firebaseDao
 * @description Generic Data Access Object (DAO) for Firebase Realtime Database operations
 * @template T - Type representing the structure of the data
 */
export class firebaseDao<T>{
    private ref: DatabaseReference;

    /**
     * @constructor
     * @param {string} dbName - The name of the Firebase database collection
     */
    constructor(dbName : string){
        const db = getDatabase(FirebaseDb.getApp())
        this.ref = ref(db, `${dbName}/`);
    }
 
    /**
     * @description Retrieves the reference to the Firebase database collection
     * @returns {DatabaseReference} - The database reference
     */
    getModel(): DatabaseReference {
        return this.ref;
    }

    /**
     * @group firebaseDao - Firebase DAO operations
     * @description Retrieves all records from the Firebase collection
     * @returns {Promise<T[]>} - Array of all documents in the collection
     */
    async getAll(): Promise<T[]> {
        const data = await get(this.ref);
        if (!data.exists()) return [];
        return data.val();
    }

    /**
     * @group firebaseDao - Firebase DAO operations
     * @param {string} id - The unique ID of the document
     * @description Finds a document by its ID
     * @returns {Promise<T | null>} - The found document or null if not found
     */
    async findOneById(id: Types.ObjectId | string): Promise<T | null> {
      id = id.toString();
        const recordRef = child(this.ref, id);
        const data = await get(recordRef);
        if (!data.exists()) return null;
        return data.val();
    }

    /**
     * @group firebaseDao - Firebase DAO operations
     * @param {Partial<T>} fields - Search criteria for the document
     * @description Finds a document that matches the given fields
     * @returns {Promise<T | null>} - The matching document or null if not found
     */
    async findOneByFields(fields: any): Promise<T | null> {
      const allData = await this.getAll();
      const dataArray = Array.isArray(allData) ? allData : Object.values(allData) as T[];
  
      return dataArray.find((item) =>
          Object.entries(fields).every(([key, value]) => item[key as keyof T] === value)
      ) || null;
  }      

    /**
     * @group firebaseDao - Firebase DAO operations
     * @param {T} entity - The document object to create
     * @description Creates a new document in the Firebase database
     * @returns {Promise<{ id: string; data: T }>} - The created document with its ID
     */  
      async create(entity: T): Promise<{ id: string; data: T }> {
        const recordRef = push(this.ref); 
        const id = recordRef.key; 
        if (!id) throw new Error("Failed to generate a unique ID");
      
        await set(recordRef, entity); 
        return { id, data: entity }; 
      }

    /**
     * @group firebaseDao - Firebase DAO operations
     * @param {string} id - The ID of the document to update
     * @param {Object} updatedFields - The updated data for the document
     * @param {Object} [options={}] - Additional update options
     * @description Updates an existing document by ID in Firebase
     * @returns {Promise<void>}
     */
      async update(id: any, updatedFields: any, options = {}): Promise<void> {
        if (!id) {
          throw new Error("Invalid ID: ID cannot be undefined");
      }
        const recordRef = child(this.ref, id.toString());
        await update(recordRef, updatedFields);
      }

    /**
     * @group firebaseDao - Firebase DAO operations
     * @param {Partial<T>} payload - The criteria to delete a document
     * @description Deletes a document based on the provided criteria
     * @returns {Promise<void>}
     */
      async delete(payload: Partial<T>): Promise<void> {
        if (!payload || Object.keys(payload).length === 0) {
          throw new Error("Invalid payload: Must provide at least one field for deletion.");
      }

      const key = Object.keys(payload)[0]; 
      const value = (payload as any)[key];

      const q = query(this.ref, orderByChild(key), equalTo(value));
      const snapshot = await get(q);

      if (!snapshot.exists()) {
          throw new Error("Record not found");
      }

      const deletePromises = Object.keys(snapshot.val()).map(async (recordId) => {
          const recordRef = child(this.ref, recordId);
          return remove(recordRef);
      });

      await Promise.all(deletePromises);
      }
}