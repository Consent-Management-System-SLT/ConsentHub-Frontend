# Production Backend Deployment Fix

## Issue
The production backend on Render.com (https://consenthub-backend.onrender.com/) is missing the authentication endpoints, causing login failures on the hosted frontend.

## Solution
The `backend/render-server.js` has been updated with the missing authentication endpoints:

### Added Authentication Features:
1. **Users Array**: Demo users (admin, csr, customer)
2. **POST /api/v1/auth/login**: Login endpoint
3. **GET /api/v1/auth/profile**: Get user profile  
4. **POST /api/v1/auth/logout**: Logout endpoint
5. **Token generation and verification**: Simple JWT-like tokens

### Demo Credentials:
- **Admin**: admin@sltmobitel.lk / admin123
- **CSR**: csr@sltmobitel.lk / csr123  
- **Customer**: customer@sltmobitel.lk / customer123

## Deployment Steps

### Option 1: Automatic Deployment (if connected to GitHub)
If your Render.com service is connected to this GitHub repository:
1. Commit and push the updated `backend/render-server.js` file
2. Render.com will automatically redeploy the backend
3. Wait 2-3 minutes for deployment to complete

### Option 2: Manual Deployment
If not connected to GitHub:
1. Go to your Render.com dashboard
2. Find your backend service
3. Click "Manual Deploy" > "Deploy latest commit"
4. Or upload the updated `backend/render-server.js` file directly

### Option 3: Environment Variables Check
Make sure your Render.com service has these environment variables:
```
NODE_ENV=production
PORT=10000
```

## Testing After Deployment
Once deployed, test the authentication endpoints:

```bash
# Test login endpoint
curl -X POST https://consenthub-backend.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@sltmobitel.lk","password":"customer123"}'
```

Expected response:
```json
{
  "success": true,
  "token": "base64-encoded-token",
  "user": {
    "id": "3",
    "email": "customer@sltmobitel.lk",
    "role": "customer",
    "name": "John Doe"
  }
}
```

## Verification
After deployment, your hosted frontend should work:
- https://consent-management-system-api.vercel.app/login
- All three demo credentials should work properly

## Files Modified
- ✅ `backend/render-server.js` - Added authentication endpoints
- ✅ `test-render-server.js` - Created for local testing

## Next Steps
1. Deploy the updated backend to Render.com
2. Test login on hosted frontend
3. Verify all user roles work correctly
