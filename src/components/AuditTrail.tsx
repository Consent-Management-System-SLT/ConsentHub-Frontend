import React, { useState } from 'react';
import { Activity, User, Settings, FileText, Eye, Filter, Search } from 'lucide-react';
import { mockAuditLogs, mockParties } from '../data/mockData';
import { AuditLog, Party } from '../types/consent';

interface AuditTrailProps {
  selectedCustomer?: Party;
}

export const AuditTrail: React.FC<AuditTrailProps> = ({ selectedCustomer }) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [filterType, setFilterType] = useState<'all' | 'consent' | 'preference' | 'notice'>('all');
  const [filterOperation, setFilterOperation] = useState<'all' | 'create' | 'update' | 'revoke' | 'view'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLogs.filter(log => {
    const matchesType = filterType === 'all' || log.entityType === filterType;
    const matchesOperation = filterOperation === 'all' || log.operation === filterOperation;
    const matchesSearch = searchTerm === '' || 
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedCustomer) {
      // Filter by customer if selected
      const customerMatch = log.actorId === selectedCustomer.id || 
        (log.entityType === 'consent' && log.entityId.includes(selectedCustomer.id));
      return matchesType && matchesOperation && matchesSearch && customerMatch;
    }
    
    return matchesType && matchesOperation && matchesSearch;
  });

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'consent':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'preference':
        return <Settings className="h-4 w-4 text-green-500" />;
      case 'notice':
        return <FileText className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'revoke':
        return 'bg-red-100 text-red-800';
      case 'view':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActorTypeColor = (actorType: string) => {
    switch (actorType) {
      case 'customer':
        return 'bg-blue-100 text-blue-800';
      case 'csr':
        return 'bg-purple-100 text-purple-800';
      case 'system':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCustomerName = (partyId: string) => {
    const party = mockParties.find(p => p.id === partyId);
    return party ? party.name : partyId;
  };

  const formatChanges = (changes: Record<string, any>) => {
    return Object.entries(changes).map(([key, value]) => {
      if (typeof value === 'object' && value.from !== undefined && value.to !== undefined) {
        return `${key}: ${JSON.stringify(value.from)} → ${JSON.stringify(value.to)}`;
      }
      return `${key}: ${JSON.stringify(value)}`;
    }).join(', ');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-600" />
            Audit Trail
          </h2>
          <div className="flex space-x-2">
            <span className="text-sm text-gray-500">
              {selectedCustomer ? `Customer: ${selectedCustomer.name}` : 'All Activities'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by entity ID, actor, or source..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="consent">Consent</option>
            <option value="preference">Preference</option>
            <option value="notice">Notice</option>
          </select>
          
          <select
            value={filterOperation}
            onChange={(e) => setFilterOperation(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Operations</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="revoke">Revoke</option>
            <option value="view">View</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Operation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Changes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getEntityIcon(log.entityType)}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{log.entityType}</div>
                        <div className="text-sm text-gray-500">{log.entityId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOperationColor(log.operation)}`}>
                      {log.operation}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActorTypeColor(log.actorType)}`}>
                        {log.actorType}
                      </span>
                      <div className="text-sm text-gray-900">
                        {log.actorType === 'customer' ? getCustomerName(log.actorId) : log.actorId}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs truncate" title={formatChanges(log.changes)}>
                      {formatChanges(log.changes)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.source}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No audit logs found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};