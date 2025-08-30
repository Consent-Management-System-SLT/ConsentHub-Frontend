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
  BarChart3,
  Bell
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCRUDNotifications } from '../shared/withNotifications';

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
  const { notifyCustom } = useCRUDNotifications();
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  // Test notification function
  const testNotification = () => {
    const notifications = [
      { type: 'success', title: 'System Update', message: 'Dashboard data refreshed successfully' },
      { type: 'info', title: 'New Feature', message: 'Notification system is now active!' },
      { type: 'warning', title: 'Maintenance Alert', message: 'System maintenance scheduled for tonight' },
      { type: 'urgent', title: 'Action Required', message: 'High priority DSAR request needs attention' }
    ] as const;

    const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
    
    notifyCustom(
      'system',
      randomNotification.type,
      randomNotification.title,
      randomNotification.message,
      { source: 'dashboard_test' }
    );
  };

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
          <RefreshCw className="w-6 h-6 animate-spin text-myslt-accent" />
          <span className="text-lg text-myslt-text-secondary">Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-myslt-danger/20 border border-myslt-danger/30 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-myslt-danger" />
            <div>
              <h3 className="text-lg font-semibold text-myslt-text-primary">Dashboard Error</h3>
              <p className="text-myslt-text-secondary mt-1">{error}</p>
              <button 
                onClick={fetchDashboardData}
                className="myslt-btn-primary mt-3 px-4 py-2"
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
      <div className="p-4 sm:p-8">
        <div className="text-center text-myslt-text-muted">
          <Database className="w-12 h-12 mx-auto mb-4 text-myslt-text-muted" />
          <p>No dashboard data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-myslt-text-primary truncate">Admin Dashboard</h1>
          <p className="text-myslt-text-secondary mt-1 text-sm sm:text-base">
            Real-time system overview and compliance monitoring
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 shrink-0">
          <div className="text-xs sm:text-sm text-myslt-text-muted text-center sm:text-left">
            Last updated: {lastUpdated}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button 
              onClick={fetchDashboardData}
              className="myslt-btn-primary flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 text-sm sm:text-base"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button 
              onClick={testNotification}
              className="myslt-btn-secondary flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 text-sm sm:text-base"
            >
              <Bell className="w-4 h-4" />
              <span>Test</span>
            </button>
          </div>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="myslt-card p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-myslt-text-secondary truncate">Total Consents</p>
              <p className="text-xl sm:text-2xl font-bold text-myslt-text-primary">{dashboardData.systemOverview.totalConsents}</p>
            </div>
            <Shield className="w-6 sm:w-8 h-6 sm:h-8 text-myslt-accent shrink-0" />
          </div>
          <div className="mt-3 sm:mt-4 text-xs sm:text-sm">
            <span className="text-myslt-success font-medium">
              {dashboardData.systemOverview.grantedConsents} granted
            </span>
            <span className="text-myslt-text-muted mx-2">|</span>
            <span className="text-myslt-danger font-medium">
              {dashboardData.systemOverview.revokedConsents} revoked
            </span>
          </div>
        </div>

        <div className="myslt-card p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-myslt-text-secondary truncate">Total Users</p>
              <p className="text-xl sm:text-2xl font-bold text-myslt-text-primary">{dashboardData.systemOverview.totalUsers}</p>
            </div>
            <Users className="w-6 sm:w-8 h-6 sm:h-8 text-myslt-success shrink-0" />
          </div>
          <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-myslt-text-secondary">
            Active system users
          </div>
        </div>

        <div className="myslt-card p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-myslt-text-secondary truncate">DSAR Requests</p>
              <p className="text-xl sm:text-2xl font-bold text-myslt-text-primary">{dashboardData.systemOverview.totalDSAR}</p>
            </div>
            <FileText className="w-6 sm:w-8 h-6 sm:h-8 text-myslt-info shrink-0" />
          </div>
          <div className="mt-3 sm:mt-4 text-xs sm:text-sm">
            <span className="text-myslt-warning font-medium">
              {dashboardData.systemOverview.pendingDSAR} pending
            </span>
          </div>
        </div>

        <div className="myslt-card p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-myslt-text-secondary truncate">Preferences</p>
              <p className="text-xl sm:text-2xl font-bold text-myslt-text-primary">{dashboardData.systemOverview.totalPreferences}</p>
            </div>
            <BarChart3 className="w-6 sm:w-8 h-6 sm:h-8 text-myslt-accent shrink-0" />
          </div>
          <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-myslt-text-secondary">
            User preference profiles
          </div>
        </div>
      </div>

      {/* Compliance Metrics */}
      <div className="myslt-card p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-myslt-text-primary mb-3 sm:mb-4 flex items-center space-x-2">
          <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5" />
          <span>Compliance Metrics</span>
        </h2>
        
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-myslt-success">
              {dashboardData.complianceMetrics.complianceScore}%
            </div>
            <div className="text-xs sm:text-sm text-myslt-text-secondary mt-1">Compliance Score</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-myslt-accent">
              {dashboardData.complianceMetrics.consentGrantRate}%
            </div>
            <div className="text-xs sm:text-sm text-myslt-text-secondary mt-1">Consent Grant Rate</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-myslt-info">
              {dashboardData.complianceMetrics.averageResponseTime}ms
            </div>
            <div className="text-xs sm:text-sm text-myslt-text-secondary mt-1">Avg Response Time</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-myslt-warning">
              {dashboardData.complianceMetrics.overdueItems}
            </div>
            <div className="text-xs sm:text-sm text-myslt-text-secondary mt-1">Overdue Items</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-myslt-danger">
              {dashboardData.complianceMetrics.upcomingDeadlines}
            </div>
            <div className="text-xs sm:text-sm text-myslt-text-secondary mt-1">Upcoming Deadlines</div>
          </div>
        </div>
      </div>

      {/* System Health and Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* System Health */}
        <div className="myslt-card p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-myslt-text-primary mb-3 sm:mb-4 flex items-center space-x-2">
            <Server className="w-4 sm:w-5 h-4 sm:h-5" />
            <span>System Health</span>
          </h2>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-myslt-text-secondary text-sm sm:text-base">Database</span>
              <div className="flex items-center space-x-2">
                {dashboardData.systemHealth.databaseConnected ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-myslt-success" />
                    <span className="text-myslt-success text-xs sm:text-sm font-medium">Connected</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-myslt-danger" />
                    <span className="text-myslt-danger text-xs sm:text-sm font-medium">Disconnected</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-myslt-text-secondary text-sm sm:text-base">System Uptime</span>
              <span className="text-myslt-text-primary font-medium text-sm sm:text-base">
                {formatUptime(dashboardData.systemHealth.systemUptime)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-myslt-text-secondary text-sm sm:text-base">Services Online</span>
              <span className="text-myslt-success font-medium text-sm sm:text-base">
                {dashboardData.systemHealth.servicesOnline.length}/4
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-myslt-text-secondary text-sm sm:text-base">Last Backup</span>
              <span className="text-myslt-text-primary font-medium text-xs sm:text-sm">
                {formatDate(dashboardData.systemHealth.lastBackup)}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="myslt-card p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-myslt-text-primary mb-3 sm:mb-4 flex items-center space-x-2">
            <Activity className="w-4 sm:w-5 h-4 sm:h-5" />
            <span>Recent Activity</span>
          </h2>
          
          <div className="space-y-2 sm:space-y-3 max-h-64 overflow-y-auto">
            {dashboardData.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-2 sm:space-x-3 p-2 hover:bg-myslt-muted/10 rounded">
                <div className="flex-shrink-0">
                  {activity.action === 'granted' ? (
                    <CheckCircle className="w-4 h-4 text-myslt-success" />
                  ) : activity.action === 'revoked' ? (
                    <AlertTriangle className="w-4 h-4 text-myslt-danger" />
                  ) : (
                    <Clock className="w-4 h-4 text-myslt-text-muted" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-myslt-text-primary truncate">{activity.description}</p>
                  <p className="text-xs text-myslt-text-muted">
                    {formatDate(activity.timestamp)} • <span className="truncate max-w-[100px] sm:max-w-none inline-block">{activity.partyId}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Time Period Selector */}
      <div className="myslt-card p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 sm:w-5 h-4 sm:h-5 text-myslt-text-muted" />
            <span className="text-myslt-text-primary font-medium text-sm sm:text-base">Data Period:</span>
          </div>
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="myslt-input px-3 py-2 text-sm sm:text-base min-w-0"
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
