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
  description: string;
  requestorName: string;
  requestorEmail: string;
  priority: string;
  assignedTo?: string;
  category?: string;
  legalBasis?: string;
  notes?: string;
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

class CSRDashboardService {
  private readonly baseUrl = '/api/v1';
  private readonly statsUrl = '/api/csr/stats';
  private useOfflineMode = false;

  /**
   * Get CSR dashboard statistics with fallback to dummy data
   */
  async getCSRStats(): Promise<CSRStats> {
    try {
      console.log('🔍 Fetching CSR stats from backend...');
      const response = await apiClient.get(this.statsUrl);
      console.log('✅ CSR stats loaded successfully:', response.data);
      return response.data;
    } catch (error) {
      console.warn('⚠️ Backend CSR stats unavailable, using fallback data:', error);
      this.useOfflineMode = true;
      return this.getFallbackStats();
    }
  }

  /**
   * Get all customers with fallback data
   */
  async getCustomers(): Promise<CustomerData[]> {
    try {
      if (this.useOfflineMode) {
        return this.getFallbackCustomers();
      }
      
      const response = await apiClient.get(`${this.baseUrl}/party`);
      return Array.isArray(response.data) ? response.data : this.getFallbackCustomers();
    } catch (error) {
      console.warn('⚠️ Backend customers unavailable, using fallback data:', error);
      return this.getFallbackCustomers();
    }
  }

  /**
   * Get all consents with fallback data
   */
  async getConsents(): Promise<ConsentData[]> {
    try {
      if (this.useOfflineMode) {
        return this.getFallbackConsents();
      }
      
      const response = await apiClient.get(`${this.baseUrl}/consent`);
      return Array.isArray(response.data) ? response.data : this.getFallbackConsents();
    } catch (error) {
      console.warn('⚠️ Backend consents unavailable, using fallback data:', error);
      return this.getFallbackConsents();
    }
  }

  /**
   * Get all DSAR requests with fallback data
   */
  async getDSARRequests(): Promise<DSARRequest[]> {
    try {
      if (this.useOfflineMode) {
        return this.getFallbackDSARRequests();
      }
      
      const response = await apiClient.get(`${this.baseUrl}/dsar`);
      return Array.isArray(response.data) ? response.data : this.getFallbackDSARRequests();
    } catch (error) {
      console.warn('⚠️ Backend DSAR requests unavailable, using fallback data:', error);
      return this.getFallbackDSARRequests();
    }
  }

  /**
   * Get audit events with fallback data
   */
  async getAuditEvents(): Promise<AuditEvent[]> {
    try {
      if (this.useOfflineMode) {
        return this.getFallbackAuditEvents();
      }
      
      const response = await apiClient.get(`${this.baseUrl}/event`);
      return Array.isArray(response.data) ? response.data : this.getFallbackAuditEvents();
    } catch (error) {
      console.warn('⚠️ Backend audit events unavailable, using fallback data:', error);
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
      console.warn('⚠️ Backend communication preferences unavailable, using fallback data:', error);
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
      console.warn('⚠️ Backend guardian consent data unavailable, using fallback data:', error);
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
        description: "Request to access all personal data collected and processed",
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
        status: "completed",
        submittedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        description: "Request to delete marketing profile data and analytics cookies",
        requestorName: "Jane Smith",
        requestorEmail: "jane.smith@email.com",
        priority: "high",
        assignedTo: "Sarah Wilson",
        category: "Right to Erasure",
        legalBasis: "GDPR Article 17"
      },
      {
        id: "3",
        partyId: "3",
        customerId: "3",
        requestType: "data_portability",
        status: "pending",
        submittedAt: new Date(Date.now() - 86400000 * 28).toISOString(),
        description: "Request to export complete account data for transfer",
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
        description: "Request to update incorrect address and phone information",
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
        description: "Request to withdraw consent for location tracking",
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
        description: "Request for complete personal data report including third-party data",
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
        description: "Request to restrict processing of biometric data pending review",
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
        description: "Guardian request to access child's account data and consent history",
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
        description: "Request to correct employment information - insufficient documentation",
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
        description: "Objection to direct marketing processing based on legitimate interests",
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
}

export const csrDashboardService = new CSRDashboardService();
