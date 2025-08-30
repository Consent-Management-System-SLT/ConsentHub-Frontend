import React, { useState, useEffect } from 'react';
import {
  Settings,
  Mail,
  MessageSquare,
  Bell,
  Phone,
  Edit2,
  Save,
  X,
  Search,
  Smartphone,
} from 'lucide-react';
import { PrivacyPreference, Party } from '../types/consent';
import { usePreferences, useParties, usePreferenceMutation } from '../hooks/useApi';
import { io, Socket } from 'socket.io-client';

interface CommunicationPreferencesProps {
  selectedCustomer?: Party;
}

// Types for dynamic preference configuration
interface PreferenceChannel {
  _id: string;
  name: string;
  key: string;
  description: string;
  icon: string;
  enabled: boolean;
  isDefault: boolean;
}

interface PreferenceTopic {
  _id: string;
  name: string;
  key: string;
  description: string;
  category: string;
  enabled: boolean;
  isDefault: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface PreferenceConfig {
  communicationChannels: PreferenceChannel[];
  topicSubscriptions: PreferenceTopic[];
}

export const CommunicationPreferences: React.FC<CommunicationPreferencesProps> = ({ selectedCustomer }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PrivacyPreference>>({});
  const [preferenceConfig, setPreferenceConfig] = useState<PreferenceConfig | null>(null);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomer, setFilteredCustomer] = useState<Party | null>(selectedCustomer || null);

  // Load data from backend
  const { data: preferencesData, loading: preferencesLoading, refetch: refetchPreferences } = usePreferences(filteredCustomer?.id);
  const { data: partiesData, loading: partiesLoading } = useParties();
  const { updatePreference, updateCommunicationPreferences, loading: mutationLoading } = usePreferenceMutation();

  // Load dynamic preference configuration
  const loadPreferenceConfig = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://consenthub-backend.onrender.com'}/api/v1/customer/preference-config`);
      const data = await response.json();
      if (data.success) {
        setPreferenceConfig(data.config);
        console.log('📋 Preference configuration loaded:', data.config);
        console.log('📺 Communication Channels:', data.config.communicationChannels?.length || 0);
        console.log('📰 Topic Subscriptions:', data.config.topicSubscriptions?.length || 0);
      }
    } catch (error) {
      console.error('Failed to load preference configuration:', error);
      // Fallback to hardcoded defaults
      setPreferenceConfig({
        communicationChannels: [
          { _id: 'default_email', name: 'Email Notifications', key: 'email', description: 'Receive notifications via email', icon: 'Mail', enabled: true, isDefault: true },
          { _id: 'default_sms', name: 'SMS Notifications', key: 'sms', description: 'Receive notifications via SMS', icon: 'MessageSquare', enabled: true, isDefault: false }
        ],
        topicSubscriptions: [
          { _id: 'default_marketing', name: 'Marketing Communications', key: 'marketing', description: 'Promotional offers and marketing updates', category: 'marketing', enabled: true, isDefault: false, priority: 'medium' },
          { _id: 'default_security', name: 'Security Alerts', key: 'security', description: 'Account security and privacy updates', category: 'security', enabled: true, isDefault: true, priority: 'high' }
        ]
      });
    }
  };

  useEffect(() => {
    loadPreferenceConfig();

    // Connect to WebSocket for real-time preference config updates
    const socket = io((import.meta.env.VITE_API_URL || 'https://consenthub-backend.onrender.com'));
    
    socket.on('preference-config-updated', (data) => {
      console.log('🔄 Preference configuration updated by admin, reloading...', data);
      loadPreferenceConfig();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Transform data to ensure it's an array
  const preferences = Array.isArray(preferencesData) ? preferencesData : 
    (preferencesData && (preferencesData as any).preferences ? (preferencesData as any).preferences : []);
  const parties = Array.isArray(partiesData) ? partiesData : 
    (partiesData && (partiesData as any).parties ? (partiesData as any).parties : []);

  // Search handler
  const handleCustomerSearch = () => {
    const match = parties.find((p: any) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCustomer(match || null);
  };

  const filteredPreferences = filteredCustomer
    ? preferences.filter((pref: any) => pref.partyId === filteredCustomer.id)
    : preferences;

  // Loading state
  if (preferencesLoading || partiesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading preferences...</span>
      </div>
    );
  }

  const getCustomerName = (partyId: string) => {
    const party = parties.find((p: any) => p.id === partyId);
    return party ? party.name : 'Unknown Customer';
  };

  const handleEdit = (preference: PrivacyPreference) => {
    setEditingId(preference.id);
    setEditForm(preference);
  };

  const handleSave = async () => {
    if (editingId && editForm && filteredCustomer) {
      try {
        // Check if this is a bulk preference update (has preferredChannels or topicSubscriptions)
        if (editForm.preferredChannels || editForm.topicSubscriptions || editForm.doNotDisturb) {
          // Use the new bulk update method for communication preferences
          await updateCommunicationPreferences(filteredCustomer.id, {
            preferredChannels: editForm.preferredChannels,
            topicSubscriptions: editForm.topicSubscriptions,
            doNotDisturb: editForm.doNotDisturb,
            frequency: (editForm as any).frequency,
            timezone: (editForm as any).timezone,
            language: (editForm as any).language
          });
        } else {
          // Fallback to individual preference update
          await updatePreference(editingId, editForm);
        }
        await refetchPreferences(); // Refresh the data
        setEditingId(null);
        setEditForm({});
      } catch (error) {
        console.error('Failed to update preference:', error);
        // You could add toast notification here
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const getChannelIcon = (iconName: string) => {
    const iconProps = { className: "h-4 w-4" };
    switch (iconName) {
      case 'Mail':
        return <Mail {...iconProps} />;
      case 'MessageSquare':
        return <MessageSquare {...iconProps} />;
      case 'Bell':
        return <Bell {...iconProps} />;
      case 'Phone':
        return <Phone {...iconProps} />;
      case 'Smartphone':
        return <Smartphone {...iconProps} />;
      default:
        return <Bell {...iconProps} />; // Default fallback
    }
  };

  const ChannelToggle = ({ 
    channel, 
    enabled, 
    onChange 
  }: { 
    channel: PreferenceChannel; 
    enabled: boolean; 
    onChange: (enabled: boolean) => void 
  }) => {
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          {getChannelIcon(channel.icon)}
          <div>
            <span className="text-sm font-medium text-gray-700">{channel.name}</span>
            <p className="text-xs text-gray-500">{channel.description}</p>
          </div>
        </div>
        <button
          onClick={() => onChange(!enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-blue-600' : 'bg-gray-200'}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </button>
      </div>
    );
  };

  const TopicToggle = ({ 
    topic, 
    enabled, 
    onChange 
  }: { 
    topic: PreferenceTopic; 
    enabled: boolean; 
    onChange: (enabled: boolean) => void 
  }) => {
    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case 'high': return 'text-red-600 bg-red-50';
        case 'medium': return 'text-yellow-600 bg-yellow-50';
        case 'low': return 'text-green-600 bg-green-50';
        default: return 'text-gray-600 bg-gray-50';
      }
    };

    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">{topic.name}</span>
            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(topic.priority)}`}>
              {topic.priority}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{topic.description}</p>
          <span className="text-xs text-gray-400 capitalize">Category: {topic.category}</span>
        </div>
        <button
          onClick={() => onChange(!enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-blue-600' : 'bg-gray-200'}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Settings className="h-5 w-5 mr-2 text-blue-600" />
            Communication Preferences
          </h2>
          <div className="flex space-x-2">
            <span className="text-sm text-gray-500">
              {filteredCustomer ? `Customer: ${filteredCustomer.name}` : 'All Customers'}
            </span>
          </div>
        </div>

        {/* 🔍 Search Bar */}
        <div className="mb-6 flex space-x-2 items-center">
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCustomerSearch}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </button>
        </div>

        {/* Preferences List */}
        <div className="space-y-6">
          {filteredPreferences.map((preference) => (
            <div key={preference.id} className="border border-gray-200 rounded-lg p-6">
              {/* Preference Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {getCustomerName(preference.partyId)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Last updated: {new Date(preference.lastUpdated).toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {editingId === preference.id ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEdit(preference)}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                  )}
                </div>
              </div>

              {/* Channel Toggles - Dynamic from Admin Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Preferred Channels</h4>
                  <div className="space-y-3">
                    {preferenceConfig?.communicationChannels?.map((channel) => {
                      const currentValue = (preference as any).preferredChannels?.[channel.key] ?? channel.isDefault;
                      return (
                        <ChannelToggle
                          key={channel.key}
                          channel={channel}
                          enabled={editingId === preference.id
                            ? editForm.preferredChannels?.[channel.key as keyof typeof editForm.preferredChannels] ?? currentValue
                            : currentValue
                          }
                          onChange={(newEnabled) => {
                            if (editingId === preference.id) {
                              setEditForm(prev => ({
                                ...prev,
                                preferredChannels: {
                                  ...prev.preferredChannels,
                                  [channel.key]: newEnabled
                                }
                              }));
                            }
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Topic Toggles - Dynamic from Admin Configuration */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Topic Subscriptions</h4>
                  <div className="space-y-3">
                    {preferenceConfig?.topicSubscriptions?.map((topic) => {
                      const currentValue = (preference as any).topicSubscriptions?.[topic.key] ?? topic.isDefault;
                      return (
                        <TopicToggle
                          key={topic.key}
                          topic={topic}
                          enabled={editingId === preference.id
                            ? editForm.topicSubscriptions?.[topic.key as keyof typeof editForm.topicSubscriptions] ?? currentValue
                            : currentValue
                          }
                          onChange={(newEnabled) => {
                            if (editingId === preference.id) {
                              setEditForm(prev => ({
                                ...prev,
                                topicSubscriptions: {
                                  ...prev.topicSubscriptions,
                                  [topic.key]: newEnabled
                                }
                              }));
                            }
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Do Not Disturb & Frequency */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* DND */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Do Not Disturb</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">From:</span>
                    <input
                      type="time"
                      value={editingId === preference.id
                        ? editForm.doNotDisturb?.start ?? preference.doNotDisturb.start
                        : preference.doNotDisturb.start
                      }
                      onChange={(e) => {
                        if (editingId === preference.id) {
                          setEditForm(prev => ({
                            ...prev,
                            doNotDisturb: {
                              ...prev.doNotDisturb,
                              start: e.target.value
                            }
                          }));
                        }
                      }}
                      disabled={editingId !== preference.id}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    />
                    <span className="text-sm text-gray-600">To:</span>
                    <input
                      type="time"
                      value={editingId === preference.id
                        ? editForm.doNotDisturb?.end ?? preference.doNotDisturb.end
                        : preference.doNotDisturb.end
                      }
                      onChange={(e) => {
                        if (editingId === preference.id) {
                          setEditForm(prev => ({
                            ...prev,
                            doNotDisturb: {
                              ...prev.doNotDisturb,
                              end: e.target.value
                            }
                          }));
                        }
                      }}
                      disabled={editingId !== preference.id}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>

                {/* Frequency Limits */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Frequency Limits (per day)</h4>
                  <div className="space-y-2">
                    {(['email', 'sms'] as const).map((channel) => (
                      <div key={channel} className="flex items-center space-x-2">
                        {getChannelIcon(channel)}
                        <span className="text-sm text-gray-600 capitalize">{channel}:</span>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={editingId === preference.id
                            ? editForm.frequencyLimits?.[channel] ?? preference.frequencyLimits[channel]
                            : preference.frequencyLimits[channel]
                          }
                          onChange={(e) => {
                            if (editingId === preference.id) {
                              setEditForm(prev => ({
                                ...prev,
                                frequencyLimits: {
                                  ...prev.frequencyLimits,
                                  [channel]: parseInt(e.target.value) || 0
                                }
                              }));
                            }
                          }}
                          disabled={editingId !== preference.id}
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredPreferences.length === 0 && (
            <p className="text-sm text-gray-500">No preferences found for this customer.</p>
          )}
        </div>
      </div>
    </div>
  );
};
