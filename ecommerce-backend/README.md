# E-commerce Backend API

A scalable, RESTful backend for an e-commerce platform built with 
**Node.js**,
**Express**,
**PostgreSQL**
**Prisma ORM**.

This project demonstrates a production-grade **3-Layer Architecture** (Controller-Service-Repository) focusing on separation of concerns, data integrity, and scalability.

------------------------------

## 🛠️ Architecture & Decisions
**

### 1. Tech Stack
* **Node.js & Express**: Chosen for non-blocking I/O and rapid development of REST APIs.
* **PostgreSQL**: Selected over NoSQL to ensure **ACID compliance** and relational integrity, which is critical for inventory management and order processing.
* **Prisma ORM**: Used for its type safety and **Interactive Transactions** (`$transaction`), ensuring that stock is never deducted unless an order is successfully created.

### 2. Design Pattern: 3-Layer Architecture
I implemented a strict separation of concerns to satisfy the "Scalable Architecture" requirement:
* **Controllers (API Layer)**: Handle HTTP requests, input validation, and sending responses. They contain *no* business logic.
* **Services (Business Layer)**: Contain the core logic (e.g., calculating totals, verifying stock). They are database-agnostic.
* **Repositories (Data Access Layer)**: Isolate the database implementation. This makes the code modular and easier to test or switch databases in the future.

### 3. Database Design
* **Normalization**: The schema uses 3NF (Third Normal Form). `Products` and `Orders` are linked via an `OrderItems` join table to prevent data redundancy.
* **Historical Data**: The `OrderItems` table stores a snapshot of the `price` at the time of purchase. This ensures that future price changes do not corrupt historical order records.

------------------------------

## ⚖️ Assumptions & Trade-offs
**

1.  **Stock Deduction Strategy (ACID)**
    * **Decision**: I implemented a **Pessimistic approach** using database transactions during the `POST /orders` call.
    * **Trade-off**: While this guarantees strict data integrity, it can become a bottleneck at massive scale (e.g., Amazon Prime Day). In a distributed system, I would use **Optimistic Locking** (versioning) or a message queue (Redis/RabbitMQ) to handle inventory asynchronously.

2.  **User Session = Authenticated Persistence**
    * **Decision**: The prompt required the cart to be "tied to a user session." I interpreted this as a persistent database cart linked to the User ID, rather than a temporary browser cookie.
    * **Benefit**: This allows users to access their cart across multiple devices (mobile/desktop).

3.  **Product Visibility**
    * **Decision**: The requirements explicitly stated: *"Customers can list and view product details."*
    * **Assumption**: I would likely make `GET /products` public for SEO and guest browsing.

----------------------------

## ⚙️ Setup Instructions
**

### Prerequisites
* Node.js (v20+)
* PostgreSQL Database (I have shared my cloud DB string)

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone <repo-url>
cd ecommerce-backend
npm install
npm run start

NOTE: before NPM run start make .env on root and save this value there

---.env----
DATABASE_URL="postgresql://neondb_owner:npg_5KZgQXkF8elc@ep-sweet-fog-ahbpc5i4-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
JWT_SECRET="h7J9kL2mN4pQ6rS8tU0vW2xY4zA6bC8dE0fG2hI4jK6"
PORT=3000
-----------
# E-commerce Backend API Documentation

**Base URL:** `http://localhost:3000/api`

## 🔐 Authentication

### 1. Register User
Create a new user account. Default role is `CUSTOMER`.

* **Endpoint:** `POST /auth/register`
* **Access:** Public
* **Body:**
    ```json
    {
      "email": "jane@example.com",
      "password": "strongpassword123",
      "role": "CUSTOMER" 
    }
    ```
    *(Note: You can pass `"role": "ADMIN"` to create admin users for testing purposes)*
* **Response (201 Created):**
    ```json
    {
      "message": "User registered successfully",
      "user": {
        "id": 1,
        "email": "jane@example.com",
        "role": "CUSTOMER",
        "createdAt": "2024-01-22T10:00:00.000Z"
      }
    }
    ```

### 2. Login
Authenticate a user and receive a JWT Bearer token.

* **Endpoint:** `POST /auth/login`
* **Access:** Public
* **Body:**
    ```json
    {
      "email": "jane@example.com",
      "password": "strongpassword123"
    }
    ```
* **Response (200 OK):**
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "role": "CUSTOMER"
    }
    ```

---

## 📦 Products

### 3. List Products
Retrieve a paginated list of products. Supports filtering by category and price.

* **Endpoint:** `GET /products`
* **Access:** Authenticated (Customer, Admin)
* **Query Parameters:**
    * `page`: Page number (default: `1`)
    * `limit`: Items per page (default: `10`)
    * `categoryId`: Filter by category ID (e.g., `1`)
    * `minPrice`: Filter by minimum price
    * `maxPrice`: Filter by maximum price
* **Example Request:** `GET /products?page=1&limit=5&minPrice=50&categoryId=2`
* **Response (200 OK):**
    ```json
    {
      "data": [
        {
          "id": 101,
          "name": "Wireless Headphones",
          "price": "99.99",
          "stockQuantity": 50,
          "category": { "id": 2, "name": "Electronics" }
        }
      ],
      "meta": {
        "total": 1,
        "page": 1,
        "totalPages": 1
      }
    }
    ```

### 4. Create Product
Add a new product to the inventory.

* **Endpoint:** `POST /products`
* **Access:** **Admin Only**
* **Body:**
    ```json
    {
      "name": "Gaming Mouse",
      "description": "RGB wired mouse",
      "price": 49.99,
      "stockQuantity": 100,
      "categoryId": 2
    }
    ```
* **Response (201 Created):** Returns the created product object.

### 5. Update Product
Update details or stock level of an existing product.

* **Endpoint:** `PUT /products/:id`
* **Access:** **Admin Only**
* **Body:** (Partial updates allowed)
    ```json
    {
      "price": 45.00,
      "stockQuantity": 150
    }
    ```
* **Response (200 OK):** Returns the updated product object.

### 6. Delete Product
Remove a product from the database.

* **Endpoint:** `DELETE /products/:id`
* **Access:** **Admin Only**
* **Response (200 OK):**
    ```json
    { "message": "Product deleted successfully" }
    ```

---

## 🛒 Shopping Cart

### 7. Get Cart
Retrieve the current user's shopping cart. Note that `subtotal` and `totalPrice` are calculated on the fly.

* **Endpoint:** `GET /cart`
* **Access:** Authenticated (Customer)
* **Response (200 OK):**
    ```json
    {
      "cartId": 5,
      "items": [
        {
          "productId": 101,
          "name": "Wireless Headphones",
          "price": 99.99,
          "quantity": 2,
          "subtotal": 199.98
        }
      ],
      "totalPrice": 199.98
    }
    ```

### 8. Add Item to Cart
Add a product or update the quantity if it already exists in the cart.

* **Endpoint:** `POST /cart`
* **Access:** Authenticated (Customer)
* **Body:**
    ```json
    {
      "productId": 101,
      "quantity": 2
    }
    ```
* **Response (200 OK):** Returns the updated cart object.

### 9. Remove Item
Remove a specific product from the cart.

* **Endpoint:** `DELETE /cart/:productId`
* **Access:** Authenticated (Customer)
* **Response (200 OK):** Returns the updated cart object.

---

## 🧾 Orders

### 10. Place Order
Convert the current cart into a finalized order. This endpoint performs an ACID transaction to deduct stock and clear the cart.

* **Endpoint:** `POST /orders`
* **Access:** Authenticated (Customer)
* **Body:** `{}` (Empty body, uses existing cart)
* **Response (201 Created):**
    ```json
    {
      "message": "Order placed successfully",
      "orderId": 25
    }
    ```
* **Error Response (400 Bad Request):**
    ```json
    { "error": "Insufficient stock for product: Gaming Mouse" }
    ```

### 11. View Orders
Retrieve order history.

* **Endpoint:** `GET /orders`
* **Access:** Authenticated (Customer, Admin)
* **Behavior:**
    * **Customer:** Returns only *their own* order history.
    * **Admin:** Returns *all* orders from *all* users.
* **Response (200 OK):**
    ```json
    [
      {
        "id": 25,
        "totalPrice": "199.98",
        "status": "COMPLETED",
        "createdAt": "2024-01-22T12:00:00.000Z",
        "items": [ ... ]
      }
    ]
    ```

---

## ⚠️ Common Error Codes
| Code | Description |
| :--- | :--- |
| **400** | **Bad Request:** Missing fields, invalid input, or insufficient stock. |
| **401** | **Unauthorized:** Missing or invalid JWT token. |
| **403** | **Forbidden:** Valid token but insufficient permissions (e.g., Customer trying to delete a product). |
| **404** | **Not Found:** Resource (Product, Cart, Order) not found. |
| **500** | **Internal Server Error:** Database connection failure or unexpected crash. |