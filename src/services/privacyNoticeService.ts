// TMF632 Privacy Notice Management API Service
import { apiClient, ApiResponse } from './apiClient';
import { PrivacyNotice } from '../types/consent';

export interface PrivacyNoticeCreateRequest {
  title: string;
  version: string;
  jurisdiction: string;
  language: string;
  documentUrl: string;
  content?: string;
  effective_date?: string;
  expiry_date?: string;
  metadata?: Record<string, any>;
}

export interface PrivacyNoticeUpdateRequest {
  title?: string;
  version?: string;
  jurisdiction?: string;
  language?: string;
  documentUrl?: string;
  content?: string;
  effective_date?: string;
  expiry_date?: string;
  active?: boolean;
  metadata?: Record<string, any>;
}

export interface PrivacyNoticeQuery {
  jurisdiction?: string;
  language?: string;
  version?: string;
  active?: boolean;
  limit?: number;
  offset?: number;
}

export interface PrivacyNoticeListResponse {
  notices: PrivacyNotice[];
  totalCount: number;
  hasMore: boolean;
}

export interface PrivacyNoticeVersion {
  id: string;
  version: string;
  publishedAt: string;
  changes: string[];
  previousVersion?: string;
}

class PrivacyNoticeService {
  private readonly basePath = '/api/tmf-api/partyPrivacyManagement/v4';

  /**
   * TMF632 - Get list of privacy notices
   */
  async getPrivacyNotices(query: PrivacyNoticeQuery = {}): Promise<ApiResponse<PrivacyNoticeListResponse>> {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = `${this.basePath}/privacyNotice${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<PrivacyNoticeListResponse>(url);
  }

  /**
   * TMF632 - Get specific privacy notice by ID
   */
  async getPrivacyNoticeById(id: string): Promise<ApiResponse<PrivacyNotice>> {
    return apiClient.get<PrivacyNotice>(`${this.basePath}/privacyNotice/${id}`);
  }

  /**
   * TMF632 - Get current active privacy notice
   */
  async getCurrentPrivacyNotice(jurisdiction: string = 'default', language: string = 'en'): Promise<ApiResponse<PrivacyNotice>> {
    const params = new URLSearchParams({
      jurisdiction,
      language,
      active: 'true'
    });

    return apiClient.get<PrivacyNotice>(`${this.basePath}/privacyNotice/current?${params}`);
  }

  /**
   * TMF632 - Create new privacy notice
   */
  async createPrivacyNotice(notice: PrivacyNoticeCreateRequest): Promise<ApiResponse<PrivacyNotice>> {
    return apiClient.post<PrivacyNotice>(`${this.basePath}/privacyNotice`, notice);
  }

  /**
   * TMF632 - Update existing privacy notice
   */
  async updatePrivacyNotice(id: string, updates: PrivacyNoticeUpdateRequest): Promise<ApiResponse<PrivacyNotice>> {
    return apiClient.patch<PrivacyNotice>(`${this.basePath}/privacyNotice/${id}`, updates);
  }

  /**
   * TMF632 - Delete privacy notice
   */
  async deletePrivacyNotice(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.basePath}/privacyNotice/${id}`);
  }

  /**
   * Publish a new version of privacy notice
   */
  async publishNewVersion(id: string, changes: string[]): Promise<ApiResponse<PrivacyNotice>> {
    return apiClient.post<PrivacyNotice>(`${this.basePath}/privacyNotice/${id}/publish`, { changes });
  }

  /**
   * Get all versions of a privacy notice
   */
  async getNoticeVersions(id: string): Promise<ApiResponse<PrivacyNoticeVersion[]>> {
    return apiClient.get<PrivacyNoticeVersion[]>(`${this.basePath}/privacyNotice/${id}/versions`);
  }

  /**
   * Get privacy notice by version
   */
  async getNoticeByVersion(id: string, version: string): Promise<ApiResponse<PrivacyNotice>> {
    return apiClient.get<PrivacyNotice>(`${this.basePath}/privacyNotice/${id}/version/${version}`);
  }

  /**
   * Compare two versions of a privacy notice
   */
  async compareVersions(id: string, version1: string, version2: string): Promise<ApiResponse<{
    version1: PrivacyNotice;
    version2: PrivacyNotice;
    differences: Array<{
      field: string;
      oldValue: string;
      newValue: string;
    }>;
  }>> {
    return apiClient.get<any>(`${this.basePath}/privacyNotice/${id}/compare/${version1}/${version2}`);
  }

  /**
   * Get privacy notices by jurisdiction
   */
  async getNoticesByJurisdiction(jurisdiction: string): Promise<ApiResponse<PrivacyNoticeListResponse>> {
    return apiClient.get<PrivacyNoticeListResponse>(`${this.basePath}/privacyNotice/jurisdiction/${jurisdiction}`);
  }

  /**
   * Get privacy notices by language
   */
  async getNoticesByLanguage(language: string): Promise<ApiResponse<PrivacyNoticeListResponse>> {
    return apiClient.get<PrivacyNoticeListResponse>(`${this.basePath}/privacyNotice/language/${language}`);
  }

  /**
   * Archive old privacy notice version
   */
  async archiveNotice(id: string): Promise<ApiResponse<PrivacyNotice>> {
    return apiClient.patch<PrivacyNotice>(`${this.basePath}/privacyNotice/${id}/archive`);
  }

  /**
   * Restore archived privacy notice
   */
  async restoreNotice(id: string): Promise<ApiResponse<PrivacyNotice>> {
    return apiClient.patch<PrivacyNotice>(`${this.basePath}/privacyNotice/${id}/restore`);
  }

  /**
   * Get privacy notice statistics
   */
  async getNoticeStats(): Promise<ApiResponse<{
    totalNotices: number;
    activeNotices: number;
    byJurisdiction: Record<string, number>;
    byLanguage: Record<string, number>;
    recentUpdates: number;
  }>> {
    return apiClient.get<any>(`${this.basePath}/privacyNotice/stats`);
  }

  /**
   * Validate privacy notice content
   */
  async validateNoticeContent(content: string, jurisdiction: string): Promise<ApiResponse<{
    valid: boolean;
    issues: Array<{
      type: 'error' | 'warning';
      message: string;
      suggestion?: string;
    }>;
  }>> {
    return apiClient.post<any>(`${this.basePath}/privacyNotice/validate`, {
      content,
      jurisdiction
    });
  }

  /**
   * Generate privacy notice template
   */
  async generateNoticeTemplate(jurisdiction: string, language: string): Promise<ApiResponse<{
    template: string;
    requiredSections: string[];
    optionalSections: string[];
  }>> {
    return apiClient.get<any>(`${this.basePath}/privacyNotice/template/${jurisdiction}/${language}`);
  }
}

export const privacyNoticeService = new PrivacyNoticeService();
