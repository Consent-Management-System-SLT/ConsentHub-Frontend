// Dashboard Service - Fetches real data from backend APIs
import { apiClient } from './apiClient';

export interface DashboardStats {
  totalConsents: number;
  activeCustomers: number;
  privacyNotices: number;
  dsarRequests: number;
  consentBreakdown: {
    marketing: { total: number; granted: number; percentage: number };
    service: { total: number; granted: number; percentage: number };
    analytics: { total: number; granted: number; percentage: number };
  };
  recentActivity: {
    auditLogs: number;
    bulkImports: number;
    eventListeners: number;
    complianceRules: number;
  };
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user: string;
  status: string;
}

class DashboardService {
  private readonly basePath = '/api/v1';

  /**
   * Get dashboard statistics with real data from backend
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Fetch data from all endpoints in parallel
      const [
        consentsResponse,
        partiesResponse,
        privacyNoticesResponse,
        dsarResponse,
        auditResponse,
        bulkImportResponse,
        eventListenerResponse,
        complianceRuleResponse
      ] = await Promise.all([
        apiClient.get(`${this.basePath}/consent`),
        apiClient.get(`${this.basePath}/party`),
        apiClient.get(`${this.basePath}/privacy-notice`),
        apiClient.get(`${this.basePath}/dsar`),
        apiClient.get(`${this.basePath}/audit?limit=10`),
        apiClient.get(`${this.basePath}/bulk-import?limit=5`),
        apiClient.get(`${this.basePath}/event-listener`),
        apiClient.get(`${this.basePath}/compliance-rule`)
      ]);

      // Extract data
      const consents = consentsResponse.data as any[];
      const parties = partiesResponse.data as any[];
      const privacyNotices = (privacyNoticesResponse.data as any).notices || privacyNoticesResponse.data as any[];
      const dsars = dsarResponse.data as any[];
      const auditLogs = (auditResponse.data as any).logs || auditResponse.data as any[];
      const bulkImports = (bulkImportResponse.data as any).imports || bulkImportResponse.data as any[];
      const eventListeners = (eventListenerResponse.data as any).listeners || eventListenerResponse.data as any[];
      const complianceRules = (complianceRuleResponse.data as any).rules || complianceRuleResponse.data as any[];

      // Calculate consent breakdown
      const marketingConsents = consents.filter(c => c.purpose === 'marketing' || c.consentType === 'marketing');
      const serviceConsents = consents.filter(c => c.purpose === 'service' || c.consentType === 'service');
      const analyticsConsents = consents.filter(c => c.purpose === 'analytics' || c.consentType === 'analytics');

      const consentBreakdown = {
        marketing: {
          total: marketingConsents.length,
          granted: marketingConsents.filter(c => c.status === 'granted').length,
          percentage: marketingConsents.length > 0 ? 
            Math.round((marketingConsents.filter(c => c.status === 'granted').length / marketingConsents.length) * 100) : 0
        },
        service: {
          total: serviceConsents.length,
          granted: serviceConsents.filter(c => c.status === 'granted').length,
          percentage: serviceConsents.length > 0 ? 
            Math.round((serviceConsents.filter(c => c.status === 'granted').length / serviceConsents.length) * 100) : 0
        },
        analytics: {
          total: analyticsConsents.length,
          granted: analyticsConsents.filter(c => c.status === 'granted').length,
          percentage: analyticsConsents.length > 0 ? 
            Math.round((analyticsConsents.filter(c => c.status === 'granted').length / analyticsConsents.length) * 100) : 0
        }
      };

      return {
        totalConsents: consents.length,
        activeCustomers: parties.filter(p => p.status === 'active').length,
        privacyNotices: privacyNotices.length,
        dsarRequests: dsars.length,
        consentBreakdown,
        recentActivity: {
          auditLogs: auditLogs.length,
          bulkImports: bulkImports.length,
          eventListeners: eventListeners.filter((l: any) => l.status === 'active').length,
          complianceRules: complianceRules.filter((r: any) => r.status === 'active').length
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default values in case of error
      return {
        totalConsents: 0,
        activeCustomers: 0,
        privacyNotices: 0,
        dsarRequests: 0,
        consentBreakdown: {
          marketing: { total: 0, granted: 0, percentage: 0 },
          service: { total: 0, granted: 0, percentage: 0 },
          analytics: { total: 0, granted: 0, percentage: 0 }
        },
        recentActivity: {
          auditLogs: 0,
          bulkImports: 0,
          eventListeners: 0,
          complianceRules: 0
        }
      };
    }
  }

  /**
   * Get recent activity from audit logs
   */
  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const response = await apiClient.get(`${this.basePath}/audit?limit=${limit}`);
      const auditLogs = (response.data as any).logs || response.data as any[];
      
      return auditLogs.map((log: any) => ({
        id: log.id,
        type: log.operation,
        description: `${log.operation} ${log.entityType} ${log.entityId}`,
        timestamp: log.timestamp || log.createdAt,
        user: log.actorId,
        status: 'completed'
      }));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  /**
   * Get compliance metrics
   */
  async getComplianceMetrics(): Promise<{
    totalRules: number;
    activeRules: number;
    violationsDetected: number;
    complianceScore: number;
  }> {
    try {
      const response = await apiClient.get(`${this.basePath}/compliance-rule`);
      const rules = (response.data as any).rules || response.data as any[];
      
      const activeRules = rules.filter((r: any) => r.status === 'active').length;
      const totalRules = rules.length;
      
      // Calculate compliance score (example logic)
      const complianceScore = totalRules > 0 ? Math.round((activeRules / totalRules) * 100) : 100;
      
      return {
        totalRules,
        activeRules,
        violationsDetected: 0, // This would come from compliance rule execution results
        complianceScore
      };
    } catch (error) {
      console.error('Error fetching compliance metrics:', error);
      return {
        totalRules: 0,
        activeRules: 0,
        violationsDetected: 0,
        complianceScore: 100
      };
    }
  }
}

export const dashboardService = new DashboardService();
