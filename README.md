# Koda B6 Backend Node

RESTful API backend for the **Koda** Coffee Shop platform, built with **Node.js** and **Express.js** using **PostgreSQL** as the database and **Redis** for caching.

## Tech Stack

- **Runtime**: Node.js 24
- **Framework**: Express.js v5
- **Database**: PostgreSQL (via `pg`)
- **Cache**: Redis
- **Auth**: JWT (`jsonwebtoken`) + Password hashing (`argon2`)
- **Upload**: Multer
- **Docs**: Swagger UI (`swagger-ui-express`)
- **Containerization**: Docker

---

## Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
  - [Health Check](#health-check)
  - [Auth](#auth)
  - [Public / Landing](#public--landing)
  - [User (Authenticated)](#user-authenticated)
  - [Admin](#admin)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Docker](#docker)

---

## Installation

```bash
# Clone repository
git clone https://github.com/Vincentius31/koda-b6-backend-node.git
cd koda-b6-backend-node

# Install dependencies
npm install
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in each variable:

```bash
cp .env.example .env
```

| Variable          | Description                                                    |
|-------------------|----------------------------------------------------------------|
| `PORT`            | Server port (example: `8888`)                                  |
| `PGHOST`          | PostgreSQL host                                                |
| `PGPORT`          | PostgreSQL port (default: `5432`)                              |
| `PGUSER`          | PostgreSQL username                                            |
| `PGPASSWORD`      | PostgreSQL password                                            |
| `PGDATABASE`      | PostgreSQL database name                                       |
| `PGSSLMODE`       | PostgreSQL SSL mode (example: `disable` / `require`)           |
| `REDIS_URL`       | Redis connection URL (example: `redis://localhost:6379`)       |
| `APP_SECRET`      | JWT secret key (use a random string, MD5 hash recommended)     |
| `FRONTEND_URL`    | Frontend URL for CORS configuration                            |
| `REDIS_CACHE_TTL` | Product cache duration in seconds (default: `60`)              |

---

## Running the Application

### Development (with auto-reload)

```bash
npm run dev
```

### Production

```bash
npm start
```

The application will run at `http://localhost:<PORT>` (default: `8888`).

### Swagger Documentation

Once the server is running, access the interactive documentation at:

```
http://localhost:8888/docs
```

### Database Migration

Run the SQL files in the `migrations/` folder in order using psql or your preferred migration tool:

```bash
psql -U <user> -d <database> -f migrations/000001_init_db.up.sql
psql -U <user> -d <database> -f migrations/000002_forgot_password.up.sql
# etc.
```

---

## Project Structure

```
koda-b6-backend-node/
├── src/
│   ├── controllers/        # Request/response logic
│   ├── models/             # Database queries
│   ├── routes/             # Route definitions
│   ├── middlewares/        # Auth, error handler, upload
│   ├── lib/                # Utilities (db, jwt, hash, redis)
│   └── main.js             # Entry point
├── migrations/             # Database migration SQL files
├── uploads/                # Upload file directory (auto-generated)
├── Dockerfile
├── package.json
└── .env.example
```

---

## Database Schema

Main tables:

| Table                | Description                                   |
|----------------------|-----------------------------------------------|
| `roles`              | User roles (user, admin)                      |
| `users`              | User data                                     |
| `category`           | Product categories                            |
| `products`           | Product data                                  |
| `products_category`  | Product ↔ category relationship (many-to-many)|
| `product_images`     | Product images                                |
| `product_variant`    | Product variants (color, etc.)                |
| `product_size`       | Product sizes                                 |
| `discount`           | Product discounts / promos                    |
| `cart`               | Shopping cart per user                        |
| `transaction`        | Purchase transactions                         |
| `transaction_product`| Items within a transaction                    |
| `review`             | Product reviews by users                      |

---

## API Endpoints

### Base URL

```
http://localhost:8888
```

### Authentication

Endpoints that require authentication must include the following header:

```
Authorization: Bearer <token>
```

The token is obtained from the `POST /auth/login` endpoint.

---

### Health Check

| Method | Endpoint | Auth | Description    |
|--------|----------|------|----------------|
| GET    | `/`      | ❌   | Server status  |

**Response `200`**
```json
{
  "success": true,
  "message": "Backend is running well!"
}
```

---

### Auth

Base path: `/auth`

#### Register

```
POST /auth/register
```

**Request Body**
```json
{
  "fullname": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "confirmPassword": "secret123"
}
```

**Response `201`**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id_user": 1,
    "fullname": "John Doe",
    "email": "john@example.com",
    "roles_id": 2
  }
}
```

---

#### Login

```
POST /auth/login
```

**Request Body**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response `200`**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id_user": 1,
    "fullname": "John Doe",
    "email": "john@example.com",
    "token": "<jwt_token>"
  }
}
```

---

#### Request Forgot Password (OTP)

```
POST /auth/forgot-password
```

**Request Body**
```json
{
  "email": "john@example.com"
}
```

**Response `200`**
```json
{
  "success": true,
  "message": "OTP code has been sent to your email",
  "data": {
    "otp_code": 123456
  }
}
```

---

#### Reset Password

```
PATCH /auth/forgot-password
```

**Request Body**
```json
{
  "email": "john@example.com",
  "otp_code": 123456,
  "new_password": "newpassword123"
}
```

**Response `200`**
```json
{
  "success": true,
  "message": "Password has been updated successfully"
}
```

---

### Public / Landing

Public endpoints, no authentication required.

#### Get Recommended Products

```
GET /landing/recommended-products
```

**Response `200`**
```json
{
  "success": true,
  "message": "Success to load recommended products",
  "data": [ ... ]
}
```

---

#### Get Latest Reviews

```
GET /landing/reviews
```

**Response `200`**
```json
{
  "success": true,
  "message": "Successfully retrieved the latest review",
  "data": [ ... ]
}
```

---

#### Get Product Catalog

```
GET /products
```

**Query Parameters**

| Parameter   | Type   | Description                        |
|-------------|--------|------------------------------------|
| `page`      | number | Page number (default: `1`)         |
| `search`    | string | Product name search keyword        |
| `category`  | string | Filter by category                 |
| `min_price` | number | Minimum price filter               |
| `max_price` | number | Maximum price filter               |

> Results are cached using Redis for `REDIS_CACHE_TTL` seconds.

**Response `200`**
```json
{
  "success": true,
  "message": "Fetch Products Successfully!",
  "data": { ... }
}
```

---

#### Get Promos

```
GET /products/promos
```

**Response `200`**
```json
{
  "success": true,
  "message": "Successfully retrieved the promos",
  "data": [ ... ]
}
```

---

#### Get Product Detail

```
GET /detail-product/:id
```

**Response `200`**
```json
{
  "success": true,
  "message": "Product Detail Fetched Successfully!",
  "data": {
    "product": { ... },
    "recommended": [ ... ]
  }
}
```

---

### User (Authenticated)

All endpoints below require the `Authorization: Bearer <token>` header.

#### Profile

| Method | Endpoint            | Description                       |
|--------|---------------------|-----------------------------------|
| GET    | `/profile`          | View own profile                  |
| PATCH  | `/profile`          | Update own profile                |
| POST   | `/profile/upload`   | Upload profile photo (form-data)  |

**PATCH `/profile` Request Body** *(all fields optional)*
```json
{
  "fullname": "John Updated",
  "email": "john@example.com",
  "password": "newpass123",
  "address": "Jl. Sudirman No. 1",
  "phone": "08123456789"
}
```

**POST `/profile/upload`**
- Content-Type: `multipart/form-data`
- Field: `profile_image` (image file)

---

#### Cart

| Method | Endpoint       | Description                  |
|--------|----------------|------------------------------|
| GET    | `/cart`        | View cart contents           |
| POST   | `/cart`        | Add item to cart             |
| PATCH  | `/cart/:id`    | Update item quantity         |
| DELETE | `/cart/:id`    | Remove item from cart        |

**POST `/cart` Request Body**
```json
{
  "product_id": 1,
  "variant_id": 2,
  "size_id": 3,
  "quantity": 2
}
```

**PATCH `/cart/:id` Request Body**
```json
{
  "quantity": 5
}
```

---

#### Transactions (User)

| Method | Endpoint              | Description                    |
|--------|-----------------------|--------------------------------|
| POST   | `/checkout`           | Process checkout               |
| GET    | `/transactions`       | Transaction history            |
| GET    | `/transactions/:id`   | Specific transaction detail    |

**POST `/checkout` Request Body**
```json
{
  "transaction_number": "TRX-20260415-001",
  "delivery_method": "JNE",
  "subtotal": 150000,
  "total": 160000,
  "payment_method": "Bank Transfer",
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "price": 75000,
      "size": "M",
      "variant": "Black"
    }
  ]
}
```

> After a successful checkout, the user's cart will be automatically cleared.

---

### Admin

Base path: `/admin`

All admin endpoints require authentication **and** the **admin** role.

#### Dashboard

| Method | Endpoint                            | Description                        |
|--------|-------------------------------------|------------------------------------|
| GET    | `/admin/dashboard/sales-category`   | Sales data by category             |
| GET    | `/admin/dashboard/best-sellers`     | Best-selling products (`?limit=10`)|
| GET    | `/admin/dashboard/order-stats`      | Order status statistics            |

---

#### Users (Admin)

| Method | Endpoint                     | Description                        |
|--------|------------------------------|------------------------------------|
| GET    | `/admin/users`               | All users (`?page=1&limit=5`)      |
| GET    | `/admin/users/:id`           | User detail by ID                  |
| POST   | `/admin/users`               | Create new user                    |
| PATCH  | `/admin/users/:id`           | Update user data                   |
| PATCH  | `/admin/users/:id/upload`    | Upload user profile photo          |
| DELETE | `/admin/users/:id`           | Delete user                        |

**POST `/admin/users` Request Body**
```json
{
  "fullname": "Jane Doe",
  "email": "jane@example.com",
  "password": "pass123",
  "roles_id": 2,
  "address": "Jl. Thamrin No. 5",
  "phone": "08198765432"
}
```

---

#### Products (Admin)

| Method | Endpoint                          | Description                       |
|--------|-----------------------------------|-----------------------------------|
| GET    | `/admin/product`                  | All products                      |
| GET    | `/admin/product/:id`              | Product detail                    |
| POST   | `/admin/product`                  | Create new product                |
| PATCH  | `/admin/product/:id`              | Update product                    |
| PATCH  | `/admin/product/:id/images`       | Upload product images (form-data) |
| DELETE | `/admin/product/:id`              | Delete product                    |
| GET    | `/admin/product/promos`           | Product promo list                |

**POST `/admin/product` Request Body**
```json
{
  "nameProduct": "Plain T-Shirt",
  "priceProduct": 75000,
  "stockProduct": 100,
  "desc": "High-quality t-shirt",
  "is_active": true
}
```

**PATCH `/admin/product/:id/images`**
- Content-Type: `multipart/form-data`
- Field: `images` (multiple image files)

---

#### Transactions (Admin)

| Method | Endpoint                          | Description                        |
|--------|-----------------------------------|------------------------------------|
| GET    | `/admin/transaction`              | All transactions                   |
| GET    | `/admin/transaction/:id`          | Transaction detail                 |
| POST   | `/admin/transaction`              | Create manual transaction          |
| PATCH  | `/admin/transaction/:id`          | Update transaction                 |
| DELETE | `/admin/transaction/:id`          | Delete transaction                 |
| GET    | `/admin/transactionproduct`       | All transaction items              |
| GET    | `/admin/transactionproduct/:id`   | Transaction item detail            |
| POST   | `/admin/transactionproduct`       | Add item to transaction            |
| PATCH  | `/admin/transactionproduct/:id`   | Update transaction item            |
| DELETE | `/admin/transactionproduct/:id`   | Delete transaction item            |

**PATCH `/admin/transaction/:id` Request Body** *(optional fields)*
```json
{
  "status": "Success",
  "delivery_method": "SiCepat",
  "payment_method": "COD"
}
```

---

## Response Format

All responses follow this standard format:

**Success**
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

**Error**
```json
{
  "success": false,
  "message": "Error message"
}
```

---

## Error Handling

| HTTP Status | Error Type      | Description                                      |
|-------------|-----------------|--------------------------------------------------|
| `400`       | Bad Request     | Invalid input / required field not provided      |
| `401`       | Unauthorized    | Token missing or invalid                         |
| `403`       | Forbidden       | No permission to access the resource             |
| `404`       | Not Found       | Resource not found                               |
| `409`       | Conflict        | Duplicate data (e.g., email already registered)  |
| `500`       | Internal Server | Server error                                     |

---

## Docker

### Build & Run

```bash
# Build image
docker build -t koda-b6-backend .

# Run container
docker run -p 8888:8888 --env-file .env koda-b6-backend
```

### Docker Compose (example)

```yaml
version: "3.8"
services:
  api:
    build: .
    ports:
      - "8888:8888"
    env_file:
      - .env
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: koda_db
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

volumes:
  pgdata:
```

---

## CI/CD

The CI/CD pipeline is configured in `.github/workflows/cicd.yml` using GitHub Actions.

---

## License

MIT