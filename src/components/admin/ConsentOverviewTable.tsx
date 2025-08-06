import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye,
  Edit,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  User,
  ChevronDown,
  RefreshCw,
  X
} from 'lucide-react';

interface Consent {
  id: string;
  customerId: string;
  customerName: string;
  email: string;
  consentType: 'marketing' | 'analytics' | 'functional' | 'necessary';
  status: 'active' | 'withdrawn' | 'expired' | 'pending';
  grantedDate: string;
  expiryDate?: string;
  lastUpdated: string;
  source: 'website' | 'mobile' | 'email' | 'phone' | 'in-person';
  version: string;
}

interface ConsentOverviewTableProps {}

const ConsentOverviewTable: React.FC<ConsentOverviewTableProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [consentTypeFilter, setConsentTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedConsents, setSelectedConsents] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<Consent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Handle consent actions
  const handleViewConsent = (consent: Consent) => {
    setModalData(consent);
    setShowModal(true);
  };

  const handleEditConsent = (consent: Consent) => {
    // Simulate edit action
    alert(`Editing consent for ${consent.customerName}`);
  };

  const handleBulkAction = async (action: 'export' | 'delete' | 'update') => {
    if (selectedConsents.size === 0) {
      alert('Please select consents to perform bulk actions');
      return;
    }
    
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    switch (action) {
      case 'export':
        alert(`Exporting ${selectedConsents.size} consents...`);
        break;
      case 'delete':
        alert(`Deleting ${selectedConsents.size} consents...`);
        setSelectedConsents(new Set());
        break;
      case 'update':
        alert(`Updating ${selectedConsents.size} consents...`);
        break;
    }
    
    setIsLoading(false);
  };

  const handleSelectAll = () => {
    if (selectedConsents.size === filteredConsents.length) {
      setSelectedConsents(new Set());
    } else {
      setSelectedConsents(new Set(filteredConsents.map(c => c.id)));
    }
  };

  const handleSelectConsent = (id: string) => {
    const newSelected = new Set(selectedConsents);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedConsents(newSelected);
  };

  const handleExportData = () => {
    const dataToExport = filteredConsents.map(consent => ({
      id: consent.id,
      customerName: consent.customerName,
      email: consent.email,
      consentType: consent.consentType,
      status: consent.status,
      grantedDate: consent.grantedDate,
      expiryDate: consent.expiryDate,
      source: consent.source,
      version: consent.version
    }));
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consent-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Mock data
  const consents: Consent[] = [
    {
      id: '1',
      customerId: 'CUST001',
      customerName: 'John Doe',
      email: 'john.doe@example.com',
      consentType: 'marketing',
      status: 'active',
      grantedDate: '2024-01-15',
      expiryDate: '2025-01-15',
      lastUpdated: '2024-01-15',
      source: 'website',
      version: 'v2.1'
    },
    {
      id: '2',
      customerId: 'CUST002',
      customerName: 'Jane Smith',
      email: 'jane.smith@example.com',
      consentType: 'analytics',
      status: 'active',
      grantedDate: '2024-01-20',
      lastUpdated: '2024-01-20',
      source: 'mobile',
      version: 'v2.1'
    },
    {
      id: '3',
      customerId: 'CUST003',
      customerName: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      consentType: 'marketing',
      status: 'withdrawn',
      grantedDate: '2024-01-10',
      lastUpdated: '2024-01-25',
      source: 'email',
      version: 'v2.0'
    },
    {
      id: '4',
      customerId: 'CUST004',
      customerName: 'Sarah Wilson',
      email: 'sarah.wilson@example.com',
      consentType: 'functional',
      status: 'expired',
      grantedDate: '2023-12-01',
      expiryDate: '2024-01-01',
      lastUpdated: '2024-01-01',
      source: 'website',
      version: 'v1.9'
    },
    {
      id: '5',
      customerId: 'CUST005',
      customerName: 'David Brown',
      email: 'david.brown@example.com',
      consentType: 'necessary',
      status: 'active',
      grantedDate: '2024-01-22',
      lastUpdated: '2024-01-22',
      source: 'in-person',
      version: 'v2.1'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'withdrawn':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'withdrawn':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConsentTypeColor = (type: string) => {
    switch (type) {
      case 'marketing':
        return 'bg-purple-100 text-purple-800';
      case 'analytics':
        return 'bg-blue-100 text-blue-800';
      case 'functional':
        return 'bg-green-100 text-green-800';
      case 'necessary':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredConsents = consents.filter(consent => {
    const matchesSearch = consent.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consent.customerId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || consent.status === statusFilter;
    const matchesType = consentTypeFilter === 'all' || consent.consentType === consentTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const sortedConsents = [...filteredConsents].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
        break;
      case 'name':
        comparison = a.customerName.localeCompare(b.customerName);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consent Management</h1>
          <p className="text-gray-600 mt-2">Manage and monitor all customer consents</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExportData}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Export</span>
          </button>
          {selectedConsents.size > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{selectedConsents.size} selected</span>
              <button 
                onClick={() => handleBulkAction('export')}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Export Selected
              </button>
              <button 
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Delete Selected
              </button>
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
              <p className="text-sm font-medium text-gray-600">Active Consents</p>
              <p className="text-2xl font-bold text-green-600">
                {consents.filter(c => c.status === 'active').length}
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
              <p className="text-sm font-medium text-gray-600">Withdrawn</p>
              <p className="text-2xl font-bold text-red-600">
                {consents.filter(c => c.status === 'withdrawn').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-yellow-600">
                {consents.filter(c => c.status === 'expired').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Consents</p>
              <p className="text-2xl font-bold text-blue-600">{consents.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
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
                placeholder="Search customers..."
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
                  <option value="active">Active</option>
                  <option value="withdrawn">Withdrawn</option>
                  <option value="expired">Expired</option>
                  <option value="pending">Pending</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              
              <div className="relative">
                <select
                  value={consentTypeFilter}
                  onChange={(e) => setConsentTypeFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="marketing">Marketing</option>
                  <option value="analytics">Analytics</option>
                  <option value="functional">Functional</option>
                  <option value="necessary">Necessary</option>
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

      {/* Consents Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedConsents.size === filteredConsents.length && filteredConsents.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSortBy('name');
                    setSortOrder(sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <div className="flex items-center space-x-1">
                    <span>Customer</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${sortBy === 'name' && sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Consent Type
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSortBy('status');
                    setSortOrder(sortBy === 'status' && sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${sortBy === 'status' && sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSortBy('date');
                    setSortOrder(sortBy === 'date' && sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <div className="flex items-center space-x-1">
                    <span>Granted Date</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${sortBy === 'date' && sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedConsents.map((consent) => (
                <tr key={consent.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedConsents.has(consent.id)}
                      onChange={() => handleSelectConsent(consent.id)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{consent.customerName}</div>
                        <div className="text-sm text-gray-500">{consent.email}</div>
                        <div className="text-xs text-gray-400">{consent.customerId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getConsentTypeColor(consent.consentType)}`}>
                      {consent.consentType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(consent.status)}
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(consent.status)}`}>
                        {consent.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      {new Date(consent.grantedDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {consent.expiryDate ? (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        {new Date(consent.expiryDate).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-gray-400">No expiry</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                      {consent.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewConsent(consent)}
                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditConsent(consent)}
                        className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-50 rounded transition-colors"
                        title="Edit Consent"
                      >
                        <Edit className="w-4 h-4" />
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
          Showing {Math.min((currentPage - 1) * itemsPerPage + 1, sortedConsents.length)} to {Math.min(currentPage * itemsPerPage, sortedConsents.length)} of {sortedConsents.length} consents
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {Array.from({ length: Math.ceil(sortedConsents.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                currentPage === page
                  ? 'bg-red-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          <button 
            onClick={() => setCurrentPage(Math.min(Math.ceil(sortedConsents.length / itemsPerPage), currentPage + 1))}
            disabled={currentPage === Math.ceil(sortedConsents.length / itemsPerPage)}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Consent Details Modal */}
      {showModal && modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Consent Details</h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Customer Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p><span className="font-medium">Name:</span> {modalData.customerName}</p>
                    <p><span className="font-medium">Email:</span> {modalData.email}</p>
                    <p><span className="font-medium">ID:</span> {modalData.customerId}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Consent Details</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p><span className="font-medium">Type:</span> {modalData.consentType}</p>
                    <p><span className="font-medium">Status:</span> {modalData.status}</p>
                    <p><span className="font-medium">Source:</span> {modalData.source}</p>
                    <p><span className="font-medium">Version:</span> {modalData.version}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Timeline</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p><span className="font-medium">Granted:</span> {new Date(modalData.grantedDate).toLocaleDateString()}</p>
                  <p><span className="font-medium">Last Updated:</span> {new Date(modalData.lastUpdated).toLocaleDateString()}</p>
                  {modalData.expiryDate && (
                    <p><span className="font-medium">Expires:</span> {new Date(modalData.expiryDate).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => handleEditConsent(modalData)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Consent</span>
                </button>
                <button 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsentOverviewTable;
