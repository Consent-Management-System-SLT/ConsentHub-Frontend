// TMF632 Party Privacy Management API Service - Updated for Multi-Service Architecture
import { multiServiceApiClient } from './multiServiceApiClient';
import { PrivacyConsent, ConsentStatus, ConsentPurpose } from '../types/consent';

export interface ConsentCreateRequest {
  partyId: string;
  purpose: ConsentPurpose;
  status: ConsentStatus;
  channel: string;
  validFor?: {
    startDateTime: string;
    endDateTime?: string;
  };
  geoLocation?: string;
  privacyNoticeId?: string;
  versionAccepted?: string;
  metadata?: Record<string, any>;
}

export interface ConsentUpdateRequest {
  status?: ConsentStatus;
  validFor?: {
    startDateTime?: string;
    endDateTime?: string;
  };
  metadata?: Record<string, any>;
}

export interface ConsentQuery {
  partyId?: string;
  purpose?: ConsentPurpose;
  status?: ConsentStatus;
  channel?: string;
  geoLocation?: string;
  validFrom?: string;
  validTo?: string;
  limit?: number;
  offset?: number;
}

export interface ConsentListResponse {
  consents: PrivacyConsent[];
  totalCount: number;
  hasMore: boolean;
}

class ConsentService {
  private readonly basePath = '/api/v1';

  /**
   * TMF632 - Get list of privacy consents
   */
  async getConsents(query: ConsentQuery = {}): Promise<any> {
    // If we have a specific partyId, use the party-specific route
    if (query.partyId && query.partyId !== 'all') {
      return multiServiceApiClient.makeRequest('GET', `/consent/party/${query.partyId}`, undefined, 'admin', 'consent');
    }
    
    // Use the new simplified endpoint that returns all consents
    return multiServiceApiClient.makeRequest('GET', '/consent', undefined, 'admin', 'consent');
  }

  /**
   * TMF632 - Get specific consent by ID
   */
  async getConsentById(id: string): Promise<any> {
    return multiServiceApiClient.makeRequest('GET', `/consent/${id}`, undefined, 'admin', 'consent');
  }

  /**
   * TMF632 - Create new consent
   */
  async createConsent(consent: ConsentCreateRequest): Promise<any> {
    return multiServiceApiClient.makeRequest('POST', `${this.basePath}/consent`, consent, 'admin', 'consent');
  }

  /**
   * TMF632 - Update existing consent
   */
  async updateConsent(id: string, updates: ConsentUpdateRequest): Promise<any> {
    return multiServiceApiClient.makeRequest('PUT', `${this.basePath}/privacyConsent/${id}`, updates, 'admin', 'consent');
  }

  /**
   * TMF632 - Revoke consent
   */
  async revokeConsent(id: string, reason?: string): Promise<any> {
    const updates = {
      status: 'revoked',
      timestampRevoked: new Date().toISOString(),
      metadata: { revocationReason: reason }
    };
    return multiServiceApiClient.makeRequest('PUT', `${this.basePath}/privacyConsent/${id}`, updates, 'admin', 'consent');
  }

  /**
   * TMF632 - Delete consent (hard delete)
   */
  async deleteConsent(id: string): Promise<any> {
    return multiServiceApiClient.makeRequest('DELETE', `${this.basePath}/privacyConsent/${id}`, undefined, 'admin', 'consent');
  }

  /**
   * TMF632 - Get consent history for party
   */
  async getConsentHistory(partyId: string): Promise<any> {
    return multiServiceApiClient.makeRequest('GET', `${this.basePath}/privacyConsent/history/${partyId}`, undefined, 'admin', 'consent');
  }

  /**
   * TMF632 - Bulk create consents
   */
  async bulkCreateConsents(consents: ConsentCreateRequest[]): Promise<any> {
    return multiServiceApiClient.makeRequest('POST', `${this.basePath}/privacyConsent/bulk`, { consents }, 'admin', 'consent');
  }

  /**
   * TMF632 - Validate consent for specific purpose
   */
  async validateConsent(partyId: string, purpose: ConsentPurpose, channel?: string): Promise<any> {
    const params = new URLSearchParams({
      partyId,
      purpose,
      ...(channel && { channel })
    });
    
    return multiServiceApiClient.makeRequest('GET', `${this.basePath}/privacyConsent/validate?${params}`, undefined, 'admin', 'consent');
  }

  /**
   * TMF632 - Get consent statistics
   */
  async getConsentStats(partyId?: string): Promise<any> {
    const params = partyId ? `?partyId=${partyId}` : '';
    return multiServiceApiClient.makeRequest('GET', `${this.basePath}/privacyConsent/stats${params}`, undefined, 'admin', 'consent');
  }
}

export const consentService = new ConsentService();
