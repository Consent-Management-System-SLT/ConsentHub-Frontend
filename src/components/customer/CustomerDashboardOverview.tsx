import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Shield, 
  Settings, 
  FileText, 
  Download,
  User,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { customerDashboardService, DashboardOverview } from '../../services/customerDashboardService';
import UserProfile from '../UserProfile';

interface CustomerDashboardOverviewProps {
  customerName: string;
  showProfile?: boolean;
  setShowProfile?: (open: boolean) => void;
}

interface ConsentSummary {
  granted: number;
  revoked: number;
  expired: number;
  pending: number;
}

interface QuickStat {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}

interface Activity {
  id: string | number;
  action: string;
  timestamp: string;
  type: string;
  icon?: React.ReactNode;
  description?: string;
}

const CustomerDashboardOverview: React.FC<CustomerDashboardOverviewProps> = ({ customerName, showProfile, setShowProfile }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    console.log('CustomerDashboardOverview: Component mounted, loading dashboard data...');
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log('CustomerDashboardOverview: Starting to load dashboard data...');
      setIsLoading(true);
      const data = await customerDashboardService.getDashboardOverview();
      console.log('CustomerDashboardOverview: Dashboard data received:', data);
      setDashboardData(data);
    } catch (error) {
      console.error('CustomerDashboardOverview: Failed to load dashboard data:', error);
      // Use fallback data
      setDashboardData(null);
    } finally {
      setIsLoading(false);
      console.log('CustomerDashboardOverview: Loading complete, isLoading set to false');
    }
  };

  // Use real data if available, otherwise use fallback data
  const consentSummary = dashboardData?.consentStats || {
    granted: dashboardData?.activeConsents || 0,
    revoked: 0,
    expired: 0,
    pending: 0
  };

  const currentCustomerName = dashboardData?.userProfile?.name || user?.name || customerName;

  const quickStats: QuickStat[] = [
    {
      label: t('customerDashboard.overview.activeConsents'),
      value: String(dashboardData?.activeConsents || 0),
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'text-green-600 bg-green-50 border-green-200',
      trend: t('customerDashboard.overview.monthlyTrend', { count: dashboardData?.activeConsents || 0 })
    },
    {
      label: t('customerDashboard.overview.communicationChannels'),
      value: String(dashboardData?.activePreferences || 0),
      icon: <Settings className="w-6 h-6" />,
      color: 'text-myslt-primary bg-myslt-service-card border-myslt-primary/30',
      trend: t('customerDashboard.overview.channelTypes')
    },
    {
      label: t('customerDashboard.overview.privacyNotices'),
      value: String(dashboardData?.totalPrivacyNotices || 0),
      icon: <FileText className="w-6 h-6" />,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      trend: t('customerDashboard.overview.pendingReviewCount', { count: dashboardData?.acknowledgedPrivacyNotices || 0 })
    },
    {
      label: t('customerDashboard.overview.dsarRequests'),
      value: String(dashboardData?.totalDSARRequests || 0),
      icon: <Download className="w-6 h-6" />,
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      trend: (dashboardData?.pendingDSARRequests || 0) > 0 ? t('customerDashboard.overview.inProgress') : t('customerDashboard.overview.completed')
    }
  ];

  const recentActivity = dashboardData?.recentActivity?.map((activity, index) => ({
    id: activity.id || index,
    action: activity.action || activity.description,
    timestamp: new Date(activity.timestamp).toLocaleDateString(),
    type: activity.type,
    icon: activity.type === 'consent_granted' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
          activity.type === 'profile_updated' ? <User className="w-4 h-4 text-myslt-primary" /> :
          activity.type === 'preference' ? <Settings className="w-4 h-4 text-myslt-primary" /> :
          activity.type === 'privacy' ? <FileText className="w-4 h-4 text-purple-600" /> :
          <Download className="w-4 h-4 text-orange-600" />
  })) || [
    {
      id: 1,
      action: t('customerDashboard.overview.activities.grantedConsent'),
      timestamp: t('customerDashboard.overview.timestamps.hoursAgo', { count: 2 }),
      type: 'consent',
      icon: <CheckCircle className="w-4 h-4 text-green-600" />
    },
    {
      id: 2,
      action: t('customerDashboard.overview.activities.updatedPreferences'),
      timestamp: t('customerDashboard.overview.timestamps.daysAgo', { count: 1 }),
      type: 'preference',
      icon: <Settings className="w-4 h-4 text-myslt-primary" />
    },
    {
      id: 3,
      action: t('customerDashboard.overview.activities.acceptedPolicy'),
      timestamp: t('customerDashboard.overview.timestamps.daysAgo', { count: 3 }),
      type: 'privacy',
      icon: <FileText className="w-4 h-4 text-purple-600" />
    },
    {
      id: 4,
      action: t('customerDashboard.overview.activities.submittedExport'),
      timestamp: t('customerDashboard.overview.timestamps.weeksAgo', { count: 1 }),
      type: 'dsar',
      icon: <Download className="w-4 h-4 text-orange-600" />
    }
  ];

  const quickActions = [
    {
      title: t('customerDashboard.overview.actions.manageConsents'),
      description: t('customerDashboard.overview.actions.manageConsentsDesc'),
      icon: <Shield className="w-8 h-8 text-myslt-primary" />,
      action: 'consent-center',
      color: 'bg-myslt-service-card hover:bg-myslt-card-gradient border-myslt-primary/30'
    },
    {
      title: t('customerDashboard.overview.actions.communicationPrefs'),
      description: t('customerDashboard.overview.actions.communicationPrefsDesc'),
      icon: <Settings className="w-8 h-8 text-myslt-success" />,
      action: 'preferences',
      color: 'bg-myslt-service-card hover:bg-myslt-card-gradient border-myslt-success/30'
    },
    {
      title: t('customerDashboard.overview.actions.privacyNotices'),
      description: t('customerDashboard.overview.actions.privacyNoticesDesc'),
      icon: <FileText className="w-8 h-8 text-myslt-accent" />,
      action: 'privacy-notices',
      color: 'bg-myslt-service-card hover:bg-myslt-card-gradient border-myslt-accent/30'
    },
    {
      title: t('customerDashboard.overview.actions.requestData'),
      description: t('customerDashboard.overview.actions.requestDataDesc'),
      icon: <Download className="w-8 h-8 text-myslt-text-accent" />,
      action: 'dsar-requests',
      color: 'bg-myslt-service-card hover:bg-myslt-card-gradient border-myslt-text-accent/30'
    }
  ];

  const privacyStatusItems = [
    {
      id: 'privacy-policy',
      title: 'Privacy Policy Accepted',
      description: 'Version 2.1 - Current',
      status: 'Active',
      icon: <CheckCircle className="w-5 h-5 text-myslt-success mt-0.5 flex-shrink-0" />,
      bgColor: 'bg-myslt-service-card',
      borderColor: 'border-myslt-success/30',
      textColor: 'text-myslt-text-primary',
      descColor: 'text-myslt-text-secondary',
      statusBg: 'bg-myslt-success/10',
      statusText: 'text-myslt-success'
    },
    {
      id: 'communication-prefs',
      title: 'Communication Preferences',
      description: 'Last updated 1 day ago',
      status: 'Configured',
      icon: <Settings className="w-5 h-5 text-myslt-primary mt-0.5 flex-shrink-0" />,
      bgColor: 'bg-myslt-service-card',
      borderColor: 'border-myslt-primary/30',
      textColor: 'text-myslt-text-primary',
      descColor: 'text-myslt-text-secondary',
      statusBg: 'bg-myslt-primary/10',
      statusText: 'text-myslt-primary'
    },
    {
      id: 'dsar-request',
      title: 'Pending DSAR Request',
      description: 'Data export in progress',
      status: 'Processing',
      icon: <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-900',
      descColor: 'text-yellow-700',
      statusBg: 'bg-yellow-100',
      statusText: 'text-yellow-600'
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 max-w-full overflow-x-hidden">
      {/* Show Profile Section if requested */}
      {showProfile && (
        <UserProfile isOpen={showProfile} onClose={() => setShowProfile && setShowProfile(false)} />
      )}
      
      {/* Welcome Section - SLT Mobitel Style */}
      <div className="bg-gradient-to-r from-myslt-primary via-myslt-secondary to-myslt-primary-dark rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 text-white myslt-card-glow">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 text-white truncate">
              {t('customerDashboard.overview.welcomeBack', { name: currentCustomerName })}!
            </h1>
            <p className="text-blue-100 text-sm sm:text-base lg:text-lg">
              {t('customerDashboard.overview.welcomeDesc')}
            </p>
            {dashboardData?.customer?.lastLogin && (
              <p className="text-blue-200 text-xs sm:text-sm mt-2">
                Last login: {new Date(dashboardData.customer.lastLogin).toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex flex-row space-x-3 items-center justify-between sm:justify-start">
            <button
              onClick={loadDashboardData}
              disabled={isLoading}
              className="bg-myslt-success hover:bg-myslt-success/90 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <div className="flex-shrink-0 sm:hidden lg:block">
              <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-myslt-accent bg-opacity-30 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-6 grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          <div className="bg-myslt-accent bg-opacity-20 rounded-lg p-2 sm:p-3 lg:p-4 backdrop-blur-sm">
            <div className="flex items-center justify-start gap-2 sm:gap-3 mb-1 sm:mb-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex-shrink-0 text-green-200" />
              <span className="font-bold text-lg sm:text-xl lg:text-2xl leading-none">{consentSummary.granted}</span>
            </div>
            <p className="text-xs sm:text-sm text-blue-100 font-medium leading-tight">{t('customerDashboard.overview.activeConsents')}</p>
          </div>
          <div className="bg-myslt-accent bg-opacity-20 rounded-lg p-2 sm:p-3 lg:p-4 backdrop-blur-sm">
            <div className="flex items-center justify-start gap-2 sm:gap-3 mb-1 sm:mb-2">
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex-shrink-0 text-red-200" />
              <span className="font-bold text-lg sm:text-xl lg:text-2xl leading-none">{consentSummary.revoked}</span>
            </div>
            <p className="text-xs sm:text-sm text-blue-100 font-medium leading-tight">{t('customerDashboard.overview.revoked')}</p>
          </div>
          <div className="bg-myslt-accent bg-opacity-20 rounded-lg p-2 sm:p-3 lg:p-4 backdrop-blur-sm">
            <div className="flex items-center justify-start gap-2 sm:gap-3 mb-1 sm:mb-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex-shrink-0 text-yellow-200" />
              <span className="font-bold text-lg sm:text-xl lg:text-2xl leading-none">{consentSummary.expired}</span>
            </div>
            <p className="text-xs sm:text-sm text-blue-100 font-medium leading-tight">{t('customerDashboard.overview.expired')}</p>
          </div>
          <div className="bg-myslt-accent bg-opacity-20 rounded-lg p-2 sm:p-3 lg:p-4 backdrop-blur-sm">
            <div className="flex items-center justify-start gap-2 sm:gap-3 mb-1 sm:mb-2">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex-shrink-0 text-orange-200" />
              <span className="font-bold text-lg sm:text-xl lg:text-2xl leading-none">{consentSummary.pending}</span>
            </div>
            <p className="text-xs sm:text-sm text-blue-100 font-medium leading-tight">{t('customerDashboard.overview.pendingReview')}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {quickStats.map((stat) => (
          <div key={stat.label} className="bg-myslt-card rounded-lg sm:rounded-xl border border-myslt-accent/20 p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2 line-clamp-2">{stat.label}</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-myslt-text-primary mb-1">{stat.value}</p>
                {stat.trend && (
                  <p className="text-xs text-gray-500 line-clamp-2">{stat.trend}</p>
                )}
              </div>
              <div className={`p-2 sm:p-3 rounded-lg border flex-shrink-0 ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-myslt-text-primary mb-3 sm:mb-4 lg:mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {quickActions.map((action) => (
            <button
              key={action.action}
              className={`p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl border-2 transition-all duration-200 text-left hover:shadow-lg hover:transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-myslt-primary/50 myslt-card-hover-effect ${action.color}`}
              onClick={() => {
                // This would be handled by the parent component
                console.log(`Navigate to ${action.action}`);
              }}
            >
              <div className="flex items-start space-x-2 sm:space-x-3 lg:space-x-4 mb-2 sm:mb-3 lg:mb-4">
                <div className="flex-shrink-0 mt-1">
                  {action.icon}
                </div>
                <h3 className="font-semibold text-myslt-text-primary text-sm sm:text-base line-clamp-2">{action.title}</h3>
              </div>
              <p className="text-xs sm:text-sm text-myslt-text-secondary leading-relaxed line-clamp-3">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity & Current Status */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <div className="bg-myslt-card rounded-lg sm:rounded-xl border border-myslt-accent/20 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-myslt-text-primary">Recent Activity</h3>
            <button className="text-xs sm:text-sm text-myslt-success hover:text-myslt-success/80 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-2 sm:space-y-3 lg:space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={activity.id || `activity-${index}`} className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg hover:bg-myslt-accent/10 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  {'icon' in activity && activity.icon ? 
                    activity.icon : 
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-myslt-primary"></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-myslt-text-primary leading-relaxed line-clamp-2">{activity.action}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-myslt-card rounded-lg sm:rounded-xl border border-myslt-accent/20 p-3 sm:p-4 lg:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-myslt-text-primary mb-3 sm:mb-4 lg:mb-6">Privacy Status</h3>
          <div className="space-y-2 sm:space-y-3 lg:space-y-4">
            {privacyStatusItems.map((item) => (
              <div key={item.id} className={`flex items-center justify-between p-2 sm:p-3 lg:p-4 ${item.bgColor} rounded-lg border ${item.borderColor}`}>
                <div className="flex items-start space-x-2 sm:space-x-3 min-w-0 flex-1 pr-2">
                  {item.icon}
                  <div className="min-w-0 flex-1">
                    <p className={`font-medium ${item.textColor} text-xs sm:text-sm line-clamp-2`}>{item.title}</p>
                    <p className={`text-xs ${item.descColor} line-clamp-1`}>{item.description}</p>
                  </div>
                </div>
                <span className={`text-xs ${item.statusText} ${item.statusBg} px-2 py-1 rounded-full whitespace-nowrap shrink-0`}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboardOverview;
