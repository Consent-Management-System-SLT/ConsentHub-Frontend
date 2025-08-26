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
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="myslt-card p-4 sm:p-6">
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
            <button className="myslt-btn-primary px-4 py-2 flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm font-medium">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {notices.map((notice) => (
          <div key={notice.id} className="myslt-card p-4 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-myslt-accent/20 rounded-xl flex items-center justify-center">
                <FileText className="w-5 sm:w-6 h-5 sm:h-6 text-myslt-accent" />
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                notice.status === 'Active' 
                  ? 'bg-myslt-success/20 text-myslt-success border-myslt-success/30' 
                  : 'bg-myslt-warning/20 text-myslt-warning border-myslt-warning/30'
              }`}>
                {notice.status}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-myslt-text-primary mb-2">{notice.title}</h3>
            <p className="text-sm text-myslt-text-secondary mb-4">Version {notice.version}</p>
            <p className="text-xs text-myslt-text-muted mb-4">Updated: {notice.lastUpdated}</p>
            
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
