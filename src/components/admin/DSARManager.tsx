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
  // Add global style to prevent horizontal scrolling
  React.useEffect(() => {
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.overflowX = 'hidden';
    
    return () => {
      document.body.style.overflowX = 'auto';
      document.documentElement.style.overflowX = 'auto';
    };
  }, []);

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
    <div className="min-h-screen bg-gray-50 overflow-x-hidden w-full">
      <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8 w-full box-border">
        {/* Header */}
        <div className="flex flex-col space-y-4 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">DSAR Requests</h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Manage Data Subject Access Requests</p>
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center space-x-3">
              <button 
                onClick={handleExportRequests}
                className="px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">Export</span>
              </button>
              {selectedRequests.size > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 hidden lg:inline">{selectedRequests.size} selected</span>
                  <select 
                    onChange={(e) => {
                      if (e.target.value) {
                        handleBulkAssign(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Assign</option>
                    {staffMembers.map(member => (
                      <option key={member} value={member}>{member}</option>
                    ))}
                  </select>
                </div>
              )}
              <button className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="flex sm:hidden items-center justify-between space-x-1 w-full overflow-hidden">
            <div className="flex items-center space-x-1 flex-1 min-w-0">
              <button 
                onClick={handleExportRequests}
                className="flex-1 px-2 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-1 min-w-0"
              >
                <Download className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-xs font-medium text-gray-700 truncate">Export</span>
              </button>
              {selectedRequests.size > 0 && (
                <select 
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkAssign(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="px-2 py-2 border border-gray-300 rounded-lg text-xs bg-white min-w-0 max-w-24"
                >
                  <option value="">Assign ({selectedRequests.size})</option>
                  {staffMembers.map(member => (
                    <option key={member} value={member}>{member}</option>
                  ))}
                </select>
              )}
            </div>
            <button className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex-shrink-0">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-6 mb-6 sm:mb-8 w-full overflow-hidden">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 min-w-0">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Pending</p>
                <p className="text-lg sm:text-2xl font-bold text-yellow-600 truncate">
                  {requests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ml-2">
                <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 min-w-0">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">In Progress</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-600 truncate">
                  {requests.filter(r => r.status === 'in-progress').length}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ml-2">
                <AlertCircle className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 min-w-0">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Completed</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600 truncate">
                  {requests.filter(r => r.status === 'completed').length}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ml-2">
                <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 min-w-0">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Urgent</p>
                <p className="text-lg sm:text-2xl font-bold text-red-600 truncate">
                  {requests.filter(r => r.priority === 'urgent').length}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-red-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ml-2">
                <AlertCircle className="w-4 h-4 sm:w-6 sm:h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8 w-full overflow-hidden">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 sm:py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-base sm:text-sm min-w-0"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 flex-1 min-w-0">
              <div className="relative min-w-0">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-3 sm:py-2 pr-8 focus:ring-2 focus:ring-red-500 focus:border-transparent text-base sm:text-sm min-w-0"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
              
              <div className="relative min-w-0">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-3 sm:py-2 pr-8 focus:ring-2 focus:ring-red-500 focus:border-transparent text-base sm:text-sm min-w-0"
                >
                  <option value="all">All Types</option>
                  <option value="access">Access</option>
                  <option value="portability">Portability</option>
                  <option value="deletion">Deletion</option>
                  <option value="rectification">Rectification</option>
                  <option value="restriction">Restriction</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
              
              <div className="relative min-w-0">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-3 sm:py-2 pr-8 focus:ring-2 focus:ring-red-500 focus:border-transparent text-base sm:text-sm min-w-0"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>
            
            <div className="mt-3 sm:mt-0 sm:ml-4 flex-shrink-0">
              <button className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center space-x-2 text-base sm:text-sm">
                <Filter className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-700">More Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Requests Display - Desktop Table and Mobile Cards */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full">
          {/* Desktop Table View */}
          <div className="hidden lg:block w-full overflow-hidden">
            <div className="w-full">
              <table className="w-full table-fixed">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-24 px-3 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider truncate">
                      ID
                    </th>
                    <th className="w-52 px-3 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider truncate">
                      Customer
                    </th>
                    <th className="w-20 px-3 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider truncate">
                      Type
                    </th>
                    <th className="w-24 px-3 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider truncate">
                      Status
                    </th>
                    <th className="w-20 px-3 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider truncate">
                      Priority
                    </th>
                    <th className="w-24 px-3 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider truncate">
                      Due Date
                    </th>
                    <th className="w-28 px-3 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider truncate">
                      Assigned
                    </th>
                    <th className="w-20 px-3 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider truncate">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-3 py-4 w-24 overflow-hidden">
                        <div className="text-sm font-medium text-gray-900 truncate">{request.id}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {new Date(request.requestDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-3 py-4 w-52 overflow-hidden">
                        <div className="flex items-center min-w-0">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="ml-2 min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 truncate">{request.customerName}</div>
                            <div className="text-xs text-gray-500 truncate">{request.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 w-20 overflow-hidden">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize truncate ${getTypeColor(request.requestType)}`}>
                          {request.requestType}
                        </span>
                      </td>
                      <td className="px-3 py-4 w-24 overflow-hidden">
                        <div className="flex items-center min-w-0">
                          {getStatusIcon(request.status)}
                          <span className={`ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize truncate ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-4 w-20 overflow-hidden">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize truncate ${getPriorityColor(request.priority)}`}>
                          {request.priority}
                        </span>
                      </td>
                      <td className="px-3 py-4 w-24 overflow-hidden text-sm text-gray-900">
                        <div className="flex items-center min-w-0">
                          <Calendar className="w-3 h-3 text-gray-400 mr-1 flex-shrink-0" />
                          <span className="text-xs truncate">{new Date(request.dueDate).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-3 py-4 w-28 overflow-hidden text-sm text-gray-900">
                        <span className="truncate block">
                          {request.assignedTo || (
                            <span className="text-gray-400">Unassigned</span>
                          )}
                        </span>
                      </td>
                      <td className="px-3 py-4 w-20 overflow-hidden text-sm font-medium">
                        <div className="flex items-center space-x-1">
                          <button className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded">
                            <Eye className="w-3 h-3" />
                          </button>
                          <button className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded">
                            <MessageSquare className="w-3 h-3" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-50 rounded">
                            <Archive className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden divide-y divide-gray-200 w-full">
            {filteredRequests.map((request) => (
              <div key={request.id} className="p-4 sm:p-6 space-y-4 w-full min-w-0">
                {/* Header Row */}
                <div className="flex items-center justify-between min-w-0">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-base sm:text-lg font-semibold text-gray-900 truncate">{request.id}</div>
                      <div className="text-sm text-gray-500 truncate">{request.customerName}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getPriorityColor(request.priority)} hidden sm:inline-flex`}>
                      {request.priority}
                    </span>
                    <div className="flex items-center">
                      {getStatusIcon(request.status)}
                      <span className={`ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Priority Badge for Mobile */}
                <div className="sm:hidden">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getPriorityColor(request.priority)}`}>
                    Priority: {request.priority}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm w-full">
                  <div className="min-w-0">
                    <span className="font-medium text-gray-600">Email:</span>
                    <span className="ml-2 text-gray-900 break-all">{request.email}</span>
                  </div>
                  <div className="min-w-0">
                    <span className="font-medium text-gray-600">Type:</span>
                    <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${getTypeColor(request.requestType)}`}>
                      {request.requestType}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="font-medium text-gray-600">Request Date:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(request.requestDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="font-medium text-gray-600">Due Date:</span>
                    <span className="ml-2 text-gray-900 flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-1 flex-shrink-0" />
                      <span className="truncate">{new Date(request.dueDate).toLocaleDateString()}</span>
                    </span>
                  </div>
                  <div className="sm:col-span-2 min-w-0">
                    <span className="font-medium text-gray-600">Assigned To:</span>
                    <span className="ml-2 text-gray-900 truncate">
                      {request.assignedTo || <span className="text-gray-400">Unassigned</span>}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {request.description && (
                  <div className="min-w-0">
                    <span className="font-medium text-gray-600">Description:</span>
                    <p className="mt-1 text-sm text-gray-700 break-words">{request.description}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 min-w-0">
                  <div className="text-xs text-gray-500 truncate">
                    {request.attachments} attachment{request.attachments !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
                    <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
                      <Eye className="w-4 h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">View</span>
                    </button>
                    <button className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm font-medium">
                      <MessageSquare className="w-4 h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">Comment</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-700 text-sm font-medium">
                      <Archive className="w-4 h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">Archive</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 mt-6 w-full min-w-0">
          <div className="text-sm text-gray-500 truncate">
            Showing {filteredRequests.length} of {requests.length} requests
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              Previous
            </button>
            <button className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
              1
            </button>
            <button className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DSARManager;
