import React, { useState, useEffect } from 'react';
import { FileText, Eye, Download, Globe, Calendar, CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { PrivacyNotice } from '../types/consent';
import { apiClient } from '../services/apiClient';

export const PrivacyNotices: React.FC = () => {
  const [notices, setNotices] = useState<PrivacyNotice[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/api/v1/privacy-notice');
      const data = response.data as any;
      setNotices(data.notices || data);
    } catch (err) {
      console.error('Error loading privacy notices:', err);
      setError('Failed to load privacy notices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredNotices = notices.filter((notice: any) => {
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

  const toggleNoticeStatus = async (id: string) => {
    try {
      const notice = notices.find(n => n.id === id);
      if (!notice) return;

      await apiClient.patch(`/api/v1/privacy-notice/${id}`, {
        active: !notice.active
      });

      setNotices(prev => prev.map(n => 
        n.id === id 
          ? { ...n, active: !n.active }
          : n
      ));
    } catch (err) {
      console.error('Error updating notice status:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading privacy notices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadNotices}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Privacy Notices
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={loadNotices}
              className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
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

// import React, { useEffect, useState } from 'react';
// import { FileText, Eye, Download, Calendar, CheckCircle, XCircle } from 'lucide-react';

// // Typescript interface matching your backend schema (simplified for display)
// interface PrivacyNotice {
//   id: string;
//   version: string;
//   title: string;
//   content: string;
//   contentType: 'text/plain' | 'text/html' | 'text/markdown';
//   category: string;
//   purposes: string[];
//   legalBasis: string;
//   effectiveDate: string; // ISO string
//   expirationDate?: string;
//   status: 'draft' | 'active' | 'inactive' | 'archived';
//   language: 'en' | 'si' | 'ta';
//   metadata: {
//     createdBy: string;
//   };
// }

// const PrivacyNotices: React.FC = () => {
//   const [notices, setNotices] = useState<PrivacyNotice[]>([]);
//   const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchNotices = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const response = await fetch(
//           'https://consenthub-backend.onrender.com/api-docs/api/v1/privacy-notice/privacyNotice'
//         );
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const data = await response.json();
//         // Assuming data is an array of PrivacyNotice objects, or maybe wrapped
//         // Adjust here if your API wraps data, e.g. { items: [...] }
//         setNotices(data);
//       } catch (err: any) {
//         setError(err.message || 'Failed to fetch notices');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchNotices();
//   }, []);

//   const filteredNotices = notices.filter((notice) => {
//     if (filter === 'active') return notice.status === 'active';
//     if (filter === 'inactive') return notice.status === 'inactive';
//     return true;
//   });

//   const getStatusIcon = (status: string) =>
//     status === 'active' ? (
//       <CheckCircle className="h-4 w-4 text-green-500" />
//     ) : (
//       <XCircle className="h-4 w-4 text-red-500" />
//     );

//   const getStatusColor = (status: string) =>
//     status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

//   return (
//     <div className="space-y-6 p-6 max-w-7xl mx-auto">
//       <h2 className="text-2xl font-semibold mb-4 flex items-center text-gray-900">
//         <FileText className="h-6 w-6 mr-2 text-blue-600" />
//         Privacy Notices
//       </h2>

//       <div className="mb-6 flex items-center space-x-4">
//         <label htmlFor="statusFilter" className="font-medium text-gray-700">
//           Filter by status:
//         </label>
//         <select
//           id="statusFilter"
//           value={filter}
//           onChange={(e) => setFilter(e.target.value as any)}
//           className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//         >
//           <option value="all">All Notices</option>
//           <option value="active">Active Only</option>
//           <option value="inactive">Inactive Only</option>
//         </select>
//       </div>

//       {loading && (
//         <div className="text-center text-gray-500 py-12">Loading privacy notices...</div>
//       )}

//       {error && (
//         <div className="text-center text-red-600 py-12">
//           Error loading notices: {error}
//         </div>
//       )}

//       {!loading && !error && filteredNotices.length === 0 && (
//         <div className="text-center py-12 text-gray-500">
//           No privacy notices found matching your filter.
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {!loading &&
//           !error &&
//           filteredNotices.map((notice) => (
//             <div
//               key={notice.id}
//               className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
//             >
//               <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center space-x-2">
//                   {getStatusIcon(notice.status)}
//                   <span
//                     className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
//                       notice.status
//                     )}`}
//                   >
//                     {notice.status.charAt(0).toUpperCase() + notice.status.slice(1)}
//                   </span>
//                 </div>
//               </div>

//               <h3 className="text-lg font-medium text-gray-900 mb-2">{notice.title}</h3>

//               <div className="space-y-1 mb-4 text-sm text-gray-700">
//                 <div>
//                   <strong>Version:</strong> {notice.version}
//                 </div>
//                 <div>
//                   <strong>Category:</strong> {notice.category}
//                 </div>
//                 <div>
//                   <strong>Language:</strong> {notice.language}
//                 </div>
//                 <div className="flex items-center space-x-1">
//                   <Calendar className="h-4 w-4 text-gray-400" />
//                   <span>
//                     Effective Date: {new Date(notice.effectiveDate).toLocaleDateString()}
//                   </span>
//                 </div>
//                 {notice.expirationDate && (
//                   <div className="flex items-center space-x-1">
//                     <Calendar className="h-4 w-4 text-gray-400" />
//                     <span>
//                       Expiration Date: {new Date(notice.expirationDate).toLocaleDateString()}
//                     </span>
//                   </div>
//                 )}
//               </div>

//               <div className="text-gray-700 line-clamp-3 mb-4">{notice.content}</div>

//               <div className="flex space-x-2">
//                 <button
//                   onClick={() => alert('View content feature coming soon!')}
//                   className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
//                 >
//                   <Eye className="h-4 w-4 mr-2" />
//                   View
//                 </button>
//                 <button
//                   onClick={() => alert('Download feature coming soon!')}
//                   className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
//                 >
//                   <Download className="h-4 w-4 mr-2" />
//                   Download
//                 </button>
//               </div>
//             </div>
//           ))}
//       </div>
//     </div>
//   );
// };

// export default PrivacyNotices;
