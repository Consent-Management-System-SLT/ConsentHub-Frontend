import React from 'react';
import { Settings, Shield, Database, Users, Bell, Mail, Globe, Lock, RefreshCw } from 'lucide-react';

const PreferenceManager: React.FC = () => {
  const preferences = [
    { id: 1, category: 'Communications', name: 'Email Notifications', description: 'Receive email notifications for important updates', enabled: true, users: 1247 },
    { id: 2, category: 'Communications', name: 'SMS Notifications', description: 'Receive SMS notifications for urgent matters', enabled: false, users: 892 },
    { id: 3, category: 'Privacy', name: 'Data Analytics', description: 'Allow data to be used for analytics and insights', enabled: true, users: 2156 },
    { id: 4, category: 'Privacy', name: 'Third-party Sharing', description: 'Share data with trusted third-party partners', enabled: false, users: 456 },
    { id: 5, category: 'Security', name: 'Two-factor Authentication', description: 'Enable two-factor authentication for enhanced security', enabled: true, users: 1834 },
    { id: 6, category: 'Personalization', name: 'Content Personalization', description: 'Personalize content based on user preferences', enabled: true, users: 1923 }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Communications':
        return <Mail className="w-5 h-5 text-blue-600" />;
      case 'Privacy':
        return <Shield className="w-5 h-5 text-green-600" />;
      case 'Security':
        return <Lock className="w-5 h-5 text-red-600" />;
      case 'Personalization':
        return <Users className="w-5 h-5 text-purple-600" />;
      default:
        return <Settings className="w-5 h-5 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Communications':
        return 'bg-blue-100 text-blue-800';
      case 'Privacy':
        return 'bg-green-100 text-green-800';
      case 'Security':
        return 'bg-red-100 text-red-800';
      case 'Personalization':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-myslt-service-card text-myslt-text-secondary';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Preference Management</h1>
          <p className="text-gray-600 mt-2">View and manage customer preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-myslt-card-solid rounded-xl shadow-sm border border-myslt-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-myslt-text-secondary">Total Preferences</p>
              <p className="text-2xl font-bold text-blue-600">{preferences.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-myslt-card-solid rounded-xl shadow-sm border border-myslt-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-myslt-text-secondary">Active Preferences</p>
              <p className="text-2xl font-bold text-green-600">
                {preferences.filter(p => p.enabled).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-myslt-card-solid rounded-xl shadow-sm border border-myslt-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-myslt-text-secondary">Total Users</p>
              <p className="text-2xl font-bold text-purple-600">
                {preferences.reduce((sum, p) => sum + p.users, 0).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-myslt-card-solid rounded-xl shadow-sm border border-myslt-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-myslt-text-secondary">Categories</p>
              <p className="text-2xl font-bold text-orange-600">
                {[...new Set(preferences.map(p => p.category))].length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Preferences List */}
      <div className="bg-myslt-card-solid rounded-xl shadow-sm border border-myslt-border overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Customer Preferences</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-myslt-service-card">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preference
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-myslt-card-solid divide-y divide-myslt-border">
              {preferences.map((preference) => (
                <tr key={preference.id} className="hover:bg-myslt-service-card">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-myslt-service-card rounded-xl flex items-center justify-center mr-4">
                        {getCategoryIcon(preference.category)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{preference.name}</div>
                        <div className="text-sm text-gray-500">{preference.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(preference.category)}`}>
                      {preference.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      preference.enabled ? 'bg-green-100 text-green-800' : 'bg-myslt-service-card text-myslt-text-secondary'
                    }`}>
                      {preference.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {preference.users.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded">
                        <Database className="w-4 h-4" />
                      </button>
                      <button className="text-myslt-text-secondary hover:text-myslt-text-primary p-1 hover:bg-myslt-service-card rounded">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PreferenceManager;
