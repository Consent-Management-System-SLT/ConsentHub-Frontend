import { Party, PrivacyConsent, PrivacyPreference, PrivacyNotice, AuditLog, DSARRequest } from '../types/consent';

export const mockParties: Party[] = [
  {
    id: 'PARTY001',
    name: 'John Doe',
    email: 'john.doe@email.com',
    mobile: '+1234567890',
    type: 'individual'
  },
  {
    id: 'PARTY002',
    name: 'Jane Smith',
    email: 'jane.smith@email.com',
    mobile: '+1234567891',
    type: 'individual'
  },
  {
    id: 'PARTY003',
    name: 'Michael Johnson',
    email: 'michael.johnson@email.com',
    mobile: '+1234567892',
    type: 'individual'
  },
  {
    id: 'PARTY004',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@email.com',
    mobile: '+1234567893',
    type: 'guardian',
    relationship: {
      role: 'guardian',
      linkedPartyId: 'PARTY005'
    }
  },
  {
    id: 'PARTY005',
    name: 'Tommy Wilson',
    email: 'tommy.wilson@email.com',
    mobile: '+1234567894',
    type: 'individual'
  }
];

export const mockConsents: PrivacyConsent[] = [
  {
    id: 'CONSENT001',
    partyId: 'PARTY001',
    purpose: 'Marketing',
    status: 'granted',
    channel: 'email',
    validFrom: '2024-01-01T00:00:00Z',
    validTo: '2025-12-31T23:59:59Z',
    geoLocation: 'US',
    privacyNoticeId: 'NOTICE001',
    versionAccepted: 'v2.1',
    timestampGranted: '2024-01-01T10:00:00Z',
    recordSource: 'customer-portal',
    metadata: { ip: '192.168.1.1', device: 'desktop' }
  },
  {
    id: 'CONSENT002',
    partyId: 'PARTY001',
    purpose: 'Third Party Sharing',
    status: 'revoked',
    channel: 'all',
    validFrom: '2024-01-01T00:00:00Z',
    validTo: '2025-12-31T23:59:59Z',
    geoLocation: 'US',
    privacyNoticeId: 'NOTICE001',
    versionAccepted: 'v2.1',
    timestampGranted: '2024-01-01T10:00:00Z',
    timestampRevoked: '2024-06-15T14:30:00Z',
    recordSource: 'customer-portal'
  },
  {
    id: 'CONSENT003',
    partyId: 'PARTY002',
    purpose: 'Marketing',
    status: 'granted',
    channel: 'sms',
    validFrom: '2024-02-01T00:00:00Z',
    geoLocation: 'US',
    privacyNoticeId: 'NOTICE001',
    versionAccepted: 'v2.1',
    timestampGranted: '2024-02-01T09:15:00Z',
    recordSource: 'mobile-app'
  },
  {
    id: 'CONSENT004',
    partyId: 'PARTY003',
    purpose: 'Analytics',
    status: 'granted',
    channel: 'all',
    validFrom: '2024-03-01T00:00:00Z',
    geoLocation: 'US',
    privacyNoticeId: 'NOTICE002',
    versionAccepted: 'v2.0',
    timestampGranted: '2024-03-01T11:45:00Z',
    recordSource: 'web-form'
  },
  {
    id: 'CONSENT005',
    partyId: 'PARTY004',
    purpose: 'Marketing',
    status: 'pending',
    channel: 'email',
    validFrom: '2024-06-26T00:00:00Z',
    geoLocation: 'US',
    privacyNoticeId: 'NOTICE001',
    versionAccepted: 'v2.1',
    timestampGranted: '2024-06-26T13:00:00Z',
    recordSource: 'csr-portal'
  }
];

export const mockPreferences: PrivacyPreference[] = [
  {
    id: 'PREF001',
    partyId: 'PARTY001',
    preferredChannels: {
      email: true,
      sms: false,
      push: true,
      voice: false
    },
    topicSubscriptions: {
      product_updates: true,
      promotions: false,
      billing_alerts: true,
      service_notifications: true
    },
    doNotDisturb: {
      start: '22:00',
      end: '07:00'
    },
    frequencyLimits: {
      email: 3,
      sms: 1
    },
    lastUpdated: '2024-06-15T14:30:00Z'
  },
  {
    id: 'PREF002',
    partyId: 'PARTY002',
    preferredChannels: {
      email: true,
      sms: true,
      push: false,
      voice: false
    },
    topicSubscriptions: {
      product_updates: false,
      promotions: true,
      billing_alerts: true,
      service_notifications: true
    },
    doNotDisturb: {
      start: '21:00',
      end: '08:00'
    },
    frequencyLimits: {
      email: 5,
      sms: 2
    },
    lastUpdated: '2024-06-20T10:15:00Z'
  },
  {
    id: 'PREF003',
    partyId: 'PARTY003',
    preferredChannels: {
      email: false,
      sms: true,
      push: true,
      voice: false
    },
    topicSubscriptions: {
      product_updates: true,
      promotions: true,
      billing_alerts: true,
      service_notifications: false
    },
    doNotDisturb: {
      start: '23:00',
      end: '06:00'
    },
    frequencyLimits: {
      email: 0,
      sms: 3
    },
    lastUpdated: '2024-06-18T16:45:00Z'
  }
];

export const mockNotices: PrivacyNotice[] = [
  {
    id: 'NOTICE001',
    title: 'Privacy Policy - Marketing Communications',
    version: 'v2.1',
    jurisdiction: 'US',
    language: 'en',
    documentUrl: 'https://example.com/privacy/v2.1',
    publishedAt: '2024-01-01T00:00:00Z',
    active: true
  },
  {
    id: 'NOTICE002',
    title: 'Data Analytics Privacy Notice',
    version: 'v2.0',
    jurisdiction: 'US',
    language: 'en',
    documentUrl: 'https://example.com/analytics-privacy/v2.0',
    publishedAt: '2024-02-15T00:00:00Z',
    active: true
  },
  {
    id: 'NOTICE003',
    title: 'Third Party Sharing Policy',
    version: 'v1.8',
    jurisdiction: 'EU',
    language: 'en',
    documentUrl: 'https://example.com/third-party/v1.8',
    publishedAt: '2024-03-01T00:00:00Z',
    active: false
  }
];

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'AUDIT001',
    entityType: 'consent',
    entityId: 'CONSENT002',
    operation: 'revoke',
    actorType: 'customer',
    actorId: 'PARTY001',
    timestamp: '2024-06-15T14:30:00Z',
    changes: {
      status: { from: 'granted', to: 'revoked' },
      timestampRevoked: { from: null, to: '2024-06-15T14:30:00Z' }
    },
    source: 'customer-portal'
  },
  {
    id: 'AUDIT002',
    entityType: 'preference',
    entityId: 'PREF001',
    operation: 'update',
    actorType: 'csr',
    actorId: 'CSR001',
    timestamp: '2024-06-20T10:15:00Z',
    changes: {
      preferredChannels: {
        from: { email: true, sms: true, push: false, voice: false },
        to: { email: true, sms: false, push: true, voice: false }
      }
    },
    source: 'csr-portal'
  },
  {
    id: 'AUDIT003',
    entityType: 'consent',
    entityId: 'CONSENT005',
    operation: 'create',
    actorType: 'csr',
    actorId: 'CSR002',
    timestamp: '2024-06-26T13:00:00Z',
    changes: {
      status: { from: null, to: 'pending' },
      purpose: { from: null, to: 'Marketing' }
    },
    source: 'csr-portal'
  }
];

export const mockDSARRequests: DSARRequest[] = [
  {
    id: 'DSAR001',
    partyId: 'PARTY001',
    type: 'data_export',
    status: 'completed',
    submittedAt: '2024-06-10T09:00:00Z',
    completedAt: '2024-06-12T15:30:00Z',
    description: 'Customer requested export of all personal data'
  },
  {
    id: 'DSAR002',
    partyId: 'PARTY002',
    type: 'data_deletion',
    status: 'processing',
    submittedAt: '2024-06-20T14:15:00Z',
    description: 'Customer requested deletion of marketing data'
  },
  {
    id: 'DSAR003',
    partyId: 'PARTY003',
    type: 'restriction',
    status: 'initiated',
    submittedAt: '2024-06-25T11:30:00Z',
    description: 'Customer requested restriction on data processing'
  }
];