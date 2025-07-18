import React, { useState } from 'react';
import { Shield, Check, X, Clock, AlertCircle, Eye } from 'lucide-react';
import { PrivacyConsent, Party } from '../types/consent';
import { useConsents, useParties, useConsentMutation } from '../hooks/useApi';

interface ConsentManagementProps {
  selectedCustomer?: Party;
}

export const ConsentManagement: React.FC<ConsentManagementProps> = ({ selectedCustomer }) => {
  const [selectedConsent, setSelectedConsent] = useState<PrivacyConsent | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load data from backend
  const { data: consentsData, loading: consentsLoading, refetch: refetchConsents } = useConsents(selectedCustomer?.id);
  const { data: partiesData, loading: partiesLoading } = useParties();
  const { updateConsent, revokeConsent, loading: mutationLoading } = useConsentMutation();

  // Transform data to ensure it's an array
  const consents = Array.isArray(consentsData) ? consentsData : 
    (consentsData && (consentsData as any).consents ? (consentsData as any).consents : []);
  const parties = Array.isArray(partiesData) ? partiesData : 
    (partiesData && (partiesData as any).parties ? (partiesData as any).parties : []);

  const filteredConsents = consents.filter((consent: any) => {
    const party = parties.find((p: any) => p.id === consent.partyId);
    const matchesCustomer = selectedCustomer ? consent.partyId === selectedCustomer.id : true;
    const matchesSearch =
      !searchTerm ||
      party?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consent.partyId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCustomer && matchesSearch;
  });

  // Loading state
  if (consentsLoading || partiesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading consents...</span>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'granted':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'revoked':
        return <X className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'granted':
        return 'bg-green-100 text-green-800';
      case 'revoked':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCustomerName = (partyId: string) => {
    const party = parties.find((p: any) => p.id === partyId);
    return party ? party.name : 'Unknown Customer';
  };

  const handleUpdateConsent = async (consentId: string, newStatus: string) => {
    try {
      await updateConsent(consentId, { status: newStatus as any });
      await refetchConsents(); // Refresh the data
    } catch (error) {
      console.error('Failed to update consent:', error);
    }
  };

  const ConsentModal = () => {
    if (!selectedConsent) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Consent Details</h3>
            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Consent ID</label>
                <p className="mt-1 text-sm text-gray-900">{selectedConsent.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer</label>
                <p className="mt-1 text-sm text-gray-900">{getCustomerName(selectedConsent.partyId)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Purpose</label>
                <p className="mt-1 text-sm text-gray-900">{selectedConsent.purpose}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Channel</label>
                <p className="mt-1 text-sm text-gray-900">{selectedConsent.channel}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedConsent.status)}`}>
                  {getStatusIcon(selectedConsent.status)}
                  <span className="ml-1">{selectedConsent.status}</span>
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Geo Location</label>
                <p className="mt-1 text-sm text-gray-900">{selectedConsent.geoLocation}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Valid From</label>
                <p className="mt-1 text-sm text-gray-900">{new Date(selectedConsent.validFrom).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Valid To</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedConsent.validTo ? new Date(selectedConsent.validTo).toLocaleDateString() : 'Indefinite'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Granted</label>
                <p className="mt-1 text-sm text-gray-900">{new Date(selectedConsent.timestampGranted).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Revoked</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedConsent.timestampRevoked ? new Date(selectedConsent.timestampRevoked).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Version Accepted</label>
                <p className="mt-1 text-sm text-gray-900">{selectedConsent.versionAccepted}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Source</label>
                <p className="mt-1 text-sm text-gray-900">{selectedConsent.recordSource}</p>
              </div>
            </div>

            {selectedConsent.status === 'granted' && (
              <div className="flex space-x-2 pt-4">
                <button
                  onClick={() => {
                    handleUpdateConsent(selectedConsent.id, 'revoked');
                    setShowModal(false);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Revoke Consent
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue-600" />
            Consent Management
          </h2>
          <div className="text-sm text-gray-500">
            {selectedCustomer ? `Customer: ${selectedCustomer.name}` : 'All Customers'}
          </div>
        </div>

        {/* 🔍 Search Input */}
        <div className="mb-4 flex justify-end">
          <input
            type="text"
            placeholder="Search by customer name or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        {/* Consent Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Channel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Granted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredConsents.map((consent) => (
                <tr key={consent.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {getCustomerName(consent.partyId)}
                    </div>
                    <div className="text-sm text-gray-500">{consent.partyId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{consent.purpose}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{consent.channel}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(consent.status)}`}>
                      {getStatusIcon(consent.status)}
                      <span className="ml-1">{consent.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(consent.timestampGranted).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => {
                        setSelectedConsent(consent);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    {consent.status === 'granted' && (
                      <button
                        onClick={() => handleUpdateConsent(consent.id, 'revoked')}
                        className="text-red-600 hover:text-red-900 inline-flex items-center"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <ConsentModal />}
    </div>
  );
};
