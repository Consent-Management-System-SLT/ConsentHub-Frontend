import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Download, 
  Calendar,
  User,
  FileText,
  Eye,
  Check,
  X,
  Play,
  Pause,
  Mail,
  Phone,
  MessageSquare
} from 'lucide-react';
import { csrDashboardService } from '../../services/csrDashboardService';

interface DSARRequestPanelProps {
  className?: string;
  customerId?: string;
}

const DSARRequestPanel: React.FC<DSARRequestPanelProps> = ({ 
  className = '', 
  customerId 
}) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{requestId: string, action: string} | null>(null);

  useEffect(() => {
    loadDSARRequests();
  }, [customerId]);

  const loadDSARRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load both DSAR requests and customers
      const [allRequests, customerArray] = await Promise.all([
        csrDashboardService.getDSARRequests(),
        csrDashboardService.getCustomers()
      ]);
      
      // Filter by customer if specified
      let filteredRequests = allRequests;
      if (customerId) {
        filteredRequests = allRequests.filter(request => request.partyId === customerId);
      }
      
      console.log('Loaded DSAR requests:', filteredRequests);
      console.log('Loaded customers:', customerArray.length);
      setRequests(filteredRequests);
      setCustomers(customerArray);
    } catch (err) {
      console.error('Error loading DSAR requests:', err);
      setError('Failed to load DSAR requests. Please try again.');
      setRequests([]);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const getCustomerName = (partyId: string, request?: any): string => {
    // First try to use the requestorName from the request if available
    if (request && request.requestorName) {
      return request.requestorName;
    }
    
    // Fall back to customer lookup
    const customer = customers.find(c => c.id === partyId);
    return customer ? customer.name : `Customer ${partyId}`;
  };

  const updateRequestStatus = async (requestId: string, newStatus: string, notes?: string) => {
    try {
      setProcessing(requestId);
      
      // Call the backend API to update the DSAR request
      const updatedRequest = await csrDashboardService.updateDSARRequest(requestId, {
        status: newStatus,
        processingNotes: notes || '',
        processedBy: 'CSR Agent'
      });
      
      // Update local state with the response from backend
      setRequests(prevRequests => 
        prevRequests.map(request => 
          request.id === requestId ? updatedRequest : request
        )
      );
      
      console.log(`✅ Successfully updated DSAR request ${requestId} status to ${newStatus}`);
      
      // Close any open modals
      setShowApprovalModal(false);
      setPendingAction(null);
      setApprovalNotes('');
      
    } catch (err) {
      console.error('❌ Error updating DSAR request:', err);
      setError('Failed to update request status. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const handleApproveRequest = (requestId: string) => {
    setPendingAction({ requestId, action: 'approve' });
    setShowApprovalModal(true);
  };

  const handleRejectRequest = (requestId: string) => {
    setPendingAction({ requestId, action: 'reject' });
    setShowApprovalModal(true);
  };

  const handleStartProcessing = (requestId: string) => {
    updateRequestStatus(requestId, 'in_progress', 'Processing started by CSR agent');
  };

  const handleCompleteRequest = (requestId: string) => {
    updateRequestStatus(requestId, 'completed', 'Request completed by CSR agent');
  };

  const confirmAction = async () => {
    if (!pendingAction) return;
    
    const { requestId, action } = pendingAction;
    const notes = approvalNotes.trim();
    
    if (action === 'approve') {
      await updateRequestStatus(requestId, 'approved', notes || 'Approved by CSR agent');
    } else if (action === 'reject') {
      await updateRequestStatus(requestId, 'rejected', notes || 'Rejected by CSR agent');
    }
  };

  const viewRequestDetails = (request: any) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const downloadRequestData = async (requestId: string) => {
    try {
      const request = requests.find(r => r.id === requestId);
      if (request) {
        // Create a simple JSON file with the request data
        const data = {
          requestId: requestId,
          requestType: request.requestType,
          partyId: request.partyId,
          status: request.status,
          submittedAt: request.submittedAt,
          processedAt: new Date().toISOString(),
          data: "Sample data export - In production this would contain actual user data"
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dsar-${requestId}-${request.requestType}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        console.log(`Downloaded DSAR data for request ${requestId} (demo mode)`);
      }
    } catch (err) {
      console.error('Error downloading DSAR data:', err);
      setError('Failed to download request data. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-myslt-service-card text-myslt-text-secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
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
        return 'bg-myslt-service-card text-myslt-text-secondary';
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
      <div className={`bg-myslt-card-solid rounded-lg shadow-lg ${className}`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            <div>
              <h2 className="text-xl font-semibold text-myslt-text-primary">DSAR Requests</h2>
              <p className="text-sm text-myslt-text-secondary">Data Subject Access Requests</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-myslt-text-secondary">Loading DSAR requests...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-myslt-card-solid rounded-lg shadow-lg ${className}`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            <div>
              <h2 className="text-xl font-semibold text-myslt-text-primary">DSAR Requests</h2>
              <p className="text-sm text-myslt-text-secondary">Data Subject Access Requests</p>
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
    <div className={`bg-myslt-card-solid rounded-lg shadow-lg ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            <div>
              <h2 className="text-xl font-semibold text-myslt-text-primary">DSAR Requests</h2>
              <p className="text-sm text-myslt-text-secondary">
                {customerId ? `DSAR requests for customer: ${getCustomerName(customerId)}` : 'Data Subject Access Requests'}
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

      {requests && requests.length === 0 ? (
        <div className="text-center py-12">
          <ShieldCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-myslt-text-secondary">No DSAR requests found.</p>
          <p className="text-sm text-gray-500 mt-1">
            {customerId ? 'This customer has no DSAR requests.' : 'No DSAR requests exist in the system.'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {Array.isArray(requests) && requests.map((request) => {
            const daysRemaining = calculateDaysRemaining(request.submittedAt);
            const isOverdue = daysRemaining < 0;
            
            return (
              <div key={request.id} className="p-6 hover:bg-myslt-service-card">
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
                      <div className="flex items-center space-x-4 text-sm text-myslt-text-secondary">
                        <span><strong>Request ID:</strong> {request.id}</span>
                        <span><strong>Customer:</strong> {getCustomerName(request.partyId, request)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-myslt-text-secondary">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Submitted: {formatDate(request.submittedAt)}
                        </span>
                        <span className={`${isOverdue ? 'text-red-600' : daysRemaining <= 7 ? 'text-yellow-600' : 'text-myslt-text-secondary'}`}>
                          {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days remaining`}
                        </span>
                      </div>
                      
                      {request.description && (
                        <p className="text-sm text-gray-700 mt-2">{request.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => viewRequestDetails(request)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApproveRequest(request.id)}
                          disabled={processing === request.id}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          disabled={processing === request.id}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                        >
                          <X className="w-3 h-3" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}
                    
                    {request.status === 'approved' && (
                      <button
                        onClick={() => handleStartProcessing(request.id)}
                        disabled={processing === request.id}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                      >
                        <Play className="w-3 h-3" />
                        <span>Start Processing</span>
                      </button>
                    )}
                    
                    {request.status === 'in_progress' && (
                      <button
                        onClick={() => handleCompleteRequest(request.id)}
                        disabled={processing === request.id}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>Complete</span>
                      </button>
                    )}
                    
                    {request.status === 'completed' && (
                      <button
                        onClick={() => downloadRequestData(request.id)}
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
                        <span className="text-sm text-myslt-text-secondary">Processing...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Approval/Rejection Modal */}
      {showApprovalModal && pendingAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-myslt-text-primary">
                  {pendingAction.action === 'approve' ? 'Approve DSAR Request' : 'Reject DSAR Request'}
                </h3>
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setPendingAction(null);
                    setApprovalNotes('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  {pendingAction.action === 'approve' 
                    ? 'Are you sure you want to approve this DSAR request? This will allow the request to proceed to processing.'
                    : 'Are you sure you want to reject this DSAR request? Please provide a reason for rejection.'
                  }
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {pendingAction.action === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason (Required)'}
                </label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder={pendingAction.action === 'approve' 
                    ? 'Add any notes about the approval...'
                    : 'Please provide a reason for rejection...'
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  required={pendingAction.action === 'reject'}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setPendingAction(null);
                    setApprovalNotes('');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  disabled={pendingAction.action === 'reject' && !approvalNotes.trim()}
                  className={`px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                    pendingAction.action === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {pendingAction.action === 'approve' ? 'Approve Request' : 'Reject Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-myslt-text-primary">DSAR Request Details</h3>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedRequest(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Request ID</label>
                    <p className="mt-1 text-sm text-myslt-text-primary">{selectedRequest.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer</label>
                    <p className="mt-1 text-sm text-myslt-text-primary">
                      {getCustomerName(selectedRequest.partyId, selectedRequest)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Request Type</label>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRequestTypeColor(selectedRequest.requestType)}`}>
                      {selectedRequest.requestType}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                      {getStatusIcon(selectedRequest.status)}
                      <span className="ml-1">{selectedRequest.status}</span>
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Submitted</label>
                    <p className="mt-1 text-sm text-myslt-text-primary">{formatDate(selectedRequest.submittedAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Days Remaining</label>
                    <p className="mt-1 text-sm text-myslt-text-primary">
                      {calculateDaysRemaining(selectedRequest.submittedAt)} days
                    </p>
                  </div>
                </div>
                {selectedRequest.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-myslt-text-primary">{selectedRequest.description}</p>
                  </div>
                )}
                {selectedRequest.processingNotes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Processing Notes</label>
                    <p className="mt-1 text-sm text-myslt-text-primary">{selectedRequest.processingNotes}</p>
                  </div>
                )}
                {selectedRequest.processedBy && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Processed By</label>
                    <p className="mt-1 text-sm text-myslt-text-primary">{selectedRequest.processedBy}</p>
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

export default DSARRequestPanel;
