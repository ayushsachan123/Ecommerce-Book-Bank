import { getAuthorIds, getPaginatedData } from "../utils/helpers";
import { IBook, Book } from '../models/book'
import { DaoFactory } from "../daoLayer";
import mongoose, { Types } from "mongoose";
import { BOOK_POPULATABLE_FIELDS, BOOK_STATUS, SortFields } from "../constants/constants";
import { Category, ICategory } from "../models/category";
import { Edition, IEdition } from "../models/edition";
import { ERROR } from "../constants/error";

const bookDao = DaoFactory.getDao<IBook>(Book);
const categoryDao = DaoFactory.getDao<ICategory>(Category);
const editionDao = DaoFactory.getDao<IEdition>(Edition);

export const bookController = {

    // createCategory: async (data: ICategory) => {
    //     const newCategory = new Category(data);
    //     const category = await categoryDao.create(newCategory);

    //     return category;
    // },

    // createEdition: async (data: IEdition) => {
    //     const newEdition = new Edition(data);
    //     const edition = await editionDao.create(newEdition);

    //     return edition;
    // },

    /**
    * @route POST /books/create
    * @group Books - Operations related to book management
    * @param title - Book title (must be unique, case-insensitive)
    * @param author - Author's ID (must exist in the database)
    * @param description.short - Short description of the book
    * @param description.long - Detailed description of the book
    * @param price - Price of the book
    * @param edition - Edition ID (optional)
    * @param images - Array of book images
    * @param category - Category ID the book belongs to
    * @param pages - Number of pages in the book
    * @param status - Status of the book (default: 1)
    * @returns {object} 201 - Successfully created book
    * @returns {Error} 400 - Book already exists with this title
    * @returns {Error} 500 - Internal Server Error
    */
    createNewBook: async (data: IBook) => {
        const existingBook = await Book.findOne({ title: { $regex: new RegExp(`^${data.title}$`, "i") } });

        if (existingBook) {
            throw ERROR.BOOK_ALREADY_EXIST;
        }

        const bookDetails: Partial<IBook> = data
        delete bookDetails.status;
        const newBook = new Book(bookDetails);

        const book = await bookDao.create(newBook);
        return book;

    },

    /**
    * @route GET /books/id/:id
    * @group Books - Operations related to book management
    * @param {string} id - Book ID
    * @param {boolean} isAdminOrSuperAdmin - Determines if the requester is an admin or superadmin
    * @returns {object} 200 - Successfully retrieved book details
    * @returns {Error} 404 - Book does not exist
    * @returns {Error} 500 - Internal Server Error
    */
    getBookById: async (id: Types.ObjectId | string, isAdminOrSuperAdmin: boolean) => {

        let filters: { _id?: Types.ObjectId | string, status?: number } = { _id: id, status: 1 }
        if (isAdminOrSuperAdmin) {
            filters = { _id: id }
        }

        const book: IBook | null = await bookDao.findOneByFields(filters);
        if (!book) throw ERROR.BOOK_DOESNOT_EXISTS;
        return book;
    },

    /**
    * @route GET /books/all
    * @group Books - Operations related to book management
    * @param {number} limit - Number of books per page
    * @param {number} page - Current page number
    * @param {string} searchBy - Search query (case-insensitive)
    * @param {string} order - Sorting order (asc/desc)
    * @param {string} sortBy - Field to sort by
    * @returns {object} 200 - Successfully retrieved books with pagination
    * @returns {Error} 500 - Internal Server Error
    */
    getAllBooks: async (query: { limit: number, page: number, searchBy: string, order: string, sortBy: any }) => {

        const regex = new RegExp(query.searchBy, "i");

        /**
         * This operation is Specifically for the MongoDB Database
         */
        const bookModel = bookDao.getModel() as mongoose.Model<IBook>;
        const allowedSortFields = Object.values(SortFields);
        const sortField = allowedSortFields.includes(query.sortBy) ? query.sortBy : SortFields.CREATED_AT;
        const sortOrder = query.order === "asc" ? 1 : -1;
        const populateFieldsArray = Object.values(BOOK_POPULATABLE_FIELDS);

        const data = {
            limit: query.limit,
            page: query.page,
            searchBy: query.searchBy,
            sortedField: sortField,
            sortOrder: sortOrder,
            populate: populateFieldsArray
        }

        return await getPaginatedData(bookModel, data, {
            $or: [
                { title: regex },
                { "description.short": regex },
                { "description.long": regex },
                { author: await getAuthorIds(query.searchBy) }
            ]
        })
    },

    /**
    * @route PUT /books/update/:id
    * @group Books - Operations related to book management
    * @param {string} id - Book ID
    * @param {object} updates - Fields to update in the book
    * @param {boolean} isAdminOrSuperAdmin - Determines if the requester is an admin or superadmin
    * @returns {object} 200 - Successfully updated book details
    * @returns {Error} 400 - Validation error, no updates provided
    * @returns {Error} 404 - Book does not exist
    * @returns {Error} 500 - Internal Server Error
    */
    updateBookDetails: async (id: Types.ObjectId | string, updates: Partial<IBook>, isAdminOrSuperAdmin: boolean) => {

        if (Object.keys(updates).length === 0) {
            throw ERROR.VALIDATION_ERROR_400;
        }

        const updatedBook = await bookDao.update(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!updatedBook) {
            throw ERROR.BOOK_DOESNOT_EXISTS;
        }

        return await bookController.getBookById(id, isAdminOrSuperAdmin);
    },

    /**
    * @route DELETE /books/delete
    * @group Books - Operations related to book management
    * @param {string} bookId - Book ID to be deleted
    * @param {ObjectId} adminId - Admin ID (if deleted by an admin)
    * @param {boolean} isSuperAdmin - Determines if the requester is a superadmin
    * @param {string} superAdminEmail - Superadmin email (if applicable)
    * @returns {object} 200 - Successfully marked book as deleted
    * @returns {Error} 404 - Book does not exist
    * @returns {Error} 500 - Internal Server Error
    */
    deleteBook: async (bookId: Types.ObjectId | string, adminId: Types.ObjectId | null, isSuperAdmin: boolean, superAdminEmail: string | null) => {
        if (isSuperAdmin) {
            const deletedBook = await bookDao.update(bookId, {
                status: BOOK_STATUS.DELETED, deletedBy: {
                    role: "SuperAdmin",
                    email: superAdminEmail
                }
            })

            return deletedBook;
        }

        const deletedBook = await bookDao.update(bookId, {
            status: BOOK_STATUS.DELETED, deletedBy: {
                role: "Admin",
                adminId: adminId
            }
        });

        if (!deletedBook) throw ERROR.BOOK_DOESNOT_EXISTS;

        return deletedBook;
    }
}