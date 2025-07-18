import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, AlertCircle, CheckCircle, XCircle, RefreshCw, Download, Calendar } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

interface DSARRequestPanelProps {
  className?: string;
  customerId?: string;
}

const DSARRequestPanel: React.FC<DSARRequestPanelProps> = ({ 
  className = '', 
  customerId 
}) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadDSARRequests();
  }, [customerId]);

  const loadDSARRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = '/api/v1/dsar';
      if (customerId) {
        url += `?partyId=${customerId}`;
      }
      
      const response = await apiClient.get(url);
      const dsarData = response.data as any[];
      setRequests(dsarData);
    } catch (err) {
      console.error('Error loading DSAR requests:', err);
      setError('Failed to load DSAR requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      setProcessing(requestId);
      await apiClient.put(`/api/v1/dsar/${requestId}`, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      // Refresh the request list
      await loadDSARRequests();
    } catch (err) {
      console.error('Error updating DSAR request:', err);
      setError('Failed to update request status. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'in_progress':
        return <RefreshCw className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getRequestTypeColor = (type: string) => {
    switch (type) {
      case 'access':
        return 'bg-blue-100 text-blue-800';
      case 'portability':
        return 'bg-green-100 text-green-800';
      case 'deletion':
        return 'bg-red-100 text-red-800';
      case 'rectification':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  const calculateDaysRemaining = (submittedDate: string) => {
    const submitted = new Date(submittedDate);
    const deadline = new Date(submitted);
    deadline.setDate(deadline.getDate() + 30); // 30 days to respond
    
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg ${className}`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">DSAR Requests</h2>
              <p className="text-sm text-gray-600">Data Subject Access Requests</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading DSAR requests...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-lg ${className}`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">DSAR Requests</h2>
              <p className="text-sm text-gray-600">Data Subject Access Requests</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <button 
              onClick={loadDSARRequests}
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
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">DSAR Requests</h2>
              <p className="text-sm text-gray-600">
                {customerId ? `DSAR requests for customer: ${customerId}` : 'Data Subject Access Requests'}
              </p>
            </div>
          </div>
          <button
            onClick={loadDSARRequests}
            className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <ShieldCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No DSAR requests found.</p>
          <p className="text-sm text-gray-500 mt-1">
            {customerId ? 'This customer has no DSAR requests.' : 'No DSAR requests exist in the system.'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {requests.map((request) => {
            const daysRemaining = calculateDaysRemaining(request.submittedAt);
            const isOverdue = daysRemaining < 0;
            
            return (
              <div key={request.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRequestTypeColor(request.requestType)}`}>
                        {request.requestType}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{request.status}</span>
                      </span>
                      {isOverdue && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Overdue
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span><strong>Request ID:</strong> {request.id}</span>
                        <span><strong>Customer:</strong> {request.partyId}</span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Submitted: {formatDate(request.submittedAt)}
                        </span>
                        <span className={`${isOverdue ? 'text-red-600' : daysRemaining <= 7 ? 'text-yellow-600' : 'text-gray-600'}`}>
                          {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days remaining`}
                        </span>
                      </div>
                      
                      {request.description && (
                        <p className="text-sm text-gray-700 mt-2">{request.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateRequestStatus(request.id, 'in_progress')}
                          disabled={processing === request.id}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Start Processing
                        </button>
                        <button
                          onClick={() => updateRequestStatus(request.id, 'rejected')}
                          disabled={processing === request.id}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    
                    {request.status === 'in_progress' && (
                      <button
                        onClick={() => updateRequestStatus(request.id, 'completed')}
                        disabled={processing === request.id}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Mark Complete
                      </button>
                    )}
                    
                    {request.status === 'completed' && (
                      <button
                        className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 flex items-center gap-1"
                        title="Download Response"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </button>
                    )}
                    
                    {processing === request.id && (
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                        <span className="text-sm text-gray-600">Processing...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DSARRequestPanel;
