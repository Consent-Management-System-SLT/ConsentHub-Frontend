import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/api';

/**
 * Admin Service API Client
 * Provides methods for admin dashboard operations
 * Aligns with the comprehensive TM Forum specification
 */

interface SystemOverview {
  totalConsents: number;
  grantedConsents: number;
  revokedConsents: number;
  totalPreferences: number;
  totalParties: number;
  pendingDSAR: number;
}

interface ComplianceMetrics {
  complianceScore: number;
  overdueItems: number;
  upcomingDeadlines: any[];
}

interface SystemHealth {
  servicesOnline: any[];
  systemUptime: number;
  lastBackup: string;
}

interface AdminDashboardData {
  timestamp: string;
  systemOverview: SystemOverview;
  complianceMetrics: ComplianceMetrics;
  systemHealth: SystemHealth;
  recentActivity: any[];
}

interface UserManagementData {
  totalCount: number;
  rangeStart: number;
  rangeEnd: number;
  users: any[];
}

interface ConsentAnalytics {
  summary: any;
  byPurpose: any[];
  byJurisdiction: any[];
  trends: any[];
}

interface ComplianceDashboard {
  complianceScore: number;
  dsarRequests: any;
  consentCompliance: any;
  jurisdictionMetrics: any;
}

interface BulkOperationResult {
  success: boolean;
  processed?: number;
  created?: number;
  exported?: boolean;
  downloadUrl?: string;
}

class AdminService {
  
  /**
   * Get comprehensive admin dashboard overview
   * Aggregates data from all microservices
   */
  async getDashboardOverview(): Promise<AdminDashboardData> {
    const response = await apiClient.get(`${API_ENDPOINTS.ADMIN_SERVICE}/dashboard/overview`);
    return (response.data as any).data;
  }

  /**
   * Get user management data with filtering
   */
  async getUserManagementData(params: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  } = {}): Promise<UserManagementData> {
    const response = await apiClient.get(`${API_ENDPOINTS.ADMIN_SERVICE}/users`, {
      params
    });
    return (response.data as any).data;
  }

  /**
   * Get comprehensive consent analytics
   */
  async getConsentAnalytics(params: {
    timeframe?: string;
    jurisdiction?: string;
    purpose?: string;
  } = {}): Promise<ConsentAnalytics> {
    const response = await apiClient.get(`${API_ENDPOINTS.ADMIN_SERVICE}/analytics/consents`, {
      params
    });
    return (response.data as any).data;
  }

  /**
   * Get compliance dashboard data
   */
  async getComplianceDashboard(params: {
    timeframe?: string;
    framework?: string;
  } = {}): Promise<ComplianceDashboard> {
    const response = await apiClient.get(`${API_ENDPOINTS.ADMIN_SERVICE}/compliance/dashboard`, {
      params
    });
    return (response.data as any).data;
  }

  /**
   * Handle bulk operations
   */
  async handleBulkOperation(operation: {
    operation: 'bulk_consent_import' | 'bulk_user_creation' | 'bulk_data_export';
    data: any;
  }): Promise<BulkOperationResult> {
    const response = await apiClient.post(`${API_ENDPOINTS.ADMIN_SERVICE}/bulk-operations`, operation);
    return (response.data as any).data;
  }

  /**
   * Create new user (admin only)
   */
  async createUser(userData: {
    email: string;
    password: string;
    displayName: string;
    phoneNumber?: string;
    role: 'customer' | 'csr' | 'admin';
  }) {
    const response = await apiClient.post(`${API_ENDPOINTS.AUTH_SERVICE}/users`, userData);
    return response.data;
  }

  /**
   * Update user profile (admin only)
   */
  async updateUser(uid: string, updateData: any) {
    const response = await apiClient.patch(`${API_ENDPOINTS.AUTH_SERVICE}/users/${uid}`, updateData);
    return response.data;
  }

  /**
   * Delete user account (admin only)
   */
  async deleteUser(uid: string) {
    const response = await apiClient.delete(`${API_ENDPOINTS.AUTH_SERVICE}/users/${uid}`);
    return response.data;
  }

  /**
   * Revoke user sessions (admin only)
   */
  async revokeUserSessions(uid: string) {
    const response = await apiClient.post(`${API_ENDPOINTS.AUTH_SERVICE}/users/${uid}/revoke-sessions`);
    return response.data;
  }

  /**
   * Get system-wide analytics
   */
  async getSystemAnalytics(params: {
    timeframe?: string;
    service?: string;
  } = {}) {
    const response = await apiClient.get(`${API_ENDPOINTS.ANALYTICS_SERVICE}/dashboard`, {
      params
    });
    return response.data;
  }

  /**
   * Get audit logs for admin review
   */
  async getAuditLogs(params: {
    page?: number;
    limit?: number;
    entityType?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  } = {}) {
    const response = await apiClient.get(`${API_ENDPOINTS.CSR_SERVICE}/audit`, {
      params
    });
    return response.data;
  }

  /**
   * Get all DSAR requests for admin management
   */
  async getAllDSARRequests(params: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    priority?: string;
  } = {}) {
    const response = await apiClient.get(`${API_ENDPOINTS.DSAR_SERVICE}`, {
      params
    });
    return response.data;
  }

  /**
   * Update DSAR request status (admin action)
   */
  async updateDSARStatus(requestId: string, status: string, notes?: string) {
    const response = await apiClient.patch(`${API_ENDPOINTS.DSAR_SERVICE}/${requestId}/status`, {
      status,
      notes
    });
    return response.data;
  }

  /**
   * Get all events/audit trail
   */
  async getAllEvents(params: {
    page?: number;
    limit?: number;
    eventType?: string;
    source?: string;
    startDate?: string;
    endDate?: string;
  } = {}) {
    const response = await apiClient.get(`${API_ENDPOINTS.EVENT_SERVICE}/event`, {
      params
    });
    return response.data;
  }

  /**
   * Export system data
   */
  async exportData(params: {
    type: 'consents' | 'preferences' | 'users' | 'dsar' | 'audit';
    format: 'json' | 'csv' | 'xlsx';
    dateRange?: {
      start: string;
      end: string;
    };
    filters?: any;
  }) {
    const response = await apiClient.post(`${API_ENDPOINTS.ADMIN_SERVICE}/export`, params);
    return response.data;
  }

  /**
   * Update privacy notice (admin only)
   */
  async updatePrivacyNotice(noticeId: string, updateData: any) {
    const response = await apiClient.put(`${API_ENDPOINTS.PRIVACY_NOTICE_SERVICE}/${noticeId}`, updateData);
    return response.data;
  }

  /**
   * Get system configuration
   */
  async getSystemConfiguration() {
    const response = await apiClient.get(`${API_ENDPOINTS.ADMIN_SERVICE}/system/configuration`);
    return response.data;
  }

  /**
   * Update system configuration (admin only)
   */
  async updateSystemConfiguration(config: any) {
    const response = await apiClient.put(`${API_ENDPOINTS.ADMIN_SERVICE}/system/configuration`, config);
    return response.data;
  }
}

export const adminService = new AdminService();
