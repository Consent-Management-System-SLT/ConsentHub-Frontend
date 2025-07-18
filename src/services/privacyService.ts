// TMF632 Party Privacy Management Service
import type { PrivacyNotice } from '../types/consent';

interface TMF632PrivacyConsent {
  id: string;
  href?: string;
  status: 'granted' | 'revoked' | 'pending' | 'expired';
  purpose: string;
  channel: string[];
  validFor: {
    startDateTime: string;
    endDateTime?: string;
  };
  relatedParty: {
    id: string;
    href?: string;
    role: string;
    name: string;
  };
  privacyNotice: {
    id: string;
    href?: string;
    version: string;
  };
  geoLocation: string;
  consentMetadata: Record<string, any>;
  '@type': 'PrivacyConsent';
}

interface TMF632PrivacyPreference {
  id: string;
  href?: string;
  relatedParty: {
    id: string;
    href?: string;
    role: string;
  };
  channelPreferences: {
    channel: string;
    enabled: boolean;
  }[];
  topicPreferences: {
    topic: string;
    enabled: boolean;
  }[];
  doNotDisturb: {
    startTime: string;
    endTime: string;
  };
  '@type': 'PrivacyPreference';
}

class TMF632PrivacyService {
  private baseUrl = import.meta.env.VITE_TMF632_API_URL || 'http://localhost:3000/tmf-api/privacyManagement/v4';

  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // TMF632 /privacyConsent endpoints
  async getPrivacyConsents(partyId?: string, purpose?: string): Promise<TMF632PrivacyConsent[]> {
    const params = new URLSearchParams();
    if (partyId) params.append('relatedParty.id', partyId);
    if (purpose) params.append('purpose', purpose);

    const response = await fetch(`${this.baseUrl}/privacyConsent?${params}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch privacy consents');
    }

    return response.json();
  }

  async createPrivacyConsent(consent: Omit<TMF632PrivacyConsent, 'id'>): Promise<TMF632PrivacyConsent> {
    const response = await fetch(`${this.baseUrl}/privacyConsent`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(consent)
    });

    if (!response.ok) {
      throw new Error('Failed to create privacy consent');
    }

    return response.json();
  }

  async updatePrivacyConsent(id: string, consent: Partial<TMF632PrivacyConsent>): Promise<TMF632PrivacyConsent> {
    const response = await fetch(`${this.baseUrl}/privacyConsent/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(consent)
    });

    if (!response.ok) {
      throw new Error('Failed to update privacy consent');
    }

    return response.json();
  }

  async deletePrivacyConsent(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/privacyConsent/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to delete privacy consent');
    }
  }

  // TMF632 /privacyPreference endpoints
  async getPrivacyPreferences(partyId: string): Promise<TMF632PrivacyPreference[]> {
    const response = await fetch(`${this.baseUrl}/privacyPreference?relatedParty.id=${partyId}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch privacy preferences');
    }

    return response.json();
  }

  async updatePrivacyPreference(id: string, preference: Partial<TMF632PrivacyPreference>): Promise<TMF632PrivacyPreference> {
    const response = await fetch(`${this.baseUrl}/privacyPreference/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(preference)
    });

    if (!response.ok) {
      throw new Error('Failed to update privacy preference');
    }

    return response.json();
  }

  // TMF632 /privacyNotice endpoints
  async getPrivacyNotices(jurisdiction?: string, language?: string): Promise<PrivacyNotice[]> {
    const params = new URLSearchParams();
    if (jurisdiction) params.append('jurisdiction', jurisdiction);
    if (language) params.append('language', language);

    const response = await fetch(`${this.baseUrl}/privacyNotice?${params}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch privacy notices');
    }

    return response.json();
  }
}

export const tmf632PrivacyService = new TMF632PrivacyService();
export type { TMF632PrivacyConsent, TMF632PrivacyPreference };
