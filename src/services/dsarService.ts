import { apiClient, ApiResponse } from './apiClient';

// Types for DSAR Request management
export interface DSARRequest {
  id: string;
  requestId: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string;
  requestType: 'data_access' | 'data_rectification' | 'data_erasure' | 'data_portability' | 'restrict_processing' | 'object_processing' | 'withdraw_consent' | 'automated_decision';
  subject: string;
  description: string;
  dataCategories: string[];
  legalBasis?: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submittedAt: string;
  acknowledgedAt?: string;
  completedAt?: string;
  dueDate: string;
  assignedTo?: {
    userId: string;
    name: string;
    email: string;
    assignedAt: string;
  };
  processingNotes: ProcessingNote[];
  responseMethod: 'email' | 'postal_mail' | 'secure_download' | 'api';
  responseData?: {
    format: 'json' | 'csv' | 'pdf' | 'xml';
    downloadUrl?: string;
    expiresAt?: string;
    fileSize?: number;
    recordCount?: number;
  };
  verificationMethod: 'email_verification' | 'identity_document' | 'phone_verification' | 'in_person';
  verificationStatus: 'pending' | 'verified' | 'failed';
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  rejectionDetails?: string;
  communications: Communication[];
  source: 'web_form' | 'email' | 'phone' | 'letter' | 'in_person' | 'api';
  customerType: 'individual' | 'business' | 'employee' | 'prospect';
  jurisdiction: string;
  applicableLaws: string[];
  riskLevel: 'low' | 'medium' | 'high';
  sensitiveData: boolean;
  createdBy?: string;
  updatedBy?: string;
  tags: string[];
  relatedTickets: string[];
  relatedCases: string[];
  createdAt: string;
  updatedAt: string;
  // Virtual fields
  isOverdue?: boolean;
  daysRemaining?: number;
  processingDays?: number;
}

export interface ProcessingNote {
  note: string;
  author: string;
  timestamp: string;
}

export interface Communication {
  type: 'email' | 'phone' | 'letter' | 'system_notification';
  direction: 'inbound' | 'outbound';
  content: string;
  timestamp: string;
  author: string;
}

export interface DSARRequestCreateRequest {
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string;
  requestType: DSARRequest['requestType'];
  subject: string;
  description: string;
  dataCategories?: string[];
  legalBasis?: DSARRequest['legalBasis'];
  priority?: DSARRequest['priority'];
  responseMethod?: DSARRequest['responseMethod'];
  customerType?: DSARRequest['customerType'];
  tags?: string[];
}

export interface DSARRequestUpdateRequest {
  status?: DSARRequest['status'];
  priority?: DSARRequest['priority'];
  assignedTo?: DSARRequest['assignedTo'];
  processingNote?: string;
  responseMethod?: DSARRequest['responseMethod'];
  responseData?: DSARRequest['responseData'];
  verificationStatus?: DSARRequest['verificationStatus'];
  rejectionReason?: string;
  rejectionDetails?: string;
  tags?: string[];
}

export interface DSARRequestQuery {
  status?: string;
  requestType?: string;
  priority?: string;
  requesterEmail?: string;
  requesterId?: string;
  dateFrom?: string;
  dateTo?: string;
  isOverdue?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DSARRequestListResponse {
  requests: DSARRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: {
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
    overdue: number;
  };
}

export interface DSARStats {
  totalRequests: number;
  pendingRequests: number;
  inProgressRequests: number;
  completedRequests: number;
  rejectedRequests: number;
  overdueRequests: number;
  requestsByType: Record<string, number>;
  requestsByPriority: Record<string, number>;
  averageProcessingTime: number;
}

export interface DSARRequestResponse {
  success: boolean;
  message?: string;
  request?: DSARRequest;
  error?: string;
}

// DSAR Service
class DSARService {
  private readonly basePath = '/api/v1/dsar';

  /**
   * Get all DSAR requests with optional filtering
   */
  async getDSARRequests(query: DSARRequestQuery = {}): Promise<ApiResponse<DSARRequestListResponse>> {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = `${this.basePath}/requests${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<DSARRequestListResponse>(url);
    return response;
  }

  /**
   * Get a specific DSAR request by ID
   */
  async getDSARRequest(id: string): Promise<ApiResponse<{ request: DSARRequest }>> {
    const response = await apiClient.get<{ request: DSARRequest }>(`${this.basePath}/requests/${id}`);
    return response;
  }

  /**
   * Create a new DSAR request
   */
  async createDSARRequest(requestData: DSARRequestCreateRequest): Promise<ApiResponse<DSARRequestResponse>> {
    const response = await apiClient.post<DSARRequestResponse>(`${this.basePath}/requests`, requestData);
    return response;
  }

  /**
   * Update a DSAR request
   */
  async updateDSARRequest(id: string, updateData: DSARRequestUpdateRequest): Promise<ApiResponse<DSARRequestResponse>> {
    const response = await apiClient.put<DSARRequestResponse>(`${this.basePath}/requests/${id}`, updateData);
    return response;
  }

  /**
   * Delete a DSAR request
   */
  async deleteDSARRequest(id: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete<{ message: string }>(`${this.basePath}/requests/${id}`);
    return response;
  }

  /**
   * Export DSAR requests
   */
  async exportDSARRequests(format: 'json' | 'csv', query: Partial<DSARRequestQuery> = {}): Promise<Response> {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'https://consenthub-backend.onrender.com');
    const url = `${baseURL}${this.basePath}/export/${format}${queryString ? `?${queryString}` : ''}`;
    
    return fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
  }

  /**
   * Get DSAR statistics
   */
  async getDSARStats(dateFrom?: string, dateTo?: string): Promise<ApiResponse<{ stats: DSARStats }>> {
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    
    const queryString = params.toString();
    const url = `${this.basePath}/stats${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<{ stats: DSARStats }>(url);
    return response;
  }

  /**
   * Add processing note to a DSAR request
   */
  async addProcessingNote(id: string, note: string): Promise<ApiResponse<DSARRequestResponse>> {
    const response = await apiClient.put<DSARRequestResponse>(`${this.basePath}/requests/${id}`, {
      processingNote: note
    });
    return response;
  }

  /**
   * Assign DSAR request to user
   */
  async assignDSARRequest(id: string, assignedTo: DSARRequest['assignedTo']): Promise<ApiResponse<DSARRequestResponse>> {
    const response = await apiClient.put<DSARRequestResponse>(`${this.basePath}/requests/${id}`, {
      assignedTo: {
        ...assignedTo,
        assignedAt: new Date().toISOString()
      }
    });
    return response;
  }

  /**
   * Update DSAR request status
   */
  async updateDSARStatus(id: string, status: DSARRequest['status'], processingNote?: string): Promise<ApiResponse<DSARRequestResponse>> {
    const updateData: DSARRequestUpdateRequest = { status };
    if (processingNote) {
      updateData.processingNote = processingNote;
    }

    const response = await apiClient.put<DSARRequestResponse>(`${this.basePath}/requests/${id}`, updateData);
    return response;
  }

  /**
   * Verify DSAR request
   */
  async verifyDSARRequest(id: string, verificationStatus: DSARRequest['verificationStatus']): Promise<ApiResponse<DSARRequestResponse>> {
    const response = await apiClient.put<DSARRequestResponse>(`${this.basePath}/requests/${id}`, {
      verificationStatus,
      verifiedAt: new Date().toISOString()
    });
    return response;
  }

  /**
   * Reject DSAR request
   */
  async rejectDSARRequest(
    id: string, 
    rejectionReason: string, 
    rejectionDetails?: string
  ): Promise<ApiResponse<DSARRequestResponse>> {
    const response = await apiClient.put<DSARRequestResponse>(`${this.basePath}/requests/${id}`, {
      status: 'rejected',
      rejectionReason,
      rejectionDetails,
      processingNote: `Request rejected: ${rejectionReason}${rejectionDetails ? ` - ${rejectionDetails}` : ''}`
    });
    return response;
  }

  /**
   * Get overdue DSAR requests
   */
  async getOverdueDSARRequests(): Promise<ApiResponse<DSARRequestListResponse>> {
    return this.getDSARRequests({ isOverdue: true });
  }

  /**
   * Get DSAR requests by status
   */
  async getDSARRequestsByStatus(status: DSARRequest['status']): Promise<ApiResponse<DSARRequestListResponse>> {
    return this.getDSARRequests({ status });
  }

  /**
   * Search DSAR requests by requester email
   */
  async searchDSARRequests(email: string): Promise<ApiResponse<DSARRequestListResponse>> {
    return this.getDSARRequests({ requesterEmail: email });
  }

  /**
   * Get DSAR requests by party ID (for backward compatibility with existing components)
   */
  async getDSARRequestsByPartyId(partyId: string): Promise<ApiResponse<DSARRequestListResponse>> {
    // Map partyId to requesterEmail or similar identifier
    // For now, we'll search by the partyId in the requesterId field
    return this.getDSARRequests({ requesterId: partyId });
  }

  /**
   * Get DSAR request by ID (alias for getDSARRequest for backward compatibility)
   */
  async getDSARRequestById(id: string): Promise<ApiResponse<{ request: DSARRequest }>> {
    return this.getDSARRequest(id);
  }
}

// Create and export service instance
export const dsarService = new DSARService();
export default dsarService;
