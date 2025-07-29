# ConsentHub MongoDB Integration - Test Guide

## System Status
✅ **Backend Server**: Running on http://localhost:3001
✅ **Frontend Server**: Running on http://localhost:5174
✅ **MongoDB Atlas**: Connected and operational
✅ **Database Seeding**: Complete with test users

## Testing the Complete User Registration & Login Flow

### 1. Access the Application
- Frontend: http://localhost:5174
- You should see the ConsentHub login page

### 2. Test User Registration

#### Step 1: Navigate to Sign Up
- Click "Sign Up" link on the login page
- You should see the registration form

#### Step 2: Fill Registration Form
Use these test details:
```
First Name: Jane
Last Name: Smith
Email: jane.smith@example.com
Phone: +94771234567
Company: SLT-Mobitel
Department: Marketing
Job Title: Marketing Manager
Password: Test123!@#
Confirm Password: Test123!@#
✅ Agree to Terms and Conditions
```

#### Step 3: Submit Registration
- Click "Create Account"
- Should see success message: "Account created successfully!"
- Should redirect to login page with pre-filled email

### 3. Test User Login

#### Step 1: Login with New Account
- Email: jane.smith@example.com
- Password: Test123!@#
- Click "Sign In"

#### Step 2: Verify Dashboard Access
- Should redirect to customer dashboard
- Should see personalized welcome message
- Should display user profile information

### 4. Test Profile Management

#### Step 1: Access User Profile
- Click on user profile/settings in the dashboard
- Should see user details from MongoDB

#### Step 2: Update Profile Information
- Try updating phone number, department, etc.
- Changes should save to MongoDB
- Refresh page to verify persistence

### 5. Test Pre-existing Accounts

Try logging in with these pre-seeded accounts:

#### Customer Account:
- Email: customer@sltmobitel.lk
- Password: customer123
- Role: Customer

#### Admin Account:
- Email: admin@sltmobitel.lk  
- Password: admin123
- Role: Admin

#### CSR Account:
- Email: csr@sltmobitel.lk
- Password: csr123
- Role: CSR

## What to Verify

### Registration Process:
1. ✅ Form validation (required fields, email format, password strength)
2. ✅ Duplicate email detection
3. ✅ Account creation in MongoDB
4. ✅ Success message and redirect
5. ✅ JWT token generation

### Login Process:
1. ✅ Email/password validation
2. ✅ MongoDB user authentication
3. ✅ JWT token generation
4. ✅ User session management
5. ✅ Role-based dashboard routing

### Profile Management:
1. ✅ Display MongoDB user data
2. ✅ Profile update functionality
3. ✅ Data persistence
4. ✅ Field validation

### Dashboard Features:
1. ✅ User profile display
2. ✅ Account creation date
3. ✅ Last login tracking
4. ✅ Consent management integration

## MongoDB Database Verification

### Check User Collection:
1. Login to MongoDB Atlas
2. Navigate to ConsentDB database
3. Check 'users' collection
4. Verify new user records are created
5. Confirm user data structure matches schema

### User Document Example:
```json
{
  "_id": ObjectId("..."),
  "email": "jane.smith@example.com",
  "password": "Test123!@#",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+94771234567",
  "company": "SLT-Mobitel",
  "department": "Marketing",
  "jobTitle": "Marketing Manager",
  "role": "customer",
  "status": "active",
  "emailVerified": false,
  "isActive": true,
  "acceptTerms": true,
  "acceptPrivacy": true,
  "language": "en",
  "lastLoginAt": "2024-01-01T00:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## API Testing

### Test Registration API:
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "Test123!@#",
    "phone": "+94771234567",
    "company": "SLT-Mobitel",
    "acceptTerms": true,
    "acceptPrivacy": true
  }'
```

### Test Login API:
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

### Test Profile API:
```bash
curl -X GET http://localhost:3001/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Troubleshooting

### Common Issues:

1. **Connection Refused**: Check if backend is running on port 3001
2. **CORS Errors**: Verify CORS configuration in backend
3. **Database Errors**: Check MongoDB Atlas connection
4. **Authentication Errors**: Verify JWT secret configuration
5. **Frontend API Errors**: Check VITE_API_URL in .env

### Debug Logs:

Backend logs should show:
```
MongoDB Connected: [cluster-url]
Database: consentDB
New user registered: [email] ID: [mongodb-id]
Login successful: [email] Role: [role]
```

Frontend console should show:
- Successful API responses
- JWT token storage
- User data in localStorage

## Success Criteria

✅ **Registration**: New users can create accounts
✅ **Login**: Users can authenticate with MongoDB credentials  
✅ **Dashboard**: Personalized dashboard displays MongoDB user data
✅ **Profile**: Users can view and update their MongoDB profile
✅ **Persistence**: All data persists in MongoDB Atlas
✅ **Security**: Passwords and tokens handled securely
✅ **Validation**: Proper form validation and error handling

## Next Steps

After successful testing:
1. Implement password hashing (bcrypt)
2. Add email verification
3. Implement password reset functionality
4. Add profile picture upload
5. Enhance security measures
6. Add audit logging
7. Implement role-based permissions
