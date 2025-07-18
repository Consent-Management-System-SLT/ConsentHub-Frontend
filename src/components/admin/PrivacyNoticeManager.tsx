import React from 'react';
import { FileText, Download, RefreshCw, Plus, Eye, Edit, Trash2 } from 'lucide-react';

const PrivacyNoticeManager: React.FC = () => {
  const notices = [
    { id: 1, title: 'General Privacy Policy', version: '3.2', status: 'Active', lastUpdated: '2024-01-15' },
    { id: 2, title: 'Cookie Policy', version: '2.1', status: 'Active', lastUpdated: '2024-01-10' },
    { id: 3, title: 'Marketing Communications', version: '1.8', status: 'Draft', lastUpdated: '2024-01-20' },
    { id: 4, title: 'Data Processing Notice', version: '2.3', status: 'Active', lastUpdated: '2024-01-05' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Privacy Notices</h1>
          <p className="text-gray-600 mt-2">Manage privacy policies and notices</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Export</span>
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">New Notice</span>
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {notices.map((notice) => (
          <div key={notice.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                notice.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {notice.status}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{notice.title}</h3>
            <p className="text-sm text-gray-600 mb-4">Version {notice.version}</p>
            <p className="text-xs text-gray-500 mb-4">Updated: {notice.lastUpdated}</p>
            
            <div className="flex items-center space-x-2">
              <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                <Eye className="w-4 h-4" />
                <span className="text-sm">View</span>
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <Edit className="w-4 h-4" />
              </button>
              <button className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrivacyNoticeManager;
