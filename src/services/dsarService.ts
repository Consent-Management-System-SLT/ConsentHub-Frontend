// Data Subject Access Rights (DSAR) Service - Extended TMF632
import { apiClient, ApiResponse } from './apiClient';
import { DSARRequest } from '../types/consent';

export interface DSARRequestCreateRequest {
  partyId: string;
  type: 'data_export' | 'data_deletion' | 'restriction' | 'rectification' | 'portability';
  description: string;
  requestedData?: string[];
  legalBasis?: string;
  urgency?: 'low' | 'medium' | 'high';
  metadata?: Record<string, any>;
}

export interface DSARRequestUpdateRequest {
  status?: 'initiated' | 'processing' | 'completed' | 'failed' | 'cancelled';
  description?: string;
  processingNotes?: string;
  completedAt?: string;
  metadata?: Record<string, any>;
}

export interface DSARQuery {
  partyId?: string;
  type?: string;
  status?: string;
  submittedAfter?: string;
  submittedBefore?: string;
  urgency?: string;
  limit?: number;
  offset?: number;
}

export interface DSARListResponse {
  requests: DSARRequest[];
  totalCount: number;
  hasMore: boolean;
}

export interface DSARExportResult {
  requestId: string;
  downloadUrl: string;
  fileFormat: 'json' | 'csv' | 'pdf';
  fileSize: number;
  expiresAt: string;
  categories: string[];
}

export interface DSARStats {
  totalRequests: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  pendingRequests: number;
  averageProcessingTime: number;
  complianceRate: number;
}

class DSARService {
  private readonly basePath = '/api/v1';

  /**
   * Create new DSAR request
   */
  async createDSARRequest(request: DSARRequestCreateRequest): Promise<ApiResponse<DSARRequest>> {
    return apiClient.post<DSARRequest>(`${this.basePath}/dsar`, request);
  }

  /**
   * Get DSAR requests
   */
  async getDSARRequests(query: DSARQuery = {}): Promise<ApiResponse<DSARListResponse>> {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = `${this.basePath}/dsar${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<DSARListResponse>(url);
  }

  /**
   * Get specific DSAR request by ID
   */
  async getDSARRequestById(id: string): Promise<ApiResponse<DSARRequest>> {
    return apiClient.get<DSARRequest>(`${this.basePath}/request/${id}`);
  }

  /**
   * Update DSAR request
   */
  async updateDSARRequest(id: string, updates: DSARRequestUpdateRequest): Promise<ApiResponse<DSARRequest>> {
    return apiClient.patch<DSARRequest>(`${this.basePath}/request/${id}`, updates);
  }

  /**
   * Delete DSAR request
   */
  async deleteDSARRequest(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.basePath}/request/${id}`);
  }

  /**
   * Process data export request
   */
  async processDataExport(requestId: string, format: 'json' | 'csv' | 'pdf' = 'json'): Promise<ApiResponse<DSARExportResult>> {
    return apiClient.post<DSARExportResult>(`${this.basePath}/request/${requestId}/export`, { format });
  }

  /**
   * Download exported data
   */
  async downloadExportedData(requestId: string): Promise<ApiResponse<{ downloadUrl: string; expiresAt: string }>> {
    return apiClient.get<{ downloadUrl: string; expiresAt: string }>(`${this.basePath}/request/${requestId}/download`);
  }

  /**
   * Process data deletion request
   */
  async processDataDeletion(requestId: string, categories: string[] = []): Promise<ApiResponse<{
    deleted: boolean;
    deletedCategories: string[];
    retainedCategories: string[];
    retentionReasons: Record<string, string>;
  }>> {
    return apiClient.post<any>(`${this.basePath}/request/${requestId}/delete`, { categories });
  }

  /**
   * Process data rectification request
   */
  async processDataRectification(requestId: string, corrections: Array<{
    field: string;
    oldValue: string;
    newValue: string;
    reason: string;
  }>): Promise<ApiResponse<{
    corrected: boolean;
    appliedCorrections: Array<{
      field: string;
      oldValue: string;
      newValue: string;
      appliedAt: string;
    }>;
  }>> {
    return apiClient.post<any>(`${this.basePath}/request/${requestId}/rectify`, { corrections });
  }

  /**
   * Process data portability request
   */
  async processDataPortability(requestId: string, format: 'json' | 'csv' | 'xml' = 'json'): Promise<ApiResponse<DSARExportResult>> {
    return apiClient.post<DSARExportResult>(`${this.basePath}/request/${requestId}/portability`, { format });
  }

  /**
   * Process data restriction request
   */
  async processDataRestriction(requestId: string, restrictions: Array<{
    category: string;
    restrictionType: 'processing' | 'storage' | 'transfer';
    reason: string;
  }>): Promise<ApiResponse<{
    restricted: boolean;
    appliedRestrictions: Array<{
      category: string;
      restrictionType: string;
      appliedAt: string;
    }>;
  }>> {
    return apiClient.post<any>(`${this.basePath}/request/${requestId}/restrict`, { restrictions });
  }

  /**
   * Get DSAR request status
   */
  async getDSARRequestStatus(requestId: string): Promise<ApiResponse<{
    status: string;
    progress: number;
    estimatedCompletion?: string;
    currentStep: string;
    nextSteps: string[];
  }>> {
    return apiClient.get<any>(`${this.basePath}/request/${requestId}/status`);
  }

  /**
   * Get DSAR requests by party ID
   */
  async getDSARRequestsByPartyId(partyId: string): Promise<ApiResponse<DSARListResponse>> {
    return apiClient.get<DSARListResponse>(`${this.basePath}/request/party/${partyId}`);
  }

  /**
   * Validate DSAR request
   */
  async validateDSARRequest(request: DSARRequestCreateRequest): Promise<ApiResponse<{
    valid: boolean;
    issues: Array<{
      field: string;
      message: string;
      severity: 'error' | 'warning';
    }>;
  }>> {
    return apiClient.post<any>(`${this.basePath}/request/validate`, request);
  }

  /**
   * Get DSAR statistics
   */
  async getDSARStats(fromDate?: string, toDate?: string): Promise<ApiResponse<DSARStats>> {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);

    const queryString = params.toString();
    const url = `${this.basePath}/stats${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<DSARStats>(url);
  }

  /**
   * Get DSAR compliance report
   */
  async getComplianceReport(fromDate?: string, toDate?: string): Promise<ApiResponse<{
    period: { from: string; to: string };
    totalRequests: number;
    completedWithinDeadline: number;
    complianceRate: number;
    averageResponseTime: number;
    requestsByType: Record<string, number>;
    requestsByStatus: Record<string, number>;
    escalatedRequests: number;
  }>> {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);

    const queryString = params.toString();
    const url = `${this.basePath}/compliance-report${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<any>(url);
  }

  /**
   * Escalate DSAR request
   */
  async escalateDSARRequest(requestId: string, reason: string, escalationLevel: 'supervisor' | 'dpo' | 'legal'): Promise<ApiResponse<DSARRequest>> {
    return apiClient.post<DSARRequest>(`${this.basePath}/request/${requestId}/escalate`, {
      reason,
      escalationLevel
    });
  }

  /**
   * Add comment to DSAR request
   */
  async addCommentToDSARRequest(requestId: string, comment: string, isInternal: boolean = false): Promise<ApiResponse<{
    commentId: string;
    addedAt: string;
  }>> {
    return apiClient.post<any>(`${this.basePath}/request/${requestId}/comment`, {
      comment,
      isInternal
    });
  }

  /**
   * Get DSAR request comments
   */
  async getDSARRequestComments(requestId: string, includeInternal: boolean = false): Promise<ApiResponse<Array<{
    id: string;
    comment: string;
    author: string;
    isInternal: boolean;
    addedAt: string;
  }>>> {
    const params = includeInternal ? '?includeInternal=true' : '';
    return apiClient.get<any>(`${this.basePath}/request/${requestId}/comments${params}`);
  }

  /**
   * Get data categories for party
   */
  async getDataCategories(partyId: string): Promise<ApiResponse<Array<{
    category: string;
    dataTypes: string[];
    sources: string[];
    retention: string;
    canDelete: boolean;
    canExport: boolean;
    canRestrict: boolean;
  }>>> {
    return apiClient.get<any>(`${this.basePath}/data-categories/${partyId}`);
  }
}

export const dsarService = new DSARService();
