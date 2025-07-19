# ConsentHub Frontend Deployment Guide - Vercel

## Prerequisites
- Vercel account
- GitHub repository (recommended) or direct folder upload
- Backend deployed on Render: https://consenthub-backend.onrender.com/

## Deployment Steps

### Method 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```powershell
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```powershell
   vercel login
   ```

3. **Deploy from project directory**
   ```powershell
   cd "c:\Users\Ojitha Rajapaksha\Downloads\Consent Management System\project"
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy project? **Y**
   - Which scope? Choose your account
   - Link to existing project? **N** (for new deployment)
   - Project name: **consenthub-frontend**
   - In which directory is your code located? **.**
   - Auto-detected framework: **Vite**
   - Want to override settings? **N**

### Method 2: Deploy via Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click "New Project"

2. **Import Repository**
   - If using GitHub: Connect and select your repository
   - If using folder: Choose "Import Third-Party Git Repository" and upload

3. **Configure Project Settings**
   - **Project Name:** consenthub-frontend
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. **Add Environment Variables**
   Add these in the Vercel dashboard under "Environment Variables":
   
   ```
   VITE_API_URL=https://consenthub-backend.onrender.com
   VITE_API_BASE_URL=https://consenthub-backend.onrender.com/api/v1
   VITE_TMF632_API_URL=https://consenthub-backend.onrender.com/tmf-api/privacyManagement/v4
   VITE_TMF669_API_URL=https://consenthub-backend.onrender.com/tmf-api/eventManagement/v4
   VITE_CUSTOMER_API_URL=https://consenthub-backend.onrender.com/customer
   VITE_CSR_API_URL=https://consenthub-backend.onrender.com/csr
   VITE_GATEWAY_API_URL=https://consenthub-backend.onrender.com
   VITE_CONSENT_API_URL=https://consenthub-backend.onrender.com/consent
   VITE_PREFERENCE_API_URL=https://consenthub-backend.onrender.com/preference
   VITE_PRIVACY_NOTICE_API_URL=https://consenthub-backend.onrender.com/privacy-notice
   VITE_PARTY_API_URL=https://consenthub-backend.onrender.com/party
   VITE_DSAR_API_URL=https://consenthub-backend.onrender.com/dsar
   VITE_EVENT_API_URL=https://consenthub-backend.onrender.com/event
   VITE_NODE_ENV=production
   VITE_APP_NAME=ConsentHub
   VITE_APP_VERSION=1.0.0
   VITE_COMPANY_NAME=SLT Mobitel
   VITE_COMPANY_LOGO=/SLTMobitel_Logo.svg.png
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

## Post-Deployment Steps

### 1. Update Backend CORS Settings
Your backend needs to allow requests from your Vercel frontend domain. Update your backend's CORS configuration to include your Vercel domain.

### 2. Test the Deployment
1. Visit your Vercel deployment URL
2. Test login functionality
3. Test API connectivity
4. Verify all features work correctly

### 3. Custom Domain (Optional)
1. In Vercel dashboard, go to your project
2. Go to "Settings" > "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Environment Variables Reference

**Required for Production:**
- `VITE_API_URL`: Your Render backend base URL
- `VITE_API_BASE_URL`: API endpoint base URL
- `VITE_TMF632_API_URL`: Privacy Management API URL
- `VITE_TMF669_API_URL`: Event Management API URL

**Service URLs:**
- All service URLs point to your Render backend with appropriate paths

**Application Settings:**
- `VITE_NODE_ENV`: Set to "production"
- `VITE_APP_NAME`: Application name
- `VITE_COMPANY_NAME`: Your company name

## Troubleshooting

### Build Fails
- Check that all dependencies are in package.json
- Ensure TypeScript types are correctly defined
- Verify environment variables are set

### API Connection Issues
- Verify backend is running on Render
- Check CORS settings in backend
- Validate environment variable URLs
- Check network requests in browser dev tools

### Routing Issues
- Ensure vercel.json has proper rewrites configuration
- Check that all routes are properly defined in React Router

## Commands Reference

```powershell
# Local development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs
```

## Support
- Vercel Documentation: https://vercel.com/docs
- Contact: support@sltmobitel.lk
