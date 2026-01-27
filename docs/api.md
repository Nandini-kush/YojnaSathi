# API Reference - YojnaSathi

## Base URL
```
http://localhost:8000
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer {token}
```

---

## Authentication Endpoints

### 1. Register User

**Endpoint**: `POST /auth/register`

**Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure_password_123"
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### 2. Login

**Endpoint**: `POST /auth/login`

**Request**:
```json
{
  "email": "john@example.com",
  "password": "secure_password_123"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGc...",
    "token_type": "bearer"
  }
}
```

---

## Schemes Endpoints

### 3. List All Schemes

**Endpoint**: `GET /schemes`

**Query Parameters**:
- `skip` (int): Number of records to skip (default: 0)
- `limit` (int): Number of records to return (default: 100)

**Response** (200):
```json
{
  "success": true,
  "message": "Schemes retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Pradhan Mantri Awas Yojana",
      "description": "...",
      "min_age": 21,
      "max_age": 65,
      "max_income": 300000,
      "category": "General"
    }
  ]
}
```

### 4. Get Scheme Details

**Endpoint**: `GET /schemes/{scheme_id}`

**Response** (200):
```json
{
  "success": true,
  "message": "Scheme retrieved successfully",
  "data": {
    "id": 1,
    "name": "Pradhan Mantri Awas Yojana",
    "description": "Affordable housing scheme",
    "min_age": 21,
    "max_age": 65,
    "max_income": 300000,
    "category": "General",
    "documents_required": ["ID", "Income Certificate"],
    "benefits": "Loan up to ₹20 lakhs"
  }
}
```

---

## Eligibility Endpoints

### 5. Check Eligibility

**Endpoint**: `POST /eligibility/check`

**Headers**: `Authorization: Bearer {token}`

**Request**:
```json
{
  "scheme_id": 1,
  "age": 35,
  "income": 250000,
  "gender": "Male",
  "category": "General"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Eligibility checked",
  "data": {
    "scheme_id": 1,
    "scheme_name": "Pradhan Mantri Awas Yojana",
    "eligible": true,
    "reasons": [
      "Age within range",
      "Income within limit"
    ]
  }
}
```

### 6. Get Eligibility History

**Endpoint**: `GET /eligibility/history`

**Headers**: `Authorization: Bearer {token}`

**Query Parameters**:
- `scheme_id` (int, optional): Filter by scheme
- `skip` (int): Number of records to skip
- `limit` (int): Number of records to return

**Response** (200):
```json
{
  "success": true,
  "message": "Eligibility history retrieved",
  "data": [
    {
      "id": 1,
      "scheme_id": 1,
      "scheme_name": "Pradhan Mantri Awas Yojana",
      "eligible": true,
      "checked_at": "2026-01-24T10:30:00Z"
    }
  ]
}
```

---

## ML Endpoints

### 7. Get ML Recommendations

**Endpoint**: `POST /ml/recommend`

**Request**:
```json
{
  "age": 35,
  "income": 250000,
  "gender": "Male",
  "category": "General"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Recommendations generated",
  "data": {
    "user": {
      "age": 35,
      "income": 250000,
      "gender": "Male",
      "category": "General"
    },
    "recommended_schemes": [
      {
        "scheme_id": 1,
        "scheme_name": "Pradhan Mantri Awas Yojana",
        "probability": 0.95,
        "rank": 1
      },
      {
        "scheme_id": 3,
        "scheme_name": "Sukanya Samriddhi Yojana",
        "probability": 0.87,
        "rank": 2
      }
    ],
    "total_schemes": 25,
    "total_eligible": 12
  }
}
```

### 8. Check Scheme Eligibility with ML

**Endpoint**: `POST /ml/check-eligibility`

**Request**:
```json
{
  "age": 35,
  "income": 250000,
  "gender": "Male",
  "category": "General",
  "scheme_id": 1,
  "scheme_name": "Pradhan Mantri Awas Yojana",
  "scheme_min_age": 21,
  "scheme_max_age": 65,
  "scheme_income_limit": 300000,
  "scheme_category": "General"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Eligibility checked",
  "data": {
    "scheme_id": 1,
    "eligible": true,
    "probability": 0.92,
    "top_contributing_features": [
      "Age within range",
      "Income below limit"
    ]
  }
}
```

### 9. Check ML Service Health

**Endpoint**: `GET /ml/health`

**Response** (200):
```json
{
  "success": true,
  "message": "ML service is operational",
  "data": {
    "status": "operational",
    "model_loaded": true
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid request",
  "errors": ["age must be >= 0"]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized",
  "error": "Invalid or missing token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Permission denied"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details..."
}
```

---

## Response Format

All API responses follow this standard format:

```json
{
  "success": true/false,
  "message": "Description of response",
  "data": { /* Response data */ },
  "errors": [ /* Error details if any */ ]
}
```

- **success**: Boolean indicating if request was successful
- **message**: Human-readable description
- **data**: Response payload (may be object or array)
- **errors**: Array of error messages if success is false

---

## Rate Limiting

No rate limiting is currently enforced in development.

For production, implement:
- Max 100 requests per minute per IP
- Max 1000 requests per hour per user

---

## Pagination

Endpoints that return lists support pagination:

- **skip**: Offset (default: 0)
- **limit**: Number of items (default: 100, max: 1000)

---

## Filtering

List endpoints support filtering:

```
GET /schemes?category=General&min_income=100000
GET /eligibility/history?scheme_id=1&eligible=true
```

---

## Sorting

Sort by appending `_sort` parameter:

```
GET /schemes?_sort=name  (ascending)
GET /schemes?_sort=-name (descending)
```

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Recommendations
```bash
curl -X POST http://localhost:8000/ml/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "age": 35,
    "income": 250000,
    "gender": "Male",
    "category": "General"
  }'
```

---

**Last Updated**: January 2026
**API Version**: 1.0
