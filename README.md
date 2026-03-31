# Backend Node.js

A simple API backend built with Node.js and Express.js for user management with CRUD operations and pagination support.

## Features

- ✅ CRUD Operations for Users
- ✅ Pagination Support
- ✅ Preloaded Data (10 users)
- ✅ JSDoc Documentation
- ✅ In-memory Data Storage

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js v5
- **Module System**: ES Modules

## Getting Started

### Prerequisites

- Node.js v18 or higher

### Installation

```bash
npm install
```

### Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:8888`

## API Endpoints

### Base URL

```
http://localhost:8888
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check - API status |
| GET | `/users` | Get all users |
| GET | `/users?page=1&limit=5` | Get users with pagination |
| GET | `/users/:id` | Get user by ID |
| POST | `/users` | Create a new user |
| PATCH | `/users/:id` | Update user (partial update) |
| DELETE | `/users/:id` | Delete user |

## API Documentation

### Health Check

**GET** `/`

Response:
```json
{
  "success": true,
  "message": "Backend is running well!"
}
```

### Get All Users

**GET** `/users`

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "user1@example.com",
      "password": "pass123"
    },
    ...
  ]
}
```

### Get Users with Pagination

**GET** `/users?page=1&limit=5`

Query Parameters:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 5 | Items per page |

Response (valid page):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "user1@example.com",
      "password": "pass123"
    },
    ...
  ],
  "pagination": {
    "currentPage": 1,
    "limit": 5,
    "totalUsers": 10,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

Response (invalid page - exceeds total pages):
```json
{
  "success": false,
  "message": "Page 3 not found. Total pages: 2",
  "pagination": {
    "currentPage": 3,
    "limit": 5,
    "totalUsers": 10,
    "totalPages": 2,
    "hasNextPage": false,
    "hasPrevPage": true
  }
}
```

### Get User by ID

**GET** `/users/:id`

Response (found):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user1@example.com",
    "password": "pass123"
  }
}
```

Response (not found):
```json
{
  "success": false,
  "message": "User not found"
}
```

### Create User

**POST** `/users`

Request Body:
```json
{
  "email": "newuser@example.com",
  "password": "secret123"
}
```

Response:
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 11,
    "email": "newuser@example.com",
    "password": "secret123"
  }
}
```

### Update User (Partial Update)

**PATCH** `/users/:id`

Request Body (any field can be omitted):
```json
{
  "email": "updated@example.com"
}
```

Response:
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 1,
    "email": "updated@example.com",
    "password": "pass123"
  }
}
```

### Delete User

**DELETE** `/users/:id`

Response:
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "id": 1,
    "email": "user1@example.com",
    "password": "pass123"
  }
}
```

## Project Structure

```
backend-nodejs/
├── package.json
├── README.md
└── src/
    ├── main.js                 # Entry point
    ├── models/
    │   └── users.model.js      # Data model & storage
    ├── controllers/
    │   └── users.controller.js # Request handlers
    └── routes/
        └── users.router.js     # Route definitions
```

## Data Model

### User

| Field | Type | Description |
|-------|------|-------------|
| id | number | Unique identifier (auto-generated) |
| email | string | Email address |
| password | string | Password |

## Preloaded Data

The application comes with 10 preloaded users:

| ID | Email | Password |
|----|-------|----------|
| 1 | user1@example.com | pass123 |
| 2 | user2@example.com | pass123 |
| ... | ... | ... |
| 10 | user10@example.com | pass123 |

## HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Resource not found |