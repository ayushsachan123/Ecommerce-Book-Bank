# eCommerce Book Bank

## Overview
The eCommerce Book Bank is a robust, secure, and scalable platform designed for book enthusiasts to buy, sell, and manage their books. The project incorporates multiple databases, extensive authentication mechanisms, logging functionalities, and encryption techniques to ensure a seamless and secure user experience.

## Features Implemented

### 1. **Dual Database Integration**
- **MongoDB**: Utilized for storing book-related data, including user transactions and inventory management.
- **Firebase**: Used for handling real-time database operations and authentication.
- Implemented a database abstraction layer to ensure seamless switching between databases when required.

### 2. **Data Access Object (DAO) Layer**
- Developed separate DAO implementations for both **MongoDB** and **Firebase**.
- Ensured modularity and reusability by abstracting database interaction logic.
- Optimized query execution for efficient database interactions.

### 3. **Logging with Winston**
- Integrated **Winston Logger** to track system events and errors efficiently.
- Implemented multiple logging levels (**info**, **warn**, **error**) to distinguish different log types.
- Logs are stored persistently for debugging and auditing purposes.

### 4. **Unit Testing for CRUD Operations**
- Developed unit tests for CRUD operations on **MongoDB** and **Firebase**.
- Implemented a generic test suite to ensure consistent behavior across both databases.
- Verified data integrity and consistency using automated tests.

### 5. **Request Validation with JOI**
- Implemented **JOI validation** to ensure incoming API requests adhere to the required schema.
- Applied validation on request body, query parameters, and headers to prevent invalid data processing.
- Enhanced security by sanitizing input fields.
- Created a **common validation function** to validate JOI schemas consistently across different routes.

### 6. **Pagination Implementation**
- Designed and implemented a **generic pagination system** for fetching large datasets efficiently.
- Supports query parameters like **page number**, **limit**, **sorting options**, and **populate**.
- Optimized queries to prevent excessive database load.
- Pagination is designed to be **reusable across different modules**, reducing redundant code.

### 7. **Authentication Mechanisms**
- **Basic Authentication**: Implemented as the initial authentication method using username and password.
- **JWT Authentication**:
  - Implemented token-based authentication for secure API access.
  - Used **JWT (JSON Web Token)** for stateless user authentication.
  - Tokens include expiration time and user roles to manage permissions.

### 8. **AES Encryption & Decryption**
- Implemented **AES encryption** for sensitive data to enhance security.
- Encrypted user authentication tokens and other confidential information before storing or transmitting.
- Implemented decryption mechanisms to retrieve original data securely.

### 9. **API Versioning**
- **Version v1**:
  - Uses traditional authentication methods (Basic Auth and JWT).
  - Follows standard API request-response structure.
- **Version v2**:
  - Introduces **AES encryption** and **decryption** for secure token management.
  - Enhances API security by encrypting access tokens.

### 10. **Session Management**
- Implemented a robust session management system to maintain user authentication states.
- **Access Token Verification**:
  - Verifies token validity before processing any request.
  - Ensures users have valid sessions before accessing protected resources.
- **Token Refresh Mechanism**:
  - If the **access token** expires, a new access token is issued using the **refresh token**.
  - If the **refresh token** is expired, returns an **unauthorized** response.
- Maintains session expiry policies to enhance security.

### 11. **Device Tracking & IP Logging**
- Implemented **IP tracking** to monitor the number of devices accessing the service.
- Enforced a limit on the maximum number of devices a user can log in from.
- Logs the IP addresses of active user sessions to detect suspicious activity.

### 12. **Config-based Environment Management**
- Introduced a **config-based approach** to manage environment variables instead of using `.env` files.
- Allows the application to run in multiple environments (e.g., LOCAL, DEVELOPMENT, PRODUCTION) using a `config.json` file.
- Example `config.json` (values to be configured by the user):
  ```json
  {
    "dbConfig": {
      "host": "<MongoDB_Host_URL>",
      "port": <MongoDB_Port>,
      "dbName": "<Database_Name>"
    },
    "PORT": "<Application_Port>",
    "firebaseURL": "<Firebase_Database_URL>",
    "ENVIRONMENT": "<Environment_Type>",
    "DAO": "<Database_Type>",
    "loggerLevel": "<Logger_Level>",
    "userName": "<Username>",
    "password": "<Password>",
    "TOKEN_HEADER_KEY": "<Token_Header_Key>",
    "JWT_SECRET_KEY": "<JWT_Secret_Key>",
    "AES_SECRET_KEY": "<AES_Secret_Key>",
    "AUTH_VERSION": "<Authentication_Version>",
    "ACCESS_TOKEN_EXPIRY_TIME": "<Access_Token_Expiry_Time>",
    "REFRESH_TOKEN_EXPIRY_TIME": "<Refresh_Token_Expiry_Time>",
    "MAXIMUM_ACTIVE_SESSION": "<Maximum_Active_Session_Limit>",
    "SUPERADMINS": [{"email": "email", "password": "password"}],
    "GST": "GST Percent",
    "giftCardExpiryDays": "Expiry Days"
  }
  ```

### 13. **Error Handling and Debugging Mechanism**
- Implemented centralized error handling middleware to standardize error responses.
- Utilized custom error classes to differentiate types of errors (e.g., ValidationError, AuthenticationError, DatabaseError).
- Integrated structured debugging logs to capture request details, execution time, and system events.

### 14. **Verification Middleware for Admin and Super Admin**

- Implemented middleware for verifying admin and super admin roles.
- Super Admin Email and password can be accessed form the config file it is not stored in the Database

- **User Role Constants:**
   - User = 0
   - Admin = 1

- Admins can only manage users but not other admins.

- Super Admin has full control over all entities.

### 15 Cart Manager

The `CartManager` class is responsible for handling cart-related operations, including calculating totals, handling fees, applying discounts, and computing the final payable amount.

#### Features Implemented

##### 1. **Delivery Details**
- Generates estimated delivery details including date, day, and time.

##### 2. **Total Cost & Quantity Calculation**
- Computes the total price and quantity of items in the cart.

##### 3. **Handling Fee Calculation**
- Generates a random handling fee between 0-50.

##### 4. **Delivery Charges Calculation**
- Generates a random delivery charge between 0-50.

##### 5. **GST Charges Calculation**
- Calculates GST based on the configured rate from the configuration file.

##### 6. **Discount Calculation**
- Computes a discount on the cart’s total price based on either a percentage or a fixed amount.
- The maximum discount value is capped at 100.

##### 7. **Final Payable Amount Calculation**
- Determines the final payable amount after applying handling fees, delivery charges, GST, and discounts.
- Discounts are applied as either a fixed amount or a percentage-based discount with a capped value.

### 16. Gift Card

#### 1. **Gift Card Eligibility**
 Implemented functionality to validate if a user is eligible for specific gift cards based on purchase criteria.

#### 2. **Create Gift Card** 
Added the ability for admins to create new gift cards with predefined discount values, expiration dates, and eligibility rules.

#### 3. **Apply Gift Card** 
Developed functionality to allow users to apply gift cards to their purchases, dynamically adjusting the total amount.

#### 4. **Remove Gift Card** 
Implemented the ability for users to remove applied gift cards from their cart before checkout.

### 15. Promo Code Eligibility Conditions

#### 1. **Minimum Order Value**
Ensures the cart's total meets the required threshold.

#### 2. **Minimum Item Count**
 Verifies item count in the cart.

#### 3. **Category-Based Eligibility**
Ensures eligible product categories are in the cart.

#### 4. **Author-Based Eligibility**
Ensures eligible authors' books are present.

#### 5. **Promo Code Expiry**
Ensures the promo code is still valid.

#### 6. **Usage Limit**
Ensures the promo code hasn't exceeded its usage limit.

### 16. Promo Code Suggestions

#### 1. **Matching Minimum Order Value**
 Recommends applicable promo codes.

#### 2. **Category or Author Match**
Suggests codes for matching items.

#### 3. **Expiring Soon**
 Prioritizes promo codes nearing expiry.

#### 4. **Highest Discount Value**
 Highlights codes with maximum discounts.

#### 5. **Popular Promo Codes**
Suggests frequently used promo codes.

## **Database Entities and Schema Design**
The database schema has been carefully designed to efficiently store user and book information. Below are the primary entities:

### **User Schema**
```typescript
{
  name: string,
  email: string,
  password: string,
  phoneNo?: number,
  role: number,
  sessions: [
    {
      accessToken: string,
      refreshToken?: {
        token: string,
        createdAt: number,
        expiresAt: number
      },
      ipAddress: string,
      createdAt: number,
      expiresAt: number
    }
  ],
  createdOn: Date,
  updatedOn: Date
}
```

### **Book Schema**
```typescript
{
  title: string,
  author: Types.ObjectId,
  description: {
    short: string,
    long: string
  },
  price: number,
  edition: Types.ObjectId,
  images: Array<{name: string, imageURL: string}>,
  category: Array<Types.ObjectId>,
  pages: number,
  status: number,
  deletedBy: {
    role: 'Admin' | 'SuperAdmin',
    adminId: Types.ObjectId,
    email: string
  },
  maxQuantity: number,
  createdAt: Date
}
```

### **Address Schema**
```typescript
{
  userId: Types.ObjectId,
  country: string,
  recepientName: string,
  phones: [
    {
      countryCode: string,
      phoneNumber: string
    }
  ],
  houseNo: string,
  city: string,
  landmark?: string,
  pincode: number,
  state: string,
  tag: "Home" | "Office" | string
}
```

### **Author Schema**
```typescript
{
  first_Name: string,
  middle_Name?: string,
  last_Name: string,
  age: number,
  country: string,
  images?: [
    {
      name: string,
      imageURL: string
    }
  ]
}
```

### **Gift Card Schema**
```typescript
{
  name: string,
  description: string,
  amount: number,
  issuerId: {
    id: Types.ObjectId,
    userType: 'User' | 'Admin' | 'SuperAdmin',
    email: string
  },
  recipientId: Types.ObjectId,
  currencyCode: string,
  status: number,
  expiryTimeStamp: number,
  isRedeemed: boolean,
  redeemedAt: number,
  createdAt: Date,
  updatedAt: Date
}
```

### **Promo Code Schema**
```typescript
{
  name: string,
  description: string,
  usageLimit: number,
  eligibility: {
    categoryId: Array<Types.ObjectId>,
    authorId: Array<Types.ObjectId>,
    minValue: number,
    minItemCount: number
  },
  typeDetail: {
    type: 'value' | 'percent' | 'percentage_with_max_value',
    value: number,
    percent: number,
    percentMaxValue: { maxValue: number, percent: number }
  },
  expiryTimeStamp: number,
  currencyCode: string,
  issuerId: {
    id: Types.ObjectId,
    userType: 'Admin' | 'SuperAdmin',
    email: string
  },
  status: number,
  createdAt: Date,
  updatedAt: Date
}
```

### **Cart Schema**
```typescript
{
  userId: Types.ObjectId,
  addressId: Types.ObjectId,
  delivery: {
    date: number,
    day: number,
    time: number
  },
  products: [
    {
      bookId: Types.ObjectId,
      quantity: number
    }
  ],
  currencyCode: "INR" | "USD" | "CAD" | "EUR",
  tip: number,
  createdAt: Date,
  updatedAt: Date
}
```

### **Category Schema**
```typescript
{
  name: string,
  description: string,
  image: string[]
}
```

### **Edition Schema**
```typescript
{
  ageGroup: number,
  language: string
}
```

## Installation & Setup
### Prerequisites
- **Node.js** (latest stable version)
- **MongoDB** & **Firebase** configured with necessary credentials
- **NPM or Yarn** installed for package management

### Steps to Run the Project
1. **Clone the repository**:
   ```sh
   git clone https://github.com/your-repo/ecommerce-book-bank.git
   cd ecommerce-book-bank
   ```
2. **Install dependencies**:
   ```sh
   npm install
   ```
3. **Configure environment settings**:
   - Update the `config.json` file with the necessary database credentials, JWT secret keys, and encryption keys.
4. **Start the server**:
   ```sh
   cross-env NODE_ENV=<Environment> node server.ts
   ```

## Technologies Used
- **Backend**: Node.js, Express.js
- **Databases**: MongoDB, Firebase
- **Security**: JWT, AES Encryption, Basic Authentication
- **Validation**: JOI
- **Logging**: Winston Logger
- **Session Management**: JWT-based session handling with refresh token support
