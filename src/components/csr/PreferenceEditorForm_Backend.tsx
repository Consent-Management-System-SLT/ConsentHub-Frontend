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
  VolumeX,
  CheckCircle,
  AlertCircle,
  Smartphone,
  X
} from 'lucide-react';
import { csrDashboardService } from '../../services/csrDashboardService';
import { websocketService, PreferenceUpdateEvent } from '../../services/websocketService';

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

  // Set up real-time preference update listener
  useEffect(() => {
    console.log('Setting up real-time preference update listener in CSR dashboard');
    
    const handleCustomerPreferenceUpdate = (event: PreferenceUpdateEvent) => {
      console.log('CSR received customer preference update:', event);
      
      // Only update if it's for the currently selected customer
      if (selectedCustomer && event.customerId === selectedCustomer && event.source === 'customer') {
        console.log('Refreshing CSR view for customer preference update');
        loadPreferences(); // Reload preferences to get latest data
        setSaveStatus('idle'); // Reset any save status
        setHasChanges(false); // Reset changes flag
      }
    };

    // Set up the listener
    websocketService.onCustomerPreferenceUpdate(handleCustomerPreferenceUpdate);

    // Cleanup listener on unmount
    return () => {
      console.log('Cleaning up preference update listener in CSR dashboard');
      websocketService.offCustomerPreferenceUpdate();
    };
  }, [selectedCustomer]); // Re-setup when selected customer changes

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
      // Use the new CSR customer preferences endpoint to get actual customer data
      const customerPrefs = await csrDashboardService.getCustomerPreferences(selectedCustomer);
      
      if (customerPrefs) {
        // Map the actual customer data to the form structure
        setPreferences({
          channels: {
            email: customerPrefs.preferredChannels?.email ?? false,
            sms: customerPrefs.preferredChannels?.sms ?? false,
            push: customerPrefs.preferredChannels?.push ?? false,
            inApp: customerPrefs.preferredChannels?.push ?? false, // Map push to inApp for UI consistency
            phone: customerPrefs.preferredChannels?.phone ?? false
          },
          topics: {
            offers: customerPrefs.topicSubscriptions?.marketing ?? false, // Map marketing to offers
            productUpdates: customerPrefs.topicSubscriptions?.serviceUpdates ?? false,
            serviceAlerts: customerPrefs.topicSubscriptions?.security ?? false, // Map security to serviceAlerts  
            billing: customerPrefs.topicSubscriptions?.billing ?? false,
            security: customerPrefs.topicSubscriptions?.security ?? false,
            newsletters: customerPrefs.topicSubscriptions?.newsletter ?? false,
            marketing: customerPrefs.topicSubscriptions?.marketing ?? false,
            promotions: customerPrefs.topicSubscriptions?.promotions ?? false
          },
          dndSettings: {
            enabled: customerPrefs.quietHours?.enabled ?? customerPrefs.doNotDisturb?.enabled ?? false,
            startTime: customerPrefs.quietHours?.start ?? customerPrefs.doNotDisturb?.start ?? '22:00',
            endTime: customerPrefs.quietHours?.end ?? customerPrefs.doNotDisturb?.end ?? '08:00'
          },
          dndSettings: {
            enabled: customerPrefs.doNotDisturb?.enabled ?? false,
            startTime: customerPrefs.doNotDisturb?.startTime ?? '22:00',
            endTime: customerPrefs.doNotDisturb?.endTime ?? '08:00'
          },
          frequency: {
            maxEmailsPerDay: customerPrefs.frequency?.maxEmailsPerDay ?? 3,
            maxSmsPerDay: customerPrefs.frequency?.maxSmsPerDay ?? 2,
            digestMode: customerPrefs.frequency?.digestMode ?? false,
            immediateAlerts: customerPrefs.frequency?.immediateAlerts ?? ['security', 'billing']
          },
          language: customerPrefs.language ?? 'en',
          timezone: customerPrefs.timezone ?? 'Asia/Colombo',
          lastUpdated: customerPrefs.lastUpdated,
          updatedBy: customerPrefs.updatedBy
        });
        
        console.log('Loaded actual customer preferences:', customerPrefs);
      } else {
        console.log('No preferences found for customer, using defaults');
      }
    } catch (error) {
      console.error('Error loading customer preferences:', error);
      // Keep default preferences if loading fails
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
      // Map frontend preferences to backend structure (FIX: Use correct field names that backend expects)
      const backendPreferences = {
        channels: {
          email: preferences.channels?.email ?? false,
          sms: preferences.channels?.sms ?? false, 
          push: preferences.channels?.push ?? false,
          phone: preferences.channels?.phone ?? false,
          inApp: preferences.channels?.inApp ?? false
        },
        topics: {
          marketing: preferences.topics?.marketing ?? false,
          promotions: preferences.topics?.promotions ?? false,
          productUpdates: preferences.topics?.productUpdates ?? false, // Keep original field name
          serviceUpdates: preferences.topics?.productUpdates ?? false, // Also map to serviceUpdates
          billing: preferences.topics?.billing ?? false,
          security: preferences.topics?.security ?? false,
          newsletters: preferences.topics?.newsletters ?? false, // Keep original field name
          newsletter: preferences.topics?.newsletters ?? false, // Also map to newsletter
          surveys: false // Default value
        },
        dndSettings: {
          enabled: preferences.dndSettings?.enabled ?? false,
          startTime: preferences.dndSettings?.startTime ?? '22:00',
          endTime: preferences.dndSettings?.endTime ?? '08:00'
        },
        frequency: {
          digestMode: preferences.frequency?.digestMode ?? false
        },
        timezone: preferences.timezone ?? 'Asia/Colombo',
        language: preferences.language ?? 'en'
      };

      // Use the CSR service to update customer preferences in real-time
      const result = await csrDashboardService.updateCustomerPreferences(selectedCustomer, backendPreferences);
      
      console.log('CSR successfully updated customer preferences:', result);
      
      setIsEditing(false);
      setHasChanges(false);
      setSaveStatus('success');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving customer preferences:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setSaving(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm) ||
    customer.id?.includes(searchTerm)
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-myslt-text-primary">Communication Preferences</h1>
          <p className="text-myslt-text-secondary mt-2">Manage customer communication preferences and settings</p>
          {selectedCustomer && (
            <div className="flex items-center space-x-2 mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-700 font-medium">
                Displaying actual data from {customers.find(c => c.id === selectedCustomer)?.name}'s preference dashboard
              </span>
            </div>
          )}
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
              <p className="text-sm text-gray-500">Search and select a customer to manage their communication preferences</p>
              <div className="mt-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block">
                💡 Tip: Search by name, email, phone number, or customer ID
              </div>
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
                  placeholder="Search by name, email, phone, or customer ID..."
                  className="pl-10 pr-16 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => setSearchTerm(' ')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs px-2 py-1 text-blue-600 hover:text-blue-800 bg-blue-50 rounded"
                >
                  Show All
                </button>
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
                      className="p-3 hover:bg-myslt-service-card cursor-pointer border-b border-myslt-border last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <User className="w-5 h-5 text-gray-500" />
                          <div>
                            <div className="font-medium text-myslt-text-primary">{customer.name}</div>
                            <div className="text-sm text-gray-500">{customer.email}</div>
                            <div className="text-xs text-gray-400">ID: {customer.id} • {customer.phone}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            customer.status === 'active' ? 'bg-green-100 text-green-800' :
                            customer.status === 'inactive' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {customer.status}
                          </div>
                          {customer.totalConsents && (
                            <div className="text-xs text-gray-400 mt-1">
                              {customer.totalConsents} consents
                            </div>
                          )}
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
            <div className="flex items-end space-x-2">
              {selectedCustomer && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    {customers.find(c => c.id === selectedCustomer)?.name || `Customer ${selectedCustomer}`}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedCustomer('');
                      setIsEditing(false);
                      setHasChanges(false);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                    title="Clear selection"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {selectedCustomer && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>{isEditing ? 'Cancel Edit' : 'Edit Preferences'}</span>
                </button>
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

      {/* Preferences Content - Matching Customer Dashboard Layout */}
      {selectedCustomer && !loading ? (
        <div className="space-y-6">
          {/* Main Grid - Communication Channels and Topic Subscriptions Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Communication Channels Section */}
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl shadow-lg border border-blue-700/30 text-white">
              <div className="p-6 border-b border-blue-700/30">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Communication Channels</h2>
                    <p className="text-blue-200 text-sm">Choose how you'd like to receive notifications</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { key: 'email', label: 'Email Notifications', desc: 'Receive notifications via email' },
                  { key: 'sms', label: 'SMS Notifications', desc: 'Receive notifications via SMS' },
                  { key: 'push', label: 'Push Notifications', desc: 'Receive push notifications on your mobile device' },
                  { key: 'inApp', label: 'In-App Notifications', desc: 'Receive notifications within the application' }
                ].map((channel) => (
                  <div key={channel.key} className="flex items-center justify-between py-3 border-b border-blue-700/20 last:border-0">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-base">{channel.label}</h3>
                      <p className="text-blue-200 text-sm">{channel.desc}</p>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => isEditing && updateChannelPreference(channel.key, !preferences.channels[channel.key])}
                        disabled={!isEditing}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                          preferences.channels[channel.key] ? 'bg-blue-500' : 'bg-gray-400'
                        } ${!isEditing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
                            preferences.channels[channel.key] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Topic Subscriptions Section */}
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl shadow-lg border border-blue-700/30 text-white">
              <div className="p-6 border-b border-blue-700/30">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Topic Subscriptions</h2>
                    <p className="text-blue-200 text-sm">Select the types of communications you want to receive</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { key: 'offers', label: 'Special Offers & Promotions', desc: 'Promotional offers and discounts' },
                  { key: 'productUpdates', label: 'Product Updates', desc: 'New features and service updates' },
                  { key: 'serviceAlerts', label: 'Service Alerts', desc: 'Important service notifications and outages' },
                  { key: 'billing', label: 'Billing & Payments', desc: 'Bill notifications and payment reminders' },
                  { key: 'security', label: 'Security Alerts', desc: 'Account security and privacy updates' },
                  { key: 'newsletters', label: 'Newsletters', desc: 'Company news and industry insights' }
                ].map((topic) => (
                  <div key={topic.key} className="flex items-center justify-between py-3 border-b border-blue-700/20 last:border-0">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-base">{topic.label}</h3>
                      <p className="text-blue-200 text-sm">{topic.desc}</p>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => isEditing && updateTopicPreference(topic.key, !preferences.topics[topic.key])}
                        disabled={!isEditing}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                          preferences.topics[topic.key] ? 'bg-blue-500' : 'bg-gray-400'
                        } ${!isEditing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
                            preferences.topics[topic.key] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Grid - Do Not Disturb and Frequency Limits */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Do Not Disturb Section */}
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl shadow-lg border border-blue-700/30 text-white">
              <div className="p-6 border-b border-blue-700/30">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                    <VolumeX className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Do Not Disturb</h2>
                    <p className="text-blue-200 text-sm">Set quiet hours for notifications</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-base">Enable Do Not Disturb</h3>
                    <p className="text-blue-200 text-sm">Suppress non-urgent notifications during specified hours</p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => isEditing && updateDndSettings('enabled', !preferences.dndSettings.enabled)}
                      disabled={!isEditing}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                        preferences.dndSettings.enabled ? 'bg-blue-500' : 'bg-gray-400'
                      } ${!isEditing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
                          preferences.dndSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                
                {preferences.dndSettings.enabled && (
                  <div className="space-y-4 mt-4 pt-4 border-t border-blue-700/20">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-200 mb-2">Start Time</label>
                        <input
                          type="time"
                          value={preferences.dndSettings.startTime}
                          onChange={(e) => isEditing && updateDndSettings('startTime', e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 bg-blue-800 border border-blue-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-200 mb-2">End Time</label>
                        <input
                          type="time"
                          value={preferences.dndSettings.endTime}
                          onChange={(e) => isEditing && updateDndSettings('endTime', e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 bg-blue-800 border border-blue-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Frequency Limits Section */}
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl shadow-lg border border-blue-700/30 text-white">
              <div className="p-6 border-b border-blue-700/30">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Frequency Limits</h2>
                    <p className="text-blue-200 text-sm">Control how often you receive notifications</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-3">Maximum Emails per Day</label>
                  <select
                    value={preferences.frequency.maxEmailsPerDay || 3}
                    onChange={(e) => isEditing && updateFrequencySettings('maxEmailsPerDay', parseInt(e.target.value))}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-blue-800 border border-blue-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value={1}>1 email per day</option>
                    <option value={3}>3 emails per day</option>
                    <option value={5}>5 emails per day</option>
                    <option value={10}>10 emails per day</option>
                    <option value={999}>No limit</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-3">Maximum SMS per Day</label>
                  <select
                    value={preferences.frequency.maxSmsPerDay || 2}
                    onChange={(e) => isEditing && updateFrequencySettings('maxSmsPerDay', parseInt(e.target.value))}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-blue-800 border border-blue-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value={1}>1 SMS per day</option>
                    <option value={2}>2 SMS per day</option>
                    <option value={5}>5 SMS per day</option>
                    <option value={999}>No limit</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between py-3 border-t border-blue-700/20">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-base">Daily Digest Mode</h3>
                    <p className="text-blue-200 text-sm">Receive a single daily summary instead of individual notifications</p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => isEditing && updateFrequencySettings('digestMode', !preferences.frequency.digestMode)}
                      disabled={!isEditing}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                        preferences.frequency.digestMode ? 'bg-blue-500' : 'bg-gray-400'
                      } ${!isEditing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
                          preferences.frequency.digestMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
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
                className="px-6 py-2 border border-blue-300 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
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
    </div>
  );
};

export default PreferenceEditorForm;
