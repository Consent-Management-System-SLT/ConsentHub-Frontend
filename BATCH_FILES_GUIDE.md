# ConsentHub System - Batch File Guide

## 🚀 Available Batch Files

### 1. **start-consenthub-complete.bat** (RECOMMENDED)
**Purpose:** Starts the complete ConsentHub system with all services for Customer, CSR, and Admin dashboards.

**What it does:**
- Installs all dependencies
- Starts API Gateway (port 3000)
- Starts Customer Service (port 3011)
- Starts CSR Service (port 3012)
- Starts Privacy Notice Service (port 3003)
- Starts Auth Service (port 3007)
- Starts Frontend (port 5173)

**Usage:**
```
Double-click start-consenthub-complete.bat
```

**Access URLs:**
- Frontend: http://localhost:5173
- API Documentation: http://localhost:3000/api-docs

---

### 2. **start-customer-only.bat**
**Purpose:** Quick start for Customer Dashboard only (minimal resources).

**What it does:**
- Starts Customer Service (port 3011)
- Starts Frontend (port 5173)

**Usage:**
```
Double-click start-customer-only.bat
```

**Login:**
- Email: customer@sltmobitel.lk
- Password: customer123

---

### 3. **start-csr-dashboard.bat**
**Purpose:** Starts services for CSR (Customer Service Representative) Dashboard.

**What it does:**
- Starts Customer Service (port 3011)
- Starts CSR Service (port 3012)
- Starts Frontend (port 5173)

**Usage:**
```
Double-click start-csr-dashboard.bat
```

**Login:**
- Email: csr@sltmobitel.lk
- Password: csr123

---

### 4. **start-admin-dashboard.bat**
**Purpose:** Starts services for Admin Dashboard.

**What it does:**
- Starts API Gateway (port 3000)
- Starts Privacy Notice Service (port 3003)
- Starts Auth Service (port 3007)
- Starts Frontend (port 5173)

**Usage:**
```
Double-click start-admin-dashboard.bat
```

**Login:**
- Email: admin@sltmobitel.lk
- Password: admin123

---

### 5. **start-development.bat**
**Purpose:** Development mode with hot-reload and all services.

**What it does:**
- Starts all services
- Enables hot-reload for frontend
- Provides comprehensive development environment

**Usage:**
```
Double-click start-development.bat
```

---

### 6. **stop-consenthub.bat**
**Purpose:** Stops all ConsentHub services.

**What it does:**
- Kills all Node.js processes
- Stops npm processes
- Closes all ConsentHub windows
- Frees up ports

**Usage:**
```
Double-click stop-consenthub.bat
```

---

### 7. **check-system-status.bat**
**Purpose:** Checks system status and service health.

**What it does:**
- Checks Node.js installation
- Checks npm installation
- Checks port availability
- Tests service connectivity

**Usage:**
```
Double-click check-system-status.bat
```

---

## 🧪 Testing Guide

### Step 1: Check System Status
```
Double-click check-system-status.bat
```

### Step 2: Start Complete System
```
Double-click start-consenthub-complete.bat
```

### Step 3: Test All Roles
1. **Customer Testing:**
   - Go to http://localhost:5173
   - Login: customer@sltmobitel.lk / customer123
   - Test consent management features

2. **CSR Testing:**
   - Go to http://localhost:5173
   - Login: csr@sltmobitel.lk / csr123
   - Test customer search and management

3. **Admin Testing:**
   - Go to http://localhost:5173
   - Login: admin@sltmobitel.lk / admin123
   - Test privacy notice management

### Step 4: Stop System When Done
```
Double-click stop-consenthub.bat
```

---

## 🔧 Troubleshooting

### Issue: Services Won't Start
**Solution:**
1. Run `stop-consenthub.bat` first
2. Run `check-system-status.bat` to verify ports are free
3. Run `start-consenthub-complete.bat` again

### Issue: Port Already in Use
**Solution:**
1. Run `stop-consenthub.bat`
2. Wait 10 seconds
3. Try starting again

### Issue: Browser Shows Connection Error
**Solution:**
1. Wait 30 seconds after starting services
2. Check `check-system-status.bat` for service health
3. Try refreshing the browser

---

## 📊 Service Ports

| Service | Port | Purpose |
|---------|------|---------|
| Frontend | 5173 | Main application interface |
| API Gateway | 3000 | Central API routing |
| Customer Service | 3011 | Customer-specific APIs |
| CSR Service | 3012 | CSR-specific APIs |
| Privacy Notice Service | 3003 | Privacy notice management |
| Auth Service | 3007 | Authentication |

---

## 🎯 Quick Start Recommendation

For first-time users:
1. **Double-click `start-consenthub-complete.bat`**
2. **Wait for all services to start (30-60 seconds)**
3. **Open browser to `http://localhost:5173`**
4. **Login with any demo credentials**
5. **Explore all features**

This provides the complete ConsentHub experience with all roles and features available!
