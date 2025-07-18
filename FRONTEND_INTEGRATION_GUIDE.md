# ConsentHub Frontend Integration Guide

## Overview

ConsentHub is a comprehensive Privacy and Consent Management System built according to TM Forum Open API specifications (TMF632, TMF641, TMF669). This frontend React application provides a complete user interface for managing customer consents, communication preferences, and data subject rights.

## Architecture

### API Services Layer
The frontend integrates with the backend through a well-structured service layer:

```
src/services/
├── apiClient.ts         # Base HTTP client with axios
├── consentService.ts    # TMF632 Privacy Consent management
├── preferenceService.ts # TMF632 Extended Communication Preferences
├── partyService.ts      # TMF641 Party Management
├── privacyNoticeService.ts # TMF632 Privacy Notice management
├── eventService.ts      # TMF669 Event Management
├── dsarService.ts       # Data Subject Access Rights
├── authService.ts       # Authentication & Authorization
├── customerService.ts   # Consolidated customer operations
└── index.ts            # Service exports
```

### React Hooks Layer
Custom hooks provide state management and API integration:

```
src/hooks/
└── useApi.ts           # Custom hooks for API calls and state management
```

### Component Layer
React components built with Tailwind CSS:

```
src/components/
├── ConsentHubDashboard.tsx    # Main dashboard component
├── ConsentManagement.tsx      # Consent management interface
├── CommunicationPreferences.tsx # Preference management
├── DSARRequests.tsx           # Data Subject Rights interface
└── ...
```

## Key Features

### 1. TMF632 Consent Management
- **Create Consent**: Grant consent for specific purposes (marketing, analytics, etc.)
- **Update Consent**: Modify existing consent settings
- **Revoke Consent**: Withdraw previously granted consents
- **Consent History**: View complete audit trail of consent changes
- **Granular Control**: Purpose-based, channel-specific consents

### 2. TMF632 Extended Communication Preferences
- **Channel Selection**: Choose preferred communication channels (email, SMS, push)
- **Topic Subscriptions**: Subscribe to specific content types
- **Do Not Disturb**: Set time windows for communication restrictions
- **Frequency Limits**: Control communication frequency per channel

### 3. TMF641 Party Management
- **Profile Management**: View and update customer profile information
- **Relationship Management**: Handle guardian relationships, CSR interactions
- **Identity Verification**: Email and mobile verification workflows

### 4. TMF669 Event Management
- **Real-time Updates**: Receive notifications for consent/preference changes
- **Event Subscription**: Subscribe to specific event types
- **Event History**: View complete event audit trail

### 5. Data Subject Rights (DSAR)
- **Data Export**: Request complete data export
- **Data Deletion**: Request data deletion (Right to be Forgotten)
- **Data Rectification**: Request data corrections
- **Data Portability**: Export data in machine-readable format
- **Processing Restrictions**: Request processing limitations

## API Integration Examples

### 1. Consent Management

```typescript
import { consentService } from './services';

// Create a new consent
const newConsent = await consentService.createConsent({
  partyId: 'customer-123',
  purpose: 'marketing',
  status: 'granted',
  channel: 'email',
  validFor: {
    startDateTime: new Date().toISOString()
  }
});

// Revoke a consent
await consentService.revokeConsent('consent-id', 'User requested revocation');

// Get consent history
const history = await consentService.getConsentHistory('customer-123');
```

### 2. Communication Preferences

```typescript
import { preferenceService } from './services';

// Update communication preferences
await preferenceService.updatePreferenceByPartyId('customer-123', {
  preferredChannels: {
    email: true,
    sms: false,
    push: true
  },
  topicSubscriptions: {
    product_updates: true,
    promotions: false
  }
});

// Check if communication is allowed
const isAllowed = await preferenceService.checkCommunicationAllowed(
  'customer-123',
  'email',
  'marketing'
);
```

### 3. DSAR Requests

```typescript
import { dsarService } from './services';

// Create data export request
const exportRequest = await dsarService.createDSARRequest({
  partyId: 'customer-123',
  type: 'data_export',
  description: 'Customer requested data export'
});

// Process data deletion
await dsarService.processDataDeletion('request-id', ['profile', 'preferences']);
```

## Using React Hooks

### 1. Data Fetching Hooks

```typescript
import { useConsents, usePreferences, useAuth } from './hooks/useApi';

function MyComponent() {
  const { user } = useAuth();
  const { data: consents, loading, error } = useConsents(user?.id);
  const { data: preferences } = usePreferences(user?.id);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {consents?.consents.map(consent => (
        <div key={consent.id}>{consent.purpose}</div>
      ))}
    </div>
  );
}
```

### 2. Mutation Hooks

```typescript
import { useConsentMutation, usePreferenceMutation } from './hooks/useApi';

function ConsentManager() {
  const { updateConsent, loading, error } = useConsentMutation();
  const { updatePreferenceByPartyId } = usePreferenceMutation();
  
  const handleConsentToggle = async (consentId: string, newStatus: string) => {
    try {
      await updateConsent(consentId, { status: newStatus });
      // Handle success
    } catch (error) {
      // Handle error
    }
  };
  
  // ... component logic
}
```

## Environment Configuration

Configure the application using environment variables:

```bash
# .env.local
REACT_APP_API_URL=http://localhost:3000
REACT_APP_TMF632_API_URL=http://localhost:3000/api/tmf-api/partyPrivacyManagement/v4
REACT_APP_TMF641_API_URL=http://localhost:3000/api/tmf-api/partyManagement/v4
REACT_APP_TMF669_API_URL=http://localhost:3000/api/tmf-api/eventManagement/v4

# Service URLs
REACT_APP_CONSENT_SERVICE_URL=http://localhost:3001
REACT_APP_PREFERENCE_SERVICE_URL=http://localhost:3002
REACT_APP_PRIVACY_NOTICE_SERVICE_URL=http://localhost:3003
# ... other service URLs
```

## Installation & Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

3. **Start Development Server**
```bash
npm run dev
```

4. **Start Backend Services**
```bash
cd backend
npm run start:all
```

## Key Components Usage

### ConsentHubDashboard
Main dashboard component that provides a comprehensive view of all privacy-related data:

```typescript
import { ConsentHubDashboard } from './components/ConsentHubDashboard';

function App() {
  return (
    <div className="App">
      <ConsentHubDashboard customerId="customer-123" />
    </div>
  );
}
```

### ConsentManagement
Detailed consent management interface:

```typescript
import { ConsentManagement } from './components/ConsentManagement';

function ConsentPage() {
  return (
    <ConsentManagement selectedCustomer={customer} />
  );
}
```

## Error Handling

The API client includes comprehensive error handling:

```typescript
// Automatic retry on network errors
// Authentication token refresh
// Error message standardization
// Loading states management
```

## Event Management

Subscribe to TMF669 events for real-time updates:

```typescript
import { tmf669EventService } from './services';

// Subscribe to consent change events
await tmf669EventService.subscribeToConsentEvents(
  'https://myapp.com/webhook/consent',
  'customer-123'
);

// Listen for local events
tmf669EventService.subscribe('PrivacyConsentChangeEvent', (event) => {
  console.log('Consent changed:', event);
});
```

## Security Features

- **JWT Token Management**: Automatic token refresh and storage
- **CORS Configuration**: Proper cross-origin resource sharing
- **Input Validation**: Client-side validation with server-side verification
- **Rate Limiting**: Protection against API abuse
- **Audit Logging**: Complete audit trail for all actions

## Performance Optimization

- **Lazy Loading**: Components loaded on demand
- **Caching**: API responses cached for improved performance
- **Debounced Inputs**: Reduced API calls for search inputs
- **Pagination**: Large datasets handled with pagination
- **Optimistic Updates**: UI updates before API confirmation

## Testing

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## Deployment

### Production Build
```bash
npm run build
```

### Docker Deployment
```bash
docker build -t consenthub-frontend .
docker run -p 3000:3000 consenthub-frontend
```

### Environment-Specific Configurations
- **Development**: `.env.development`
- **Staging**: `.env.staging`
- **Production**: `.env.production`

## Compliance Features

- **GDPR Compliance**: Full support for EU data protection regulations
- **CCPA Compliance**: California Consumer Privacy Act support
- **PDP Compliance**: Personal Data Protection Act (Sri Lanka) support
- **Audit Trails**: Complete audit logs for compliance reporting
- **Data Retention**: Configurable data retention policies
- **Consent Withdrawal**: Easy consent withdrawal mechanisms

## API Documentation

The frontend integrates with TMF-compliant APIs:

- **TMF632**: Party Privacy Management API
- **TMF641**: Party Management API
- **TMF669**: Event Management API
- **TMF673**: Document Management API (for file uploads)

## Support

For technical support or questions about the integration:

1. Check the API documentation
2. Review the component examples
3. Examine the service layer implementation
4. Test with the provided hooks and utilities

## Contributing

1. Follow the established patterns in the services layer
2. Use TypeScript for type safety
3. Follow the TMF API specifications
4. Include proper error handling
5. Add tests for new functionality
6. Document any new features

This frontend provides a complete, production-ready interface for TMF-compliant consent and privacy management, with full integration to the backend microservices architecture.
