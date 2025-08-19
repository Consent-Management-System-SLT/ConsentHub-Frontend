import React, { useState, useEffect } from 'react';
import { FileText, Eye, Check, X, AlertCircle, RefreshCw } from 'lucide-react';
import { csrDashboardService } from '../../services/csrDashboardService';

interface ConsentHistoryTableProps {
  className?: string;
  customerId?: string;
}

const ConsentHistoryTable: React.FC<ConsentHistoryTableProps> = ({ 
  className = '', 
  customerId 
}) => {
  const [consents, setConsents] = useState<any[]>([]);
  const [selectedConsent, setSelectedConsent] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConsents();
  }, [customerId]);

  const loadConsents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use CSR dashboard service with comprehensive hardcoded fallback data
      const consentArray = await csrDashboardService.getConsents();
      
      // Filter by customer ID if provided
      let filteredConsents = consentArray;
      if (customerId) {
        filteredConsents = consentArray.filter(consent => consent.customerId === customerId);
      }
      
      console.log('Loaded consents:', filteredConsents); // Debug log
      setConsents(filteredConsents);
    } catch (err) {
      console.error('Error loading consents:', err);
      setError('Failed to load consent history. Please try again.');
      setConsents([]); // Ensure consents is always an array even on error
    } finally {
      setLoading(false);
    }
  };

  const updateConsentStatus = async (consentId: string, newStatus: string) => {
    try {
      // For demo purposes, we'll just update the local state
      const updatedConsents = consents.map(consent => 
        consent.id === consentId 
          ? { ...consent, status: newStatus, updatedAt: new Date().toISOString() }
          : consent
      );
      setConsents(updatedConsents);
      
      console.log(`Updated consent ${consentId} to status: ${newStatus}`);
    } catch (err) {
      console.error('Error updating consent:', err);
      setError('Failed to update consent status. Please try again.');
    }
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
              onClick={loadConsents}
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
            <FileText className="w-6 h-6 text-indigo-600" />
            <div>
              <h2 className="text-xl font-semibold text-myslt-text-primary">Consent History</h2>
              <p className="text-sm text-myslt-text-secondary">
                {customerId ? `Showing consents for customer: ${customerId}` : 'View and manage customer consent records'}
              </p>
            </div>
          </div>
          <button
            onClick={loadConsents}
            className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
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
                  Customer ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-myslt-card-solid divide-y divide-myslt-accent/20">
              {Array.isArray(consents) && consents.map((consent) => (
                <tr key={consent.id} className="hover:bg-myslt-service-card">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-myslt-text-primary">{consent.partyId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-myslt-text-primary">{consent.purpose}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(consent.status)}`}>
                      {consent.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-myslt-text-primary">{consent.consentType || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-myslt-text-primary">
                      {formatDate(consent.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(consent)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {consent.status === 'granted' && (
                        <button
                          onClick={() => updateConsentStatus(consent.id, 'revoked')}
                          className="text-red-600 hover:text-red-900"
                          title="Revoke Consent"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      {consent.status === 'revoked' && (
                        <button
                          onClick={() => updateConsentStatus(consent.id, 'granted')}
                          className="text-green-600 hover:text-green-900"
                          title="Grant Consent"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
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
          <div className="bg-myslt-card-solid rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-myslt-text-primary">Consent Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-myslt-text-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Consent ID</label>
                    <p className="mt-1 text-sm text-myslt-text-primary">{selectedConsent.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer ID</label>
                    <p className="mt-1 text-sm text-myslt-text-primary">{selectedConsent.partyId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Purpose</label>
                    <p className="mt-1 text-sm text-myslt-text-primary">{selectedConsent.purpose}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedConsent.status)}`}>
                      {selectedConsent.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <p className="mt-1 text-sm text-myslt-text-primary">{selectedConsent.consentType || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created</label>
                    <p className="mt-1 text-sm text-myslt-text-primary">{formatDate(selectedConsent.createdAt)}</p>
                  </div>
                </div>
                {selectedConsent.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-myslt-text-primary">{selectedConsent.description}</p>
                  </div>
                )}
                {selectedConsent.validFor && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Valid Period</label>
                    <div className="mt-1 text-sm text-myslt-text-primary">
                      <p>From: {formatDate(selectedConsent.validFor.startDateTime)}</p>
                      {selectedConsent.validFor.endDateTime && (
                        <p>To: {formatDate(selectedConsent.validFor.endDateTime)}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsentHistoryTable;
