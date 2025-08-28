// CSR Dashboard Service - Comprehensive Data Management with Fallbacks
import { apiClient } from './apiClient';

export interface CSRStats {
  totalCustomers: number;
  pendingRequests: number;
  consentUpdates: number;
  guardiansManaged: number;
  todayActions: number;
  riskAlerts: number;
  consentRate: number;
  resolvedRequests: number;
  newCustomers: number;
  activeConsents?: number;
  withdrawnConsents?: number;
  completedRequests?: number;
  averageResponseTime?: string;
  complianceRate?: number;
  dataBreaches?: number;
}

export interface CustomerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  mobile?: string;
  status: string;
  type: string;
  createdAt: string;
  address: string;
  dateOfBirth: string;
  customerSince?: string;
  riskLevel?: string;
  totalConsents?: number;
  activeConsents?: number;
  preferences?: {
    marketing: boolean;
    analytics: boolean;
    communication: string;
    language: string;
    notifications: boolean;
  };
  accountBalance?: number;
  lastLogin?: string | null;
  loyaltyPoints?: number;
  guardianFor?: string[];
}

export interface ConsentData {
  id: string;
  partyId: string;
  customerId: string;
  type: string;
  purpose: string;
  status: string;
  grantedAt?: string;
  deniedAt?: string;
  expiresAt?: string;
  source: string;
  lawfulBasis: string;
  category?: string;
  description?: string;
}

export interface DSARRequest {
  id: string;
  partyId: string;
  customerId: string;
  requestType: string;
  status: string;
  submittedAt: string;
  completedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  startedAt?: string;
  description: string;
  requestorName: string;
  requestorEmail: string;
  priority: string;
  assignedTo?: string;
  category?: string;
  legalBasis?: string;
  notes?: string;
  processingNotes?: string;
  processedBy?: string;
}

export interface AuditEvent {
  id: string;
  partyId: string;
  eventType: string;
  description: string;
  createdAt: string;
  userId: string;
  userName?: string;
  ipAddress: string;
  userAgent: string;
  metadata: any;
  category?: string;
  severity?: string;
}

export interface AnalyticsData {
  overview: {
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    totalClicked: number;
    totalFailed: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
  };
  channels: {
    [key: string]: {
      sent: number;
      delivered: number;
      deliveryRate: number;
      opened: number;
      openRate: number;
      clicked: number;
      clickRate: number;
    };
  };
  trends: Array<{
    date: string;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  }>;
  topPerformers: {
    templates: Array<{
      id: string;
      name: string;
      performance: number;
    }>;
    campaigns: Array<{
      id: string;
      name: string;
      performance: number;
    }>;
  };
}

export interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  type: 'promotional' | 'informational' | 'alert' | 'survey';
  channels: string[];
  subject: string;
  content: string;
  variables: string[];
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  usage: {
    timesUsed: number;
    lastUsed?: string;
    averagePerformance?: number;
  };
}

export interface CampaignData {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  startDate: string;
  endDate?: string;
  audienceSize: number;
  performance: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  };
  channels: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationLog {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  channel: string;
  subject: string;
  message: string;
  messageType: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
}

class CSRDashboardService {
  private readonly baseUrl = '/api/v1';
  private readonly statsUrl = '/api/csr/stats';
  private useOfflineMode = false;

  /**
   * Get CSR dashboard statistics with fallback to dummy data
   */
  async getCSRStats(): Promise<CSRStats> {
    try {
      console.log('[CSR] Fetching CSR stats from backend...');
      const response = await apiClient.get(this.statsUrl);
      console.log('[CSR] CSR stats loaded successfully:', response.data);
      return response.data;
    } catch (error) {
      console.warn('[CSR] Backend CSR stats unavailable, using fallback data:', error);
      this.useOfflineMode = true;
      return this.getFallbackStats();
    }
  }

  /**
   * Get all customers with fallback data
   */
  async getCustomers(): Promise<CustomerData[]> {
    try {
      console.log('[CSR] Fetching customers from /api/v1/party...');
      const response = await apiClient.get(`${this.baseUrl}/party`);
      console.log('[CSR] Customers loaded successfully:', Array.isArray(response.data) ? response.data.length : 0);
      return Array.isArray(response.data) ? response.data : this.getFallbackCustomers();
    } catch (error) {
      console.warn('[CSR] Backend customers unavailable, using fallback data:', error);
      return this.getFallbackCustomers();
    }
  }

  /**
   * Get all consents with real data from backend
   */
  async getConsents(): Promise<ConsentData[]> {
    try {
      console.log('[CSR] Fetching consents from /api/v1/csr/consent...');
      const response = await apiClient.get(`${this.baseUrl}/csr/consent`);
      console.log('[CSR] Consents loaded successfully:', Array.isArray(response.data) ? response.data.length : 0);
      return Array.isArray(response.data) ? response.data : this.getFallbackConsents();
    } catch (error) {
      console.warn('[CSR] Backend consents unavailable, using fallback data:', error);
      return this.getFallbackConsents();
    }
  }

  /**
   * Get all DSAR requests with real data from backend
   */
  async getDSARRequests(): Promise<DSARRequest[]> {
    try {
      console.log('[CSR] Fetching DSAR requests from /api/dsar-requests...');
      const response = await apiClient.get('/api/dsar-requests');
      console.log('[CSR] DSAR requests loaded successfully:', response.data);
      
      // Handle response - it should be directly an array with enhanced data
      if (Array.isArray(response.data)) {
        return response.data.map((req: any) => this.normalizeDBDSARRequest(req));
      } else {
        console.warn('Unexpected DSAR response structure, using fallback');
        return this.getFallbackDSARRequests();
      }
    } catch (error) {
      console.warn('[CSR] Backend DSAR requests unavailable, using fallback data:', error);
      return this.getFallbackDSARRequests();
    }
  }

  /**
   * Update DSAR request status with real backend API call
   */
  async updateDSARRequest(requestId: string, updates: Partial<DSARRequest>): Promise<DSARRequest> {
    try {
      console.log('[CSR] Updating DSAR request:', requestId, updates);
      
      // Prepare update payload - map our interface to backend format
      const updatePayload: any = {};

      if (updates.status) {
        // Map status values if needed - ensure we use valid enum values
        const statusMap: { [key: string]: string } = {
          'approved': 'in_progress', // Map approved to in_progress
          'rejected': 'rejected',
          'in_progress': 'in_progress',
          'completed': 'completed',
          'pending': 'pending',
          'cancelled': 'cancelled'
        };
        updatePayload.status = statusMap[updates.status] || updates.status;
      }

      // Add processing note if we have processingNotes
      if (updates.processingNotes) {
        updatePayload.processingNote = updates.processingNotes;
      }

      // Add processed by information as assignedTo
      if (updates.processedBy) {
        updatePayload.assignedTo = {
          userId: 'csr-current',
          name: updates.processedBy,
          email: 'csr@sltmobitel.lk' // TODO: Get from current user context
        };
      }

      // Use the correct authenticated endpoint
      const response = await apiClient.put(`/api/v1/dsar/requests/${requestId}`, updatePayload);
      console.log('[CSR] DSAR request updated successfully:', response);
      
      // Transform response back to our interface format
      const responseData = response.data as any;
      const dsarData = responseData.data || responseData;
      
      const updatedRequest: DSARRequest = {
        id: dsarData._id || dsarData.id,
        partyId: dsarData.requesterId,
        customerId: dsarData.requesterId,
        requestType: dsarData.requestType,
        status: dsarData.status,
        submittedAt: dsarData.submittedAt,
        completedAt: dsarData.completedAt,
        approvedAt: dsarData.status === 'in_progress' ? dsarData.updatedAt : undefined,
        rejectedAt: dsarData.status === 'rejected' ? dsarData.updatedAt : undefined,
        description: dsarData.description,
        requestorName: dsarData.requesterName,
        requestorEmail: dsarData.requesterEmail,
        priority: dsarData.priority || 'medium',
        assignedTo: dsarData.assignedTo?.name,
        processingNotes: updates.processingNotes || '',
        processedBy: updates.processedBy || ''
      };
      
      return updatedRequest;
    } catch (error) {
      console.error('[CSR] Failed to update DSAR request:', error);
      throw new Error(`Failed to update DSAR request: ${error}`);
    }
  }

  /**
   * Get audit events with real data from backend
   */
  async getAuditEvents(): Promise<AuditEvent[]> {
    try {
      console.log('[CSR] Fetching audit events from /api/v1/event...');
      const response = await apiClient.get(`${this.baseUrl}/event`);
      console.log('[CSR] Audit events loaded successfully:', Array.isArray(response.data) ? response.data.length : 0);
      return Array.isArray(response.data) ? response.data : this.getFallbackAuditEvents();
    } catch (error) {
      console.warn('[CSR] Backend audit events unavailable, using fallback data:', error);
      return this.getFallbackAuditEvents();
    }
  }

  /**
   * Get communication preferences with fallback data
   */
  async getCommunicationPreferences(customerId?: string): Promise<any> {
    try {
      if (this.useOfflineMode) {
        return this.getFallbackCommunicationPreferences(customerId);
      }
      
      if (customerId) {
        const response = await apiClient.get(`${this.baseUrl}/preference/customer/${customerId}`);
        return response.data || this.getFallbackCommunicationPreferences(customerId);
      }
      
      // Return all preferences
      return this.getFallbackCommunicationPreferences();
    } catch (error) {
      console.warn('[CSR] Backend communication preferences unavailable, using fallback data:', error);
      return this.getFallbackCommunicationPreferences(customerId);
    }
  }

  /**
   * Get guardian consent data with fallback
   */
  async getGuardianConsentData(): Promise<any[]> {
    try {
      if (this.useOfflineMode) {
        return this.getFallbackGuardianConsentData();
      }
      
      const response = await apiClient.get(`${this.baseUrl}/consent/guardian`);
      return Array.isArray(response.data) ? response.data : this.getFallbackGuardianConsentData();
    } catch (error) {
      console.warn('[CSR] Backend guardian consent data unavailable, using fallback data:', error);
      return this.getFallbackGuardianConsentData();
    }
  }

  /**
   * Search customers by multiple criteria
   */
  async searchCustomers(searchTerm: string): Promise<CustomerData[]> {
    const customers = await this.getCustomers();
    
    if (!searchTerm.trim()) {
      return customers;
    }

    const term = searchTerm.toLowerCase();
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(term) ||
      customer.email.toLowerCase().includes(term) ||
      customer.phone.includes(term) ||
      customer.id.includes(term) ||
      (customer.address && customer.address.toLowerCase().includes(term))
    );
  }

  /**
   * Get comprehensive dashboard data
   */
  async getComprehensiveDashboardData() {
    try {
      const [stats, customers, consents, dsarRequests, auditEvents] = await Promise.all([
        this.getCSRStats(),
        this.getCustomers(),
        this.getConsents(),
        this.getDSARRequests(),
        this.getAuditEvents()
      ]);

      return {
        stats,
        customers,
        consents,
        dsarRequests,
        auditEvents,
        offlineMode: this.useOfflineMode
      };
    } catch (error) {
      console.error('Error loading comprehensive dashboard data:', error);
      // Return fallback data for everything
      return {
        stats: this.getFallbackStats(),
        customers: this.getFallbackCustomers(),
        consents: this.getFallbackConsents(),
        dsarRequests: this.getFallbackDSARRequests(),
        auditEvents: this.getFallbackAuditEvents(),
        offlineMode: true
      };
    }
  }

  // =================== DATA NORMALIZATION METHODS ===================

  private normalizeDBDSARRequest(req: any): DSARRequest {
    return {
      id: req.id || req._id || req.requestId,
      partyId: req.requesterId || req.partyId || req.customerId,
      customerId: req.requesterId || req.partyId || req.customerId,
      requestType: req.type || req.requestType,
      status: req.status,
      submittedAt: req.submittedAt || req.createdAt,
      completedAt: req.completedAt,
      approvedAt: req.approvedAt,
      rejectedAt: req.rejectedAt,
      startedAt: req.startedAt,
      description: req.description,
      requestorName: req.requesterName || req.requestorName || `Customer ${req.requesterId || req.partyId}`,
      requestorEmail: req.requesterEmail || req.requestorEmail || '',
      priority: req.priority || 'medium',
      assignedTo: req.assignedTo,
      category: req.category,
      legalBasis: req.legalBasis,
      notes: req.notes,
      processingNotes: req.processingNotes,
      processedBy: req.processedBy
    };
  }

  // =================== FALLBACK DATA METHODS ===================

  private getFallbackStats(): CSRStats {
    return {
      totalCustomers: 8,
      pendingRequests: 5,
      consentUpdates: 12,
      guardiansManaged: 2,
      todayActions: 18,
      riskAlerts: 3,
      consentRate: 85,
      resolvedRequests: 15,
      newCustomers: 2,
      activeConsents: 25,
      withdrawnConsents: 4,
      completedRequests: 20,
      averageResponseTime: "2.1 hours",
      complianceRate: 96.8,
      dataBreaches: 1
    };
  }

  private getFallbackCustomers(): CustomerData[] {
    return [
      {
        id: "1",
        name: "John Doe",
        email: "john.doe@email.com",
        phone: "+94771234567",
        mobile: "+94771234567",
        status: "active",
        type: "individual",
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        address: "123 Main St, Colombo 03",
        dateOfBirth: "1985-06-15",
        customerSince: "2023-01-15",
        riskLevel: "low",
        totalConsents: 8,
        activeConsents: 6,
        preferences: {
          marketing: true,
          analytics: true,
          communication: "email",
          language: "en",
          notifications: true
        },
        accountBalance: 15250.50,
        lastLogin: new Date(Date.now() - 86400000 * 1).toISOString(),
        loyaltyPoints: 4500
      },
      {
        id: "2",
        name: "Jane Smith",
        email: "jane.smith@email.com",
        phone: "+94771234568",
        mobile: "+94771234568",
        status: "active",
        type: "individual",
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        address: "456 Oak Ave, Kandy",
        dateOfBirth: "1992-03-22",
        customerSince: "2023-03-10",
        riskLevel: "medium",
        totalConsents: 12,
        activeConsents: 10,
        preferences: {
          marketing: false,
          analytics: true,
          communication: "sms",
          language: "si",
          notifications: false
        },
        accountBalance: 8750.25,
        lastLogin: new Date(Date.now() - 86400000 * 2).toISOString(),
        loyaltyPoints: 2100
      },
      {
        id: "3",
        name: "Robert Johnson",
        email: "robert.j@email.com",
        phone: "+94771234569",
        mobile: "+94771234569",
        status: "active",
        type: "guardian",
        createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        address: "789 Pine Rd, Galle",
        dateOfBirth: "1978-11-08",
        customerSince: "2022-12-05",
        riskLevel: "low",
        totalConsents: 15,
        activeConsents: 12,
        preferences: {
          marketing: true,
          analytics: false,
          communication: "email",
          language: "en",
          notifications: true
        },
        accountBalance: 25000.00,
        lastLogin: new Date(Date.now() - 86400000 * 0.5).toISOString(),
        loyaltyPoints: 7800,
        guardianFor: ["child-001", "child-002"]
      },
      {
        id: "4",
        name: "Emily Davis",
        email: "emily.davis@email.com",
        phone: "+94771234570",
        mobile: "+94771234570",
        status: "inactive",
        type: "individual",
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        address: "321 Elm St, Matara",
        dateOfBirth: "1995-09-12",
        customerSince: "2024-01-20",
        riskLevel: "high",
        totalConsents: 5,
        activeConsents: 2,
        preferences: {
          marketing: false,
          analytics: false,
          communication: "none",
          language: "en",
          notifications: false
        },
        accountBalance: 150.00,
        lastLogin: new Date(Date.now() - 86400000 * 45).toISOString(),
        loyaltyPoints: 50
      },
      {
        id: "5",
        name: "Michael Chen",
        email: "michael.chen@email.com",
        phone: "+94771234571",
        mobile: "+94771234571",
        status: "active",
        type: "individual",
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        address: "555 Tech Park, Colombo 07",
        dateOfBirth: "1990-05-18",
        customerSince: "2024-07-20",
        riskLevel: "low",
        totalConsents: 6,
        activeConsents: 6,
        preferences: {
          marketing: true,
          analytics: true,
          communication: "email",
          language: "en",
          notifications: true
        },
        accountBalance: 12500.75,
        lastLogin: new Date(Date.now() - 86400000 * 0.1).toISOString(),
        loyaltyPoints: 1250
      },
      {
        id: "6",
        name: "Priya Perera",
        email: "priya.perera@email.com",
        phone: "+94771234572",
        mobile: "+94771234572",
        status: "active",
        type: "individual",
        createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
        address: "100 Temple Road, Nugegoda",
        dateOfBirth: "1988-04-10",
        customerSince: "2022-08-15",
        riskLevel: "low",
        totalConsents: 10,
        activeConsents: 9,
        preferences: {
          marketing: true,
          analytics: true,
          communication: "sms",
          language: "si",
          notifications: true
        },
        accountBalance: 18750.30,
        lastLogin: new Date(Date.now() - 86400000 * 3).toISOString(),
        loyaltyPoints: 5600
      },
      {
        id: "7",
        name: "David Wilson",
        email: "david.wilson@email.com",
        phone: "+94771234573",
        mobile: "+94771234573",
        status: "pending",
        type: "individual",
        createdAt: new Date(Date.now() - 86400000 * 0.5).toISOString(),
        address: "88 Lake Drive, Battaramulla",
        dateOfBirth: "1995-12-03",
        customerSince: "2024-07-21",
        riskLevel: "medium",
        totalConsents: 3,
        activeConsents: 1,
        preferences: {
          marketing: true,
          analytics: false,
          communication: "email",
          language: "en",
          notifications: false
        },
        accountBalance: 500.00,
        lastLogin: null,
        loyaltyPoints: 0
      },
      {
        id: "8",
        name: "Sarah Fernando",
        email: "sarah.fernando@email.com",
        phone: "+94771234574",
        mobile: "+94771234574",
        status: "active",
        type: "guardian",
        createdAt: new Date(Date.now() - 86400000 * 180).toISOString(),
        address: "45 Flower Road, Colombo 07",
        dateOfBirth: "1982-07-25",
        customerSince: "2021-12-20",
        riskLevel: "low",
        totalConsents: 18,
        activeConsents: 15,
        preferences: {
          marketing: false,
          analytics: true,
          communication: "email",
          language: "en",
          notifications: true
        },
        accountBalance: 32000.00,
        lastLogin: new Date(Date.now() - 86400000 * 1).toISOString(),
        loyaltyPoints: 9500,
        guardianFor: ["child-003"]
      }
    ];
  }

  private getFallbackConsents(): ConsentData[] {
    return [
      {
        id: "1",
        partyId: "1",
        customerId: "1",
        type: "marketing",
        purpose: "Email marketing communications",
        status: "granted",
        grantedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
        source: "website",
        lawfulBasis: "consent",
        category: "Marketing",
        description: "Receive promotional emails and special offers"
      },
      {
        id: "2",
        partyId: "1",
        customerId: "1",
        type: "analytics",
        purpose: "Website analytics and performance tracking",
        status: "granted",
        grantedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
        source: "mobile_app",
        lawfulBasis: "consent",
        category: "Analytics",
        description: "Allow usage tracking for service improvement"
      },
      {
        id: "3",
        partyId: "2",
        customerId: "2",
        type: "personalization",
        purpose: "Personalized content recommendations",
        status: "denied",
        deniedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        source: "website",
        lawfulBasis: "consent",
        category: "Personalization",
        description: "Customize content based on preferences"
      },
      {
        id: "4",
        partyId: "3",
        customerId: "3",
        type: "guardian_consent",
        purpose: "Consent on behalf of minor child",
        status: "granted",
        grantedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
        source: "in_person",
        lawfulBasis: "consent",
        category: "Guardian",
        description: "Legal guardian consent for minor's data processing"
      },
      {
        id: "5",
        partyId: "1",
        customerId: "1",
        type: "sms_marketing",
        purpose: "SMS marketing and promotional messages",
        status: "granted",
        grantedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
        source: "mobile_app",
        lawfulBasis: "consent",
        category: "Marketing",
        description: "Receive SMS promotions and updates"
      },
      {
        id: "6",
        partyId: "2",
        customerId: "2",
        type: "data_processing",
        purpose: "Customer service and account management",
        status: "granted",
        grantedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 730).toISOString(),
        source: "customer_service",
        lawfulBasis: "legitimate_interest",
        category: "Service",
        description: "Process data for customer support and account maintenance"
      },
      {
        id: "7",
        partyId: "4",
        customerId: "4",
        type: "marketing",
        purpose: "Marketing communications",
        status: "withdrawn",
        grantedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        deniedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        source: "website",
        lawfulBasis: "consent",
        category: "Marketing",
        description: "Originally consented but later withdrawn"
      },
      {
        id: "8",
        partyId: "5",
        customerId: "5",
        type: "location_tracking",
        purpose: "Location-based services and recommendations",
        status: "granted",
        grantedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 180).toISOString(),
        source: "mobile_app",
        lawfulBasis: "consent",
        category: "Location",
        description: "Use location data for relevant services"
      },
      {
        id: "9",
        partyId: "6",
        customerId: "6",
        type: "third_party_sharing",
        purpose: "Share data with trusted partners for enhanced services",
        status: "denied",
        deniedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        source: "website",
        lawfulBasis: "consent",
        category: "Data Sharing",
        description: "Declined to share data with third parties"
      },
      {
        id: "10",
        partyId: "3",
        customerId: "3",
        type: "biometric_data",
        purpose: "Biometric authentication for enhanced security",
        status: "pending",
        source: "mobile_app",
        lawfulBasis: "consent",
        category: "Security",
        description: "Awaiting consent for fingerprint/face recognition"
      },
      {
        id: "11",
        partyId: "7",
        customerId: "7",
        type: "basic_profile",
        purpose: "Basic profile information for account setup",
        status: "granted",
        grantedAt: new Date(Date.now() - 86400000 * 0.5).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
        source: "registration",
        lawfulBasis: "contract",
        category: "Account",
        description: "Essential data for account creation"
      },
      {
        id: "12",
        partyId: "8",
        customerId: "8",
        type: "child_data_processing",
        purpose: "Processing child's data under guardian consent",
        status: "granted",
        grantedAt: new Date(Date.now() - 86400000 * 180).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
        source: "guardian_portal",
        lawfulBasis: "consent",
        category: "Guardian",
        description: "Guardian consent for child's service usage"
      }
    ];
  }

  private getFallbackDSARRequests(): DSARRequest[] {
    return [
      {
        id: "1",
        partyId: "1",
        customerId: "1",
        requestType: "data_access",
        status: "pending",
        submittedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        description: "I need to see what personal data you have about me for my mortgage application",
        requestorName: "John Doe",
        requestorEmail: "john.doe@email.com",
        priority: "medium",
        assignedTo: "CSR Team A",
        category: "Subject Access Request",
        legalBasis: "GDPR Article 15"
      },
      {
        id: "2",
        partyId: "2",
        customerId: "2",
        requestType: "data_deletion",
        status: "approved",
        submittedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        approvedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        description: "I want to delete my marketing data as I'm no longer interested in promotional content",
        requestorName: "Jane Smith",
        requestorEmail: "jane.smith@email.com",
        priority: "high",
        assignedTo: "Sarah Wilson",
        category: "Right to Erasure",
        legalBasis: "GDPR Article 17",
        processingNotes: "Approved by CSR Manager - Ready for processing"
      },
      {
        id: "3",
        partyId: "3",
        customerId: "3",
        requestType: "data_portability",
        status: "pending",
        submittedAt: new Date(Date.now() - 86400000 * 28).toISOString(),
        description: "I'm switching banks and need all my account data in a portable format",
        requestorName: "Robert Johnson",
        requestorEmail: "robert.j@email.com",
        priority: "high",
        assignedTo: "Michael Chen",
        category: "Data Portability",
        legalBasis: "GDPR Article 20",
        notes: "URGENT: Request approaching 30-day deadline"
      },
      {
        id: "4",
        partyId: "4",
        customerId: "4",
        requestType: "data_rectification",
        status: "in_progress",
        submittedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        description: "My address and phone number changed after my recent move, please update my records",
        requestorName: "Emily Davis",
        requestorEmail: "emily.davis@email.com",
        priority: "medium",
        assignedTo: "Lisa Anderson",
        category: "Right to Rectification",
        legalBasis: "GDPR Article 16"
      },
      {
        id: "5",
        partyId: "5",
        customerId: "5",
        requestType: "consent_withdrawal",
        status: "completed",
        submittedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        completedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        description: "I no longer want you to track my location for promotional purposes",
        requestorName: "Michael Chen",
        requestorEmail: "michael.chen@email.com",
        priority: "low",
        assignedTo: "David Kumar",
        category: "Consent Management",
        legalBasis: "GDPR Article 7"
      },
      {
        id: "6",
        partyId: "6",
        customerId: "6",
        requestType: "data_access",
        status: "in_progress",
        submittedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
        description: "I need a complete copy of my data including what you've shared with partners",
        requestorName: "Priya Perera",
        requestorEmail: "priya.perera@email.com",
        priority: "medium",
        assignedTo: "Rachel Thompson",
        category: "Subject Access Request",
        legalBasis: "GDPR Article 15",
        notes: "Includes request for third-party shared data"
      },
      {
        id: "7",
        partyId: "7",
        customerId: "7",
        requestType: "data_restriction",
        status: "pending",
        submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        description: "Please stop processing my fingerprint data while I review your new privacy policy",
        requestorName: "David Wilson",
        requestorEmail: "david.wilson@email.com",
        priority: "high",
        assignedTo: "James Miller",
        category: "Right to Restriction",
        legalBasis: "GDPR Article 18"
      },
      {
        id: "8",
        partyId: "8",
        customerId: "8",
        requestType: "guardian_data_access",
        status: "pending",
        submittedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
        description: "As my daughter's guardian, I need to see what data you have on her account",
        requestorName: "Sarah Fernando",
        requestorEmail: "sarah.fernando@email.com",
        priority: "medium",
        assignedTo: "Guardian Team",
        category: "Guardian Rights",
        legalBasis: "GDPR Article 8",
        notes: "Requires guardian verification"
      },
      {
        id: "9",
        partyId: "1",
        customerId: "1",
        requestType: "data_correction",
        status: "rejected",
        submittedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
        completedAt: new Date(Date.now() - 86400000 * 18).toISOString(),
        description: "My employment status changed - please correct my job title and income bracket",
        requestorName: "John Doe",
        requestorEmail: "john.doe@email.com",
        priority: "low",
        assignedTo: "Alex Brown",
        category: "Right to Rectification",
        legalBasis: "GDPR Article 16",
        notes: "Rejected due to lack of supporting documentation"
      },
      {
        id: "10",
        partyId: "3",
        customerId: "3",
        requestType: "objection_processing",
        status: "in_progress",
        submittedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
        description: "I object to receiving marketing calls and emails - please stop all promotional outreach",
        requestorName: "Robert Johnson",
        requestorEmail: "robert.j@email.com",
        priority: "medium",
        assignedTo: "Marketing Team",
        category: "Right to Object",
        legalBasis: "GDPR Article 21"
      }
    ];
  }

  private getFallbackAuditEvents(): AuditEvent[] {
    return [
      {
        id: "1",
        partyId: "1",
        eventType: "consent_granted",
        description: "Marketing consent granted via website",
        createdAt: new Date(Date.now() - 86400000 * 0.1).toISOString(),
        userId: "csr_001",
        userName: "Sarah Wilson",
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        metadata: { consentId: "1", channel: "website" },
        category: "Consent Management",
        severity: "info"
      },
      {
        id: "2",
        partyId: "5",
        eventType: "customer_registration",
        description: "New customer account created - Michael Chen",
        createdAt: new Date(Date.now() - 86400000 * 0.5).toISOString(),
        userId: "system",
        userName: "System Automated",
        ipAddress: "192.168.1.105",
        userAgent: "ConsentHub Registration System",
        metadata: { customerId: "5" },
        category: "Account Management",
        severity: "info"
      },
      {
        id: "3",
        partyId: "3",
        eventType: "dsar_request_submitted",
        description: "Data portability request submitted",
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        userId: "customer",
        userName: "Robert Johnson",
        ipAddress: "192.168.1.102",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        metadata: { dsarId: "3", requestType: "data_portability" },
        category: "DSAR Management",
        severity: "medium"
      },
      {
        id: "4",
        partyId: "2",
        eventType: "consent_withdrawn",
        description: "Personalization consent withdrawn by Jane Smith",
        createdAt: new Date(Date.now() - 86400000 * 1.2).toISOString(),
        userId: "csr_002",
        userName: "Mike Rodriguez",
        ipAddress: "192.168.1.101",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        metadata: { consentId: "3", reason: "customer_request" },
        category: "Consent Management",
        severity: "info"
      },
      {
        id: "5",
        partyId: "4",
        eventType: "account_suspended",
        description: "Customer account suspended due to inactivity",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        userId: "system",
        userName: "System Automated",
        ipAddress: "192.168.1.200",
        userAgent: "ConsentHub Compliance System",
        metadata: { customerId: "4", reason: "inactivity_45_days" },
        category: "Account Management",
        severity: "warning"
      },
      {
        id: "6",
        partyId: "8",
        eventType: "guardian_consent_granted",
        description: "Guardian consent granted for child data processing",
        createdAt: new Date(Date.now() - 86400000 * 2.5).toISOString(),
        userId: "csr_003",
        userName: "Lisa Chen",
        ipAddress: "192.168.1.103",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)",
        metadata: { guardianId: "8", childId: "child-003", consentType: "data_processing" },
        category: "Guardian Management",
        severity: "info"
      },
      {
        id: "7",
        partyId: "1",
        eventType: "data_export_requested",
        description: "Customer requested data export for portability",
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        userId: "customer",
        userName: "John Doe",
        ipAddress: "192.168.1.104",
        userAgent: "Mozilla/5.0 (Android 11; Mobile)",
        metadata: { dsarId: "1", exportFormat: "JSON" },
        category: "Data Export",
        severity: "medium"
      },
      {
        id: "8",
        partyId: "6",
        eventType: "preference_updated",
        description: "Communication preferences updated - Priya Perera",
        createdAt: new Date(Date.now() - 86400000 * 3.5).toISOString(),
        userId: "csr_001",
        userName: "Sarah Wilson",
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        metadata: { customerId: "6", changes: { communication: "sms", language: "si" } },
        category: "Preference Management",
        severity: "info"
      },
      {
        id: "9",
        partyId: "7",
        eventType: "security_alert",
        description: "Multiple failed login attempts detected",
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        userId: "security_system",
        userName: "Security Monitor",
        ipAddress: "192.168.1.201",
        userAgent: "ConsentHub Security System",
        metadata: { customerId: "7", attemptCount: 5, blocked: true },
        category: "Security",
        severity: "high"
      },
      {
        id: "10",
        partyId: "3",
        eventType: "biometric_consent_pending",
        description: "Biometric consent request submitted and pending review",
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        userId: "customer",
        userName: "Robert Johnson",
        ipAddress: "192.168.1.102",
        userAgent: "ConsentHub Mobile App v2.1.0",
        metadata: { consentId: "10", biometricType: "fingerprint" },
        category: "Biometric Consent",
        severity: "medium"
      },
      {
        id: "11",
        partyId: "2",
        eventType: "dsar_completed",
        description: "Data deletion request completed successfully",
        createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
        userId: "csr_004",
        userName: "Data Protection Officer",
        ipAddress: "192.168.1.106",
        userAgent: "ConsentHub Admin Portal",
        metadata: { dsarId: "2", deletedRecords: 47, retentionOverride: false },
        category: "DSAR Management",
        severity: "info"
      },
      {
        id: "12",
        partyId: "5",
        eventType: "consent_expired",
        description: "Marketing consent expired - automatic notification sent",
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        userId: "system",
        userName: "Consent Monitor",
        ipAddress: "192.168.1.202",
        userAgent: "ConsentHub Compliance System",
        metadata: { consentId: "5", expiryDate: new Date(Date.now() - 86400000 * 7).toISOString() },
        category: "Consent Lifecycle",
        severity: "warning"
      },
      {
        id: "13",
        partyId: "8",
        eventType: "guardian_verification",
        description: "Guardian identity verified for DSAR request",
        createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
        userId: "csr_005",
        userName: "Verification Team",
        ipAddress: "192.168.1.107",
        userAgent: "ConsentHub Verification Portal",
        metadata: { dsarId: "8", verificationMethod: "ID_document", status: "verified" },
        category: "Verification",
        severity: "info"
      },
      {
        id: "14",
        partyId: "4",
        eventType: "data_breach_notification",
        description: "Data breach notification sent to affected customer",
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        userId: "dpo_001",
        userName: "Data Protection Officer",
        ipAddress: "192.168.1.203",
        userAgent: "ConsentHub Incident Management",
        metadata: { incidentId: "INC-2024-001", notificationType: "email", severity: "medium" },
        category: "Data Breach",
        severity: "high"
      },
      {
        id: "15",
        partyId: "1",
        eventType: "consent_renewal",
        description: "Annual consent renewal reminder sent",
        createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
        userId: "system",
        userName: "Consent Lifecycle Manager",
        ipAddress: "192.168.1.204",
        userAgent: "ConsentHub Automation",
        metadata: { consentId: "1", reminderType: "annual", daysUntilExpiry: 30 },
        category: "Consent Lifecycle",
        severity: "info"
      }
    ];
  }

  private getFallbackCommunicationPreferences(customerId?: string): any {
    const allPreferences = [
      {
        customerId: "1",
        customerName: "John Doe",
        email: "john.doe@email.com",
        preferences: {
          channels: {
            email: true,
            sms: true,
            push: false,
            inApp: true,
            phone: false
          },
          topics: {
            offers: true,
            productUpdates: true,
            serviceAlerts: true,
            billing: true,
            security: true,
            newsletters: false,
            marketing: true,
            promotions: false
          },
          dndSettings: {
            enabled: true,
            startTime: '22:00',
            endTime: '08:00'
          },
          frequency: {
            maxEmailsPerDay: 3,
            maxSmsPerDay: 2,
            digestMode: false,
            immediateAlerts: ['security', 'billing']
          },
          language: 'en',
          timezone: 'Asia/Colombo'
        }
      },
      {
        customerId: "2",
        customerName: "Jane Smith",
        email: "jane.smith@email.com",
        preferences: {
          channels: {
            email: false,
            sms: true,
            push: true,
            inApp: true,
            phone: false
          },
          topics: {
            offers: false,
            productUpdates: true,
            serviceAlerts: true,
            billing: true,
            security: true,
            newsletters: false,
            marketing: false,
            promotions: false
          },
          dndSettings: {
            enabled: false,
            startTime: '23:00',
            endTime: '07:00'
          },
          frequency: {
            maxEmailsPerDay: 1,
            maxSmsPerDay: 3,
            digestMode: true,
            immediateAlerts: ['security']
          },
          language: 'si',
          timezone: 'Asia/Colombo'
        }
      },
      {
        customerId: "3",
        customerName: "Robert Johnson",
        email: "robert.j@email.com",
        preferences: {
          channels: {
            email: true,
            sms: false,
            push: true,
            inApp: true,
            phone: true
          },
          topics: {
            offers: true,
            productUpdates: true,
            serviceAlerts: true,
            billing: true,
            security: true,
            newsletters: true,
            marketing: false,
            promotions: true
          },
          dndSettings: {
            enabled: true,
            startTime: '21:30',
            endTime: '08:30'
          },
          frequency: {
            maxEmailsPerDay: 5,
            maxSmsPerDay: 1,
            digestMode: false,
            immediateAlerts: ['security', 'billing', 'serviceAlerts']
          },
          language: 'en',
          timezone: 'Asia/Colombo'
        }
      },
      {
        customerId: "4",
        customerName: "Emily Davis",
        email: "emily.davis@email.com",
        preferences: {
          channels: {
            email: false,
            sms: false,
            push: false,
            inApp: false,
            phone: false
          },
          topics: {
            offers: false,
            productUpdates: false,
            serviceAlerts: true,
            billing: true,
            security: true,
            newsletters: false,
            marketing: false,
            promotions: false
          },
          dndSettings: {
            enabled: true,
            startTime: '20:00',
            endTime: '10:00'
          },
          frequency: {
            maxEmailsPerDay: 0,
            maxSmsPerDay: 0,
            digestMode: false,
            immediateAlerts: ['security']
          },
          language: 'en',
          timezone: 'Asia/Colombo'
        }
      }
    ];

    if (customerId) {
      return allPreferences.find(p => p.customerId === customerId) || allPreferences[0];
    }
    
    return allPreferences;
  }

  private getFallbackGuardianConsentData(): any[] {
    return [
      {
        id: "gc_1",
        guardianId: "3",
        guardianName: "Robert Johnson",
        guardianEmail: "robert.j@email.com",
        guardianPhone: "+94771234569",
        children: [
          {
            id: "child-001",
            name: "Emma Johnson",
            dateOfBirth: "2015-08-12",
            age: 9,
            relationship: "daughter",
            consents: [
              {
                id: "gc_consent_1",
                type: "educational_platform",
                purpose: "Access to online learning platform",
                status: "granted",
                grantedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
                expiresAt: new Date(Date.now() + 86400000 * 335).toISOString(),
                category: "Education",
                restrictions: ["no_marketing", "limited_data_collection"]
              },
              {
                id: "gc_consent_2",
                type: "health_monitoring",
                purpose: "School health and safety monitoring",
                status: "granted",
                grantedAt: new Date(Date.now() - 86400000 * 60).toISOString(),
                expiresAt: new Date(Date.now() + 86400000 * 305).toISOString(),
                category: "Health",
                restrictions: ["emergency_only", "school_hours_only"]
              }
            ]
          },
          {
            id: "child-002",
            name: "Luke Johnson",
            dateOfBirth: "2018-03-25",
            age: 6,
            relationship: "son",
            consents: [
              {
                id: "gc_consent_3",
                type: "location_tracking",
                purpose: "Child safety and location monitoring",
                status: "granted",
                grantedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
                expiresAt: new Date(Date.now() + 86400000 * 350).toISOString(),
                category: "Safety",
                restrictions: ["guardian_access_only", "emergency_services"]
              }
            ]
          }
        ]
      },
      {
        id: "gc_2",
        guardianId: "8",
        guardianName: "Sarah Fernando",
        guardianEmail: "sarah.fernando@email.com",
        guardianPhone: "+94771234574",
        children: [
          {
            id: "child-003",
            name: "Alex Fernando",
            dateOfBirth: "2016-11-07",
            age: 7,
            relationship: "child",
            consents: [
              {
                id: "gc_consent_4",
                type: "digital_services",
                purpose: "Access to age-appropriate digital services",
                status: "pending",
                submittedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
                category: "Digital Services",
                restrictions: ["parental_controls", "content_filtering", "time_limits"]
              },
              {
                id: "gc_consent_5",
                type: "medical_records",
                purpose: "Access to child medical history for emergencies",
                status: "granted",
                grantedAt: new Date(Date.now() - 86400000 * 90).toISOString(),
                expiresAt: new Date(Date.now() + 86400000 * 275).toISOString(),
                category: "Medical",
                restrictions: ["emergency_only", "licensed_practitioners"]
              }
            ]
          }
        ]
      },
      {
        id: "gc_3",
        guardianId: "9",
        guardianName: "David Kumar",
        guardianEmail: "david.kumar@email.com",
        guardianPhone: "+94771234575",
        children: [
          {
            id: "child-004",
            name: "Maya Kumar",
            dateOfBirth: "2017-06-30",
            age: 7,
            relationship: "daughter",
            consents: [
              {
                id: "gc_consent_6",
                type: "communication_platform",
                purpose: "Video calls with family members",
                status: "granted",
                grantedAt: new Date(Date.now() - 86400000 * 45).toISOString(),
                expiresAt: new Date(Date.now() + 86400000 * 320).toISOString(),
                category: "Communication",
                restrictions: ["family_only", "supervised_sessions", "no_recording"]
              }
            ]
          }
        ]
      }
    ];
  }

  /**
   * Update customer consent status
   */
  async updateConsentStatus(consentId: string, status: 'granted' | 'denied' | 'withdrawn', notes?: string): Promise<ConsentData> {
    try {
      console.log(`[CSR] Updating consent ${consentId} to status: ${status}`);
      
      const updateData = {
        status,
        notes: notes || `Updated by CSR agent on ${new Date().toLocaleDateString()}`,
        updatedAt: new Date().toISOString(),
        updatedBy: 'csr-agent' // You can get this from auth context
      };

      const response = await apiClient.put(`${this.baseUrl}/consent/${consentId}`, updateData);
      console.log('[CSR] Consent updated successfully:', response.data);
      
      return response.data as ConsentData;
    } catch (error) {
      console.warn('[CSR] Backend consent update unavailable, simulating update:', error);
      
      // Simulate successful update for demo purposes
      return {
        id: consentId,
        partyId: '',
        customerId: '',
        type: '',
        purpose: '',
        status,
        grantedAt: status === 'granted' ? new Date().toISOString() : undefined,
        deniedAt: status === 'denied' ? new Date().toISOString() : undefined,
        source: 'csr-update',
        lawfulBasis: 'consent',
        category: 'updated'
      };
    }
  }

  /**
   * Get customer-specific consents
   */
  async getCustomerConsents(customerId: string): Promise<ConsentData[]> {
    try {
      console.log(`[CSR] Fetching consents for customer: ${customerId}`);
      const response = await apiClient.get(`${this.baseUrl}/consent/customer/${customerId}`);
      console.log('[CSR] Customer consents loaded:', Array.isArray(response.data) ? response.data.length : 0);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.warn(`[CSR] Backend customer consents unavailable for ${customerId}, using filtered fallback:`, error);
      
      // Filter fallback consents for the specific customer
      const allConsents = this.getFallbackConsents();
      return allConsents.filter(consent => 
        consent.customerId === customerId || consent.partyId === customerId
      );
    }
  }

  // Notification methods
  async getNotificationAnalytics(): Promise<{ data: AnalyticsData }> {
    try {
      console.log('[CSR] Fetching notification analytics...');
      const response = await apiClient.get('/api/csr/notifications/analytics');
      console.log('[CSR] Notification analytics loaded successfully:', response.data);
      return { data: response.data.data || response.data as AnalyticsData };
    } catch (error) {
      console.warn('[CSR] Backend notification analytics unavailable, using fallback:', error);
      
      // Return fallback analytics data
      return {
        data: {
          overview: {
            totalSent: 0,
            totalDelivered: 0,
            totalOpened: 0,
            totalClicked: 0,
            totalFailed: 0,
            deliveryRate: 0,
            openRate: 0,
            clickRate: 0
          },
          channels: {},
          trends: [],
          topPerformers: {
            templates: [],
            campaigns: []
          }
        }
      };
    }
  }

  async sendNotifications(data: {
    customerIds: string[];
    channels: string[];
    subject: string;
    message: string;
    messageType: string;
  }): Promise<any> {
    try {
      console.log('[CSR] Sending notifications...', data);
      const response = await apiClient.post('/api/csr/notifications/send', data);
      console.log('[CSR] Notifications sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('[CSR] Failed to send notifications:', error);
      throw error;
    }
  }

  async getNotificationCustomers(): Promise<{ data: any[] }> {
    try {
      console.log('[CSR] Fetching customers for notifications...');
      const response = await apiClient.get('/api/csr/customers');
      const responseData = response.data as any;
      console.log('[CSR] Customers loaded successfully for notifications:', responseData?.data?.length || 0);
      return { data: responseData?.data || [] };
    } catch (error) {
      console.warn('[CSR] Backend customers unavailable for notifications, using fallback:', error);
      
      // Try to get customers from the existing getCustomers method as fallback
      try {
        const customers = await this.getCustomers();
        return {
          data: customers.map((customer: any) => ({
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone || customer.mobile,
            organization: customer.company,
            createdAt: customer.createdAt
          }))
        };
      } catch (fallbackError) {
        console.error('[CSR] Fallback customer fetch failed:', fallbackError);
        return { data: [] };
      }
    }
  }

  // Get pre-built notification templates
  async getNotificationTemplates() {
    console.log('[CSR] Fetching notification templates...');
    
    try {
      const response = await apiClient.get('/api/csr/notifications/templates');
      console.log('[CSR] Templates loaded successfully:', response.data.count);
      return response.data;
    } catch (error) {
      console.error('[CSR] Failed to fetch templates:', error);
      
      // Fallback with local templates
      return {
        data: [
          {
            id: 'welcome',
            name: 'Welcome Message',
            subject: 'Welcome to SLT Mobitel Services',
            message: 'Welcome to SLT Mobitel! We are excited to have you as our valued customer.',
            type: 'promotional',
            channels: ['email', 'sms']
          },
          {
            id: 'payment_reminder',
            name: 'Payment Reminder',
            subject: 'Payment Reminder - Your Bill is Due',
            message: 'This is a friendly reminder that your monthly bill is due.',
            type: 'reminder',
            channels: ['email', 'sms', 'push']
          }
        ]
      };
    }
  }

  // Send bulk notifications to all customers
  async sendBulkNotifications(data: {
    channels: string[];
    subject: string;
    message: string;
    messageType: string;
  }) {
    console.log('[CSR] Sending bulk notifications...', data);
    
    try {
      const response = await apiClient.post('/api/csr/notifications/send/bulk', data);
      console.log('[CSR] Bulk notifications sent successfully:', response.data.summary);
      return response.data;
    } catch (error: any) {
      console.error('[CSR] Failed to send bulk notifications:', error.response?.data || error.message);
      throw {
        message: 'An error occurred',
        status: error.response?.status || 500,
        details: error.response?.data || error.message
      };
    }
  }

  // Send welcome email to customer
  async sendWelcomeEmail(data: {
    email: string;
    customerName?: string;
    createdBy?: 'admin' | 'self';
  }) {
    console.log('[CSR] Sending welcome email...', data);
    
    try {
      const response = await apiClient.post('/api/csr/notifications/welcome', {
        email: data.email,
        customerName: data.customerName,
        createdBy: data.createdBy || 'admin'
      });
      console.log('[CSR] Welcome email sent successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[CSR] Failed to send welcome email:', error.response?.data || error.message);
      throw {
        message: error.response?.data?.error || 'Failed to send welcome email',
        status: error.response?.status || 500,
        details: error.response?.data || error.message
      };
    }
  }
}

export const csrDashboardService = new CSRDashboardService();
