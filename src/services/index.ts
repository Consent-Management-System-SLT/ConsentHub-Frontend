// Service exports for ConsentHub - Multi-Service Architecture
export { apiClient } from './apiClient';
export { multiServiceApiClient } from './multiServiceApiClient';
// Core services using standardized multiServiceApiClient
export { consentService } from './consentService';
export { preferenceService } from './preferenceService';
export { partyService } from './partyService';
export { dsarService } from './dsarService';
export { customerService } from './customerService';
// Supporting services
export { privacyNoticeService } from './privacyNoticeService';
export { authService } from './authService';
export { auditService } from './auditService';
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
  PreferenceUpdateRequest
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
  DSARRequest
} from './dsarService';
export type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User 
} from './authService';
