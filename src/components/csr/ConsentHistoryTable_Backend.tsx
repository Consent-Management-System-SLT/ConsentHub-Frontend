import React, { useState, useEffect } from 'react';
import { FileText, Eye, Clock, RefreshCw, History, Calendar, User, AlertCircle } from 'lucide-react';
import { csrDashboardService } from '../../services/csrDashboardService';
import { websocketService, ConsentUpdateEvent } from '../../services/websocketService';
import WebSocketStatus from '../shared/WebSocketStatus';
import { notificationManager } from '../shared/NotificationContainer';

// Function to format consent purpose names properly
const formatPurposeName = (purpose: string): string => {
  if (!purpose) return 'Unknown Purpose';
  
  const purposeMap: { [key: string]: string } = {
    'research': 'Research & Analytics',
    'dataprocessing': 'Data Processing',
    'dataProcessing': 'Data Processing',
    'marketing': 'Marketing Communications',
    'analytics': 'Analytics & Performance',
    'personalization': 'Personalization Services',
    'communication': 'Communication Services',
    'advertising': 'Advertising & Promotions',
    'profiling': 'User Profiling',
    'thirdparty': 'Third Party Sharing',
    'thirdParty': 'Third Party Sharing',
    'cookies': 'Cookies & Tracking',
    'location': 'Location Services',
    'biometric': 'Biometric Data Processing',
    'financial': 'Financial Services',
    'health': 'Health Data Processing',
    'essential': 'Essential Services',
    'email': 'Email Communications',
    'sms': 'SMS Communications',
    'push': 'Push Notifications',
    'data_sharing': 'Data Sharing'
  };

  // If we have a mapping, use it
  const lowerPurpose = purpose.toLowerCase();
  if (purposeMap[lowerPurpose]) {
    return purposeMap[lowerPurpose];
  }

  // Otherwise, format camelCase or snake_case properly
  return purpose
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/\b\w/g, l => l.toUpperCase()) // Capitalize first letter of each word
    .trim();
};

// Function to generate consent descriptions
const generateDescription = (purpose: string): string => {
  if (!purpose) return 'No description available';
  
  const descriptions: { [key: string]: string } = {
    'research': 'Permission to use your data for research and analytical purposes to improve our services',
    'dataprocessing': 'Consent for processing your personal data for business operations and service delivery', 
    'dataProcessing': 'Consent for processing your personal data for business operations and service delivery',
    'marketing': 'Authorization to send you marketing communications and promotional materials',
    'analytics': 'Consent to use your data for analytics and business intelligence purposes',
    'personalization': 'Permission to personalize your experience and customize content for you',
    'communication': 'Consent to communicate with you about our services and updates',
    'advertising': 'Authorization to show you relevant advertisements and promotional content',
    'profiling': 'Consent to create user profiles for better service delivery',
    'thirdparty': 'Permission to share your data with trusted third-party partners',
    'thirdParty': 'Permission to share your data with trusted third-party partners',
    'cookies': 'Consent to use cookies and similar tracking technologies',
    'location': 'Permission to access and use your location information',
    'biometric': 'Consent for processing biometric data for identification purposes',
    'financial': 'Authorization to process financial information for payment services',
    'health': 'Consent for processing health-related data for medical services',
    'essential': 'Required consent for essential service functionality',
    'email': 'Permission to send you email communications',
    'sms': 'Authorization to send you SMS messages',
    'push': 'Consent to send you push notifications',
    'data_sharing': 'Permission to share your data as outlined in our privacy policy'
  };

  const lowerPurpose = purpose.toLowerCase();
  return descriptions[lowerPurpose] || descriptions[purpose] || 'Consent for data processing activities related to this purpose';
};

interface ConsentHistoryTableProps {
  className?: string;
  customerId?: string;
}

const ConsentHistoryTable: React.FC<ConsentHistoryTableProps> = ({ 
  className = '', 
  customerId 
}) => {
  const [consents, setConsents] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedConsent, setSelectedConsent] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      // Reset the success state after 2 seconds
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback method for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed: ', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  useEffect(() => {
    loadConsentsAndCustomers();
  }, [customerId]);

  // WebSocket real-time updates
  useEffect(() => {
    console.log('🔌 Setting up WebSocket for real-time consent updates');
    
    // Join CSR dashboard for real-time updates
    websocketService.joinCSRDashboard();
    
    // Listen for consent updates
    const handleConsentUpdate = (event: ConsentUpdateEvent) => {
      console.log('📡 Received real-time consent update:', event);
      
      // Show notification
      const customerName = getCustomerName(event.consent.partyId || event.consent.userId) || event.user.email;
      const purposeName = formatPurposeName(event.consent.purpose);
      
      if (event.type === 'granted') {
        notificationManager.success(
          'Consent Granted',
          `${customerName} granted consent for ${purposeName}`
        );
      } else {
        notificationManager.warning(
          'Consent Revoked',
          `${customerName} revoked consent for ${purposeName}`
        );
      }
      
      // Update the consents list with the updated consent
      setConsents(prevConsents => {
        const updatedConsents = prevConsents.map(consent => {
          if (consent.id === event.consent.id) {
            return {
              ...consent,
              ...event.consent,
              updatedAt: event.timestamp
            };
          }
          return consent;
        });
        
        // If we didn't find the consent in the list, add it (new consent)
        const found = prevConsents.some(c => c.id === event.consent.id);
        if (!found) {
          updatedConsents.push(event.consent);
        }
        
        return updatedConsents.sort((a, b) => 
          new Date(b.updatedAt || b.createdAt).getTime() - 
          new Date(a.updatedAt || a.createdAt).getTime()
        );
      });
      
      // Update last updated timestamp
      setLastUpdated(new Date());
    };
    
    websocketService.onConsentUpdate(handleConsentUpdate);
    
    // Cleanup on unmount
    return () => {
      console.log('🔌 Cleaning up WebSocket listeners');
      websocketService.offConsentUpdate();
      websocketService.leaveCSRDashboard();
    };
  }, []);

  // Auto-refresh every 30 seconds as fallback (reduced frequency since we have real-time updates)
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      // Only do full refresh if WebSocket is not connected
      if (!websocketService.isConnected()) {
        console.log('📡 WebSocket disconnected, falling back to polling');
        loadConsentsAndCustomers();
      }
    }, 30000); // Reduced to 30 seconds since we have real-time updates

    return () => clearInterval(interval);
  }, [autoRefresh, customerId]);

  const handleManualRefresh = async () => {
    await loadConsentsAndCustomers();
  };

  const loadConsentsAndCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load both consents and customers
      const [consentArray, customerArray] = await Promise.all([
        csrDashboardService.getConsents(),
        csrDashboardService.getCustomers()
      ]);
      
      // Filter by customer ID if provided
      let filteredConsents = consentArray;
      if (customerId) {
        filteredConsents = consentArray.filter(consent => consent.customerId === customerId);
      }
      
      console.log('=== CONSENT HISTORY DEBUG ===');
      console.log('Total consents loaded:', consentArray.length);
      console.log('Total customers loaded:', customerArray.length);
      console.log('Filtered consents:', filteredConsents.length);
      
      // Debug: Show first few consent records to understand data structure
      console.log('First 3 consents:', consentArray.slice(0, 3));
      console.log('First 3 customers:', customerArray.slice(0, 3));
      
      // Debug: Look for Ojitha specifically
      const ojithaCustomer = customerArray.find(c => 
        c.email?.toLowerCase().includes('ojitharajapaksha') || 
        c.name?.toLowerCase().includes('ojitha') ||
        c.id?.includes('68ae007022c61b8784d852ea')
      );
      if (ojithaCustomer) {
        console.log('Found Ojitha customer:', ojithaCustomer);
        const ojithaConsents = consentArray.filter(c => 
          c.partyId === ojithaCustomer.id || 
          c.customerId === ojithaCustomer.id
        );
        console.log('Ojitha consents found:', ojithaConsents.length, ojithaConsents);
      } else {
        console.log('Ojitha customer not found. Available customers:', 
          customerArray.slice(0, 10).map(c => ({ id: c.id, name: c.name, email: c.email }))
        );
      }
      
      // Debug: Look for ojitharajapaksha email in consent metadata
      const ojithaConsentsInData = consentArray.filter(c => 
        (c as any).metadata?.customerEmail?.includes('ojitharajapaksha') ||
        c.partyId === '68ae007022c61b8784d852ea' ||
        c.customerId === '68ae007022c61b8784d852ea'
      );
      console.log('Ojitha consents by metadata/ID:', ojithaConsentsInData.length, ojithaConsentsInData);
      
      // Show consent-customer mapping
      const consentCustomerMapping = filteredConsents.map(c => ({
        consentId: c.id,
        partyId: c.partyId,
        customerId: c.customerId,
        customerFound: customerArray.find(customer => customer.id === c.partyId),
        purpose: c.purpose,
        status: c.status
      }));
      console.log('Consent-Customer mapping (first 10):', consentCustomerMapping.slice(0, 10));
      
      // Show recent consent updates (last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentConsents = consentArray.filter(c => {
        const lastModified = new Date((c as any).lastModified || (c as any).updatedAt || (c as any).createdAt);
        return lastModified > fiveMinutesAgo;
      });
      console.log('Recent consent updates (last 5 min):', recentConsents.length, recentConsents);
      
      console.log('=== END DEBUG ===');
      
      setConsents(filteredConsents);
      setCustomers(customerArray);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error loading consents and customers:', err);
      setError('Failed to load consent history. Please try again.');
      setConsents([]);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const getCustomerName = (partyId: string): string => {
    const customer = customers.find(c => c.id === partyId);
    return customer ? customer.name : `Customer ${partyId}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'granted':
        return 'bg-green-100 text-green-800';
      case 'revoked':
        return 'bg-red-100 text-red-800';
      case 'denied':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-myslt-service-card text-myslt-text-secondary';
      default:
        return 'bg-myslt-service-card text-myslt-text-secondary';
    }
  };

  const handleViewDetails = (consent: any) => {
    setSelectedConsent(consent);
    setShowModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={`bg-myslt-card-solid rounded-lg shadow-lg ${className}`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-indigo-600" />
            <div>
              <h2 className="text-xl font-semibold text-myslt-text-primary">Consent History</h2>
              <p className="text-sm text-myslt-text-secondary">View and manage customer consent records</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-myslt-text-secondary">Loading consent history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-myslt-card-solid rounded-lg shadow-lg ${className}`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-indigo-600" />
            <div>
              <h2 className="text-xl font-semibold text-myslt-text-primary">Consent History</h2>
              <p className="text-sm text-myslt-text-secondary">View and manage customer consent records</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <button 
              onClick={loadConsentsAndCustomers}
              className="ml-auto px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-myslt-card-solid rounded-lg shadow-lg ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <History className="w-6 h-6 text-indigo-600" />
            <div>
              <h2 className="text-xl font-semibold text-myslt-text-primary">Consent History & Audit Trail</h2>
              <p className="text-sm text-myslt-text-secondary">
                {customerId ? `Showing consent history for customer: ${getCustomerName(customerId)}` : 'Real-time tracking of all customer consent changes'}
              </p>
              <div className="flex items-center space-x-4 text-xs text-myslt-text-muted mt-1">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>{autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}</span>
                </span>
                <WebSocketStatus />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                autoRefresh 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                  : 'bg-red-100 text-red-800 hover:bg-red-200'
              }`}
            >
              {autoRefresh ? 'Auto ON' : 'Auto OFF'}
            </button>
            <button
              onClick={loadConsentsAndCustomers}
              disabled={loading}
              className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {consents && consents.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-myslt-text-secondary">No consent records found.</p>
          <p className="text-sm text-gray-500 mt-1">
            {customerId ? 'This customer has no consent records.' : 'No consent records exist in the system.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-myslt-service-card">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Consent Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Modified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Channel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  View Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-myslt-card-solid divide-y divide-myslt-accent/20">
              {Array.isArray(consents) && consents.map((consent) => (
                <tr key={consent.id} className="hover:bg-myslt-service-card">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-myslt-text-primary">
                      {getCustomerName(consent.partyId)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-myslt-text-primary">{formatPurposeName(consent.purpose)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(consent.status)}`}>
                      {consent.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-myslt-text-primary">
                      {formatDate(consent.lastModified || consent.updatedAt || consent.createdAt)}
                    </div>
                    <div className="text-xs text-myslt-text-muted">
                      {new Date(consent.lastModified || consent.updatedAt || consent.createdAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-myslt-text-primary">{consent.channel || 'All Channels'}</div>
                    <div className="text-xs text-myslt-text-muted">{consent.consentType || 'Standard'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(consent)}
                      className="text-indigo-600 hover:text-indigo-900 flex items-center space-x-1"
                      title="View Full History"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-xs">View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for viewing consent details */}
      {showModal && selectedConsent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-myslt-card-solid rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-myslt-text-primary flex items-center">
                  <FileText className="w-6 h-6 mr-2" />
                  Consent Details
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-myslt-text-secondary transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* Customer & Status - Full Width */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-myslt-service-card p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Customer</label>
                        <p className="mt-1 text-lg text-myslt-text-primary font-semibold">
                          {getCustomerName(selectedConsent.partyId)}
                        </p>
                      </div>
                      <div className="text-right">
                        <label className="block text-sm font-medium text-gray-700">Current Status</label>
                        <span className={`inline-flex px-4 py-2 rounded-full text-sm font-medium mt-1 ${getStatusColor(selectedConsent.status)}`}>
                          {selectedConsent.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Purpose - Full Width */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Purpose</label>
                  <div className="mt-1 bg-myslt-service-card p-3 rounded-lg">
                    <p className="text-lg text-myslt-text-primary font-medium">{formatPurposeName(selectedConsent.purpose)}</p>
                    <p className="text-sm text-myslt-text-muted mt-1">{generateDescription(selectedConsent.purpose)}</p>
                  </div>
                </div>

                {/* Consent ID - Full Width with Copy */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Consent ID</label>
                  <div className="mt-1 bg-slate-100 border border-slate-300 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-800 font-mono break-all pr-4 font-semibold">{selectedConsent.id}</p>
                      <button 
                        onClick={() => handleCopyToClipboard(selectedConsent.id)}
                        className={`flex-shrink-0 px-3 py-1 text-white text-xs rounded transition-all duration-200 ${
                          copySuccess 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                        title={copySuccess ? "Copied!" : "Copy ID"}
                      >
                        {copySuccess ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Timeline Information */}
                <div className="border-t pt-6">
                  <h4 className="text-md font-medium text-myslt-text-primary mb-4 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Timeline & History
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-myslt-service-card p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Created Date</label>
                          <p className="mt-1 text-sm text-myslt-text-primary">{formatDate(selectedConsent.createdAt)}</p>
                          <p className="text-xs text-myslt-text-muted">
                            {new Date(selectedConsent.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <label className="block text-sm font-medium text-gray-700">Last Modified</label>
                          <p className="mt-1 text-sm text-myslt-text-primary">
                            {formatDate(selectedConsent.lastModified || selectedConsent.updatedAt || selectedConsent.createdAt)}
                          </p>
                          <p className="text-xs text-myslt-text-muted">
                            {new Date(selectedConsent.lastModified || selectedConsent.updatedAt || selectedConsent.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Technical Details */}
                <div className="border-t pt-6">
                  <h4 className="text-md font-medium text-myslt-text-primary mb-4">Technical Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Channel</label>
                      <p className="mt-1 text-sm text-myslt-text-primary">{selectedConsent.channel || 'All Channels'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Consent Type</label>
                      <p className="mt-1 text-sm text-myslt-text-primary">{selectedConsent.consentType || 'Standard'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Legal Basis</label>
                      <p className="mt-1 text-sm text-myslt-text-primary">{selectedConsent.lawfulBasis || 'Consent'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Source</label>
                      <p className="mt-1 text-sm text-myslt-text-primary">{selectedConsent.source || 'Customer Portal'}</p>
                    </div>
                  </div>
                </div>

                {selectedConsent.description && (
                  <div className="border-t pt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <div className="bg-myslt-service-card p-4 rounded-lg">
                      <p className="text-sm text-myslt-text-primary">{selectedConsent.description}</p>
                    </div>
                  </div>
                )}

                {/* Validity Period */}
                {selectedConsent.validFor && (
                  <div className="border-t pt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Validity Period</label>
                    <div className="bg-myslt-service-card p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium">Valid From:</span>
                          <p className="text-sm text-myslt-text-primary">{formatDate(selectedConsent.validFor.startDateTime)}</p>
                        </div>
                        {selectedConsent.validFor.endDateTime && (
                          <div>
                            <span className="text-sm font-medium">Valid Until:</span>
                            <p className="text-sm text-myslt-text-primary">{formatDate(selectedConsent.validFor.endDateTime)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Note about management */}
                <div className="border-t pt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <User className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Need to modify this consent?</p>
                        <p className="text-sm text-blue-700 mt-1">
                          Use the <strong>Consent Management</strong> page to grant, revoke, or update customer consents. 
                          This page is for viewing historical records only.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsentHistoryTable;
