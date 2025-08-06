# ConsentHub Customer Dashboard

A comprehensive self-service UI for customers to manage their data consents and communication preferences built with React and Tailwind CSS.

## Overview

The Customer Dashboard provides a complete solution for GDPR/PDPA compliance, allowing customers to:

- View and manage their data processing consents
- Configure communication preferences  
- Review privacy notices and policies
- Submit Data Subject Access Rights (DSAR) requests
- View consent history and audit trails

## Component Architecture

### Main Components

#### 1. `CustomerMainDashboard.tsx`
- **Purpose**: Main container component that orchestrates the entire dashboard
- **Features**: 
  - Responsive layout with sidebar navigation
  - Mobile-friendly hamburger menu
  - Section routing and state management

#### 2. `CustomerHeader.tsx`
- **Purpose**: Top navigation bar with user info and actions
- **Features**:
  - Logo and branding
  - Language selector integration
  - User profile display
  - Logout functionality
  - Notification bell with badge

#### 3. `CustomerSidebar.tsx`
- **Purpose**: Left sidebar navigation with menu items
- **Features**:
  - Active section highlighting
  - Mobile responsive with overlay
  - Icon-based navigation
  - Contextual descriptions
  - Privacy protection badge

#### 4. `CustomerDashboardOverview.tsx`
- **Purpose**: Main dashboard landing page with summary widgets
- **Features**:
  - Welcome section with gradient design
  - Consent statistics cards
  - Quick action buttons
  - Recent activity timeline
  - Privacy status indicators

#### 5. `ConsentCenter.tsx`
- **Purpose**: Comprehensive consent management interface
- **Features**:
  - Consent listing with filtering
  - Status indicators (granted/revoked/expired/pending)
  - Detailed consent information modal
  - Bulk consent actions
  - Search and category filters

#### 6. `CustomerPreferences.tsx`
- **Purpose**: Communication and notification preferences
- **Features**:
  - Channel toggles (Email, SMS, Push, In-App)
  - Topic subscriptions with descriptions
  - Do Not Disturb time range settings
  - Frequency limits and digest mode
  - Real-time save functionality

#### 7. `CustomerPrivacyNotices.tsx`
- **Purpose**: Privacy policy and notice management
- **Features**:
  - Multi-language support (EN/SI/TA)
  - Version tracking and history
  - Acceptance status management
  - PDF download functionality
  - Jurisdiction-specific notices

#### 8. `CustomerDSARRequests.tsx`
- **Purpose**: Data Subject Access Rights request management
- **Features**:
  - Request submission form
  - Multiple request types (Export/Delete/Rectify/Restrict)
  - Status tracking and progress updates
  - Download links for completed exports
  - Request history and timeline

## Key Features

### 🔐 Privacy-First Design
- Clear consent granularity
- Easy opt-in/opt-out mechanisms
- Transparent data usage information
- Compliance with GDPR/PDPA requirements

### 📱 Responsive Design
- Mobile-first approach
- Tailwind CSS utilities
- Adaptive layouts for all screen sizes
- Touch-friendly interactions

### 🌍 Internationalization Ready
- Multi-language support (English, Sinhala, Tamil)
- Language selector component
- Localized content and dates
- RTL support preparation

### ♿ Accessibility
- Keyboard navigation support
- Screen reader friendly
- High contrast color schemes
- ARIA labels and descriptions

### 🎨 Modern UI/UX
- Clean, professional design
- Consistent color scheme
- Smooth animations and transitions
- Loading states and feedback

## Usage Examples

### Basic Implementation

```tsx
import CustomerMainDashboard from './components/customer/CustomerMainDashboard';

function App() {
  return (
    <CustomerMainDashboard 
      customerName="John Doe"
      onLogout={() => handleLogout()}
    />
  );
}
```

### With Authentication Context

```tsx
import { useAuth } from '../contexts/AuthContext';
import CustomerMainDashboard from './components/customer/CustomerMainDashboard';

function CustomerPortal() {
  const { user, logout } = useAuth();
  
  return (
    <CustomerMainDashboard 
      customerName={user?.name || 'Customer'}
      onLogout={logout}
    />
  );
}
```

## Mock Data Structure

### Consent Object
```typescript
interface Consent {
  id: string;
  purpose: string;
  status: 'granted' | 'revoked' | 'expired' | 'pending';
  channel: string;
  validFrom: string;
  validUntil?: string;
  description: string;
  category: string;
  jurisdiction: string;
  lastUpdated: string;
  grantedBy: string;
}
```

### DSAR Request Object
```typescript
interface DSARRequest {
  id: string;
  type: 'export' | 'delete' | 'rectify' | 'restrict';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestedDate: string;
  description: string;
  reason?: string;
  downloadUrl?: string;
  estimatedCompletion?: string;
}
```

## Styling Guide

### Color Scheme
- **Primary**: Blue (#2563EB) - Trust and reliability
- **Success**: Green (#059669) - Positive actions
- **Warning**: Yellow (#D97706) - Caution/pending states  
- **Error**: Red (#DC2626) - Negative actions/alerts
- **Neutral**: Gray (#6B7280) - Secondary information

### Typography
- **Headings**: Inter/System fonts, bold weights
- **Body**: Regular weight, readable line heights
- **Captions**: Smaller size for metadata

### Components
- **Cards**: Rounded corners (xl), subtle shadows
- **Buttons**: Consistent padding, hover states
- **Forms**: Focus states, validation styling
- **Modals**: Overlay with backdrop blur

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Performance Considerations

- Lazy loading for heavy components
- Optimized re-renders with React.memo
- Efficient state management
- Minimal bundle size with tree shaking

## Security Features

- XSS protection through proper data sanitization
- CSRF token integration ready
- Secure cookie handling
- Content Security Policy headers support

## Future Enhancements

1. **Real-time Notifications**: WebSocket integration for live updates
2. **Advanced Analytics**: Consent trends and statistics
3. **Bulk Operations**: Multi-select consent management
4. **API Integration**: TMF629 Customer Management compliance
5. **Enhanced Search**: Full-text search across all content
6. **Export Features**: PDF/CSV export for all data
7. **Audit Trail**: Detailed compliance reporting
8. **Advanced Preferences**: Time-based consent automation

## Development Guidelines

### Code Standards
- TypeScript for type safety
- ESLint and Prettier for consistency
- Functional components with hooks
- Clear prop interfaces

### Testing Strategy
- Unit tests with Jest/React Testing Library
- Integration tests for user flows
- Accessibility testing with axe-core
- Performance testing with Lighthouse

### Deployment
- Environment-specific configurations
- CI/CD pipeline integration
- Error monitoring setup
- Performance monitoring

## API Integration Notes

This dashboard is designed to integrate with:
- **TMF629 Customer Management API** for user data
- **Custom Consent API** for consent management
- **DSAR Processing API** for data requests
- **Notification Service** for real-time updates

Replace mock data with actual API calls when backend services are available.

## License

This component library is part of the ConsentHub platform and follows the project's licensing terms.
