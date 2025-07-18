# ConsentHub Setup Guide

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm 8+
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd "Consent Management System/project"
```

2. **Install all dependencies**
```bash
npm run install:all
```

3. **Configure environment**
```bash
# Copy the environment template
cp .env.local.example .env.local

# Edit with your configuration
nano .env.local
```

4. **Start the full application**
```bash
# Windows (PowerShell)
npm run start:full

# Or start services individually
npm run start:backend    # Start backend services
npm run start:frontend   # Start frontend (in another terminal)
```

## Application URLs

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/docs

## Services Architecture

### Backend Services (Microservices)
- **API Gateway**: Port 3000 - Routes all external requests
- **Consent Service**: Port 3001 - TMF632 Privacy Consent management
- **Preference Service**: Port 3002 - Communication preferences
- **Privacy Notice Service**: Port 3003 - Privacy policy management  
- **Agreement Service**: Port 3004 - Privacy agreement management
- **Event Service**: Port 3005 - TMF669 Event management
- **Party Service**: Port 3006 - TMF641 Party management
- **Auth Service**: Port 3007 - Authentication & authorization
- **DSAR Service**: Port 3008 - Data Subject Access Rights

### Frontend Application
- **React + Vite**: Port 5173 - Main user interface
- **Tailwind CSS**: Responsive design system
- **TypeScript**: Type safety and better development experience

## Development Workflow

### 1. Frontend Development
```bash
# Start only frontend (requires backend running)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### 2. Backend Development
```bash
# Start all backend services
cd backend
npm run start:all

# Start individual services
npm run start:consent
npm run start:preference
# etc.
```

### 3. API Testing
- **Swagger UI**: http://localhost:3000/docs
- **Postman Collection**: Import from `backend/docs/`
- **curl Examples**: See `backend/examples/`

## Configuration

### Environment Variables
```bash
# .env.local
REACT_APP_API_URL=http://localhost:3000
REACT_APP_TMF632_API_URL=http://localhost:3000/api/tmf-api/partyPrivacyManagement/v4
REACT_APP_TMF641_API_URL=http://localhost:3000/api/tmf-api/partyManagement/v4
REACT_APP_TMF669_API_URL=http://localhost:3000/api/tmf-api/eventManagement/v4
```

### Service Configuration
Each backend service has its own configuration:
```bash
# backend/.env
MONGODB_URI=mongodb://localhost:27017/consenthub
JWT_SECRET=your-secret-key
PORT=3000
```

## Testing

### Frontend Tests
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e
```

### Backend Tests
```bash
cd backend
npm test
```

### API Tests
```bash
# Test all endpoints
npm run test:api

# Test specific service
npm run test:consent
```

## Troubleshooting

### Common Issues

1. **Port already in use**
```bash
# Kill processes on specific ports
npx kill-port 3000
npx kill-port 5173
```

2. **Dependencies not installing**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

3. **Backend services not starting**
```bash
# Check if MongoDB is running
mongod --version

# Check service logs
cd backend
npm run logs
```

4. **Frontend not connecting to backend**
- Check if backend is running on port 3000
- Verify CORS settings in backend
- Check browser console for errors

### Debug Mode
```bash
# Enable debug logging
REACT_APP_ENABLE_DEBUG=true npm run dev

# Backend debug mode
cd backend
DEBUG=* npm run start:all
```

## Production Deployment

### Frontend Build
```bash
# Create production build
npm run build

# The build files will be in /dist
```

### Backend Deployment
```bash
cd backend
# Production mode
NODE_ENV=production npm run start:all
```

### Docker Deployment
```bash
# Build frontend image
docker build -t consenthub-frontend .

# Build backend image
cd backend
docker build -t consenthub-backend .

# Run with docker-compose
docker-compose up
```

## Features Overview

### TMF632 Consent Management
- ✅ Create/Update/Revoke consents
- ✅ Purpose-based consent (Marketing, Analytics, etc.)
- ✅ Channel-specific consent (Email, SMS, Push)
- ✅ Temporal consent (validity periods)
- ✅ Granular consent control
- ✅ Consent audit trail

### TMF641 Party Management
- ✅ Customer profile management
- ✅ Relationship management (Guardian, CSR)
- ✅ Identity verification
- ✅ Party search and filtering

### TMF669 Event Management
- ✅ Real-time event notifications
- ✅ Event subscription management
- ✅ Event history and auditing
- ✅ Webhook integration

### Communication Preferences
- ✅ Channel preferences (Email, SMS, Push, Voice)
- ✅ Topic subscriptions
- ✅ Do Not Disturb settings
- ✅ Frequency limits
- ✅ Preference validation

### Data Subject Rights (DSAR)
- ✅ Data export requests
- ✅ Data deletion requests
- ✅ Data rectification
- ✅ Data portability
- ✅ Processing restrictions
- ✅ Request tracking and status

### Security & Compliance
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ GDPR compliance
- ✅ CCPA compliance
- ✅ Audit logging
- ✅ Data encryption

## API Endpoints

### TMF632 Privacy Consent
```
GET    /api/tmf-api/partyPrivacyManagement/v4/privacyConsent
POST   /api/tmf-api/partyPrivacyManagement/v4/privacyConsent
PATCH  /api/tmf-api/partyPrivacyManagement/v4/privacyConsent/{id}
DELETE /api/tmf-api/partyPrivacyManagement/v4/privacyConsent/{id}
```

### TMF641 Party Management
```
GET    /api/tmf-api/partyManagement/v4/party
POST   /api/tmf-api/partyManagement/v4/party
PATCH  /api/tmf-api/partyManagement/v4/party/{id}
DELETE /api/tmf-api/partyManagement/v4/party/{id}
```

### TMF669 Event Management
```
POST   /api/tmf-api/eventManagement/v4/hub
GET    /api/tmf-api/eventManagement/v4/hub
DELETE /api/tmf-api/eventManagement/v4/hub/{id}
```

### Custom DSAR Endpoints
```
GET    /api/dsar/request
POST   /api/dsar/request
PATCH  /api/dsar/request/{id}
POST   /api/dsar/request/{id}/export
POST   /api/dsar/request/{id}/delete
```

## Support

### Documentation
- **API Documentation**: http://localhost:3000/docs
- **Frontend Guide**: `FRONTEND_INTEGRATION_GUIDE.md`
- **Backend Guide**: `backend/README.md`

### Getting Help
1. Check the documentation
2. Review example code
3. Check GitHub issues
4. Contact support team

## Contributing

1. Fork the repository
2. Create feature branch
3. Follow coding standards
4. Add tests for new features
5. Submit pull request

## License

MIT License - see LICENSE file for details

---

**Happy coding! 🚀**
