// Service exports for ConsentHub - Multi-Service Architecture
export { apiClient } from './apiClient';
export { multiServiceApiClient } from './multiServiceApiClient';

// Core services using standardized multiServiceApiClient
export { consentService } from './consentService';
export { preferenceService } from './preferenceService';
export { partyService } from './partyService';
export { dsarService } from './dsarService';
export { customerService } from './customerService';
export { tmf620ProductCatalogService } from './tmf620ProductCatalogService';

// Supporting services
export { privacyNoticeService } from './privacyNoticeService';
export { tmf669EventService } from './eventService';
export { authService } from './authService';
export { auditService } from './auditService';
export { dashboardService } from './dashboardService';
export { advancedMonitoringService } from './advancedMonitoringService';

// Type exports
export type { ApiResponse, ApiError } from './apiClient';
export type { 
  ConsentCreateRequest, 
  ConsentUpdateRequest, 
  ConsentQuery, 
  ConsentListResponse 
} from './consentService';
export type { 
  PreferenceCreateRequest, 
  PreferenceUpdateRequest, 
  PreferenceQuery, 
  PreferenceListResponse 
} from './preferenceService';
export type { 
  PartyCreateRequest, 
  PartyUpdateRequest, 
  PartyQuery, 
  PartyListResponse,
  PartyRelationship 
} from './partyService';
export type { 
  PrivacyNoticeCreateRequest, 
  PrivacyNoticeUpdateRequest, 
  PrivacyNoticeQuery, 
  PrivacyNoticeListResponse 
} from './privacyNoticeService';
export type { 
  TMF669Event, 
  PrivacyConsentChangeEvent, 
  PrivacyPreferenceChangeEvent, 
  PrivacyNoticeChangeEvent, 
  DSARRequestEvent 
} from './eventService';
export type { 
  DSARRequest,
  DSARCreateRequest, 
  DSARUpdateRequest, 
  DSARQuery
} from './dsarService';
export type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User 
} from './authService';
export type {
  ProductOffering,
  ProductOfferingCategory,
  ProductSpecificationRef,
  ConsentRequirement,
  OfferPrivacyPreference,
  ProductOfferingQuery,
  OfferSpecificConsentRequest
} from './tmf620ProductCatalogService';
