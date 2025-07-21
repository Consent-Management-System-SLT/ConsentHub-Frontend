import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  TrendingUp,
  Activity,
  Shield,
  RefreshCw
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';

interface CSROverviewEnhancedProps {
  className?: string;
  onNavigate?: (section: string) => void;
}

const CSROverviewEnhanced: React.FC<CSROverviewEnhancedProps> = ({ 
  className = '',
  onNavigate 
}) => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    pendingRequests: 0,
    consentUpdates: 0,
    guardiansManaged: 0,
    todayActions: 0,
    riskAlerts: 0
  });
  
  const [insights, setInsights] = useState({
    consentRate: 0,
    resolvedRequests: 0,
    newCustomers: 0
  });
  
  const [quickActions, setQuickActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadDetailedStats();
  }, []);

  const loadDetailedStats = async () => {
    try {
      setLoading(true);
      
      // Fetch data from multiple endpoints with error handling
      const [partiesResponse, consentsResponse, dsarResponse, eventsResponse] = await Promise.all([
        apiClient.get('/api/v1/party').catch(() => ({ data: [] })),
        apiClient.get('/api/v1/consent').catch(() => ({ data: [] })),
        apiClient.get('/api/v1/dsar').catch(() => ({ data: [] })),
        apiClient.get('/api/v1/event').catch(() => ({ data: [] }))
      ]);

      // Ensure all data is arrays with safe extraction
      const parties = Array.isArray(partiesResponse.data) ? partiesResponse.data : [];
      const consents = Array.isArray(consentsResponse.data) ? consentsResponse.data : [];
      const dsarRequests = Array.isArray(dsarResponse.data) ? dsarResponse.data : [];
      const events = Array.isArray(eventsResponse.data) ? eventsResponse.data : [];

      // Calculate comprehensive statistics
      const totalCustomers = parties.length;
      const pendingRequests = dsarRequests.filter((req: any) => req.status === 'pending').length;
      const grantedConsents = consents.filter((consent: any) => consent.status === 'granted').length;
      
      // Calculate today's actions safely
      const todayEvents = events.filter((event: any) => {
        try {
          const eventDate = new Date(event.createdAt);
          const today = new Date();
          return eventDate.toDateString() === today.toDateString();
        } catch {
          return false;
        }
      }).length;

      // Calculate risk alerts (pending requests older than 25 days)
      const riskAlerts = dsarRequests.filter((req: any) => {
        try {
          return req.status === 'pending' && 
            new Date(req.submittedAt) < new Date(Date.now() - 25 * 24 * 60 * 60 * 1000);
        } catch {
          return false;
        }
      }).length;

      setStats({
        totalCustomers,
        pendingRequests,
        consentUpdates: grantedConsents,
        guardiansManaged: parties.filter((p: any) => p.type === 'guardian').length,
        todayActions: todayEvents,
        riskAlerts
      });

      // Calculate insights
      const totalConsents = consents.length;
      const consentRate = totalConsents > 0 ? Math.round((grantedConsents / totalConsents) * 100) : 0;
      const resolvedRequests = dsarRequests.filter((req: any) => req.status === 'completed').length;
      
      const newCustomersCount = parties.filter((party: any) => {
        try {
          const createdDate = new Date(party.createdAt);
          const today = new Date();
          return createdDate.toDateString() === today.toDateString();
        } catch {
          return false;
        }
      }).length;

      setInsights({
        consentRate,
        resolvedRequests,
        newCustomers: newCustomersCount
      });

      await loadQuickActions();

    } catch (error) {
      console.error('Error loading detailed stats:', error);
      // Keep default values if API fails
    } finally {
      setLoading(false);
    }
  };

  const loadQuickActions = async () => {
    try {
      // Generate quick actions based on current data state
      const actions = [
        {
          id: 1,
          title: 'Review Pending DSAR Requests',
          description: `${stats.pendingRequests} requests awaiting review`,
          priority: stats.pendingRequests > 5 ? 'high' : 'medium',
          action: () => onNavigate?.('dsar'),
          icon: FileText
        },
        {
          id: 2,
          title: 'Update Customer Preferences',
          description: 'Manage communication preferences',
          priority: 'medium',
          action: () => onNavigate?.('preferences'),
          icon: Shield
        },
        {
          id: 3,
          title: 'Review Risk Alerts',
          description: `${stats.riskAlerts} overdue requests require attention`,
          priority: stats.riskAlerts > 0 ? 'high' : 'low',
          action: () => onNavigate?.('audit'),
          icon: AlertTriangle
        },
        {
          id: 4,
          title: 'Search Customers',
          description: 'Find and manage customer records',
          priority: 'low',
          action: () => onNavigate?.('search'),
          icon: Users
        }
      ];

      setQuickActions(actions);
    } catch (error) {
      console.error('Error loading quick actions:', error);
      setQuickActions([]);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDetailedStats();
    setIsRefreshing(false);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CSR overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CSR Dashboard</h1>
          <p className="text-gray-600 mt-2">Customer Service Representative Overview</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { key: 'customers', label: 'Total Customers', value: stats.totalCustomers, type: 'customers', icon: Users, color: 'blue' },
          { key: 'requests', label: 'Pending DSAR Requests', value: stats.pendingRequests, type: 'requests', icon: FileText, color: 'amber' },
          { key: 'consents', label: 'Consent Updates', value: stats.consentUpdates, type: 'consents', icon: Shield, color: 'green' },
          { key: 'guardians', label: 'Guardians Managed', value: stats.guardiansManaged, type: 'guardians', icon: Users, color: 'purple' },
          { key: 'actions', label: 'Today\'s Actions', value: stats.todayActions, type: 'actions', icon: Activity, color: 'indigo' },
          { key: 'alerts', label: 'Risk Alerts', value: stats.riskAlerts, type: 'alerts', icon: AlertTriangle, color: 'red' }
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.key} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  {stat.key === 'requests' && stat.value > 5 && (
                    <p className="text-xs text-red-600 mt-1">Needs attention</p>
                  )}
                  {stat.key === 'alerts' && stat.value > 0 && (
                    <p className="text-xs text-red-600 mt-1">Active alerts</p>
                  )}
                </div>
                <div className={`p-3 bg-${stat.color}-100 rounded-full`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Key Insights */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Key Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <div className="text-3xl font-bold text-green-600 mb-1">{insights.consentRate}%</div>
            <div className="text-sm text-gray-600">Consent Grant Rate</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="text-3xl font-bold text-blue-600 mb-1">{insights.resolvedRequests}</div>
            <div className="text-sm text-gray-600">Resolved DSAR Requests</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <div className="text-3xl font-bold text-purple-600 mb-1">{insights.newCustomers}</div>
            <div className="text-sm text-gray-600">New Customers Today</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                onClick={action.action}
                className={`p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md ${
                  action.priority === 'high' 
                    ? 'border-red-200 bg-red-50 hover:border-red-300' 
                    : action.priority === 'medium'
                    ? 'border-amber-200 bg-amber-50 hover:border-amber-300'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    action.priority === 'high' ? 'bg-red-100' :
                    action.priority === 'medium' ? 'bg-amber-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      action.priority === 'high' ? 'text-red-600' :
                      action.priority === 'medium' ? 'text-amber-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{action.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                  </div>
                  {action.priority === 'high' && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                      Urgent
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CSROverviewEnhanced;
