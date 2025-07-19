# Clear Browser Cache to Fix /api/vl/ Issue

## The Problem
Your browser is still calling the old `/api/vl/` endpoints from cached JavaScript files.

## Solution: Complete Cache Clear

### Method 1: Hard Refresh
1. **Chrome/Edge**: Press `Ctrl+Shift+R`
2. **Firefox**: Press `Ctrl+F5`
3. **Safari**: Press `Cmd+Shift+R`

### Method 2: Developer Tools Cache Clear
1. Open **Developer Tools** (`F12`)
2. **Right-click** the refresh button
3. Select **"Empty Cache and Hard Reload"**

### Method 3: Complete Browser Cache Clear
1. **Chrome**: Settings → Privacy → Clear Browsing Data
2. Select **"All time"**
3. Check **"Cached images and files"**
4. Click **"Clear data"**

### Method 4: Incognito/Private Mode Test
1. Open **Incognito/Private window**
2. Test your Vercel app: `https://consent-management-system-api.vercel.app`
3. Check if it works without cache

## Expected Result
After clearing cache, you should see:
- ✅ Calls to `/api/v1/consent` (not `/api/vl/`)
- ✅ No 502 errors (your backend is working fine)
- ✅ Proper CORS headers (once backend CORS is fixed)
