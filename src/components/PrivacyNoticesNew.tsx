import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Eye, 
  Download, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Users,
  Save,
  X
} from 'lucide-react';
import { 
  privacyNoticeService, 
  PrivacyNotice, 
  PrivacyNoticeCreateRequest, 
  PrivacyNoticeUpdateRequest,
  PrivacyNoticeQuery
} from '../services/privacyNoticeService';

// Form component for creating/editing privacy notices
const PrivacyNoticeForm: React.FC<{
  notice?: PrivacyNotice;
  onSave: (notice: PrivacyNoticeCreateRequest | PrivacyNoticeUpdateRequest) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}> = ({ notice, onSave, onCancel, isLoading }) => {
  const [formData, setFormData] = useState<PrivacyNoticeCreateRequest>({
    title: notice?.title || '',
    description: notice?.description || '',
    content: notice?.content || '',
    contentType: notice?.contentType || 'text/plain',
    category: notice?.category || 'general',
    purposes: notice?.purposes || [],
    legalBasis: notice?.legalBasis || 'consent',
    dataCategories: notice?.dataCategories || [],
    recipients: notice?.recipients || [],
    retentionPeriod: notice?.retentionPeriod || { duration: '1 year' },
    rights: notice?.rights || ['access', 'rectification', 'erasure'],
    contactInfo: notice?.contactInfo || {
      organization: {
        name: 'SLT Mobitel',
        email: 'privacy@sltmobitel.lk'
      }
    },
    effectiveDate: notice?.effectiveDate ? new Date(notice.effectiveDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    status: notice?.status || 'draft',
    language: notice?.language || 'en',
    applicableRegions: notice?.applicableRegions || ['sri_lanka']
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">
            {notice ? 'Edit Privacy Notice' : 'Create New Privacy Notice'}
          </h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="general">General</option>
                <option value="marketing">Marketing</option>
                <option value="analytics">Analytics</option>
                <option value="cookies">Cookies</option>
                <option value="third-party">Third Party</option>
                <option value="location">Location</option>
                <option value="children">Children</option>
                <option value="employment">Employment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Legal Basis
              </label>
              <select
                value={formData.legalBasis}
                onChange={(e) => setFormData({ ...formData, legalBasis: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="consent">Consent</option>
                <option value="contract">Contract</option>
                <option value="legal_obligation">Legal Obligation</option>
                <option value="vital_interests">Vital Interests</option>
                <option value="public_task">Public Task</option>
                <option value="legitimate_interests">Legitimate Interests</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="si">Sinhala</option>
                <option value="ta">Tamil</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Effective Date
              </label>
              <input
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of the privacy notice"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Privacy notice content..."
              required
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-myslt-primary text-white rounded-md hover:bg-myslt-primary-dark disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {notice ? 'Update' : 'Create'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main component
export const PrivacyNotices: React.FC = () => {
  const [notices, setNotices] = useState<PrivacyNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState<PrivacyNotice | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<PrivacyNoticeQuery>({
    status: '',
    category: '',
    language: '',
    limit: 20,
    offset: 0
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    draft: 0,
    archived: 0
  });

  useEffect(() => {
    loadNotices();
  }, [filters]);

  const loadNotices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const query: PrivacyNoticeQuery = {
        ...filters,
        search: searchTerm || undefined
      };
      
      // Remove empty values
      Object.keys(query).forEach(key => {
        if (query[key as keyof PrivacyNoticeQuery] === '') {
          delete query[key as keyof PrivacyNoticeQuery];
        }
      });

      const response = await privacyNoticeService.getPrivacyNotices(query);
      
      if (response.data) {
        setNotices(response.data.notices);
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error('Error loading privacy notices:', err);
      setError(err instanceof Error ? err.message : 'Failed to load privacy notices');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotice = async (noticeData: PrivacyNoticeCreateRequest) => {
    try {
      setFormLoading(true);
      const response = await privacyNoticeService.createPrivacyNotice(noticeData);
      
      if (response.data) {
        setNotices(prev => [response.data!.notice, ...prev]);
        setShowForm(false);
        setStats(prev => ({ ...prev, total: prev.total + 1, draft: prev.draft + 1 }));
      }
    } catch (err) {
      console.error('Error creating notice:', err);
      alert('Failed to create notice: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateNotice = async (noticeData: PrivacyNoticeUpdateRequest) => {
    if (!editingNotice) return;

    try {
      setFormLoading(true);
      const response = await privacyNoticeService.updatePrivacyNotice(editingNotice.id, noticeData);
      
      if (response.data) {
        setNotices(prev => prev.map(n => 
          n.id === editingNotice.id ? response.data!.notice : n
        ));
        setShowForm(false);
        setEditingNotice(null);
      }
    } catch (err) {
      console.error('Error updating notice:', err);
      alert('Failed to update notice: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!confirm('Are you sure you want to delete this privacy notice?')) return;

    try {
      const response = await privacyNoticeService.deletePrivacyNotice(id);
      
      if (response.data) {
        setNotices(prev => prev.filter(n => n.id !== id));
        setStats(prev => ({ ...prev, total: prev.total - 1 }));
      }
    } catch (err) {
      console.error('Error deleting notice:', err);
      alert('Failed to delete notice: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const response = await privacyNoticeService.exportPrivacyNotices(format, filters);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `privacy-notices.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Export failed');
      }
    } catch (err) {
      console.error('Error exporting notices:', err);
      alert('Failed to export notices: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'draft':
        return <Edit className="h-4 w-4 text-yellow-500" />;
      case 'archived':
        return <FileText className="h-4 w-4 text-gray-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && notices.length === 0) {
    return (
      <div className="min-h-screen bg-myslt-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-myslt-primary" />
          <p className="text-gray-600">Loading privacy notices...</p>
        </div>
      </div>
    );
  }

  if (error && notices.length === 0) {
    return (
      <div className="min-h-screen bg-myslt-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadNotices}
            className="bg-myslt-primary text-white px-4 py-2 rounded-md hover:bg-myslt-primary-dark transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-myslt-text-primary flex items-center">
            <FileText className="h-5 w-5 mr-2 text-myslt-primary" />
            Privacy Notices Management
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowForm(true)}
              className="bg-myslt-primary text-white px-4 py-2 rounded-md hover:bg-myslt-primary-dark transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Notice
            </button>
            <button
              onClick={() => handleExport('json')}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export JSON
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-blue-600">Total</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-green-600">Active</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
            <div className="text-sm text-yellow-600">Draft</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{stats.archived}</div>
            <div className="text-sm text-gray-600">Archived</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && loadNotices()}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={filters.category || ''}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="general">General</option>
            <option value="marketing">Marketing</option>
            <option value="analytics">Analytics</option>
            <option value="cookies">Cookies</option>
          </select>

          <select
            value={filters.language || ''}
            onChange={(e) => setFilters({ ...filters, language: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Languages</option>
            <option value="en">English</option>
            <option value="si">Sinhala</option>
            <option value="ta">Tamil</option>
          </select>

          <button
            onClick={loadNotices}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Notices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notices.map((notice) => (
          <div key={notice.id} className="bg-myslt-card border border-myslt-accent/20 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon(notice.status)}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(notice.status)}`}>
                  {notice.status.charAt(0).toUpperCase() + notice.status.slice(1)}
                </span>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => {
                    setEditingNotice(notice);
                    setShowForm(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteNotice(notice.id)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
              {notice.title}
            </h3>

            <div className="space-y-2 mb-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-gray-400" />
                <span>{notice.category}</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{notice.language}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>
                  Effective: {new Date(notice.effectiveDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span>{notice.acknowledgments.length} acknowledgments</span>
              </div>
            </div>

            {notice.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {notice.description}
              </p>
            )}

            <div className="flex space-x-2">
              <button
                onClick={() => window.open(`/privacy-notice/${notice.id}`, '_blank')}
                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-myslt-card hover:bg-myslt-service-card transition-colors"
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      {notices.length === 0 && !loading && (
        <div className="text-center py-12 bg-myslt-card rounded-lg">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No privacy notices found.</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-myslt-primary text-white px-4 py-2 rounded-md hover:bg-myslt-primary-dark transition-colors"
          >
            Create your first notice
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <PrivacyNoticeForm
          notice={editingNotice || undefined}
          onSave={(notice) => editingNotice ? handleUpdateNotice(notice as PrivacyNoticeUpdateRequest) : handleCreateNotice(notice as PrivacyNoticeCreateRequest)}
          onCancel={() => {
            setShowForm(false);
            setEditingNotice(null);
          }}
          isLoading={formLoading}
        />
      )}
    </div>
  );
};
