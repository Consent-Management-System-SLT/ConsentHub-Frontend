import React, { useState } from 'react';
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
  Tag
} from 'lucide-react';
import { useCustomerConsents } from '../../hooks/useCustomerApi';

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

  // Use real data from backend
  const { data: consentsData, loading, error } = useCustomerConsents();

  // Transform backend data to match UI format
  const consents: Consent[] = consentsData?.consents ? consentsData.consents.map((consent: any) => ({
    id: consent.id,
    purpose: consent.purpose,
    status: consent.status,
    channel: consent.channel || 'Email, SMS',
    validFrom: consent.grantedDate || consent.createdAt,
    validUntil: consent.expiryDate,
    description: consent.description || consent.purpose,
    category: consent.categories ? consent.categories.join(', ') : 'General',
    jurisdiction: consent.jurisdiction || 'LK',
    lastUpdated: consent.lastModified || consent.updatedAt,
    grantedBy: consent.partyId
  })) : [];

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading consents...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">Error loading consents</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'revoked':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleConsentAction = (consentId: string, action: 'revoke' | 'renew' | 'grant') => {
    console.log(`${action} consent ${consentId}`);
    // Implement consent action logic here
  };

  const ConsentDetailModal = ({ consent, onClose }: { consent: Consent; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">{consent.purpose}</h2>
                <p className="text-blue-100">{consent.category}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusIcon(consent.status)}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(consent.status)}`}>
                      {consent.status.charAt(0).toUpperCase() + consent.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Channel:</span>
                  <p className="text-gray-900">{consent.channel}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Jurisdiction:</span>
                  <p className="text-gray-900">{consent.jurisdiction}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Validity Period</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Valid From:</span>
                  <p className="text-gray-900">{new Date(consent.validFrom).toLocaleDateString()}</p>
                </div>
                {consent.validUntil && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Valid Until:</span>
                    <p className="text-gray-900">{new Date(consent.validUntil).toLocaleDateString()}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-500">Last Updated:</span>
                  <p className="text-gray-900">{new Date(consent.lastUpdated).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-900">{consent.description}</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            {consent.status === 'granted' && (
              <button
                onClick={() => handleConsentAction(consent.id, 'revoke')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Revoke Consent
              </button>
            )}
            {(consent.status === 'expired' || consent.status === 'revoked') && (
              <button
                onClick={() => handleConsentAction(consent.id, 'grant')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Grant Consent
              </button>
            )}
            <button
              onClick={() => console.log('View history for', consent.id)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View History
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Consent Center</h1>
        <p className="text-gray-600 mt-2">Manage your data processing consents and preferences</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search consents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="granted">Granted</option>
              <option value="revoked">Revoked</option>
              <option value="expired">Expired</option>
              <option value="pending">Pending</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="Marketing">Marketing</option>
              <option value="Essential">Essential</option>
              <option value="Analytics">Analytics</option>
              <option value="Sharing">Sharing</option>
              <option value="Location">Location</option>
            </select>
          </div>
        </div>
      </div>

      {/* Consents List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredConsents.map((consent) => (
          <div key={consent.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(consent.status)}
                  <div>
                    <h3 className="font-semibold text-gray-900">{consent.purpose}</h3>
                    <p className="text-sm text-gray-500">{consent.category}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(consent.status)}`}>
                  {consent.status}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{consent.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Tag className="w-4 h-4 mr-2" />
                  {consent.channel}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(consent.validFrom).toLocaleDateString()}
                  {consent.validUntil && ` - ${new Date(consent.validUntil).toLocaleDateString()}`}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="w-4 h-4 mr-2" />
                  {consent.jurisdiction}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedConsent(consent)}
                  className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                {consent.status === 'granted' && (
                  <button
                    onClick={() => handleConsentAction(consent.id, 'revoke')}
                    className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Revoke</span>
                  </button>
                )}
                {(consent.status === 'expired' || consent.status === 'revoked') && (
                  <button
                    onClick={() => handleConsentAction(consent.id, 'grant')}
                    className="flex-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Grant</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredConsents.length === 0 && (
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No consents found</h3>
          <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
        </div>
      )}

      {/* Consent Detail Modal */}
      {selectedConsent && (
        <ConsentDetailModal
          consent={selectedConsent}
          onClose={() => setSelectedConsent(null)}
        />
      )}
    </div>
  );
};

export default ConsentCenter;
