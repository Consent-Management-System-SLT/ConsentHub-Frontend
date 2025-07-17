import React, { useState } from 'react';
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
} from 'lucide-react';
import { mockPreferences, mockParties } from '../data/mockData';
import { PrivacyPreference, Party } from '../types/consent';

interface CommunicationPreferencesProps {
  selectedCustomer?: Party;
}

export const CommunicationPreferences: React.FC<CommunicationPreferencesProps> = ({ selectedCustomer }) => {
  const [preferences, setPreferences] = useState<PrivacyPreference[]>(mockPreferences);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PrivacyPreference>>({});

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomer, setFilteredCustomer] = useState<Party | null>(selectedCustomer || null);

  // Search handler
  const handleCustomerSearch = () => {
    const match = mockParties.find(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCustomer(match || null);
  };

  const filteredPreferences = filteredCustomer
    ? preferences.filter(pref => pref.partyId === filteredCustomer.id)
    : preferences;

  const getCustomerName = (partyId: string) => {
    const party = mockParties.find(p => p.id === partyId);
    return party ? party.name : 'Unknown Customer';
  };

  const handleEdit = (preference: PrivacyPreference) => {
    setEditingId(preference.id);
    setEditForm(preference);
  };

  const handleSave = () => {
    if (editingId && editForm) {
      setPreferences(prev =>
        prev.map(pref =>
          pref.id === editingId
            ? { ...pref, ...editForm, lastUpdated: new Date().toISOString() }
            : pref
        )
      );
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'push':
        return <Bell className="h-4 w-4" />;
      case 'voice':
        return <Phone className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const ChannelToggle = ({ channel, enabled, onChange }: { channel: string; enabled: boolean; onChange: (enabled: boolean) => void }) => {
    return (
      <div className="flex items-center space-x-2">
        {getChannelIcon(channel)}
        <span className="text-sm font-medium text-gray-700 capitalize">{channel}</span>
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

  const TopicToggle = ({ topic, label, enabled, onChange }: { topic: string; label: string; enabled: boolean; onChange: (enabled: boolean) => void }) => {
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
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

              {/* Channel Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Preferred Channels</h4>
                  <div className="space-y-3">
                    {Object.entries(preference.preferredChannels).map(([channel, enabled]) => (
                      <ChannelToggle
                        key={channel}
                        channel={channel}
                        enabled={editingId === preference.id
                          ? editForm.preferredChannels?.[channel as keyof typeof editForm.preferredChannels] ?? enabled
                          : enabled
                        }
                        onChange={(newEnabled) => {
                          if (editingId === preference.id) {
                            setEditForm(prev => ({
                              ...prev,
                              preferredChannels: {
                                ...prev.preferredChannels,
                                [channel]: newEnabled
                              }
                            }));
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Topic Toggles */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Topic Subscriptions</h4>
                  <div className="space-y-3">
                    {Object.entries(preference.topicSubscriptions).map(([topic, enabled]) => (
                      <TopicToggle
                        key={topic}
                        topic={topic}
                        label={topic.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        enabled={editingId === preference.id
                          ? editForm.topicSubscriptions?.[topic as keyof typeof editForm.topicSubscriptions] ?? enabled
                          : enabled
                        }
                        onChange={(newEnabled) => {
                          if (editingId === preference.id) {
                            setEditForm(prev => ({
                              ...prev,
                              topicSubscriptions: {
                                ...prev.topicSubscriptions,
                                [topic]: newEnabled
                              }
                            }));
                          }
                        }}
                      />
                    ))}
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
