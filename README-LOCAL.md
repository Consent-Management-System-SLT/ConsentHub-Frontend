# ConsentHub - Local Development Setup

A comprehensive TMF632-aligned Privacy and Consent Management System for SLT Mobitel.

## Quick Start (Localhost)

### Prerequisites
- Node.js (v18 or higher) ✅
- npm (v8 or higher) ✅  
- Internet connection for MongoDB Atlas ✅

### Installation & Setup

1. **Install Dependencies**
   ```bash
   cd "c:\Users\Ojitha Rajapaksha\Downloads\Consent Management System\project"
   npm install
   cd backend
   npm install
   ```

2. **Environment Configuration**
   - Frontend `.env` is already configured for localhost
   - Backend `.env` is configured to use MongoDB Atlas

### Running the Application

#### Option 1: Using the Startup Scripts (Recommended)

**Windows Batch File:**
```bash
start-local.bat
```

**PowerShell Script:**
```powershell
.\start-local.ps1
```

#### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd "c:\Users\Ojitha Rajapaksha\Downloads\Consent Management System\project"
node comprehensive-backend.js
```

**Terminal 2 - Frontend:**
```bash
cd "c:\Users\Ojitha Rajapaksha\Downloads\Consent Management System\project"  
npm run dev
```

#### Option 3: Using VS Code Tasks

1. Use Command Palette (Ctrl+Shift+P)
2. Run Task: "Start Backend Server"
3. Run Task: "Start Frontend Server"

### Access Points

- **Frontend Application:** http://localhost:5174
- **Backend API:** http://localhost:3001
- **API Documentation:** http://localhost:3001/api-docs

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@sltmobitel.lk | admin123 |
| CSR | csr@sltmobitel.lk | csr123 |
| Customer | customer@sltmobitel.lk | customer123 |

### Key Features Available

✅ **User Authentication & Registration**
✅ **Admin Dashboard** - Full system overview and management
✅ **CSR Dashboard** - Customer service representative tools  
✅ **Customer Dashboard** - Personal privacy and consent management
✅ **Consent Management** - Create, view, modify consents
✅ **Preference Management** - Communication and privacy preferences
✅ **Privacy Notices** - Manage and acknowledge privacy notices
✅ **DSAR Requests** - Data Subject Access Request processing
✅ **Audit Trail** - Complete audit logging and monitoring
✅ **Guardian Consent** - Minor consent management
✅ **TMF API Compliance** - TMF632, TMF641, TMF669 standards

### Troubleshooting

**Port Conflicts:**
- If port 3001 is in use: `netstat -ano | findstr :3001` then `taskkill /PID <PID> /F`
- If port 5173/5174 is in use: Vite will automatically find the next available port

**Backend Connection Issues:**
- Ensure MongoDB Atlas credentials are correct in backend/.env
- Check internet connection for Atlas access
- Verify Node.js version is 18+

**Frontend Build Issues:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `npx vite --force`

### Development vs Production

**Current Setup:**
- **Local Development:** Uses localhost endpoints with MongoDB Atlas
- **Vercel Frontend:** Uses Render backend endpoints  
- **Render Backend:** Uses MongoDB Atlas

The local environment is now configured to work independently while maintaining database consistency with the cloud deployments.

### API Endpoints

The comprehensive backend provides all APIs:

- **Authentication:** `/api/v1/auth/*`
- **User Management:** `/api/v1/users/*`  
- **Consent Management:** `/api/v1/consent/*`
- **Preferences:** `/api/v1/preference/*`
- **Privacy Notices:** `/api/v1/privacy-notices/*`
- **DSAR:** `/api/v1/dsar/*`
- **Admin Dashboard:** `/api/v1/admin/*`
- **CSR Dashboard:** `/api/v1/csr/*`
- **Customer Dashboard:** `/api/v1/customer/*`

### TMF API Endpoints

- **TMF632 Privacy Consent:** `/api/tmf632/privacyConsent`
- **TMF641 Party:** `/api/tmf641/party`  
- **TMF669 Event Hub:** `/api/tmf669/hub`

---

🚀 **Your ConsentHub application is now running locally!**

Access the application at: http://localhost:5174
