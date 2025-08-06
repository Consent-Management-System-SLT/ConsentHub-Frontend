# 🚀 ConsentHub Local Development Setup

This guide will help you run the complete ConsentHub Privacy Management System locally with all microservices and the frontend application.

## 📋 Prerequisites

### Required Software
1. **Node.js** (v18.0.0 or higher)
   - Download from: https://nodejs.org/
   - Verify: `node --version` and `npm --version`

2. **MongoDB** (v4.4 or higher)
   - **Option A - MongoDB Compass (Recommended for beginners):**
     - Download from: https://www.mongodb.com/products/compass
     - Includes MongoDB Community Server
   - **Option B - MongoDB Community Server:**
     - Download from: https://www.mongodb.com/try/download/community
   - **Option C - Docker:**
     - `docker run -d -p 27017:27017 --name mongodb mongo:latest`

3. **Git**
   - Download from: https://git-scm.com/

### Optional but Recommended
- **Redis** (for caching and sessions)
  - Windows: Download from https://github.com/tporadowski/redis/releases
  - Or use Docker: `docker run -d -p 6379:6379 --name redis redis:alpine`
- **Postman** or **Insomnia** (for API testing)
- **VS Code** with recommended extensions

## 🎯 Quick Start (5 Minutes)

### 1. Clone and Install
```powershell
# Navigate to your project directory
cd "c:\Users\Ojitha Rajapaksha\Downloads\Consent Management System\project"

# Install all dependencies (this will take a few minutes)
npm run install:all
```

### 2. Start MongoDB
```powershell
# If using MongoDB Compass, just open the application
# If using MongoDB Community Server:
mongod --dbpath "C:\data\db"

# Or if using Docker:
docker start mongodb
```

### 3. Start the Complete System
```powershell
# This will start all microservices and the frontend
npm run start:full
```

### 4. Access the Applications
- **Frontend Application**: http://localhost:3000
- **API Gateway**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api-docs

## 📦 System Architecture

The ConsentHub system consists of:

### Backend Microservices (Ports 3001-3010)
- **API Gateway** (Port 3001) - Main entry point and routing
- **Auth Service** (Port 3002) - Authentication and authorization
- **Consent Service** (Port 3003) - Privacy consent management
- **Preference Service** (Port 3004) - Communication preferences
- **Privacy Notice Service** (Port 3005) - Privacy policy management
- **Analytics Service** (Port 3006) - Advanced analytics and reporting
- **Agreement Service** (Port 3007) - Legal agreement management
- **Event Service** (Port 3008) - TMF669 event processing
- **Party Service** (Port 3009) - Customer/party management
- **DSAR Service** (Port 3010) - Data subject access requests

### Frontend Application
- **React Frontend** (Port 3000) - User interface
- **Vite Dev Server** - Fast development build system

### Database
- **MongoDB** (Port 27017) - Primary database
- **Redis** (Port 6379) - Caching and sessions (optional)

## 🛠️ Detailed Setup Instructions

### Step 1: Environment Configuration

Create environment files for each service:

```powershell
# Create environment file for the main project
cp .env.example .env

# Edit the .env file with your local settings
notepad .env
```

**Required Environment Variables:**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/consenthub
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Services
API_GATEWAY_PORT=3001
AUTH_SERVICE_PORT=3002
CONSENT_SERVICE_PORT=3003
PREFERENCE_SERVICE_PORT=3004
PRIVACY_NOTICE_SERVICE_PORT=3005
ANALYTICS_SERVICE_PORT=3006
AGREEMENT_SERVICE_PORT=3007
EVENT_SERVICE_PORT=3008
PARTY_SERVICE_PORT=3009
DSAR_SERVICE_PORT=3010

# Frontend
FRONTEND_URL=http://localhost:3000
VITE_API_BASE_URL=http://localhost:3001/api/v1

# Development
NODE_ENV=development
LOG_LEVEL=info
```

### Step 2: Database Setup

```powershell
# Initialize MongoDB with sample data
npm run setup:local

# Or if you prefer to start with a clean database:
mongosh --eval "use consenthub; db.dropDatabase();"
```

### Step 3: Install Dependencies

```powershell
# Install all dependencies across all microservices
npm run install:all

# This is equivalent to:
# npm install (root)
# cd backend && npm install (backend)
# cd backend/api-gateway && npm install
# cd backend/consent-service && npm install
# ... (all other services)
```

### Step 4: Start Services

#### Option A: Start Everything at Once (Recommended)
```powershell
npm run start:full
```

#### Option B: Start Services Individually
```powershell
# Terminal 1: Start MongoDB (if not using Compass)
mongod

# Terminal 2: Start Backend Services
cd backend
npm run start:all

# Terminal 3: Start Frontend
npm run dev
```

#### Option C: Start Services One by One (For Debugging)
```powershell
# Terminal 1: API Gateway
cd backend/backend/api-gateway
npm start

# Terminal 2: Auth Service
cd backend/backend/auth-service
npm start

# Terminal 3: Consent Service
cd backend/backend/consent-service
npm start

# Continue for all services...
```

## 🌐 Service URLs and Endpoints

### Frontend Application
- **Main App**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **Customer Portal**: http://localhost:3000/customer
- **CSR Dashboard**: http://localhost:3000/csr

### API Endpoints
- **API Gateway**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **API Documentation**: http://localhost:3001/api-docs

### Individual Service Health Checks
- Auth: http://localhost:3002/health
- Consent: http://localhost:3003/health
- Preference: http://localhost:3004/health
- Privacy Notice: http://localhost:3005/health
- Analytics: http://localhost:3006/health
- Agreement: http://localhost:3007/health
- Event: http://localhost:3008/health
- Party: http://localhost:3009/health
- DSAR: http://localhost:3010/health

## 🧪 Testing the System

### 1. Verify All Services are Running
```powershell
# Check all services
curl http://localhost:3001/health

# Or visit in browser: http://localhost:3001/api-docs
```

### 2. Create Test Data
```powershell
# Run the data seeding script
node backend/scripts/seed-test-data.js
```

### 3. Test User Accounts
- **Admin User**: admin@sltmobitel.lk / admin123
- **CSR User**: csr@sltmobitel.lk / csr123
- **Customer User**: customer@example.com / customer123

### 4. API Testing
Use Postman collection: `ConsentHub-API-Collection.json` (if available)

## 🚨 Troubleshooting

### Common Issues and Solutions

#### MongoDB Connection Issues
```powershell
# Check if MongoDB is running
tasklist /FI "IMAGENAME eq mongod.exe"

# If not running, start it:
mongod --dbpath "C:\data\db"

# Or using MongoDB Compass, just open the application
```

#### Port Already in Use
```powershell
# Find what's using a port (e.g., 3001)
netstat -ano | findstr :3001

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

#### Node.js Version Issues
```powershell
# Check Node.js version
node --version

# Should be v18.0.0 or higher
# If not, download latest from nodejs.org
```

#### Permission Issues
```powershell
# Run PowerShell as Administrator
# Set execution policy if needed
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### Dependencies Installation Issues
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Debugging Tips

1. **Check Service Logs**: Each service outputs logs to console
2. **MongoDB Logs**: Check MongoDB logs for database issues
3. **Browser Dev Tools**: Check console and network tabs
4. **API Gateway Logs**: Most requests go through port 3001

## 🔧 Development Workflow

### Making Changes
1. **Backend Changes**: Services auto-restart with nodemon
2. **Frontend Changes**: Vite provides hot module replacement
3. **Database Changes**: Use MongoDB Compass or CLI

### Testing Changes
1. **Unit Tests**: `npm test` in each service directory
2. **Integration Tests**: Use Postman or API client
3. **UI Tests**: Test in browser with different user roles

### Adding New Features
1. Modify the appropriate microservice
2. Update API documentation
3. Update frontend components
4. Test end-to-end functionality

## 📊 Monitoring and Analytics

### System Monitoring
- **Real-time Metrics**: http://localhost:3006/analytics/realtime
- **System Health**: http://localhost:3001/health
- **Performance Metrics**: http://localhost:3006/analytics/performance

### Database Monitoring
- **MongoDB Compass**: Connect to mongodb://localhost:27017
- **CLI Monitoring**: `mongosh --eval "db.stats()"`

## 🚀 Production Deployment

When ready to deploy to production:

1. **Environment Setup**: Update .env files for production
2. **Database**: Use MongoDB Atlas or dedicated server
3. **Process Management**: Use PM2 or similar
4. **Reverse Proxy**: Use Nginx or similar
5. **SSL/TLS**: Configure HTTPS certificates
6. **Monitoring**: Set up production monitoring

## 📞 Support

### Getting Help
- **Documentation**: Check README files in each service directory
- **API Docs**: http://localhost:3001/api-docs
- **Logs**: Check console output for error messages

### Common Commands Reference
```powershell
# Start everything
npm run start:full

# Stop everything (Ctrl+C in terminal)

# Restart a specific service
cd backend/backend/[service-name]
npm restart

# View database
mongosh consenthub

# Clear all data and restart
npm run cleanup && npm run setup:local && npm run start:full
```

---

**🎉 Congratulations!** You should now have the complete ConsentHub Privacy Management System running locally. Visit http://localhost:3000 to start exploring the application!
