import { apiClient, ApiResponse } from './apiClient';

// Types for Privacy Notice management
export interface PrivacyNotice {
  id: string;
  title: string;
  description?: string;
  content: string;
  contentType: 'text/plain' | 'text/html' | 'text/markdown';
  version: string;
  category: 'general' | 'marketing' | 'analytics' | 'cookies' | 'third-party' | 'location' | 'children' | 'employment';
  purposes: string[];
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
  dataCategories: ('personal_data' | 'sensitive_data' | 'behavioral_data' | 'location_data' | 'communication_data' | 'device_data' | 'financial_data')[];
  recipients: Recipient[];
  retentionPeriod: {
    duration: string;
    criteria?: string;
  };
  rights: ('access' | 'rectification' | 'erasure' | 'portability' | 'objection' | 'restriction' | 'withdraw_consent')[];
  contactInfo: ContactInfo;
  effectiveDate: string;
  expirationDate?: string;
  status: 'draft' | 'active' | 'inactive' | 'archived';
  language: 'en' | 'si' | 'ta';
  applicableRegions: ('sri_lanka' | 'eu' | 'us' | 'global')[];
  lastReviewDate?: string;
  nextReviewDate?: string;
  acknowledgments: Acknowledgment[];
  metadata: NoticeMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface Recipient {
  name: string;
  category: 'internal' | 'third_party' | 'government' | 'processor';
  purpose: string;
  country?: string;
}

export interface ContactInfo {
  dpo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  organization: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
}

export interface Acknowledgment {
  userId: string;
  userEmail?: string;
  acknowledgedAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface NoticeMetadata {
  tags?: string[];
  author?: string;
  approvedBy?: string;
  approvalDate?: string;
  changeLog?: ChangeLogEntry[];
  archivedAt?: string;
  archivedBy?: string;
}

export interface ChangeLogEntry {
  version: string;
  changes: string;
  author: string;
  date: string;
}

// Request interfaces
export interface PrivacyNoticeCreateRequest {
  title: string;
  description?: string;
  content: string;
  contentType?: 'text/plain' | 'text/html' | 'text/markdown';
  version?: string;
  category?: string;
  purposes?: string[];
  legalBasis?: string;
  dataCategories?: string[];
  recipients?: Recipient[];
  retentionPeriod?: {
    duration: string;
    criteria?: string;
  };
  rights?: string[];
  contactInfo?: ContactInfo;
  effectiveDate?: string;
  expirationDate?: string;
  status?: string;
  language?: string;
  applicableRegions?: string[];
  metadata?: Partial<NoticeMetadata>;
}

export interface PrivacyNoticeUpdateRequest extends Partial<PrivacyNoticeCreateRequest> {
  changeReason?: string;
}

export interface PrivacyNoticeQuery {
  status?: string;
  category?: string;
  language?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PrivacyNoticeListResponse {
  notices: PrivacyNotice[];
  total: number;
  stats: {
    total: number;
    active: number;
    draft: number;
    archived: number;
  };
  hasMore: boolean;
}

export interface PrivacyNoticeResponse {
  notice: PrivacyNotice;
}

// Privacy Notice Service
class PrivacyNoticeService {
  private readonly basePath = '/api/v1/privacy-notices';

  /**
   * Get all privacy notices with optional filtering
   */
  async getPrivacyNotices(query: PrivacyNoticeQuery = {}): Promise<ApiResponse<PrivacyNoticeListResponse>> {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = `${this.basePath}${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<PrivacyNoticeListResponse>(url);
  }

  /**
   * Get specific privacy notice by ID
   */
  async getPrivacyNoticeById(id: string): Promise<ApiResponse<PrivacyNoticeResponse>> {
    return apiClient.get<PrivacyNoticeResponse>(`${this.basePath}/${id}`);
  }

  /**
   * Create new privacy notice
   */
  async createPrivacyNotice(notice: PrivacyNoticeCreateRequest): Promise<ApiResponse<PrivacyNoticeResponse>> {
    return apiClient.post<PrivacyNoticeResponse>(this.basePath, notice);
  }

  /**
   * Update existing privacy notice
   */
  async updatePrivacyNotice(id: string, updates: PrivacyNoticeUpdateRequest): Promise<ApiResponse<PrivacyNoticeResponse>> {
    return apiClient.put<PrivacyNoticeResponse>(`${this.basePath}/${id}`, updates);
  }

  /**
   * Delete (archive) privacy notice
   */
  async deletePrivacyNotice(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<{ message: string }>(`${this.basePath}/${id}`);
  }

  /**
   * Acknowledge privacy notice
   */
  async acknowledgePrivacyNotice(id: string, metadata?: { ipAddress?: string; userAgent?: string }): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>(`${this.basePath}/${id}/acknowledge`, metadata || {});
  }

  /**
   * Export privacy notices
   */
  async exportPrivacyNotices(format: 'json' | 'csv', query: Partial<PrivacyNoticeQuery> = {}): Promise<Response> {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const url = `${baseURL}${this.basePath}/export/${format}${queryString ? `?${queryString}` : ''}`;
    
    console.log('🌐 Export URL:', url);
    const token = localStorage.getItem('authToken'); // Changed from 'token' to 'authToken'
    console.log('🔑 Token:', token ? 'Present' : 'Missing');
    
    return fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  /**
   * Get privacy notice statistics
   */
  async getPrivacyNoticeStats(): Promise<ApiResponse<{
    total: number;
    active: number;
    draft: number;
    archived: number;
    byCategory: Record<string, number>;
    byLanguage: Record<string, number>;
  }>> {
    const response = await this.getPrivacyNotices({ limit: 1 });
    return {
      ...response,
      data: {
        ...response.data.stats,
        byCategory: {},
        byLanguage: {}
      }
    };
  }

  /**
   * Search privacy notices
   */
  async searchPrivacyNotices(searchTerm: string, filters: Partial<PrivacyNoticeQuery> = {}): Promise<ApiResponse<PrivacyNoticeListResponse>> {
    return this.getPrivacyNotices({
      ...filters,
      search: searchTerm
    });
  }

  /**
   * Get active privacy notices for customer view
   */
  async getActiveNotices(language: string = 'en'): Promise<ApiResponse<PrivacyNoticeListResponse>> {
    return this.getPrivacyNotices({
      status: 'active',
      language,
      sortBy: 'effectiveDate',
      sortOrder: 'desc'
    });
  }

  /**
   * Get notices by category
   */
  async getNoticesByCategory(category: string, language: string = 'en'): Promise<ApiResponse<PrivacyNoticeListResponse>> {
    return this.getPrivacyNotices({
      category,
      language,
      status: 'active'
    });
  }
}

export const privacyNoticeService = new PrivacyNoticeService();
