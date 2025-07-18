import React, { useState, useEffect } from 'react';
import { Settings, Save, X, User, Mail, MessageCircle, Phone, Bell, RefreshCw, Search } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

interface PreferenceEditorFormProps {
  className?: string;
  customerId?: string;
}

const PreferenceEditorForm: React.FC<PreferenceEditorFormProps> = ({ className = '', customerId }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<string>(customerId || '');
  const [customers, setCustomers] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
      const data = response.data as any[];
      const customerPrefs = data.find((pref: any) => pref.partyId === selectedCustomer);
      
      if (customerPrefs) {
        setPreferences(customerPrefs);
      } else {
        // Create default preferences if none exist
        const defaultPrefs = {
          id: Date.now().toString(),
          partyId: selectedCustomer,
          preferredChannels: {
            email: true,
            sms: false,
            phone: false,
            push: true
          },
          topicSubscriptions: {
            marketing: false,
            promotions: false,
            serviceUpdates: true,
            billing: true,
            security: true
          },
          frequency: 'immediate',
          timezone: 'UTC',
          lastUpdated: new Date().toISOString()
        };
        setPreferences(defaultPrefs);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences || !selectedCustomer) return;
    
    setSaving(true);
    try {
      const updatedPreferences = {
        ...preferences,
        lastUpdated: new Date().toISOString()
      };
      
      await apiClient.put(`/api/v1/preferences/${preferences.id}`, updatedPreferences);
      setPreferences(updatedPreferences);
      setIsEditing(false);
      
      // Show success message
      alert('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Error saving preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChannelChange = (channel: string, value: boolean) => {
    setPreferences((prev: any) => ({
      ...prev,
      preferredChannels: {
        ...prev.preferredChannels,
        [channel]: value
      }
    }));
  };

  const handleTopicChange = (topic: string, value: boolean) => {
    setPreferences((prev: any) => ({
      ...prev,
      topicSubscriptions: {
        ...prev.topicSubscriptions,
        [topic]: value
      }
    }));
  };

  const filteredCustomers = customers.filter(customer => 
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-indigo-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Communication Preferences</h2>
              <p className="text-sm text-gray-600">Manage customer communication preferences</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isEditing 
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isEditing ? <X className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
              <span className="ml-2">{isEditing ? 'Cancel' : 'Edit'}</span>
            </button>
            {isEditing && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Customer Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Customer
          </label>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select a customer</option>
              {filteredCustomers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} ({customer.email})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Preferences Form */}
        {selectedCustomer && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
                <span className="ml-2 text-gray-600">Loading preferences...</span>
              </div>
            ) : preferences ? (
              <div className="space-y-6">
                {/* Preferred Channels */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Preferred Communication Channels</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">Email</p>
                          <p className="text-sm text-gray-600">Receive updates via email</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.preferredChannels?.email || false}
                        onChange={(e) => handleChannelChange('email', e.target.checked)}
                        disabled={!isEditing}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <MessageCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">SMS</p>
                          <p className="text-sm text-gray-600">Receive text messages</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.preferredChannels?.sms || false}
                        onChange={(e) => handleChannelChange('sms', e.target.checked)}
                        disabled={!isEditing}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-orange-600" />
                        <div>
                          <p className="font-medium text-gray-900">Phone</p>
                          <p className="text-sm text-gray-600">Receive phone calls</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.preferredChannels?.phone || false}
                        onChange={(e) => handleChannelChange('phone', e.target.checked)}
                        disabled={!isEditing}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Bell className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="font-medium text-gray-900">Push Notifications</p>
                          <p className="text-sm text-gray-600">Receive app notifications</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.preferredChannels?.push || false}
                        onChange={(e) => handleChannelChange('push', e.target.checked)}
                        disabled={!isEditing}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Topic Subscriptions */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Topic Subscriptions</h3>
                  <div className="space-y-3">
                    {Object.entries(preferences.topicSubscriptions || {}).map(([topic, value]) => (
                      <div key={topic} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 capitalize">{topic.replace(/([A-Z])/g, ' $1').trim()}</p>
                          <p className="text-sm text-gray-600">
                            {topic === 'marketing' && 'Marketing communications and offers'}
                            {topic === 'promotions' && 'Special promotions and deals'}
                            {topic === 'serviceUpdates' && 'Service updates and announcements'}
                            {topic === 'billing' && 'Billing and payment notifications'}
                            {topic === 'security' && 'Security alerts and notifications'}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={value as boolean}
                          onChange={(e) => handleTopicChange(topic, e.target.checked)}
                          disabled={!isEditing}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Frequency Settings */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Communication Frequency</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How often would you like to receive communications?
                    </label>
                    <select
                      value={preferences.frequency || 'immediate'}
                      onChange={(e) => setPreferences((prev: any) => ({ ...prev, frequency: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="immediate">Immediate</option>
                      <option value="daily">Daily Digest</option>
                      <option value="weekly">Weekly Summary</option>
                      <option value="monthly">Monthly Report</option>
                    </select>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="text-sm text-gray-500">
                  Last updated: {preferences.lastUpdated ? new Date(preferences.lastUpdated).toLocaleString() : 'Never'}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Settings className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No preferences found for this customer</p>
              </div>
            )}
          </>
        )}

        {!selectedCustomer && (
          <div className="text-center py-12 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Select a customer to view and edit their communication preferences</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreferenceEditorForm;
