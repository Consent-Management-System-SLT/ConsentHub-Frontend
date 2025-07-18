import React, { useState } from 'react';
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

interface DSARRequest {
  id: string;
  customerId: string;
  customerName: string;
  email: string;
  requestType: 'access' | 'portability' | 'deletion' | 'rectification' | 'restriction';
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requestDate: string;
  dueDate: string;
  assignedTo?: string;
  description: string;
  attachments: number;
}

const DSARManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<DSARRequest | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignmentData, setAssignmentData] = useState<DSARRequest | null>(null);

  const handleViewRequest = (request: DSARRequest) => {
    setModalData(request);
    setShowModal(true);
  };

  const handleAssignRequest = (request: DSARRequest) => {
    setAssignmentData(request);
    setShowAssignModal(true);
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    alert(`Request ${requestId} status changed to ${newStatus}`);
  };

  const handleBulkAssign = async (assignee: string) => {
    if (selectedRequests.size === 0) return;
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert(`Assigned ${selectedRequests.size} requests to ${assignee}`);
    setSelectedRequests(new Set());
  };

  const handleExportRequests = () => {
    const dataToExport = filteredRequests.map(request => ({
      id: request.id,
      customerName: request.customerName,
      email: request.email,
      requestType: request.requestType,
      status: request.status,
      priority: request.priority,
      requestDate: request.requestDate,
      dueDate: request.dueDate,
      assignedTo: request.assignedTo,
      description: request.description
    }));
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dsar-requests-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSelectRequest = (id: string) => {
    const newSelected = new Set(selectedRequests);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRequests(newSelected);
  };

  const staffMembers = [
    'Sarah Wilson', 'Mike Johnson', 'Alice Brown', 'David Chen', 'Emma Davis'
  ];

  // Mock data
  const requests: DSARRequest[] = [
    {
      id: 'DSAR-001',
      customerId: 'CUST001',
      customerName: 'John Doe',
      email: 'john.doe@example.com',
      requestType: 'access',
      status: 'pending',
      priority: 'high',
      requestDate: '2024-01-25',
      dueDate: '2024-02-25',
      assignedTo: 'Sarah Wilson',
      description: 'Request for all personal data held by the company',
      attachments: 2
    },
    {
      id: 'DSAR-002',
      customerId: 'CUST002',
      customerName: 'Jane Smith',
      email: 'jane.smith@example.com',
      requestType: 'deletion',
      status: 'in-progress',
      priority: 'medium',
      requestDate: '2024-01-20',
      dueDate: '2024-02-20',
      assignedTo: 'Mike Johnson',
      description: 'Request to delete all personal data',
      attachments: 0
    },
    {
      id: 'DSAR-003',
      customerId: 'CUST003',
      customerName: 'Bob Wilson',
      email: 'bob.wilson@example.com',
      requestType: 'portability',
      status: 'completed',
      priority: 'low',
      requestDate: '2024-01-15',
      dueDate: '2024-02-15',
      assignedTo: 'Alice Brown',
      description: 'Request for data export in machine-readable format',
      attachments: 1
    },
    {
      id: 'DSAR-004',
      customerId: 'CUST004',
      customerName: 'Emma Davis',
      email: 'emma.davis@example.com',
      requestType: 'rectification',
      status: 'pending',
      priority: 'urgent',
      requestDate: '2024-01-28',
      dueDate: '2024-02-28',
      description: 'Request to correct incorrect personal information',
      attachments: 3
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'in-progress':
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'access':
        return 'bg-blue-100 text-blue-800';
      case 'portability':
        return 'bg-purple-100 text-purple-800';
      case 'deletion':
        return 'bg-red-100 text-red-800';
      case 'rectification':
        return 'bg-green-100 text-green-800';
      case 'restriction':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesType = typeFilter === 'all' || request.requestType === typeFilter;
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">DSAR Requests</h1>
          <p className="text-gray-600 mt-2">Manage Data Subject Access Requests</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExportRequests}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Export</span>
          </button>
          {selectedRequests.size > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{selectedRequests.size} selected</span>
              <select 
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkAssign(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Bulk Assign</option>
                {staffMembers.map(member => (
                  <option key={member} value={member}>{member}</option>
                ))}
              </select>
            </div>
          )}
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {requests.filter(r => r.status === 'pending').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">
                {requests.filter(r => r.status === 'in-progress').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {requests.filter(r => r.status === 'completed').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Urgent</p>
              <p className="text-2xl font-bold text-red-600">
                {requests.filter(r => r.priority === 'urgent').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="access">Access</option>
                  <option value="portability">Portability</option>
                  <option value="deletion">Deletion</option>
                  <option value="rectification">Rectification</option>
                  <option value="restriction">Restriction</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              
              <div className="relative">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">More Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{request.id}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(request.requestDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{request.customerName}</div>
                        <div className="text-sm text-gray-500">{request.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getTypeColor(request.requestType)}`}>
                      {request.requestType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(request.status)}
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      {new Date(request.dueDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.assignedTo || (
                      <span className="text-gray-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-50 rounded">
                        <Archive className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-500">
          Showing {filteredRequests.length} of {requests.length} requests
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
            Previous
          </button>
          <button className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
            1
          </button>
          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DSARManager;
