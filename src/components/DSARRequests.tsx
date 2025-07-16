import React, { useState } from 'react';
import { Database, Download, Trash2, Clock, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
import { mockDSARRequests, mockParties } from '../data/mockData';
import { DSARRequest, Party } from '../types/consent';

interface DSARRequestsProps {
  selectedCustomer?: Party;
}

export const DSARRequests: React.FC<DSARRequestsProps> = ({ selectedCustomer }) => {
  const [requests, setRequests] = useState<DSARRequest[]>(mockDSARRequests);
  const [selectedRequest, setSelectedRequest] = useState<DSARRequest | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filteredRequests = selectedCustomer 
    ? requests.filter(request => request.partyId === selectedCustomer.id)
    : requests;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'initiated':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'initiated':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'data_export':
        return <Download className="h-4 w-4 text-blue-500" />;
      case 'data_deletion':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case 'restriction':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Database className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'data_export':
        return 'bg-blue-100 text-blue-800';
      case 'data_deletion':
        return 'bg-red-100 text-red-800';
      case 'restriction':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCustomerName = (partyId: string) => {
    const party = mockParties.find(p => p.id === partyId);
    return party ? party.name : 'Unknown Customer';
  };

  const handleUpdateStatus = (requestId: string, newStatus: string) => {
    setRequests(prev => prev.map(request => 
      request.id === requestId 
        ? { 
            ...request, 
            status: newStatus as any,
            completedAt: newStatus === 'completed' ? new Date().toISOString() : request.completedAt
          }
        : request
    ));
  };

  const formatType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const DSARModal = () => {
    if (!selectedRequest) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">DSAR Request Details</h3>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
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
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                >
                  Mark as Processing
                </button>
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedRequest.id, 'completed');
                    setShowModal(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Mark as Completed
                </button>
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedRequest.id, 'failed');
                    setShowModal(false);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Database className="h-5 w-5 mr-2 text-blue-600" />
            DSAR Requests
          </h2>
          <div className="flex space-x-2">
            <span className="text-sm text-gray-500">
              {selectedCustomer ? `Customer: ${selectedCustomer.name}` : 'All Requests'}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {getCustomerName(request.partyId)}
                    </div>
                    <div className="text-sm text-gray-500">{request.partyId}</div>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(request.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.completedAt ? new Date(request.completedAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    {request.status !== 'completed' && (
                      <button
                        onClick={() => handleUpdateStatus(request.id, 'completed')}
                        className="text-green-600 hover:text-green-900 inline-flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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