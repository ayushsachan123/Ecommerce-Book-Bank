import { firebaseDao } from '../daoLayer/firebaseDao';
import { IBook, Book } from '../models/book'

/**
 * Test for the CRUD Operations in FireBaseDB
 */
export default async function T2() {
    const bookDao = new firebaseDao<IBook>('books');
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
    let newBook: any = await bookDao.create(newBookDetails);
    console.log(newBook);
    const fields: Partial<IBook> = {
        title: newBook.title,
        price: newBook.price,
        pages: newBook.pages,
    };
    await bookDao.findOneById(newBook.id);
    const data =  await bookDao.getAll();
    console.log(data);
    await bookDao.findOneByFields(fields);
    await bookDao.update(newBook.id, updatedFields);
    await bookDao.delete(newBook.id);
}