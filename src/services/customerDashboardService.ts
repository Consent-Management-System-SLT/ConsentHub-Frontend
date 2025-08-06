import { multiServiceApiClient } from './multiServiceApiClient';

export interface DashboardOverview {
  customer: {
    id: string;
    name: string;
    email: string;
    accountStatus: string;
    joinDate: string;
    lastLogin: string;
  };
  consentStats: {
    total: number;
    granted: number;
    revoked: number;
    expired: number;
    pending: number;
  };
  preferenceStats: {
    total: number;
    enabled: number;
    disabled: number;
  };
  dsarStats: {
    total: number;
    pending: number;
    completed: number;
    inProgress: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    action: string;
    description: string;
    timestamp: string;
  }>;
  notifications: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
    read: boolean;
  }>;
}

export interface ConsentRecord {
  id: string;
  purpose: string;
  dataCategory: string;
  status: 'granted' | 'denied' | 'revoked' | 'pending';
  grantedAt?: string;
  revokedAt?: string;
  expiresAt?: string;
  lastModified: string;
  description: string;
}

export interface PreferenceSettings {
  id: string;
  communicationChannels: {
    email: boolean;
    sms: boolean;
    phone: boolean;
    push: boolean;
    mail: boolean;
  };
  topicSubscriptions: {
    marketing: boolean;
    promotions: boolean;
    serviceUpdates: boolean;
    billing: boolean;
    security: boolean;
    newsletter: boolean;
    surveys: boolean;
  };
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
  timezone: string;
  language: string;
}

export interface PrivacyNotice {
  id: string;
  title: string;
  version: string;
  effectiveDate: string;
  status: 'active' | 'draft' | 'expired';
  description: string;
  content: string;
  categories: string[];
  lastUpdated: string;
}

export interface DSARRequest {
  id: string;
  requestType: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  submittedAt: string;
  completedAt?: string;
  description: string;
  requestDetails: any;
  response?: any;
}

export interface CustomerProfile {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  department?: string;
  jobTitle?: string;
  status: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface ActivityItem {
  id: string;
  action: string;
  type: string;
  entityId: string;
  timestamp: string;
  description: string;
  metadata?: any;
}

class CustomerDashboardService {
  private readonly baseUrl = '/api/v1/customer/dashboard';

  /**
   * Show alert/notification to user
   */
  private showAlert(message: string, type: 'success' | 'error' | 'warning' | 'info') {
    // This will be used to show toast notifications or alerts
    const event = new CustomEvent('dashboard-alert', {
      detail: { message, type }
    });
    window.dispatchEvent(event);
  }

  /**
   * Get customer dashboard overview data
   */
  async getDashboardOverview(): Promise<DashboardOverview> {
    try {
      const response = await multiServiceApiClient.makeRequest(
        'GET',
        `${this.baseUrl}/overview`,
        undefined,
        'customer'
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to fetch dashboard overview');
    } catch (error: any) {
      console.error('Dashboard overview error:', error);
      // Return mock data as fallback
      return this.getMockDashboardData();
    }
  }

  /**
   * Get all consent records for the customer
   */
  async getConsents(): Promise<ConsentRecord[]> {
    try {
      const response = await multiServiceApiClient.makeRequest(
        'GET',
        '/api/v1/consents',
        undefined,
        'customer',
        'consent'
      );

      const consents = response?.data || response || [];
      return consents.map((consent: any) => ({
        id: consent.id || consent._id,
        purpose: consent.purpose || 'General Data Processing',
        dataCategory: consent.dataCategory || 'Personal Information',
        status: consent.status || 'granted',
        grantedAt: consent.grantedAt || consent.createdAt,
        revokedAt: consent.revokedAt,
        expiresAt: consent.expiresAt,
        lastModified: consent.lastModified || consent.updatedAt || consent.createdAt,
        description: consent.description || `Consent for ${consent.purpose || 'data processing'}`
      }));
    } catch (error) {
      console.error('Error fetching consents:', error);
      return [];
    }
  }

  /**
   * Grant consent for a specific purpose
   */
  async grantConsent(purpose: string, dataCategory: string): Promise<ConsentRecord> {
    try {
      const response = await multiServiceApiClient.makeRequest(
        'POST',
        '/api/v1/consents',
        {
          purpose,
          dataCategory,
          status: 'granted',
          grantedAt: new Date().toISOString()
        },
        'customer',
        'consent'
      );

      const consent = response?.data || response;
      this.showAlert('Consent granted successfully!', 'success');
      
      return {
        id: consent.id,
        purpose,
        dataCategory,
        status: 'granted',
        grantedAt: consent.grantedAt,
        lastModified: consent.lastModified || new Date().toISOString(),
        description: `Consent granted for ${purpose}`
      };
    } catch (error) {
      console.error('Error granting consent:', error);
      this.showAlert('Failed to grant consent. Please try again.', 'error');
      throw error;
    }
  }

  /**
   * Revoke consent for a specific consent ID
   */
  async revokeConsent(consentId: string): Promise<void> {
    try {
      await multiServiceApiClient.makeRequest(
        'PUT',
        `/api/v1/consents/${consentId}`,
        {
          status: 'revoked',
          revokedAt: new Date().toISOString()
        },
        'customer',
        'consent'
      );

      this.showAlert('Consent revoked successfully!', 'success');
    } catch (error) {
      console.error('Error revoking consent:', error);
      this.showAlert('Failed to revoke consent. Please try again.', 'error');
      throw error;
    }
  }

  /**
   * Get customer preferences
   */
  async getPreferences(): Promise<PreferenceSettings> {
    try {
      const response = await multiServiceApiClient.makeRequest(
        'GET',
        '/api/v1/preferences',
        undefined,
        'customer',
        'preference'
      );

      const prefs = response?.data || response;
      return {
        id: prefs?.id || 'default',
        communicationChannels: prefs?.communicationChannels || {
          email: true,
          sms: true,
          phone: false,
          push: true,
          mail: false
        },
        topicSubscriptions: prefs?.topicSubscriptions || {
          marketing: false,
          promotions: false,
          serviceUpdates: true,
          billing: true,
          security: true,
          newsletter: false,
          surveys: false
        },
        frequency: prefs?.frequency || 'daily',
        timezone: prefs?.timezone || 'Asia/Colombo',
        language: prefs?.language || 'en'
      };
    } catch (error) {
      console.error('Error fetching preferences:', error);
      // Return default preferences if backend is not available
      return {
        id: 'default',
        communicationChannels: {
          email: true,
          sms: true,
          phone: false,
          push: true,
          mail: false
        },
        topicSubscriptions: {
          marketing: false,
          promotions: false,
          serviceUpdates: true,
          billing: true,
          security: true,
          newsletter: false,
          surveys: false
        },
        frequency: 'daily',
        timezone: 'Asia/Colombo',
        language: 'en'
      };
    }
  }

  /**
   * Update customer preferences
   */
  async updatePreferences(preferences: Partial<PreferenceSettings>): Promise<PreferenceSettings> {
    try {
      const response = await multiServiceApiClient.makeRequest(
        'PUT',
        '/api/v1/preferences',
        preferences,
        'customer',
        'preference'
      );

      this.showAlert('Preferences updated successfully!', 'success');
      return response?.data || response;
    } catch (error) {
      console.error('Error updating preferences:', error);
      this.showAlert('Failed to update preferences. Please try again.', 'error');
      throw error;
    }
  }

  /**
   * Get privacy notices
   */
  async getPrivacyNotices(): Promise<PrivacyNotice[]> {
    try {
      const response = await multiServiceApiClient.makeRequest(
        'GET',
        '/api/v1/privacy-notices',
        undefined,
        'customer',
        'privacy-notice'
      );

      const notices = response?.data || response || [];
      return notices.map((notice: any) => ({
        id: notice.id || notice._id,
        title: notice.title || 'Privacy Notice',
        version: notice.version || '1.0',
        effectiveDate: notice.effectiveDate || notice.createdAt,
        status: notice.status || 'active',
        description: notice.description || 'Privacy notice description',
        content: notice.content || 'Privacy notice content',
        categories: notice.categories || ['general'],
        lastUpdated: notice.lastUpdated || notice.updatedAt || notice.createdAt
      }));
    } catch (error) {
      console.error('Error fetching privacy notices:', error);
      return [];
    }
  }

  /**
   * Get DSAR requests
   */
  async getDSARRequests(): Promise<DSARRequest[]> {
    try {
      const response = await multiServiceApiClient.makeRequest(
        'GET',
        '/api/v1/dsar/requests',
        undefined,
        'customer',
        'dsar'
      );

      const requests = response?.data || response || [];
      return requests.map((request: any) => ({
        id: request.id || request._id,
        requestType: request.requestType || 'access',
        status: request.status || 'pending',
        submittedAt: request.submittedAt || request.createdAt,
        completedAt: request.completedAt,
        description: request.description || `${request.requestType} request`,
        requestDetails: request.requestDetails || {},
        response: request.response
      }));
    } catch (error) {
      console.error('Error fetching DSAR requests:', error);
      return [];
    }
  }

  /**
   * Submit a new DSAR request
   */
  async submitDSARRequest(requestType: string, description: string, requestDetails: any): Promise<DSARRequest> {
    try {
      const response = await multiServiceApiClient.makeRequest(
        'POST',
        '/api/v1/dsar/requests',
        {
          requestType,
          description,
          requestDetails,
          submittedAt: new Date().toISOString(),
          status: 'pending'
        },
        'customer',
        'dsar'
      );

      this.showAlert('DSAR request submitted successfully!', 'success');
      return response?.data || response;
    } catch (error) {
      console.error('Error submitting DSAR request:', error);
      this.showAlert('Failed to submit DSAR request. Please try again.', 'error');
      throw error;
    }
  }

  /**
   * Get customer profile data
   */
  async getCustomerProfile(): Promise<CustomerProfile> {
    try {
      const response = await multiServiceApiClient.makeRequest(
        'GET',
        `${this.baseUrl}/profile`,
        undefined,
        'customer'
      );

      if (response.success && response.data) {
        return this.transformProfileData(response.data);
      }

      throw new Error('Failed to fetch customer profile');
    } catch (error: any) {
      console.error('Customer profile error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  }

  /**
   * Update customer profile
   */
  async updateProfile(updates: Partial<CustomerProfile>): Promise<CustomerProfile> {
    try {
      const response = await multiServiceApiClient.makeRequest(
        'PUT',
        `${this.baseUrl}/profile`,
        updates,
        'customer'
      );

      if (response.success && response.data) {
        return this.transformProfileData(response.data);
      }

      throw new Error('Failed to update profile');
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  }

  /**
   * Get customer activity history
   */
  async getActivityHistory(page: number = 1, limit: number = 20): Promise<{
    activities: ActivityItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }> {
    try {
      const response = await multiServiceApiClient.makeRequest(
        'GET',
        `${this.baseUrl}/activity?page=${page}&limit=${limit}`,
        undefined,
        'customer'
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to fetch activity history');
    } catch (error: any) {
      console.error('Activity history error:', error);
      // Return mock data as fallback
      return {
        activities: this.getMockActivityData(),
        pagination: {
          currentPage: page,
          totalPages: 1,
          totalItems: 5,
          itemsPerPage: limit
        }
      };
    }
  }

  /**
   * Get customer summary
   */
  async getCustomerSummary(): Promise<{
    id: string;
    name: string;
    email: string;
    memberSince: string;
    counters: {
      consents: number;
      preferences: number;
      dsarRequests: number;
    };
  }> {
    try {
      const response = await multiServiceApiClient.makeRequest(
        'GET',
        `${this.baseUrl}/summary`,
        undefined,
        'customer'
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to fetch customer summary');
    } catch (error: any) {
      console.error('Customer summary error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch summary');
    }
  }

  /**
   * Transform backend profile data to frontend format
   */
  private transformProfileData(backendData: any): CustomerProfile {
    return {
      id: backendData.id || backendData._id,
      name: backendData.name || `${backendData.firstName || ''} ${backendData.lastName || ''}`.trim(),
      firstName: backendData.firstName || backendData.name?.split(' ')[0] || '',
      lastName: backendData.lastName || backendData.name?.split(' ').slice(1).join(' ') || '',
      email: backendData.email,
      phone: backendData.phone || backendData.contactMedium?.find((c: any) => c.type === 'phone')?.value,
      company: backendData.company,
      department: backendData.department,
      jobTitle: backendData.jobTitle,
      status: backendData.status || 'active',
      createdAt: backendData.createdAt || backendData.engagedParty?.engagementDate,
      lastLoginAt: backendData.lastLoginAt
    };
  }

  /**
   * Get mock dashboard data as fallback
   */
  private getMockDashboardData(): DashboardOverview {
    return {
      customer: {
        id: 'customer_123',
        name: 'Robert Johnson',
        email: 'robert.johnson@example.com',
        accountStatus: 'active',
        joinDate: '2024-01-15',
        lastLogin: new Date().toISOString()
      },
      consentStats: {
        total: 12,
        granted: 8,
        revoked: 2,
        expired: 1,
        pending: 1
      },
      preferenceStats: {
        total: 6,
        enabled: 4,
        disabled: 2
      },
      dsarStats: {
        total: 3,
        pending: 1,
        completed: 2,
        inProgress: 0
      },
      recentActivity: [
        {
          id: '1',
          type: 'consent',
          action: 'granted',
          description: 'Marketing communications consent granted',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
        },
        {
          id: '2',
          type: 'preference',
          action: 'updated',
          description: 'Email notification preferences updated',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
        }
      ],
      notifications: [
        {
          id: '1',
          type: 'info',
          message: 'Your consent preferences have been updated successfully',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          read: false
        }
      ]
    };
  }

  /**
   * Get mock activity data as fallback
   */
  private getMockActivityData(): ActivityItem[] {
    return [
      {
        id: '1',
        action: 'granted',
        type: 'consent',
        entityId: 'consent_123',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        description: 'Marketing consent granted via email channel'
      },
      {
        id: '2',
        action: 'updated',
        type: 'preference',
        entityId: 'pref_456',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        description: 'Communication preferences updated'
      },
      {
        id: '3',
        action: 'submitted',
        type: 'dsar',
        entityId: 'dsar_789',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        description: 'Data export request submitted'
      }
    ];
  }
}

export const customerDashboardService = new CustomerDashboardService();
