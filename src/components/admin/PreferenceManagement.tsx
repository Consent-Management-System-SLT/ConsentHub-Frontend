import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X, Settings, Users, MessageSquare, Bell } from 'lucide-react';

interface CommunicationChannel {
  id: string;
  name: string;
  key: string;
  description: string;
  icon: string;
  enabled: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TopicSubscription {
  id: string;
  name: string;
  key: string;
  description: string;
  category: string;
  enabled: boolean;
  isDefault: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

const PreferenceManagement: React.FC = () => {
  const [channels, setChannels] = useState<CommunicationChannel[]>([]);
  const [topics, setTopics] = useState<TopicSubscription[]>([]);
  const [activeTab, setActiveTab] = useState<'channels' | 'topics'>('channels');
  const [error, setError] = useState<string | null>(null);
  const [newChannel, setNewChannel] = useState<Partial<CommunicationChannel>>({
    name: '',
    key: '',
    description: '',
    icon: 'MessageSquare',
    enabled: true,
    isDefault: false
  });
  const [newTopic, setNewTopic] = useState<Partial<TopicSubscription>>({
    name: '',
    key: '',
    description: '',
    category: 'marketing',
    enabled: true,
    isDefault: false,
    priority: 'medium'
  });
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);

  useEffect(() => {
    loadPreferenceData();
  }, []);

  const loadPreferenceData = async () => {
    setError(null);
    try {
      // Load existing channels and topics from backend
      const baseURL = import.meta.env.VITE_GATEWAY_API_URL || 'http://localhost:3001';
      const [channelsResponse, topicsResponse] = await Promise.all([
        fetch(`${baseURL}/api/v1/admin/preference-channels`),
        fetch(`${baseURL}/api/v1/admin/preference-topics`)
      ]);

      if (channelsResponse.ok) {
        const channelsData = await channelsResponse.json();
        setChannels(channelsData.channels || getDefaultChannels());
      } else {
        setChannels(getDefaultChannels());
      }

      if (topicsResponse.ok) {
        const topicsData = await topicsResponse.json();
        setTopics(topicsData.topics || getDefaultTopics());
      } else {
        setTopics(getDefaultTopics());
      }
    } catch (err) {
      console.error('Error loading preference data:', err);
      setError('Failed to load preference configuration');
      // Load default data as fallback
      setChannels(getDefaultChannels());
      setTopics(getDefaultTopics());
    }
  };

  const getDefaultChannels = (): CommunicationChannel[] => [
    {
      id: '1',
      name: 'Email Notifications',
      key: 'email',
      description: 'Receive notifications via email',
      icon: 'Mail',
      enabled: true,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'SMS Notifications',
      key: 'sms',
      description: 'Receive notifications via SMS',
      icon: 'MessageSquare',
      enabled: true,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Push Notifications',
      key: 'push',
      description: 'Receive push notifications on your mobile device',
      icon: 'Bell',
      enabled: true,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '4',
      name: 'In-App Notifications',
      key: 'inapp',
      description: 'Receive notifications within the application',
      icon: 'Monitor',
      enabled: true,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const getDefaultTopics = (): TopicSubscription[] => [
    {
      id: '1',
      name: 'Special Offers & Promotions',
      key: 'promotions',
      description: 'Promotional offers and discounts',
      category: 'marketing',
      enabled: true,
      isDefault: false,
      priority: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Product Updates',
      key: 'product_updates',
      description: 'New features and service updates',
      category: 'product',
      enabled: true,
      isDefault: true,
      priority: 'high',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Service Alerts',
      key: 'service_alerts',
      description: 'Important service notifications and outages',
      category: 'service',
      enabled: true,
      isDefault: true,
      priority: 'high',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Billing & Payments',
      key: 'billing',
      description: 'Bill notifications and payment reminders',
      category: 'billing',
      enabled: true,
      isDefault: true,
      priority: 'high',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '5',
      name: 'Security Alerts',
      key: 'security',
      description: 'Account security and privacy updates',
      category: 'security',
      enabled: true,
      isDefault: true,
      priority: 'high',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '6',
      name: 'Newsletters',
      key: 'newsletters',
      description: 'Company news and industry insights',
      category: 'marketing',
      enabled: true,
      isDefault: false,
      priority: 'low',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const handleAddChannel = async () => {
    if (!newChannel.name || !newChannel.key) {
      setError('Channel name and key are required');
      return;
    }

    try {
      // Save to backend first
      const baseURL = import.meta.env.VITE_GATEWAY_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseURL}/api/v1/admin/preference-channels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newChannel.name,
          key: newChannel.key,
          description: newChannel.description || '',
          icon: newChannel.icon || 'MessageSquare',
          enabled: newChannel.enabled !== false,
          isDefault: newChannel.isDefault === true
        })
      });

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success) {
          // Add the channel returned from backend to state
          setChannels(prev => [...prev, responseData.channel]);
          setError(null);
        } else {
          setError(responseData.message || 'Failed to create channel');
          return;
        }
      } else {
        setError('Failed to create channel');
        return;
      }
      
      // Reset form
      setNewChannel({
        name: '',
        key: '',
        description: '',
        icon: 'MessageSquare',
        enabled: true,
        isDefault: false
      });
      setShowAddChannel(false);

    } catch (err) {
      console.error('Error adding channel:', err);
      setError('Failed to add communication channel');
    }
  };

  const handleAddTopic = async () => {
    if (!newTopic.name || !newTopic.key) {
      setError('Topic name and key are required');
      return;
    }

    try {
      // Save to backend first
      const baseURL = import.meta.env.VITE_GATEWAY_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseURL}/api/v1/admin/preference-topics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTopic.name,
          key: newTopic.key,
          description: newTopic.description || '',
          category: newTopic.category || 'general',
          enabled: newTopic.enabled !== false,
          isDefault: newTopic.isDefault === true,
          priority: newTopic.priority || 'medium'
        })
      });

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success) {
          // Add the topic returned from backend to state
          setTopics(prev => [...prev, responseData.topic]);
          setError(null);
        } else {
          setError(responseData.message || 'Failed to create topic');
          return;
        }
      } else {
        setError('Failed to create topic');
        return;
      }
      
      // Reset form
      setNewTopic({
        name: '',
        key: '',
        description: '',
        category: 'marketing',
        enabled: true,
        isDefault: false,
        priority: 'medium'
      });
      setShowAddTopic(false);

    } catch (err) {
      console.error('Error adding topic:', err);
      setError('Failed to add topic subscription');
    }
  };
      });
      setShowAddTopic(false);

      // Save to backend (optional)
      try {
        await fetch('/api/v1/admin/preference-topics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(topicData)
        });
      } catch (err) {
        console.warn('Could not save to backend, using local storage fallback');
      }

    } catch (err) {
      setError('Failed to add topic subscription');
    }
  };

  const handleDeleteChannel = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this communication channel?')) {
      setChannels(prev => prev.filter(channel => channel.id !== id));
      
      try {
        await fetch(`/api/v1/admin/preference-channels/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('Could not delete from backend');
      }
    }
  };

  const handleDeleteTopic = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this topic subscription?')) {
      setTopics(prev => prev.filter(topic => topic.id !== id));
      
      try {
        await fetch(`/api/v1/admin/preference-topics/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('Could not delete from backend');
      }
    }
  };

  const toggleChannelStatus = async (id: string) => {
    setChannels(prev => prev.map(channel => 
      channel.id === id 
        ? { ...channel, enabled: !channel.enabled, updatedAt: new Date().toISOString() }
        : channel
    ));
  };

  const toggleTopicStatus = async (id: string) => {
    setTopics(prev => prev.map(topic => 
      topic.id === id 
        ? { ...topic, enabled: !topic.enabled, updatedAt: new Date().toISOString() }
        : topic
    ));
  };

  const getStatusBadge = (enabled: boolean, isDefault: boolean) => {
    if (!enabled) return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Disabled</span>;
    if (isDefault) return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Default</span>;
    return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Enabled</span>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-gray-100 text-gray-800'
    };
    return <span className={`px-2 py-1 text-xs rounded-full ${colors[priority as keyof typeof colors]}`}>{priority}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Settings className="h-7 w-7 text-blue-600" />
                  Preference Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Configure communication channels and topic subscriptions for customer preferences
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleString()}</p>
                <p className="text-sm font-medium text-gray-900">
                  {channels.filter(c => c.enabled).length} Channels • {topics.filter(t => t.enabled).length} Topics
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('channels')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'channels'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <MessageSquare className="h-4 w-4 inline mr-2" />
                Communication Channels ({channels.length})
              </button>
              <button
                onClick={() => setActiveTab('topics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'topics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Bell className="h-4 w-4 inline mr-2" />
                Topic Subscriptions ({topics.length})
              </button>
            </nav>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Communication Channels Tab */}
        {activeTab === 'channels' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Communication Channels</h2>
                  <button
                    onClick={() => setShowAddChannel(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Channel
                  </button>
                </div>
              </div>

              {/* Add Channel Form */}
              {showAddChannel && (
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Channel Name</label>
                      <input
                        type="text"
                        value={newChannel.name || ''}
                        onChange={(e) => setNewChannel(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., WhatsApp Notifications"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Channel Key</label>
                      <input
                        type="text"
                        value={newChannel.key || ''}
                        onChange={(e) => setNewChannel(prev => ({ ...prev, key: e.target.value }))}
                        placeholder="e.g., whatsapp"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                      <select
                        value={newChannel.icon || ''}
                        onChange={(e) => setNewChannel(prev => ({ ...prev, icon: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="MessageSquare">MessageSquare</option>
                        <option value="Mail">Mail</option>
                        <option value="Bell">Bell</option>
                        <option value="Monitor">Monitor</option>
                        <option value="Phone">Phone</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newChannel.enabled || false}
                          onChange={(e) => setNewChannel(prev => ({ ...prev, enabled: e.target.checked }))}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Enabled</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newChannel.isDefault || false}
                          onChange={(e) => setNewChannel(prev => ({ ...prev, isDefault: e.target.checked }))}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Default</span>
                      </label>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={newChannel.description || ''}
                      onChange={(e) => setNewChannel(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="e.g., Receive notifications via WhatsApp"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={handleAddChannel}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save Channel
                    </button>
                    <button
                      onClick={() => setShowAddChannel(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Channels List */}
              <div className="divide-y divide-gray-200">
                {channels.map((channel) => (
                  <div key={channel.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{channel.name}</h3>
                        <p className="text-sm text-gray-500">{channel.description}</p>
                        <p className="text-xs text-gray-400">Key: {channel.key}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(channel.enabled, channel.isDefault)}
                      <button
                        onClick={() => toggleChannelStatus(channel.id)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          channel.enabled
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {channel.enabled ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleDeleteChannel(channel.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Topic Subscriptions Tab */}
        {activeTab === 'topics' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Topic Subscriptions</h2>
                  <button
                    onClick={() => setShowAddTopic(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Topic
                  </button>
                </div>
              </div>

              {/* Add Topic Form */}
              {showAddTopic && (
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Topic Name</label>
                      <input
                        type="text"
                        value={newTopic.name || ''}
                        onChange={(e) => setNewTopic(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., App Update Notifications"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Topic Key</label>
                      <input
                        type="text"
                        value={newTopic.key || ''}
                        onChange={(e) => setNewTopic(prev => ({ ...prev, key: e.target.value }))}
                        placeholder="e.g., app_updates"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={newTopic.category || ''}
                        onChange={(e) => setNewTopic(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="marketing">Marketing</option>
                        <option value="product">Product</option>
                        <option value="service">Service</option>
                        <option value="billing">Billing</option>
                        <option value="security">Security</option>
                        <option value="support">Support</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select
                        value={newTopic.priority || ''}
                        onChange={(e) => setNewTopic(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <input
                        type="text"
                        value={newTopic.description || ''}
                        onChange={(e) => setNewTopic(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="e.g., Notifications about new app features and updates"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newTopic.enabled || false}
                          onChange={(e) => setNewTopic(prev => ({ ...prev, enabled: e.target.checked }))}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Enabled</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newTopic.isDefault || false}
                          onChange={(e) => setNewTopic(prev => ({ ...prev, isDefault: e.target.checked }))}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Default</span>
                      </label>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={handleAddTopic}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save Topic
                    </button>
                    <button
                      onClick={() => setShowAddTopic(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Topics List */}
              <div className="divide-y divide-gray-200">
                {topics.map((topic) => (
                  <div key={topic.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Bell className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{topic.name}</h3>
                        <p className="text-sm text-gray-500">{topic.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-xs text-gray-400">Key: {topic.key}</p>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-400 capitalize">Category: {topic.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getPriorityBadge(topic.priority)}
                      {getStatusBadge(topic.enabled, topic.isDefault)}
                      <button
                        onClick={() => toggleTopicStatus(topic.id)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          topic.enabled
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {topic.enabled ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleDeleteTopic(topic.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Preview Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customer View Preview
            </h2>
            <p className="text-sm text-gray-600">How customers will see these preferences in their dashboard</p>
          </div>
          <div className="px-6 py-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-4">Communication Channels</h3>
              <div className="space-y-3">
                {channels.filter(c => c.enabled).map(channel => (
                  <div key={channel.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{channel.name}</p>
                        <p className="text-xs text-gray-500">{channel.description}</p>
                      </div>
                    </div>
                    {channel.isDefault && (
                      <span className="text-xs text-blue-600 font-medium">(Default)</span>
                    )}
                  </div>
                ))}
              </div>
              
              <h3 className="font-medium text-gray-900 mb-4 mt-6">Topic Subscriptions</h3>
              <div className="space-y-3">
                {topics.filter(t => t.enabled).map(topic => (
                  <div key={topic.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{topic.name}</p>
                        <p className="text-xs text-gray-500">{topic.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getPriorityBadge(topic.priority)}
                      {topic.isDefault && (
                        <span className="text-xs text-blue-600 font-medium">(Default)</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferenceManagement;
