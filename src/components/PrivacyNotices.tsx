import React, { useState } from 'react';
import { FileText, Eye, Download, Globe, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { mockNotices } from '../data/mockData';
import { PrivacyNotice } from '../types/consent';

export const PrivacyNotices: React.FC = () => {
  const [notices, setNotices] = useState<PrivacyNotice[]>(mockNotices);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredNotices = notices.filter(notice => {
    if (filter === 'active') return notice.active;
    if (filter === 'inactive') return !notice.active;
    return true;
  });

  const getStatusIcon = (active: boolean) => {
    return active 
      ? <CheckCircle className="h-4 w-4 text-green-500" />
      : <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusColor = (active: boolean) => {
    return active 
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const getJurisdictionColor = (jurisdiction: string) => {
    switch (jurisdiction) {
      case 'US':
        return 'bg-blue-100 text-blue-800';
      case 'EU':
        return 'bg-purple-100 text-purple-800';
      case 'UK':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleNoticeStatus = (id: string) => {
    setNotices(prev => prev.map(notice => 
      notice.id === id 
        ? { ...notice, active: !notice.active }
        : notice
    ));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Privacy Notices
          </h2>
          <div className="flex space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Notices</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotices.map((notice) => (
            <div key={notice.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(notice.active)}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(notice.active)}`}>
                    {notice.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <button
                  onClick={() => toggleNoticeStatus(notice.id)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    notice.active
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {notice.active ? 'Deactivate' : 'Activate'}
                </button>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {notice.title}
              </h3>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  {/* <span className="text-sm text-gray-500">Version:</span>
                  <span className="text-sm font-medium text-gray-900">{notice.version}</span> */}
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getJurisdictionColor(notice.jurisdiction)}`}>
                    {notice.jurisdiction}
                  </span>
                  <span className="text-xs text-gray-500">({notice.language})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    Published: {new Date(notice.publishedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => window.open(notice.documentUrl, '_blank')}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </button>
                <button
                  onClick={() => window.open(notice.documentUrl, '_blank')}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredNotices.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No privacy notices found matching your filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};