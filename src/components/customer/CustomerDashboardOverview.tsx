import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Shield, 
  Settings, 
  FileText, 
  Download
} from 'lucide-react';

interface CustomerDashboardOverviewProps {
  customerName: string;
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

const CustomerDashboardOverview: React.FC<CustomerDashboardOverviewProps> = ({ customerName }) => {
  // Mock data - replace with API calls
  const consentSummary: ConsentSummary = {
    granted: 8,
    revoked: 2,
    expired: 1,
    pending: 3
  };

  const quickStats: QuickStat[] = [
    {
      label: 'Active Consents',
      value: '8',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'text-green-600 bg-green-50 border-green-200',
      trend: '+2 this month'
    },
    {
      label: 'Communication Channels',
      value: '3',
      icon: <Settings className="w-6 h-6" />,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      trend: 'Email, SMS, Push'
    },
    {
      label: 'Privacy Notices',
      value: '5',
      icon: <FileText className="w-6 h-6" />,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      trend: '2 pending review'
    },
    {
      label: 'DSAR Requests',
      value: '1',
      icon: <Download className="w-6 h-6" />,
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      trend: 'In progress'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'Granted consent for marketing communications',
      timestamp: '2 hours ago',
      type: 'consent',
      icon: <CheckCircle className="w-4 h-4 text-green-600" />
    },
    {
      id: 2,
      action: 'Updated communication preferences',
      timestamp: '1 day ago',
      type: 'preference',
      icon: <Settings className="w-4 h-4 text-blue-600" />
    },
    {
      id: 3,
      action: 'Accepted Privacy Policy v2.1',
      timestamp: '3 days ago',
      type: 'privacy',
      icon: <FileText className="w-4 h-4 text-purple-600" />
    },
    {
      id: 4,
      action: 'Submitted data export request',
      timestamp: '1 week ago',
      type: 'dsar',
      icon: <Download className="w-4 h-4 text-orange-600" />
    }
  ];

  const quickActions = [
    {
      title: 'Manage Consents',
      description: 'View and update your data consents',
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      action: 'consent-center',
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    {
      title: 'Communication Preferences',
      description: 'Set your notification preferences',
      icon: <Settings className="w-8 h-8 text-green-600" />,
      action: 'preferences',
      color: 'bg-green-50 hover:bg-green-100 border-green-200'
    },
    {
      title: 'Privacy Notices',
      description: 'Review latest privacy policies',
      icon: <FileText className="w-8 h-8 text-purple-600" />,
      action: 'privacy-notices',
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
    },
    {
      title: 'Request My Data',
      description: 'Export or delete your personal data',
      icon: <Download className="w-8 h-8 text-orange-600" />,
      action: 'dsar-requests',
      color: 'bg-orange-50 hover:bg-orange-100 border-orange-200'
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {customerName}!</h1>
            <p className="text-blue-100 text-base sm:text-lg">
              Manage your privacy settings and data consents in one place.
            </p>
          </div>
          <div className="hidden lg:block flex-shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white bg-opacity-10 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
            <div className="flex items-center justify-start gap-3 mb-2">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 text-green-200" />
              <span className="font-bold text-xl sm:text-2xl leading-none">{consentSummary.granted}</span>
            </div>
            <p className="text-xs sm:text-sm text-blue-100 font-medium leading-tight">Active Consents</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
            <div className="flex items-center justify-start gap-3 mb-2">
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 text-red-200" />
              <span className="font-bold text-xl sm:text-2xl leading-none">{consentSummary.revoked}</span>
            </div>
            <p className="text-xs sm:text-sm text-blue-100 font-medium leading-tight">Revoked</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
            <div className="flex items-center justify-start gap-3 mb-2">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 text-yellow-200" />
              <span className="font-bold text-xl sm:text-2xl leading-none">{consentSummary.expired}</span>
            </div>
            <p className="text-xs sm:text-sm text-blue-100 font-medium leading-tight">Expired</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
            <div className="flex items-center justify-start gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 text-orange-200" />
              <span className="font-bold text-xl sm:text-2xl leading-none">{consentSummary.pending}</span>
            </div>
            <p className="text-xs sm:text-sm text-blue-100 font-medium leading-tight">Pending Review</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
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
          {quickActions.map((action, index) => (
            <button
              key={index}
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
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  {activity.icon}
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
            <div className="flex items-center justify-between p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start space-x-3 min-w-0 flex-1">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-green-900 text-sm">Privacy Policy Accepted</p>
                  <p className="text-xs sm:text-sm text-green-700">Version 2.1 - Current</p>
                </div>
              </div>
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full whitespace-nowrap ml-2">Active</span>
            </div>
            
            <div className="flex items-center justify-between p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3 min-w-0 flex-1">
                <Settings className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-blue-900 text-sm">Communication Preferences</p>
                  <p className="text-xs sm:text-sm text-blue-700">Last updated 1 day ago</p>
                </div>
              </div>
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full whitespace-nowrap ml-2">Configured</span>
            </div>
            
            <div className="flex items-center justify-between p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start space-x-3 min-w-0 flex-1">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-yellow-900 text-sm">Pending DSAR Request</p>
                  <p className="text-xs sm:text-sm text-yellow-700">Data export in progress</p>
                </div>
              </div>
              <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full whitespace-nowrap ml-2">Processing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboardOverview;
