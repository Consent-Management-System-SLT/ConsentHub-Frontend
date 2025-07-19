# API `/vl/` vs `/v1/` Issue Troubleshooting Guide

## Problem Summary
Your frontend is making requests to `/api/vl/` (lowercase L) instead of `/api/v1/` (number 1).

## Root Cause Analysis
The built JavaScript file shows correct `/api/v1/` URLs, which means the issue is likely:

1. **Browser Cache** - Old cached files with wrong URLs
2. **Environment Variables** - Wrong characters in Vercel environment variables
3. **Font Rendering** - Visual confusion between 'l' and '1'

## Step-by-Step Solutions

### Solution 1: Clear Browser Cache Completely
1. **Open Browser Developer Tools** (F12)
2. **Right-click on Refresh button** → "Empty Cache and Hard Reload"
3. **Or manually clear cache:**
   - Chrome: Settings → Privacy → Clear browsing data → Check "Cached images and files"
   - Firefox: Settings → Privacy → Clear Data → Check "Cached Web Content"

### Solution 2: Force Clear All Caches
```bash
# Clear all possible caches
1. Close all browser tabs with your application
2. Clear browser cache (see above)
3. If using service workers, unregister them
4. Try incognito/private browsing mode
```

### Solution 3: Check Vercel Environment Variables
1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables
2. **Look for any environment variable with `/vl/` instead of `/v1/`**
3. **Specifically check these variables:**
   ```
   VITE_CUSTOMER_API_URL
   VITE_CSR_API_URL  
   VITE_API_BASE_URL
   VITE_CONSENT_API_URL
   VITE_PREFERENCE_API_URL
   ```
4. **Make sure they use number '1' NOT letter 'l'**

### Solution 4: Character Verification
When adding environment variables in Vercel, make sure you're typing:
- **Correct:** `api/v1/` (with number ONE)
- **Wrong:** `api/vl/` (with lowercase L)

**Visual check:** The character after 'v' should be the number 1, not lowercase L

### Solution 5: Test Local Development First
1. **Test locally first:** http://localhost:5173
2. **Open Network tab in DevTools**
3. **Verify the URLs show `/api/v1/` not `/api/vl/`**
4. **If local works correctly, the issue is in Vercel environment variables**

### Solution 6: Redeploy with Fresh Environment Variables
1. **Delete problematic environment variables in Vercel**
2. **Add them again, carefully typing `/v1/` (with number 1)**
3. **Trigger a new deployment**

## Correct Environment Variables for Vercel

**CRITICAL:** Make sure these use number '1' NOT letter 'l':

```
VITE_API_URL=https://consenthub-backend.onrender.com
VITE_API_BASE_URL=https://consenthub-backend.onrender.com/api/v1
VITE_CUSTOMER_API_URL=https://consenthub-backend.onrender.com
VITE_CSR_API_URL=https://consenthub-backend.onrender.com
VITE_CONSENT_API_URL=https://consenthub-backend.onrender.com/api/v1/consent
VITE_PREFERENCE_API_URL=https://consenthub-backend.onrender.com/api/v1/preference
```

## Testing Steps After Fix

1. **Clear browser cache completely**
2. **Visit your Vercel app URL**
3. **Open DevTools Network tab**
4. **Try customer dashboard**
5. **Verify URLs show `/api/v1/customer/consents`**
6. **NOT `/api/vl/customer/consents`**

## Expected Correct URLs After Fix:
- ✅ `https://consenthub-backend.onrender.com/api/v1/customer/consents`
- ✅ `https://consenthub-backend.onrender.com/api/v1/customer/preferences`

## If Issue Persists:
1. **Check Vercel build logs** for any errors
2. **Compare local vs production network requests**
3. **Verify your backend actually responds to `/api/v1/` endpoints**

## Quick Test Commands:
```bash
# Test backend directly
curl https://consenthub-backend.onrender.com/api/v1/consent
# Should return data, not 404

# Test wrong URL (should return 404)  
curl https://consenthub-backend.onrender.com/api/vl/consent
# Should return 404 error
```

The key is making sure you're using the number **1** not the letter **l** in your environment variables!
