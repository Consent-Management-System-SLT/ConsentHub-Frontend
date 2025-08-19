import React from 'react';
import { Webhook, Plus, Settings, Activity, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const EventListenerManager: React.FC = () => {
  const webhooks = [
    { id: 1, name: 'Consent Change Webhook', url: 'https://api.example.com/webhooks/consent', status: 'active', events: ['consent.granted', 'consent.withdrawn'] },
    { id: 2, name: 'DSAR Request Webhook', url: 'https://api.example.com/webhooks/dsar', status: 'active', events: ['dsar.created', 'dsar.completed'] },
    { id: 3, name: 'Privacy Notice Webhook', url: 'https://api.example.com/webhooks/privacy', status: 'inactive', events: ['privacy.updated'] }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-myslt-text-primary">Event Listeners</h1>
          <p className="text-myslt-text-secondary mt-2">Manage webhooks and event notifications</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add Webhook</span>
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {webhooks.map((webhook) => (
          <div key={webhook.id} className="bg-myslt-card-solid rounded-xl shadow-sm border border-myslt-border p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Webhook className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex items-center space-x-2">
                {webhook.status === 'active' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  webhook.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {webhook.status}
                </span>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-myslt-text-primary mb-2">{webhook.name}</h3>
            <p className="text-sm text-myslt-text-secondary mb-4 break-all">{webhook.url}</p>
            
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Events:</p>
              <div className="flex flex-wrap gap-1">
                {webhook.events.map((event, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {event}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                <Activity className="w-4 h-4" />
                <span className="text-sm">Test</span>
              </button>
              <button className="p-2 text-myslt-text-secondary hover:text-myslt-text-primary hover:bg-myslt-service-card rounded-lg transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventListenerManager;
