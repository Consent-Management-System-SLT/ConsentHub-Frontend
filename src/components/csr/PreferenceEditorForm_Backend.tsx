import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
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
import { csrDashboardService } from '../../services/csrDashboardService';

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
      const customers = await csrDashboardService.getCustomers();
      setCustomers(customers);
      console.log('Loaded customers:', customers.length);
    } catch (error) {
      console.error('Error loading customers:', error);
      setCustomers([]);
    }
  };

  const loadPreferences = async () => {
    if (!selectedCustomer) return;
    
    setLoading(true);
    try {
      const commPrefs = await csrDashboardService.getCommunicationPreferences();
      const customerPrefs = commPrefs.find((pref: any) => pref.partyId === selectedCustomer);
      
      if (customerPrefs) {
        // Merge loaded preferences with default structure
        setPreferences((prev: any) => ({
          ...prev,
          ...customerPrefs,
          channels: {
            ...prev.channels,
            ...(customerPrefs.channels || {}),
            // Map from communication preferences
            email: customerPrefs.preferredChannels?.email ?? prev.channels.email,
            sms: customerPrefs.preferredChannels?.sms ?? prev.channels.sms,
            phone: customerPrefs.preferredChannels?.phone ?? prev.channels.phone,
            push: customerPrefs.preferredChannels?.push ?? prev.channels.push
          },
          topics: {
            ...prev.topics,
            ...(customerPrefs.topics || {}),
            // Map from communication preferences
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
      
      // For demo purposes, just update local state
      console.log('Saving preferences (demo mode):', updatedPreferences);
      
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
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-myslt-text-primary">Communication Preferences</h1>
          <p className="text-myslt-text-secondary mt-2">Manage customer communication preferences and settings</p>
        </div>
      </div>

      {/* Customer Selection */}
      <div className="bg-myslt-card-solid rounded-xl shadow-sm border border-myslt-accent/20">
        <div className="p-6 border-b border-myslt-accent/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-myslt-text-primary">Customer Selection</h2>
              <p className="text-sm text-gray-500">Search and select a customer to manage preferences</p>
            </div>
          </div>
        </div>
        <div className="p-6">
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
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {searchTerm && (
                <div className="mt-2 max-h-60 overflow-y-auto border border-myslt-accent/20 rounded-lg">
                  {filteredCustomers.map(customer => (
                    <div
                      key={customer.id}
                      onClick={() => {
                        setSelectedCustomer(customer.id);
                        setSearchTerm('');
                      }}
                      className="p-3 hover:bg-myslt-service-card cursor-pointer border-b border-myslt-border last:border-b-0"
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isEditing ? 'Cancel' : 'Edit Preferences'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Status */}
      {saveStatus !== 'idle' && (
        <div className="flex items-center justify-between">
          <div></div>
          {saveStatus === 'success' && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Preferences saved successfully!</span>
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg border border-red-200">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Failed to save preferences. Please try again.</span>
            </div>
          )}
        </div>
      )}

      {/* Preferences Content */}
      {selectedCustomer && !loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Communication Channels */}
          <div className="bg-myslt-card-solid rounded-xl shadow-sm border border-myslt-accent/20">
            <div className="p-6 border-b border-myslt-accent/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-myslt-text-primary">Communication Channels</h2>
                  <p className="text-sm text-gray-500">Choose how the customer receives notifications</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              {[
                { key: 'email', label: 'Email Notifications', icon: Mail, desc: 'Receive notifications via email' },
                { key: 'sms', label: 'SMS Notifications', icon: MessageCircle, desc: 'Receive text messages' },
                { key: 'push', label: 'Push Notifications', icon: Smartphone, desc: 'Mobile app notifications' },
                { key: 'inApp', label: 'In-App Notifications', icon: Bell, desc: 'Notifications within the app' },
                { key: 'phone', label: 'Phone Calls', icon: Phone, desc: 'Receive phone calls for urgent matters' }
              ].map((channel, index) => {
                const Icon = channel.icon;
                return (
                  <div key={channel.key} className={`flex items-center justify-between py-4 ${index < 4 ? 'border-b border-gray-100' : ''}`}>
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 text-myslt-text-secondary" />
                      <div>
                        <p className="text-sm font-medium text-myslt-text-primary">{channel.label}</p>
                        <p className="text-xs text-gray-500">{channel.desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => isEditing && updateChannelPreference(channel.key, !preferences.channels[channel.key])}
                      disabled={!isEditing}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        preferences.channels[channel.key] ? 'bg-blue-600' : 'bg-gray-200'
                      } ${!isEditing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-myslt-card-solid transition-transform ${
                          preferences.channels[channel.key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Topic Subscriptions */}
          <div className="bg-myslt-card-solid rounded-xl shadow-sm border border-myslt-accent/20">
            <div className="p-6 border-b border-myslt-accent/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-myslt-text-primary">Topic Preferences</h2>
                  <p className="text-sm text-gray-500">Control what types of content the customer receives</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              {[
                { key: 'offers', label: 'Special Offers', desc: 'Promotional offers and discounts' },
                { key: 'productUpdates', label: 'Product Updates', desc: 'New features and improvements' },
                { key: 'serviceAlerts', label: 'Service Alerts', desc: 'Service disruptions and maintenance' },
                { key: 'billing', label: 'Billing & Payments', desc: 'Bills, payments, and account changes' },
                { key: 'security', label: 'Security Alerts', desc: 'Account security and suspicious activity' },
                { key: 'newsletters', label: 'Newsletters', desc: 'Company news and updates' }
              ].map((topic, index) => (
                <div key={topic.key} className={`flex items-center justify-between py-4 ${index < 5 ? 'border-b border-gray-100' : ''}`}>
                  <div>
                    <p className="text-sm font-medium text-myslt-text-primary">{topic.label}</p>
                    <p className="text-xs text-gray-500">{topic.desc}</p>
                  </div>
                  <button
                    onClick={() => isEditing && updateTopicPreference(topic.key, !preferences.topics[topic.key])}
                    disabled={!isEditing}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      preferences.topics[topic.key] ? 'bg-blue-600' : 'bg-gray-200'
                    } ${!isEditing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-myslt-card-solid transition-transform ${
                        preferences.topics[topic.key] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : selectedCustomer && loading ? (
        <div className="bg-myslt-card-solid rounded-xl shadow-sm border border-myslt-accent/20 p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-myslt-text-secondary">Loading preferences...</p>
          </div>
        </div>
      ) : (
        <div className="bg-myslt-card-solid rounded-xl shadow-sm border border-myslt-accent/20 p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-myslt-service-card rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-myslt-text-primary mb-2">No Customer Selected</h3>
            <p className="text-gray-500">Select a customer to view and edit their communication preferences</p>
          </div>
        </div>
      )}

      {/* Advanced Settings Section */}
      {selectedCustomer && !loading && (
        <div className="space-y-6">
          {/* Do Not Disturb Settings */}
          <div className="bg-myslt-card-solid rounded-xl shadow-sm border border-myslt-accent/20">
            <div className="p-6 border-b border-myslt-accent/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  {preferences.dndSettings.enabled ? (
                    <VolumeX className="w-5 h-5 text-purple-600" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-purple-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-myslt-text-primary">Do Not Disturb</h2>
                  <p className="text-sm text-gray-500">Control quiet hours for non-urgent notifications</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-myslt-text-primary">Enable Do Not Disturb</p>
                    <p className="text-xs text-gray-500">Pause non-urgent notifications during specified hours</p>
                  </div>
                  <button
                    onClick={() => isEditing && updateDndSettings('enabled', !preferences.dndSettings.enabled)}
                    disabled={!isEditing}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      preferences.dndSettings.enabled ? 'bg-blue-600' : 'bg-gray-200'
                    } ${!isEditing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-myslt-card-solid transition-transform ${
                        preferences.dndSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-myslt-service-card"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-myslt-service-card"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Frequency Control & Language Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Frequency Control */}
            <div className="bg-myslt-card-solid rounded-xl shadow-sm border border-myslt-accent/20">
              <div className="p-6 border-b border-myslt-accent/20">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-myslt-text-primary">Frequency Control</h2>
                    <p className="text-sm text-gray-500">Manage communication limits</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Emails Per Day</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={preferences.frequency.maxEmailsPerDay}
                    onChange={(e) => isEditing && updateFrequencySettings('maxEmailsPerDay', parseInt(e.target.value))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-myslt-service-card"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-myslt-service-card"
                  />
                </div>
                
                <div className="flex items-center justify-between py-4 border-t border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-myslt-text-primary">Digest Mode</p>
                    <p className="text-xs text-gray-500">Bundle notifications into daily summaries</p>
                  </div>
                  <button
                    onClick={() => isEditing && updateFrequencySettings('digestMode', !preferences.frequency.digestMode)}
                    disabled={!isEditing}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      preferences.frequency.digestMode ? 'bg-blue-600' : 'bg-gray-200'
                    } ${!isEditing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-myslt-card-solid transition-transform ${
                        preferences.frequency.digestMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Language & Timezone */}
            <div className="bg-myslt-card-solid rounded-xl shadow-sm border border-myslt-accent/20">
              <div className="p-6 border-b border-myslt-accent/20">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-myslt-text-primary">Language & Region</h2>
                    <p className="text-sm text-gray-500">Localization preferences</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={preferences.language}
                    onChange={(e) => isEditing && setPreferences((prev: any) => ({ ...prev, language: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-myslt-service-card"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-myslt-service-card"
                  >
                    <option value="Asia/Colombo">Asia/Colombo (UTC+05:30)</option>
                    <option value="UTC">UTC (UTC+00:00)</option>
                    <option value="Asia/Dubai">Asia/Dubai (UTC+04:00)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="flex justify-end space-x-4 pt-6">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setHasChanges(false);
                  loadPreferences(); // Reload to reset changes
                }}
                className="px-6 py-2 border border-gray-300 text-myslt-text-secondary rounded-lg hover:bg-myslt-service-card"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
      )}
    </div>
  );
};

export default PreferenceEditorForm;
