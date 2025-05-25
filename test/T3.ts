import { DaoFactory } from "../daoLayer";
import {Book, IBook} from '../models/book';

const dao = DaoFactory.getDao<IBook>(Book);

/**
 * Test for the CRUD Operations in Generic way
 */
export default async function T1() {
    const newBook = {
        title: "Test Book",
        description: {
            short: "Short description",
            long: "Long description",
        },
        price: 5000,
        pages: 1000,
    };

     //For update
      const updatedFields: Partial<IBook> = {
        title: "Updated Title",
        description: {
          short: "Updated short description",
          long: "Updated long description",
        },
        price: 14.99,
        pages: 200,
      };

    const createdBook = await dao.create(newBook);
    console.log("Created:", createdBook);

    const allBooks = await dao.getAll();
    console.log("All Books:", allBooks);

    const foundBook = await dao.findOneById(createdBook.id);
    console.log("Found:", foundBook);

    await dao.update(createdBook.id, updatedFields);
    console.log("Updated price");

    await dao.delete(createdBook.id);
    console.log("Deleted book");
}
