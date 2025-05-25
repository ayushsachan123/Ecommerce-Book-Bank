import { MongoDao } from '../daoLayer/mongoDao'
import { IBook, Book } from '../models/book'

/**
 * Test for the CRUD Operations in MongoDB
 */
const dao = new MongoDao<IBook>(Book);
export default async function T1() {

  const newBookDetails = {
    title: "Title for test",
    description: {
      short: "This is short description",
      long: "This is long description"
    },
    price: 5000,
    images: [
      {
        name: "Cover Image",
        imageURL: "https://example.com/images/cover.jpg"
      },
      {
        name: "Back Cover",
        imageURL: "https://example.com/images/back-cover.jpg"
      }
    ],
    pages: 1000
  }

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

  //Calling the function
  let newBook: any = await dao.create(newBookDetails);
  const fields: Partial<IBook> = {
    title: newBook.title,
    price: newBook.price,
    pages: newBook.pages,
  };
  await dao.findOneById(newBook._id);
  await dao.getAll();
  await dao.findOneByFields(fields);
  await dao.update(newBook._id, updatedFields);
  await dao.delete(newBook._id);
}
