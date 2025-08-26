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
        return <Mail className="w-5 h-5 text-myslt-info" />;
      case 'Privacy':
        return <Shield className="w-5 h-5 text-myslt-success" />;
      case 'Security':
        return <Lock className="w-5 h-5 text-myslt-danger" />;
      case 'Personalization':
        return <Users className="w-5 h-5 text-myslt-accent" />;
      default:
        return <Settings className="w-5 h-5 text-myslt-text-secondary" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Communications':
        return 'bg-myslt-info/20 text-myslt-info border-myslt-info/30';
      case 'Privacy':
        return 'bg-myslt-success/20 text-myslt-success border-myslt-success/30';
      case 'Security':
        return 'bg-myslt-danger/20 text-myslt-danger border-myslt-danger/30';
      case 'Personalization':
        return 'bg-myslt-accent/20 text-myslt-accent border-myslt-accent/30';
      default:
        return 'bg-myslt-muted/20 text-myslt-text-secondary border-myslt-border';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="myslt-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-myslt-text-primary">Preference Management</h1>
            <p className="text-myslt-text-secondary mt-2">View and manage customer preferences</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="myslt-btn-primary px-4 py-2 flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm font-medium">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="myslt-card p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-myslt-text-secondary">Total Preferences</p>
              <p className="text-xl sm:text-2xl font-bold text-myslt-accent">{preferences.length}</p>
            </div>
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-myslt-accent/20 rounded-xl flex items-center justify-center">
              <Settings className="w-5 sm:w-6 h-5 sm:h-6 text-myslt-accent" />
            </div>
          </div>
        </div>
        
        <div className="myslt-card p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-myslt-text-secondary">Active Preferences</p>
              <p className="text-xl sm:text-2xl font-bold text-myslt-success">
                {preferences.filter(p => p.enabled).length}
              </p>
            </div>
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-myslt-success/20 rounded-xl flex items-center justify-center">
              <Bell className="w-5 sm:w-6 h-5 sm:h-6 text-myslt-success" />
            </div>
          </div>
        </div>
        
        <div className="myslt-card p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-myslt-text-secondary">Total Users</p>
              <p className="text-xl sm:text-2xl font-bold text-myslt-text-primary">
                {preferences.reduce((sum, p) => sum + p.users, 0).toLocaleString()}
              </p>
            </div>
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-myslt-text-primary/20 rounded-xl flex items-center justify-center">
              <Users className="w-5 sm:w-6 h-5 sm:h-6 text-myslt-text-primary" />
            </div>
          </div>
        </div>
        
        <div className="myslt-card p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-myslt-text-secondary">Categories</p>
              <p className="text-xl sm:text-2xl font-bold text-myslt-info">
                {[...new Set(preferences.map(p => p.category))].length}
              </p>
            </div>
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-myslt-info/20 rounded-xl flex items-center justify-center">
              <Globe className="w-5 sm:w-6 h-5 sm:h-6 text-myslt-info" />
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Table */}
      <div className="myslt-card overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-myslt-border">
          <h3 className="text-lg font-semibold text-myslt-text-primary">Customer Preferences</h3>
          <p className="text-sm text-myslt-text-secondary mt-1">Manage system-wide preference settings and user adoption</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-myslt-muted/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-myslt-text-muted uppercase tracking-wider">
                  Preference
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-myslt-text-muted uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-myslt-text-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-myslt-text-muted uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-myslt-text-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-myslt-card divide-y divide-myslt-border">
              {preferences.map((preference, index) => (
                <tr key={preference.id} className={`${index % 2 === 0 ? 'bg-myslt-card' : 'bg-myslt-muted/5'} hover:bg-myslt-muted/10 transition-colors`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-myslt-muted/20 rounded-xl flex items-center justify-center mr-4">
                        {getCategoryIcon(preference.category)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-myslt-text-primary">{preference.name}</div>
                        <div className="text-sm text-myslt-text-secondary">{preference.description}</div>
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
                        ? 'bg-myslt-success/20 text-myslt-success border-myslt-success/30' 
                        : 'bg-myslt-muted/20 text-myslt-text-secondary border-myslt-border'
                    }`}>
                      {preference.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-myslt-text-primary">
                    {preference.users.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-myslt-accent hover:text-myslt-accent p-1 hover:bg-myslt-accent/10 rounded transition-colors">
                        <Database className="w-4 h-4" />
                      </button>
                      <button className="text-myslt-text-secondary hover:text-myslt-text-primary p-1 hover:bg-myslt-muted/20 rounded transition-colors">
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
