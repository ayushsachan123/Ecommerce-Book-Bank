import { FirebaseApp, initializeApp } from "firebase/app";
import { Database, getDatabase } from "firebase/database";
import config from "config";

/**
 * @class FirebaseDb
 * @description Manages Firebase database connection and application instance.
 */
export class FirebaseDb {
    private static app : FirebaseApp;
    private static database : Database;

    /**
     * @description Initializes and retrieves the Firebase application instance.
     * @returns {FirebaseApp | undefined} - The initialized Firebase app instance or undefined if an error occurs.
     * @throws {Error} - Logs an error message if Firebase initialization fails.
     */
    static getApp() {
        try {
            const firebaseConfig = {
                databaseURL: config.get<string>('firebaseURL')
            };

            this.app = initializeApp(firebaseConfig);
            this.database = getDatabase(this.app)
            console.log("Connected with Firebase")
            return this.app;
        } catch (error: any) {
            throw new Error("FirebaseDB not connected");
        }
    }

    /**
     * @description Retrieves the Firebase database instance.
     * @returns {Database} - The Firebase database instance.
     */
    static getDb(){
        return this.database
    }
} 