# 🚀 Render Deployment Fix Guide

## 🔍 Problem Diagnosis
Your Render backend is returning 404 for `/api/v1/auth/register` because:
1. ✅ **FOUND THE ISSUE**: Your Render service is using `npm start` which runs `backend/render-server.js`
2. ✅ **ROOT CAUSE**: The `backend/render-server.js` was missing the `/api/v1/auth/register` endpoint
3. ✅ **FIXED**: I've added the missing registration endpoint to `backend/render-server.js`

## ✅ Solution Steps

### Step 1: Deploy the Updated Backend

Your Render service configuration is correct:
- **Build Command**: `npm install` ✅
- **Start Command**: `npm start` ✅ (this runs `node render-server.js` from the backend/ directory)
- **Root Directory**: `backend/` ✅

**I've fixed the missing registration endpoint in `backend/render-server.js`**

### Step 2: Redeploy to Render

1. **Commit the changes**:
   ```bash
   git add backend/render-server.js
   git commit -m "Add missing auth/register endpoint to render-server.js"
   git push
   ```

2. **Render will auto-deploy** (or manually trigger deployment in Render dashboard)

### Step 3: Set Environment Variables in Render

Make sure these are set in your Render dashboard:
```
NODE_ENV=production
PORT=10000
CORS_ORIGIN=https://consent-management-system-api.vercel.app
FRONTEND_URL=https://consent-management-system-api.vercel.app
```

### Step 4: Test the Fixed Deployment

Test these endpoints after deployment:

```bash
# Health check
GET https://consenthub-backend.onrender.com/api/v1/health

# Registration test
POST https://consenthub-backend.onrender.com/api/v1/auth/register
{
  "email": "test@example.com",
  "password": "test123",
  "firstName": "Test",
  "lastName": "User",
  "phone": "+94771234567",
  "acceptTerms": true,
  "acceptPrivacy": true
}
```

### Step 4: Emergency Fix - Use Different Backend URL

If Render continues to have issues, you can temporarily use Heroku or Railway:

**Heroku:**
```bash
heroku create consenthub-backend-alt
git subtree push --prefix=. heroku main
```

**Railway:**
```bash
railway login
railway new
railway add
railway deploy
```

Then update your Vercel environment variables to point to the new URL.

## 🔧 Quick Test Commands

Run these locally to verify everything works:

```bash
# Test registration locally
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "firstName": "Test",
    "lastName": "User", 
    "phone": "+94771234567",
    "acceptTerms": true,
    "acceptPrivacy": true
  }'
```

## 🎯 Expected Response

Your registration should return:
```json
{
  "success": true,
  "message": "Account created successfully",
  "token": "eyJpZCI6IjY4ODg2Zj...",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "role": "customer",
    "name": "Test User"
  }
}
```

## 🚨 If Still Not Working

1. Check Render logs for errors
2. Verify MongoDB Atlas connection string
3. Ensure all environment variables are set
4. Try redeploying with the production-backend.js file

The issue is definitely in the deployment configuration, not your code!
