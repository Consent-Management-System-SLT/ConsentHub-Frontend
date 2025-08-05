import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  X, 
  User, 
  Mail, 
  MessageCircle, 
  Phone, 
  Bell, 
  RefreshCw, 
  Search,
  Clock,
  Volume2,
  VolumeX,
  CheckCircle,
  AlertCircle,
  Globe,
  Smartphone
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';

interface PreferenceEditorFormProps {
  className?: string;
  customerId?: string;
}

const PreferenceEditorForm: React.FC<PreferenceEditorFormProps> = ({ className = '', customerId }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<string>(customerId || '');
  const [customers, setCustomers] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<any>({
    // Communication Channels
    channels: {
      email: true,
      sms: true,
      push: false,
      inApp: true,
      phone: false
    },
    // Topic Subscriptions  
    topics: {
      offers: true,
      productUpdates: true,
      serviceAlerts: true,
      billing: true,
      security: true,
      newsletters: false,
      marketing: false,
      promotions: false
    },
    // Do Not Disturb Settings
    dndSettings: {
      enabled: true,
      startTime: '22:00',
      endTime: '08:00'
    },
    // Frequency Control
    frequency: {
      maxEmailsPerDay: 3,
      maxSmsPerDay: 2,
      digestMode: false,
      immediateAlerts: ['security', 'billing']
    },
    // Language & Timezone
    language: 'en',
    timezone: 'Asia/Colombo'
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Load customers
  useEffect(() => {
    loadCustomers();
  }, []);

  // Load preferences when customer is selected
  useEffect(() => {
    if (selectedCustomer) {
      loadPreferences();
    }
  }, [selectedCustomer]);

  const loadCustomers = async () => {
    try {
      const response = await apiClient.get('/api/v1/party');
      const data = response.data as any;
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadPreferences = async () => {
    if (!selectedCustomer) return;
    
    setLoading(true);
    try {
      const response = await apiClient.get(`/api/v1/preferences?partyId=${selectedCustomer}`);
      const data = Array.isArray(response.data) ? response.data : [];
      const customerPrefs = data.find((pref: any) => pref.partyId === selectedCustomer);
      
      if (customerPrefs) {
        // Merge loaded preferences with default structure
        setPreferences((prev: any) => ({
          ...prev,
          ...customerPrefs,
          channels: {
            ...prev.channels,
            ...(customerPrefs.channels || {}),
            // Map legacy fields
            email: customerPrefs.preferredChannels?.email ?? prev.channels.email,
            sms: customerPrefs.preferredChannels?.sms ?? prev.channels.sms,
            phone: customerPrefs.preferredChannels?.phone ?? prev.channels.phone,
            push: customerPrefs.preferredChannels?.push ?? prev.channels.push
          },
          topics: {
            ...prev.topics,
            ...(customerPrefs.topics || {}),
            // Map legacy fields
            marketing: customerPrefs.topicSubscriptions?.marketing ?? prev.topics.marketing,
            promotions: customerPrefs.topicSubscriptions?.promotions ?? prev.topics.promotions,
            serviceAlerts: customerPrefs.topicSubscriptions?.serviceUpdates ?? prev.topics.serviceAlerts,
            billing: customerPrefs.topicSubscriptions?.billing ?? prev.topics.billing,
            security: customerPrefs.topicSubscriptions?.security ?? prev.topics.security
          }
        }));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for updating preferences
  const updateChannelPreference = (channel: string, value: boolean) => {
    setPreferences((prev: any) => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: value
      }
    }));
    setHasChanges(true);
  };

  const updateTopicPreference = (topic: string, value: boolean) => {
    setPreferences((prev: any) => ({
      ...prev,
      topics: {
        ...prev.topics,
        [topic]: value
      }
    }));
    setHasChanges(true);
  };

  const updateDndSettings = (setting: string, value: boolean | string) => {
    setPreferences((prev: any) => ({
      ...prev,
      dndSettings: {
        ...prev.dndSettings,
        [setting]: value
      }
    }));
    setHasChanges(true);
  };

  const updateFrequencySettings = (setting: string, value: number | boolean) => {
    setPreferences((prev: any) => ({
      ...prev,
      frequency: {
        ...prev.frequency,
        [setting]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!preferences || !selectedCustomer) return;
    
    setSaving(true);
    setSaveStatus('idle');
    try {
      const updatedPreferences = {
        ...preferences,
        partyId: selectedCustomer,
        lastUpdated: new Date().toISOString(),
        // Maintain backward compatibility
        preferredChannels: preferences.channels,
        topicSubscriptions: preferences.topics
      };
      
      // Try to update existing preferences or create new ones
      let response;
      try {
        response = await apiClient.put(`/api/v1/preferences/${selectedCustomer}`, updatedPreferences);
      } catch (error) {
        // If PUT fails, try POST to create new preferences
        response = await apiClient.post('/api/v1/preferences', updatedPreferences);
      }
      
      setIsEditing(false);
      setHasChanges(false);
      setSaveStatus('success');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setSaving(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100">
        <div className="flex items-center space-x-3">
          <Settings className="w-6 h-6 text-purple-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Advanced Communication Preferences</h2>
            <p className="text-sm text-gray-600">Comprehensive communication preference management</p>
          </div>
        </div>
      </div>

      {/* Customer Selection */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Customer</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search customers..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            {searchTerm && (
              <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredCustomers.map(customer => (
                  <div
                    key={customer.id}
                    onClick={() => {
                      setSelectedCustomer(customer.id);
                      setSearchTerm('');
                    }}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <User className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredCustomers.length === 0 && (
                  <div className="p-3 text-center text-gray-500">No customers found</div>
                )}
              </div>
            )}
          </div>
          {selectedCustomer && (
            <div className="flex items-end">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {isEditing ? 'Cancel' : 'Edit Preferences'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Save Status */}
      {saveStatus !== 'idle' && (
        <div className={`p-4 mx-6 rounded-lg ${
          saveStatus === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center space-x-2">
            {saveStatus === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span className={saveStatus === 'success' ? 'text-green-800' : 'text-red-800'}>
              {saveStatus === 'success' ? 'Preferences saved successfully!' : 'Failed to save preferences. Please try again.'}
            </span>
          </div>
        </div>
      )}

      {/* Preferences Content */}
      {selectedCustomer && !loading ? (
        <div className="p-6 space-y-8">
          {/* Communication Channels */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2 text-purple-600" />
              Communication Channels
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { key: 'email', label: 'Email', icon: Mail, desc: 'Receive notifications via email' },
                { key: 'sms', label: 'SMS', icon: MessageCircle, desc: 'Receive text messages' },
                { key: 'push', label: 'Push Notifications', icon: Smartphone, desc: 'Mobile app notifications' },
                { key: 'inApp', label: 'In-App', icon: Bell, desc: 'Notifications within the app' },
                { key: 'phone', label: 'Phone Calls', icon: Phone, desc: 'Receive phone calls for urgent matters' }
              ].map(channel => {
                const Icon = channel.icon;
                return (
                  <div key={channel.key} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4 text-purple-600" />
                        <span className="font-medium">{channel.label}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={preferences.channels[channel.key]}
                          onChange={(e) => isEditing && updateChannelPreference(channel.key, e.target.checked)}
                          disabled={!isEditing}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                    <p className="text-sm text-gray-500">{channel.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Topic Subscriptions */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-purple-600" />
              Topic Preferences
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'offers', label: 'Special Offers', desc: 'Promotional offers and discounts' },
                { key: 'productUpdates', label: 'Product Updates', desc: 'New features and improvements' },
                { key: 'serviceAlerts', label: 'Service Alerts', desc: 'Service disruptions and maintenance' },
                { key: 'billing', label: 'Billing & Payments', desc: 'Bills, payments, and account changes' },
                { key: 'security', label: 'Security Alerts', desc: 'Account security and suspicious activity' },
                { key: 'newsletters', label: 'Newsletters', desc: 'Company news and updates' }
              ].map(topic => (
                <div key={topic.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{topic.label}</div>
                    <div className="text-sm text-gray-500">{topic.desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={preferences.topics[topic.key]}
                      onChange={(e) => isEditing && updateTopicPreference(topic.key, e.target.checked)}
                      disabled={!isEditing}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Do Not Disturb Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              {preferences.dndSettings.enabled ? (
                <VolumeX className="w-5 h-5 mr-2 text-purple-600" />
              ) : (
                <Volume2 className="w-5 h-5 mr-2 text-purple-600" />
              )}
              Do Not Disturb
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Enable Do Not Disturb</div>
                  <div className="text-sm text-gray-500">Pause non-urgent notifications during specified hours</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferences.dndSettings.enabled}
                    onChange={(e) => isEditing && updateDndSettings('enabled', e.target.checked)}
                    disabled={!isEditing}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {preferences.dndSettings.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="inline w-4 h-4 mr-1" />
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={preferences.dndSettings.startTime}
                      onChange={(e) => isEditing && updateDndSettings('startTime', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="inline w-4 h-4 mr-1" />
                      End Time
                    </label>
                    <input
                      type="time"
                      value={preferences.dndSettings.endTime}
                      onChange={(e) => isEditing && updateDndSettings('endTime', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Frequency Control */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <RefreshCw className="w-5 h-5 mr-2 text-purple-600" />
              Frequency Control
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Emails Per Day</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={preferences.frequency.maxEmailsPerDay}
                    onChange={(e) => isEditing && updateFrequencySettings('maxEmailsPerDay', parseInt(e.target.value))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max SMS Per Day</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={preferences.frequency.maxSmsPerDay}
                    onChange={(e) => isEditing && updateFrequencySettings('maxSmsPerDay', parseInt(e.target.value))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Digest Mode</div>
                  <div className="text-sm text-gray-500">Bundle multiple notifications into daily summaries</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferences.frequency.digestMode}
                    onChange={(e) => isEditing && updateFrequencySettings('digestMode', e.target.checked)}
                    disabled={!isEditing}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Language & Timezone */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-purple-600" />
              Language & Region
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select
                  value={preferences.language}
                  onChange={(e) => isEditing && setPreferences((prev: any) => ({ ...prev, language: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
                >
                  <option value="en">English</option>
                  <option value="si">Sinhala</option>
                  <option value="ta">Tamil</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                <select
                  value={preferences.timezone}
                  onChange={(e) => isEditing && setPreferences((prev: any) => ({ ...prev, timezone: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
                >
                  <option value="Asia/Colombo">Asia/Colombo (UTC+05:30)</option>
                  <option value="UTC">UTC (UTC+00:00)</option>
                  <option value="Asia/Dubai">Asia/Dubai (UTC+04:00)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setHasChanges(false);
                  loadPreferences(); // Reload to reset changes
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
              </button>
            </div>
          )}
        </div>
      ) : selectedCustomer && loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading preferences...</p>
        </div>
      ) : (
        <div className="p-8 text-center">
          <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Customer Selected</h3>
          <p className="text-gray-500">Select a customer to view and edit their communication preferences</p>
        </div>
      )}
    </div>
  );
};

export default PreferenceEditorForm;
z