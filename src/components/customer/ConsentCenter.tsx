import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Eye,
  Search,
  Filter,
  Calendar,
  MapPin,
  Tag,
  RefreshCw
} from 'lucide-react';
import { customerApiClient } from '../../services/customerApiClient';
import { useNotifications } from '../../contexts/NotificationContext';

interface Consent {
  id: string;
  purpose: string;
  status: 'granted' | 'revoked' | 'expired' | 'pending';
  channel: string;
  validFrom: string;
  validUntil?: string;
  description: string;
  category: string;
  jurisdiction: string;
  lastUpdated: string;
  grantedBy: string;
}

interface ConsentCenterProps {
  onBack?: () => void;
}

const ConsentCenter: React.FC<ConsentCenterProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedConsent, setSelectedConsent] = useState<Consent | null>(null);
  const [consents, setConsents] = useState<Consent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  // Add notification functionality
  const { addNotification } = useNotifications();

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

  // Function to format category names
  const formatCategoryName = (category: string): string => {
    if (!category) return 'General';
    
    const categoryMap: { [key: string]: string } = {
      'marketing': 'Marketing',
      'analytics': 'Analytics',
      'essential': 'Essential',
      'enhancement': 'Enhancement',
      'research': 'Research',
      'communication': 'Communication',
      'privacy': 'Privacy',
      'security': 'Security'
    };

    const lowerCategory = category.toLowerCase();
    if (categoryMap[lowerCategory]) {
      return categoryMap[lowerCategory];
    }

    return category
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
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

  // Load consents on component mount
  useEffect(() => {
    loadConsents();
  }, []);

  const loadConsents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading customer consents...');
      const response = await customerApiClient.getConsents();
      
      // Transform backend data to match UI format
      const transformedConsents: Consent[] = response.data?.consents ? 
        response.data.consents.map((consent: any) => ({
          id: consent.id || consent._id,
          purpose: formatPurposeName(consent.purpose || consent.type || 'Unknown Purpose'),
          status: consent.status || 'pending',
          channel: consent.channel || 'Email, SMS',
          validFrom: consent.grantedDate || consent.createdAt || new Date().toISOString(),
          validUntil: consent.expiryDate || consent.validUntil,
          description: consent.description || generateDescription(consent.purpose || consent.type || 'unknown'),
          category: consent.categories ? consent.categories.join(', ') : formatCategoryName(consent.category || 'General'),
          jurisdiction: consent.jurisdiction || 'LK',
          lastUpdated: consent.lastModified || consent.updatedAt || new Date().toISOString(),
          grantedBy: consent.partyId || consent.userId || 'System'
        })) : [];

      console.log('Loaded consents:', transformedConsents);
      setConsents(transformedConsents);
      
    } catch (err: any) {
      console.error('Error loading consents:', err);
      setError(err.message || 'Failed to load consents');
      
      // Load some demo data for testing
      setConsents([
        {
          id: 'consent-1',
          purpose: 'Marketing Communications',
          status: 'granted',
          channel: 'Email, SMS',
          validFrom: new Date(Date.now() - 86400000 * 30).toISOString(),
          validUntil: new Date(Date.now() + 86400000 * 365).toISOString(),
          description: 'Permission to send you marketing emails, promotional SMS messages, and other advertising communications.',
          category: 'Marketing',
          jurisdiction: 'LK',
          lastUpdated: new Date(Date.now() - 86400000 * 5).toISOString(),
          grantedBy: 'customer'
        },
        {
          id: 'consent-2',
          purpose: 'Research & Analytics',
          status: 'granted',
          channel: 'Website, App',
          validFrom: new Date(Date.now() - 86400000 * 60).toISOString(),
          description: 'Allow us to use your data for research and analytics to improve our services and develop new features.',
          category: 'Analytics',
          jurisdiction: 'LK',
          lastUpdated: new Date(Date.now() - 86400000 * 10).toISOString(),
          grantedBy: 'customer'
        },
        {
          id: 'consent-3',
          purpose: 'Data Processing',
          status: 'revoked',
          channel: 'Website, App',
          validFrom: new Date(Date.now() - 86400000 * 90).toISOString(),
          description: 'Consent for processing your personal data as part of our core services and business operations.',
          category: 'General',
          jurisdiction: 'LK',
          lastUpdated: new Date(Date.now() - 86400000 * 2).toISOString(),
          grantedBy: 'customer'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-myslt-accent mr-3" />
        <span className="text-myslt-text-secondary">Loading consents...</span>
      </div>
    );
  }

  const filteredConsents = consents.filter(consent => {
    const matchesSearch = consent.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consent.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || consent.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || consent.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'granted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'revoked':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'expired':
        return <Clock className="w-5 h-5 text-gray-600" />;
      case 'pending':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Shield className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'granted':
        return 'bg-myslt-success/10 text-myslt-success border-myslt-success/20';
      case 'revoked':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expired':
        return 'bg-myslt-service-card text-myslt-text-muted border-myslt-accent/30';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-myslt-service-card text-myslt-text-muted border-myslt-accent/30';
    }
  };

  const handleConsentAction = async (consentId: string, action: 'revoke' | 'grant') => {
    try {
      setUpdating(consentId);
      console.log(`${action} consent ${consentId}`);
      
      // Find the consent being modified
      const consent = consents.find(c => c.id === consentId);
      
      // Call the appropriate backend API method
      if (action === 'revoke') {
        await customerApiClient.revokeConsent(consentId, 'Customer requested revocation');
      } else if (action === 'grant') {
        await customerApiClient.grantConsent({ 
          consentId, 
          status: 'granted',
          grantedAt: new Date().toISOString(),
          notes: 'Customer granted consent'
        });
      }
      
      // Update local state
      setConsents(prevConsents => 
        prevConsents.map(c => 
          c.id === consentId 
            ? { 
                ...c, 
                status: action === 'revoke' ? 'revoked' : 'granted',
                lastUpdated: new Date().toISOString()
              }
            : c
        )
      );
      
      // Add notification
      addNotification({
        title: `Consent ${action === 'revoke' ? 'Revoked' : 'Granted'}`,
        message: `You have successfully ${action}d consent for "${consent?.purpose || 'unknown purpose'}"`,
        type: 'consent',
        category: action === 'revoke' ? 'warning' : 'success',
        metadata: {
          consentId,
          action,
          purpose: consent?.purpose
        }
      });
      
      console.log(`Consent ${consentId} ${action}d successfully`);
      
    } catch (error: any) {
      console.error(`Failed to ${action} consent:`, error);
      addNotification({
        title: `Consent ${action === 'revoke' ? 'Revocation' : 'Grant'} Failed`,
        message: `Failed to ${action} consent. Please try again.`,
        type: 'system',
        category: 'warning'
      });
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-myslt-card rounded-xl shadow-lg border border-myslt-accent/20 mb-6">
        <div className="p-6 border-b border-myslt-accent/20 bg-myslt-gradient text-white rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Consent Center</h1>
                <p className="text-blue-100">Manage your data processing consents</p>
              </div>
            </div>
            <button
              onClick={loadConsents}
              disabled={loading}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-myslt-text-secondary" />
                <input
                  type="text"
                  placeholder="Search consents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-myslt-accent/30 rounded-lg focus:ring-2 focus:ring-myslt-accent focus:border-transparent bg-myslt-background"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-3 w-5 h-5 text-myslt-text-secondary" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-myslt-accent/30 rounded-lg bg-myslt-background appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="granted">Granted</option>
                  <option value="revoked">Revoked</option>
                  <option value="expired">Expired</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              
              <div className="relative">
                <Tag className="absolute left-3 top-3 w-5 h-5 text-myslt-text-secondary" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-myslt-accent/30 rounded-lg bg-myslt-background appearance-none"
                >
                  <option value="all">All Categories</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Analytics">Analytics</option>
                  <option value="Personalization">Personalization</option>
                  <option value="Communication">Communication</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                <div>
                  <p className="text-red-800 font-medium">Error loading consents</p>
                  <p className="text-red-600 text-sm">{error}</p>
                  <p className="text-red-600 text-sm">Showing demo data for testing purposes.</p>
                </div>
              </div>
            </div>
          )}

          {/* Consents Grid */}
          <div className="grid gap-4">
            {filteredConsents.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 mx-auto text-myslt-text-muted mb-4" />
                <h3 className="text-xl font-semibold text-myslt-text-secondary mb-2">No consents found</h3>
                <p className="text-myslt-text-muted">Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              filteredConsents.map(consent => (
                <div key={consent.id} className="bg-myslt-background border border-myslt-accent/20 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 mt-1">
                          {getStatusIcon(consent.status)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-myslt-text-primary mb-1">
                            {consent.purpose}
                          </h3>
                          <p className="text-myslt-text-secondary mb-3">
                            {consent.description}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-myslt-text-muted mb-4">
                            <span className="flex items-center">
                              <Tag className="w-4 h-4 mr-1" />
                              {consent.category}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Valid from: {new Date(consent.validFrom).toLocaleDateString()}
                            </span>
                            {consent.validUntil && (
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                Until: {new Date(consent.validUntil).toLocaleDateString()}
                              </span>
                            )}
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {consent.jurisdiction}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(consent.status)}`}>
                              {consent.status.charAt(0).toUpperCase() + consent.status.slice(1)}
                            </span>
                            
                            <span className="text-xs text-myslt-text-muted">
                              Last updated: {new Date(consent.lastUpdated).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => setSelectedConsent(consent)}
                        className="px-3 py-2 text-myslt-accent hover:bg-myslt-accent/10 rounded-lg transition-colors flex items-center text-sm"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Details
                      </button>
                      
                      {consent.status === 'granted' ? (
                        <button
                          onClick={() => handleConsentAction(consent.id, 'revoke')}
                          disabled={updating === consent.id}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center text-sm disabled:opacity-50"
                        >
                          {updating === consent.id ? (
                            <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4 mr-1" />
                          )}
                          Revoke
                        </button>
                      ) : consent.status === 'revoked' ? (
                        <button
                          onClick={() => handleConsentAction(consent.id, 'grant')}
                          disabled={updating === consent.id}
                          className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center text-sm disabled:opacity-50"
                        >
                          {updating === consent.id ? (
                            <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-1" />
                          )}
                          Grant
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedConsent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-myslt-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-myslt-accent/20 shadow-xl">
            <div className="p-6 border-b border-myslt-accent/20 bg-myslt-gradient text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield className="w-8 h-8" />
                  <div>
                    <h2 className="text-2xl font-bold">{selectedConsent.purpose}</h2>
                    <p className="text-blue-100">{selectedConsent.category}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedConsent(null)}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-myslt-text-primary mb-3">Basic Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-myslt-text-secondary">Status</label>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border mt-1 ${getStatusColor(selectedConsent.status)}`}>
                        {getStatusIcon(selectedConsent.status)}
                        <span className="ml-2">{selectedConsent.status.charAt(0).toUpperCase() + selectedConsent.status.slice(1)}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm text-myslt-text-secondary">Channel</label>
                      <p className="text-myslt-text-primary">{selectedConsent.channel}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm text-myslt-text-secondary">Jurisdiction</label>
                      <p className="text-myslt-text-primary">{selectedConsent.jurisdiction}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-myslt-text-primary mb-3">Timeline</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-myslt-text-secondary">Valid From</label>
                      <p className="text-myslt-text-primary">{new Date(selectedConsent.validFrom).toLocaleDateString()}</p>
                    </div>
                    
                    {selectedConsent.validUntil && (
                      <div>
                        <label className="text-sm text-myslt-text-secondary">Valid Until</label>
                        <p className="text-myslt-text-primary">{new Date(selectedConsent.validUntil).toLocaleDateString()}</p>
                      </div>
                    )}
                    
                    <div>
                      <label className="text-sm text-myslt-text-secondary">Last Updated</label>
                      <p className="text-myslt-text-primary">{new Date(selectedConsent.lastUpdated).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-myslt-text-primary mb-3">Description</h3>
                <p className="text-myslt-text-secondary bg-myslt-background p-4 rounded-lg">
                  {selectedConsent.description}
                </p>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-myslt-accent/20">
                <span className="text-sm text-myslt-text-muted">
                  Granted by: {selectedConsent.grantedBy}
                </span>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedConsent(null)}
                    className="px-4 py-2 border border-myslt-accent/30 text-myslt-text-secondary rounded-lg hover:bg-myslt-accent/5 transition-colors"
                  >
                    Close
                  </button>
                  
                  {selectedConsent.status === 'granted' ? (
                    <button
                      onClick={() => {
                        handleConsentAction(selectedConsent.id, 'revoke');
                        setSelectedConsent(null);
                      }}
                      disabled={updating === selectedConsent.id}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center disabled:opacity-50"
                    >
                      {updating === selectedConsent.id ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-2" />
                      )}
                      Revoke Consent
                    </button>
                  ) : selectedConsent.status === 'revoked' ? (
                    <button
                      onClick={() => {
                        handleConsentAction(selectedConsent.id, 'grant');
                        setSelectedConsent(null);
                      }}
                      disabled={updating === selectedConsent.id}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center disabled:opacity-50"
                    >
                      {updating === selectedConsent.id ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Grant Consent
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsentCenter;
