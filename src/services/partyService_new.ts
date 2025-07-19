// TMF641 Party Management API Service - Updated for Multi-Service Architecture
import { multiServiceApiClient } from './multiServiceApiClient';

export interface PartyCreateRequest {
  id?: string;
  name: string;
  description?: string;
  status?: 'active' | 'inactive' | 'suspended';
  partyType: 'individual' | 'organization';
  contactMedium?: Array<{
    type: string;
    characteristic: {
      emailAddress?: string;
      phoneNumber?: string;
      street1?: string;
      street2?: string;
      city?: string;
      stateOrProvince?: string;
      postcode?: string;
      country?: string;
    };
  }>;
  characteristic?: Array<{
    name: string;
    value: string;
    valueType?: string;
  }>;
  relatedParty?: Array<{
    id: string;
    role: string;
    name?: string;
  }>;
  externalReference?: Array<{
    type: string;
    externalId: string;
    name?: string;
  }>;
}

export interface PartyUpdateRequest {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'suspended';
  contactMedium?: Array<{
    type: string;
    characteristic: {
      emailAddress?: string;
      phoneNumber?: string;
      street1?: string;
      street2?: string;
      city?: string;
      stateOrProvince?: string;
      postcode?: string;
      country?: string;
    };
  }>;
  characteristic?: Array<{
    name: string;
    value: string;
    valueType?: string;
  }>;
}

export interface PartyQuery {
  name?: string;
  status?: string;
  partyType?: string;
  contactMediumType?: string;
  limit?: number;
  offset?: number;
}

class PartyService {
  private readonly basePath = '/api/v1';

  /**
   * TMF641 - Get list of parties
   */
  async getParties(query: PartyQuery = {}): Promise<any> {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = `/party${queryString ? `?${queryString}` : ''}`;
    
    return multiServiceApiClient.makeRequest('GET', url, undefined, 'admin', 'party');
  }

  /**
   * TMF641 - Get specific party by ID
   */
  async getPartyById(id: string): Promise<any> {
    return multiServiceApiClient.makeRequest('GET', `${this.basePath}/party/${id}`, undefined, 'admin', 'party');
  }

  /**
   * TMF641 - Create new party
   */
  async createParty(party: PartyCreateRequest): Promise<any> {
    return multiServiceApiClient.makeRequest('POST', `${this.basePath}/party`, party, 'admin', 'party');
  }

  /**
   * TMF641 - Update existing party
   */
  async updateParty(id: string, updates: PartyUpdateRequest): Promise<any> {
    return multiServiceApiClient.makeRequest('PUT', `${this.basePath}/party/${id}`, updates, 'admin', 'party');
  }

  /**
   * TMF641 - Delete party
   */
  async deleteParty(id: string): Promise<any> {
    return multiServiceApiClient.makeRequest('DELETE', `${this.basePath}/party/${id}`, undefined, 'admin', 'party');
  }

  /**
   * TMF641 - Search parties
   */
  async searchParties(searchTerm: string, filters?: PartyQuery): Promise<any> {
    const query = {
      q: searchTerm,
      ...filters
    };
    
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    return multiServiceApiClient.makeRequest('GET', `${this.basePath}/party/search?${params}`, undefined, 'admin', 'party');
  }

  /**
   * TMF641 - Get party relationships
   */
  async getPartyRelationships(id: string): Promise<any> {
    return multiServiceApiClient.makeRequest('GET', `${this.basePath}/party/${id}/relationships`, undefined, 'admin', 'party');
  }

  /**
   * TMF641 - Add party relationship
   */
  async addPartyRelationship(id: string, relationship: any): Promise<any> {
    return multiServiceApiClient.makeRequest('POST', `${this.basePath}/party/${id}/relationships`, relationship, 'admin', 'party');
  }

  /**
   * TMF641 - Remove party relationship
   */
  async removePartyRelationship(id: string, relationshipId: string): Promise<any> {
    return multiServiceApiClient.makeRequest('DELETE', `${this.basePath}/party/${id}/relationships/${relationshipId}`, undefined, 'admin', 'party');
  }

  /**
   * Get party statistics
   */
  async getPartyStats(): Promise<any> {
    return multiServiceApiClient.makeRequest('GET', `${this.basePath}/party/stats`, undefined, 'admin', 'party');
  }

  /**
   * Bulk create parties
   */
  async bulkCreateParties(parties: PartyCreateRequest[]): Promise<any> {
    return multiServiceApiClient.makeRequest('POST', `${this.basePath}/party/bulk`, { parties }, 'admin', 'party');
  }

  /**
   * Export parties
   */
  async exportParties(query: PartyQuery = {}): Promise<any> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = `${this.basePath}/party/export${queryString ? `?${queryString}` : ''}`;
    
    return multiServiceApiClient.makeRequest('GET', url, undefined, 'admin', 'party');
  }
}

export const partyService = new PartyService();
