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

interface Preference {
  partyId: string;
  name?: string;
  email?: string;
  preferredChannels?: {
    email?: boolean;
    sms?: boolean;
    phone?: boolean;
    push?: boolean;
  };
  topicSubscriptions?: {
    marketing?: boolean;
    promotions?: boolean;
    serviceUpdates?: boolean;
    billing?: boolean;
    security?: boolean;
  };
  dndSettings?: {
    enabled?: boolean;
    startTime?: string;
    endTime?: string;
  };
  frequency?: {
    maxEmailsPerDay?: number;
    maxSmsPerDay?: number;
    digestMode?: boolean;
  };
  language?: string;
  timezone?: string;
}

interface PreferenceEditorFormProps {
  className?: string;
  customerId?: string;
}

const PreferenceEditorForm: React.FC<PreferenceEditorFormProps> = ({ className = '', customerId }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<string>(customerId || '');
  const [allPreferences, setAllPreferences] = useState<Preference[]>([]);
  const [filteredPreferences, setFilteredPreferences] = useState<Preference[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
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
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    loadAllPreferences();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = allPreferences.filter(pref =>
        pref.partyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pref.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pref.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPreferences(filtered);
    } else {
      setFilteredPreferences([]);
    }
  }, [searchTerm, allPreferences]);

  const loadAllPreferences = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/v1/preferences');
      if (!response.ok) throw new Error('Failed to fetch preferences');

      const data = await response.json();
      // Handle both array response and object with preferences array
      const preferences: Preference[] = Array.isArray(data) ? data : data.preferences || [];
      setAllPreferences(preferences);
    } catch (error) {
      console.error('Error loading all preferences:', error);
      setAllPreferences([]);
    } finally {
      setLoading(false);
    }
  };

  const selectCustomer = (partyId: string) => {
    const selectedPref = allPreferences.find(pref => pref.partyId === partyId);
    if (selectedPref) {
      setSelectedCustomer(partyId);
      setSearchTerm('');
      
      // Map backend data to frontend structure
      setPreferences({
        partyId: selectedPref.partyId,
        name: selectedPref.name || `Customer ${partyId}`,
        email: selectedPref.email || 'No email provided',
        channels: {
          email: selectedPref.preferredChannels?.email ?? true,
          sms: selectedPref.preferredChannels?.sms ?? true,
          phone: selectedPref.preferredChannels?.phone ?? false,
          push: selectedPref.preferredChannels?.push ?? false,
          inApp: true
        },
        topics: {
          offers: true,
          productUpdates: true,
          serviceAlerts: selectedPref.topicSubscriptions?.serviceUpdates ?? true,
          billing: selectedPref.topicSubscriptions?.billing ?? true,
          security: selectedPref.topicSubscriptions?.security ?? true,
          newsletters: false,
          marketing: selectedPref.topicSubscriptions?.marketing ?? false,
          promotions: selectedPref.topicSubscriptions?.promotions ?? false
        },
        dndSettings: {
          enabled: selectedPref.dndSettings?.enabled ?? true,
          startTime: selectedPref.dndSettings?.startTime ?? '22:00',
          endTime: selectedPref.dndSettings?.endTime ?? '08:00'
        },
        frequency: {
          maxEmailsPerDay: selectedPref.frequency?.maxEmailsPerDay ?? 3,
          maxSmsPerDay: selectedPref.frequency?.maxSmsPerDay ?? 2,
          digestMode: selectedPref.frequency?.digestMode ?? false,
          immediateAlerts: ['security', 'billing']
        },
        language: selectedPref.language ?? 'en',
        timezone: selectedPref.timezone ?? 'Asia/Colombo'
      });
      
      setHasChanges(false);
    }
  };

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
      // Transform frontend preferences to match backend API structure
      const preferenceData = {
        partyId: selectedCustomer,
        name: preferences.name,
        email: preferences.email,
        preferredChannels: {
          email: preferences.channels.email,
          sms: preferences.channels.sms,
          phone: preferences.channels.phone,
          push: preferences.channels.push
        },
        topicSubscriptions: {
          marketing: preferences.topics.marketing,
          promotions: preferences.topics.promotions,
          serviceUpdates: preferences.topics.serviceAlerts,
          billing: preferences.topics.billing,
          security: preferences.topics.security
        },
        dndSettings: {
          enabled: preferences.dndSettings.enabled,
          startTime: preferences.dndSettings.startTime,
          endTime: preferences.dndSettings.endTime
        },
        frequency: {
          maxEmailsPerDay: preferences.frequency.maxEmailsPerDay,
          maxSmsPerDay: preferences.frequency.maxSmsPerDay,
          digestMode: preferences.frequency.digestMode
        },
        language: preferences.language,
        timezone: preferences.timezone
      };

      console.log('Saving preference data:', preferenceData);
      console.log('API URL:', `http://localhost:3000/api/v1/preference/party/${selectedCustomer}`);

      const res = await fetch(`http://localhost:3000/api/v1/preference/party/${selectedCustomer}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(preferenceData)
      });

      console.log('Response status:', res.status);
      console.log('Response headers:', res.headers);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error response:', errorText);
        
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || `Server error: ${res.status}`;
        } catch {
          errorMessage = `Server error: ${res.status} - ${errorText}`;
        }
        
        throw new Error(errorMessage);
      }

      const savedPreference = await res.json();
      console.log('Preference saved successfully:', savedPreference);

      setIsEditing(false);
      setHasChanges(false);
      setSaveStatus('success');
      
      // Reload all preferences to get updated data
      await loadAllPreferences();
      
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communication Preferences</h1>
          <p className="text-gray-600 mt-2">Search by Party ID and manage customer communication preferences</p>
        </div>
      </div>

      {/* Party ID Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Search Customer by Party ID</h2>
              <p className="text-sm text-gray-500">Enter Party ID, name, or email to find customer preferences</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by Party ID, name, or email..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                {searchTerm && filteredPreferences.length > 0 && (
                  <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-lg">
                    {filteredPreferences.map(pref => (
                      <div
                        key={pref.partyId}
                        onClick={() => selectCustomer(pref.partyId)}
                        className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <User className="w-5 h-5 text-gray-500" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">Party ID: {pref.partyId}</div>
                            {pref.name && <div className="text-sm text-gray-600">{pref.name}</div>}
                            {pref.email && <div className="text-sm text-gray-500">{pref.email}</div>}
                            
                            <div className="mt-2 text-xs text-gray-600 space-y-1">
                              <div>📬 Channels: {Object.entries(pref.preferredChannels || {})
                                .filter(([_, v]) => v)
                                .map(([k]) => k)
                                .join(', ') || 'None'}
                              </div>
                              <div>📢 Topics: {Object.entries(pref.topicSubscriptions || {})
                                .filter(([_, v]) => v)
                                .map(([k]) => k)
                                .join(', ') || 'None'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {searchTerm && filteredPreferences.length === 0 && !loading && (
                  <div className="mt-2 p-4 text-center text-gray-500 border border-gray-200 rounded-lg">
                    No customers found matching "{searchTerm}"
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

      {/* Selected Customer Info */}
      {selectedCustomer && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-medium text-blue-900">Selected Customer</h3>
              <p className="text-sm text-blue-700">
                Party ID: {selectedCustomer} | {preferences.name} | {preferences.email}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Preferences Content */}
      {selectedCustomer && !loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Communication Channels */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Communication Channels</h2>
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
                      <Icon className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{channel.label}</p>
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
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Topic Preferences</h2>
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
                    <p className="text-sm font-medium text-gray-900">{topic.label}</p>
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
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading preferences...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Search for a Customer</h3>
            <p className="text-gray-500">Enter a Party ID, name, or email in the search box above to find and manage customer preferences</p>
          </div>
        </div>
      )}

      {/* Advanced Settings Section */}
      {selectedCustomer && !loading && (
        <div className="space-y-6">
          {/* Do Not Disturb Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  {preferences.dndSettings.enabled ? (
                    <VolumeX className="w-5 h-5 text-purple-600" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-purple-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Do Not Disturb</h2>
                  <p className="text-sm text-gray-500">Control quiet hours for non-urgent notifications</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Enable Do Not Disturb</p>
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
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Frequency Control</h2>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>
                
                <div className="flex items-center justify-between py-4 border-t border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Digest Mode</p>
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
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.frequency.digestMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Language & Timezone */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Language & Region</h2>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
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
                  // Reset to selected customer data
                  selectCustomer(selectedCustomer);
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
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