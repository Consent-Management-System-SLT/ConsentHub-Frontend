# Vercel Deployment Troubleshooting Guide

## Why Vercel Isn't Deploying Your Latest Commits

Your git commits are up to date (latest commit: `1561c65`), but Vercel isn't deploying. Here are the most common reasons:

### 1. Check Vercel Auto-Deploy Settings
- Go to your Vercel dashboard: https://vercel.com/dashboard
- Find your `ConsentHub-Frontend` project
- Go to **Settings** → **Git**
- Check if **Auto-Deploy** is enabled for the `main` branch

### 2. Check Build Logs in Vercel
- Go to your project in Vercel dashboard
- Click on **Deployments** tab
- Look for failed deployments with error messages
- Common issues: Build failures, environment variable errors

### 3. Manual Deployment Trigger
If auto-deploy is stuck, try manual deployment:
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy manually
vercel --prod
```

### 4. Check GitHub Integration
- In Vercel dashboard → Settings → Git
- Verify GitHub repository is correctly connected
- Check if Vercel has proper permissions to access your repo

### 5. Check for Build Failures
Your commit includes fixes to:
- `src/services/dsarService.ts` 
- `src/services/consentService.ts`
- Added documentation: `DOUBLED_ENDPOINTS_ROOT_CAUSE_FIXED.md`

Vercel might have failed to build due to:
- TypeScript errors
- Missing dependencies  
- Environment variables not set in Vercel

### 6. Required Environment Variables in Vercel
Make sure these are set in Vercel dashboard → Settings → Environment Variables:
```
VITE_API_URL=https://consenthub-backend.onrender.com
VITE_API_BASE_URL=https://consenthub-backend.onrender.com/api/v1
VITE_CUSTOMER_API_URL=https://consenthub-backend.onrender.com
VITE_NODE_ENV=production
```

### 7. Webhook Issues
- Sometimes GitHub → Vercel webhooks get stuck
- Try pushing a small change to trigger a new deployment
- Or redeploy from Vercel dashboard manually

## Next Steps:
1. **Check your Vercel dashboard** for any error messages
2. **Look at the Deployments tab** to see failed builds
3. **Try manual deployment** using the commands above
4. **Let me know what you see** in the Vercel dashboard

The most likely issue is either:
- Auto-deploy is disabled
- Build is failing due to missing environment variables
- GitHub webhook is stuck
