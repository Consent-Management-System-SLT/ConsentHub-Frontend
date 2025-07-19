# CORS Error Fix for ConsentHub Backend

## The Problem
Your Vercel frontend (`https://consent-management-system-api.vercel.app`) cannot access your Render backend (`https://consenthub-backend.onrender.com`) due to CORS policy.

## The Solution
Add your Vercel domain to the CORS configuration in your **backend** (on Render).

### Step 1: Update Backend CORS Settings

In your backend code (on Render), update the CORS configuration to include your Vercel domain:

```javascript
// In your backend app.js or server.js file
const cors = require('cors');

const corsOptions = {
  origin: [
    'http://localhost:5173',          // Local development
    'http://localhost:3000',          // Local development  
    'https://consent-management-system-api.vercel.app',  // Your Vercel domain
    'https://*.vercel.app'            // All Vercel preview domains
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### Step 2: Redeploy Backend
After updating the CORS settings, redeploy your backend on Render.

### Step 3: Environment Variables for Vercel
Make sure these are set in Vercel:
```
VITE_API_URL=https://consenthub-backend.onrender.com
VITE_API_BASE_URL=https://consenthub-backend.onrender.com/api/v1
VITE_CUSTOMER_API_URL=https://consenthub-backend.onrender.com
VITE_NODE_ENV=production
```

### Step 4: Test
After backend redeployment, your frontend should work without CORS errors.

## Quick Test
You can test if CORS is fixed by opening browser console and running:
```javascript
fetch('https://consenthub-backend.onrender.com/api/v1/consent')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

## Alternative: Add Headers to Backend Response
If you can't modify CORS directly, ensure your backend responses include:
```javascript
res.header('Access-Control-Allow-Origin', 'https://consent-management-system-api.vercel.app');
res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
```
