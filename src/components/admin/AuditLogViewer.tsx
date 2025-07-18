import React from 'react';
import { Activity, Search, Filter, Calendar, User, Database, Shield, AlertCircle, Eye } from 'lucide-react';

const AuditLogViewer: React.FC = () => {
  const logs = [
    { id: 1, timestamp: '2024-01-28 14:30:22', user: 'admin@company.com', action: 'Consent Updated', entity: 'Customer Consent', entityId: 'CUST001', details: 'Marketing consent granted', ipAddress: '192.168.1.100' },
    { id: 2, timestamp: '2024-01-28 14:25:15', user: 'csr@company.com', action: 'DSAR Request', entity: 'Data Request', entityId: 'DSAR-001', details: 'Data access request submitted', ipAddress: '192.168.1.105' },
    { id: 3, timestamp: '2024-01-28 14:20:08', user: 'system', action: 'Privacy Policy', entity: 'Policy Document', entityId: 'PP-001', details: 'Privacy policy updated to v3.2', ipAddress: '127.0.0.1' },
    { id: 4, timestamp: '2024-01-28 14:15:45', user: 'admin@company.com', action: 'User Management', entity: 'User Account', entityId: 'USER001', details: 'New user account created', ipAddress: '192.168.1.100' },
    { id: 5, timestamp: '2024-01-28 14:10:32', user: 'csr@company.com', action: 'Data Export', entity: 'Customer Data', entityId: 'CUST003', details: 'Customer data exported', ipAddress: '192.168.1.105' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 mt-2">View system activity and compliance logs</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search logs..."
                className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filters</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      {log.timestamp}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{log.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      {log.entity === 'Customer Consent' && <Shield className="w-4 h-4 text-green-600 mr-2" />}
                      {log.entity === 'Data Request' && <Database className="w-4 h-4 text-blue-600 mr-2" />}
                      {log.entity === 'Policy Document' && <AlertCircle className="w-4 h-4 text-purple-600 mr-2" />}
                      {log.entity === 'User Account' && <User className="w-4 h-4 text-orange-600 mr-2" />}
                      {log.entity === 'Customer Data' && <Activity className="w-4 h-4 text-red-600 mr-2" />}
                      {log.entity}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{log.details}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.ipAddress}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogViewer;
