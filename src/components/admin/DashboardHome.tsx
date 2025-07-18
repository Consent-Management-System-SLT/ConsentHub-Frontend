import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Shield, 
  CheckCircle,
  Clock,
  Database,
  Activity,
  FileText,
  ArrowUpRight,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';

interface DashboardHomeProps {}

const DashboardHome: React.FC<DashboardHomeProps> = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        console.log('Auto-refreshing dashboard data...');
      }, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleExport = () => {
    // Simulate report export
    const reportData = {
      timestamp: new Date().toISOString(),
      totalConsents: stats.totalConsents,
      activeUsers: stats.activeUsers,
      dsarRequests: stats.dsarRequests,
      complianceScore: stats.complianceScore,
      timeRange: selectedTimeRange
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-dashboard-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Mock data for dashboard
  const stats = {
    totalConsents: 12847,
    activeUsers: 8934,
    dsarRequests: 47,
    complianceScore: 98.5,
    monthlyGrowth: 12.4,
    avgResponseTime: 2.3
  };

  const recentActivity = [
    { id: 1, type: 'consent', action: 'Updated marketing consent', user: 'John Doe', time: '2 minutes ago', status: 'success' },
    { id: 2, type: 'dsar', action: 'New data request submitted', user: 'Jane Smith', time: '15 minutes ago', status: 'pending' },
    { id: 3, type: 'audit', action: 'Privacy policy updated', user: 'Admin', time: '1 hour ago', status: 'success' },
    { id: 4, type: 'compliance', action: 'Compliance check completed', user: 'System', time: '2 hours ago', status: 'success' },
    { id: 5, type: 'user', action: 'New user registered', user: 'Mike Johnson', time: '3 hours ago', status: 'info' }
  ];

  const complianceMetrics = [
    { label: 'GDPR Compliance', value: 99.2, color: 'green' },
    { label: 'CCPA Compliance', value: 97.8, color: 'blue' },
    { label: 'Data Retention', value: 95.5, color: 'yellow' },
    { label: 'Consent Validity', value: 98.9, color: 'green' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Comprehensive system analytics and insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Time Range:</label>
            <select 
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
            >
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Export</span>
          </button>
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <button 
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${autoRefresh ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            <Activity className="w-4 h-4" />
            <span className="text-sm font-medium">{autoRefresh ? 'Auto ON' : 'Auto OFF'}</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex items-center space-x-1 text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+{stats.monthlyGrowth}%</span>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Consents</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.totalConsents.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Active consent records</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex items-center space-x-1 text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+8.2%</span>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Active Users</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.activeUsers.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Registered customers</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex items-center space-x-1 text-orange-600">
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-sm font-medium">+{stats.dsarRequests}</span>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">DSAR Requests</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.dsarRequests}</p>
          <p className="text-xs text-gray-500 mt-1">Pending requests</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex items-center space-x-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Excellent</span>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Compliance Score</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.complianceScore}%</p>
          <p className="text-xs text-gray-500 mt-1">GDPR & CCPA compliant</p>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Compliance Overview</h3>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Eye className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="space-y-4">
            {complianceMetrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                  <span className="text-sm font-semibold text-gray-900">{metric.value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      metric.color === 'green' ? 'bg-green-500' :
                      metric.color === 'blue' ? 'bg-blue-500' :
                      metric.color === 'yellow' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`}
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">System Performance</h3>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Activity className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Response Time</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.avgResponseTime}s</p>
              <p className="text-sm text-green-600 mt-1">↓ 15% from last month</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Uptime</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">99.9%</p>
              <p className="text-sm text-green-600 mt-1">Excellent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View all activity
          </button>
        </div>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                activity.type === 'consent' ? 'bg-blue-100' :
                activity.type === 'dsar' ? 'bg-yellow-100' :
                activity.type === 'audit' ? 'bg-green-100' :
                activity.type === 'compliance' ? 'bg-purple-100' : 'bg-gray-100'
              }`}>
                {activity.type === 'consent' && <Shield className="w-5 h-5 text-blue-600" />}
                {activity.type === 'dsar' && <Database className="w-5 h-5 text-yellow-600" />}
                {activity.type === 'audit' && <Activity className="w-5 h-5 text-green-600" />}
                {activity.type === 'compliance' && <CheckCircle className="w-5 h-5 text-purple-600" />}
                {activity.type === 'user' && <Users className="w-5 h-5 text-gray-600" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-500">by {activity.user}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">{activity.time}</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  activity.status === 'success' ? 'bg-green-100 text-green-800' :
                  activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  activity.status === 'info' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {activity.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200">
            <FileText className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Create Privacy Notice</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200">
            <Users className="w-6 h-6 text-green-600" />
            <span className="text-sm font-medium text-green-900">Add New User</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors border border-yellow-200">
            <Database className="w-6 h-6 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-900">Review DSAR</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200">
            <CheckCircle className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Compliance Check</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
