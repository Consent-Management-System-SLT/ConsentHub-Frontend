// TMF669 Event Management API Service
import { apiClient, ApiResponse } from './apiClient';
import type { PrivacyConsent, PrivacyPreference, PrivacyNotice, DSARRequest } from '../types/consent';

// TMF669 Event Envelope
interface TMF669Event {
  eventId: string;
  eventTime: string;
  eventType: string;
  event: {
    resource: any;
  };
  domain: 'ConsentHub';
  title: string;
  description: string;
  priority: 'Normal' | 'High' | 'Critical';
  source: string;
}

// Specific Event Types
interface PrivacyConsentChangeEvent extends TMF669Event {
  eventType: 'PrivacyConsentChangeEvent';
  event: {
    resource: {
      id: string;
      partyId: string;
      purpose: string;
      status: 'granted' | 'revoked' | 'pending' | 'expired';
      channel: string;
      validFor: {
        startDateTime: string;
        endDateTime?: string;
      };
      privacyNoticeId: string;
      versionAccepted: string;
      timestampGranted: string;
      timestampRevoked?: string;
      source: string;
    };
  };
}

interface PrivacyPreferenceChangeEvent extends TMF669Event {
  eventType: 'PrivacyPreferenceChangeEvent';
  event: {
    resource: {
      id: string;
      partyId: string;
      preferredChannels: Record<string, boolean>;
      topicSubscriptions: Record<string, boolean>;
      doNotDisturb: {
        start: string;
        end: string;
      };
      lastUpdated: string;
    };
  };
}

interface PrivacyNoticeChangeEvent extends TMF669Event {
  eventType: 'PrivacyNoticeChangeEvent';
  event: {
    resource: {
      id: string;
      version: string;
      jurisdiction: string;
      publishedAt: string;
      url: string;
      active: boolean;
    };
  };
}

interface DSARRequestEvent extends TMF669Event {
  eventType: 'DSARRequestEvent';
  event: {
    resource: {
      requestId: string;
      partyId: string;
      type: 'data_export' | 'data_deletion' | 'restriction';
      status: 'initiated' | 'processing' | 'completed' | 'failed';
      submittedAt: string;
    };
  };
}

// Event Hub Registration
interface EventHubRegistration {
  callback: string;
  query?: string;
  clientCredential?: {
    clientId: string;
    clientSecret: string;
  };
}

class TMF669EventService {
  private baseUrl = import.meta.env.VITE_TMF669_API_URL || 'http://localhost:3000/tmf-api/eventManagement/v4';
  private eventSubscriptions: Map<string, Function[]> = new Map();

  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // TMF669 /hub endpoints
  async registerEventListener(registration: EventHubRegistration): Promise<void> {
    const response = await fetch(`${this.baseUrl}/hub`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(registration)
    });

    if (!response.ok) {
      throw new Error('Failed to register event listener');
    }
  }

  async unregisterEventListener(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/hub/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to unregister event listener');
    }
  }

  // Event Publishing
  async publishConsentChangeEvent(consent: PrivacyConsent, action: 'granted' | 'revoked' | 'updated'): Promise<void> {
    const event: PrivacyConsentChangeEvent = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventTime: new Date().toISOString(),
      eventType: 'PrivacyConsentChangeEvent',
      event: {
        resource: {
          id: consent.id,
          partyId: consent.partyId,
          purpose: consent.purpose,
          status: consent.status,
          channel: consent.channel,
          validFor: {
            startDateTime: consent.validFrom,
            endDateTime: consent.validTo
          },
          privacyNoticeId: consent.privacyNoticeId,
          versionAccepted: consent.versionAccepted,
          timestampGranted: consent.timestampGranted,
          timestampRevoked: consent.timestampRevoked,
          source: consent.recordSource
        }
      },
      domain: 'ConsentHub',
      title: `Customer ${action} ${consent.purpose.toLowerCase()} consent`,
      description: `Customer with ID ${consent.partyId} ${action} ${consent.purpose.toLowerCase()} consent.`,
      priority: 'Normal',
      source: 'consent-service'
    };

    await this.publishEvent(event);
  }

  async publishPreferenceChangeEvent(preference: PrivacyPreference): Promise<void> {
    const event: PrivacyPreferenceChangeEvent = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventTime: new Date().toISOString(),
      eventType: 'PrivacyPreferenceChangeEvent',
      event: {
        resource: {
          id: preference.id,
          partyId: preference.partyId,
          preferredChannels: preference.preferredChannels,
          topicSubscriptions: preference.topicSubscriptions,
          doNotDisturb: preference.doNotDisturb,
          lastUpdated: preference.lastUpdated
        }
      },
      domain: 'ConsentHub',
      title: 'Customer updated communication preferences',
      description: `Customer with ID ${preference.partyId} updated communication preferences.`,
      priority: 'Normal',
      source: 'preference-service'
    };

    await this.publishEvent(event);
  }

  async publishNoticeChangeEvent(notice: PrivacyNotice): Promise<void> {
    const event: PrivacyNoticeChangeEvent = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventTime: new Date().toISOString(),
      eventType: 'PrivacyNoticeChangeEvent',
      event: {
        resource: {
          id: notice.id,
          version: notice.version,
          jurisdiction: notice.jurisdiction,
          publishedAt: notice.publishedAt,
          url: notice.documentUrl,
          active: notice.active
        }
      },
      domain: 'ConsentHub',
      title: `Privacy notice ${notice.version} published`,
      description: `New privacy notice version ${notice.version} published for ${notice.jurisdiction}.`,
      priority: 'High',
      source: 'privacy-notice-service'
    };

    await this.publishEvent(event);
  }

  async publishDSARRequestEvent(request: DSARRequest): Promise<void> {
    const event: DSARRequestEvent = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventTime: new Date().toISOString(),
      eventType: 'DSARRequestEvent',
      event: {
        resource: {
          requestId: request.id,
          partyId: request.partyId,
          type: request.type,
          status: request.status,
          submittedAt: request.submittedAt
        }
      },
      domain: 'ConsentHub',
      title: `DSAR request ${request.type} submitted`,
      description: `Customer with ID ${request.partyId} submitted ${request.type} request.`,
      priority: 'High',
      source: 'dsar-service'
    };

    await this.publishEvent(event);
  }

  private async publishEvent(event: TMF669Event): Promise<void> {
    const response = await fetch(`${this.baseUrl}/event`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      throw new Error('Failed to publish event');
    }

    // Trigger local event subscriptions
    this.triggerLocalEvents(event);
  }

  // Local Event Subscription Management
  subscribe(eventType: string, callback: Function): void {
    if (!this.eventSubscriptions.has(eventType)) {
      this.eventSubscriptions.set(eventType, []);
    }
    this.eventSubscriptions.get(eventType)?.push(callback);
  }

  unsubscribe(eventType: string, callback: Function): void {
    const callbacks = this.eventSubscriptions.get(eventType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private triggerLocalEvents(event: TMF669Event): void {
    const callbacks = this.eventSubscriptions.get(event.eventType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in event callback:', error);
        }
      });
    }
  }

  // Event Query
  async getEvents(filters?: {
    eventType?: string;
    partyId?: string;
    fromDate?: string;
    toDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<TMF669Event[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/event?${params}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }

    return response.json();
  }
}

export const tmf669EventService = new TMF669EventService();
export type { 
  TMF669Event, 
  PrivacyConsentChangeEvent, 
  PrivacyPreferenceChangeEvent, 
  PrivacyNoticeChangeEvent, 
  DSARRequestEvent,
  EventHubRegistration 
};
