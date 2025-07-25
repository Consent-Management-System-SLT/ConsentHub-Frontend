// Type definitions for ConsentHub aligned with TM Forum Open APIs
export type ConsentStatus = 'granted' | 'revoked' | 'pending' | 'expired';
export type ConsentPurpose = 'marketing' | 'analytics' | 'thirdPartySharing' | 'dataProcessing' | 'location' | 'research' | 'personalization';
export type ConsentChannel = 'email' | 'sms' | 'push' | 'voice' | 'all';
export type PartyType = 'individual' | 'organization' | 'guardian';

export interface Party {
  id: string;
  name: string;
  email: string;
  mobile: string;
  type: PartyType;
  status?: 'active' | 'inactive' | 'suspended';
  address?: string;
  organization?: string;
  department?: string;
  jobTitle?: string;
  createdAt?: string;
  lastUpdated?: string;
  userDetails?: {
    status?: string;
    lastLoginAt?: string;
    emailVerified?: boolean;
    createdAt?: string;
  };
  relationship?: {
    role: string;
    linkedPartyId?: string;
  };
}

export interface PrivacyConsent {
  id: string;
  partyId: string;
  purpose: ConsentPurpose;
  status: ConsentStatus;
  channel: ConsentChannel;
  validFrom: string;
  validTo?: string;
  geoLocation: string;
  privacyNoticeId: string;
  versionAccepted: string;
  timestampGranted: string;
  timestampRevoked?: string;
  recordSource: string;
  metadata?: Record<string, any>;
}

export interface PrivacyPreference {
  id: string;
  partyId: string;
  preferredChannels: {
    email: boolean;
    sms: boolean;
    push: boolean;
    voice: boolean;
  };
  topicSubscriptions: {
    product_updates: boolean;
    promotions: boolean;
    billing_alerts: boolean;
    service_notifications: boolean;
  };
  doNotDisturb: {
    start: string;
    end: string;
  };
  frequencyLimits: {
    email: number;
    sms: number;
  };
  lastUpdated: string;
}

export interface PrivacyNotice {
  id: string;
  title: string;
  version: string;
  jurisdiction: string;
  language: string;
  documentUrl: string;
  publishedAt: string;
  active: boolean;
}

export interface AuditLog {
  id: string;
  entityType: 'consent' | 'preference' | 'notice';
  entityId: string;
  operation: 'create' | 'update' | 'revoke' | 'import' | 'view';
  actorType: 'customer' | 'csr' | 'system';
  actorId: string;
  timestamp: string;
  changes: Record<string, any>;
  source: string;
}

export interface DSARRequest {
  id: string;
  partyId: string;
  type: 'data_export' | 'data_deletion' | 'restriction';
  status: 'initiated' | 'processing' | 'completed' | 'failed';
  submittedAt: string;
  completedAt?: string;
  description: string;
}