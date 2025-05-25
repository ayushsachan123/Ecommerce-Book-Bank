import {Joi} from 'celebrate'

/**
 * @constant
 * @type {ObjectSchema}
 *
 * @property {string} [_id] - The unique identifier of the book (optional).
 * @property {string} title - The title of the book (required).
 * @property {string} [author] - The author's unique identifier (optional).
 * @property {string} [category] - The category's unique identifier (optional).
 * @property {string} [edition] - The edition's unique identifier (optional).
 * @property {number} [price] - The price of the book (optional, must be a number).
 * @property {number} [pages] - The number of pages in the book (optional, must be a number).
 */
export const checkBookPresentSchema: Joi.ObjectSchema = Joi.object({
    _id: Joi.string().optional(),
    title: Joi.string().required().messages({
        'string.base': 'Title must be a string.',
        'string.empty': 'Title cannot be empty.',
        'any.required': 'Title is required.'
    }),
    author: Joi.string().optional().messages({
        'string.base': 'Author must be a valid ObjectId string.'
    }),
    category: Joi.string().optional().messages({
        'string.base': 'Category must be a valid ObjectId string.'
    }),
    edition: Joi.string().optional().messages({
        'string.base': 'Edition must be a valid ObjectId string.'
    }),
    price: Joi.number().optional().messages({
        'number.base': 'Price must be a number.'
    }),
    pages: Joi.number().optional().messages({
        'number.base': 'Pages must be a number.'
    })
  });

/**
 * @constant
 * @type {ObjectSchema}
 *
 * @property {string} title - The title of the book (required, 3-100 characters).
 * @property {string} author - The unique identifier of the author (required).
 * @property {object} description - Object containing book descriptions.
 * @property {string} description.short - A short description (required, 10-200 characters).
 * @property {string} [description.long] - A long description (optional, 50-500 characters).
 * @property {number} price - The price of the book (required, must be greater than 0).
 * @property {string} [edition] - The edition's unique identifier (optional).
 * @property {array} [images] - An array of image objects (optional).
 * @property {string} images[].name - The name of the image (required if images are provided).
 * @property {string} images[].imageURL - The image URL (required, must be a valid URI).
 * @property {string} [category] - The category's unique identifier (optional).
 * @property {number} [pages] - The number of pages (optional, must be an integer ≥ 1).
 */
export const CreateBookSchema: Joi.ObjectSchema = Joi.object({
    title: Joi.string().min(3).max(100).required().messages({
        'string.base': 'Book title must be a string.',
        'string.empty': 'Book title cannot be empty.',
        'string.min': 'Book title must be at least 3 characters long.',
        'string.max': 'Book title cannot exceed 100 characters.',
        'any.required': 'Book title is required.'
    }),

    author: Joi.string().required().messages({
        'any.custom': 'Author must be a valid ObjectId.',
        'any.required': 'Author is required.'
    }),

    description: Joi.object({
        short: Joi.string().min(10).max(200).required().messages({
            'string.base': 'Short description must be a string.',
            'string.empty': 'Short description cannot be empty.',
            'string.min': 'Short description must be at least 10 characters long.',
            'string.max': 'Short description cannot exceed 200 characters.',
            'any.required': 'Short description is required.'
        }),
        long: Joi.string().min(50).max(500).optional().messages({
            'string.base': 'Long description must be a string.',
            'string.empty': 'Long description cannot be empty.',
            'string.min': 'Long description must be at least 50 characters long.',
            'string.max': 'Long description cannot exceed 500 characters.'
        }),
    }).required().messages({
        'object.base': 'Description must be an object with both short and long descriptions.',
        'any.required': 'Description is required.'
    }),

    price: Joi.number().greater(0).required().messages({
        'number.base': 'Price must be a number.',
        'number.greater': 'Price must be greater than 0.',
        'any.required': 'Price is required.'
    }),

    edition: Joi.string().optional().messages({
        'any.custom': 'Edition must be a valid ObjectId.'
    }),

    images: Joi.array().items(Joi.object({
        name: Joi.string().required().messages({
            'string.base': 'Image name must be a string.',
            'string.empty': 'Image name cannot be empty.',
            'any.required': 'Image name is required.'
        }),
        imageURL: Joi.string().uri().required().messages({
            'string.base': 'Image URL must be a string.',
            'string.empty': 'Image URL cannot be empty.',
            'string.uri': 'Image URL must be a valid URI.',
            'any.required': 'Image URL is required.'
        }),
    })).optional().messages({
        'array.base': 'Images must be an array of objects.',
        'any.required': 'Images are optional but must follow the defined structure if provided.'
    }),

    category: Joi.string().optional().messages({
        'any.custom': 'Category must be a valid ObjectId.'
    }),

    pages: Joi.number().integer().min(1).optional().messages({
        'number.base': 'Pages must be a number.',
        'number.integer': 'Pages must be an integer.',
        'number.min': 'Pages must be at least 1.',
    }),

    maxQuantity: Joi.number().integer().min(1).optional().messages({
        "number.base": "Max quantity must be a number.",
        "number.integer": "Max quantity must be an integer.",
        "number.min": "Max quantity must be at least 1."
    }),


}).messages({
    'object.base': 'Book details must be provided with correct fields and types.'
});

/**
 * @constant
 * @type {ObjectSchema}
 * 
 * @property {string} [title] - The title of the book (optional, 3-100 characters).
 * @property {string} [author] - The unique identifier of the author (optional).
 * @property {object} [description] - Object containing book descriptions (optional).
 * @property {string} [description.short] - A short description (optional, 10-200 characters).
 * @property {string} [description.long] - A long description (optional, 50-500 characters).
 * @property {number} [price] - The price of the book (optional, must be greater than 0).
 * @property {string} [edition] - The edition's unique identifier (optional).
 * @property {array} [images] - An array of image objects (optional).
 * @property {string} [images[].name] - The name of the image (optional).
 * @property {string} [images[].imageURL] - The image URL (optional, must be a valid URI).
 * @property {string} [category] - The category's unique identifier (optional).
 * @property {number} [pages] - The number of pages (optional, must be an integer ≥ 1).
 */
export const UpdateBookSchema: Joi.ObjectSchema = Joi.object({
  title: Joi.string().min(3).max(100).optional().messages({
      'string.base': 'Book title must be a string.',
      'string.empty': 'Book title cannot be empty.',
      'string.min': 'Book title must be at least 3 characters long.',
      'string.max': 'Book title cannot exceed 100 characters.'
  }),

  author: Joi.string().optional().messages({
      'any.custom': 'Author must be a valid ObjectId.'
  }),

  description: Joi.object({
      short: Joi.string().min(10).max(200).optional().messages({
          'string.base': 'Short description must be a string.',
          'string.empty': 'Short description cannot be empty.',
          'string.min': 'Short description must be at least 10 characters long.',
          'string.max': 'Short description cannot exceed 200 characters.',
      }),
      long: Joi.string().min(50).max(500).optional().messages({
          'string.base': 'Long description must be a string.',
          'string.empty': 'Long description cannot be empty.',
          'string.min': 'Long description must be at least 50 characters long.',
          'string.max': 'Long description cannot exceed 500 characters.'
      }),
  }).optional().messages({
      'object.base': 'Description must be an object with both short and long descriptions.'
  }),

  price: Joi.number().greater(0).optional().messages({
      'number.base': 'Price must be a number.',
      'number.greater': 'Price must be greater than 0.'
  }),

  edition: Joi.string().optional().messages({
      'any.custom': 'Edition must be a valid ObjectId.'
  }),

  images: Joi.array().items(Joi.object({
      name: Joi.string().optional().messages({
          'string.base': 'Image name must be a string.',
          'string.empty': 'Image name cannot be empty.',
      }),
      imageURL: Joi.string().uri().optional().messages({
          'string.base': 'Image URL must be a string.',
          'string.empty': 'Image URL cannot be empty.',
          'string.uri': 'Image URL must be a valid URI.',
      }),
  })).optional().messages({
      'array.base': 'Images must be an array of objects.'
  }),

  category: Joi.string().optional().messages({
      'any.custom': 'Category must be a valid ObjectId.'
  }),

  pages: Joi.number().integer().min(1).optional().messages({
      'number.base': 'Pages must be a number.',
      'number.integer': 'Pages must be an integer.',
      'number.min': 'Pages must be at least 1.',
  }),

  maxQuantity: Joi.number().integer().min(1).optional().messages({
    "number.base": "Max quantity must be a number.",
    "number.integer": "Max quantity must be an integer.",
    "number.min": "Max quantity must be at least 1."
}),

}).messages({
  'object.base': 'Book details must be provided with correct fields and types.'
});

/**
 * @constant
 * @type {ObjectSchema}
 * 
 * @property {string} bookId - The unique identifier of the book to delete (required).
 */
export const DeleteBookSchema: Joi.ObjectSchema = Joi.object({
    bookId: Joi.string().required().messages({
        'string.base': 'Book ID must be a string.',
        'string.empty': 'Book ID cannot be empty.',
        'any.required': 'Book ID is required.',
        'any.custom': 'Book ID must be a valid ObjectId.'
    })
});