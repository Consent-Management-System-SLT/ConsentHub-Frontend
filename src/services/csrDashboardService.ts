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
}

export interface CustomerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  type: string;
  createdAt: string;
  address: string;
  dateOfBirth: string;
  customerSince?: string;
  riskLevel?: string;
  totalConsents?: number;
  activeConsents?: number;
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
      totalCustomers: 10,
      pendingRequests: 4,
      consentUpdates: 8,
      guardiansManaged: 2,
      todayActions: 15,
      riskAlerts: 2,
      consentRate: 78,
      resolvedRequests: 8,
      newCustomers: 3
    };
  }

  private getFallbackCustomers(): CustomerData[] {
    return [
      {
        id: "1",
        name: "John Doe",
        email: "john.doe@email.com",
        phone: "+94771234567",
        status: "active",
        type: "individual",
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        address: "123 Main St, Colombo 03",
        dateOfBirth: "1985-06-15",
        customerSince: "2023-01-15",
        riskLevel: "low",
        totalConsents: 8,
        activeConsents: 6
      },
      {
        id: "2",
        name: "Jane Smith",
        email: "jane.smith@email.com",
        phone: "+94771234568",
        status: "active",
        type: "individual",
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        address: "456 Oak Ave, Kandy",
        dateOfBirth: "1992-03-22",
        customerSince: "2023-03-10",
        riskLevel: "medium",
        totalConsents: 12,
        activeConsents: 10
      },
      {
        id: "3",
        name: "Robert Johnson",
        email: "robert.j@email.com",
        phone: "+94771234569",
        status: "active",
        type: "guardian",
        createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        address: "789 Pine Rd, Galle",
        dateOfBirth: "1978-11-08",
        customerSince: "2022-12-05",
        riskLevel: "low",
        totalConsents: 15,
        activeConsents: 12
      },
      {
        id: "4",
        name: "Emily Davis",
        email: "emily.davis@email.com",
        phone: "+94771234570",
        status: "inactive",
        type: "individual",
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        address: "321 Elm St, Matara",
        dateOfBirth: "1995-09-12",
        customerSince: "2024-01-20",
        riskLevel: "high",
        totalConsents: 5,
        activeConsents: 2
      },
      {
        id: "5",
        name: "Michael Chen",
        email: "michael.chen@email.com",
        phone: "+94771234571",
        status: "active",
        type: "individual",
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        address: "555 Tech Park, Colombo 07",
        dateOfBirth: "1990-05-18",
        customerSince: "2024-07-20",
        riskLevel: "low",
        totalConsents: 6,
        activeConsents: 6
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
        createdAt: new Date().toISOString(),
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
        createdAt: new Date().toISOString(),
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
      }
    ];
  }
}

export const csrDashboardService = new CSRDashboardService();
