import React, { useState } from 'react';
import {
  Database, Download, Trash2, Clock, CheckCircle, XCircle, AlertCircle, Eye, Search,
} from 'lucide-react';
import { DSARRequest, Party } from '../types/consent';
import { useDSARRequests, useParties, useDSARMutation } from '../hooks/useApi';
import { useCRUDNotifications } from './shared/withNotifications';

interface DSARRequestsProps {
  selectedCustomer?: Party;
}

export const DSARRequests: React.FC<DSARRequestsProps> = ({ selectedCustomer }) => {
  const [selectedRequest, setSelectedRequest] = useState<DSARRequest | null>(null);
  const [showModal, setShowModal] = useState(false);

  // New search states
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomer, setFilteredCustomer] = useState<Party | null>(selectedCustomer || null);

  // Load data from backend
  const { data: dsarData, loading: dsarLoading, refetch: refetchDSAR } = useDSARRequests(filteredCustomer?.id);
  const { data: partiesData, loading: partiesLoading } = useParties();
  const { updateDSARRequest, loading: mutationLoading } = useDSARMutation();

  // Notification hooks
  const { notifyUpdate, notifyApprove, notifyReject } = useCRUDNotifications();

  // Transform data to ensure it's an array
  const requests = Array.isArray(dsarData) ? dsarData : 
    (dsarData && (dsarData as any).requests ? (dsarData as any).requests : []);
  const parties = Array.isArray(partiesData) ? partiesData : 
    (partiesData && (partiesData as any).parties ? (partiesData as any).parties : []);

  const handleCustomerSearch = () => {
    const match = parties.find((p: any) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCustomer(match || null);
  };

  const filteredRequests = filteredCustomer
    ? requests.filter((request: any) => request.partyId === filteredCustomer.id)
    : requests;

  // Loading state
  if (dsarLoading || partiesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading DSAR requests...</span>
      </div>
    );
  }

  const getCustomerName = (partyId: string) => {
    const party = parties.find((p: any) => p.id === partyId);
    return party ? party.name : 'Unknown Customer';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'initiated': return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'initiated': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'data_export': return <Download className="h-4 w-4 text-blue-500" />;
      case 'data_deletion': return <Trash2 className="h-4 w-4 text-red-500" />;
      case 'restriction': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default: return <Database className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'data_export': return 'bg-blue-100 text-blue-800';
      case 'data_deletion': return 'bg-red-100 text-red-800';
      case 'restriction': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    try {
      // Find the request being updated
      const request = requests.find((r: any) => r.id === requestId);
      const party = parties.find((p: any) => p.id === request?.partyId);
      const entityName = `${request?.type || 'DSAR Request'} for ${party?.name || 'Unknown Party'}`;
      
      await updateDSARRequest(requestId, { status: newStatus as any });
      await refetchDSAR(); // Refresh the data
      
      // Trigger appropriate notification based on status
      if (newStatus === 'completed') {
        notifyApprove('dsarRequest', entityName, {
          requestId,
          partyName: party?.name || 'Unknown Party',
          requestType: request?.type || 'Unknown Type',
          status: newStatus
        });
      } else if (newStatus === 'failed' || newStatus === 'rejected') {
        notifyReject('dsarRequest', entityName, {
          requestId,
          partyName: party?.name || 'Unknown Party',
          requestType: request?.type || 'Unknown Type',
          status: newStatus
        });
      } else {
        notifyUpdate('dsarRequest', entityName, {
          requestId,
          partyName: party?.name || 'Unknown Party',
          requestType: request?.type || 'Unknown Type',
          status: newStatus
        });
      }
    } catch (error) {
      console.error('Failed to update DSAR request:', error);
    }
  };

  const formatType = (type: string) =>
    type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

  const DSARModal = () => {
    if (!selectedRequest) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-myslt-card rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">DSAR Request Details</h3>
            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
              <XCircle className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Request ID</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRequest.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer</label>
                <p className="mt-1 text-sm text-gray-900">{getCustomerName(selectedRequest.partyId)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(selectedRequest.type)}`}>
                  {getTypeIcon(selectedRequest.type)}
                  <span className="ml-1">{formatType(selectedRequest.type)}</span>
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                  {getStatusIcon(selectedRequest.status)}
                  <span className="ml-1">{selectedRequest.status}</span>
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <p className="mt-1 text-sm text-gray-900">{selectedRequest.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Submitted</label>
                <p className="mt-1 text-sm text-gray-900">{new Date(selectedRequest.submittedAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Completed</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedRequest.completedAt ? new Date(selectedRequest.completedAt).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
            {selectedRequest.status !== 'completed' && (
              <div className="flex space-x-2 pt-4">
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedRequest.id, 'processing');
                    setShowModal(false);
                  }}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                >
                  Mark as Processing
                </button>
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedRequest.id, 'completed');
                    setShowModal(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Mark as Completed
                </button>
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedRequest.id, 'failed');
                    setShowModal(false);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Mark as Failed
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
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Database className="h-5 w-5 mr-2 text-blue-600" />
            DSAR Requests
          </h2>
          <span className="text-sm text-gray-500">
            {filteredCustomer ? `Customer: ${filteredCustomer.name}` : 'All Requests'}
          </span>
        </div>

        {/* 🔍 Search Bar */}
        <div className="mb-6 flex space-x-2 items-center">
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCustomerSearch}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Customer', 'Type', 'Status', 'Submitted', 'Completed', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request: any) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="font-medium text-gray-900">{getCustomerName(request.partyId)}</div>
                    <div className="text-gray-500">{request.partyId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(request.type)}`}>
                      {getTypeIcon(request.type)}
                      <span className="ml-1">{formatType(request.type)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1">{request.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{new Date(request.submittedAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{request.completedAt ? new Date(request.completedAt).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" /> View
                    </button>
                    {request.status !== 'completed' && (
                      <button
                        onClick={() => handleUpdateStatus(request.id, 'completed')}
                        className="text-green-600 hover:text-green-900 inline-flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" /> Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No DSAR requests found.</p>
          </div>
        )}
      </div>

      {showModal && <DSARModal />}
    </div>
  );
};
