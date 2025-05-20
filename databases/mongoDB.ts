import mongoose from "mongoose";
import config from "config"

/**
 * @description Establishes a connection to the MongoDB database using configuration settings.
 * @returns {Promise<void>} - A promise that resolves when the connection is successful.
 * @throws {Error} - Logs an error if the connection fails.
 */
const startMongoConnection = async () => {
   const { host, port, dbName } = config.get<{ host: string, port: string, dbName: string }>('dbConfig');
   try {
      mongoose.set('debug', true);
      await mongoose.connect(`${host}:${port}/${dbName}`);
      console.log("MongoDB database is connected");
   } catch (err: any) {
      throw new Error("MongoDb not connected");
   }
}

export default startMongoConnection;