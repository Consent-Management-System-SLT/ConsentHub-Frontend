import React, { useState, useEffect } from 'react';
import { FileText, Download, RefreshCw, Plus, Eye, Edit, Trash2 } from 'lucide-react';

interface PrivacyNotice {
  _id: string;
  id?: string;
  title: string;
  version: string;
  status: 'active' | 'draft' | 'archived';
  category: string;
  updatedAt: string;
  createdAt: string;
}

const PrivacyNoticeManager: React.FC = () => {
  const [notices, setNotices] = useState<PrivacyNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const baseURL = import.meta.env.VITE_PRIVACY_NOTICE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseURL}/api/v1/privacy-notices`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch privacy notices: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && data.notices) {
        setNotices(data.notices);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching privacy notices:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch privacy notices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-myslt-text-primary">Privacy Notices</h1>
          <p className="text-myslt-text-secondary mt-2">Loading privacy notices...</p>
        </div>
        <div className="flex justify-center py-8">
          <RefreshCw className="w-8 h-8 animate-spin text-myslt-accent" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-myslt-text-primary">Privacy Notices</h1>
          <p className="text-red-600 mt-2">Error: {error}</p>
        </div>
        <button
          onClick={fetchNotices}
          className="myslt-btn-primary px-4 py-2 flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="text-sm font-medium">Retry</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-myslt-text-primary">Privacy Notices</h1>
            <p className="text-myslt-text-secondary mt-2">Manage privacy policies and notices</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="myslt-btn-secondary px-4 py-2 flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Export</span>
            </button>
            <button className="myslt-btn-primary px-4 py-2 flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">New Notice</span>
            </button>
            <button 
              className="myslt-btn-primary px-4 py-2 flex items-center space-x-2"
              onClick={fetchNotices}
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm font-medium">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {notices.map((notice) => (
          <div key={notice._id} className="myslt-card p-4 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-myslt-accent/20 rounded-xl flex items-center justify-center">
                <FileText className="w-5 sm:w-6 h-5 sm:h-6 text-myslt-accent" />
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                notice.status === 'active' 
                  ? 'bg-myslt-success/20 text-myslt-success border-myslt-success/30' 
                  : notice.status === 'draft'
                  ? 'bg-myslt-warning/20 text-myslt-warning border-myslt-warning/30'
                  : 'bg-gray-200/20 text-gray-600 border-gray-300/30'
              }`}>
                {notice.status.charAt(0).toUpperCase() + notice.status.slice(1)}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-myslt-text-primary mb-2">{notice.title}</h3>
            <p className="text-sm text-myslt-text-secondary mb-4">Version {notice.version}</p>
            <p className="text-xs text-myslt-text-muted mb-4">Updated: {formatDate(notice.updatedAt)}</p>
            
            <div className="flex items-center space-x-2">
              <button className="myslt-btn-primary flex-1 px-3 py-2 flex items-center justify-center space-x-2">
                <Eye className="w-4 h-4" />
                <span className="text-sm">View</span>
              </button>
              <button className="p-2 text-myslt-text-secondary hover:text-myslt-text-primary hover:bg-myslt-service-card rounded-lg transition-colors">
                <Edit className="w-4 h-4" />
              </button>
              <button className="p-2 text-myslt-danger hover:text-myslt-danger hover:bg-myslt-danger/10 rounded-lg transition-colors">
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
