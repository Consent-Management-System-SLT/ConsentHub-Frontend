// TMF632 Extended - Communication Preference Management API Service
import { apiClient, ApiResponse } from './apiClient';
import { PrivacyPreference } from '../types/consent';

export interface PreferenceCreateRequest {
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
  doNotDisturb?: {
    start: string;
    end: string;
  };
  frequencyLimits?: {
    email: number;
    sms: number;
  };
}

export interface PreferenceUpdateRequest {
  preferredChannels?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    voice?: boolean;
  };
  topicSubscriptions?: {
    product_updates?: boolean;
    promotions?: boolean;
    billing_alerts?: boolean;
    service_notifications?: boolean;
  };
  doNotDisturb?: {
    start?: string;
    end?: string;
  };
  frequencyLimits?: {
    email?: number;
    sms?: number;
  };
}

export interface PreferenceQuery {
  partyId?: string;
  channel?: string;
  topic?: string;
  limit?: number;
  offset?: number;
}

export interface PreferenceListResponse {
  preferences: PrivacyPreference[];
  totalCount: number;
  hasMore: boolean;
}

class PreferenceService {
  private readonly basePath = '/api/v1';

  /**
   * TMF632 Extended - Get list of privacy preferences
   */
  async getPreferences(query: PreferenceQuery = {}): Promise<ApiResponse<PreferenceListResponse>> {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = `${this.basePath}/preference${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<PreferenceListResponse>(url);
  }

  /**
   * TMF632 Extended - Get specific preference by ID
   */
  async getPreferenceById(id: string): Promise<ApiResponse<PrivacyPreference>> {
    return apiClient.get<PrivacyPreference>(`${this.basePath}/privacyPreference/${id}`);
  }

  /**
   * TMF632 Extended - Get preference by party ID
   */
  async getPreferenceByPartyId(partyId: string): Promise<ApiResponse<PrivacyPreference>> {
    return apiClient.get<PrivacyPreference>(`${this.basePath}/privacyPreference/party/${partyId}`);
  }

  /**
   * TMF632 Extended - Create new preference
   */
  async createPreference(preference: PreferenceCreateRequest): Promise<ApiResponse<PrivacyPreference>> {
    return apiClient.post<PrivacyPreference>(`${this.basePath}/privacyPreference`, preference);
  }

  /**
   * TMF632 Extended - Update existing preference
   */
  async updatePreference(id: string, updates: PreferenceUpdateRequest): Promise<ApiResponse<PrivacyPreference>> {
    return apiClient.patch<PrivacyPreference>(`${this.basePath}/privacyPreference/${id}`, updates);
  }

  /**
   * TMF632 Extended - Update preference by party ID
   */
  async updatePreferenceByPartyId(partyId: string, updates: PreferenceUpdateRequest): Promise<ApiResponse<PrivacyPreference>> {
    return apiClient.patch<PrivacyPreference>(`${this.basePath}/privacyPreference/party/${partyId}`, updates);
  }

  /**
   * TMF632 Extended - Delete preference
   */
  async deletePreference(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.basePath}/privacyPreference/${id}`);
  }

  /**
   * Check if communication is allowed
   */
  async checkCommunicationAllowed(partyId: string, channel: string, topic?: string): Promise<ApiResponse<{
    allowed: boolean;
    reason?: string;
    nextAllowedTime?: string;
  }>> {
    const params = new URLSearchParams({
      partyId,
      channel,
      ...(topic && { topic })
    });

    return apiClient.get<any>(`${this.basePath}/privacyPreference/check-communication?${params}`);
  }

  /**
   * Get communication preferences summary
   */
  async getPreferencesSummary(partyId: string): Promise<ApiResponse<{
    allowedChannels: string[];
    subscribedTopics: string[];
    doNotDisturbActive: boolean;
    frequencyLimitsReached: boolean;
  }>> {
    return apiClient.get<any>(`${this.basePath}/privacyPreference/summary/${partyId}`);
  }

  /**
   * Bulk update preferences for multiple parties
   */
  async bulkUpdatePreferences(updates: Array<{
    partyId: string;
    updates: PreferenceUpdateRequest;
  }>): Promise<ApiResponse<PrivacyPreference[]>> {
    return apiClient.post<PrivacyPreference[]>(`${this.basePath}/privacyPreference/bulk`, { updates });
  }

  /**
   * Reset preferences to default
   */
  async resetPreferences(partyId: string): Promise<ApiResponse<PrivacyPreference>> {
    return apiClient.post<PrivacyPreference>(`${this.basePath}/privacyPreference/reset/${partyId}`);
  }

  /**
   * Get preference statistics
   */
  async getPreferenceStats(): Promise<ApiResponse<{
    totalPreferences: number;
    channelStats: Record<string, number>;
    topicStats: Record<string, number>;
    doNotDisturbCount: number;
  }>> {
    return apiClient.get<any>(`${this.basePath}/privacyPreference/stats`);
  }
}

export const preferenceService = new PreferenceService();
