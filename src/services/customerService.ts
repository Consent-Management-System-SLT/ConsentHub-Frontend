// TMF632 Privacy Management & TMF641 Party Management API service
import { 
  consentService, 
  preferenceService, 
  partyService, 
  dsarService
} from './index';
import { PrivacyConsent, PrivacyPreference, Party, DSARRequest, ConsentPurpose } from '../types/consent';

interface ConsentPreference {
  dataProcessing: boolean;
  marketing: boolean;
  analytics: boolean;
  thirdPartySharing: boolean;
  location: boolean;
}

interface ConsentHistory {
  id: string;
  action: string;
  category: string;
  timestamp: string;
  details: string;
}

interface DataSubjectRequest {
  requestType: 'access' | 'correction' | 'deletion' | 'portability';
  description: string;
}

class CustomerService {
  // TMF632 - Get customer's consent preferences
  async getConsentPreferences(customerId: string): Promise<ConsentPreference> {
    const response = await consentService.getConsents({ partyId: customerId });
    const consents = response.data.consents;
    
    // Transform consents to ConsentPreference format
    const preferences: ConsentPreference = {
      dataProcessing: consents.some(c => c.purpose === 'dataProcessing' && c.status === 'granted'),
      marketing: consents.some(c => c.purpose === 'marketing' && c.status === 'granted'),
      analytics: consents.some(c => c.purpose === 'analytics' && c.status === 'granted'),
      thirdPartySharing: consents.some(c => c.purpose === 'thirdPartySharing' && c.status === 'granted'),
      location: consents.some(c => c.purpose === 'location' && c.status === 'granted'),
    };
    
    return preferences;
  }

  // TMF632 - Update customer's consent preferences
  async updateConsentPreferences(customerId: string, preferences: ConsentPreference): Promise<void> {
    const purposeMap: Record<keyof ConsentPreference, ConsentPurpose> = {
      dataProcessing: 'dataProcessing',
      marketing: 'marketing',
      analytics: 'analytics',
      thirdPartySharing: 'thirdPartySharing',
      location: 'location'
    };
    
    for (const [prefKey, purpose] of Object.entries(purposeMap)) {
      const isGranted = preferences[prefKey as keyof ConsentPreference];
      
      // Check if consent already exists
      const existingConsents = await consentService.getConsents({ partyId: customerId, purpose });
      
      if (existingConsents.data.consents.length > 0) {
        // Update existing consent
        const consent = existingConsents.data.consents[0];
        await consentService.updateConsent(consent.id, {
          status: isGranted ? 'granted' : 'revoked'
        });
      } else if (isGranted) {
        // Create new consent
        await consentService.createConsent({
          partyId: customerId,
          purpose,
          status: 'granted',
          channel: 'all',
          validFor: {
            startDateTime: new Date().toISOString()
          }
        });
      }
    }
  }

  // TMF632 - Get customer's consent history
  async getConsentHistory(customerId: string): Promise<ConsentHistory[]> {
    const response = await consentService.getConsentHistory(customerId);
    
    return response.data.map(consent => ({
      id: consent.id,
      action: consent.status,
      category: consent.purpose,
      timestamp: consent.timestampGranted,
      details: `${consent.purpose} consent ${consent.status} via ${consent.channel}`
    }));
  }

  // Get customer's data usage information
  async getDataUsageInfo(customerId: string): Promise<any> {
    const [consents, preferences] = await Promise.all([
      consentService.getConsents({ partyId: customerId }),
      preferenceService.getPreferenceByPartyId(customerId)
    ]);

    return {
      consents: consents.data.consents,
      preferences: preferences.data,
      lastUpdated: preferences.data.lastUpdated
    };
  }

  // TMF632 - Submit data subject request
  async submitDataSubjectRequest(customerId: string, request: DataSubjectRequest): Promise<DSARRequest> {
    const dsarRequest = {
      partyId: customerId,
      type: request.requestType === 'access' ? 'data_export' : 
            request.requestType === 'deletion' ? 'data_deletion' : 
            request.requestType === 'portability' ? 'portability' : 'rectification',
      description: request.description
    } as const;

    const response = await dsarService.createDSARRequest(dsarRequest);
    return response.data;
  }

  // Get customer's privacy agreements
  async getPrivacyAgreements(customerId: string): Promise<any[]> {
    const response = await consentService.getConsents({ partyId: customerId });
    
    return response.data.consents.map(consent => ({
      id: consent.id,
      title: `${consent.purpose} Privacy Agreement`,
      version: consent.versionAccepted,
      status: consent.status,
      dateAccepted: consent.timestampGranted,
      jurisdiction: consent.geoLocation
    }));
  }

  // Update privacy agreement acceptance status
  async updatePrivacyAgreementStatus(_customerId: string, agreementId: string, accepted: boolean): Promise<void> {
    await consentService.updateConsent(agreementId, {
      status: accepted ? 'granted' : 'revoked'
    });
  }

  // Get customer profile
  async getCustomerProfile(customerId: string): Promise<Party> {
    const response = await partyService.getPartyById(customerId);
    return response.data;
  }

  // Update customer profile
  async updateCustomerProfile(customerId: string, updates: Partial<Party>): Promise<Party> {
    const response = await partyService.updateParty(customerId, updates);
    return response.data;
  }

  // Get customer's communication preferences
  async getCommunicationPreferences(customerId: string): Promise<PrivacyPreference> {
    const response = await preferenceService.getPreferenceByPartyId(customerId);
    return response.data;
  }

  // Update customer's communication preferences
  async updateCommunicationPreferences(customerId: string, preferences: Partial<PrivacyPreference>): Promise<PrivacyPreference> {
    const response = await preferenceService.updatePreferenceByPartyId(customerId, preferences);
    return response.data;
  }

  // Get customer's DSAR requests
  async getDataSubjectRequests(customerId: string): Promise<DSARRequest[]> {
    const response = await dsarService.getDSARRequestsByPartyId(customerId);
    return response.data.requests;
  }

  // Check if communication is allowed
  async checkCommunicationAllowed(customerId: string, channel: string, topic?: string): Promise<boolean> {
    const response = await preferenceService.checkCommunicationAllowed(customerId, channel, topic);
    return response.data.allowed;
  }

  // Get customer dashboard data
  async getCustomerDashboardData(customerId: string): Promise<{
    profile: Party;
    consents: PrivacyConsent[];
    preferences: PrivacyPreference;
    dsarRequests: DSARRequest[];
    consentStats: any;
  }> {
    const [profile, consents, preferences, dsarRequests, consentStats] = await Promise.all([
      this.getCustomerProfile(customerId),
      consentService.getConsents({ partyId: customerId }).then(r => r.data.consents),
      this.getCommunicationPreferences(customerId),
      this.getDataSubjectRequests(customerId),
      consentService.getConsentStats(customerId).then(r => r.data)
    ]);

    return {
      profile,
      consents,
      preferences,
      dsarRequests,
      consentStats
    };
  }
}

export const customerService = new CustomerService();
