# ConsentHub - Frontend

## Overview

A modern, responsive frontend application for managing customer consent and privacy preferences in compliance with Sri Lanka's Personal Data Protection Act (PDPA) 2022. Built with React, TypeScript, and Tailwind CSS, this application provides a comprehensive interface aligned with TM Forum Open APIs (TMF632, TMF641, TMF669) for privacy consent management.

## 🚀 Features

### Core Functionality
- **Multi-language Support**: English, Sinhala, and Tamil localization via i18next
- **Role-based Access Control**: Admin, CSR, and Customer dashboards with specific permissions
- **Customer Self-Service Portal**: Complete consent center for customers to manage their privacy preferences
- **TMF632 Privacy Management**: Full consent lifecycle - capture, update, revoke, and audit tracking
- **Communication Preferences**: Granular control over communication channels, topics, and frequency
- **Privacy Notices Management**: Multi-version privacy policy handling with acceptance tracking
- **DSAR (Data Subject Access Rights)**: Complete data export, deletion, and rectification requests
- **Audit Trail**: Immutable logging for compliance and regulatory requirements
- **Authentication System**: Secure login, signup, and password recovery with role-based access

### User Experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern UI Components**: Clean, intuitive interface with Lucide React icons
- **Real-time Updates**: Dynamic content updates and notifications
- **Protected Routes**: Secure navigation with authentication guards
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support

## 🛠️ Technology Stack

### Frontend Core
- **React 18.3.1**: Modern React with hooks and functional components
- **TypeScript 5.5.3**: Type-safe development with comprehensive interfaces
- **Vite 5.4.2**: Fast build tool and development server with HMR
- **React Router DOM 7.6.2**: Client-side routing with protected routes

### Styling & UI
- **Tailwind CSS 3.4.1**: Utility-first CSS framework for responsive design
- **Lucide React 0.344.0**: Modern icon library with 1000+ icons
- **PostCSS 8.4.35**: CSS processing and optimization
- **Autoprefixer 10.4.18**: CSS vendor prefixing for cross-browser compatibility

### Internationalization
- **i18next 25.2.1**: Internationalization framework with namespace support
- **react-i18next 15.5.3**: React integration for i18next with hooks
- **i18next-browser-languagedetector 8.2.0**: Automatic language detection

### API & Services
- **Axios 1.10.0**: HTTP client for API communications
- **TMF632 Privacy Service**: Complete privacy consent management
- **TMF641 Party Service**: Customer identity and relationship management
- **TMF669 Event Service**: Event-driven architecture for consent changes

### Development Tools
- **ESLint 9.9.1**: Code linting with TypeScript support
- **Vite Dev Server**: Hot module replacement for development
- **TypeScript ESLint**: Advanced TypeScript linting rules

## 📁 Project Structure

```
src/
├── components/              # React components
│   ├── auth/               # Authentication components
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   └── ForgotPassword.tsx
│   ├── admin/              # Admin dashboard components
│   │   ├── AdminHeader.tsx
│   │   ├── AdminSidebar.tsx
│   │   ├── ConsentOverviewTable.tsx
│   │   ├── DashboardHome.tsx
│   │   ├── UserManagement.tsx
│   │   ├── PrivacyNoticeManager.tsx
│   │   ├── AuditLogViewer.tsx
│   │   ├── DSARManager.tsx
│   │   └── BulkImportManager.tsx
│   ├── csr/               # CSR dashboard components
│   │   ├── CSRHeader.tsx
│   │   ├── SidebarNav.tsx
│   │   ├── CustomerSearchForm.tsx
│   │   ├── ConsentHistoryTable.tsx
│   │   ├── PreferenceEditorForm.tsx
│   │   ├── DSARRequestPanel.tsx
│   │   ├── GuardianConsentForm.tsx
│   │   ├── AuditLogTable.tsx
│   │   └── HelpModal.tsx
│   ├── customer/          # Customer dashboard components
│   │   ├── CustomerHeader.tsx
│   │   ├── CustomerSidebar.tsx
│   │   ├── CustomerMainDashboard.tsx
│   │   ├── CustomerDashboardOverview.tsx
│   │   ├── ConsentCenter.tsx
│   │   ├── CustomerPreferences.tsx
│   │   ├── CustomerPrivacyNotices.tsx
│   │   ├── CustomerDSARRequests.tsx
│   │   └── CustomerDashboardDemo.tsx
│   ├── AdminDashboard.tsx   # Main admin dashboard
│   ├── CSRDashboard.tsx     # CSR dashboard
│   ├── CustomerDashboard.tsx # Customer dashboard
│   ├── ConsentManagement.tsx # Consent management interface
│   ├── CommunicationPreferences.tsx # Communication preferences
│   ├── PrivacyNotices.tsx   # Privacy notices management
│   ├── AuditTrail.tsx       # Audit trail viewer
│   ├── DSARRequests.tsx     # DSAR management
│   ├── CustomerSearch.tsx   # Customer search functionality
│   ├── Dashboard.tsx        # Main dashboard
│   ├── Navigation.tsx       # Navigation components
│   ├── LanguageSelector.tsx # Language switching
│   ├── ProtectedRoute.tsx   # Route protection
│   ├── RoleBasedDashboard.tsx # Role-based routing
│   └── UserProfile.tsx      # User profile management
├── contexts/
│   └── AuthContext.tsx      # Authentication context
├── i18n/                   # Internationalization
│   ├── index.ts            # i18n configuration
│   └── locales/            # Translation files
│       ├── en.json         # English translations
│       ├── si.json         # Sinhala translations
│       └── ta.json         # Tamil translations
├── services/               # API services
│   ├── privacyService.ts   # TMF632 Privacy Management API
│   ├── customerService.ts  # TMF641 Party Management API
│   ├── eventService.ts     # TMF669 Event Management API
│   └── eventBusService.ts  # Event bus for inter-component communication
├── types/                  # TypeScript type definitions
│   └── consent.ts          # Consent and privacy related types
├── data/
│   └── mockData.ts         # Mock data for development
├── App.tsx                 # Main application component
├── main.tsx                # Application entry point
├── index.css               # Global styles
└── vite-env.d.ts           # Vite type definitions
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn package manager
- Backend API server running (see backend README)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Consent-Management-System-SLT/ConsentHub-Frontend.git
   cd project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:3000
   VITE_TMF632_API_URL=http://localhost:3000/tmf-api/privacyManagement/v4
   VITE_TMF641_API_URL=http://localhost:3000/tmf-api/partyManagement/v4
   VITE_TMF669_API_URL=http://localhost:3000/tmf-api/eventManagement/v4
   VITE_APP_NAME=ConsentHub
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

### Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks

## 🌐 Multi-language Support

The application supports three languages:
- **English** (`en`) - Default language
- **Sinhala** (`si`) - Sinhala language support
- **Tamil** (`ta`) - Tamil language support

Language files are located in `src/i18n/locales/` and can be extended with additional translations.

## 🛡️ Security Features

- **Protected Routes**: Authentication-based route protection
- **Role-based Access**: Different permissions for different user roles
- **Secure Authentication**: JWT-based authentication with the backend
- **Input Validation**: Client-side validation for all forms
- **CORS Configuration**: Proper CORS setup for API communications

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full-featured dashboard interface
- **Tablet**: Optimized layout for medium screens
- **Mobile**: Touch-friendly interface with mobile navigation

## 🔌 API Integration

The frontend integrates with the backend through TMF Forum-compliant APIs:

### TMF632 - Privacy Management API
- **Privacy Consent Management**: Create, read, update, and revoke consents
- **Privacy Preferences**: Manage communication preferences and channels
- **Privacy Notices**: Handle versioned privacy policies and acceptance tracking
- **DSAR Processing**: Data Subject Access Rights request handling

### TMF641 - Party Management API
- **Customer Identity**: Manage customer profiles and relationships
- **Guardian Relationships**: Handle parental consent for minors
- **Party Roles**: Support different user roles (customer, guardian, CSR)

### TMF669 - Event Management API
- **Consent Change Events**: Real-time notifications for consent updates
- **Audit Events**: Complete audit trail for compliance tracking
- **Event Subscriptions**: Hub/listener pattern for external system integration

### Custom Consent APIs
- **Consent Overview**: Dashboard statistics and analytics
- **Bulk Operations**: Mass consent management and reporting
- **Compliance Reports**: PDPA and regulatory compliance status

## 📊 Compliance Features

### PDPA Compliance (Sri Lanka)
- **Consent Management**: Explicit consent capture with clear purpose definitions
- **Data Subject Rights**: Complete implementation of access, rectification, erasure, and portability rights
- **Audit Trail**: Immutable logging of all consent changes with timestamps and user tracking
- **Data Retention**: Configurable retention policies with automatic expiration
- **Cross-Border Transfer**: Compliance tracking for international data transfers
- **Breach Notification**: Automated compliance reporting and notifications

### TM Forum Standards
- **TMF632 - Party Privacy Management**: Full implementation of privacy consent lifecycle
- **TMF641 - Party Management**: Customer identity and relationship management
- **TMF669 - Event Management**: Event-driven architecture for consent change notifications
- **OpenAPI 3.0**: Standardized API documentation and integration patterns

### Regulatory Features
- **Multi-Jurisdiction Support**: Configurable rules for different regulatory regions
- **Consent Versioning**: Track and manage different versions of privacy policies
- **Legal Basis Tracking**: Document and track the legal basis for data processing
- **Guardian Consent**: Special handling for minors with parental consent requirements
- **Consent Granularity**: Fine-grained control over data types, purposes, and channels

## 🚀 Deployment

### Environment Variables
Ensure the following environment variables are set for production:
```env
VITE_API_URL=https://your-api-domain.com
VITE_TMF632_API_URL=https://your-api-domain.com/tmf-api/privacyManagement/v4
VITE_TMF641_API_URL=https://your-api-domain.com/tmf-api/partyManagement/v4
VITE_TMF669_API_URL=https://your-api-domain.com/tmf-api/eventManagement/v4
VITE_APP_NAME=ConsentHub
```

### Vercel (Recommended)
The project includes `vercel.json` configuration for easy deployment:

```bash
# Deploy to Vercel
vercel --prod
```

### Manual Deployment
```bash
# Build the project
npm run build

# Deploy the dist/ folder to your hosting provider
```

### Docker Deployment
```bash
# Build Docker image
docker build -t consenthub-frontend .

# Run container
docker run -p 3000:3000 consenthub-frontend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🆘 Support

For support and questions:
- **GitHub Issues**: Create an issue in the GitHub repository for bug reports or feature requests
- **Documentation**: Check the comprehensive component documentation in `/src/components/*/README.md`
- **Backend API**: Refer to the backend README for API documentation and integration guides
- **TMF Forum**: Visit TMF Forum official documentation for API specifications

## � Key Features by Role

### Customer Dashboard
- **Consent Center**: View and manage all consents with detailed information
- **Communication Preferences**: Configure notification channels and frequency
- **Privacy Notices**: Review and accept updated privacy policies
- **DSAR Requests**: Submit and track data subject access requests
- **Consent History**: View complete audit trail of consent changes

### CSR Dashboard
- **Customer Search**: Find and assist customers with consent management
- **Consent Management**: View and update customer consents on their behalf
- **Preference Editor**: Modify customer communication preferences
- **DSAR Processing**: Handle data subject access requests
- **Guardian Consent**: Manage parental consent for minors
- **Audit Logs**: View detailed audit trails for compliance

### Admin Dashboard
- **User Management**: Manage user accounts and roles
- **Consent Overview**: System-wide consent statistics and analytics
- **Privacy Notice Management**: Create and manage privacy policy versions
- **Bulk Operations**: Mass consent management and data import/export
- **Compliance Reporting**: Generate PDPA and regulatory compliance reports
- **Audit Log Viewer**: System-wide audit trail and compliance monitoring

## 🔄 Version History

### v1.0.0 (Current)
- **Core Features**: Complete TMF632/641/669 API integration
- **Multi-language Support**: English, Sinhala, Tamil with i18next
- **Role-based Dashboards**: Admin, CSR, and Customer interfaces
- **PDPA Compliance**: Full Sri Lankan data protection compliance
- **Consent Lifecycle**: Complete consent management from capture to revocation
- **Event-Driven Architecture**: Real-time consent change notifications
- **Responsive Design**: Mobile-first UI with Tailwind CSS
- **Accessibility**: WCAG 2.1 compliant interface

### Upcoming Features
- **Advanced Analytics**: Consent trends and behavioral insights
- **Mobile App**: Native iOS and Android applications
- **API Gateway**: Enhanced security and rate limiting
- **Real-time Notifications**: WebSocket-based live updates
- **Advanced Search**: ElasticSearch integration for enhanced filtering

---

**ConsentHub - Privacy-First Consent Management Platform**
*Built for regulatory compliance, powered by TMF Forum APIs*
