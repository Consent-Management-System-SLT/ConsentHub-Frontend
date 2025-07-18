# ConsentHub - Frontend

## Overview

A modern, responsive frontend application for managing customer consent and privacy preferences in compliance with Sri Lanka's Personal Data Protection Act (PDPA) 2022. Built with React, TypeScript, and Tailwind CSS, this application provides a comprehensive interface aligned with TM Forum Open APIs (TMF632, TMF641, TMF669) for privacy consent management.

## 🚀 Features

### Core Functionality
- **Multi-language Support**: English, Sinhala, and Tamil localization
- **Role-based Access Control**: Different dashboards for different user roles
- **Customer Dashboard**: Self-service portal for customers to manage their consent preferences
- **TMF632 Privacy Management**: Consent capture, update, revoke, and tracking
- **Communication Preferences**: Granular control over communication channels and topics
- **Audit Trail**: Complete audit logging for compliance purposes
- **Authentication System**: Secure login, signup, and password recovery

### User Experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern UI Components**: Clean, intuitive interface with Lucide React icons
- **Real-time Updates**: Dynamic content updates and notifications
- **Protected Routes**: Secure navigation with authentication guards

## 🛠️ Technology Stack

### Frontend Core
- **React 18.3.1**: Modern React with hooks and functional components
- **TypeScript 5.5.3**: Type-safe development
- **Vite 5.4.2**: Fast build tool and development server
- **React Router DOM 7.6.2**: Client-side routing

### Styling & UI
- **Tailwind CSS 3.4.1**: Utility-first CSS framework
- **Lucide React 0.344.0**: Modern icon library
- **PostCSS 8.4.35**: CSS processing
- **Autoprefixer 10.4.18**: CSS vendor prefixing

### Internationalization
- **i18next 25.2.1**: Internationalization framework
- **react-i18next 15.5.3**: React integration for i18next
- **i18next-browser-languagedetector 8.2.0**: Automatic language detection

### Development Tools
- **ESLint 9.9.1**: Code linting with TypeScript support
- **Vite Dev Server**: Hot module replacement for development

## 📁 Project Structure

```
src/
├── components/              # React components
│   ├── auth/               # Authentication components
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   └── ForgotPassword.tsx
│   ├── AgreementForm.tsx   # Agreement creation/editing
│   ├── AgreementList.tsx   # Agreement listing
│   ├── CustomerDashboard.tsx # Customer self-service portal
│   ├── Dashboard.tsx       # Main admin dashboard
│   ├── LanguageSelector.tsx # Language switching
│   ├── ProductList.tsx     # Product offerings management
│   ├── ProductOfferingForm.tsx # Product creation/editing
│   ├── ProtectedRoute.tsx  # Route protection
│   ├── RoleBasedDashboard.tsx # Role-based routing
│   └── UserProfile.tsx     # User profile management
├── contexts/
│   └── AuthContext.tsx     # Authentication context
├── i18n/                   # Internationalization
│   ├── index.ts           # i18n configuration
│   └── locales/           # Translation files
│       ├── en.json        # English translations
│       ├── si.json        # Sinhala translations
│       └── ta.json        # Tamil translations
├── services/              # API services
│   ├── agreementService.ts # Agreement API calls
│   └── customerService.ts  # Customer API calls
├── types/                 # TypeScript type definitions
│   ├── Agreement.ts       # Agreement type definitions
│   └── ProductOffering.ts # Product offering types
├── App.tsx               # Main application component
├── main.tsx              # Application entry point
├── index.css             # Global styles
└── vite-env.d.ts         # Vite type definitions
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn package manager
- Backend API server running (see backend README)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ojitharajapaksha/Consent-Management-System-Front-End.git
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
   VITE_APP_NAME=Consent Management System
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

The frontend integrates with the backend through:
- **Agreement Service**: Manage consent agreements
- **Customer Service**: Handle customer data and preferences
- **Authentication**: Secure login and session management

## 📊 Compliance Features

### PDPA Compliance
- **Consent Management**: Granular consent controls
- **Data Subject Rights**: Customer self-service for data rights
- **Audit Trail**: Complete logging of all consent changes
- **Data Retention**: Configurable data retention policies

### TM Forum Standards
- **TMF632**: Party Privacy Management API integration
- **TMF641**: Party Management API integration
- **TMF669**: Event Management API integration

## 🚀 Deployment

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the backend README for API documentation

## 🔄 Version History

- **v1.0.0**: Initial release with core consent management features
- Multi-language support (English, Sinhala, Tamil)
- Role-based dashboards
- PDPA compliance features
- TM Forum API integration

---

**Built for Sri Lanka's telecom**
