import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';

interface Topic {
  id: string;
  name: string;
  category: string;
}

interface TopicPreference {
  topicId: string;
  topicName: string;
  channels: string[];
  frequency: 'immediate' | 'daily' | 'weekly' | 'never';
  enabled: boolean;
}

interface DoNotDisturbPeriod {
  name: string;
  startTime: string;
  endTime: string;
  days: string[];
  timezone: string;
  enabled: boolean;
}

const TopicPreferences: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [preferences, setPreferences] = useState<TopicPreference[]>([]);
  const [doNotDisturbPeriods, setDoNotDisturbPeriods] = useState<DoNotDisturbPeriod[]>([
    {
      name: 'Sleep Hours',
      startTime: '22:00',
      endTime: '08:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      timezone: 'Asia/Colombo',
      enabled: true
    },
    {
      name: 'Work Hours',
      startTime: '09:00',
      endTime: '17:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      timezone: 'Asia/Colombo',
      enabled: false
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTopicsAndPreferences();
  }, []);

  const fetchTopicsAndPreferences = async () => {
    try {
      const topicsResponse = await apiClient.get('/api/v1/preferences/topics');
      const topicsData = (topicsResponse.data as any).topics || [];
      setTopics(topicsData);

      // Initialize preferences for all topics
      const initialPreferences: TopicPreference[] = topicsData.map((topic: Topic) => ({
        topicId: topic.id,
        topicName: topic.name,
        channels: ['email'],
        frequency: 'immediate' as const,
        enabled: true
      }));

      setPreferences(initialPreferences);
    } catch (error) {
      console.error('Failed to fetch topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (topicId: string, field: keyof TopicPreference, value: any) => {
    setPreferences(prev => 
      prev.map(pref => 
        pref.topicId === topicId ? { ...pref, [field]: value } : pref
      )
    );
  };

  const updateChannel = (topicId: string, channel: string, enabled: boolean) => {
    setPreferences(prev => 
      prev.map(pref => {
        if (pref.topicId === topicId) {
          const channels = enabled 
            ? [...pref.channels, channel].filter((c, i, arr) => arr.indexOf(c) === i)
            : pref.channels.filter(c => c !== channel);
          return { ...pref, channels };
        }
        return pref;
      })
    );
  };

  const updateDoNotDisturb = (index: number, field: keyof DoNotDisturbPeriod, value: any) => {
    setDoNotDisturbPeriods(prev => 
      prev.map((period, i) => 
        i === index ? { ...period, [field]: value } : period
      )
    );
  };

  const updateDoNotDisturbDay = (index: number, day: string, enabled: boolean) => {
    setDoNotDisturbPeriods(prev => 
      prev.map((period, i) => {
        if (i === index) {
          const days = enabled 
            ? [...period.days, day].filter((d, idx, arr) => arr.indexOf(d) === idx)
            : period.days.filter(d => d !== day);
          return { ...period, days };
        }
        return period;
      })
    );
  };

  const addDoNotDisturbPeriod = () => {
    const newPeriod: DoNotDisturbPeriod = {
      name: 'Custom Period',
      startTime: '18:00',
      endTime: '20:00',
      days: [],
      timezone: 'Asia/Colombo',
      enabled: true
    };
    setDoNotDisturbPeriods(prev => [...prev, newPeriod]);
  };

  const removeDoNotDisturbPeriod = (index: number) => {
    setDoNotDisturbPeriods(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const userId = 'current-user-id'; // In real app, get from auth context
      const requestData = {
        userId,
        topicPreferences: preferences,
        doNotDisturbPeriods
      };

      await apiClient.post('/api/v1/preferences/topics', requestData);
      
      // Show success message
      alert('Topic preferences updated successfully!');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading topic preferences...</p>
        </div>
      </div>
    );
  }

  const groupedTopics = topics.reduce((acc, topic) => {
    if (!acc[topic.category]) {
      acc[topic.category] = [];
    }
    acc[topic.category].push(topic);
    return acc;
  }, {} as Record<string, Topic[]>);

  const channels = [
    { id: 'email', name: 'Email', icon: '📧' },
    { id: 'sms', name: 'SMS', icon: '💬' },
    { id: 'push', name: 'Push Notification', icon: '🔔' },
    { id: 'whatsapp', name: 'WhatsApp', icon: '📱' }
  ];

  const frequencies = [
    { value: 'immediate', label: 'Immediate' },
    { value: 'daily', label: 'Daily Digest' },
    { value: 'weekly', label: 'Weekly Summary' },
    { value: 'never', label: 'Never' }
  ];

  const weekDays = [
    { id: 'monday', label: 'Mon' },
    { id: 'tuesday', label: 'Tue' },
    { id: 'wednesday', label: 'Wed' },
    { id: 'thursday', label: 'Thu' },
    { id: 'friday', label: 'Fri' },
    { id: 'saturday', label: 'Sat' },
    { id: 'sunday', label: 'Sun' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">Topic Preferences</h2>
          <p className="text-gray-600 mt-2">
            Customize your communication preferences by topic and channel. Set Do Not Disturb periods to control when you receive notifications.
          </p>
        </div>

        <div className="p-6 space-y-8">
          {/* Topic Preferences */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Communication Topics</h3>
            
            {Object.entries(groupedTopics).map(([category, categoryTopics]) => (
              <div key={category} className="mb-8">
                <h4 className="text-md font-medium text-gray-800 mb-4 px-3 py-2 bg-gray-100 rounded-lg">
                  {category}
                </h4>
                
                <div className="space-y-4">
                  {categoryTopics.map(topic => {
                    const preference = preferences.find(p => p.topicId === topic.id);
                    if (!preference) return null;

                    return (
                      <div key={topic.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={preference.enabled}
                                onChange={(e) => updatePreference(topic.id, 'enabled', e.target.checked)}
                                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="font-medium text-gray-900">{topic.name}</span>
                            </label>
                          </div>
                          
                          <select
                            value={preference.frequency}
                            onChange={(e) => updatePreference(topic.id, 'frequency', e.target.value)}
                            disabled={!preference.enabled}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                          >
                            {frequencies.map(freq => (
                              <option key={freq.value} value={freq.value}>
                                {freq.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {preference.enabled && (
                          <div className="ml-7">
                            <p className="text-sm text-gray-600 mb-3">Communication Channels:</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {channels.map(channel => (
                                <label key={channel.id} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={preference.channels.includes(channel.id)}
                                    onChange={(e) => updateChannel(topic.id, channel.id, e.target.checked)}
                                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <span className="text-sm text-gray-700">
                                    {channel.icon} {channel.name}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Do Not Disturb Periods */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Do Not Disturb Periods</h3>
              <button
                onClick={addDoNotDisturbPeriod}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Add Period
              </button>
            </div>

            <div className="space-y-4">
              {doNotDisturbPeriods.map((period, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={period.enabled}
                        onChange={(e) => updateDoNotDisturb(index, 'enabled', e.target.checked)}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <input
                        type="text"
                        value={period.name}
                        onChange={(e) => updateDoNotDisturb(index, 'name', e.target.value)}
                        className="font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:bg-gray-50 px-2 py-1 rounded"
                      />
                    </label>
                    
                    <button
                      onClick={() => removeDoNotDisturbPeriod(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {period.enabled && (
                    <div className="ml-7 space-y-4">
                      <div className="flex items-center space-x-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Start Time</label>
                          <input
                            type="time"
                            value={period.startTime}
                            onChange={(e) => updateDoNotDisturb(index, 'startTime', e.target.value)}
                            className="mt-1 p-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">End Time</label>
                          <input
                            type="time"
                            value={period.endTime}
                            onChange={(e) => updateDoNotDisturb(index, 'endTime', e.target.value)}
                            className="mt-1 p-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Days</label>
                        <div className="flex space-x-2">
                          {weekDays.map(day => (
                            <label key={day.id} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={period.days.includes(day.id)}
                                onChange={(e) => updateDoNotDisturbDay(index, day.id, e.target.checked)}
                                className="mr-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-700">{day.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicPreferences;
