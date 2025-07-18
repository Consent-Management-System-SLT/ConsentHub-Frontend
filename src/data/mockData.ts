import { Party, PrivacyConsent, PrivacyPreference, PrivacyNotice, AuditLog, DSARRequest } from '../types/consent';

export const mockParties: Party[] = [
  {
    id: 'PARTY001',
    name: 'John Doe',
    email: 'john.doe@email.com',
    mobile: '+94771234567',
    type: 'individual'
  },
  {
    id: 'PARTY002',
    name: 'Jane Smith',
    email: 'jane.smith@email.com',
    mobile: '+94771234568',
    type: 'individual'
  },
  {
    id: 'PARTY003',
    name: 'Michael Johnson',
    email: 'michael.johnson@email.com',
    mobile: '+94771234569',
    type: 'individual'
  },
  {
    id: 'PARTY004',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@email.com',
    mobile: '+94771234570',
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
    mobile: '+94771234571',
    type: 'individual'
  },
  {
    id: 'PARTY006',
    name: 'Priya Patel',
    email: 'priya.patel@email.com',
    mobile: '+94771234572',
    type: 'individual'
  },
  {
    id: 'PARTY007',
    name: 'David Chen',
    email: 'david.chen@email.com',
    mobile: '+94771234573',
    type: 'individual'
  },
  {
    id: 'PARTY008',
    name: 'Maria Rodriguez',
    email: 'maria.rodriguez@email.com',
    mobile: '+94771234574',
    type: 'individual'
  },
  {
    id: 'PARTY009',
    name: 'Ahmed Hassan',
    email: 'ahmed.hassan@email.com',
    mobile: '+94771234575',
    type: 'individual'
  },
  {
    id: 'PARTY010',
    name: 'Emma Thompson',
    email: 'emma.thompson@email.com',
    mobile: '+94771234576',
    type: 'individual'
  },
  {
    id: 'PARTY011',
    name: 'Kumar Silva',
    email: 'kumar.silva@email.com',
    mobile: '+94771234577',
    type: 'individual'
  },
  {
    id: 'PARTY012',
    name: 'Fatima Ali',
    email: 'fatima.ali@email.com',
    mobile: '+94771234578',
    type: 'individual'
  },
  {
    id: 'PARTY013',
    name: 'Robert Brown',
    email: 'robert.brown@email.com',
    mobile: '+94771234579',
    type: 'individual'
  },
  {
    id: 'PARTY014',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@email.com',
    mobile: '+94771234580',
    type: 'individual'
  },
  {
    id: 'PARTY015',
    name: 'Carlos Martinez',
    email: 'carlos.martinez@email.com',
    mobile: '+94771234581',
    type: 'individual'
  },
  {
    id: 'PARTY016',
    name: 'Raj Sharma',
    email: 'raj.sharma@email.com',
    mobile: '+94771234582',
    type: 'guardian',
    relationship: {
      role: 'guardian',
      linkedPartyId: 'PARTY017'
    }
  },
  {
    id: 'PARTY017',
    name: 'Arjun Sharma',
    email: 'arjun.sharma@email.com',
    mobile: '+94771234583',
    type: 'individual'
  },
  {
    id: 'PARTY018',
    name: 'Sophie Turner',
    email: 'sophie.turner@email.com',
    mobile: '+94771234584',
    type: 'individual'
  },
  {
    id: 'PARTY019',
    name: 'James Wilson',
    email: 'james.wilson@email.com',
    mobile: '+94771234585',
    type: 'individual'
  },
  {
    id: 'PARTY020',
    name: 'Nina Perera',
    email: 'nina.perera@email.com',
    mobile: '+94771234586',
    type: 'individual'
  }
];

export const mockConsents: PrivacyConsent[] = [
  {
    id: 'CONSENT001',
    partyId: 'PARTY001',
    purpose: 'Marketing Communications',
    status: 'granted',
    channel: 'email',
    validFrom: '2024-01-01T00:00:00Z',
    validTo: '2025-12-31T23:59:59Z',
    geoLocation: 'LK',
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
    geoLocation: 'LK',
    privacyNoticeId: 'NOTICE001',
    versionAccepted: 'v2.1',
    timestampGranted: '2024-01-01T10:00:00Z',
    timestampRevoked: '2024-06-15T14:30:00Z',
    recordSource: 'customer-portal'
  },
  {
    id: 'CONSENT003',
    partyId: 'PARTY001',
    purpose: 'Service Notifications',
    status: 'granted',
    channel: 'sms',
    validFrom: '2024-02-01T00:00:00Z',
    geoLocation: 'LK',
    privacyNoticeId: 'NOTICE001',
    versionAccepted: 'v2.1',
    timestampGranted: '2024-02-01T09:15:00Z',
    recordSource: 'mobile-app'
  },
  {
    id: 'CONSENT004',
    partyId: 'PARTY002',
    purpose: 'Analytics and Insights',
    status: 'granted',
    channel: 'all',
    validFrom: '2024-03-01T00:00:00Z',
    geoLocation: 'LK',
    privacyNoticeId: 'NOTICE002',
    versionAccepted: 'v2.0',
    timestampGranted: '2024-03-01T11:45:00Z',
    recordSource: 'web-form'
  },
  {
    id: 'CONSENT005',
    partyId: 'PARTY002',
    purpose: 'Marketing Communications',
    status: 'granted',
    channel: 'email',
    validFrom: '2024-03-15T00:00:00Z',
    geoLocation: 'LK',
    privacyNoticeId: 'NOTICE001',
    versionAccepted: 'v2.1',
    timestampGranted: '2024-03-15T14:20:00Z',
    recordSource: 'customer-portal'
  },
  {
    id: 'CONSENT006',
    partyId: 'PARTY003',
    purpose: 'Location Services',
    status: 'granted',
    channel: 'push',
    validFrom: '2024-04-01T00:00:00Z',
    validTo: '2025-04-01T23:59:59Z',
    geoLocation: 'LK',
    privacyNoticeId: 'NOTICE003',
    versionAccepted: 'v1.5',
    timestampGranted: '2024-04-01T08:30:00Z',
    recordSource: 'mobile-app'
  },
  {
    id: 'CONSENT007',
    partyId: 'PARTY003',
    purpose: 'Push Notifications',
    status: 'revoked',
    channel: 'push',
    validFrom: '2024-04-01T00:00:00Z',
    validTo: '2025-04-01T23:59:59Z',
    geoLocation: 'LK',
    privacyNoticeId: 'NOTICE001',
    versionAccepted: 'v2.1',
    timestampGranted: '2024-04-01T08:30:00Z',
    timestampRevoked: '2024-07-10T16:45:00Z',
    recordSource: 'mobile-app'
  },
  {
    id: 'CONSENT008',
    partyId: 'PARTY004',
    purpose: 'Guardian Consent for Minor',
    status: 'granted',
    channel: 'all',
    validFrom: '2024-05-01T00:00:00Z',
    validTo: '2025-05-01T23:59:59Z',
    geoLocation: 'LK',
    privacyNoticeId: 'NOTICE004',
    versionAccepted: 'v1.0',
    timestampGranted: '2024-05-01T12:00:00Z',
    recordSource: 'guardian-portal'
  },
  {
    id: 'CONSENT009',
    partyId: 'PARTY006',
    purpose: 'Personalized Recommendations',
    status: 'granted',
    channel: 'email',
    validFrom: '2024-06-01T00:00:00Z',
    geoLocation: 'LK',
    privacyNoticeId: 'NOTICE002',
    versionAccepted: 'v2.0',
    timestampGranted: '2024-06-01T15:30:00Z',
    recordSource: 'web-form'
  },
  {
    id: 'CONSENT010',
    partyId: 'PARTY007',
    purpose: 'Research and Development',
    status: 'granted',
    channel: 'all',
    validFrom: '2024-06-15T00:00:00Z',
    validTo: '2025-06-15T23:59:59Z',
    geoLocation: 'LK',
    privacyNoticeId: 'NOTICE005',
    versionAccepted: 'v1.2',
    timestampGranted: '2024-06-15T10:15:00Z',
    recordSource: 'research-portal'
  },
  {
    id: 'CONSENT011',
    partyId: 'PARTY008',
    purpose: 'Marketing Communications',
    status: 'granted',
    channel: 'email',
    validFrom: '2024-07-01T00:00:00Z',
    geoLocation: 'LK',
    privacyNoticeId: 'NOTICE001',
    versionAccepted: 'v2.1',
    timestampGranted: '2024-07-01T09:00:00Z',
    recordSource: 'customer-portal'
  },
  {
    id: 'CONSENT012',
    partyId: 'PARTY009',
    purpose: 'Service Notifications',
    status: 'granted',
    channel: 'sms',
    validFrom: '2024-07-10T00:00:00Z',
    geoLocation: 'LK',
    privacyNoticeId: 'NOTICE001',
    versionAccepted: 'v2.1',
    timestampGranted: '2024-07-10T11:30:00Z',
    recordSource: 'mobile-app'
  },
  {
    id: 'CONSENT013',
    partyId: 'PARTY010',
    purpose: 'Analytics and Insights',
    status: 'revoked',
    channel: 'all',
    validFrom: '2024-07-15T00:00:00Z',
    geoLocation: 'LK',
    privacyNoticeId: 'NOTICE002',
    versionAccepted: 'v2.0',
    timestampGranted: '2024-07-15T14:45:00Z',
    timestampRevoked: '2024-07-18T10:00:00Z',
    recordSource: 'web-form'
  },
  {
    id: 'CONSENT014',
    partyId: 'PARTY011',
    purpose: 'Marketing Communications',
    status: 'granted',
    channel: 'email',
    validFrom: '2024-07-18T00:00:00Z',
    geoLocation: 'LK',
    privacyNoticeId: 'NOTICE001',
    versionAccepted: 'v2.1',
    timestampGranted: '2024-07-18T08:15:00Z',
    recordSource: 'customer-portal'
  },
  {
    id: 'CONSENT015',
    partyId: 'PARTY012',
    purpose: 'Location Services',
    status: 'granted',
    channel: 'push',
    validFrom: '2024-07-18T00:00:00Z',
    validTo: '2025-07-18T23:59:59Z',
    geoLocation: 'LK',
    privacyNoticeId: 'NOTICE003',
    versionAccepted: 'v1.5',
    timestampGranted: '2024-07-18T13:20:00Z',
    recordSource: 'mobile-app'
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

// Guardian Consent types
export interface GuardianConsent {
  id: string;
  minorId: string;
  guardianId: string;
  consentType: string;
  status: 'active' | 'revoked' | 'expired';
  grantedAt: string;
  expiresAt?: string;
  revokedAt?: string;
  verificationMethod: 'identity_document' | 'phone_verification' | 'email_verification' | 'in_person';
  verificationStatus: 'verified' | 'pending' | 'failed';
  documents?: Array<{
    id: string;
    type: string;
    url: string;
  }>;
}

// Extended DSAR Request interface
export interface ExtendedDSARRequest extends DSARRequest {
  customerName: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  documents?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;
  comments?: Array<{
    id: string;
    author: string;
    content: string;
    timestamp: string;
  }>;
}

// Extended Audit Log interface
export interface ExtendedAuditLog extends AuditLog {
  action: string;
  entity: string;
  performedBy: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high';
  category: 'consent' | 'preference' | 'dsar' | 'auth' | 'system';
}

// Mock Extended DSAR Requests
export const mockExtendedDSARRequests: ExtendedDSARRequest[] = [
  {
    id: 'DSAR001',
    partyId: 'PARTY001',
    customerName: 'John Doe',
    type: 'data_export',
    status: 'initiated',
    submittedAt: '2024-06-20T09:30:00Z',
    description: 'Request for all personal data held by the company',
    priority: 'medium',
    assignedTo: 'Sarah Johnson',
    comments: [
      {
        id: 'COMMENT001',
        author: 'Sarah Johnson',
        content: 'Initial assessment completed. Moving to data collection phase.',
        timestamp: '2024-06-20T14:15:00Z'
      }
    ]
  },
  {
    id: 'DSAR002',
    partyId: 'PARTY002',
    customerName: 'Jane Smith',
    type: 'data_deletion',
    status: 'processing',
    submittedAt: '2024-06-18T16:45:00Z',
    description: 'Request to delete all personal data due to account closure',
    priority: 'high',
    assignedTo: 'Mike Chen',
    comments: [
      {
        id: 'COMMENT002',
        author: 'Mike Chen',
        content: 'Backup data identified. Proceeding with deletion process.',
        timestamp: '2024-06-19T10:30:00Z'
      }
    ]
  },
  {
    id: 'DSAR003',
    partyId: 'PARTY003',
    customerName: 'Bob Wilson',
    type: 'data_export',
    status: 'completed',
    submittedAt: '2024-06-10T11:20:00Z',
    completedAt: '2024-06-15T14:30:00Z',
    description: 'Request for data export in machine-readable format',
    priority: 'low',
    assignedTo: 'Lisa Davis',
    documents: [
      {
        id: 'DOC001',
        name: 'personal_data_export.json',
        type: 'application/json',
        url: '/documents/DSAR003/personal_data_export.json'
      }
    ]
  }
];

// Mock Extended Audit Logs
export const mockExtendedAuditLogs: ExtendedAuditLog[] = [
  {
    id: 'AUDIT001',
    entityType: 'consent',
    entityId: 'CONSENT001',
    operation: 'create',
    actorType: 'customer',
    actorId: 'john.doe@example.com',
    timestamp: '2024-06-20T15:30:00Z',
    changes: {
      consentType: 'marketing_communications',
      channel: 'web_portal'
    },
    source: 'web_portal',
    action: 'consent_granted',
    entity: 'consent',
    performedBy: 'john.doe@example.com',
    details: {
      consentType: 'marketing_communications',
      channel: 'web_portal',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    severity: 'medium',
    category: 'consent'
  },
  {
    id: 'AUDIT002',
    entityType: 'preference',
    entityId: 'PREF001',
    operation: 'update',
    actorType: 'csr',
    actorId: 'csr.sarah@company.com',
    timestamp: '2024-06-20T14:15:00Z',
    changes: {
      email: { from: false, to: true },
      sms: { from: true, to: false }
    },
    source: 'csr_portal',
    action: 'preference_updated',
    entity: 'communication_preference',
    performedBy: 'csr.sarah@company.com',
    details: {
      changes: {
        email: { from: false, to: true },
        sms: { from: true, to: false }
      },
      reason: 'Customer request via phone'
    },
    ipAddress: '10.0.0.50',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    severity: 'low',
    category: 'preference'
  },
  {
    id: 'AUDIT003',
    entityType: 'consent',
    entityId: 'DSAR001',
    operation: 'create',
    actorType: 'customer',
    actorId: 'john.doe@example.com',
    timestamp: '2024-06-20T13:45:00Z',
    changes: {
      requestType: 'access',
      description: 'Request for all personal data held by the company'
    },
    source: 'customer_portal',
    action: 'dsar_request_submitted',
    entity: 'dsar_request',
    performedBy: 'john.doe@example.com',
    details: {
      requestType: 'access',
      description: 'Request for all personal data held by the company',
      priority: 'medium'
    },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    severity: 'high',
    category: 'dsar'
  },
  {
    id: 'AUDIT004',
    entityType: 'consent',
    entityId: 'SESSION001',
    operation: 'create',
    actorType: 'csr',
    actorId: 'csr.sarah@company.com',
    timestamp: '2024-06-20T12:30:00Z',
    changes: {
      role: 'csr',
      loginMethod: 'password'
    },
    source: 'csr_portal',
    action: 'login_successful',
    entity: 'user_session',
    performedBy: 'csr.sarah@company.com',
    details: {
      role: 'csr',
      loginMethod: 'password',
      sessionDuration: '8h'
    },
    ipAddress: '10.0.0.50',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    severity: 'low',
    category: 'auth'
  },
  {
    id: 'AUDIT005',
    entityType: 'consent',
    entityId: 'CONSENT002',
    operation: 'revoke',
    actorType: 'customer',
    actorId: 'jane.smith@example.com',
    timestamp: '2024-06-20T11:15:00Z',
    changes: {
      consentType: 'data_processing',
      revocationReason: 'No longer required'
    },
    source: 'mobile_app',
    action: 'consent_revoked',
    entity: 'consent',
    performedBy: 'jane.smith@example.com',
    details: {
      consentType: 'data_processing',
      revocationReason: 'No longer required',
      channel: 'mobile_app'
    },
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    severity: 'medium',
    category: 'consent'
  }
];

// Mock Guardian Consents
export const mockGuardianConsents: GuardianConsent[] = [
  {
    id: 'GUARDIAN001',
    minorId: 'MINOR001',
    guardianId: 'PARTY001',
    consentType: 'data_processing',
    status: 'active',
    grantedAt: '2024-06-01T10:00:00Z',
    expiresAt: '2025-06-01T10:00:00Z',
    verificationMethod: 'identity_document',
    verificationStatus: 'verified',
    documents: [
      {
        id: 'DOC001',
        type: 'birth_certificate',
        url: '/documents/GUARDIAN001/birth_certificate.pdf'
      },
      {
        id: 'DOC002',
        type: 'guardian_id',
        url: '/documents/GUARDIAN001/guardian_id.pdf'
      }
    ]
  },
  {
    id: 'GUARDIAN002',
    minorId: 'MINOR002',
    guardianId: 'PARTY002',
    consentType: 'marketing_communications',
    status: 'active',
    grantedAt: '2024-06-15T14:30:00Z',
    verificationMethod: 'phone_verification',
    verificationStatus: 'pending'
  },
  {
    id: 'GUARDIAN003',
    minorId: 'MINOR003',
    guardianId: 'PARTY003',
    consentType: 'data_sharing',
    status: 'revoked',
    grantedAt: '2024-05-01T09:00:00Z',
    revokedAt: '2024-06-10T16:20:00Z',
    verificationMethod: 'in_person',
    verificationStatus: 'verified'
  }
];

// Mock Minor Customers
export const mockMinorCustomers = [
  {
    id: 'MINOR001',
    name: 'Alex Doe',
    dateOfBirth: '2010-03-15',
    guardianId: 'PARTY001',
    guardianName: 'John Doe',
    guardianRelation: 'Father',
    age: 14,
    consentStatus: 'active'
  },
  {
    id: 'MINOR002',
    name: 'Emma Smith',
    dateOfBirth: '2012-07-22',
    guardianId: 'PARTY002',
    guardianName: 'Jane Smith',
    guardianRelation: 'Mother',
    age: 12,
    consentStatus: 'active'
  },
  {
    id: 'MINOR003',
    name: 'Oliver Wilson',
    dateOfBirth: '2009-11-08',
    guardianId: 'PARTY003',
    guardianName: 'Bob Wilson',
    guardianRelation: 'Father',
    age: 15,
    consentStatus: 'revoked'
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