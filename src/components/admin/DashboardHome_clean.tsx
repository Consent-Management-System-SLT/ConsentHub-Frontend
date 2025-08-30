import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  Database,
  CheckCircle,
  AlertTriangle,
  Clock,
  Activity,
  TrendingUp,
  Server,
  RefreshCw,
  Calendar,
  FileText,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardData {
  systemOverview: {
    totalConsents: number;
    grantedConsents: number;
    revokedConsents: number;
    totalPreferences: number;
    totalParties: number;
    totalDSAR: number;
    pendingDSAR: number;
    totalUsers: number;
  };
  complianceMetrics: {
    complianceScore: number;
    consentGrantRate: number;
    averageResponseTime: number;
    overdueItems: number;
    upcomingDeadlines: number;
  };
  systemHealth: {
    servicesOnline: string[];
    systemUptime: number;
    lastBackup: string;
    databaseConnected: boolean;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    action: string;
    purpose: string;
    partyId: string;
    timestamp: string;
    description: string;
  }>;
  dataFreshness: string;
}

const DashboardHome: React.FC = () => {
  const { getAuthToken } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const token = getAuthToken();
      
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://consenthub-backend.onrender.com'}/api/v1/admin/dashboard/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication failed');
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setDashboardData(data.data);
        setLastUpdated(new Date().toLocaleTimeString());
      } else {
        throw new Error(data.message || 'Invalid response format');
      }

    } catch (err) {
      console.error('Dashboard Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Dashboard Error</h3>
              <p className="text-red-600 mt-1">{error}</p>
              <button 
                onClick={fetchDashboardData}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-500">
          <Database className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No dashboard data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Real-time system overview and compliance monitoring
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdated}
          </div>
          <button 
            onClick={fetchDashboardData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Consents</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.systemOverview.totalConsents}</p>
            </div>
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <div className="mt-4 text-sm">
            <span className="text-green-600 font-medium">
              {dashboardData.systemOverview.grantedConsents} granted
            </span>
            <span className="text-gray-500 mx-2">|</span>
            <span className="text-red-600 font-medium">
              {dashboardData.systemOverview.revokedConsents} revoked
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.systemOverview.totalUsers}</p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Active system users
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">DSAR Requests</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.systemOverview.totalDSAR}</p>
            </div>
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
          <div className="mt-4 text-sm">
            <span className="text-yellow-600 font-medium">
              {dashboardData.systemOverview.pendingDSAR} pending
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Preferences</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.systemOverview.totalPreferences}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-indigo-600" />
          </div>
          <div className="mt-4 text-sm text-gray-600">
            User preference profiles
          </div>
        </div>
      </div>

      {/* Compliance Metrics */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5" />
          <span>Compliance Metrics</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {dashboardData.complianceMetrics.complianceScore}%
            </div>
            <div className="text-sm text-gray-600 mt-1">Compliance Score</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {dashboardData.complianceMetrics.consentGrantRate}%
            </div>
            <div className="text-sm text-gray-600 mt-1">Consent Grant Rate</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {dashboardData.complianceMetrics.averageResponseTime}ms
            </div>
            <div className="text-sm text-gray-600 mt-1">Avg Response Time</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {dashboardData.complianceMetrics.overdueItems}
            </div>
            <div className="text-sm text-gray-600 mt-1">Overdue Items</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">
              {dashboardData.complianceMetrics.upcomingDeadlines}
            </div>
            <div className="text-sm text-gray-600 mt-1">Upcoming Deadlines</div>
          </div>
        </div>
      </div>

      {/* System Health and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Server className="w-5 h-5" />
            <span>System Health</span>
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Database</span>
              <div className="flex items-center space-x-2">
                {dashboardData.systemHealth.databaseConnected ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-600 text-sm font-medium">Connected</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-red-600 text-sm font-medium">Disconnected</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">System Uptime</span>
              <span className="text-gray-900 font-medium">
                {formatUptime(dashboardData.systemHealth.systemUptime)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Services Online</span>
              <span className="text-green-600 font-medium">
                {dashboardData.systemHealth.servicesOnline.length}/4
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Last Backup</span>
              <span className="text-gray-900 font-medium">
                {formatDate(dashboardData.systemHealth.lastBackup)}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Recent Activity</span>
          </h2>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {dashboardData.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                <div className="flex-shrink-0">
                  {activity.action === 'granted' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : activity.action === 'revoked' ? (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(activity.timestamp)} • {activity.partyId}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Time Period Selector */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700 font-medium">Data Period:</span>
          </div>
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
