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
  X
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">DSAR Management</h1>
          <p className="text-gray-600 mt-1">Manage Data Subject Access Requests</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className={`flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
            <button 
              onClick={loadDSARRequests}
              className="ml-auto px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by request ID, email, name, type, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      <div className="text-sm text-gray-600 mb-4">
        {filteredRequests.length > 0 ? (
          <>
            Showing {Math.min(startIndex + 1, filteredRequests.length)} to {Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length} requests
            {filteredRequests.length < requests.length && (
              <span className="ml-2 text-blue-600">({requests.length} total)</span>
            )}
          </>
        ) : (
          `${requests.length} total requests`
        )}
      </div>

      {/* Request List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? "Try adjusting your search criteria or filters."
                : "No DSAR requests have been submitted yet."}
            </p>
          </div>
        ) : (
          paginatedRequests.map((request) => (
            <div key={request._id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">{request.requestId}</h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          request.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : request.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : request.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : request.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {request.status.replace('_', ' ').toUpperCase()}
                      </span>
                      
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          request.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : request.priority === 'medium'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {request.priority.toUpperCase()}
                      </span>

                      {request.sensitiveData && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                          SENSITIVE
                        </span>
                      )}
                      
                      {request.isOverdue && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          OVERDUE
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        <span className="font-medium">{request.requesterName || request.customerName || 'N/A'}</span>
                        <span className="text-gray-500 ml-2">({request.requesterEmail || request.customerEmail})</span>
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700">{request.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Due: {new Date(request.dueDate).toLocaleDateString()}</span>
                        {request.daysRemaining !== null && (
                          <span className={`ml-1 ${request.daysRemaining < 0 ? 'text-red-600' : request.daysRemaining <= 7 ? 'text-yellow-600' : 'text-gray-500'}`}>
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
                           request.requestType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
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
                
                <button
                  onClick={() => setSelectedRequest(request)}
                  className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                >
                  <Eye className="h-4 w-4" />
                  <span className="text-sm">View</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredRequests.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500">
            Showing {filteredRequests.length === 0 ? 0 : Math.min(startIndex + 1, filteredRequests.length)} to {Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length} requests
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Request Details - {selectedRequest.requestId}
                </h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Request Information</h3>
                  <div className="space-y-1 text-sm">
                    <div><span className="font-medium">Type:</span> {selectedRequest.requestType.replace('-', ' ')}</div>
                    <div><span className="font-medium">Status:</span> {selectedRequest.status}</div>
                    <div><span className="font-medium">Priority:</span> {selectedRequest.priority}</div>
                    <div><span className="font-medium">Submitted:</span> {new Date(selectedRequest.submittedAt).toLocaleString()}</div>
                    <div><span className="font-medium">Due Date:</span> {new Date(selectedRequest.dueDate).toLocaleString()}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Customer Information</h3>
                  <div className="space-y-1 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedRequest.requesterName || selectedRequest.customerName || 'N/A'}</div>
                    <div><span className="font-medium">Email:</span> {selectedRequest.requesterEmail || selectedRequest.customerEmail}</div>
                    {selectedRequest.assignedTo && (
                      <div><span className="font-medium">Assigned To:</span> {selectedRequest.assignedTo}</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{selectedRequest.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DSARManager;
