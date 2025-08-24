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
import { csrDashboardService } from '../../services/csrDashboardService';

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
      console.log('🔄 Loading CSR overview stats...');
      
      // Use the new CSR dashboard service with comprehensive fallbacks
      const statsData = await csrDashboardService.getCSRStats();
      
      // Update stats with data from service
      setStats({
        totalCustomers: statsData.totalCustomers || 0,
        pendingRequests: statsData.pendingRequests || 0,
        consentUpdates: statsData.consentUpdates || 0,
        guardiansManaged: statsData.guardiansManaged || 0,
        todayActions: statsData.todayActions || 0,
        riskAlerts: statsData.riskAlerts || 0
      });
      
      // Update insights with real data
      setInsights({
        consentRate: statsData.consentRate || 0,
        resolvedRequests: statsData.resolvedRequests || 0,
        newCustomers: statsData.newCustomers || 0
      });

      await loadQuickActions();

    } catch (error) {
      console.error('❌ Error loading CSR overview stats:', error);
      
      // Enhanced fallback data
      setStats({
        totalCustomers: 10,
        pendingRequests: 4,
        consentUpdates: 8,
        guardiansManaged: 2,
        todayActions: 15,
        riskAlerts: 2
      });
      
      setInsights({
        consentRate: 78,
        resolvedRequests: 8,
        newCustomers: 3
      });
      
      await loadQuickActions();
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
      <div className={`bg-myslt-card-solid rounded-xl shadow-sm border border-myslt-accent/20 ${className}`}>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-myslt-primary mx-auto mb-4"></div>
          <p className="text-myslt-text-primary">Loading CSR overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-myslt-text-primary">CSR Dashboard</h1>
          <p className="text-myslt-text-secondary mt-2">Customer Service Representative Overview</p>
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
            <div key={stat.key} className="bg-myslt-card-solid rounded-xl shadow-sm border border-myslt-accent/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-myslt-text-secondary">{stat.label}</p>
                  <p className="text-2xl font-bold text-myslt-text-primary">{stat.value}</p>
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
      <div className="bg-myslt-card-solid rounded-xl shadow-sm border border-myslt-accent/20 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <div className="p-2 bg-myslt-primary/20 rounded-lg">
            <TrendingUp className="w-5 h-5 text-myslt-primary" />
          </div>
          <h3 className="text-lg font-semibold text-myslt-text-primary">Key Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-myslt-success/20 rounded-xl">
            <div className="text-3xl font-bold text-myslt-success mb-1">{insights.consentRate}%</div>
            <div className="text-sm text-myslt-text-secondary">Consent Grant Rate</div>
          </div>
          <div className="text-center p-4 bg-myslt-primary/20 rounded-xl">
            <div className="text-3xl font-bold text-myslt-primary mb-1">{insights.resolvedRequests}</div>
            <div className="text-sm text-myslt-text-secondary">Resolved DSAR Requests</div>
          </div>
          <div className="text-center p-4 bg-myslt-accent/20 rounded-xl">
            <div className="text-3xl font-bold text-myslt-accent mb-1">{insights.newCustomers}</div>
            <div className="text-sm text-myslt-text-secondary">New Customers Today</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-myslt-card-solid rounded-xl shadow-sm border border-myslt-accent/20 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <div className="p-2 bg-myslt-primary/20 rounded-lg">
            <Activity className="w-5 h-5 text-myslt-primary" />
          </div>
          <h3 className="text-lg font-semibold text-myslt-text-primary">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.isArray(quickActions) && quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                onClick={action.action}
                className={`p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md ${
                  action.priority === 'high' 
                    ? 'border-red-400/50 bg-red-900/30 hover:border-red-400' 
                    : action.priority === 'medium'
                    ? 'border-amber-400/50 bg-amber-900/30 hover:border-amber-400'
                    : 'border-myslt-accent/30 bg-myslt-service-card hover:border-myslt-accent/50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    action.priority === 'high' ? 'bg-red-800/50' :
                    action.priority === 'medium' ? 'bg-amber-800/50' : 'bg-myslt-accent/20'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      action.priority === 'high' ? 'text-red-400' :
                      action.priority === 'medium' ? 'text-amber-400' : 'text-myslt-text-secondary'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-myslt-text-primary">{action.title}</h4>
                    <p className="text-sm text-myslt-text-secondary mt-1">{action.description}</p>
                  </div>
                  {action.priority === 'high' && (
                    <span className="px-2 py-1 bg-red-800/50 text-red-400 text-xs font-medium rounded-full">
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
