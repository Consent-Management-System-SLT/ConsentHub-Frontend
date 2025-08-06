import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Activity,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Calendar
} from 'lucide-react';

interface AuditLogTableProps {
  className?: string;
  customerId?: string;
}

const BASE_URL = 'http://localhost:3010/api/v1'; // Change this for your backend

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
      const response = await axios.get(`${BASE_URL}/audit`);
      let allEvents = response.data.logs || [];

      if (customerId) {
        allEvents = allEvents.filter(event => event.partyId === customerId);
      }

      setAuditLogs(allEvents);
    } catch (err) {
      console.error('Error loading audit logs:', err);
      setError('Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...auditLogs];

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.partyId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(log => log.eventType === filterType);
    }

    if (filterDate) {
      const selectedDate = new Date(filterDate);
      filtered = filtered.filter(log => {
        const logDate = new Date(log.createdAt);
        return logDate.toDateString() === selectedDate.toDateString();
      });
    }

    setFilteredLogs(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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

  const getUniqueEventTypes = () => {
    return ['all', ...new Set(auditLogs.map(log => log.eventType))];
  };

  return (
    <div className={`p-4 bg-white rounded-xl shadow ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Activity className="w-5 h-5" /> Audit Log
        </h2>
        <button
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-black"
          onClick={loadAuditLogs}
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center border rounded px-2">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search"
            className="ml-2 outline-none py-1 text-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center border rounded px-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            className="ml-2 outline-none py-1 text-sm"
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            {getUniqueEventTypes().map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Events' : type}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center border rounded px-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <input
            type="date"
            className="ml-2 outline-none py-1 text-sm"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-gray-500">Loading audit logs...</p>
      ) : error ? (
        <div className="text-red-500 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      ) : filteredLogs.length === 0 ? (
        <p className="text-gray-500">No audit events found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 border">Event Type</th>
                <th className="px-3 py-2 border">Party ID</th>
                <th className="px-3 py-2 border">Description</th>
                <th className="px-3 py-2 border">Resource</th>
                <th className="px-3 py-2 border">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className={`px-3 py-2 border font-medium`}>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getEventTypeColor(
                        log.eventType
                      )}`}
                    >
                      {log.eventType}
                    </span>
                  </td>
                  <td className="px-3 py-2 border">{log.partyId || 'N/A'}</td>
                  <td className="px-3 py-2 border">{log.description || '-'}</td>
                  <td className="px-3 py-2 border">
                    {log.resourceType || '-'} {log.resourceId && `(${log.resourceId})`}
                  </td>
                  <td className="px-3 py-2 border">{formatDate(log.createdAt)}</td>
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
