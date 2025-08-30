import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Settings, Users, MessageSquare, Bell, Mail, Smartphone, CheckCircle, AlertCircle, Download, Loader } from 'lucide-react';

interface CommunicationChannel {
  _id: string;
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
  _id: string;
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
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // New channel form
  const [newChannel, setNewChannel] = useState({
    name: '',
    key: '',
    description: '',
    icon: 'MessageSquare',
    enabled: true,
    isDefault: false
  });
  
  // New topic form
  const [newTopic, setNewTopic] = useState({
    name: '',
    key: '',
    description: '',
    category: 'marketing',
    enabled: true,
    isDefault: false,
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [loadingStandard, setLoadingStandard] = useState(false);

  useEffect(() => {
    loadPreferenceData();
  }, []);

  const loadPreferenceData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load existing channels and topics from backend
      const [channelsResponse, topicsResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || 'https://consenthub-backend.onrender.com'}/api/v1/admin/preference-channels`),
        fetch(`${import.meta.env.VITE_API_URL || 'https://consenthub-backend.onrender.com'}/api/v1/admin/preference-topics`)
      ]);

      if (channelsResponse.ok) {
        const channelsData = await channelsResponse.json();
        setChannels(channelsData.channels || []);
      }

      if (topicsResponse.ok) {
        const topicsData = await topicsResponse.json();
        setTopics(topicsData.topics || []);
      }
    } catch (err) {
      console.error('Error loading preference data:', err);
      setError('Failed to load preference configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleAddChannel = async () => {
    if (!newChannel.name || !newChannel.key) {
      setError('Channel name and key are required');
      return;
    }

    try {
      setError(null);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://consenthub-backend.onrender.com'}/api/v1/admin/preference-channels`, {
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
          setChannels(prev => [...prev, responseData.channel]);
          setSuccess(`Channel "${newChannel.name}" added successfully!`);
          setTimeout(() => setSuccess(null), 3000);
          
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
        } else {
          setError(responseData.message || 'Failed to create channel');
        }
      } else {
        setError('Failed to create channel');
      }
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
      setError(null);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://consenthub-backend.onrender.com'}/api/v1/admin/preference-topics`, {
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
          setTopics(prev => [...prev, responseData.topic]);
          setSuccess(`Topic "${newTopic.name}" added successfully!`);
          setTimeout(() => setSuccess(null), 3000);
          
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
        } else {
          setError(responseData.message || 'Failed to create topic');
        }
      } else {
        setError('Failed to create topic');
      }
    } catch (err) {
      console.error('Error adding topic:', err);
      setError('Failed to add topic subscription');
    }
  };

  const handleDeleteChannel = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the channel "${name}"?`)) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://consenthub-backend.onrender.com'}/api/v1/admin/preference-channels/${id}`, { 
          method: 'DELETE' 
        });

        if (response.ok) {
          setChannels(prev => prev.filter(channel => channel._id !== id));
          setSuccess(`Channel "${name}" deleted successfully!`);
          setTimeout(() => setSuccess(null), 3000);
        } else {
          setError('Failed to delete channel');
        }
      } catch (err) {
        setError('Failed to delete channel');
      }
    }
  };

  const handleDeleteTopic = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the topic "${name}"?`)) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://consenthub-backend.onrender.com'}/api/v1/admin/preference-topics/${id}`, { 
          method: 'DELETE' 
        });

        if (response.ok) {
          setTopics(prev => prev.filter(topic => topic._id !== id));
          setSuccess(`Topic "${name}" deleted successfully!`);
          setTimeout(() => setSuccess(null), 3000);
        } else {
          setError('Failed to delete topic');
        }
      } catch (err) {
        setError('Failed to delete topic');
      }
    }
  };

  const toggleChannelStatus = async (id: string) => {
    const channel = channels.find(c => c._id === id);
    if (!channel) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://consenthub-backend.onrender.com'}/api/v1/admin/preference-channels/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !channel.enabled })
      });

      if (response.ok) {
        setChannels(prev => prev.map(c => 
          c._id === id ? { ...c, enabled: !c.enabled } : c
        ));
      } else {
        setError('Failed to update channel status');
      }
    } catch (err) {
      setError('Failed to update channel status');
    }
  };

  const toggleTopicStatus = async (id: string) => {
    const topic = topics.find(t => t._id === id);
    if (!topic) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://consenthub-backend.onrender.com'}/api/v1/admin/preference-topics/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !topic.enabled })
      });

      if (response.ok) {
        setTopics(prev => prev.map(t => 
          t._id === id ? { ...t, enabled: !t.enabled } : t
        ));
      } else {
        setError('Failed to update topic status');
      }
    } catch (err) {
      setError('Failed to update topic status');
    }
  };

  const loadStandardPreferences = async () => {
    setLoadingStandard(true);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://consenthub-backend.onrender.com'}/api/v1/admin/preference-channels/initialize-standard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSuccess(`✅ Standard preferences loaded! Added ${data.results.totalAdded} items (${data.results.channelsAdded.length} channels, ${data.results.topicsAdded.length} topics). Skipped ${data.results.totalSkipped} existing items.`);
          setTimeout(() => setSuccess(null), 5000);
          
          // Reload all data
          loadPreferenceData();
        } else {
          setError(data.message || 'Failed to load standard preferences');
        }
      } else {
        setError('Failed to initialize standard preferences');
      }
    } catch (err) {
      console.error('Error loading standard preferences:', err);
      setError('Failed to load standard preferences');
    } finally {
      setLoadingStandard(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Mail': return <Mail className="h-5 w-5" />;
      case 'MessageSquare': return <MessageSquare className="h-5 w-5" />;
      case 'Bell': return <Bell className="h-5 w-5" />;
      case 'Smartphone': return <Smartphone className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading preferences...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Settings className="h-6 w-6 text-blue-600" />
                  Preference Management
                </h1>
                <p className="text-gray-600 mt-1">Configure communication channels and topic subscriptions for customer preferences</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={loadStandardPreferences}
                  disabled={loadingStandard}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingStandard ? (
                    <>
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Load Standard Preferences
                    </>
                  )}
                </button>
                <div className="text-sm text-gray-500">
                  {channels.length} Channels • {topics.length} Topics
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="px-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('channels')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'channels'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
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
                Topic Subscriptions ({topics.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Info Panel for Empty State */}
        {(channels.length === 0 || topics.length === 0) && !loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div className="flex">
              <Settings className="h-5 w-5 text-blue-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Get Started with Standard Preferences</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Click "Load Standard Preferences" to populate your system with these default options:
                </p>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-blue-600">
                  <div>
                    <strong>Communication Channels:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Email Notifications</li>
                      <li>SMS Notifications</li>
                      <li>Push Notifications</li>
                      <li>In-App Notifications</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Topic Subscriptions:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Special Offers & Promotions</li>
                      <li>Product Updates</li>
                      <li>Service Alerts</li>
                      <li>Billing & Payments</li>
                      <li>Security Alerts</li>
                      <li>Newsletters</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Communication Channels Tab */}
        {activeTab === 'channels' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Communication Channels</h2>
                <button
                  onClick={() => setShowAddChannel(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Channel
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {channels.map((channel) => (
                    <tr key={channel._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getIconComponent(channel.icon)}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{channel.name}</div>
                            <div className="text-sm text-gray-500">Key: {channel.key}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{channel.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleChannelStatus(channel._id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              channel.enabled ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                channel.enabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          {channel.isDefault && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Default</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleDeleteChannel(channel._id, channel.name)}
                          className="text-red-600 hover:text-red-900 p-2"
                          title="Delete channel"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {channels.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No channels configured</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by adding a communication channel.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Topic Subscriptions Tab */}
        {activeTab === 'topics' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Topic Subscriptions</h2>
                <button
                  onClick={() => setShowAddTopic(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Topic
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topics.map((topic) => (
                    <tr key={topic._id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{topic.name}</div>
                        <div className="text-sm text-gray-500">{topic.description}</div>
                        <div className="text-xs text-gray-400">Key: {topic.key}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full capitalize">
                          {topic.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full capitalize ${getPriorityColor(topic.priority)}`}>
                          {topic.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleTopicStatus(topic._id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              topic.enabled ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                topic.enabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          {topic.isDefault && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Default</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleDeleteTopic(topic._id, topic.name)}
                          className="text-red-600 hover:text-red-900 p-2"
                          title="Delete topic"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {topics.length === 0 && (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No topics configured</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by adding a topic subscription.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Channel Modal */}
        {showAddChannel && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Add Communication Channel</h3>
                  <button
                    onClick={() => setShowAddChannel(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Channel Name</label>
                    <input
                      type="text"
                      value={newChannel.name}
                      onChange={(e) => setNewChannel({...newChannel, name: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., WhatsApp Notifications"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Channel Key</label>
                    <input
                      type="text"
                      value={newChannel.key}
                      onChange={(e) => setNewChannel({...newChannel, key: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., whatsapp"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={newChannel.description}
                      onChange={(e) => setNewChannel({...newChannel, description: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Brief description of the channel"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Icon</label>
                    <select
                      value={newChannel.icon}
                      onChange={(e) => setNewChannel({...newChannel, icon: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="MessageSquare">Message Square</option>
                      <option value="Mail">Mail</option>
                      <option value="Bell">Bell</option>
                      <option value="Smartphone">Smartphone</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="channelEnabled"
                      checked={newChannel.enabled}
                      onChange={(e) => setNewChannel({...newChannel, enabled: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="channelEnabled" className="ml-2 block text-sm text-gray-900">
                      Enable this channel
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="channelDefault"
                      checked={newChannel.isDefault}
                      onChange={(e) => setNewChannel({...newChannel, isDefault: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="channelDefault" className="ml-2 block text-sm text-gray-900">
                      Set as default for new customers
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowAddChannel(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddChannel}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Add Channel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Topic Modal */}
        {showAddTopic && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Add Topic Subscription</h3>
                  <button
                    onClick={() => setShowAddTopic(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Topic Name</label>
                    <input
                      type="text"
                      value={newTopic.name}
                      onChange={(e) => setNewTopic({...newTopic, name: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Product Updates"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Topic Key</label>
                    <input
                      type="text"
                      value={newTopic.key}
                      onChange={(e) => setNewTopic({...newTopic, key: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., product_updates"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={newTopic.description}
                      onChange={(e) => setNewTopic({...newTopic, description: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Brief description of the topic"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      value={newTopic.category}
                      onChange={(e) => setNewTopic({...newTopic, category: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="marketing">Marketing</option>
                      <option value="product">Product</option>
                      <option value="security">Security</option>
                      <option value="billing">Billing</option>
                      <option value="service">Service</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <select
                      value={newTopic.priority}
                      onChange={(e) => setNewTopic({...newTopic, priority: e.target.value as 'low' | 'medium' | 'high'})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="topicEnabled"
                      checked={newTopic.enabled}
                      onChange={(e) => setNewTopic({...newTopic, enabled: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="topicEnabled" className="ml-2 block text-sm text-gray-900">
                      Enable this topic
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="topicDefault"
                      checked={newTopic.isDefault}
                      onChange={(e) => setNewTopic({...newTopic, isDefault: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="topicDefault" className="ml-2 block text-sm text-gray-900">
                      Set as default for new customers
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowAddTopic(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddTopic}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Add Topic
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customer Preview Section */}
        <div className="bg-white shadow rounded-lg mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Customer View Preview</h2>
            <p className="text-sm text-gray-600">This is how customers will see the preference options</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Available Channels</h3>
                <div className="space-y-2">
                  {channels.filter(c => c.enabled).map(channel => (
                    <div key={channel._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        {getIconComponent(channel.icon)}
                        <div className="ml-3">
                          <div className="text-sm font-medium">{channel.name}</div>
                          <div className="text-xs text-gray-500">{channel.description}</div>
                        </div>
                      </div>
                      <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        channel.isDefault ? 'bg-blue-600' : 'bg-gray-200'
                      }`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          channel.isDefault ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </div>
                    </div>
                  ))}
                  {channels.filter(c => c.enabled).length === 0 && (
                    <div className="text-sm text-gray-500 italic">No channels available for customers</div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Available Topics</h3>
                <div className="space-y-2">
                  {topics.filter(t => t.enabled).map(topic => (
                    <div key={topic._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium">{topic.name}</div>
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(topic.priority)}`}>
                            {topic.priority}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">{topic.description}</div>
                      </div>
                      <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        topic.isDefault ? 'bg-blue-600' : 'bg-gray-200'
                      }`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          topic.isDefault ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </div>
                    </div>
                  ))}
                  {topics.filter(t => t.enabled).length === 0 && (
                    <div className="text-sm text-gray-500 italic">No topics available for customers</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferenceManagement;
