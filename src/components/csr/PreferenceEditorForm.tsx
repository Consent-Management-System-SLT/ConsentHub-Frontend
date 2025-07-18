import React, { useState } from 'react';
import { Settings, Save, X, User, Mail, MessageCircle, Phone, Bell } from 'lucide-react';
import { mockPreferences } from '../../data/mockData';

interface PreferenceEditorFormProps {
  className?: string;
}

const PreferenceEditorForm: React.FC<PreferenceEditorFormProps> = ({ className = '' }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [preferences, setPreferences] = useState(mockPreferences[0]);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // Handle save logic
    console.log('Saving preferences:', preferences);
    setIsEditing(false);
  };

  const handleChannelChange = (channel: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      preferredChannels: {
        ...prev.preferredChannels,
        [channel]: value
      }
    }));
  };

  const handleTopicChange = (topic: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      topicSubscriptions: {
        ...prev.topicSubscriptions,
        [topic]: value
      }
    }));
  };

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
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Settings className="w-4 h-4" />
                <span>Edit</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Customer Selection */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-4">
          <User className="w-5 h-5 text-gray-600" />
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select a customer...</option>
            {mockPreferences.map(pref => (
              <option key={pref.id} value={pref.partyId}>
                Customer {pref.partyId}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preferences Form */}
      <div className="p-6 space-y-6">
        {/* Communication Channels */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Communication Channels</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(preferences.preferredChannels).map(([channel, enabled]) => (
              <div key={channel} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {channel === 'email' && <Mail className="w-5 h-5 text-gray-600" />}
                  {channel === 'sms' && <MessageCircle className="w-5 h-5 text-gray-600" />}
                  {channel === 'push' && <Bell className="w-5 h-5 text-gray-600" />}
                  {channel === 'voice' && <Phone className="w-5 h-5 text-gray-600" />}
                  <span className="font-medium text-gray-900 capitalize">{channel}</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => handleChannelChange(channel, e.target.checked)}
                    disabled={!isEditing}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Topic Subscriptions */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Topic Subscriptions</h3>
          <div className="space-y-3">
            {Object.entries(preferences.topicSubscriptions).map(([topic, subscribed]) => (
              <div key={topic} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900 capitalize">
                  {topic.replace('_', ' ')}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={subscribed}
                    onChange={(e) => handleTopicChange(topic, e.target.checked)}
                    disabled={!isEditing}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Do Not Disturb */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Do Not Disturb Hours</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
              <input
                type="time"
                value={preferences.doNotDisturb.start}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  doNotDisturb: { ...prev.doNotDisturb, start: e.target.value }
                }))}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
              <input
                type="time"
                value={preferences.doNotDisturb.end}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  doNotDisturb: { ...prev.doNotDisturb, end: e.target.value }
                }))}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Frequency Limits */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Frequency Limits (per day)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="number"
                value={preferences.frequencyLimits.email}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  frequencyLimits: { ...prev.frequencyLimits, email: Number(e.target.value) }
                }))}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMS</label>
              <input
                type="number"
                value={preferences.frequencyLimits.sms}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  frequencyLimits: { ...prev.frequencyLimits, sms: Number(e.target.value) }
                }))}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferenceEditorForm;
