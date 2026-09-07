import React, { useState, useEffect, useCallback } from 'react';
import { 
  Webhook, Plus, Settings, Activity, CheckCircle, XCircle, RefreshCw, 
  Search, Edit, Trash2, Eye, AlertTriangle, Clock, TrendingUp,
  Globe, Zap, Shield, X, Save
} from 'lucide-react';
import axios from 'axios';

interface WebhookData {
  _id: string;
  name: string;
  url: string;
  secret: string;
  events: string[];
  isActive: boolean;
  retryAttempts: number;
  timeout: number;
  headers: Record<string, string>;
  lastTriggered?: string;
  totalTriggers: number;
  successfulTriggers: number;
  failedTriggers: number;
  successRate: number;
  lastError?: {
    message: string;
    timestamp: string;
    statusCode?: number;
  };
  status: 'active' | 'inactive' | 'error';
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface EventType {
  value: string;
  label: string;
  description: string;
}

interface WebhookStats {
  total: number;
  active: number;
  inactive: number;
  totalTriggers: number;
  totalSuccess: number;
  totalFailures: number;
  successRate: number;
  recentActivity: number;
  topWebhooks: WebhookData[];
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface EventLog {
  _id: string;
  eventType: string;
  deliveryStatus: 'pending' | 'delivered' | 'failed' | 'retry';
  responseCode?: number;
  responseMessage?: string;
  attempts: number;
  maxAttempts: number;
  deliveredAt?: string;
  error?: string;
  createdAt: string;
}

const EventListenerManager: React.FC = () => {
  const [webhooks, setWebhooks] = useState<WebhookData[]>([]);
  const [availableEvents, setAvailableEvents] = useState<EventType[]>([]);
  const [stats, setStats] = useState<WebhookStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Search and filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false
  });
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookData | null>(null);
  const [webhookLogs, setWebhookLogs] = useState<EventLog[]>([]);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: [] as string[],
    isActive: true,
    retryAttempts: 3,
    timeout: 30000,
    headers: {} as Record<string, string>
  });

  // API Base URL
  const API_BASE_URL = `${import.meta.env.VITE_GATEWAY_API_URL || 'http://localhost:3001'}/api/v1`;

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // Fetch webhooks
  const fetchWebhooks = useCallback(async (page = 1) => {
    try {
      setLoading(page === 1);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (eventFilter) params.append('event', eventFilter);

      const response = await axios.get(
        `${API_BASE_URL}/webhooks?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        }
      );

      if (response.data.success) {
        setWebhooks(response.data.data);
        setPagination(response.data.pagination);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      setWebhooks([]);
      setPagination({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
        hasNext: false,
        hasPrev: false
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchTerm, statusFilter, eventFilter]);

  // Fetch available events
  const fetchAvailableEvents = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/webhooks/events`,
        {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        }
      );

      if (response.data.success) {
        setAvailableEvents(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/webhooks/stats`,
        {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        }
      );

      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchWebhooks(1);
  }, [fetchWebhooks]);

  useEffect(() => {
    fetchAvailableEvents();
    fetchStats();
  }, []);

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWebhooks(currentPage);
    fetchStats();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      events: [],
      isActive: true,
      retryAttempts: 3,
      timeout: 30000,
      headers: {}
    });
  };

  const handleCreateWebhook = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/webhooks`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setShowCreateModal(false);
        resetForm();
        await fetchWebhooks(1);
        await fetchStats();
      }
    } catch (error) {
      console.error('Error creating webhook:', error);
      alert('Error creating webhook. Please check your input and try again.');
    }
  };

  const handleEditWebhook = async () => {
    if (!selectedWebhook) return;

    try {
      const response = await axios.put(
        `${API_BASE_URL}/webhooks/${selectedWebhook._id}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setShowEditModal(false);
        setSelectedWebhook(null);
        resetForm();
        await fetchWebhooks(currentPage);
        await fetchStats();
      }
    } catch (error) {
      console.error('Error updating webhook:', error);
      alert('Error updating webhook. Please check your input and try again.');
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/webhooks/${webhookId}`,
        {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        }
      );

      if (response.data.success) {
        await fetchWebhooks(currentPage);
        await fetchStats();
      }
    } catch (error) {
      console.error('Error deleting webhook:', error);
      alert('Error deleting webhook. Please try again.');
    }
  };

  const handleTestWebhook = async (webhookId: string) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/webhooks/${webhookId}/test`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        }
      );

      const result = response.data;
      const message = result.success 
        ? `✅ Test successful! Status: ${result.data.statusCode}`
        : `❌ Test failed: ${result.data.error || 'Unknown error'}`;
      
      alert(message);
      
      // Refresh data to show updated stats
      await fetchWebhooks(currentPage);
    } catch (error) {
      console.error('Error testing webhook:', error);
      alert('Error testing webhook. Please try again.');
    }
  };

  const handleViewLogs = async (webhook: WebhookData) => {
    setSelectedWebhook(webhook);
    setShowLogsModal(true);
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/webhooks/${webhook._id}/logs?limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        }
      );

      if (response.data.success) {
        setWebhookLogs(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching webhook logs:', error);
    }
  };

  const openEditModal = (webhook: WebhookData) => {
    setSelectedWebhook(webhook);
    setFormData({
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      isActive: webhook.isActive,
      retryAttempts: webhook.retryAttempts,
      timeout: webhook.timeout,
      headers: webhook.headers
    });
    setShowEditModal(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'inactive':
        return <XCircle className="w-5 h-5 text-slate-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <XCircle className="w-5 h-5 text-slate-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-600/20 text-green-600 border border-green-200/30';
      case 'inactive':
        return 'bg-slate-50/20 text-slate-500 border border-slate-200';
      case 'error':
        return 'bg-red-50 text-red-600 border border-red-200';
      default:
        return 'bg-slate-50/20 text-slate-500 border border-slate-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Event Listeners</h1>
            <p className="text-slate-600 mt-2">Manage webhooks and event notifications</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 px-4 py-2 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Add Webhook</span>
            </button>
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-lg px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 px-4 py-2 flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                <Webhook className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Webhooks</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Active</p>
                <p className="text-2xl font-bold text-slate-900">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-amber-600/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Success Rate</p>
                <p className="text-2xl font-bold text-slate-900">{stats.successRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-50/20 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">24h Activity</p>
                <p className="text-2xl font-bold text-slate-900">{stats.recentActivity}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search webhooks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors w-full pl-10"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">All Events</option>
            {availableEvents.map(event => (
              <option key={event.value} value={event.value}>
                {event.label}
              </option>
            ))}
          </select>

          <div className="text-sm text-slate-500 flex items-center">
            Showing {webhooks.length} of {pagination.total} webhooks
          </div>
        </div>
      </div>

      {/* Webhooks Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
            {webhooks.length > 0 ? webhooks.map((webhook) => (
              <div key={webhook._id} className="myslt-service-card border-2 border-slate-200 p-6 hover:shadow-lg hover:border-slate-200 transition-all duration-200 rounded-xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-50/20 rounded-xl flex items-center justify-center">
                    <Webhook className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(webhook.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(webhook.status)}`}>
                      {webhook.status}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{webhook.name}</h3>
                <p className="text-sm text-slate-600 mb-4 break-all">{webhook.url}</p>
                
                {/* Statistics */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900">{webhook.totalTriggers}</p>
                    <p className="text-xs text-slate-500">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">{webhook.successfulTriggers}</p>
                    <p className="text-xs text-slate-500">Success</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900">{webhook.successRate}%</p>
                    <p className="text-xs text-slate-500">Rate</p>
                  </div>
                </div>
                
                {/* Events */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-slate-600 mb-2">Events ({webhook.events.length}):</p>
                  <div className="flex flex-wrap gap-1">
                    {webhook.events.slice(0, 3).map((event, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-600/20 text-blue-600 text-xs rounded border border-slate-200/30">
                        {event}
                      </span>
                    ))}
                    {webhook.events.length > 3 && (
                      <span className="px-2 py-1 bg-slate-50/20 text-slate-500 text-xs rounded border border-slate-200">
                        +{webhook.events.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Last triggered */}
                {webhook.lastTriggered && (
                  <div className="mb-4 flex items-center text-xs text-slate-500">
                    <Clock className="w-3 h-3 mr-1" />
                    Last triggered: {formatDate(webhook.lastTriggered)}
                  </div>
                )}

                {/* Error display */}
                {webhook.lastError && (
                  <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                    <div className="flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Last error: {webhook.lastError.message}
                    </div>
                  </div>
                )}
                
                {/* Separator line */}
                <div className="border-t border-slate-200/50 my-4"></div>
                
                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleTestWebhook(webhook._id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 px-3 py-2 flex items-center justify-center space-x-2"
                  >
                    <Activity className="w-4 h-4" />
                    <span className="text-sm">Test</span>
                  </button>
                  <button 
                    onClick={() => handleViewLogs(webhook)}
                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
                    title="View Logs"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => openEditModal(webhook)}
                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteWebhook(webhook._id)}
                    className="p-2 text-red-600 hover:text-red-600/80 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-12">
                <Webhook className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No webhooks found</h3>
                <p className="text-slate-600 mb-4">Create your first webhook to start receiving event notifications.</p>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 px-4 py-2"
                >
                  Add Webhook
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} webhooks
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => fetchWebhooks(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-lg px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="px-3 py-1 text-sm bg-blue-50 text-white rounded">
                  {pagination.page}
                </span>
                
                <button
                  onClick={() => fetchWebhooks(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-lg px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Webhook Modal */}
      {showCreateModal && (
        <WebhookModal
          title="Create New Webhook"
          formData={formData}
          setFormData={setFormData}
          availableEvents={availableEvents}
          onSave={handleCreateWebhook}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
        />
      )}

      {/* Edit Webhook Modal */}
      {showEditModal && (
        <WebhookModal
          title="Edit Webhook"
          formData={formData}
          setFormData={setFormData}
          availableEvents={availableEvents}
          onSave={handleEditWebhook}
          onClose={() => {
            setShowEditModal(false);
            setSelectedWebhook(null);
            resetForm();
          }}
        />
      )}

      {/* Webhook Logs Modal */}
      {showLogsModal && selectedWebhook && (
        <LogsModal
          webhook={selectedWebhook}
          logs={webhookLogs}
          onClose={() => {
            setShowLogsModal(false);
            setSelectedWebhook(null);
            setWebhookLogs([]);
          }}
        />
      )}
    </div>
  );
};

// Webhook Create/Edit Modal Component
interface WebhookModalProps {
  title: string;
  formData: any;
  setFormData: (data: any) => void;
  availableEvents: EventType[];
  onSave: () => void;
  onClose: () => void;
}

const WebhookModal: React.FC<WebhookModalProps> = ({ title, formData, setFormData, availableEvents, onSave, onClose }) => {
  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');

  const addHeader = () => {
    if (newHeaderKey.trim() && newHeaderValue.trim()) {
      setFormData({
        ...formData,
        headers: {
          ...formData.headers,
          [newHeaderKey]: newHeaderValue
        }
      });
      setNewHeaderKey('');
      setNewHeaderValue('');
    }
  };

  const removeHeader = (key: string) => {
    const { [key]: removed, ...rest } = formData.headers;
    setFormData({
      ...formData,
      headers: rest
    });
  };

  const toggleEvent = (eventValue: string) => {
    const isSelected = formData.events.includes(eventValue);
    const newEvents = isSelected 
      ? formData.events.filter((e: string) => e !== eventValue)
      : [...formData.events, eventValue];
    
    setFormData({ ...formData, events: newEvents });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900">Basic Settings</h4>
              
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors w-full"
                  placeholder="Enter webhook name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">URL</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors w-full"
                  placeholder="https://example.com/webhook"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-slate-900">
                  Active
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Retry Attempts</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.retryAttempts}
                  onChange={(e) => setFormData({ ...formData, retryAttempts: parseInt(e.target.value) })}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Timeout (ms)</label>
                <input
                  type="number"
                  min="1000"
                  max="120000"
                  value={formData.timeout}
                  onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) })}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors w-full"
                />
              </div>
            </div>

            {/* Events Selection */}
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900">Events</h4>
              <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg p-3 myslt-service-card">
                {availableEvents.map((event) => (
                  <div key={event.value} className="flex items-start space-x-3 py-2">
                    <input
                      type="checkbox"
                      id={event.value}
                      checked={formData.events.includes(event.value)}
                      onChange={() => toggleEvent(event.value)}
                      className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 focus:ring-2 mt-1"
                    />
                    <div className="flex-1">
                      <label htmlFor={event.value} className="block text-sm font-medium text-slate-900 cursor-pointer">
                        {event.label}
                      </label>
                      <p className="text-xs text-slate-500 mt-1">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Custom Headers */}
          <div className="mt-6">
            <h4 className="font-medium text-slate-900 mb-4">Custom Headers</h4>
            
            {/* Add Header */}
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                placeholder="Header name"
                value={newHeaderKey}
                onChange={(e) => setNewHeaderKey(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors flex-1"
              />
              <input
                type="text"
                placeholder="Header value"
                value={newHeaderValue}
                onChange={(e) => setNewHeaderValue(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors flex-1"
              />
              <button
                type="button"
                onClick={addHeader}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 px-4 py-2"
              >
                Add
              </button>
            </div>

            {/* Existing Headers */}
            <div className="space-y-2">
              {Object.entries(formData.headers).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2 p-2 myslt-service-card rounded">
                  <span className="font-medium text-slate-600">{key}:</span>
                  <span className="text-slate-900">{value as string}</span>
                  <button
                    type="button"
                    onClick={() => removeHeader(key)}
                    className="ml-auto p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-end space-x-3">
            <button 
              onClick={onClose}
              className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-lg px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 px-4 py-2"
            >
              Cancel
            </button>
            <button 
              onClick={onSave}
              disabled={!formData.name || !formData.url || formData.events.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Webhook</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Logs Modal Component
interface LogsModalProps {
  webhook: WebhookData;
  logs: EventLog[];
  onClose: () => void;
}

const LogsModal: React.FC<LogsModalProps> = ({ webhook, logs, onClose }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'myslt-success border border-green-200';
      case 'failed':
        return 'myslt-danger border border-slate-200/20';
      case 'pending':
        return 'myslt-warning border border-slate-200/20';
      case 'retry':
        return 'myslt-info border border-slate-200/20';
      default:
        return 'myslt-muted border border-slate-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Delivery Logs</h3>
              <p className="text-sm text-slate-600">{webhook.name}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-blue-50/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {logs.length > 0 ? (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log._id} className="myslt-service-card border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.deliveryStatus)}`}>
                        {log.deliveryStatus}
                      </span>
                      <span className="font-medium text-slate-900">{log.eventType}</span>
                    </div>
                    <div className="text-sm text-slate-500">
                      {formatDate(log.createdAt)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Attempts:</span>
                      <span className="ml-2 font-medium text-slate-900">{log.attempts}/{log.maxAttempts}</span>
                    </div>
                    
                    {log.responseCode && (
                      <div>
                        <span className="text-slate-600">Response:</span>
                        <span className="ml-2 font-medium text-slate-900">{log.responseCode}</span>
                      </div>
                    )}
                    
                    {log.deliveredAt && (
                      <div>
                        <span className="text-slate-600">Delivered:</span>
                        <span className="ml-2 font-medium text-slate-900">{formatDate(log.deliveredAt)}</span>
                      </div>
                    )}
                  </div>
                  
                  {log.error && (
                    <div className="mt-3 p-2 bg-red-50 border border-slate-200/20 rounded text-sm text-red-600">
                      <strong>Error:</strong> {log.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Activity className="w-12 h-12 text-slate-500/50 mx-auto mb-4" />
              <p>No delivery logs found for this webhook.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventListenerManager;
