import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Database, 
  Shield, 
  AlertCircle, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Server,
  Settings,
  Users,
  FileText,
  Lock,
  Globe,
  X
} from 'lucide-react';

interface AuditLog {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  action: string;
  category: string;
  description: string;
  entityType: string;
  entityId: string;
  ipAddress: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  complianceRelevant: boolean;
  regulatoryFramework: string[];
  sessionId: string;
  location?: {
    country: string;
    region: string;
    city: string;
  };
  outcome: 'success' | 'failure' | 'partial';
  metadata?: {
    platform: string;
    version: string;
    feature: string;
  };
  createdAt: string;
  updatedAt: string;
}

const AuditLogViewer: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedOutcome, setSelectedOutcome] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  
  const logsPerPage = 10;

  const fetchAuditLogs = async (page: number = 1, search: string = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: logsPerPage.toString()
      });
      
      if (search.trim()) {
        params.append('search', search.trim());
      }
      
      if (selectedSeverity) {
        params.append('severity', selectedSeverity);
      }
      
      if (selectedCategory) {
        params.append('category', selectedCategory);
      }
      
      if (selectedOutcome) {
        params.append('outcome', selectedOutcome);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://consenthub-backend.onrender.com'}/api/v1/audit-logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch audit logs: ${response.statusText}`);
      }

      const data = await response.json();
      setAuditLogs(data.logs || []);
      setTotalLogs(data.total || 0);
      setTotalPages(Math.ceil((data.total || 0) / logsPerPage));
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs(currentPage, searchTerm);
  }, [currentPage, selectedSeverity, selectedCategory, selectedOutcome]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchAuditLogs(1, searchTerm);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    fetchAuditLogs(1, '');
  };

  const clearFilters = () => {
    setSelectedSeverity('');
    setSelectedCategory('');
    setSelectedOutcome('');
    setCurrentPage(1);
  };

  const exportLogs = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (selectedSeverity) params.append('severity', selectedSeverity);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedOutcome) params.append('outcome', selectedOutcome);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://consenthub-backend.onrender.com'}/api/v1/audit-logs/export/csv?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export audit logs');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export audit logs. Please try again.');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failure': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'partial': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Consent Management': return <Shield className="w-4 h-4 text-green-600" />;
      case 'DSAR Processing': return <Database className="w-4 h-4 text-blue-600" />;
      case 'User Management': return <Users className="w-4 h-4 text-purple-600" />;
      case 'Privacy Notices': return <FileText className="w-4 h-4 text-indigo-600" />;
      case 'Security': return <Lock className="w-4 h-4 text-red-600" />;
      case 'System Administration': return <Server className="w-4 h-4 text-gray-600" />;
      case 'Compliance & Audit': return <Settings className="w-4 h-4 text-yellow-600" />;
      case 'Data Processing': return <Activity className="w-4 h-4 text-orange-600" />;
      default: return <Globe className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const renderPagination = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-500">
          Showing {Math.min((currentPage - 1) * logsPerPage + 1, totalLogs)} to{' '}
          {Math.min(currentPage * logsPerPage, totalLogs)} of {totalLogs} audit logs
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => setCurrentPage(number)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                currentPage === number
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {number}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  if (loading && auditLogs.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-myslt-text-primary">Audit Logs</h1>
          <p className="text-myslt-text-secondary mt-2">
            View system activity and compliance logs ({totalLogs} total entries)
          </p>
        </div>
        <button
          onClick={exportLogs}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      <div className="bg-myslt-card-solid rounded-xl shadow-sm border border-myslt-border p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                placeholder="Search by user, action, entity, or description..."
                className="pl-10 pr-4 py-2 w-full sm:w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Search
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-myslt-service-card hover:bg-gray-200 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Filter className="w-4 h-4 text-myslt-text-secondary" />
              <span className="text-sm font-medium text-gray-700">Filters</span>
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">All Severities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  <option value="Consent Management">Consent Management</option>
                  <option value="DSAR Processing">DSAR Processing</option>
                  <option value="User Management">User Management</option>
                  <option value="Privacy Notices">Privacy Notices</option>
                  <option value="Security">Security</option>
                  <option value="System Administration">System Administration</option>
                  <option value="Compliance & Audit">Compliance & Audit</option>
                  <option value="Data Processing">Data Processing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Outcome</label>
                <select
                  value={selectedOutcome}
                  onChange={(e) => setSelectedOutcome(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">All Outcomes</option>
                  <option value="success">Success</option>
                  <option value="failure">Failure</option>
                  <option value="partial">Partial</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex items-center space-x-2">
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-myslt-card-solid rounded-xl shadow-sm border border-myslt-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="myslt-table">
            <thead className="myslt-table-header">
              <tr>
                <th className="myslt-table-header-cell">Timestamp</th>
                <th className="myslt-table-header-cell">User</th>
                <th className="myslt-table-header-cell">Action</th>
                <th className="myslt-table-header-cell">Category</th>
                <th className="myslt-table-header-cell">Severity</th>
                <th className="myslt-table-header-cell">Outcome</th>
                <th className="myslt-table-header-cell">Compliance</th>
                <th className="myslt-table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="myslt-table-body">
              {auditLogs.map((log) => (
                <tr key={log._id} className="myslt-table-row">
                  <td className="myslt-table-cell">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-myslt-text-muted mr-2" />
                      {formatDate(log.createdAt)}
                    </div>
                  </td>
                  <td className="myslt-table-cell">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-myslt-text-muted mr-2" />
                      <div>
                        <div className="text-sm text-myslt-text-primary font-medium">{log.userName}</div>
                        <div className="text-xs text-myslt-text-muted">{log.userEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="myslt-table-cell">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-myslt-accent/20 text-myslt-text-primary">
                      {log.action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </td>
                  <td className="myslt-table-cell">
                    <div className="flex items-center">
                      {getCategoryIcon(log.category)}
                      <span className="ml-2">{log.category}</span>
                    </div>
                  </td>
                  <td className="myslt-table-cell">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(log.severity)}`}>
                      {log.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="myslt-table-cell">
                    <div className="flex items-center">
                      {getOutcomeIcon(log.outcome)}
                      <span className="ml-2 text-sm text-myslt-text-secondary capitalize">{log.outcome}</span>
                    </div>
                  </td>
                  <td className="myslt-table-cell">
                    {log.complianceRelevant ? (
                      <div className="flex flex-col">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-myslt-success/20 text-myslt-success mb-1">
                          GDPR Relevant
                        </span>
                        {log.regulatoryFramework.length > 0 && (
                          <div className="text-xs text-myslt-text-muted">
                            {log.regulatoryFramework.join(', ')}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-myslt-text-muted">N/A</span>
                    )}
                  </td>
                  <td className="myslt-table-cell font-medium">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="text-myslt-accent hover:text-myslt-primary p-1 hover:bg-myslt-accent/10 rounded transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {renderPagination()}
      </div>

      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Audit Log Details</h2>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedLog.createdAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Entity ID</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">{selectedLog.entityId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.userName} ({selectedLog.userEmail})</p>
                    <p className="text-xs text-gray-500">Role: {selectedLog.userRole}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">IP Address</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">{selectedLog.ipAddress}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Session ID</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">{selectedLog.sessionId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Risk Level</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{selectedLog.riskLevel}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLog.description}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">User Agent</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono break-all">{selectedLog.userAgent}</p>
                </div>
                
                {selectedLog.location && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedLog.location.city}, {selectedLog.location.region}, {selectedLog.location.country}
                    </p>
                  </div>
                )}
                
                {selectedLog.metadata && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Metadata</label>
                    <div className="mt-1 text-sm text-gray-900">
                      <p>Platform: {selectedLog.metadata.platform}</p>
                      <p>Version: {selectedLog.metadata.version}</p>
                      <p>Feature: {selectedLog.metadata.feature}</p>
                    </div>
                  </div>
                )}
                
                {selectedLog.regulatoryFramework.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Regulatory Frameworks</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {selectedLog.regulatoryFramework.map((framework) => (
                        <span
                          key={framework}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {framework}
                        </span>
                      ))}
                    </div>
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

export default AuditLogViewer;
