// GDPR DSAR (Data Subject Access Request) Service - Updated for Multi-Service Architecture
import { multiServiceApiClient } from './multiServiceApiClient';

export interface DSARRequest {
  id?: string;
  partyId: string;
  requestType: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'expired';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submissionDate: string;
  dueDate: string;
  completionDate?: string;
  requestor: {
    name: string;
    email: string;
    phone?: string;
    relationship: 'self' | 'legal_representative' | 'parent_guardian' | 'authorized_agent';
  };
  description: string;
  dataCategories?: string[];
  processingActivities?: string[];
  documents?: Array<{
    name: string;
    url: string;
    uploadDate: string;
  }>;
  responseData?: any;
  rejectionReason?: string;
  internalNotes?: string;
  assignedTo?: string;
  estimatedCompletionDate?: string;
}

export interface DSARCreateRequest {
  partyId: string;
  requestType: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  requestor: {
    name: string;
    email: string;
    phone?: string;
    relationship: 'self' | 'legal_representative' | 'parent_guardian' | 'authorized_agent';
  };
  description: string;
  dataCategories?: string[];
  processingActivities?: string[];
}

export interface DSARUpdateRequest {
  status?: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'expired';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  internalNotes?: string;
  estimatedCompletionDate?: string;
  responseData?: any;
  rejectionReason?: string;
}

export interface DSARQuery {
  partyId?: string;
  requestType?: string;
  status?: string;
  priority?: string;
  submissionDateFrom?: string;
  submissionDateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  assignedTo?: string;
  limit?: number;
  offset?: number;
}

class DSARService {
  private readonly basePath = '/api/v1';

  /**
   * Get list of DSAR requests
   */
  async getDSARRequests(query: DSARQuery = {}): Promise<any> {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = `/dsar${queryString ? `?${queryString}` : ''}`;
    
    return multiServiceApiClient.makeRequest('GET', url, undefined, 'admin', 'dsar');
  }

  /**
   * Get specific DSAR request by ID
   */
  async getDSARRequestById(id: string): Promise<any> {
    return multiServiceApiClient.makeRequest('GET', `${this.basePath}/dsar/${id}`, undefined, 'admin', 'dsar');
  }

  /**
   * Create new DSAR request
   */
  async createDSARRequest(request: DSARCreateRequest): Promise<any> {
    return multiServiceApiClient.makeRequest('POST', `${this.basePath}/dsar`, request, 'admin', 'dsar');
  }

  /**
   * Update existing DSAR request
   */
  async updateDSARRequest(id: string, updates: DSARUpdateRequest): Promise<any> {
    return multiServiceApiClient.makeRequest('PUT', `${this.basePath}/dsar/${id}`, updates, 'admin', 'dsar');
  }

  /**
   * Delete DSAR request
   */
  async deleteDSARRequest(id: string): Promise<any> {
    return multiServiceApiClient.makeRequest('DELETE', `${this.basePath}/dsar/${id}`, undefined, 'admin', 'dsar');
  }

  /**
   * Assign DSAR request to user
   */
  async assignDSARRequest(id: string, assignedTo: string): Promise<any> {
    return multiServiceApiClient.makeRequest('PUT', `${this.basePath}/dsar/${id}/assign`, { assignedTo }, 'admin', 'dsar');
  }

  /**
   * Complete DSAR request
   */
  async completeDSARRequest(id: string, responseData?: any): Promise<any> {
    return multiServiceApiClient.makeRequest('PUT', `${this.basePath}/dsar/${id}/complete`, { responseData }, 'admin', 'dsar');
  }

  /**
   * Reject DSAR request
   */
  async rejectDSARRequest(id: string, rejectionReason: string): Promise<any> {
    return multiServiceApiClient.makeRequest('PUT', `${this.basePath}/dsar/${id}/reject`, { rejectionReason }, 'admin', 'dsar');
  }

  /**
   * Get DSAR request statistics
   */
  async getDSARStats(): Promise<any> {
    return multiServiceApiClient.makeRequest('GET', `${this.basePath}/dsar/stats`, undefined, 'admin', 'dsar');
  }

  /**
   * Get overdue DSAR requests
   */
  async getOverdueDSARRequests(): Promise<any> {
    return multiServiceApiClient.makeRequest('GET', `${this.basePath}/dsar/overdue`, undefined, 'admin', 'dsar');
  }

  /**
   * Export DSAR requests
   */
  async exportDSARRequests(query: DSARQuery = {}): Promise<any> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = `${this.basePath}/dsar/export${queryString ? `?${queryString}` : ''}`;
    
    return multiServiceApiClient.makeRequest('GET', url, undefined, 'admin', 'dsar');
  }

  /**
   * Upload document for DSAR request
   */
  async uploadDocument(id: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return multiServiceApiClient.makeRequest('POST', `${this.basePath}/dsar/${id}/documents`, formData, 'admin', 'dsar');
  }

  /**
   * Delete document from DSAR request
   */
  async deleteDocument(id: string, documentId: string): Promise<any> {
    return multiServiceApiClient.makeRequest('DELETE', `${this.basePath}/dsar/${id}/documents/${documentId}`, undefined, 'admin', 'dsar');
  }

  /**
   * Get DSAR request history/timeline
   */
  async getDSARHistory(id: string): Promise<any> {
    return multiServiceApiClient.makeRequest('GET', `${this.basePath}/dsar/${id}/history`, undefined, 'admin', 'dsar');
  }

  /**
   * Bulk update DSAR requests
   */
  async bulkUpdateDSARRequests(requestIds: string[], updates: DSARUpdateRequest): Promise<any> {
    return multiServiceApiClient.makeRequest('PUT', `${this.basePath}/dsar/bulk`, { requestIds, updates }, 'admin', 'dsar');
  }
}

export const dsarService = new DSARService();
