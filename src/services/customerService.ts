// TMF632 Privacy Management & TMF641 Party Management API service

interface ConsentPreference {
  dataProcessing: boolean;
  marketing: boolean;
  analytics: boolean;
  thirdPartySharing: boolean;
  location: boolean;
}

interface ConsentHistory {
  id: string;
  action: string;
  category: string;
  timestamp: string;
  details: string;
}

interface DataSubjectRequest {
  requestType: 'access' | 'correction' | 'deletion' | 'portability';
  description: string;
}

class CustomerService {
  private baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';

  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // TMF632 - Get customer's consent preferences
  async getConsentPreferences(customerId: string): Promise<ConsentPreference> {
    const response = await fetch(
      `${this.baseUrl}/tmf-api/partyPrivacyManagement/v4/privacyConsent?partyId=${customerId}`,
      {
        headers: this.getAuthHeaders()
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch consent preferences');
    }

    const data = await response.json();
    return data.preferences;
  }

  // Update customer's consent preferences
  async updateConsentPreferences(
    customerId: string, 
    preferences: Partial<ConsentPreference>
  ): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/tmf-api/customerManagement/v4/customer/${customerId}/consent-preferences`,
      {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(preferences)
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update consent preferences');
    }
  }

  // Get customer's consent history
  async getConsentHistory(customerId: string): Promise<ConsentHistory[]> {
    const response = await fetch(
      `${this.baseUrl}/tmf-api/customerManagement/v4/customer/${customerId}/consent-history`,
      {
        headers: this.getAuthHeaders()
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch consent history');
    }

    const data = await response.json();
    return data.history;
  }

  // Get data usage information
  async getDataUsageInfo(customerId: string): Promise<any[]> {
    const response = await fetch(
      `${this.baseUrl}/tmf-api/customerManagement/v4/customer/${customerId}/data-usage-info`,
      {
        headers: this.getAuthHeaders()
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch data usage information');
    }

    const data = await response.json();
    return data.dataUsage;
  }

  // Submit data subject request
  async submitDataSubjectRequest(
    customerId: string, 
    request: DataSubjectRequest
  ): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/tmf-api/customerManagement/v4/customer/${customerId}/data-subject-request`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      }
    );

    if (!response.ok) {
      throw new Error('Failed to submit data subject request');
    }
  }

  // Get customer's agreements
  async getCustomerAgreements(customerId: string): Promise<any[]> {
    const response = await fetch(
      `${this.baseUrl}/tmf-api/agreementManagement/v4/agreement/customer/${customerId}`,
      {
        headers: this.getAuthHeaders()
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch customer agreements');
    }

    const data = await response.json();
    return data.agreements;
  }

  // Update agreement status (customer can approve/reject)
  async updateAgreementStatus(
    customerId: string, 
    agreementId: string, 
    status: 'approved' | 'rejected'
  ): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/tmf-api/agreementManagement/v4/agreement/customer/${customerId}/${agreementId}/status`,
      {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update agreement status');
    }
  }

  // Export customer data (PDPA compliance)
  async exportCustomerData(customerId: string): Promise<Blob> {
    const response = await fetch(
      `${this.baseUrl}/api/customer-portal/${customerId}/export-data`,
      {
        headers: this.getAuthHeaders()
      }
    );

    if (!response.ok) {
      throw new Error('Failed to export customer data');
    }

    return response.blob();
  }

  // Get customer audit trail
  async getCustomerAuditTrail(customerId: string): Promise<any[]> {
    const response = await fetch(
      `${this.baseUrl}/tmf-api/eventManagement/v4/event/customer/${customerId}`,
      {
        headers: this.getAuthHeaders()
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch audit trail');
    }

    const data = await response.json();
    return data.events;
  }
}

export const customerService = new CustomerService();
