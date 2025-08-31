import React, { useState, useEffect } from 'react';
import { 
  Search, 
  User, 
  Shield, 
  Check, 
  X, 
  Clock,
  RefreshCw,
  Edit,
  Eye,
  History,
  FileText,
  Calendar,
  ChevronDown,
  ChevronUp,
  Filter
} from 'lucide-react';
import { csrDashboardService, CustomerData, ConsentData } from '../../services/csrDashboardService';
import { websocketService } from '../../services/websocketService';
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

// Function to generate proper descriptions for consent purposes
const generateDescription = (purpose: string): string => {
  const descriptionMap: { [key: string]: string } = {
    'research': 'Allow us to use your data for research and analytics to improve our services and develop new features.',
    'dataprocessing': 'Consent for processing your personal data as part of our core services and business operations.',
    'dataProcessing': 'Consent for processing your personal data as part of our core services and business operations.',
    'marketing': 'Permission to send you marketing emails, promotional SMS messages, and other advertising communications.',
    'analytics': 'Allow collection and analysis of usage data to improve service performance and user experience.',
    'personalization': 'Customize content, recommendations, and services based on your preferences and behavior.',
    'communication': 'Send you important service updates, notifications, and customer service communications.',
    'advertising': 'Show you personalized advertisements and promotional content based on your interests.',
    'profiling': 'Create user profiles based on your data to provide personalized services and recommendations.',
    'thirdparty': 'Share your data with trusted third-party partners for enhanced services and integrations.',
    'thirdParty': 'Share your data with trusted third-party partners for enhanced services and integrations.',
    'cookies': 'Use cookies and similar tracking technologies to improve your browsing experience.',
    'location': 'Access and use your location data to provide location-based services and features.',
    'biometric': 'Process biometric data for identity verification and enhanced security features.',
    'financial': 'Process financial information for payment processing and financial services.',
    'health': 'Process health-related data for health services and wellness features.',
    'essential': 'Essential data processing required for service delivery and core functionality.',
    'email': 'Send you important emails and communications related to your account and services.',
    'sms': 'Send you SMS notifications and important updates about your account.',
    'push': 'Send push notifications to your devices for important updates and alerts.',
    'data_sharing': 'Share your data with authorized partners to provide enhanced services.'
  };

  const lowerPurpose = purpose.toLowerCase();
  return descriptionMap[lowerPurpose] || 
         `Permission for ${formatPurposeName(purpose).toLowerCase()} related data processing and services.`;
};

interface ConsentManagementProps {
  className?: string;
  customerId?: string;
}

const ConsentManagement: React.FC<ConsentManagementProps> = ({ 
  className = '', 
  customerId 
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState<string>(customerId || '');
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [consents, setConsents] = useState<ConsentData[]>([]);
  const [customerConsents, setCustomerConsents] = useState<ConsentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [purposeFilter, setPurposeFilter] = useState('all');
  const [expandedConsent, setExpandedConsent] = useState<string | null>(null);
  const [editingConsent, setEditingConsent] = useState<string | null>(null);
  const [updateNotes, setUpdateNotes] = useState<Record<string, string>>({});
  const [showHistory, setShowHistory] = useState(false);
  const [selectedCustomerInfo, setSelectedCustomerInfo] = useState<CustomerData | null>(null);

  // Load customers on component mount
  useEffect(() => {
    loadCustomers();
    loadAllConsents();
  }, []);

  // Load customer consents when a customer is selected
  useEffect(() => {
    if (selectedCustomer) {
      loadCustomerConsents();
      loadSelectedCustomerInfo();
    }
  }, [selectedCustomer]);

  // WebSocket real-time updates for consent changes
  useEffect(() => {
    console.log('🔌 ConsentManagement: Setting up WebSocket for real-time consent updates');
    
    // Join CSR dashboard for real-time updates
    websocketService.joinCSRDashboard();
    
    // Listen for consent updates
    const handleConsentUpdate = (event: any) => {
      console.log('📡 ConsentManagement: Received real-time consent update:', event);
      
      // Show notification
      const customerName = customers.find(c => c.id === event.consent.partyId)?.name || event.user.email;
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
      
      // Update the customer consents list
      if (selectedCustomer && (event.consent.partyId === selectedCustomer || event.consent.customerId === selectedCustomer)) {
        setCustomerConsents(prevConsents => {
          const updatedConsents = prevConsents.map(consent => {
            if (consent.id === event.consent.id) {
              return {
                ...consent,
                status: event.consent.status,
                updatedAt: event.timestamp,
                grantedAt: event.consent.status === 'granted' ? new Date().toISOString() : consent.grantedAt
              };
            }
            return consent;
          });
          
          return updatedConsents;
        });
      }
      
      // Update the all consents list
      setConsents(prevConsents => {
        const updatedConsents = prevConsents.map(consent => {
          if (consent.id === event.consent.id) {
            return {
              ...consent,
              status: event.consent.status,
              updatedAt: event.timestamp,
              grantedAt: event.consent.status === 'granted' ? new Date().toISOString() : consent.grantedAt
            };
          }
          return consent;
        });
        
        return updatedConsents;
      });
    };
    
    websocketService.onConsentUpdate(handleConsentUpdate);
    
    return () => {
      websocketService.offConsentUpdate();
    };
  }, [customers, selectedCustomer]);

  const loadCustomers = async () => {
    try {
      const customersData = await csrDashboardService.getCustomers();
      setCustomers(customersData);
      console.log('Loaded customers:', customersData.length);
    } catch (error) {
      console.error('Error loading customers:', error);
      setCustomers([]);
    }
  };

  const loadAllConsents = async () => {
    try {
      const consentsData = await csrDashboardService.getConsents();
      setConsents(consentsData);
      console.log('Loaded all consents:', consentsData.length);
    } catch (error) {
      console.error('Error loading consents:', error);
      setConsents([]);
    }
  };

  const loadCustomerConsents = async () => {
    if (!selectedCustomer) return;
    
    try {
      setLoading(true);
      // Filter consents for the selected customer
      const customerSpecificConsents = consents.filter(
        consent => consent.customerId === selectedCustomer || consent.partyId === selectedCustomer
      );
      setCustomerConsents(customerSpecificConsents);
      console.log(`Loaded ${customerSpecificConsents.length} consents for customer ${selectedCustomer}`);
    } catch (error) {
      console.error('Error loading customer consents:', error);
      setCustomerConsents([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedCustomerInfo = async () => {
    if (!selectedCustomer) return;
    
    const customerInfo = customers.find(c => c.id === selectedCustomer);
    setSelectedCustomerInfo(customerInfo || null);
  };

  const handleConsentUpdate = async (consentId: string, newStatus: 'granted' | 'revoked') => {
    try {
      setSaving(consentId);
      
      const notes = updateNotes[consentId] || '';
      console.log('Updating consent:', { consentId, newStatus, notes });

      // Use the CSR dashboard service to update consent
      await csrDashboardService.updateConsentStatus(consentId, newStatus, notes);
      
      // Update local state
      setCustomerConsents(prevConsents => 
        prevConsents.map(consent => 
          consent.id === consentId 
            ? { 
                ...consent, 
                status: newStatus,
                grantedAt: newStatus === 'granted' ? new Date().toISOString() : consent.grantedAt,
                deniedAt: newStatus === 'revoked' ? new Date().toISOString() : consent.deniedAt
              }
            : consent
        )
      );

      // Clear editing state
      setEditingConsent(null);
      setUpdateNotes(prev => ({ ...prev, [consentId]: '' }));

      console.log(`Consent ${consentId} updated to ${newStatus} successfully`);
      
    } catch (error) {
      console.error('Error updating consent:', error);
      alert('Failed to update consent. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = !searchTerm || 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    
    return matchesSearch;
  });

  const filteredConsents = customerConsents.filter(consent => {
    const matchesStatus = statusFilter === 'all' || consent.status === statusFilter;
    const matchesPurpose = purposeFilter === 'all' || consent.purpose.toLowerCase().includes(purposeFilter.toLowerCase());
    
    return matchesStatus && matchesPurpose;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      granted: { color: 'bg-green-100 text-green-800', icon: Check },
      revoked: { color: 'bg-red-100 text-red-800', icon: X },
      expired: { color: 'bg-gray-100 text-gray-800', icon: Clock }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.expired;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getConsentTypeIcon = (purpose: string) => {
    const lowerPurpose = purpose.toLowerCase();
    if (lowerPurpose.includes('marketing')) return <FileText className="w-4 h-4" />;
    if (lowerPurpose.includes('analytics')) return <Eye className="w-4 h-4" />;
    if (lowerPurpose.includes('communication')) return <User className="w-4 h-4" />;
    return <Shield className="w-4 h-4" />;
  };

  return (
    <div className={`bg-myslt-card rounded-xl shadow-lg border border-myslt-accent/20 ${className}`}>
      {/* Header */}
      <div className="border-b border-myslt-accent/20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="w-6 h-6 text-myslt-accent mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-myslt-text-primary">Consent Management</h2>
              <p className="text-sm text-myslt-text-secondary mt-1">
                Search customers and manage their consent records
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => { loadCustomers(); loadAllConsents(); }}
              className="px-4 py-2 bg-myslt-accent/10 text-myslt-accent rounded-lg hover:bg-myslt-accent/20 transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Customer Search Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-myslt-text-primary mb-4">Search Customer</h3>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-myslt-text-secondary" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-myslt-accent/30 rounded-lg focus:ring-2 focus:ring-myslt-accent focus:border-transparent bg-myslt-background"
              />
            </div>

            {/* Customer Selection */}
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-myslt-text-secondary" />
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-myslt-accent/30 rounded-lg focus:ring-2 focus:ring-myslt-accent focus:border-transparent bg-myslt-background appearance-none"
              >
                <option value="">Select a customer...</option>
                {filteredCustomers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.email}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-myslt-text-secondary pointer-events-none" />
            </div>
          </div>

          {/* Selected Customer Info */}
          {selectedCustomerInfo && (
            <div className="bg-myslt-background rounded-lg p-4 border border-myslt-accent/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-myslt-accent mr-3" />
                  <div>
                    <h4 className="font-semibold text-myslt-text-primary">{selectedCustomerInfo.name}</h4>
                    <p className="text-sm text-myslt-text-secondary">{selectedCustomerInfo.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-myslt-text-secondary">
                  <span>Phone: {selectedCustomerInfo.phone}</span>
                  <span>Customer Since: {new Date(selectedCustomerInfo.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center">
                    <Shield className="w-4 h-4 mr-1" />
                    {filteredConsents.length} Consents
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Consent Management Section */}
        {selectedCustomer && (
          <>
            {/* Filters */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-myslt-text-primary mb-4">Customer Consents</h3>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center">
                  <Filter className="w-4 h-4 text-myslt-text-secondary mr-2" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-myslt-accent/30 rounded-lg bg-myslt-background text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="granted">Granted</option>
                    <option value="revoked">Revoked</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <FileText className="w-4 h-4 text-myslt-text-secondary mr-2" />
                  <select
                    value={purposeFilter}
                    onChange={(e) => setPurposeFilter(e.target.value)}
                    className="px-3 py-2 border border-myslt-accent/30 rounded-lg bg-myslt-background text-sm"
                  >
                    <option value="all">All Purposes</option>
                    <option value="marketing">Marketing Communications</option>
                    <option value="analytics">Analytics & Performance</option>
                    <option value="communication">Communication Services</option>
                    <option value="personalization">Personalization Services</option>
                    <option value="research">Research & Analytics</option>
                    <option value="dataProcessing">Data Processing</option>
                    <option value="essential">Essential Services</option>
                  </select>
                </div>

                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="px-4 py-2 bg-myslt-accent/10 text-myslt-accent rounded-lg hover:bg-myslt-accent/20 transition-colors flex items-center text-sm"
                >
                  <History className="w-4 h-4 mr-2" />
                  {showHistory ? 'Hide History' : 'Show History'}
                </button>
              </div>
            </div>

            {/* Consents List */}
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-myslt-accent" />
                <p className="text-myslt-text-secondary">Loading consents...</p>
              </div>
            ) : filteredConsents.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 mx-auto mb-4 text-myslt-text-muted" />
                <h3 className="text-lg font-semibold text-myslt-text-secondary mb-2">No Consents Found</h3>
                <p className="text-myslt-text-muted">
                  {selectedCustomer ? 'This customer has no consent records matching your filters.' : 'Select a customer to view their consents.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredConsents.map(consent => (
                  <div 
                    key={consent.id}
                    className="border border-myslt-accent/20 rounded-lg bg-myslt-background hover:shadow-md transition-shadow"
                  >
                    {/* Consent Header */}
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getConsentTypeIcon(consent.purpose)}
                          <div>
                            <h4 className="font-semibold text-myslt-text-primary">{formatPurposeName(consent.purpose)}</h4>
                            <p className="text-sm text-myslt-text-secondary">{consent.description || generateDescription(consent.purpose)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(consent.status)}
                          
                          <button
                            onClick={() => setExpandedConsent(expandedConsent === consent.id ? null : consent.id)}
                            className="p-2 rounded-lg hover:bg-myslt-accent/10 text-myslt-text-secondary hover:text-myslt-accent transition-colors"
                          >
                            {expandedConsent === consent.id ? 
                              <ChevronUp className="w-4 h-4" /> : 
                              <ChevronDown className="w-4 h-4" />
                            }
                          </button>
                        </div>
                      </div>

                      {/* Quick Info */}
                      <div className="mt-3 flex items-center space-x-6 text-sm text-myslt-text-secondary">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {consent.grantedAt ? `Granted: ${new Date(consent.grantedAt).toLocaleDateString()}` : 
                           consent.deniedAt ? `Revoked: ${new Date(consent.deniedAt).toLocaleDateString()}` : 
                           'No date available'}
                        </span>
                        <span>Source: {consent.source}</span>
                        <span>Basis: {consent.lawfulBasis}</span>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedConsent === consent.id && (
                      <div className="border-t border-myslt-accent/20 p-4 bg-myslt-card/50">
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Consent Details */}
                          <div>
                            <h5 className="font-semibold text-myslt-text-primary mb-3">Consent Details</h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-myslt-text-secondary">Type:</span>
                                <span className="text-myslt-text-primary">{consent.type}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-myslt-text-secondary">Category:</span>
                                <span className="text-myslt-text-primary">{consent.category || 'General'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-myslt-text-secondary">Lawful Basis:</span>
                                <span className="text-myslt-text-primary">{consent.lawfulBasis}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-myslt-text-secondary">Source:</span>
                                <span className="text-myslt-text-primary">{consent.source}</span>
                              </div>
                              {consent.expiresAt && (
                                <div className="flex justify-between">
                                  <span className="text-myslt-text-secondary">Expires:</span>
                                  <span className="text-myslt-text-primary">{new Date(consent.expiresAt).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Update Actions */}
                          <div>
                            <h5 className="font-semibold text-myslt-text-primary mb-3">Update Consent</h5>
                            
                            {editingConsent === consent.id ? (
                              <div className="space-y-3">
                                <textarea
                                  placeholder="Add notes for this update..."
                                  value={updateNotes[consent.id] || ''}
                                  onChange={(e) => setUpdateNotes(prev => ({ ...prev, [consent.id]: e.target.value }))}
                                  className="w-full px-3 py-2 border border-myslt-accent/30 rounded-lg bg-myslt-background text-sm"
                                  rows={3}
                                />
                                
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleConsentUpdate(consent.id, 'granted')}
                                    disabled={saving === consent.id}
                                    className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center text-sm disabled:opacity-50"
                                  >
                                    {saving === consent.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1" />Grant</>}
                                  </button>
                                  
                                  <button
                                    onClick={() => handleConsentUpdate(consent.id, 'revoked')}
                                    disabled={saving === consent.id}
                                    className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center text-sm disabled:opacity-50"
                                  >
                                    {saving === consent.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4 mr-1" />Revoke</>}
                                  </button>
                                </div>
                                
                                <button
                                  onClick={() => setEditingConsent(null)}
                                  className="w-full px-3 py-2 bg-myslt-accent/10 text-myslt-accent rounded-lg hover:bg-myslt-accent/20 transition-colors text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setEditingConsent(consent.id)}
                                className="w-full px-4 py-2 bg-myslt-accent text-white rounded-lg hover:bg-myslt-accent/90 transition-colors flex items-center justify-center"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Update Consent
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ConsentManagement;
