import React, { useState } from 'react';
import { Shield, User, Bell, FileText, Download, Eye } from 'lucide-react';
import { useAuth, useCustomerDashboard, useConsentMutation, usePreferenceMutation } from '../hooks/useApi';
import { dsarService } from '../services';
import ServerConnectionAlert from './shared/ServerConnectionAlert';

interface ConsentHubDashboardProps {
  customerId?: string;
}

export const ConsentHubDashboard: React.FC<ConsentHubDashboardProps> = ({ customerId }) => {
  const { user, isAuthenticated } = useAuth();
  const { data: dashboardData, loading, error, refetch } = useCustomerDashboard(customerId || user?.id || '');
  const { updatePreferenceByPartyId } = usePreferenceMutation();
  const { updateConsent, revokeConsent } = useConsentMutation();
  
  const [activeTab, setActiveTab] = useState<'consents' | 'preferences' | 'dsar' | 'profile'>('consents');
  const [showConnectionAlert, setShowConnectionAlert] = useState(true);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">ConsentHub</h1>
          <p className="text-gray-600 mb-4">Please log in to access your privacy dashboard.</p>
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
            Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-md w-full">
          <h2 className="text-red-800 font-semibold mb-2">Error Loading Dashboard</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={refetch}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const handleConsentToggle = async (consentId: string, currentStatus: string) => {
    try {
      if (currentStatus === 'granted') {
        await revokeConsent(consentId, 'User revoked consent');
      } else {
        await updateConsent(consentId, { status: 'granted' });
      }
      refetch();
    } catch (error) {
      console.error('Error updating consent:', error);
    }
  };

  const handlePreferenceUpdate = async (updates: any) => {
    try {
      await updatePreferenceByPartyId(dashboardData?.profile.id || '', updates);
      refetch();
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const handleDSARRequest = async (type: 'data_export' | 'data_deletion') => {
    try {
      await dsarService.createDSARRequest({
        partyId: dashboardData?.profile.id || '',
        type,
        description: `${type === 'data_export' ? 'Data export' : 'Data deletion'} request from customer portal`
      });
      refetch();
    } catch (error) {
      console.error('Error creating DSAR request:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Server Connection Alert */}
      {showConnectionAlert && (
        <ServerConnectionAlert 
          onClose={() => setShowConnectionAlert(false)}
          autoHide={true}
          autoHideDelay={4000}
        />
      )}

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">ConsentHub</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome, {dashboardData?.profile.name}</span>
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { key: 'consents', label: 'Consents', icon: Shield },
              { key: 'preferences', label: 'Preferences', icon: Bell },
              { key: 'dsar', label: 'Data Rights', icon: FileText },
              { key: 'profile', label: 'Profile', icon: User }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'consents' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Consent Preferences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData?.consents.map((consent) => (
                  <div
                    key={consent.id}
                    className="border rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{consent.purpose}</h3>
                      <p className="text-sm text-gray-500">
                        Status: {consent.status} • Channel: {consent.channel}
                      </p>
                      <p className="text-xs text-gray-400">
                        Granted: {new Date(consent.timestampGranted).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => console.log('Show consent details:', consent.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={consent.status === 'granted'}
                          onChange={() => handleConsentToggle(consent.id, consent.status)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Consent Statistics */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Consent Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {dashboardData?.consentStats.granted || 0}
                  </div>
                  <div className="text-sm text-gray-500">Granted</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {dashboardData?.consentStats.revoked || 0}
                  </div>
                  <div className="text-sm text-gray-500">Revoked</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {dashboardData?.consentStats.pending || 0}
                  </div>
                  <div className="text-sm text-gray-500">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {dashboardData?.consentStats.totalConsents || 0}
                  </div>
                  <div className="text-sm text-gray-500">Total</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Communication Preferences</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Preferred Channels</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(dashboardData?.preferences.preferredChannels || {}).map(([channel, enabled]) => (
                      <label key={channel} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={(e) => handlePreferenceUpdate({
                            preferredChannels: {
                              ...dashboardData?.preferences.preferredChannels,
                              [channel]: e.target.checked
                            }
                          })}
                          className="mr-2"
                        />
                        <span className="capitalize">{channel}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Topic Subscriptions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(dashboardData?.preferences.topicSubscriptions || {}).map(([topic, enabled]) => (
                      <label key={topic} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={(e) => handlePreferenceUpdate({
                            topicSubscriptions: {
                              ...dashboardData?.preferences.topicSubscriptions,
                              [topic]: e.target.checked
                            }
                          })}
                          className="mr-2"
                        />
                        <span className="capitalize">{topic.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dsar' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Subject Rights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Export My Data</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Download a copy of all your personal data we have on file.
                  </p>
                  <button
                    onClick={() => handleDSARRequest('data_export')}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Request Export
                  </button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Delete My Data</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Request permanent deletion of your personal data.
                  </p>
                  <button
                    onClick={() => handleDSARRequest('data_deletion')}
                    className="flex items-center bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Request Deletion
                  </button>
                </div>
              </div>
            </div>
            
            {/* DSAR Request History */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Request History</h3>
              <div className="space-y-2">
                {dashboardData?.dsarRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">{request.type.replace('_', ' ')}</h4>
                      <p className="text-sm text-gray-500">
                        Submitted: {new Date(request.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      request.status === 'completed' ? 'bg-green-100 text-green-800' :
                      request.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={dashboardData?.profile.name || ''}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={dashboardData?.profile.email || ''}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile</label>
                <input
                  type="tel"
                  value={dashboardData?.profile.mobile || ''}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <input
                  type="text"
                  value={dashboardData?.profile.type || ''}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  readOnly
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
