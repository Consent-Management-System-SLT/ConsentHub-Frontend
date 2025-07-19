// TMF632 Extended - Communication Preference Management API Service - Updated for Multi-Service Architecture
import { multiServiceApiClient } from './multiServiceApiClient';
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
   * Get list of communication preferences
   */
  async getPreferences(query: PreferenceQuery = {}): Promise<any> {
    if (query.partyId && query.partyId !== 'all') {
      return multiServiceApiClient.makeRequest('GET', `/preference/party/${query.partyId}`, undefined, 'admin', 'preference');
    }
    
    // Get all preferences
    return multiServiceApiClient.makeRequest('GET', '/preference', undefined, 'admin', 'preference');
  }

  /**
   * Get specific preference by ID
   */
  async getPreferenceById(id: string): Promise<any> {
    return multiServiceApiClient.makeRequest('GET', `${this.basePath}/preference/${id}`, undefined, 'admin', 'preference');
  }

  /**
   * Get preferences for specific party
   */
  async getPreferencesForParty(partyId: string): Promise<any> {
    return multiServiceApiClient.makeRequest('GET', `${this.basePath}/preference?partyId=${partyId}`, undefined, 'admin', 'preference');
  }

  /**
   * Create new preference
   */
  async createPreference(preference: PreferenceCreateRequest): Promise<any> {
    return multiServiceApiClient.makeRequest('POST', `${this.basePath}/preference`, preference, 'admin', 'preference');
  }

  /**
   * Update existing preference
   */
  async updatePreference(id: string, updates: PreferenceUpdateRequest): Promise<any> {
    return multiServiceApiClient.makeRequest('PUT', `${this.basePath}/preference/${id}`, updates, 'admin', 'preference');
  }

  /**
   * Delete preference
   */
  async deletePreference(id: string): Promise<any> {
    return multiServiceApiClient.makeRequest('DELETE', `${this.basePath}/preference/${id}`, undefined, 'admin', 'preference');
  }

  /**
   * Bulk update preferences
   */
  async bulkUpdatePreferences(partyId: string, updates: PreferenceUpdateRequest): Promise<any> {
    return multiServiceApiClient.makeRequest('PUT', `${this.basePath}/preference/bulk/${partyId}`, updates, 'admin', 'preference');
  }

  /**
   * Reset preferences to default
   */
  async resetPreferences(partyId: string): Promise<any> {
    return multiServiceApiClient.makeRequest('POST', `${this.basePath}/preference/reset/${partyId}`, undefined, 'admin', 'preference');
  }

  /**
   * Validate preference settings
   */
  async validatePreferences(preferences: PreferenceCreateRequest): Promise<any> {
    return multiServiceApiClient.makeRequest('POST', `${this.basePath}/preference/validate`, preferences, 'admin', 'preference');
  }

  /**
   * Get preference statistics
   */
  async getPreferenceStats(partyId?: string): Promise<any> {
    const params = partyId ? `?partyId=${partyId}` : '';
    return multiServiceApiClient.makeRequest('GET', `${this.basePath}/preference/stats${params}`, undefined, 'admin', 'preference');
  }

  /**
   * Export preferences
   */
  async exportPreferences(query: PreferenceQuery = {}): Promise<any> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = `${this.basePath}/preference/export${queryString ? `?${queryString}` : ''}`;
    
    return multiServiceApiClient.makeRequest('GET', url, undefined, 'admin', 'preference');
  }

  /**
   * Import preferences
   */
  async importPreferences(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return multiServiceApiClient.makeRequest('POST', `${this.basePath}/preference/import`, formData, 'admin', 'preference');
  }
}

export const preferenceService = new PreferenceService();
