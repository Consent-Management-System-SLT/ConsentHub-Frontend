// Service exports for ConsentHub - Multi-Service Architecture
export { apiClient } from './apiClient';

// Import updated services
export { consentService } from './consentService_new';
export { preferenceService } from './preferenceService_new';
export { partyService } from './partyService_new';
export { dsarService } from './dsarService_new';

// Keep existing services that don't need updates
export { privacyNoticeService } from './privacyNoticeService';
export { tmf669EventService } from './eventService';
export { authService } from './authService';
export { customerService } from './customerService';
export { auditService } from './auditService';
export { dashboardService } from './dashboardService';

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
  DSARRequestCreateRequest, 
  DSARRequestUpdateRequest, 
  DSARQuery, 
  DSARListResponse,
  DSARExportResult,
  DSARStats 
} from './dsarService';
export type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User 
} from './authService';
