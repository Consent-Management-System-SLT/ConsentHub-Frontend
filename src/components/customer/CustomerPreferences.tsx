import React, { useState } from 'react';
import { 
  Settings, 
  Bell, 
  Clock,
  Volume2,
  VolumeX,
  Save,
  RotateCcw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface PreferenceSettings {
  channels: {
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
  };
  topics: {
    offers: boolean;
    productUpdates: boolean;
    serviceAlerts: boolean;
    billing: boolean;
    security: boolean;
    newsletters: boolean;
  };
  dndSettings: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  frequency: {
    maxEmailsPerDay: number;
    maxSmsPerDay: number;
    digestMode: boolean;
  };
  language: string;
  timezone: string;
}

interface CustomerPreferencesProps {
  onBack?: () => void;
}

const CustomerPreferences: React.FC<CustomerPreferencesProps> = () => {
  const [preferences, setPreferences] = useState<PreferenceSettings>({
    channels: {
      email: true,
      sms: true,
      push: false,
      inApp: true
    },
    topics: {
      offers: true,
      productUpdates: true,
      serviceAlerts: true,
      billing: true,
      security: true,
      newsletters: false
    },
    dndSettings: {
      enabled: true,
      startTime: '22:00',
      endTime: '08:00'
    },
    frequency: {
      maxEmailsPerDay: 3,
      maxSmsPerDay: 2,
      digestMode: false
    },
    language: 'en',
    timezone: 'Asia/Colombo'
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const updateChannelPreference = (channel: keyof PreferenceSettings['channels'], value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: value
      }
    }));
    setHasChanges(true);
  };

  const updateTopicPreference = (topic: keyof PreferenceSettings['topics'], value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      topics: {
        ...prev.topics,
        [topic]: value
      }
    }));
    setHasChanges(true);
  };

  const updateDndSettings = (setting: keyof PreferenceSettings['dndSettings'], value: boolean | string) => {
    setPreferences(prev => ({
      ...prev,
      dndSettings: {
        ...prev.dndSettings,
        [setting]: value
      }
    }));
    setHasChanges(true);
  };

  const updateFrequencySettings = (setting: keyof PreferenceSettings['frequency'], value: number | boolean) => {
    setPreferences(prev => ({
      ...prev,
      frequency: {
        ...prev.frequency,
        [setting]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Saving preferences:', preferences);
      setSaveStatus('success');
      setHasChanges(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    // Reset to default values
    setPreferences({
      channels: {
        email: true,
        sms: true,
        push: false,
        inApp: true
      },
      topics: {
        offers: true,
        productUpdates: true,
        serviceAlerts: true,
        billing: true,
        security: true,
        newsletters: false
      },
      dndSettings: {
        enabled: true,
        startTime: '22:00',
        endTime: '08:00'
      },
      frequency: {
        maxEmailsPerDay: 3,
        maxSmsPerDay: 2,
        digestMode: false
      },
      language: 'en',
      timezone: 'Asia/Colombo'
    });
    setHasChanges(false);
  };

  const ToggleSwitch = ({ 
    enabled, 
    onChange, 
    label, 
    description 
  }: { 
    enabled: boolean; 
    onChange: (value: boolean) => void; 
    label: string; 
    description?: string; 
  }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-900">{label}</label>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          enabled ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communication Preferences</h1>
          <p className="text-gray-600 mt-2">Customize how and when you receive communications from us</p>
        </div>
        
        {saveStatus === 'success' && (
          <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Preferences saved!</span>
          </div>
        )}
        
        {saveStatus === 'error' && (
          <div className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg border border-red-200">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Error saving preferences</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Communication Channels */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Communication Channels</h2>
                <p className="text-sm text-gray-500">Choose how you'd like to receive notifications</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <ToggleSwitch
              enabled={preferences.channels.email}
              onChange={(value) => updateChannelPreference('email', value)}
              label="Email Notifications"
              description="Receive notifications via email"
            />
            <ToggleSwitch
              enabled={preferences.channels.sms}
              onChange={(value) => updateChannelPreference('sms', value)}
              label="SMS Notifications"
              description="Receive notifications via SMS"
            />
            <ToggleSwitch
              enabled={preferences.channels.push}
              onChange={(value) => updateChannelPreference('push', value)}
              label="Push Notifications"
              description="Receive push notifications on your mobile device"
            />
            <ToggleSwitch
              enabled={preferences.channels.inApp}
              onChange={(value) => updateChannelPreference('inApp', value)}
              label="In-App Notifications"
              description="Receive notifications within the application"
            />
          </div>
        </div>

        {/* Topic Subscriptions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Topic Subscriptions</h2>
                <p className="text-sm text-gray-500">Select the types of communications you want to receive</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <ToggleSwitch
              enabled={preferences.topics.offers}
              onChange={(value) => updateTopicPreference('offers', value)}
              label="Special Offers & Promotions"
              description="Promotional offers and discounts"
            />
            <ToggleSwitch
              enabled={preferences.topics.productUpdates}
              onChange={(value) => updateTopicPreference('productUpdates', value)}
              label="Product Updates"
              description="New features and service updates"
            />
            <ToggleSwitch
              enabled={preferences.topics.serviceAlerts}
              onChange={(value) => updateTopicPreference('serviceAlerts', value)}
              label="Service Alerts"
              description="Important service notifications and outages"
            />
            <ToggleSwitch
              enabled={preferences.topics.billing}
              onChange={(value) => updateTopicPreference('billing', value)}
              label="Billing & Payments"
              description="Bill notifications and payment reminders"
            />
            <ToggleSwitch
              enabled={preferences.topics.security}
              onChange={(value) => updateTopicPreference('security', value)}
              label="Security Alerts"
              description="Account security and privacy updates"
            />
            <ToggleSwitch
              enabled={preferences.topics.newsletters}
              onChange={(value) => updateTopicPreference('newsletters', value)}
              label="Newsletters"
              description="Company news and industry insights"
            />
          </div>
        </div>

        {/* Do Not Disturb Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                {preferences.dndSettings.enabled ? <VolumeX className="w-5 h-5 text-purple-600" /> : <Volume2 className="w-5 h-5 text-purple-600" />}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Do Not Disturb</h2>
                <p className="text-sm text-gray-500">Set quiet hours for notifications</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <ToggleSwitch
              enabled={preferences.dndSettings.enabled}
              onChange={(value) => updateDndSettings('enabled', value)}
              label="Enable Do Not Disturb"
              description="Suppress non-urgent notifications during specified hours"
            />
            
            {preferences.dndSettings.enabled && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={preferences.dndSettings.startTime}
                    onChange={(e) => updateDndSettings('startTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <input
                    type="time"
                    value={preferences.dndSettings.endTime}
                    onChange={(e) => updateDndSettings('endTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Frequency Limits */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Frequency Limits</h2>
                <p className="text-sm text-gray-500">Control how often you receive notifications</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Emails per Day</label>
              <select
                value={preferences.frequency.maxEmailsPerDay}
                onChange={(e) => updateFrequencySettings('maxEmailsPerDay', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1}>1 email per day</option>
                <option value={2}>2 emails per day</option>
                <option value={3}>3 emails per day</option>
                <option value={5}>5 emails per day</option>
                <option value={10}>10 emails per day</option>
                <option value={999}>No limit</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Maximum SMS per Day</label>
              <select
                value={preferences.frequency.maxSmsPerDay}
                onChange={(e) => updateFrequencySettings('maxSmsPerDay', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1}>1 SMS per day</option>
                <option value={2}>2 SMS per day</option>
                <option value={3}>3 SMS per day</option>
                <option value={5}>5 SMS per day</option>
                <option value={999}>No limit</option>
              </select>
            </div>

            <ToggleSwitch
              enabled={preferences.frequency.digestMode}
              onChange={(value) => updateFrequencySettings('digestMode', value)}
              label="Daily Digest Mode"
              description="Receive a single daily summary instead of individual notifications"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {hasChanges && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
            <div>
              <p className="text-sm font-medium text-gray-900">You have unsaved changes</p>
              <p className="text-xs text-gray-500">Your preferences will be lost if you leave without saving</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleReset}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPreferences;
