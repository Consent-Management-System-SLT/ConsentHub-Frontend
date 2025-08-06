// Audit Service - Event and Activity Logging
import { apiClient, ApiResponse } from './apiClient';
import { AuditLog } from '../types/consent';

export interface AuditQuery {
  entityType?: 'consent' | 'preference' | 'notice' | 'party' | 'dsar';
  operation?: 'create' | 'update' | 'revoke' | 'view' | 'delete';
  actorId?: string;
  entityId?: string;
  source?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface AuditListResponse {
  logs: AuditLog[];
  totalCount: number;
  hasMore: boolean;
}

export interface AuditStats {
  totalLogs: number;
  byEntityType: Record<string, number>;
  byOperation: Record<string, number>;
  bySource: Record<string, number>;
  recentActivity: number;
}

class AuditService {
  private readonly basePath = '/api/v1';

  /**
   * Get audit logs
   */
  async getAuditLogs(query: AuditQuery = {}): Promise<ApiResponse<AuditListResponse>> {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = `${this.basePath}/audit${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<AuditListResponse>(url);
  }

  /**
   * Get audit log by ID
   */
  async getAuditLogById(id: string): Promise<ApiResponse<AuditLog>> {
    return apiClient.get<AuditLog>(`${this.basePath}/audit/${id}`);
  }

  /**
   * Get audit logs for specific entity
   */
  async getAuditLogsByEntity(entityType: string, entityId: string): Promise<ApiResponse<AuditListResponse>> {
    return apiClient.get<AuditListResponse>(`${this.basePath}/audit/entity/${entityType}/${entityId}`);
  }

  /**
   * Get audit logs for specific user
   */
  async getAuditLogsByUser(userId: string): Promise<ApiResponse<AuditListResponse>> {
    return apiClient.get<AuditListResponse>(`${this.basePath}/audit/user/${userId}`);
  }

  /**
   * Get audit statistics
   */
  async getAuditStats(startDate?: string, endDate?: string): Promise<ApiResponse<AuditStats>> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const queryString = params.toString();
    const url = `${this.basePath}/audit/stats${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<AuditStats>(url);
  }

  /**
   * Create audit log entry
   */
  async createAuditLog(logEntry: {
    entityType: string;
    entityId: string;
    operation: string;
    actorId: string;
    source: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
  }): Promise<ApiResponse<AuditLog>> {
    return apiClient.post<AuditLog>(`${this.basePath}/audit`, logEntry);
  }

  /**
   * Export audit logs
   */
  async exportAuditLogs(query: AuditQuery = {}, format: 'csv' | 'json' | 'pdf' = 'csv'): Promise<ApiResponse<{
    downloadUrl: string;
    filename: string;
    fileSize: number;
    expiresAt: string;
  }>> {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    params.append('format', format);

    const queryString = params.toString();
    const url = `${this.basePath}/audit/export${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<any>(url);
  }

  /**
   * Get audit log summary for compliance reporting
   */
  async getComplianceReport(startDate: string, endDate: string): Promise<ApiResponse<{
    period: { start: string; end: string };
    totalActivities: number;
    consentChanges: number;
    dsarRequests: number;
    privacyNoticeUpdates: number;
    dataAccessEvents: number;
    complianceScore: number;
    issues: Array<{
      type: string;
      count: number;
      description: string;
      severity: 'low' | 'medium' | 'high';
    }>;
  }>> {
    return apiClient.get<any>(`${this.basePath}/audit/compliance-report`, {
      params: { startDate, endDate }
    });
  }
}

export const auditService = new AuditService();
