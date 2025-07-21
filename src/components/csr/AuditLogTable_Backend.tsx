import React, { useState, useEffect } from 'react';
import { Activity, Search, Filter, RefreshCw, AlertCircle, Calendar } from 'lucide-react';
import { csrDashboardService } from '../../services/csrDashboardService';

interface AuditLogTableProps {
  className?: string;
  customerId?: string;
}

const AuditLogTable: React.FC<AuditLogTableProps> = ({ 
  className = '', 
  customerId 
}) => {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    loadAuditLogs();
  }, [customerId]);

  useEffect(() => {
    filterLogs();
  }, [auditLogs, searchTerm, filterType, filterDate]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const allEvents = await csrDashboardService.getAuditEvents();
      
      // Filter by customer if specified
      let filteredEvents = allEvents;
      if (customerId) {
        filteredEvents = allEvents.filter(event => event.partyId === customerId);
      }
      
      setAuditLogs(filteredEvents);
    } catch (err) {
      console.error('Error loading audit logs:', err);
      setError('Failed to load audit logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...auditLogs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.partyId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(log => log.eventType === filterType);
    }

    // Date filter
    if (filterDate) {
      const selectedDate = new Date(filterDate);
      filtered = filtered.filter(log => {
        const logDate = new Date(log.createdAt);
        return logDate.toDateString() === selectedDate.toDateString();
      });
    }

    setFilteredLogs(filtered);
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'consent_granted':
        return 'bg-green-100 text-green-800';
      case 'consent_revoked':
        return 'bg-red-100 text-red-800';
      case 'consent_updated':
        return 'bg-blue-100 text-blue-800';
      case 'dsar_created':
        return 'bg-purple-100 text-purple-800';
      case 'dsar_completed':
        return 'bg-green-100 text-green-800';
      case 'preference_updated':
        return 'bg-yellow-100 text-yellow-800';
      case 'privacy_notice_viewed':
        return 'bg-indigo-100 text-indigo-800';
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
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getUniqueEventTypes = () => {
    return [...new Set(auditLogs.map(log => log.eventType))];
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg ${className}`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Activity className="w-6 h-6 text-indigo-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Audit Trail</h2>
              <p className="text-sm text-gray-600">System activity and event logs</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading audit logs...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-lg ${className}`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Activity className="w-6 h-6 text-indigo-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Audit Trail</h2>
              <p className="text-sm text-gray-600">System activity and event logs</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <button 
              onClick={loadAuditLogs}
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
            <Activity className="w-6 h-6 text-indigo-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Audit Trail</h2>
              <p className="text-sm text-gray-600">
                {customerId ? `Activity logs for customer: ${customerId}` : 'System activity and event logs'}
              </p>
            </div>
          </div>
          <button
            onClick={loadAuditLogs}
            className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {getUniqueEventTypes().map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          {(searchTerm || filterType !== 'all' || filterDate) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setFilterDate('');
              }}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Clear Filters
            </button>
          )}
        </div>
        
        <div className="mt-2 text-sm text-gray-600">
          Showing {filteredLogs.length} of {auditLogs.length} logs
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="text-center py-12">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {auditLogs.length === 0 ? 'No audit logs found.' : 'No logs match your current filters.'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {auditLogs.length === 0 
              ? (customerId ? 'This customer has no activity logs.' : 'No activity logs exist in the system.')
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(log.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(log.eventType)}`}>
                      {log.eventType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{log.partyId || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {log.description || 'No description available'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{log.source || 'System'}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLogTable;
