# ConsentHub MongoDB Integration

This document describes the MongoDB integration setup for the ConsentHub system.

## Database Configuration

The system is configured to use MongoDB Atlas with the following connection:
- **Database**: ConsentDB
- **Collection**: users
- **URI**: `mongodb+srv://consentuser:12345@consentcluster.ylmrqgl.mongodb.net/consentDB`

## User Model Schema

```javascript
{
  email: String (required, unique, lowercase)
  password: String (required)
  firstName: String (required)
  lastName: String (required)
  phone: String (required)
  company: String (default: 'SLT-Mobitel')
  department: String (optional)
  jobTitle: String (optional)
  role: String (enum: ['admin', 'customer', 'csr'], default: 'customer')
  status: String (enum: ['active', 'inactive', 'suspended'], default: 'active')
  emailVerified: Boolean (default: false)
  isActive: Boolean (default: true)
  acceptTerms: Boolean (default: false)
  acceptPrivacy: Boolean (default: false)
  language: String (default: 'en')
  lastLoginAt: Date
  address: String (optional)
  createdAt: Date (auto-generated)
  updatedAt: Date (auto-generated)
}
```

## Quick Start

### Option 1: Using Batch Script (Windows)
```bash
start-mongodb-system.bat
```

### Option 2: Using PowerShell Script (Windows)
```powershell
.\start-mongodb-system.ps1
```

### Option 3: Manual Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Seed the database:
   ```bash
   node seedDatabase.js
   ```

3. Start the backend:
   ```bash
   node comprehensive-backend.js
   ```

4. Start the frontend:
   ```bash
   npm run dev
   ```

## Default Test Accounts

The system comes with pre-seeded test accounts:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Admin | admin@sltmobitel.lk | admin123 | System administrator |
| Customer | customer@sltmobitel.lk | customer123 | Test customer account |
| CSR | csr@sltmobitel.lk | csr123 | Customer service representative |

## Features

### User Registration
- Full name (first/last name)
- Email validation
- Phone number validation
- Password strength requirements
- Terms and privacy acceptance
- Company/department/job title information

### User Authentication
- Secure login with email/password
- JWT token-based authentication
- Session management
- Remember me functionality

### User Profile Management
- View profile information
- Edit personal details
- Update contact information
- Password change (to be implemented)

### Customer Dashboard
- Personal profile display
- Account creation date
- Last login information
- Consent management integration
- Activity tracking

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update user profile

### Customer Dashboard
- `GET /api/v1/customer/dashboard/overview` - Dashboard overview
- `GET /api/v1/customer/dashboard/profile` - Customer profile details

## Environment Variables

Make sure your `.env` file contains:

```env
MONGODB_URI=mongodb+srv://consentuser:12345@consentcluster.ylmrqgl.mongodb.net/consentDB?retryWrites=true&w=majority&appName=ConsentCluster
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

## Database Connection

The system automatically connects to MongoDB Atlas on startup. You'll see confirmation messages in the console:

```
Attempting to connect to MongoDB...
MongoDB URI: Found
MongoDB Connected: consentcluster.ylmrqgl.mongodb.net
Database: consentDB
Mongoose connected to MongoDB
```

## Frontend Integration

The React frontend automatically integrates with the MongoDB backend:

1. **Signup Page**: Creates new users in MongoDB
2. **Login Page**: Authenticates against MongoDB users
3. **Customer Dashboard**: Displays MongoDB user profile data
4. **User Profile**: Updates MongoDB user records

## Security Features

- Password validation (8+ chars, uppercase, lowercase, number, special char)
- Email uniqueness validation
- Input sanitization
- JWT token authentication
- Role-based access control

## Troubleshooting

### Connection Issues
1. Check MongoDB Atlas cluster status
2. Verify network connectivity
3. Ensure correct connection string
4. Check firewall settings

### Authentication Issues
1. Verify user exists in database
2. Check password correctness
3. Ensure JWT secret is configured
4. Check token expiration

### Registration Issues
1. Verify email uniqueness
2. Check required field validation
3. Ensure password meets requirements
4. Check terms acceptance

## Development Notes

- User passwords are stored in plain text for demo purposes (implement hashing for production)
- Email verification is not implemented (set as false by default)
- Phone verification is not implemented
- Password reset functionality needs implementation
- Consider implementing user roles and permissions system

## Production Considerations

1. **Security**:
   - Implement password hashing (bcrypt)
   - Add email verification
   - Implement rate limiting
   - Add CSRF protection

2. **Performance**:
   - Add database indexing
   - Implement caching
   - Add connection pooling
   - Monitor query performance

3. **Scalability**:
   - Consider database sharding
   - Implement horizontal scaling
   - Add load balancing
   - Monitor resource usage
