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
        return <Users className="w-5 h-5 text-blue-600" />;
      default:
        return <Settings className="w-5 h-5 text-slate-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Communications':
        return 'bg-blue-600/20 text-blue-600 border-slate-200/30';
      case 'Privacy':
        return 'bg-green-600/20 text-green-600 border-green-200/30';
      case 'Security':
        return 'bg-red-50 text-red-600 border-red-200';
      case 'Personalization':
        return 'bg-blue-50/20 text-blue-600 border-slate-200';
      default:
        return 'bg-slate-50/20 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Preference Management</h1>
            <p className="text-slate-600 mt-2">View and manage customer preferences</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 px-4 py-2 flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm font-medium">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-600">Total Preferences</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{preferences.length}</p>
            </div>
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-50/20 rounded-xl flex items-center justify-center">
              <Settings className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-600">Active Preferences</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                {preferences.filter(p => p.enabled).length}
              </p>
            </div>
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
              <Bell className="w-5 sm:w-6 h-5 sm:h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-600">Total Users</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900">
                {preferences.reduce((sum, p) => sum + p.users, 0).toLocaleString()}
              </p>
            </div>
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-text-slate-500-primary/20 rounded-xl flex items-center justify-center">
              <Users className="w-5 sm:w-6 h-5 sm:h-6 text-slate-900" />
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-600">Categories</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">
                {[...new Set(preferences.map(p => p.category))].length}
              </p>
            </div>
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
              <Globe className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Customer Preferences</h3>
          <p className="text-sm text-slate-600 mt-1">Manage system-wide preference settings and user adoption</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Preference
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white border border-slate-200 rounded-xl shadow-sm divide-y divide-myslt-border">
              {preferences.map((preference, index) => (
                <tr key={preference.id} className={`${index % 2 === 0 ? 'bg-white border border-slate-200 rounded-xl shadow-sm' : 'bg-slate-50'} hover:bg-slate-50 transition-colors`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-slate-50/20 rounded-xl flex items-center justify-center mr-4">
                        {getCategoryIcon(preference.category)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">{preference.name}</div>
                        <div className="text-sm text-slate-600">{preference.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(preference.category)}`}>
                      {preference.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      preference.enabled 
                        ? 'bg-green-600/20 text-green-600 border-green-200/30' 
                        : 'bg-slate-50/20 text-slate-600 border-slate-200'
                    }`}>
                      {preference.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {preference.users.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-600 p-1 hover:bg-blue-50/10 rounded transition-colors">
                        <Database className="w-4 h-4" />
                      </button>
                      <button className="text-slate-600 hover:text-slate-900 p-1 hover:bg-slate-50/20 rounded transition-colors">
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
