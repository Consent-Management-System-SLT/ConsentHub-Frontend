import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Mail, 
  MessageSquare, 
  Bell, 
  Smartphone,
  Users,
  Filter,
  Calendar,
  Search,
  Download,
  RefreshCw,
  Plus,
  Edit3,
  Trash2,
  Play,
  Pause,
  BarChart3,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { csrDashboardService, NotificationTemplate, CampaignData, AnalyticsData, NotificationLog } from '../../services/csrDashboardService';

interface NotificationCenterProps {
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
  // Active tab state
  const [activeTab, setActiveTab] = useState<'send' | 'templates' | 'campaigns' | 'analytics'>('send');
  
  // Send notification states
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [channels, setChannels] = useState<string[]>(['email']);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'promotional' | 'informational' | 'alert' | 'survey'>('informational');
  const [isSending, setIsSending] = useState(false);
  
  // Customer data
  const [customers, setCustomers] = useState<any[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  
  // Templates state
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [preBuiltTemplates, setPreBuiltTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [selectedPreBuiltTemplate, setSelectedPreBuiltTemplate] = useState<any | null>(null);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [showCustomerSelector, setShowCustomerSelector] = useState(false);
  
  // Template creation form states
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateMessage, setTemplateMessage] = useState('');
  const [templateType, setTemplateType] = useState<'promotional' | 'informational' | 'alert' | 'survey'>('informational');
  const [templateChannels, setTemplateChannels] = useState<string[]>(['email']);
  
  // Campaign state
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  
  // Analytics state
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadCustomers();
    loadTemplates();
    loadCampaigns();
    loadAnalytics();
  }, []);

  // Filter customers based on search
  useEffect(() => {
    if (customerSearch.trim()) {
      const filtered = (customers || []).filter(customer => 
        (customer.name || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
        (customer.email || '').toLowerCase().includes(customerSearch.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers || []);
    }
  }, [customers, customerSearch]);

  // Load functions
  const loadCustomers = async () => {
    try {
      const response = await csrDashboardService.getNotificationCustomers();
      const customersData = response.data || [];
      setCustomers(customersData);
      setFilteredCustomers(customersData);
    } catch (error) {
      console.error('Failed to load customers:', error);
      setError('Failed to load customers');
      setCustomers([]);
      setFilteredCustomers([]);
    }
  };

  const loadTemplates = async () => {
    try {
      // Load custom templates
      const response = await csrDashboardService.getNotificationTemplates();
      const templatesData = response.data || [];
      setTemplates(templatesData);
      
      // Load pre-built templates from notification service
      const baseURL = import.meta.env.VITE_GATEWAY_API_URL || 'http://localhost:3001';
      const preBuiltResponse = await fetch(`${baseURL}/api/csr/notifications/templates`);
      if (preBuiltResponse.ok) {
        const preBuiltData = await preBuiltResponse.json();
        setPreBuiltTemplates(preBuiltData.data || []);
        console.log('Pre-built templates loaded:', preBuiltData.data?.length || 0);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
      setTemplates([]);
      setPreBuiltTemplates([]);
    }
  };

  const loadCampaigns = async () => {
    try {
      // For now, create some local campaigns until backend is ready
      const localCampaigns: CampaignData[] = [];
      setCampaigns(localCampaigns);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await csrDashboardService.getNotificationAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      // Provide default analytics structure
      setAnalytics({
        overview: {
          totalSent: 0,
          totalDelivered: 0,
          totalOpened: 0,
          totalClicked: 0,
          totalFailed: 0,
          deliveryRate: 0,
          openRate: 0,
          clickRate: 0
        },
        channels: {},
        trends: [],
        topPerformers: {
          templates: [],
          campaigns: []
        }
      });
    }
  };

  // Handle notification sending
  const handleSendNotification = async () => {
    if (!selectedCustomers.length) {
      setError('Please select at least one customer');
      return;
    }
    if (!channels.length) {
      setError('Please select at least one channel');
      return;
    }
    if (!subject.trim() || !message.trim()) {
      setError('Please provide both subject and message');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const response = await csrDashboardService.sendNotifications({
        customerIds: selectedCustomers,
        channels,
        subject,
        message,
        messageType
      });

      setSuccess(`Notification sent successfully to ${selectedCustomers.length} customers`);
      
      // Clear form
      setSelectedCustomers([]);
      setSubject('');
      setMessage('');
      
      // Reload analytics
      loadAnalytics();
    } catch (error) {
      console.error('Failed to send notification:', error);
      setError('Failed to send notification. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // Handle bulk notification sending to all customers
  const handleSendBulkNotification = async () => {
    if (!channels.length) {
      setError('Please select at least one channel');
      return;
    }
    if (!subject.trim() || !message.trim()) {
      setError('Please provide both subject and message');
      return;
    }

    const confirmSend = window.confirm(
      `Are you sure you want to send this notification to ALL ${customers.length} customers? This action cannot be undone.`
    );
    
    if (!confirmSend) return;

    setIsSending(true);
    setError(null);

    try {
      const response = await csrDashboardService.sendBulkNotifications({
        channels,
        subject,
        message,
        messageType
      });

      setSuccess(`Bulk notification sent successfully to ${response.summary.totalCustomers} customers with ${response.summary.deliveryRate}% delivery rate`);
      
      // Clear form
      setSubject('');
      setMessage('');
      
      // Reload analytics
      loadAnalytics();
    } catch (error: any) {
      console.error('Failed to send bulk notification:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to send bulk notification. Please try again.';
      
      if (error.details?.includes('timeout')) {
        errorMessage = 'Bulk notification is taking longer than expected. It may still be processing in the background.';
      } else if (error.status === 0) {
        errorMessage = 'Connection timeout - bulk notification may still be processing. Please check the analytics for updates.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  // Handle template selection
  const handleTemplateSelect = (template: NotificationTemplate) => {
    setSubject(template.subject);
    setMessage(template.content);
    setChannels(template.channels);
    setMessageType(template.type);
    setSelectedTemplate(template);
  };

  // Handle pre-built template selection - opens customer selector
  const handlePreBuiltTemplateSelect = (template: any) => {
    setSelectedPreBuiltTemplate(template);
    setSubject(template.subject);
    setMessage(template.message);
    setMessageType(template.type || 'informational');
    setChannels(template.channels || ['email']);
    setShowCustomerSelector(true);
    setActiveTab('send'); // Switch to send tab
  };

  // Handle template preview
  const handleTemplatePreview = (template: any) => {
    setSelectedPreBuiltTemplate(template);
    setShowTemplatePreview(true);
  };

  // Handle template edit
  const handleTemplateEdit = (template: any) => {
    setSelectedPreBuiltTemplate(template);
    setSubject(template.subject);
    setMessage(template.message);
    setMessageType(template.type || 'informational');
    setChannels(template.channels || ['email']);
    setActiveTab('send'); // Switch to send tab
    setSuccess(`Template "${template.name}" loaded for editing. Select customers and send when ready.`);
  };

  // Save custom template function
  const saveCustomTemplate = () => {
    if (!templateName.trim() || !templateSubject.trim() || !templateMessage.trim()) {
      setError('Please provide template name, subject, and message');
      return;
    }

    const newTemplate: NotificationTemplate = {
      id: Date.now().toString(),
      name: templateName,
      description: templateDescription || `${templateType} template`,
      type: templateType,
      channels: templateChannels,
      subject: templateSubject,
      content: templateMessage,
      variables: [],
      tags: [templateType],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'CSR',
      updatedBy: 'CSR',
      usage: {
        timesUsed: 0,
        lastUsed: undefined,
        averagePerformance: undefined
      }
    };

    // Save to localStorage for persistence
    const savedTemplates = localStorage.getItem('csr_notification_templates');
    const existingTemplates = savedTemplates ? JSON.parse(savedTemplates) : [];
    const updatedTemplates = [...existingTemplates, newTemplate];
    localStorage.setItem('csr_notification_templates', JSON.stringify(updatedTemplates));
    
    setTemplates(updatedTemplates);
    setSuccess('Custom template saved successfully!');
    
    // Reset form
    setTemplateName('');
    setTemplateDescription('');
    setTemplateSubject('');
    setTemplateMessage('');
    setTemplateType('informational');
    setTemplateChannels(['email']);
    setShowTemplateForm(false);
  };

  // Delete custom template function
  const deleteTemplate = (templateId: string) => {
    const savedTemplates = localStorage.getItem('csr_notification_templates');
    if (savedTemplates) {
      const existingTemplates = JSON.parse(savedTemplates);
      const updatedTemplates = existingTemplates.filter((t: any) => t.id !== templateId);
      localStorage.setItem('csr_notification_templates', JSON.stringify(updatedTemplates));
      setTemplates(updatedTemplates);
      setSuccess('Template deleted successfully!');
    }
  };

  // Load templates from localStorage
  useEffect(() => {
    const savedTemplates = localStorage.getItem('csr_notification_templates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }
  }, []);

  // Channel icons
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      case 'push': return <Bell className="w-4 h-4" />;
      case 'inapp': return <Smartphone className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className={`notification-center bg-myslt-background min-h-screen ${className}`}>
      {/* Header */}
      <div className="bg-myslt-card border-b border-myslt-accent/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-myslt-text">Notification Center</h1>
            <p className="text-myslt-text-secondary mt-1">Send notifications and manage campaigns</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadAnalytics}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-myslt-primary text-white rounded-lg hover:bg-myslt-primary/90 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mt-6">
          {[
            { key: 'send', label: 'Send Notification', icon: Send },
            { key: 'templates', label: 'Templates', icon: Edit3 },
            { key: 'campaigns', label: 'Campaigns', icon: Users },
            { key: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === key
                  ? 'bg-myslt-primary text-white shadow-md'
                  : 'text-myslt-text-secondary hover:bg-myslt-accent/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Success Popup Modal */}
      {success && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-myslt-card rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl transform animate-slideUp border border-myslt-success">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-myslt-success mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-myslt-text-primary mb-2">Success!</h3>
              <p className="text-myslt-text-secondary mb-6">{success}</p>
              <button
                onClick={() => setSuccess(null)}
                className="px-6 py-2 bg-myslt-success text-white rounded-lg hover:bg-myslt-success hover:opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-myslt-success focus:ring-offset-2"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert Banner */}

      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="p-6">
        {activeTab === 'send' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Template Status Banner */}
            {(selectedPreBuiltTemplate || selectedTemplate) && (
              <div className="lg:col-span-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Edit3 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900">
                        Template: {selectedPreBuiltTemplate?.name || selectedTemplate?.name}
                      </h4>
                      <p className="text-sm text-blue-700">
                        {selectedPreBuiltTemplate ? 'Pre-built template loaded' : 'Custom template loaded'} - Select customers and channels to send
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedPreBuiltTemplate(null);
                      setSelectedTemplate(null);
                      setSubject('');
                      setMessage('');
                    }}
                    className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-100 transition-colors"
                    title="Clear template"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
            
            {/* Customer Selection */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-myslt-card rounded-xl border border-myslt-accent/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-myslt-text">Select Customers</h3>
                  {selectedCustomers.length > 0 && (
                    <span className="bg-myslt-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                      {selectedCustomers.length} selected
                    </span>
                  )}
                </div>
                
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-myslt-text-secondary w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-myslt-accent/30 rounded-lg focus:ring-2 focus:ring-myslt-primary focus:border-transparent"
                  />
                </div>

                {/* Customer List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {(filteredCustomers || []).map(customer => (
                    <label key={customer.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-myslt-accent/5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.includes(customer.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCustomers([...selectedCustomers, customer.id]);
                          } else {
                            setSelectedCustomers(selectedCustomers.filter(id => id !== customer.id));
                          }
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-myslt-text truncate">{customer.name}</p>
                        <p className="text-sm text-myslt-text-secondary truncate">{customer.email}</p>
                        <p className="text-xs text-myslt-text-secondary">{customer.phone}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="mt-4 text-sm text-myslt-text-secondary">
                  {selectedCustomers.length} customer(s) selected
                </div>
              </div>
            </div>

            {/* Notification Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Notification Content */}
              <div className="bg-myslt-card rounded-xl border border-myslt-accent/20 p-6">
                <h3 className="text-lg font-semibold text-myslt-text mb-4">Notification Content</h3>
                
                <div className="space-y-4">
                  {/* Message Type */}
                  <div>
                    <label className="block text-sm font-medium text-myslt-text mb-2">Message Type</label>
                    <select
                      value={messageType}
                      onChange={(e) => setMessageType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-myslt-accent/30 rounded-lg focus:ring-2 focus:ring-myslt-primary focus:border-transparent"
                    >
                      <option value="informational">Informational</option>
                      <option value="promotional">Promotional</option>
                      <option value="alert">Alert</option>
                      <option value="survey">Survey</option>
                    </select>
                  </div>

                  {/* Channels */}
                  <div>
                    <label className="block text-sm font-medium text-myslt-text mb-2">Channels</label>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { key: 'email', label: 'Email', icon: Mail },
                        { key: 'sms', label: 'SMS', icon: MessageSquare },
                        { key: 'push', label: 'Push', icon: Bell },
                        { key: 'inapp', label: 'In-App', icon: Smartphone }
                      ].map(({ key, label, icon: Icon }) => (
                        <label key={key} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={channels.includes(key)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setChannels([...channels, key]);
                              } else {
                                setChannels(channels.filter(c => c !== key));
                              }
                            }}
                          />
                          <Icon className="w-4 h-4 text-myslt-text-secondary" />
                          <span className="text-myslt-text">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-myslt-text mb-2">Subject</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Enter notification subject..."
                      className="w-full px-3 py-2 border border-myslt-accent/30 rounded-lg focus:ring-2 focus:ring-myslt-primary focus:border-transparent"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-myslt-text mb-2">Message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Enter your message..."
                      rows={6}
                      className="w-full px-3 py-2 border border-myslt-accent/30 rounded-lg focus:ring-2 focus:ring-myslt-primary focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-4">
                    <button
                      onClick={handleSendNotification}
                      disabled={isSending || !selectedCustomers.length || !subject.trim() || !message.trim()}
                      className="flex items-center space-x-2 px-6 py-3 bg-myslt-primary text-white rounded-lg hover:bg-myslt-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className={`w-4 h-4 ${isSending ? 'animate-pulse' : ''}`} />
                      <span>{isSending ? 'Sending...' : `Send to ${selectedCustomers.length} Selected`}</span>
                    </button>

                    <button
                      onClick={handleSendBulkNotification}
                      disabled={isSending || !subject.trim() || !message.trim()}
                      className="flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Users className={`w-4 h-4 ${isSending ? 'animate-pulse' : ''}`} />
                      <span>
                        {isSending 
                          ? `Sending to ${customers.length} customers... This may take up to 1 minute` 
                          : `Send to All ${customers.length} Customers`
                        }
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-myslt-card rounded-xl border border-myslt-accent/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-myslt-text">{analytics?.overview?.totalSent || 0}</p>
                    <p className="text-myslt-text-secondary">Total Sent</p>
                  </div>
                  <Send className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-myslt-card rounded-xl border border-myslt-accent/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-myslt-text">{analytics?.overview?.totalDelivered || 0}</p>
                    <p className="text-myslt-text-secondary">Delivered</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-myslt-card rounded-xl border border-myslt-accent/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-myslt-text">{analytics?.overview?.totalOpened || 0}</p>
                    <p className="text-myslt-text-secondary">Opened</p>
                  </div>
                  <Eye className="w-8 h-8 text-purple-500" />
                </div>
              </div>

              <div className="bg-myslt-card rounded-xl border border-myslt-accent/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-myslt-text">{analytics?.overview?.deliveryRate || 0}%</p>
                    <p className="text-myslt-text-secondary">Delivery Rate</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Channel Performance */}
            <div className="bg-myslt-card rounded-xl border border-myslt-accent/20 p-6">
              <h3 className="text-lg font-semibold text-myslt-text mb-4">Channel Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(analytics?.channels || {}).map(([channel, data]) => (
                  <div key={channel} className="border border-myslt-accent/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      {getChannelIcon(channel)}
                      <span className="font-medium text-myslt-text capitalize">{channel}</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-myslt-text-secondary">Sent:</span>
                        <span className="text-myslt-text">{data.sent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-myslt-text-secondary">Delivered:</span>
                        <span className="text-myslt-text">{data.delivered}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-myslt-text-secondary">Rate:</span>
                        <span className="text-myslt-text">{data.deliveryRate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="bg-myslt-card rounded-xl border border-myslt-accent/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-myslt-text">Campaigns</h3>
                <button
                  onClick={() => setShowCampaignForm(!showCampaignForm)}
                  className="flex items-center space-x-2 px-4 py-2 bg-myslt-primary text-white rounded-lg hover:bg-myslt-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Campaign</span>
                </button>
              </div>
              
              {campaigns.length === 0 ? (
                <div className="text-center py-8 text-myslt-text-secondary">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No campaigns created yet</p>
                  <p className="text-sm">Create your first campaign to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(campaigns || []).map(campaign => (
                    <div key={campaign.id} className="border border-myslt-accent/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-myslt-text">{campaign.name}</h4>
                        <span className={`px-2 py-1 rounded text-xs ${
                          campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                          campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {campaign.status}
                        </span>
                      </div>
                      <p className="text-myslt-text-secondary mb-3">{campaign.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="text-myslt-text-secondary">Audience: {campaign.audienceSize}</span>
                          <span className="text-myslt-text-secondary">Sent: {campaign.performance.sent}</span>
                          <span className="text-myslt-text-secondary">Delivered: {campaign.performance.delivered}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-1 text-myslt-text-secondary hover:text-myslt-primary">
                            <Play className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-myslt-text-secondary hover:text-myslt-primary">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-myslt-text-secondary hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-6">
            {/* Pre-Built Templates Section */}
            <div className="bg-myslt-card rounded-xl border border-myslt-accent/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-myslt-text">Pre-Built Professional Templates</h3>
                  <p className="text-sm text-myslt-text-secondary">Ready-to-use templates with beautiful designs</p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-myslt-text-secondary">
                  <span>{preBuiltTemplates.length} templates available</span>
                </div>
              </div>
              
              {preBuiltTemplates.length === 0 ? (
                <div className="text-center py-8 text-myslt-text-secondary">
                  <RefreshCw className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Loading pre-built templates...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {preBuiltTemplates.map(template => (
                    <div key={template.id} className="bg-myslt-card rounded-lg border border-myslt-primary/30 p-5 hover:shadow-xl hover:border-myslt-primary/50 transition-all duration-300">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-myslt-text-primary text-lg mb-1">{template.name}</h4>
                          <p className="text-sm text-myslt-text-secondary mb-2">{template.description}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ml-2 ${
                          template.type === 'promotional' ? 'bg-myslt-primary/20 text-myslt-primary border border-myslt-primary/30' :
                          template.type === 'informational' ? 'bg-myslt-success/20 text-myslt-success border border-myslt-success/30' :
                          template.type === 'alert' ? 'bg-myslt-warning/20 text-myslt-warning border border-myslt-warning/30' :
                          template.type === 'urgent' ? 'bg-myslt-danger/20 text-myslt-danger border border-myslt-danger/30' :
                          template.type === 'reminder' ? 'bg-myslt-accent/20 text-myslt-accent border border-myslt-accent/30' :
                          'bg-myslt-info/20 text-myslt-info border border-myslt-info/30'
                        }`}>
                          {template.type || 'informational'}
                        </span>
                      </div>
                      
                      {/* Template Preview */}
                      <div className="bg-myslt-primary/5 rounded-lg p-3 mb-3 border border-myslt-primary/10">
                        <p className="text-sm font-medium text-myslt-text-primary mb-1">{template.subject}</p>
                        <p className="text-xs text-myslt-text-secondary line-clamp-3">
                          {template.message?.substring(0, 120)}...
                        </p>
                      </div>
                      
                      {/* Channels */}
                      <div className="flex items-center space-x-3 mb-4">
                        <span className="text-xs text-myslt-text-secondary font-medium">Channels:</span>
                        {(template.channels || ['email']).map(channel => (
                          <div key={channel} className="flex items-center space-x-1 text-xs text-myslt-primary bg-myslt-primary/10 px-2 py-1 rounded border border-myslt-primary/20">
                            {getChannelIcon(channel)}
                            <span>{channel}</span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-3 border-t border-myslt-primary/20">
                        <button 
                          onClick={() => handleTemplatePreview(template)}
                          className="flex items-center space-x-1 text-myslt-primary hover:text-myslt-primary/80 text-sm font-medium transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Preview</span>
                        </button>
                        <button 
                          onClick={() => handleTemplateEdit(template)}
                          className="flex items-center space-x-1 text-myslt-warning hover:text-myslt-warning/80 text-sm font-medium transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button 
                          onClick={() => handlePreBuiltTemplateSelect(template)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-myslt-primary text-myslt-text-primary rounded-lg hover:bg-myslt-primary/90 text-sm font-medium transition-colors"
                        >
                          <Play className="w-4 h-4" />
                          <span>Use</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Templates Section */}
            <div className="bg-myslt-card rounded-xl border border-myslt-accent/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-myslt-text">Custom Templates</h3>
                  <p className="text-sm text-myslt-text-secondary">Your saved notification templates</p>
                </div>
                <button
                  onClick={() => setShowTemplateForm(!showTemplateForm)}
                  className="flex items-center space-x-2 px-4 py-2 bg-myslt-primary text-white rounded-lg hover:bg-myslt-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Template</span>
                </button>
              </div>

              {/* Template Creation Form */}
              {showTemplateForm && (
                <div className="bg-gray-50 rounded-lg p-6 mb-6 border-2 border-dashed border-myslt-primary/20">
                  <h4 className="font-semibold text-myslt-text mb-4">Create New Template</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Template Name */}
                    <div>
                      <label className="block text-sm font-medium text-myslt-text mb-2">Template Name</label>
                      <input
                        type="text"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="e.g., Welcome Message"
                        className="w-full px-3 py-2 border border-myslt-accent/30 rounded-lg focus:ring-2 focus:ring-myslt-primary focus:border-transparent"
                      />
                    </div>

                    {/* Template Type */}
                    <div>
                      <label className="block text-sm font-medium text-myslt-text mb-2">Template Type</label>
                      <select
                        value={templateType}
                        onChange={(e) => setTemplateType(e.target.value as any)}
                        className="w-full px-3 py-2 border border-myslt-accent/30 rounded-lg focus:ring-2 focus:ring-myslt-primary focus:border-transparent"
                      >
                        <option value="informational">Informational</option>
                        <option value="promotional">Promotional</option>
                        <option value="alert">Alert</option>
                        <option value="survey">Survey</option>
                      </select>
                    </div>

                    {/* Template Description */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-myslt-text mb-2">Description (Optional)</label>
                      <input
                        type="text"
                        value={templateDescription}
                        onChange={(e) => setTemplateDescription(e.target.value)}
                        placeholder="Brief description of the template"
                        className="w-full px-3 py-2 border border-myslt-accent/30 rounded-lg focus:ring-2 focus:ring-myslt-primary focus:border-transparent"
                      />
                    </div>

                    {/* Template Subject */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-myslt-text mb-2">Subject</label>
                      <input
                        type="text"
                        value={templateSubject}
                        onChange={(e) => setTemplateSubject(e.target.value)}
                        placeholder="Email subject line"
                        className="w-full px-3 py-2 border border-myslt-accent/30 rounded-lg focus:ring-2 focus:ring-myslt-primary focus:border-transparent"
                      />
                    </div>

                    {/* Template Message */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-myslt-text mb-2">Message</label>
                      <textarea
                        value={templateMessage}
                        onChange={(e) => setTemplateMessage(e.target.value)}
                        placeholder="Template message content..."
                        rows={6}
                        className="w-full px-3 py-2 border border-myslt-accent/30 rounded-lg focus:ring-2 focus:ring-myslt-primary focus:border-transparent"
                      />
                    </div>

                    {/* Template Channels */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-myslt-text mb-2">Default Channels</label>
                      <div className="flex flex-wrap gap-3">
                        {[
                          { key: 'email', label: 'Email', icon: Mail },
                          { key: 'sms', label: 'SMS', icon: MessageSquare },
                          { key: 'push', label: 'Push', icon: Bell },
                          { key: 'inapp', label: 'In-App', icon: Smartphone }
                        ].map(({ key, label, icon: Icon }) => (
                          <label key={key} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={templateChannels.includes(key)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setTemplateChannels([...templateChannels, key]);
                                } else {
                                  setTemplateChannels(templateChannels.filter(c => c !== key));
                                }
                              }}
                            />
                            <Icon className="w-4 h-4 text-myslt-text-secondary" />
                            <span className="text-myslt-text">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-myslt-primary/20">
                    <button
                      onClick={() => {
                        setShowTemplateForm(false);
                        setTemplateName('');
                        setTemplateDescription('');
                        setTemplateSubject('');
                        setTemplateMessage('');
                      }}
                      className="px-4 py-2 text-myslt-text-secondary hover:text-myslt-text transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveCustomTemplate}
                      className="px-6 py-2 bg-myslt-primary text-white rounded-lg hover:bg-myslt-primary/90 transition-colors"
                    >
                      Save Template
                    </button>
                  </div>
                </div>
              )}
              
              {templates.length === 0 ? (
                <div className="text-center py-8 text-myslt-text-secondary">
                  <Edit3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No custom templates created yet</p>
                  <p className="text-sm">Create templates to save your frequently used messages</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(templates || []).map(template => (
                    <div key={template.id} className="border border-myslt-accent/20 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-myslt-text">{template.name}</h4>
                        <span className={`px-2 py-1 rounded text-xs ${
                          template.type === 'promotional' ? 'bg-blue-100 text-blue-800' :
                          template.type === 'informational' ? 'bg-green-100 text-green-800' :
                          template.type === 'alert' ? 'bg-red-100 text-red-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {template.type}
                        </span>
                      </div>
                      <p className="text-myslt-text-secondary text-sm mb-3">{template.description}</p>
                      <div className="flex items-center space-x-2 mb-3">
                        {(template.channels || []).map((channel: string) => (
                          <div key={channel} className="flex items-center space-x-1 text-xs text-myslt-text-secondary">
                            {getChannelIcon(channel)}
                            <span>{channel}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-myslt-text-secondary">Used: {template.usage?.timesUsed || 0} times</span>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleTemplateSelect(template)}
                            className="text-myslt-primary hover:text-myslt-primary/80"
                          >
                            Use
                          </button>
                          <button 
                            onClick={() => deleteTemplate(template.id)}
                            className="text-myslt-text-secondary hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Template Preview Modal */}
            {showTemplatePreview && selectedPreBuiltTemplate && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-myslt-card rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto border border-myslt-primary/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-myslt-text-primary">Template Preview</h3>
                    <button 
                      onClick={() => setShowTemplatePreview(false)}
                      className="text-myslt-text-secondary hover:text-myslt-text-primary transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-myslt-text-primary mb-2">{selectedPreBuiltTemplate.name}</h4>
                      <p className="text-myslt-text-secondary text-sm">{selectedPreBuiltTemplate.description}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-myslt-text-primary mb-1">Subject</label>
                      <div className="bg-myslt-primary/10 p-3 rounded-lg border border-myslt-primary/20">
                        <p className="text-myslt-text-primary">{selectedPreBuiltTemplate.subject}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-myslt-text-primary mb-1">Message</label>
                      <div className="bg-myslt-primary/10 p-3 rounded-lg max-h-60 overflow-y-auto border border-myslt-primary/20">
                        <p className="text-myslt-text-primary whitespace-pre-line">{selectedPreBuiltTemplate.message}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-myslt-primary/20">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-myslt-text-secondary">Type: {selectedPreBuiltTemplate.type || 'informational'}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-myslt-text-secondary">Channels:</span>
                          {(selectedPreBuiltTemplate.channels || ['email']).map(channel => (
                            <span key={channel} className="bg-gray-100 px-2 py-1 rounded text-xs">{channel}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => {
                            handleTemplateEdit(selectedPreBuiltTemplate);
                            setShowTemplatePreview(false);
                          }}
                          className="px-4 py-2 text-myslt-primary border border-myslt-primary rounded-lg hover:bg-myslt-primary/10"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => {
                            handlePreBuiltTemplateSelect(selectedPreBuiltTemplate);
                            setShowTemplatePreview(false);
                          }}
                          className="px-4 py-2 bg-myslt-primary text-white rounded-lg hover:bg-myslt-primary/90"
                        >
                          Use Template
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
