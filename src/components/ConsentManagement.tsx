import React, { useState } from 'react';
import { Shield, Check, X, Clock, AlertCircle, Eye, Plus } from 'lucide-react';
import { PrivacyConsent, Party, ConsentPurpose, ConsentStatus } from '../types/consent';
import { ConsentCreateRequest } from '../services/consentService';
import { useConsents, useParties, useConsentMutation } from '../hooks/useApi';
import { useCRUDNotifications } from './shared/withNotifications';

interface ConsentManagementProps {
  selectedCustomer?: Party;
}

export const ConsentManagement: React.FC<ConsentManagementProps> = ({ selectedCustomer }) => {
  const [selectedConsent, setSelectedConsent] = useState<PrivacyConsent | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state for creating new consent
  const [newConsentForm, setNewConsentForm] = useState<{
    partyId: string;
    purpose: ConsentPurpose;
    status: ConsentStatus;
    channel: string;
    geoLocation: string;
    privacyNoticeId: string;
    versionAccepted: string;
  }>({
    partyId: '',
    purpose: 'marketing',
    status: 'granted',
    channel: 'email',
    geoLocation: 'Sri Lanka',
    privacyNoticeId: 'PN-001',
    versionAccepted: '1.0'
  });

  // Load data from backend
  const { data: consentsData, loading: consentsLoading, refetch: refetchConsents } = useConsents(selectedCustomer?.id);
  const { data: partiesData, loading: partiesLoading } = useParties();
  const { createConsent, updateConsent, revokeConsent, loading: mutationLoading } = useConsentMutation();

  // Notification hooks
  const { notifyCreate, notifyUpdate, notifyCustom } = useCRUDNotifications();

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
      
      // Send notification
      const updatedConsent = consents.find((c: any) => c.id === consentId);
      if (updatedConsent) {
        const party = parties.find((p: any) => p.id === updatedConsent.partyId);
        const customerName = party ? 
          (party.characteristic?.find((c: any) => c.name === 'firstName')?.value + ' ' + 
           party.characteristic?.find((c: any) => c.name === 'lastName')?.value) || party.id :
          updatedConsent.partyId;
        
        notifyUpdate('consent', customerName, {
          consentId: consentId,
          oldStatus: updatedConsent.status,
          newStatus: newStatus,
          purpose: updatedConsent.purpose
        });
      }
    } catch (error) {
      console.error('Failed to update consent:', error);
    }
  };

  const handleCreateConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConsentForm.partyId) {
      alert('Please select a customer');
      return;
    }

    try {
      const consentData: ConsentCreateRequest = {
        partyId: newConsentForm.partyId,
        purpose: newConsentForm.purpose,
        status: newConsentForm.status,
        channel: newConsentForm.channel,
        geoLocation: newConsentForm.geoLocation,
        privacyNoticeId: newConsentForm.privacyNoticeId,
        versionAccepted: newConsentForm.versionAccepted,
        validFor: {
          startDateTime: new Date().toISOString()
        }
      };

      await createConsent(consentData);
      await refetchConsents(); // Refresh the data
      setShowCreateModal(false);
      
      // Send notification
      const selectedParty = parties.find(p => p.id === newConsentForm.partyId);
      const customerName = selectedParty ? 
        (selectedParty.characteristic?.find(c => c.name === 'firstName')?.value + ' ' + 
         selectedParty.characteristic?.find(c => c.name === 'lastName')?.value) || selectedParty.id :
        newConsentForm.partyId;
      
      notifyCreate('consent', customerName, {
        purpose: newConsentForm.purpose,
        status: newConsentForm.status,
        channel: newConsentForm.channel
      });
      
      // Reset form
      setNewConsentForm({
        partyId: '',
        purpose: 'marketing',
        status: 'granted',
        channel: 'email',
        geoLocation: 'Sri Lanka',
        privacyNoticeId: 'PN-001',
        versionAccepted: '1.0'
      });
      
      alert('Consent created successfully!');
    } catch (error) {
      console.error('Failed to create consent:', error);
      alert('Failed to create consent. Please try again.');
    }
  };

  const CreateConsentModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Create New Consent</h3>
            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleCreateConsent} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer *</label>
                <select
                  value={newConsentForm.partyId}
                  onChange={(e) => setNewConsentForm({ ...newConsentForm, partyId: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Customer</option>
                  {parties.map((party: any) => (
                    <option key={party.id} value={party.id}>
                      {party.name} ({party.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Purpose *</label>
                <select
                  value={newConsentForm.purpose}
                  onChange={(e) => setNewConsentForm({ ...newConsentForm, purpose: e.target.value as ConsentPurpose })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="marketing">Marketing</option>
                  <option value="analytics">Analytics</option>
                  <option value="thirdPartySharing">Third Party Sharing</option>
                  <option value="dataProcessing">Data Processing</option>
                  <option value="location">Location</option>
                  <option value="research">Research</option>
                  <option value="personalization">Personalization</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status *</label>
                <select
                  value={newConsentForm.status}
                  onChange={(e) => setNewConsentForm({ ...newConsentForm, status: e.target.value as ConsentStatus })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="granted">Granted</option>
                  <option value="pending">Pending</option>
                  <option value="revoked">Revoked</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Channel *</label>
                <select
                  value={newConsentForm.channel}
                  onChange={(e) => setNewConsentForm({ ...newConsentForm, channel: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="push">Push Notification</option>
                  <option value="voice">Voice</option>
                  <option value="all">All</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Geo Location</label>
                <input
                  type="text"
                  value={newConsentForm.geoLocation}
                  onChange={(e) => setNewConsentForm({ ...newConsentForm, geoLocation: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Sri Lanka"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Privacy Notice ID</label>
                <input
                  type="text"
                  value={newConsentForm.privacyNoticeId}
                  onChange={(e) => setNewConsentForm({ ...newConsentForm, privacyNoticeId: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., PN-001"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Version Accepted</label>
              <input
                type="text"
                value={newConsentForm.versionAccepted}
                onChange={(e) => setNewConsentForm({ ...newConsentForm, versionAccepted: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 1.0"
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutationLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutationLoading ? 'Creating...' : 'Create Consent'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
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

        {/* Search Input and Create Button */}
        <div className="mb-4 flex justify-between items-center">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Consent
          </button>
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
          <table className="myslt-table">
            <thead className="myslt-table-header">
              <tr>
                <th className="myslt-table-header-cell">
                  Customer
                </th>
                <th className="myslt-table-header-cell">
                  Consent Type
                </th>
                <th className="myslt-table-header-cell">
                  Channel
                </th>
                <th className="myslt-table-header-cell">
                  Status
                </th>
                <th className="myslt-table-header-cell">
                  Granted Date
                </th>
                <th className="myslt-table-header-cell">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="myslt-table-body">
              {filteredConsents.map((consent: any) => (
                <tr key={consent.id} className="myslt-table-row">
                  <td className="myslt-table-cell-primary">
                    <div className="text-myslt-text-primary font-medium">
                      {getCustomerName(consent.partyId)}
                    </div>
                    <div className="text-myslt-text-muted text-xs">{consent.partyId}</div>
                  </td>
                  <td className="myslt-table-cell">{consent.purpose}</td>
                  <td className="myslt-table-cell">{consent.channel}</td>
                  <td className="myslt-table-cell">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(consent.status)}`}>
                      {getStatusIcon(consent.status)}
                      <span className="ml-1">{consent.status}</span>
                    </span>
                  </td>
                  <td className="myslt-table-cell">
                    {new Date(consent.timestampGranted).toLocaleDateString()}
                  </td>
                  <td className="myslt-table-cell font-medium space-x-2">
                    <button
                      onClick={() => {
                        setSelectedConsent(consent);
                        setShowModal(true);
                      }}
                      className="text-myslt-accent hover:text-myslt-primary inline-flex items-center transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    {consent.status === 'granted' && (
                      <button
                        onClick={() => handleUpdateConsent(consent.id, 'revoked')}
                        className="text-myslt-danger hover:text-red-400 inline-flex items-center transition-colors"
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
      {showCreateModal && <CreateConsentModal />}
    </div>
  );
};
