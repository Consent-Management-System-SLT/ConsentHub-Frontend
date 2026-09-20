// TMF632 Party Privacy Management API Service
import { apiClient, ApiResponse } from './apiClient';
import { PrivacyConsent, ConsentStatus, ConsentPurpose } from '../types/consent';
// One consent type at one version (a row of consent_scopes joined to its consent type).
export interface ConsentScope {
  consentScopeId: number;
  consentId: number;
  consentCode: string;
  consentName: string;
  scopeName: string;
  scopeVersion: string;
  status: string;
  effectiveFrom?: string;
  effectiveTo?: string | null;
}

// A customer's consent decision, in the columns of the CUSTOMER_CONSENT table.
export interface ConsentCreateRequest {
  customerId: string;
  consentScopeId: number;
  consentStatus: string;
  channel: string;
  source: string;
  consentDateTime?: string;
  withdrawalDateTime?: string;
}
export type ConsentUpdateRequest = Partial<Omit<ConsentCreateRequest, 'customerId'>>;
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
  async getConsents(query: ConsentQuery = {}): Promise<ApiResponse<ConsentListResponse>> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    const queryString = params.toString();
    const url = `${this.basePath}/consent${queryString ? `?${queryString}` : ''}`;
    return apiClient.get<ConsentListResponse>(url);
  }
  /**
   * TMF632 - Get specific consent by ID
   */
  /** Every consent type and version; the admin form offers only the active ones. */
  async getConsentScopes(): Promise<ApiResponse<ConsentScope[]>> {
    return apiClient.get<ConsentScope[]>(`${this.basePath}/consent-scopes?all=true`);
  }
  /** The same decision for every active customer that has none for this version yet. */
  async createConsentForAll(consent: Omit<ConsentCreateRequest, 'customerId'>): Promise<ApiResponse<{ created: number; skipped: number; total: number }>> {
    return apiClient.post(`${this.basePath}/consent/bulk`, consent);
  }
  async getConsentById(id: string): Promise<ApiResponse<PrivacyConsent>> {
    return apiClient.get<PrivacyConsent>(`${this.basePath}/consent/${id}`);
  }
  /**
   * TMF632 - Create new consent
   */
  async createConsent(consent: ConsentCreateRequest): Promise<ApiResponse<PrivacyConsent>> {
    return apiClient.post<PrivacyConsent>(`${this.basePath}/consent`, consent);
  }
  /**
   * TMF632 - Update existing consent
   */
  async updateConsent(id: string, updates: ConsentUpdateRequest): Promise<ApiResponse<PrivacyConsent>> {
    return apiClient.put<PrivacyConsent>(`${this.basePath}/consent/${id}`, updates);
  }
  /**
   * TMF632 - Revoke consent
   */
  async revokeConsent(id: string, reason?: string): Promise<ApiResponse<PrivacyConsent>> {
    return apiClient.put<PrivacyConsent>(`${this.basePath}/consent/${id}`, {
      status: 'revoked',
      timestampRevoked: new Date().toISOString(),
      metadata: { revocationReason: reason }
    });
  }
  /**
   * TMF632 - Delete consent (hard delete)
   */
  async deleteConsent(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.basePath}/consent/${id}`);
  }
  /**
   * Get consent history for a party
   */
  async getConsentHistory(partyId: string): Promise<ApiResponse<PrivacyConsent[]>> {
    return apiClient.get<PrivacyConsent[]>(`${this.basePath}/privacyConsent/history/${partyId}`);
  }
  /**
   * Bulk create consents (for migration)
   */
  async bulkCreateConsents(consents: ConsentCreateRequest[]): Promise<ApiResponse<PrivacyConsent[]>> {
    return apiClient.post<PrivacyConsent[]>(`${this.basePath}/privacyConsent/bulk`, { consents });
  }
  /**
   * Validate consent before processing
   */
  async validateConsent(partyId: string, purpose: ConsentPurpose, channel?: string): Promise<ApiResponse<{ isValid: boolean; reason?: string }>> {
    const params = new URLSearchParams({
      partyId,
      purpose,
      ...(channel && { channel })
    });
    return apiClient.get<{ isValid: boolean; reason?: string }>(`${this.basePath}/privacyConsent/validate?${params}`);
  }
  /**
   * Get consent statistics for dashboard
   */
  async getConsentStats(partyId?: string): Promise<ApiResponse<{
    totalConsents: number;
    granted: number;
    revoked: number;
    pending: number;
    expired: number;
    byPurpose: Record<ConsentPurpose, number>;
    byChannel: Record<string, number>;
  }>> {
    const params = partyId ? `?partyId=${partyId}` : '';
    return apiClient.get<any>(`${this.basePath}/privacyConsent/stats${params}`);
  }
}
export const consentService = new ConsentService();
