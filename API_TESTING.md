# API Testing Guide - Stock Management System

## Base URL
```
http://localhost:3000
```

## Authentication

### Login
**Endpoint:** `POST /api/login`

**Request:**
```json
{
  "username": "testuser",
  "password": "Test@123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

**Save the token for subsequent requests**

---

## Stock Management APIs

### 1. Get All Stock Items
**Endpoint:** `GET /api/stock`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Response:**
```json
[
  {
    "item_id": 1,
    "item_name": "Laptop",
    "sku": "LP-001",
    "quantity": 15,
    "price": 799.99,
    "category": "Electronics",
    "supplier": "Tech Supplies",
    "description": "Dell Laptop",
    "reorder_level": 5,
    "created_at": "2026-04-23T10:30:00.000Z",
    "updated_at": "2026-04-23T10:30:00.000Z"
  }
]
```

---

### 2. Get Specific Stock Item
**Endpoint:** `GET /api/stock/:id`

**Example:** `GET /api/stock/1`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Response:**
```json
{
  "item_id": 1,
  "item_name": "Laptop",
  "sku": "LP-001",
  "quantity": 15,
  "price": 799.99,
  "category": "Electronics",
  "supplier": "Tech Supplies",
  "description": "Dell Laptop",
  "reorder_level": 5,
  "created_at": "2026-04-23T10:30:00.000Z",
  "updated_at": "2026-04-23T10:30:00.000Z"
}
```

---

### 3. Create New Stock Item
**Endpoint:** `POST /api/stock`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Request Body:**
```json
{
  "itemName": "Mouse",
  "sku": "MS-001",
  "quantity": 50,
  "price": 29.99,
  "category": "Accessories",
  "supplier": "Tech Supplies",
  "description": "Wireless Mouse"
}
```

**Response:**
```json
{
  "message": "Stock item created successfully",
  "item": {
    "item_id": 5,
    "itemName": "Mouse",
    "quantity": 50,
    "price": 29.99,
    "category": "Accessories"
  }
}
```

---

### 4. Update Stock Item
**Endpoint:** `PUT /api/stock/:id`

**Example:** `PUT /api/stock/1`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Request Body:**
```json
{
  "itemName": "Laptop Pro",
  "sku": "LP-001",
  "quantity": 8,
  "price": 1299.99,
  "category": "Electronics",
  "supplier": "Tech Supplies",
  "description": "MacBook Pro"
}
```

**Response:**
```json
{
  "message": "Stock item updated successfully"
}
```

**⚠️ Note:** If quantity drops to ≤ 5, automatic email alert will be sent!

---

### 5. Delete Stock Item
**Endpoint:** `DELETE /api/stock/:id`

**Example:** `DELETE /api/stock/1`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Response:**
```json
{
  "message": "Stock item deleted successfully"
}
```

---

### 6. Get Low Stock Items
**Endpoint:** `GET /api/stock/low-stock/list`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Response:**
```json
[
  {
    "item_id": 2,
    "item_name": "Keyboard",
    "sku": "KB-001",
    "quantity": 3,
    "price": 49.99,
    "category": "Accessories",
    "supplier": "Tech Supplies",
    "description": "Mechanical Keyboard",
    "reorder_level": 5
  }
]
```

---

## Testing with cURL

### Login
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"Test@123"}'
```

### Get All Stock Items
```bash
curl -X GET http://localhost:3000/api/stock \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Stock Item
```bash
curl -X POST http://localhost:3000/api/stock \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "itemName":"Keyboard",
    "quantity":25,
    "price":49.99,
    "category":"Accessories",
    "sku":"KB-001"
  }'
```

### Update Stock Item
```bash
curl -X PUT http://localhost:3000/api/stock/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "itemName":"Keyboard Pro",
    "quantity":3,
    "price":99.99,
    "category":"Accessories"
  }'
```

### Delete Stock Item
```bash
curl -X DELETE http://localhost:3000/api/stock/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Low Stock Items
```bash
curl -X GET http://localhost:3000/api/stock/low-stock/list \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Testing with Postman

### 1. Import Environment Variables
Create a Postman environment with:
```
{
  "base_url": "http://localhost:3000",
  "token": "",
  "username": "testuser",
  "password": "Test@123"
}
```

### 2. Create Requests
Use the same headers and body formats as shown above, replacing `http://localhost:3000` with `{{base_url}}` and `YOUR_TOKEN` with `{{token}}`

### 3. Save Token After Login
In Postman, after login request:
- Click "Tests" tab
- Add: `pm.environment.set("token", pm.response.json().token);`

---

## Error Responses

### 401 Unauthorized
```json
{
  "message": "Token not found, access denied"
}
```

### 403 Forbidden
```json
{
  "message": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "message": "Stock item not found"
}
```

### 400 Bad Request
```json
{
  "message": "Required fields missing"
}
```

### 500 Internal Server Error
```json
{
  "message": "An error occurred during [operation]"
}
```

---

## HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST |
| 400 | Bad Request | Missing fields |
| 401 | Unauthorized | Invalid token |
| 403 | Forbidden | Expired token |
| 404 | Not Found | Item not found |
| 500 | Server Error | Database error |

---

## Example Workflow

### Step 1: Register User
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&email=test@example.com&password=Test@123&confirmPassword=Test@123"
```

### Step 2: Login
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"Test@123"}'
```

### Step 3: Add Stock Item
```bash
# Save token from step 2
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:3000/api/stock \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "itemName":"Monitor",
    "quantity":10,
    "price":299.99,
    "category":"Electronics",
    "sku":"MON-001"
  }'
```

### Step 4: Get All Items
```bash
curl -X GET http://localhost:3000/api/stock \
  -H "Authorization: Bearer $TOKEN"
```

### Step 5: Update Item (Trigger Alert)
```bash
curl -X PUT http://localhost:3000/api/stock/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "itemName":"Monitor",
    "quantity":3,
    "price":299.99,
    "category":"Electronics"
  }'
```

📧 **Email will be automatically sent to ali.toolifykit@gmail.com**

---

## Tips

1. Always copy token after login for subsequent requests
2. Token expires in 7 days (configurable in .env)
3. Use correct Content-Type headers
4. Ensure database is initialized before testing
5. Monitor console for error messages

---

## Support

For API issues, check:
- Server logs in console
- Response status code
- Database connection status
- Email configuration

