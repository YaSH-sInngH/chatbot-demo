# Authentication System Documentation

## Overview
This NestJS backend provides a complete authentication system with JWT tokens, user registration, login, and profile management.

## Features
- User registration with email/password
- User login with JWT token generation
- JWT token validation middleware
- Protected routes with guards
- Password hashing with bcrypt
- PostgreSQL database integration
- CORS enabled for frontend integration

## Environment Setup

### Required Environment Variables
Copy `.env.example` to `.env` and configure:

```bash
# Database
DB_URL=postgresql://username:password@host:port/database

# Server
PORT=5000
FRONTEND_ORIGIN=http://localhost:3000

# JWT
JWT_SECRET=your-secure-secret-key
JWT_EXPIRATION_TIME=7d
```

## API Endpoints

### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### POST /auth/login
Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### GET /auth/me
Get current user profile (requires JWT token).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (Unique)
- `password` (Hashed)
- `name`
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

## Security Features
- Password hashing with bcrypt (10 rounds)
- JWT token expiration (configurable)
- CORS protection
- Input validation with class-validator
- SQL injection protection with TypeORM

## Testing the Authentication

### Using cURL
```bash
# Register
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get Profile
curl -X GET http://localhost:5000/auth/me \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Using Postman
1. Import the endpoints into Postman
2. Use the Bearer Token authorization type for protected routes
3. Set the token value from the login response

## Frontend Integration

### Next.js Example
```typescript
// services/auth.ts
const API_URL = 'http://localhost:5000';

export const authService = {
  async register(email: string, password: string, name: string) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    return response.json();
  },

  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  async getProfile(token: string) {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },
};
```

## Error Handling

### Common Error Responses
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Invalid credentials or expired token
- `409 Conflict`: Email already exists during registration
- `500 Internal Server Error`: Server-side issues

## Development

### Starting the Server
```bash
# Install dependencies
npm install

# Start in development mode
npm run start:dev
```

### Database Migration
The database will auto-sync with the schema using `synchronize: true` in development. Set to `false` in production.

## Production Considerations
- Set `synchronize: false` in DatabaseModule
- Use proper SSL certificates
- Use environment-specific JWT secrets
- Implement rate limiting
- Add refresh token mechanism
- Set up proper logging