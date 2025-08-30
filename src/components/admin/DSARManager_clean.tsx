import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Calendar,
  User,
  ChevronDown,
  RefreshCw,
  Archive,
  MessageSquare
} from 'lucide-react';
import ServerConnectionAlert from '../shared/ServerConnectionAlert';
import { dsarService } from '../../services/dsarService';

interface DSARRequest {
  _id: string;
  requestId: string;
  requestType: 'access' | 'rectification' | 'erasure' | 'restriction' | 'portability' | 'objection' | 'consent-withdrawal' | 'automated-decision-opt-out';
  status: 'pending' | 'in-review' | 'in-progress' | 'completed' | 'rejected' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  description: string;
  legalBasis?: string;
  submittedAt: string;
  updatedAt: string;
  dueDate: string;
  assignedTo?: string;
  resolutionNotes?: string;
  attachments?: string[];
  processingDetails?: {
    dataCategories: string[];
    systemsInvolved: string[];
    dataRetentionPeriods: string[];
    thirdPartySharing: boolean;
    crossBorderTransfers: boolean;
  };
  communicationLog?: Array<{
    timestamp: string;
    type: 'email' | 'phone' | 'internal';
    content: string;
    direction: 'inbound' | 'outbound';
    handledBy: string;
  }>;
  complianceChecks?: {
    identityVerified: boolean;
    requestValid: boolean;
    dataMinimization: boolean;
    retentionCompliance: boolean;
    thirdPartyNotified: boolean;
  };
  riskAssessment?: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
    mitigationSteps: string[];
  };
  isOverdue?: boolean;
}

interface DSARStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  avgResolutionTime: number;
}

const DSARManager: React.FC = () => {
  const [requests, setRequests] = useState<DSARRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<DSARRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<DSARRequest | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [stats, setStats] = useState<DSARStats | null>(null);

  const loadDSARRequests = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await dsarService.getDSARRequests();
      setRequests(response.requests || response || []);
      
      // Load stats
      try {
        const statsResponse = await dsarService.getDSARStats();
        setStats(statsResponse);
      } catch (statsError) {
        console.warn('Failed to load stats:', statsError);
      }
      
    } catch (err) {
      console.error('Failed to load DSAR requests:', err);
      setError('Failed to load DSAR requests. Please try again.');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDSARRequests();
  }, []);

  useEffect(() => {
    let filtered = requests;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(request => 
        request.requestId.toLowerCase().includes(searchLower) ||
        request.customerEmail.toLowerCase().includes(searchLower) ||
        (request.customerName && request.customerName.toLowerCase().includes(searchLower)) ||
        request.description.toLowerCase().includes(searchLower) ||
        request.requestType.toLowerCase().includes(searchLower) ||
        request.status.toLowerCase().includes(searchLower)
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(request => request.status === filterStatus);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(request => request.priority === filterPriority);
    }

    setFilteredRequests(filtered);
  }, [requests, searchTerm, filterStatus, filterPriority]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'in-progress':
      case 'in-review':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleExportRequests = async () => {
    try {
      // Export as CSV using our backend service
      const response = await dsarService.exportDSARRequests('csv', {
        status: filterStatus !== 'all' ? filterStatus : undefined,
        priority: filterPriority !== 'all' ? filterPriority : undefined,
        search: searchTerm || undefined
      });
      
      // Create and download the file
      const blob = new Blob([response], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dsar-requests-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export failed:', error);
      // Fallback to JSON export if CSV fails
      const dataToExport = filteredRequests.map(request => ({
        'Request ID': request.requestId,
        'Type': request.requestType,
        'Status': request.status,
        'Priority': request.priority,
        'Customer Email': request.customerEmail,
        'Customer Name': request.customerName || 'N/A',
        'Description': request.description,
        'Submitted': new Date(request.submittedAt).toLocaleDateString(),
        'Due Date': new Date(request.dueDate).toLocaleDateString(),
        'Assigned To': request.assignedTo || 'Unassigned'
      }));
      
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dsar-requests-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
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

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">DSAR Management</h1>
          <p className="text-gray-600 mt-1">Manage Data Subject Access Requests</p>
        </div>
        
        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full sm:w-auto">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-xs text-blue-600">Total</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-xs text-yellow-600">Pending</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-xs text-green-600">Completed</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <div className="text-xs text-red-600">Overdue</div>
            </div>
          </div>
        )}
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

      {/* Controls */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by request ID, email, name, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Actions - Desktop */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg"
            >
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters</span>
              <ChevronDown className={`h-4 w-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            <button
              onClick={loadDSARRequests}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="text-sm font-medium">Refresh</span>
            </button>
            
            <button
              onClick={handleExportRequests}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              <Download className="h-4 w-4" />
              <span className="text-sm font-medium text-gray-700 hidden sm:inline">Export</span>
            </button>
          </div>
          
          {/* Actions - Mobile */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg"
            >
              <Filter className="h-4 w-4" />
              <span className="text-xs font-medium truncate">Filters</span>
            </button>
            
            <button
              onClick={loadDSARRequests}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="text-xs font-medium truncate">Refresh</span>
            </button>
            
            <button
              onClick={handleExportRequests}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              <Download className="h-4 w-4" />
              <span className="text-xs font-medium text-gray-700 truncate">Export</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in-review">In Review</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredRequests.length} of {requests.length} requests
        </span>
        {(searchTerm || filterStatus !== 'all' || filterPriority !== 'all') && (
          <button 
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
              setFilterPriority('all');
            }}
            className="text-blue-600 hover:text-blue-700"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Request List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No DSAR requests found</h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                ? "Try adjusting your search criteria or filters."
                : "No DSAR requests have been submitted yet."}
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => {
            const daysUntilDue = getDaysUntilDue(request.dueDate);
            const isOverdue = daysUntilDue < 0;
            const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;
            
            return (
              <div key={request._id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Main Content */}
                    <div className="flex-1 space-y-3">
                      {/* Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">{request.requestId}</h3>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(request.status)}
                            <span className="capitalize text-sm font-medium text-gray-600">
                              {request.status.replace('-', ' ')}
                            </span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(request.priority)}`}>
                            {request.priority.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {formatDate(request.dueDate)}</span>
                          {isOverdue && (
                            <span className="text-red-600 font-medium">
                              ({Math.abs(daysUntilDue)} days overdue)
                            </span>
                          )}
                          {isDueSoon && !isOverdue && (
                            <span className="text-amber-600 font-medium">
                              ({daysUntilDue} days left)
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Request Details */}
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              <span className="font-medium">{request.customerName || 'N/A'}</span>
                              <span className="text-gray-500 ml-2">({request.customerEmail})</span>
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Type: <span className="font-medium capitalize">{request.requestType.replace('-', ' ')}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {request.description}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-gray-500">
                          <div className="flex gap-4">
                            <span>Submitted: {formatDate(request.submittedAt)}</span>
                            {request.assignedTo && (
                              <span>Assigned: {request.assignedTo}</span>
                            )}
                          </div>
                          {request.communicationLog && request.communicationLog.length > 0 && (
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              <span>{request.communicationLog.length} communications</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex lg:flex-col gap-2">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="text-sm font-medium">View Details</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Progress Indicators */}
                {request.complianceChecks && (
                  <div className="px-6 pb-4">
                    <div className="flex gap-2 text-xs">
                      {request.complianceChecks.identityVerified && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">ID Verified</span>
                      )}
                      {request.complianceChecks.requestValid && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Valid Request</span>
                      )}
                      {request.riskAssessment?.riskLevel && (
                        <span className={`px-2 py-1 rounded ${
                          request.riskAssessment.riskLevel === 'critical' ? 'bg-red-100 text-red-800' :
                          request.riskAssessment.riskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                          request.riskAssessment.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          Risk: {request.riskAssessment.riskLevel}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  DSAR Request Details - {selectedRequest.requestId}
                </h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Request Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Type:</span> {selectedRequest.requestType.replace('-', ' ')}</div>
                    <div><span className="font-medium">Status:</span> {selectedRequest.status}</div>
                    <div><span className="font-medium">Priority:</span> {selectedRequest.priority}</div>
                    <div><span className="font-medium">Submitted:</span> {formatDate(selectedRequest.submittedAt)}</div>
                    <div><span className="font-medium">Due Date:</span> {formatDate(selectedRequest.dueDate)}</div>
                    {selectedRequest.assignedTo && (
                      <div><span className="font-medium">Assigned To:</span> {selectedRequest.assignedTo}</div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedRequest.customerName || 'N/A'}</div>
                    <div><span className="font-medium">Email:</span> {selectedRequest.customerEmail}</div>
                    {selectedRequest.customerPhone && (
                      <div><span className="font-medium">Phone:</span> {selectedRequest.customerPhone}</div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Description */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Description</h3>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{selectedRequest.description}</p>
              </div>
              
              {/* Processing Details */}
              {selectedRequest.processingDetails && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Processing Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {selectedRequest.processingDetails.dataCategories && (
                      <div>
                        <span className="font-medium">Data Categories:</span>
                        <ul className="list-disc list-inside mt-1 text-gray-600">
                          {selectedRequest.processingDetails.dataCategories.map((category, index) => (
                            <li key={index}>{category}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selectedRequest.processingDetails.systemsInvolved && (
                      <div>
                        <span className="font-medium">Systems Involved:</span>
                        <ul className="list-disc list-inside mt-1 text-gray-600">
                          {selectedRequest.processingDetails.systemsInvolved.map((system, index) => (
                            <li key={index}>{system}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Communication Log */}
              {selectedRequest.communicationLog && selectedRequest.communicationLog.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Communication Log</h3>
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {selectedRequest.communicationLog.map((comm, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded text-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{comm.type} - {comm.direction}</span>
                          <span className="text-gray-500">{formatDate(comm.timestamp)}</span>
                        </div>
                        <p className="text-gray-700">{comm.content}</p>
                        <p className="text-gray-500 text-xs mt-1">Handled by: {comm.handledBy}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Resolution Notes */}
              {selectedRequest.resolutionNotes && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Resolution Notes</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{selectedRequest.resolutionNotes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DSARManager;
