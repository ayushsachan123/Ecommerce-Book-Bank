export const CONSTANT_VALUE = {
    MAX_LIMIT: 100,
    MIN_LIMIT: 5,
    PAGE: 1
}

export const BOOK_STATUS = {
    DELETED: 0,
    ACTIVE: 1,
    ARCHIVED: 2
}

export const DATABASE_NAMES = Object.freeze({
    USERS: 'Users',
    AUTHOR: 'Author',
    BOOK: 'Book',
    CATEGORY: 'Category',
    EDITION: 'Edition'
})

export enum SortFields {
    TITLE = "title",
    PRICE = "price",
    CREATED_AT = "createdAt"
}

export const BOOK_POPULATABLE_FIELDS = {
    AUTHOR: "author",
    EDITION: "edition",
    CATEGORY: "category",
};

export const GIFTCART_STATUS = {
    DELETED: 0,
    ACTIVE: 1,
    ARCHIVED: 2
}

export const PROMOCODE_STATUS = {
    DELETED: 0,
    ACTIVE: 1,
    ARCHIVED: 2
}
