# 🚀 ConsentHub Quick Start Guide

## Instant System Launch

### Step 1: Download and Setup
1. Extract the project files
2. Open PowerShell as Administrator
3. Navigate to the project folder:
   ```powershell
   cd "c:\Users\Ojitha Rajapaksha\Downloads\Consent Management System\project"
   ```

### Step 2: Launch the System
Choose one of these options:

#### Option A: Double-click to run (Windows)
- Double-click `start-system.bat` in Windows Explorer

#### Option B: PowerShell (Recommended)
```powershell
.\start-system.ps1
```

#### Option C: Command Line
```cmd
start-system.bat
```

### Step 3: Access the Application
The system will automatically:
1. ✅ Check Node.js installation
2. ✅ Verify MongoDB connection (optional)
3. ✅ Install dependencies if needed
4. ✅ Start backend server (Port 3001)
5. ✅ Launch frontend (Port 5173)
6. 🌐 Open your browser automatically

### Access URLs:
- **Main Application**: http://localhost:5173
- **API Server**: http://localhost:3001

### Login Credentials:
- **Admin**: admin@sltmobitel.lk / admin123
- **CSR**: csr@sltmobitel.lk / csr123  
- **Customer**: customer@sltmobitel.lk / customer123

### To Stop the System:
- Press `Ctrl+C` in the terminal
- Close the backend server window if needed

## Troubleshooting

### If Node.js is missing:
1. Download from: https://nodejs.org/
2. Install version 18.0.0 or higher
3. Restart the startup script

### If MongoDB is not running:
- The system works without MongoDB (uses in-memory data)
- For persistent data, install MongoDB Compass or Community Server

### If ports are in use:
- Kill processes using ports 3001 or 5173:
  ```powershell
  netstat -ano | findstr :3001
  taskkill /PID <process_id> /F
  ```

## Features Available:
✅ Complete Admin Dashboard  
✅ CSR (Customer Service) Portal  
✅ Customer Self-Service Portal  
✅ Consent Management  
✅ Privacy Notice Management  
✅ DSAR (Data Subject Access Requests)  
✅ Communication Preferences  
✅ Real-time Analytics  
✅ Multi-language Support (EN/SI/TA)  

**🎉 You're ready to explore ConsentHub!**
