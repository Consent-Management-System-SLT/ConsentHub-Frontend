# ConsentHub - Backend API

## Overview
This backend implements the TM Forum APIs required for a complete Consent Management System, ensuring compliance with Sri Lanka's Personal Data Protection Act (PDPA) 2022.

## TM Forum APIs Implemented

### ✅ TMF632 - Party Privacy Management API
- **Endpoints**: `/tmf-api/partyPrivacyManagement/v4/privacyConsent`
- **Purpose**: Manage customer privacy consents and preferences
- **Features**: Consent grant/revoke, privacy preferences, compliance tracking

### ✅ TMF641 - Party Management API  
- **Endpoints**: `/tmf-api/partyManagement/v4/party`
- **Purpose**: Manage party (customer) profiles and relationships
- **Features**: Customer profiles, guardian relationships, party management

### ✅ TMF669 - Event Management API
- **Endpoints**: `/tmf-api/eventManagement/v4/event`
- **Purpose**: Privacy consent change events and notifications
- **Features**: Event publishing, consent change notifications, audit events

### ✅ Consent Management API
- **Endpoints**: `/api/consent`
- **Purpose**: Specialized consent operations
- **Features**: Consent overview, PDPA compliance, bulk reporting

## Quick Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
```

### 3. Start the Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### 4. Verify Installation
```bash
# Check API health
curl http://localhost:3000/health

# Get system info
curl http://localhost:3000/api/info
```

## API Endpoints

### Core TM Forum APIs

#### Privacy Consent Management (TMF632)
```bash
# Get all agreements
GET /tmf-api/agreementManagement/v4/agreement

# Create new agreement
POST /tmf-api/agreementManagement/v4/agreement

# Get specific agreement
GET /tmf-api/agreementManagement/v4/agreement/{id}

# Update agreement
PATCH /tmf-api/agreementManagement/v4/agreement/{id}

# Delete agreement
DELETE /tmf-api/agreementManagement/v4/agreement/{id}
```

#### Party Management (TMF641)
```bash
# Get all customers
GET /tmf-api/customerManagement/v4/customer

# Create customer
POST /tmf-api/customerManagement/v4/customer

# Get customer
GET /tmf-api/customerManagement/v4/customer/{id}

# Update customer
PATCH /tmf-api/customerManagement/v4/customer/{id}

# Get customer consents
GET /tmf-api/customerManagement/v4/customer/{id}/consents

# Update customer consents
PATCH /tmf-api/customerManagement/v4/customer/{id}/consents
```

#### Event Management (TMF669)
```bash
# Get audit events
GET /tmf-api/eventManagement/v4/event

# Create audit event
POST /tmf-api/eventManagement/v4/event

# Get specific event
GET /tmf-api/eventManagement/v4/event/{id}

# Export audit trail
GET /tmf-api/eventManagement/v4/event/export/csv
```

### Consent Management APIs

#### Consent Overview
```bash
# Get consent overview for dashboard
GET /api/consent/overview

# Get consent statistics by category
GET /api/consent/stats/categories

# PDPA compliance status
GET /api/consent/compliance/pdpa
```

#### Customer Consent Management
```bash
# Get customer consent preferences
GET /api/consent/customer/{customerId}/preferences

# Update customer consent preferences
PATCH /api/consent/customer/{customerId}/preferences

# Bulk consent report
GET /api/consent/report/bulk?format=json|csv
```

## Frontend Integration

### Update Your Frontend Service
Your Dashboard is already configured to work with these APIs. Update your `agreementService` to use the new endpoints:

```javascript
// src/services/agreementService.ts
const API_BASE = 'http://localhost:3000';

export const agreementService = {
  // TMF651 Agreement Management
  getAllAgreements: () => 
    fetch(`${API_BASE}/tmf-api/agreementManagement/v4/agreement`),
  
  createAgreement: (agreement) =>
    fetch(`${API_BASE}/tmf-api/agreementManagement/v4/agreement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agreement)
    }),
  
  deleteAgreement: (id) =>
    fetch(`${API_BASE}/tmf-api/agreementManagement/v4/agreement/${id}`, {
      method: 'DELETE'
    }),

  // Consent Management
  getConsentOverview: () =>
    fetch(`${API_BASE}/api/consent/overview`),
  
  getAuditTrail: () =>
    fetch(`${API_BASE}/tmf-api/eventManagement/v4/event`),
  
  exportAuditTrail: () =>
    fetch(`${API_BASE}/tmf-api/eventManagement/v4/event/export/csv`)
};
```

## Data Models

### Agreement (TMF651)
```json
{
  "id": "agr_123",
  "agreementType": "MarketingConsent",
  "customerId": "cust_456", 
  "status": "Active",
  "createdDate": "2024-12-29T10:00:00Z",
  "expiryDate": "2025-12-29T10:00:00Z",
  "consentMethod": "web",
  "purpose": "Email marketing campaigns",
  "characteristics": {
    "dataTypes": ["email", "preferences"],
    "legalBasis": "consent",
    "retentionPeriod": "12months"
  }
}
```

### Customer (TMF629)
```json
{
  "id": "cust_456",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+94771234567",
  "preferredLanguage": "en",
  "consentPreferences": {
    "marketing": true,
    "analytics": true,
    "thirdPartySharing": false
  },
  "status": "Active"
}
```

### Audit Event (TMF688)
```json
{
  "id": "evt_789",
  "eventType": "ConsentGranted",
  "customerId": "cust_456",
  "agreementId": "agr_123",
  "userId": "user_admin",
  "timestamp": "2024-12-29T10:00:00Z",
  "details": {
    "consentType": "Marketing",
    "action": "Customer granted marketing consent",
    "method": "web"
  },
  "ipAddress": "192.168.1.1"
}
```

## PDPA Compliance Features

### ✅ Consent-Based Processing
- Explicit consent capture and storage
- Granular consent categories
- Easy consent revocation

### ✅ Audit Trail
- Complete activity logging
- Immutable audit records
- Export capabilities for compliance

### ✅ Data Subject Rights
- Customer consent preferences
- Data access and correction
- Account deletion support

### ✅ Legal Basis Tracking
- Purpose limitation enforcement
- Legal basis documentation
- Data retention management

## Development

### Project Structure
```
backend/
├── server.js              # Main server file
├── routes/
│   ├── agreement.js       # TMF651 routes (existing)
│   ├── customers.js       # TMF641 routes (party management)
│   ├── audit.js          # TMF669 routes (event management)
│   └── consent.js        # TMF632 routes (privacy management)
├── models/               # Database models
├── middleware/           # Express middleware
├── utils/               # Utility functions
└── tests/               # API tests
```

### Testing
```bash
# Run all tests
npm test

# Test specific API
npm test -- --grep "Agreement"

# Test with coverage
npm run test:coverage
```

### Docker Deployment
```bash
# Build container
docker build -t consent-management-api .

# Run container
docker run -p 3000:3000 consent-management-api
```

## Production Considerations

### Security
- [ ] Implement JWT authentication
- [ ] Add API rate limiting  
- [ ] Enable HTTPS
- [ ] Implement field-level encryption for sensitive data

### Monitoring
- [ ] Add logging (Winston/Morgan)
- [ ] Health check endpoints
- [ ] Performance monitoring
- [ ] Error tracking (Sentry)

### Compliance
- [ ] Data encryption at rest
- [ ] Regular security audits
- [ ] Automated compliance checks
- [ ] Data retention policies

## Support

For issues and questions:
1. Check the API health endpoint: `GET /health`
2. Review the logs in `logs/` directory
3. Verify environment configuration in `.env`
4. Test individual endpoints with curl or Postman

Your Consent Management System backend is now ready to support your frontend Dashboard with full TM Forum API compliance and PDPA regulatory adherence!
