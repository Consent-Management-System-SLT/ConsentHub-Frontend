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

// Helper functions
const calculateAverageResponseTime = (dsarRequests: any[]): string => {
  if (!dsarRequests.length) return '0 days';
  
  const completedRequests = dsarRequests.filter(r => r.completedAt && r.submittedAt);
  if (!completedRequests.length) return 'N/A';
  
  const totalDays = completedRequests.reduce((sum, req) => {
    const submitted = new Date(req.submittedAt);
    const completed = new Date(req.completedAt);
    return sum + Math.floor((completed.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24));
  }, 0);
  
  return `${Math.round(totalDays / completedRequests.length)} days`;
};

const calculateComplianceRate = (dsarRequests: any[]): number => {
  if (!dsarRequests.length) return 100;
  
  const onTimeRequests = dsarRequests.filter(req => {
    const submitted = new Date(req.submittedAt || req.createdAt);
    const daysSince = (Date.now() - submitted.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 30 || req.status === 'completed';
  });
  
  return Math.round((onTimeRequests.length / dsarRequests.length) * 100);
};

const generateQuickActions = (dashboardData: any, onNavigate?: (section: string) => void) => {
  const actions = [];
  
  // High priority: Overdue DSAR requests
  const overdueRequests = dashboardData.dsarRequests?.filter((req: any) => {
    const submitted = new Date(req.submittedAt || req.createdAt);
    const daysSince = (Date.now() - submitted.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince > 25 && req.status !== 'completed';
  }) || [];
  
  if (overdueRequests.length > 0) {
    actions.push({
      id: 'overdue-dsar',
      title: 'Critical: Overdue DSAR Requests',
      description: `${overdueRequests.length} requests are overdue (>25 days)`,
      priority: 'high',
      action: () => onNavigate?.('dsar'),
      icon: AlertTriangle
    });
  }
  
  // Medium priority: Pending requests
  if (dashboardData.stats.pendingRequests > 0) {
    actions.push({
      id: 'pending-dsar',
      title: 'Review Pending DSAR Requests',
      description: `${dashboardData.stats.pendingRequests} requests awaiting review`,
      priority: dashboardData.stats.pendingRequests > 5 ? 'high' : 'medium',
      action: () => onNavigate?.('dsar'),
      icon: FileText
    });
  }
  
  // Recent consent changes
  const recentConsents = dashboardData.consents?.filter((c: any) => {
    const granted = new Date(c.grantedAt || c.createdAt);
    const daysSince = (Date.now() - granted.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 7;
  }) || [];
  
  if (recentConsents.length > 0) {
    actions.push({
      id: 'recent-consents',
      title: 'Review Recent Consent Changes',
      description: `${recentConsents.length} consent updates this week`,
      priority: 'medium',
      action: () => onNavigate?.('consents'),
      icon: Shield
    });
  }
  
  // Guardian management
  if (dashboardData.stats.guardiansManaged > 0) {
    actions.push({
      id: 'guardians',
      title: 'Guardian Account Review',
      description: `${dashboardData.stats.guardiansManaged} guardian accounts to review`,
      priority: 'low',
      action: () => onNavigate?.('guardians'),
      icon: Users
    });
  }
  
  return actions;
};

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
      console.log('🔄 Loading detailed CSR dashboard stats...');
      
      // Load comprehensive dashboard data
      const dashboardData = await csrDashboardService.getComprehensiveDashboardData();
      
      console.log('📊 Dashboard data loaded:', {
        statsKeys: Object.keys(dashboardData.stats),
        customersCount: dashboardData.customers?.length,
        consentsCount: dashboardData.consents?.length,
        dsarCount: dashboardData.dsarRequests?.length,
        eventsCount: dashboardData.auditEvents?.length,
        offlineMode: dashboardData.offlineMode
      });

      // Calculate enhanced statistics from real data
      const enhancedStats = {
        ...dashboardData.stats,
        activeConsents: dashboardData.consents?.filter(c => c.status === 'granted').length || 0,
        withdrawnConsents: dashboardData.consents?.filter(c => c.status === 'denied' || c.status === 'withdrawn').length || 0,
        completedRequests: dashboardData.dsarRequests?.filter(r => r.status === 'completed').length || 0,
        averageResponseTime: calculateAverageResponseTime(dashboardData.dsarRequests || []),
        complianceRate: calculateComplianceRate(dashboardData.dsarRequests || []),
        dataBreaches: dashboardData.auditEvents?.filter(e => 
          e.eventType?.toLowerCase().includes('breach') || 
          e.eventType?.toLowerCase().includes('violation') ||
          e.severity === 'critical'
        ).length || 0
      };

      setStats(enhancedStats);
      
      // Calculate insights from real data
      const realInsights = {
        consentRate: enhancedStats.consentRate || Math.round(
          (enhancedStats.activeConsents / Math.max(1, enhancedStats.activeConsents + enhancedStats.withdrawnConsents)) * 100
        ),
        resolvedRequests: enhancedStats.completedRequests || enhancedStats.resolvedRequests || 0,
        newCustomers: dashboardData.customers?.filter(c => {
          const created = new Date(c.createdAt);
          const daysSince = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
          return daysSince <= 1;
        }).length || enhancedStats.newCustomers || 0
      };
      
      setInsights(realInsights);
      
      // Generate intelligent quick actions based on real data
      const intelligentActions = generateQuickActions(dashboardData, onNavigate);
      setQuickActions(intelligentActions);
      
      // Show data status
      if (dashboardData.offlineMode) {
        console.log('⚠️ Running in offline mode with fallback data');
      } else {
        console.log('✅ Using real data from backend APIs');
      }
      
    } catch (error) {
      console.error('❌ Error loading CSR dashboard data:', error);
      
      // Load fallback stats if there's an error
      setStats({
        totalCustomers: 0,
        pendingRequests: 0,
        consentUpdates: 0,
        guardiansManaged: 0,
        todayActions: 0,
        riskAlerts: 0
      });
      
      setInsights({
        consentRate: 0,
        resolvedRequests: 0,
        newCustomers: 0
      });
      
      setQuickActions([]);
    } finally {
      setLoading(false);
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
    <div className={`space-y-4 sm:space-y-6 max-w-full overflow-x-hidden ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-myslt-text-primary truncate">CSR Dashboard</h1>
          <p className="text-myslt-text-secondary mt-1 text-sm sm:text-base">Customer Service Representative Overview</p>
        </div>
        <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
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
            <div key={stat.key} className="bg-myslt-card-solid rounded-lg sm:rounded-xl shadow-sm border border-myslt-accent/20 p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1 pr-3">
                  <p className="text-xs sm:text-sm font-medium text-myslt-text-secondary line-clamp-2">{stat.label}</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-myslt-text-primary">{stat.value}</p>
                  {stat.key === 'requests' && stat.value > 5 && (
                    <p className="text-xs text-red-600 mt-1">Needs attention</p>
                  )}
                  {stat.key === 'alerts' && stat.value > 0 && (
                    <p className="text-xs text-red-600 mt-1">Active alerts</p>
                  )}
                </div>
                <div className={`p-2 sm:p-3 bg-${stat.color}-100 rounded-full shrink-0`}>
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Key Insights */}
      <div className="bg-myslt-card-solid rounded-lg sm:rounded-xl shadow-sm border border-myslt-accent/20 p-3 sm:p-4 lg:p-6">
        <div className="flex items-center space-x-2 mb-3 sm:mb-4 lg:mb-6">
          <div className="p-1.5 sm:p-2 bg-myslt-primary/20 rounded-lg">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-myslt-primary" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-myslt-text-primary">Key Insights</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <div className="text-center p-3 sm:p-4 bg-myslt-success/20 rounded-lg sm:rounded-xl">
            <div className="text-2xl sm:text-3xl font-bold text-myslt-success mb-1">{insights.consentRate}%</div>
            <div className="text-xs sm:text-sm text-myslt-text-secondary">Consent Grant Rate</div>
          </div>
          <div className="text-center p-3 sm:p-4 bg-myslt-primary/20 rounded-lg sm:rounded-xl">
            <div className="text-2xl sm:text-3xl font-bold text-myslt-primary mb-1">{insights.resolvedRequests}</div>
            <div className="text-xs sm:text-sm text-myslt-text-secondary">Resolved DSAR Requests</div>
          </div>
          <div className="text-center p-3 sm:p-4 bg-myslt-accent/20 rounded-lg sm:rounded-xl">
            <div className="text-2xl sm:text-3xl font-bold text-myslt-accent mb-1">{insights.newCustomers}</div>
            <div className="text-xs sm:text-sm text-myslt-text-secondary">New Customers Today</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-myslt-card-solid rounded-lg sm:rounded-xl shadow-sm border border-myslt-accent/20 p-3 sm:p-4 lg:p-6">
        <div className="flex items-center space-x-2 mb-3 sm:mb-4 lg:mb-6">
          <div className="p-1.5 sm:p-2 bg-myslt-primary/20 rounded-lg">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-myslt-primary" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-myslt-text-primary">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {Array.isArray(quickActions) && quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                onClick={action.action}
                className={`p-3 sm:p-4 border rounded-lg sm:rounded-xl cursor-pointer transition-all hover:shadow-md ${
                  action.priority === 'high' 
                    ? 'border-red-400/50 bg-red-900/30 hover:border-red-400' 
                    : action.priority === 'medium'
                    ? 'border-amber-400/50 bg-amber-900/30 hover:border-amber-400'
                    : 'border-myslt-accent/30 bg-myslt-service-card hover:border-myslt-accent/50'
                }`}
              >
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className={`p-1.5 sm:p-2 rounded-lg shrink-0 ${
                    action.priority === 'high' ? 'bg-red-800/50' :
                    action.priority === 'medium' ? 'bg-amber-800/50' : 'bg-myslt-accent/20'
                  }`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${
                      action.priority === 'high' ? 'text-red-400' :
                      action.priority === 'medium' ? 'text-amber-400' : 'text-myslt-text-secondary'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="font-medium text-myslt-text-primary text-sm sm:text-base line-clamp-2">{action.title}</h4>
                    <p className="text-xs sm:text-sm text-myslt-text-secondary mt-1 line-clamp-2">{action.description}</p>
                  </div>
                  {action.priority === 'high' && (
                    <span className="px-2 py-1 bg-red-800/50 text-red-400 text-xs font-medium rounded-full whitespace-nowrap shrink-0">
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
