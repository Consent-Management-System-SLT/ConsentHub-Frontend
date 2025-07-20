// TMF620 Product Catalog Service for Offer-Specific Preferences
import { multiServiceApiClient } from './multiServiceApiClient';

// TMF620 Product Catalog Interfaces
export interface ProductOffering {
  id?: string;
  href?: string;
  name: string;
  description?: string;
  version?: string;
  validFor?: {
    startDateTime?: string;
    endDateTime?: string;
  };
  lifecycleStatus?: 'In Study' | 'In Design' | 'In Test' | 'Active' | 'Launched' | 'Retired' | 'Obsolete';
  category?: ProductOfferingCategory[];
  productSpecification?: ProductSpecificationRef;
  consentRequirements?: ConsentRequirement[];
  privacyPreferences?: OfferPrivacyPreference[];
  '@type'?: string;
  '@baseType'?: string;
}

export interface ProductOfferingCategory {
  id?: string;
  href?: string;
  name?: string;
  description?: string;
  version?: string;
  '@type'?: string;
}

export interface ProductSpecificationRef {
  id: string;
  href?: string;
  name?: string;
  version?: string;
  '@type'?: string;
  '@referredType'?: string;
}

export interface ConsentRequirement {
  id?: string;
  purpose: string;
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
  dataProcessingType: 'collection' | 'use' | 'disclosure' | 'storage' | 'combination';
  dataCategories: string[];
  retentionPeriod?: string;
  isRequired: boolean;
  description?: string;
  consentText?: string;
}

export interface OfferPrivacyPreference {
  id?: string;
  offeringId: string;
  preferenceType: 'marketing' | 'analytics' | 'personalization' | 'third_party_sharing';
  channel?: 'email' | 'sms' | 'push' | 'phone' | 'mail';
  frequency?: 'immediate' | 'daily' | 'weekly' | 'monthly' | 'never';
  defaultValue: boolean;
  isConfigurable: boolean;
  description?: string;
  dependsOnConsent?: string[]; // IDs of required consents
}

export interface ProductOfferingQuery {
  name?: string;
  category?: string;
  lifecycleStatus?: string;
  validForStartDateTime?: string;
  validForEndDateTime?: string;
  hasConsentRequirements?: boolean;
  hasPrivacyPreferences?: boolean;
  limit?: number;
  offset?: number;
}

export interface OfferSpecificConsentRequest {
  partyId: string;
  offeringId: string;
  consentRequirements: Array<{
    consentRequirementId: string;
    granted: boolean;
    grantedAt?: string;
    purpose: string;
    legalBasis: string;
  }>;
  privacyPreferences?: Array<{
    preferenceId: string;
    enabled: boolean;
    channel?: string;
    frequency?: string;
  }>;
}

class TMF620ProductCatalogService {
  /**
   * Get all product offerings
   */
  async getProductOfferings(query: ProductOfferingQuery = {}): Promise<any> {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = `/productCatalogManagement/v4/productOffering${queryString ? `?${queryString}` : ''}`;
    
    return multiServiceApiClient.makeRequest('GET', url, undefined, 'user', 'catalog');
  }

  /**
   * Get specific product offering by ID
   */
  async getProductOfferingById(id: string): Promise<ProductOffering> {
    return multiServiceApiClient.makeRequest('GET', `/productCatalogManagement/v4/productOffering/${id}`, undefined, 'user', 'catalog');
  }

  /**
   * Get consent requirements for a product offering
   */
  async getOfferingConsentRequirements(offeringId: string): Promise<ConsentRequirement[]> {
    return multiServiceApiClient.makeRequest('GET', `/productCatalogManagement/v4/productOffering/${offeringId}/consentRequirements`, undefined, 'user', 'catalog');
  }

  /**
   * Get privacy preferences available for a product offering
   */
  async getOfferingPrivacyPreferences(offeringId: string): Promise<OfferPrivacyPreference[]> {
    return multiServiceApiClient.makeRequest('GET', `/productCatalogManagement/v4/productOffering/${offeringId}/privacyPreferences`, undefined, 'user', 'catalog');
  }

  /**
   * Subscribe to product offering with consent and preferences
   */
  async subscribeToOfferingWithConsent(request: OfferSpecificConsentRequest): Promise<any> {
    return multiServiceApiClient.makeRequest('POST', `/productCatalogManagement/v4/productOffering/subscribe`, request, 'user', 'catalog');
  }

  /**
   * Update consent and preferences for existing subscription
   */
  async updateOfferingConsent(partyId: string, offeringId: string, updates: Partial<OfferSpecificConsentRequest>): Promise<any> {
    return multiServiceApiClient.makeRequest('PUT', `/productCatalogManagement/v4/productOffering/${offeringId}/party/${partyId}/consent`, updates, 'user', 'catalog');
  }

  /**
   * Get party's consent status for a specific offering
   */
  async getPartyOfferingConsent(partyId: string, offeringId: string): Promise<any> {
    return multiServiceApiClient.makeRequest('GET', `/productCatalogManagement/v4/productOffering/${offeringId}/party/${partyId}/consent`, undefined, 'user', 'catalog');
  }

  /**
   * Get all offerings a party has consented to
   */
  async getPartySubscribedOfferings(partyId: string): Promise<ProductOffering[]> {
    return multiServiceApiClient.makeRequest('GET', `/productCatalogManagement/v4/party/${partyId}/subscribedOfferings`, undefined, 'user', 'catalog');
  }

  /**
   * Validate consent requirements for offering subscription
   */
  async validateOfferingConsent(partyId: string, offeringId: string): Promise<{
    isValid: boolean;
    missingConsents: string[];
    expiredConsents: string[];
    recommendations: string[];
  }> {
    return multiServiceApiClient.makeRequest('POST', `/productCatalogManagement/v4/productOffering/${offeringId}/party/${partyId}/validateConsent`, undefined, 'user', 'catalog');
  }

  /**
   * Get offering categories
   */
  async getProductOfferingCategories(): Promise<ProductOfferingCategory[]> {
    return multiServiceApiClient.makeRequest('GET', `/productCatalogManagement/v4/category`, undefined, 'user', 'catalog');
  }

  /**
   * Search offerings by category with consent filters
   */
  async getOfferingsByCategory(categoryId: string, includeConsentInfo: boolean = true): Promise<ProductOffering[]> {
    const params = new URLSearchParams();
    if (includeConsentInfo) {
      params.append('fields', 'consentRequirements,privacyPreferences');
    }
    
    const queryString = params.toString();
    const url = `/productCatalogManagement/v4/category/${categoryId}/productOffering${queryString ? `?${queryString}` : ''}`;
    
    return multiServiceApiClient.makeRequest('GET', url, undefined, 'user', 'catalog');
  }
}

export const tmf620ProductCatalogService = new TMF620ProductCatalogService();
