# ConsentHub Frontend 🚀

[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![TM Forum](https://img.shields.io/badge/TM%20Forum-Compliant-green.svg)](https://www.tmforum.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple.svg)](https://vitejs.dev/)

A comprehensive **Privacy and Consent Management System** built with modern React, TypeScript, and TM Forum Open Digital Architecture APIs. Enterprise-ready with 95% TM Forum compliance and production-grade monitoring.

## ✨ Key Features

### 🛡️ **Privacy & Consent Management**
- **TMF632 Consent Management** - Complete consent lifecycle (create, update, revoke)
- **TMF641 Party Management** - Customer identity and profile management  
- **TMF669 Event Management** - Real-time event notifications and WebSocket support
- **TMF620 Product Catalog** - Offer-specific consent and preference management
- **TMF651 Agreement Management** - Digital agreements and signatures

### 📊 **Advanced Capabilities**
- **Production Monitoring** - Real-time system health and performance metrics
- **GDPR/CCPA/PDP Compliance** - Complete data subject rights implementation
- **Multi-language Support** - English, Sinhala, and Tamil
- **Role-based Dashboards** - Admin, CSR, and Customer interfaces
- **Audit Trail** - Comprehensive compliance logging

### 🏗️ **Enterprise Architecture**
- **Microservices Integration** - 9 backend services with API Gateway
- **Real-time Updates** - WebSocket events for live data synchronization
- **Responsive Design** - Mobile-first UI with Tailwind CSS
- **Type Safety** - Full TypeScript implementation

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and npm
- **Backend services** running (see backend README)

### Installation

```bash
# Clone the repository
git clone https://github.com/Consent-Management-System-SLT/ConsentHub-Frontend.git
cd ConsentHub-Frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your backend URLs

# Start development server
npm run dev
```

Your application will be running at `http://localhost:5173`

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build optimized production bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |
| `npm run type-check` | Run TypeScript type checking |

## ⚙️ Environment Configuration

Create `.env.local` with your backend service URLs:

```env
# API Gateway
VITE_GATEWAY_API_URL=https://your-backend.onrender.com

# Microservices URLs
VITE_CONSENT_API_URL=https://your-backend.onrender.com/api/v1/consent
VITE_PREFERENCE_API_URL=https://your-backend.onrender.com/api/v1/preference
VITE_PARTY_API_URL=https://your-backend.onrender.com/api/v1/party
VITE_DSAR_API_URL=https://your-backend.onrender.com/api/v1/dsar
VITE_EVENT_API_URL=https://your-backend.onrender.com/api/v1/event
VITE_CATALOG_API_URL=https://your-backend.onrender.com/api/v1/catalog
```

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── admin/           # Admin dashboard components
│   ├── customer/        # Customer portal components
│   ├── csr/            # CSR dashboard components
│   ├── auth/           # Authentication components
│   ├── shared/         # Shared UI components
│   └── ui/             # Base UI components
├── services/           # API service layer (16 services)
│   ├── multiServiceApiClient.ts    # Centralized API client
│   ├── tmf620ProductCatalogService.ts
│   ├── advancedMonitoringService.ts
│   └── ...
├── hooks/              # Custom React hooks
├── contexts/           # React contexts (Auth, etc.)
├── types/              # TypeScript type definitions
├── i18n/               # Internationalization files
└── data/              # Mock data and utilities
```

## 🔌 API Integration

### Service Layer Architecture
```typescript
import { 
  consentService, 
  preferenceService, 
  tmf620ProductCatalogService,
  advancedMonitoringService 
} from './services';

// Create consent
const consent = await consentService.createConsent({
  partyId: 'customer-123',
  purpose: 'marketing',
  status: 'granted'
});

// Monitor system health
const health = await advancedMonitoringService.performSystemHealthCheck();
```

### React Hooks Integration
```typescript
import { useAuth, useConsents } from './hooks/useApi';

function Dashboard() {
  const { user } = useAuth();
  const { data: consents, loading } = useConsents(user?.id);
  
  return <ConsentManagement consents={consents} />;
}
```

See **[FRONTEND_INTEGRATION_GUIDE.md](./FRONTEND_INTEGRATION_GUIDE.md)** for detailed integration examples.

## 🎯 Key Components

### **Admin Dashboard**
- System monitoring and health checks
- User management and role assignments
- Bulk consent operations
- Compliance reporting and analytics

### **Customer Portal** 
- Personal consent management
- Communication preference settings
- Data subject rights (DSAR) requests
- Privacy notice acknowledgments

### **CSR Dashboard**
- Customer search and profile management
- Consent history and audit trails
- DSAR request processing
- Guardian consent management

### **Monitoring Dashboard**
- Real-time system health monitoring
- Performance metrics and analytics
- Alert management and notifications
- Service status and uptime tracking

## 🌐 Deployment

### **Vercel (Recommended)**
```bash
npm run build
vercel --prod
```

### **Docker**
```bash
docker build -t consenthub-frontend .
docker run -p 3000:3000 consenthub-frontend
```

### **Environment-Specific Builds**
- Development: `.env.development`
- Staging: `.env.staging` 
- Production: `.env.production`

## 🏢 Enterprise Features

### **Compliance & Security**
- **GDPR Article 7** - Consent management
- **GDPR Articles 15-22** - Data subject rights
- **CCPA** - California privacy compliance
- **PDP Act (Sri Lanka)** - Local privacy regulations
- **Audit Logging** - Complete action tracking
- **Data Minimization** - Privacy by design

### **Performance & Monitoring**
- **Real-time Monitoring** - System health dashboards
- **Performance Analytics** - Response time tracking
- **Error Tracking** - Comprehensive error handling
- **Load Balancing** - Multi-service architecture
- **Caching Strategies** - Optimized data fetching

### **Scalability**
- **Microservices Ready** - Service-oriented architecture
- **Event-Driven** - TMF669 event management
- **API Gateway** - Centralized request routing
- **Horizontal Scaling** - Cloud-native deployment

## 🧪 Testing

```bash
# Unit tests
npm run test

# Integration tests  
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## 🔧 Development Tools

- **Vite** - Lightning fast build tool
- **TypeScript** - Type safety and IntelliSense
- **ESLint** - Code quality and consistency
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Axios** - HTTP client with interceptors

## 📊 System Status

- ✅ **95% TM Forum Compliance** (TMF620/632/641/651/669)
- ✅ **Production Ready** - Enterprise monitoring and alerting
- ✅ **Clean Architecture** - 241 optimized source files
- ✅ **Type Safe** - 100% TypeScript coverage
- ✅ **Mobile Ready** - Responsive design
- ✅ **Multi-language** - i18n support

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Code Quality**: Follow TypeScript and React best practices
2. **Architecture**: Maintain service layer patterns
3. **Testing**: Include tests for new features
4. **Documentation**: Update relevant documentation
5. **TM Forum**: Follow TMF API specifications
6. **Security**: Include proper error handling and validation

### **Development Setup**
```bash
# Install dependencies
npm install

# Start with backend services
npm run dev:full

# Run tests
npm run test:watch
```

## 📝 Documentation

- **[Frontend Integration Guide](./FRONTEND_INTEGRATION_GUIDE.md)** - Detailed API integration
- **[Setup Guide](./SETUP_GUIDE.md)** - Development environment setup
- **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)** - Recent improvements
- **[Compliance Assessment](./PROJECT_PROPOSAL_COMPLIANCE_ASSESSMENT.md)** - TM Forum compliance

## 📧 Support

For technical support or questions:
- 📖 Check the integration guide and documentation
- 🔍 Review component examples and service implementations
- 🧪 Test with provided hooks and utilities
- 🐛 Report issues through GitHub Issues

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

**Built for enterprise privacy compliance and modern web standards.**
