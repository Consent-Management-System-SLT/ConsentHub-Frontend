// TMF641 Party Management API Service
import { apiClient, ApiResponse } from './apiClient';
import { Party, PartyType } from '../types/consent';

export interface PartyCreateRequest {
  name: string;
  email: string;
  mobile: string;
  type: PartyType;
  relationship?: {
    role: string;
    linkedPartyId?: string;
  };
  metadata?: Record<string, any>;
}

export interface PartyUpdateRequest {
  name?: string;
  email?: string;
  mobile?: string;
  type?: PartyType;
  relationship?: {
    role?: string;
    linkedPartyId?: string;
  };
  metadata?: Record<string, any>;
}

export interface PartyQuery {
  name?: string;
  email?: string;
  mobile?: string;
  type?: PartyType;
  role?: string;
  limit?: number;
  offset?: number;
}

export interface PartyListResponse {
  parties: Party[];
  totalCount: number;
  hasMore: boolean;
}

export interface PartyRelationship {
  id: string;
  sourcePartyId: string;
  targetPartyId: string;
  relationshipType: string;
  role: string;
  validFrom: string;
  validTo?: string;
  active: boolean;
}

class PartyService {
  private readonly basePath = '/api/v1';

  /**
   * TMF641 - Get list of parties
   */
  async getParties(query: PartyQuery = {}): Promise<ApiResponse<PartyListResponse>> {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = `${this.basePath}/party/party${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<PartyListResponse>(url);
  }

  /**
   * TMF641 - Get specific party by ID
   */
  async getPartyById(id: string): Promise<ApiResponse<Party>> {
    return apiClient.get<Party>(`${this.basePath}/party/party/${id}`);
  }

  /**
   * TMF641 - Create new party
   */
  async createParty(party: PartyCreateRequest): Promise<ApiResponse<Party>> {
    return apiClient.post<Party>(`${this.basePath}/party/party`, party);
  }

  /**
   * TMF641 - Update existing party
   */
  async updateParty(id: string, updates: PartyUpdateRequest): Promise<ApiResponse<Party>> {
    return apiClient.patch<Party>(`${this.basePath}/party/party/${id}`, updates);
  }

  /**
   * TMF641 - Delete party
   */
  async deleteParty(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.basePath}/party/party/${id}`);
  }

  /**
   * Search parties by criteria
   */
  async searchParties(searchTerm: string, searchType: 'name' | 'email' | 'mobile' | 'all' = 'all'): Promise<ApiResponse<PartyListResponse>> {
    const params = new URLSearchParams({
      searchTerm,
      searchType
    });

    return apiClient.get<PartyListResponse>(`${this.basePath}/party/search?${params}`);
  }

  /**
   * Get party relationships
   */
  async getPartyRelationships(partyId: string): Promise<ApiResponse<PartyRelationship[]>> {
    return apiClient.get<PartyRelationship[]>(`${this.basePath}/party/${partyId}/relationships`);
  }

  /**
   * Create party relationship
   */
  async createPartyRelationship(relationship: {
    sourcePartyId: string;
    targetPartyId: string;
    relationshipType: string;
    role: string;
    validFrom: string;
    validTo?: string;
  }): Promise<ApiResponse<PartyRelationship>> {
    return apiClient.post<PartyRelationship>(`${this.basePath}/party/relationship`, relationship);
  }

  /**
   * Update party relationship
   */
  async updatePartyRelationship(id: string, updates: {
    relationshipType?: string;
    role?: string;
    validTo?: string;
    active?: boolean;
  }): Promise<ApiResponse<PartyRelationship>> {
    return apiClient.patch<PartyRelationship>(`${this.basePath}/party/relationship/${id}`, updates);
  }

  /**
   * Delete party relationship
   */
  async deletePartyRelationship(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.basePath}/party/relationship/${id}`);
  }

  /**
   * Get parties by role (e.g., guardians, CSRs)
   */
  async getPartiesByRole(role: string): Promise<ApiResponse<PartyListResponse>> {
    return apiClient.get<PartyListResponse>(`${this.basePath}/party/role/${role}`);
  }

  /**
   * Verify party identity
   */
  async verifyPartyIdentity(partyId: string, verificationType: 'email' | 'mobile' | 'both'): Promise<ApiResponse<{
    verified: boolean;
    verificationMethod: string;
    verifiedAt?: string;
  }>> {
    return apiClient.post<any>(`${this.basePath}/party/${partyId}/verify`, { verificationType });
  }

  /**
   * Get party statistics
   */
  async getPartyStats(): Promise<ApiResponse<{
    totalParties: number;
    byType: Record<PartyType, number>;
    byRole: Record<string, number>;
    recentRegistrations: number;
    verifiedParties: number;
  }>> {
    return apiClient.get<any>(`${this.basePath}/party/stats`);
  }

  /**
   * Bulk import parties
   */
  async bulkImportParties(parties: PartyCreateRequest[]): Promise<ApiResponse<{
    created: Party[];
    failed: Array<{ party: PartyCreateRequest; error: string }>;
  }>> {
    return apiClient.post<any>(`${this.basePath}/party/bulk`, { parties });
  }

  /**
   * Export parties data
   */
  async exportParties(format: 'csv' | 'json' | 'xlsx' = 'csv', query?: PartyQuery): Promise<ApiResponse<{
    downloadUrl: string;
    expiresAt: string;
  }>> {
    const params = new URLSearchParams({ format });
    
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    return apiClient.get<any>(`${this.basePath}/party/export?${params}`);
  }
}

export const partyService = new PartyService();
