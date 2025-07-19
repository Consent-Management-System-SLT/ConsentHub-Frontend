# Emergency Cache Clear Instructions

## The Problem
Your browser cached the OLD JavaScript files with `/api/vl/` endpoints.
The new corrected code uses `/api/v1/` but browser won't load it.

## Solution Steps

### 1. Complete Browser Cache Clear
```
Chrome/Edge: Ctrl+Shift+Delete → "All time" → Check all boxes → Clear
Firefox: Ctrl+Shift+Delete → "Everything" → Check all boxes → Clear  
Safari: Cmd+Option+E → Clear
```

### 2. Hard Refresh Methods
```
Method 1: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
Method 2: F12 → Right-click refresh → "Empty Cache and Hard Reload"
Method 3: F12 → Network tab → Check "Disable cache" → Refresh
```

### 3. Incognito Test
```
Chrome: Ctrl+Shift+N
Firefox: Ctrl+Shift+P  
Edge: Ctrl+Shift+N
```

### 4. If Still Not Working - Force New Deploy
```
1. Make a small change to any file (add a comment)
2. Push to GitHub
3. Vercel will auto-deploy with new cache-busting hashes
```

## Expected After Cache Clear
✅ `/api/v1/consent` (not `/api/vl/`)
✅ `/api/v1/party/party` 
✅ `/api/v1/preference`
✅ `/api/v1/dsar/dsarRequest`

## Still Having Issues?
The JavaScript files show `index-B4tCQX_m.js` - this means cached files.
After cache clear, you should see different filenames with new hashes.
