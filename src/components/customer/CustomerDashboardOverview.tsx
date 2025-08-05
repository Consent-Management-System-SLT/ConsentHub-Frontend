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
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await customerDashboardService.getDashboardOverview();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Use fallback data
      setDashboardData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Use real data if available, otherwise use fallback data
  const consentSummary = dashboardData?.consentStats || {
    granted: 8,
    revoked: 2,
    expired: 1,
    pending: 3
  };

  const currentCustomerName = dashboardData?.customer?.name || user?.name || customerName;

  const quickStats: QuickStat[] = [
    {
      label: t('customerDashboard.overview.activeConsents'),
      value: String(dashboardData?.consentStats?.granted || 8),
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'text-green-600 bg-green-50 border-green-200',
      trend: t('customerDashboard.overview.monthlyTrend', { count: 2 })
    },
    {
      label: t('customerDashboard.overview.communicationChannels'),
      value: String(dashboardData?.preferenceStats?.enabled || 3),
      icon: <Settings className="w-6 h-6" />,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      trend: t('customerDashboard.overview.channelTypes')
    },
    {
      label: t('customerDashboard.overview.privacyNotices'),
      value: '5',
      icon: <FileText className="w-6 h-6" />,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      trend: t('customerDashboard.overview.pendingReviewCount', { count: 2 })
    },
    {
      label: t('customerDashboard.overview.dsarRequests'),
      value: String(dashboardData?.dsarStats?.total || 1),
      icon: <Download className="w-6 h-6" />,
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      trend: dashboardData?.dsarStats?.pending ? t('customerDashboard.overview.inProgress') : t('customerDashboard.overview.completed')
    }
  ];

  const recentActivity = dashboardData?.recentActivity || [
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
      icon: <Settings className="w-4 h-4 text-blue-600" />
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
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      action: 'consent-center',
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    {
      title: t('customerDashboard.overview.actions.communicationPrefs'),
      description: t('customerDashboard.overview.actions.communicationPrefsDesc'),
      icon: <Settings className="w-8 h-8 text-green-600" />,
      action: 'preferences',
      color: 'bg-green-50 hover:bg-green-100 border-green-200'
    },
    {
      title: t('customerDashboard.overview.actions.privacyNotices'),
      description: t('customerDashboard.overview.actions.privacyNoticesDesc'),
      icon: <FileText className="w-8 h-8 text-purple-600" />,
      action: 'privacy-notices',
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
    },
    {
      title: t('customerDashboard.overview.actions.requestData'),
      description: t('customerDashboard.overview.actions.requestDataDesc'),
      icon: <Download className="w-8 h-8 text-orange-600" />,
      action: 'dsar-requests',
      color: 'bg-orange-50 hover:bg-orange-100 border-orange-200'
    }
  ];

  const privacyStatusItems = [
    {
      id: 'privacy-policy',
      title: 'Privacy Policy Accepted',
      description: 'Version 2.1 - Current',
      status: 'Active',
      icon: <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-900',
      descColor: 'text-green-700',
      statusBg: 'bg-green-100',
      statusText: 'text-green-600'
    },
    {
      id: 'communication-prefs',
      title: 'Communication Preferences',
      description: 'Last updated 1 day ago',
      status: 'Configured',
      icon: <Settings className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-900',
      descColor: 'text-blue-700',
      statusBg: 'bg-blue-100',
      statusText: 'text-blue-600'
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
    <div className="space-y-6 sm:space-y-8">
      {/* Show Profile Section if requested */}
      {showProfile && (
        <UserProfile isOpen={showProfile} onClose={() => setShowProfile && setShowProfile(false)} />
      )}
      
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {t('customerDashboard.overview.welcomeBack', { name: currentCustomerName })}!
            </h1>
            <p className="text-blue-100 text-base sm:text-lg">
              {t('customerDashboard.overview.welcomeDesc')}
            </p>
            {dashboardData?.customer?.lastLogin && (
              <p className="text-blue-200 text-sm mt-2">
                Last login: {new Date(dashboardData.customer.lastLogin).toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex space-x-3 items-center">
            {/* Profile button removed; use header icon instead */}
            <button
              onClick={loadDashboardData}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <div className="hidden lg:block flex-shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white bg-opacity-10 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
            <div className="flex items-center justify-start gap-3 mb-2">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 text-green-200" />
              <span className="font-bold text-xl sm:text-2xl leading-none">{consentSummary.granted}</span>
            </div>
            <p className="text-xs sm:text-sm text-blue-100 font-medium leading-tight">{t('customerDashboard.overview.activeConsents')}</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
            <div className="flex items-center justify-start gap-3 mb-2">
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 text-red-200" />
              <span className="font-bold text-xl sm:text-2xl leading-none">{consentSummary.revoked}</span>
            </div>
            <p className="text-xs sm:text-sm text-blue-100 font-medium leading-tight">{t('customerDashboard.overview.revoked')}</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
            <div className="flex items-center justify-start gap-3 mb-2">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 text-yellow-200" />
              <span className="font-bold text-xl sm:text-2xl leading-none">{consentSummary.expired}</span>
            </div>
            <p className="text-xs sm:text-sm text-blue-100 font-medium leading-tight">{t('customerDashboard.overview.expired')}</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
            <div className="flex items-center justify-start gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 text-orange-200" />
              <span className="font-bold text-xl sm:text-2xl leading-none">{consentSummary.pending}</span>
            </div>
            <p className="text-xs sm:text-sm text-blue-100 font-medium leading-tight">{t('customerDashboard.overview.pendingReview')}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {quickStats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                {stat.trend && (
                  <p className="text-xs sm:text-sm text-gray-500 truncate">{stat.trend}</p>
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
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {quickActions.map((action) => (
            <button
              key={action.action}
              className={`p-4 sm:p-6 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${action.color}`}
              onClick={() => {
                // This would be handled by the parent component
                console.log(`Navigate to ${action.action}`);
              }}
            >
              <div className="flex items-start space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                <div className="flex-shrink-0 mt-1">
                  {action.icon}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{action.title}</h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity & Current Status */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={activity.id || `activity-${index}`} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  {'icon' in activity && activity.icon ? 
                    activity.icon : 
                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 leading-relaxed">{activity.action}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Privacy Status</h3>
          <div className="space-y-3 sm:space-y-4">
            {privacyStatusItems.map((item) => (
              <div key={item.id} className={`flex items-center justify-between p-3 sm:p-4 ${item.bgColor} rounded-lg border ${item.borderColor}`}>
                <div className="flex items-start space-x-3 min-w-0 flex-1">
                  {item.icon}
                  <div className="min-w-0 flex-1">
                    <p className={`font-medium ${item.textColor} text-sm`}>{item.title}</p>
                    <p className={`text-xs sm:text-sm ${item.descColor}`}>{item.description}</p>
                  </div>
                </div>
                <span className={`text-xs ${item.statusText} ${item.statusBg} px-2 py-1 rounded-full whitespace-nowrap ml-2`}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboardOverview;
