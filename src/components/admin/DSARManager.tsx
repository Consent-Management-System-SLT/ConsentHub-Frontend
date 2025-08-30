import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye,
  XCircle,
  AlertCircle,
  Calendar,
  User,
  ChevronDown,
  RefreshCw,
  Archive,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle
} from 'lucide-react';
import ServerConnectionAlert from '../shared/ServerConnectionAlert';

const DSARManager: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const loadDSARRequests = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Loading DSAR requests...');
      
      // Get token from localStorage (this is where the auth context stores it)
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Direct API call to match our working test
      const response = await fetch('http://localhost:3001/api/v1/dsar/requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('DSAR response:', data);
      
      // Handle the direct backend response structure
      let requestsArray: any[] = [];
      if (data && data.requests && Array.isArray(data.requests)) {
        requestsArray = data.requests;
        
        // Validate and log data structure issues
        requestsArray.forEach((request, index) => {
          if (!request.status) {
            console.warn(`Request at index ${index} missing status:`, request);
          }
          if (!request.priority) {
            console.warn(`Request at index ${index} missing priority:`, request);
          }
          if (!request.requestType) {
            console.warn(`Request at index ${index} missing requestType:`, request);
          }
        });
      } else {
        console.warn('Unexpected response structure:', data);
        requestsArray = [];
      }
      
      console.log('Setting requests:', requestsArray);
      setRequests(requestsArray);
    } catch (err) {
      console.error('Failed to load DSAR requests:', err);
      setError(`Failed to load DSAR requests: ${(err as Error).message || 'Unknown error'}`);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDSARRequests();
  }, []);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Force refresh when component mounts to ensure latest data
  useEffect(() => {
    const timer = setTimeout(() => {
      if (requests.length === 0 && !loading && !error) {
        loadDSARRequests();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [requests.length, loading, error]);

  const filteredRequests = Array.isArray(requests) ? requests.filter(request => {
    const email = request.requesterEmail || request.customerEmail || '';
    const name = request.requesterName || request.customerName || '';
    const requestId = request.requestId || '';
    const subject = request.subject || '';
    const requestType = request.requestType || '';
    
    const matchesSearch = !searchTerm || 
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      requestType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) : [];

  // Pagination calculation
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

    // Add manual refresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadDSARRequests();
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('authToken'); // Fixed: use 'authToken' not 'token'
      console.log('Export: checking token...', token ? 'Token found' : 'No token found');
      
      if (!token) {
        alert('Please log in again to export data');
        throw new Error('No authentication token found');
      }
      
      console.log('Export: Making request to CSV endpoint...');
      const response = await fetch('http://localhost:3001/api/v1/dsar/export/csv', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Export: Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Export: Error response:', errorData);
        throw new Error(`Export failed (${response.status}): ${errorData || response.statusText}`);
      }
      
      const csvData = await response.text();
      console.log('Export: CSV data length:', csvData.length);
      
      // Check if we actually got CSV data
      if (!csvData || csvData.trim().length === 0) {
        throw new Error('No data available for export');
      }
      
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dsar-requests-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Show success message
      console.log('Export: Download completed successfully');
      alert('DSAR requests exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${(error as Error).message}`);
    }
  };

  // DSAR Request Status Update Functions
  const updateDSARStatus = async (requestId: string, status: string, processingNote?: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log(`🔄 Updating DSAR request ${requestId} to status: ${status}`);

      const updateData: any = { status };
      if (processingNote) {
        updateData.processingNote = processingNote;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://consenthub-backend.onrender.com'}/api/v1/dsar/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to update DSAR request: ${response.status} ${errorData}`);
      }

      const result = await response.json();
      console.log('✅ DSAR request updated successfully:', result);

      // Reload requests to show updated status
      await loadDSARRequests();
      
      return result;
    } catch (error) {
      console.error('❌ Failed to update DSAR status:', error);
      throw error;
    }
  };

  const handleApproveRequest = async (request: any) => {
    try {
      if (!confirm(`Are you sure you want to approve the DSAR request from ${request.requesterEmail}?`)) {
        return;
      }
      
      console.log('🟢 Approving DSAR request:', request);
      
      const processingNote = `Request approved by CSR on ${new Date().toLocaleDateString()}. Processing ${request.requestType} request for ${request.requesterEmail}`;
      
      await updateDSARStatus(request._id || request.id, 'in_progress', processingNote);
      
      alert(`✅ DSAR request ${request.requestId || request.id} has been approved and is now in progress.\n\nThe customer will be notified of this status change.`);
    } catch (error) {
      alert(`❌ Failed to approve request: ${(error as Error).message}`);
    }
  };

  const handleRejectRequest = async (request: any) => {
    try {
      const reason = prompt('⚠️ Please provide a clear reason for rejecting this DSAR request:\n\nThis reason will be shared with the customer.');
      
      if (!reason || reason.trim() === '') {
        alert('Rejection reason is required and cannot be empty.');
        return;
      }

      if (!confirm(`Are you sure you want to reject the DSAR request from ${request.requesterEmail}?\n\nReason: ${reason}`)) {
        return;
      }

      console.log('🔴 Rejecting DSAR request:', request);
      
      const processingNote = `Request rejected by CSR on ${new Date().toLocaleDateString()}. Reason: ${reason}`;
      
      await updateDSARStatus(request._id || request.id, 'rejected', processingNote);
      
      alert(`❌ DSAR request ${request.requestId || request.id} has been rejected.\n\nThe customer will be notified with the provided reason.`);
    } catch (error) {
      alert(`❌ Failed to reject request: ${(error as Error).message}`);
    }
  };

  const handleCompleteRequest = async (request: any) => {
    try {
      if (!confirm(`Are you sure you want to mark the DSAR request from ${request.requesterEmail} as completed?\n\nThis indicates the request has been fully processed.`)) {
        return;
      }
      
      console.log('✅ Completing DSAR request:', request);
      
      const processingNote = `Request completed by CSR on ${new Date().toLocaleDateString()}. ${request.requestType} has been fully processed for ${request.requesterEmail}`;
      
      await updateDSARStatus(request._id || request.id, 'completed', processingNote);
      
      alert(`✅ DSAR request ${request.requestId || request.id} has been marked as completed.\n\nThe customer will be notified that their request has been processed.`);
    } catch (error) {
      alert(`❌ Failed to complete request: ${(error as Error).message}`);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-myslt-card rounded"></div>
          <div className="h-16 bg-myslt-card rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-myslt-card rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <ServerConnectionAlert />
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-myslt-text-primary">DSAR Management</h1>
          <p className="text-myslt-text-secondary mt-1">Manage Data Subject Access Requests</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className={`myslt-btn-secondary flex items-center gap-2 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          
          <button
            onClick={handleExport}
            className="myslt-btn-primary flex items-center gap-2 px-4 py-2"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-myslt-danger/20 border border-myslt-danger/30 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-myslt-danger mr-2" />
            <p className="text-myslt-text-primary">{error}</p>
            <button 
              onClick={loadDSARRequests}
              className="ml-auto px-3 py-1 text-sm bg-myslt-danger/20 hover:bg-myslt-danger/30 text-myslt-danger rounded"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="myslt-card p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-myslt-text-muted" />
              <input
                type="text"
                placeholder="Search by request ID, email, name, type, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="myslt-input w-full pl-10 pr-10 py-2"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-myslt-text-muted hover:text-myslt-text-secondary"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="myslt-input px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-review">In Review</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="text-sm text-myslt-text-secondary mb-4">
        {filteredRequests.length > 0 ? (
          <>
            Showing {Math.min(startIndex + 1, filteredRequests.length)} to {Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length} requests
            {filteredRequests.length < requests.length && (
              <span className="ml-2 text-myslt-text-accent">({requests.length} total)</span>
            )}
          </>
        ) : (
          `${requests.length} total requests`
        )}
      </div>

      {/* Request List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="myslt-card p-8 text-center">
            <Archive className="h-12 w-12 text-myslt-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-myslt-text-primary mb-2">No requests found</h3>
            <p className="text-myslt-text-secondary">
              {searchTerm || statusFilter !== 'all'
                ? "Try adjusting your search criteria or filters."
                : "No DSAR requests have been submitted yet."}
            </p>
          </div>
        ) : (
          paginatedRequests.map((request) => (
            <div key={request._id} className="myslt-card p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-myslt-text-primary">{request.requestId}</h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          request.status === 'pending'
                            ? 'bg-myslt-warning/20 text-myslt-warning border border-myslt-warning/30'
                            : request.status === 'in_progress'
                            ? 'bg-myslt-info/20 text-myslt-info border border-myslt-info/30'
                            : request.status === 'completed'
                            ? 'bg-myslt-success/20 text-myslt-success border border-myslt-success/30'
                            : request.status === 'rejected'
                            ? 'bg-myslt-danger/20 text-myslt-danger border border-myslt-danger/30'
                            : 'bg-myslt-muted/20 text-myslt-text-muted border border-myslt-muted/30'
                        }`}
                      >
                        {request.status ? request.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
                      </span>
                      
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          request.priority === 'high'
                            ? 'bg-myslt-danger/20 text-myslt-danger border border-myslt-danger/30'
                            : request.priority === 'medium'
                            ? 'bg-myslt-warning/20 text-myslt-warning border border-myslt-warning/30'
                            : 'bg-myslt-muted/20 text-myslt-text-muted border border-myslt-muted/30'
                        }`}
                      >
                        {request.priority ? request.priority.toUpperCase() : 'LOW'}
                      </span>

                      {request.sensitiveData && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-myslt-accent/20 text-myslt-accent border border-myslt-accent/30">
                          SENSITIVE
                        </span>
                      )}
                      
                      {request.isOverdue && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-myslt-danger/20 text-myslt-danger border border-myslt-danger/30">
                          OVERDUE
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-myslt-text-muted" />
                      <span className="text-sm">
                        <span className="font-medium text-myslt-text-primary">{request.requesterName || request.customerName || 'N/A'}</span>
                        <span className="text-myslt-text-secondary ml-2">({request.requesterEmail || request.customerEmail})</span>
                      </span>
                    </div>
                    
                    <p className="text-sm text-myslt-text-secondary">{request.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-myslt-text-muted">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Due: {request.dueDate ? new Date(request.dueDate).toLocaleDateString() : 'Unknown'}</span>
                        {request.daysRemaining !== null && (
                          <span className={`ml-1 ${request.daysRemaining < 0 ? 'text-myslt-danger' : request.daysRemaining <= 7 ? 'text-myslt-warning' : 'text-myslt-text-muted'}`}>
                            ({request.daysRemaining < 0 ? `${Math.abs(request.daysRemaining)} days overdue` : `${request.daysRemaining} days left`})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span>Type: </span>
                        <span className="font-medium">
                          {request.requestType === 'data_access' ? 'Data Access (Art. 15)' :
                           request.requestType === 'data_rectification' ? 'Data Rectification (Art. 16)' :
                           request.requestType === 'data_erasure' ? 'Data Erasure (Art. 17)' :
                           request.requestType === 'data_portability' ? 'Data Portability (Art. 20)' :
                           request.requestType === 'restrict_processing' ? 'Restrict Processing (Art. 18)' :
                           request.requestType === 'object_processing' ? 'Object to Processing (Art. 21)' :
                           (request.requestType ? request.requestType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'Unknown Request Type')}
                        </span>
                      </div>
                      {request.applicableLaws && request.applicableLaws.length > 0 && (
                        <div className="flex items-center gap-1">
                          <span>Laws: {request.applicableLaws.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2 ml-4">
                  {/* Status-based action buttons */}
                  {request.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApproveRequest(request)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors text-sm font-medium"
                        title="Approve and start processing this request"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors text-sm font-medium"
                        title="Reject this request with reason"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </button>
                    </>
                  )}
                  
                  {request.status === 'in_progress' && (
                    <button
                      onClick={() => handleCompleteRequest(request)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors text-sm font-medium"
                      title="Mark this request as completed"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Complete
                    </button>
                  )}
                  
                  {/* View Details Button - Always Available */}
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="flex items-center gap-1 px-3 py-1.5 text-myslt-accent hover:text-myslt-accent-hover hover:bg-myslt-accent/10 rounded-lg transition-colors text-sm font-medium"
                    title="View detailed information"
                  >
                    <Eye className="h-4 w-4" />
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredRequests.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-myslt-text-secondary">
            Showing {filteredRequests.length === 0 ? 0 : Math.min(startIndex + 1, filteredRequests.length)} to {Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length} requests
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="myslt-btn-secondary flex items-center gap-1 px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                  currentPage === page
                    ? 'bg-myslt-accent text-white'
                    : 'myslt-btn-secondary'
                }`}
              >
                {page}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="myslt-btn-secondary flex items-center gap-1 px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="myslt-card max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-myslt-border">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-myslt-text-primary">
                  Request Details - {selectedRequest.requestId}
                </h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-myslt-text-muted hover:text-myslt-text-secondary transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-myslt-text-primary mb-2">Request Information</h3>
                  <div className="space-y-1 text-sm">
                    <div><span className="font-medium text-myslt-text-primary">Type:</span> <span className="text-myslt-text-secondary">{selectedRequest.requestType ? selectedRequest.requestType.replace('-', ' ') : 'Unknown'}</span></div>
                    <div><span className="font-medium text-myslt-text-primary">Status:</span> <span className="text-myslt-text-secondary">{selectedRequest.status || 'Unknown'}</span></div>
                    <div><span className="font-medium text-myslt-text-primary">Priority:</span> <span className="text-myslt-text-secondary">{selectedRequest.priority || 'Unknown'}</span></div>
                    <div><span className="font-medium text-myslt-text-primary">Submitted:</span> <span className="text-myslt-text-secondary">{selectedRequest.submittedAt ? new Date(selectedRequest.submittedAt).toLocaleString() : 'Unknown'}</span></div>
                    <div><span className="font-medium text-myslt-text-primary">Due Date:</span> <span className="text-myslt-text-secondary">{selectedRequest.dueDate ? new Date(selectedRequest.dueDate).toLocaleString() : 'Unknown'}</span></div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-myslt-text-primary mb-2">Customer Information</h3>
                  <div className="space-y-1 text-sm">
                    <div><span className="font-medium text-myslt-text-primary">Name:</span> <span className="text-myslt-text-secondary">{selectedRequest.requesterName || selectedRequest.customerName || 'N/A'}</span></div>
                    <div><span className="font-medium text-myslt-text-primary">Email:</span> <span className="text-myslt-text-secondary">{selectedRequest.requesterEmail || selectedRequest.customerEmail}</span></div>
                    {selectedRequest.assignedTo && (
                      <div><span className="font-medium text-myslt-text-primary">Assigned To:</span> <span className="text-myslt-text-secondary">{selectedRequest.assignedTo}</span></div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-myslt-text-primary mb-2">Description</h3>
                <p className="text-sm text-myslt-text-secondary bg-myslt-muted/10 p-3 rounded-lg border border-myslt-border">{selectedRequest.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DSARManager;
