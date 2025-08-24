import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Settings, 
  FileText, 
  Shield, 
  Database, 
  Search,
  Bell,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  HelpCircle,
  RefreshCw,
  Activity
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { csrDashboardService } from '../services/csrDashboardService';

// Import CSR components (using backend-integrated versions)
import CSRHeader from './csr/CSRHeader';
import SidebarNav from './csr/SidebarNav';
import CustomerSearchForm from './csr/CustomerSearchForm_Backend';
import ConsentHistoryTable from './csr/ConsentHistoryTable_Backend';
import PreferenceEditorForm from './csr/PreferenceEditorForm_Backend';
import DSARRequestPanel from './csr/DSARRequestPanel_Backend';
import GuardianConsentForm from './csr/GuardianConsentForm_Backend';
import AuditLogTable from './csr/AuditLogTable_Backend';
import CSROverviewEnhanced from './csr/CSROverviewEnhanced';
import CustomerProfile from './csr/CustomerProfile';
import HelpModal from './csr/HelpModal';
import ServerConnectionAlert from './shared/ServerConnectionAlert';

interface CSRDashboardProps {
  className?: string;
}

const CSRDashboard: React.FC<CSRDashboardProps> = ({ className = '' }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showConnectionAlert, setShowConnectionAlert] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalCustomers: 0,
    pendingRequests: 0,
    consentUpdates: 0,
    guardiansManaged: 0,
    todayActions: 0,
    riskAlerts: 0
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState({
    consentRate: 0,
    resolvedRequests: 0,
    newCustomers: 0
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        console.log('Auto-refreshing CSR dashboard data...');
        loadDashboardData();
      }, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading comprehensive CSR dashboard data...');
      
      // Use the new CSR dashboard service with comprehensive fallbacks
      const dashboardData = await csrDashboardService.getComprehensiveDashboardData();
      
      if (dashboardData.offlineMode) {
        console.warn('📴 Operating in offline mode with fallback data');
        setShowConnectionAlert(true);
      }

      // Set stats from service
      setDashboardStats({
        totalCustomers: dashboardData.stats.totalCustomers,
        pendingRequests: dashboardData.stats.pendingRequests,
        consentUpdates: dashboardData.stats.consentUpdates,
        guardiansManaged: dashboardData.stats.guardiansManaged,
        todayActions: dashboardData.stats.todayActions,
        riskAlerts: dashboardData.stats.riskAlerts
      });

      // Set insights
      setInsights({
        consentRate: dashboardData.stats.consentRate,
        resolvedRequests: dashboardData.stats.resolvedRequests,
        newCustomers: dashboardData.stats.newCustomers
      });

      // Create recent activities from audit events
      const recentEvents = dashboardData.auditEvents
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map((event: any, index: number) => ({
          id: index + 1,
          type: event.eventType.includes('consent') ? 'consent' : 
                event.eventType.includes('dsar') ? 'dsar' : 'system',
          message: event.description,
          timestamp: getRelativeTime(event.createdAt),
          priority: event.severity === 'critical' ? 'high' : 
                   event.severity === 'high' ? 'high' : 'medium',
          category: event.category || 'General'
        }));

      setRecentActivities(recentEvents);

    } catch (error) {
      console.error('❌ Error loading CSR dashboard data:', error);
      
      // Emergency fallback - ensure we always have some data
      setDashboardStats({
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

      setRecentActivities([
        {
          id: 1,
          type: 'system',
          message: 'System operating in offline mode with sample data',
          timestamp: 'Just now',
          priority: 'medium',
          category: 'System'
        }
      ]);

      setShowConnectionAlert(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadDashboardData();
    } catch (error) {
      console.error('Error refreshing CSR dashboard:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
    setActiveSection('customer-profile');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <CSROverviewEnhanced 
          stats={dashboardStats} 
          activities={recentActivities} 
          onSectionChange={setActiveSection} 
          loading={loading}
          onRefresh={handleRefresh}
          insights={insights}
          isRefreshing={isRefreshing}
          autoRefresh={autoRefresh}
          onAutoRefreshChange={setAutoRefresh}
        />;
      case 'customer-search':
        return <CustomerSearchForm onCustomerSelect={handleCustomerSelect} />;
      case 'consent-history':
        return <ConsentHistoryTable />;
      case 'preference-editor':
        return <PreferenceEditorForm customerId={selectedCustomer?.id} />;
      case 'dsar-requests':
        return <DSARRequestPanel customerId={selectedCustomer?.id} />;
      case 'guardian-consent':
        return <GuardianConsentForm customerId={selectedCustomer?.id} />;
      case 'audit-logs':
        return <AuditLogTable customerId={selectedCustomer?.id} />;
      case 'customer-profile':
        return <CustomerProfile customer={selectedCustomer} onBack={() => setActiveSection('customer-search')} onSectionChange={setActiveSection} />;
      default:
        return <CSROverviewEnhanced 
          stats={dashboardStats} 
          activities={recentActivities} 
          onSectionChange={setActiveSection} 
          loading={loading}
          onRefresh={handleRefresh}
          insights={insights}
          isRefreshing={isRefreshing}
          autoRefresh={autoRefresh}
          onAutoRefreshChange={setAutoRefresh}
        />;
    }
  };

  return (
    <div className={`min-h-screen bg-myslt-background flex ${className}`}>
      {/* Server Connection Alert */}
      {showConnectionAlert && (
        <ServerConnectionAlert 
          onClose={() => setShowConnectionAlert(false)}
          autoHide={true}
          autoHideDelay={4000}
        />
      )}

      {/* Sidebar */}
      <SidebarNav
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      {/* Main content area */}
      <div className="flex-1 lg:ml-0 flex flex-col">
        {/* Header */}
        <CSRHeader 
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Floating Help Button */}
      <button
        onClick={() => setShowHelpModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-success-gradient text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group z-40"
        title="Help & Documentation"
      >
        <HelpCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      {/* Help Modal */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </div>
  );
};

// Dashboard Overview Component
const DashboardOverview: React.FC<{ 
  stats: any; 
  activities: any[]; 
  onSectionChange: (section: string) => void;
  loading?: boolean;
  onRefresh?: () => void;
  insights?: { consentRate: number; resolvedRequests: number; newCustomers: number };
  isRefreshing?: boolean;
  autoRefresh?: boolean;
  onAutoRefreshChange?: (value: boolean) => void;
}> = ({ 
  stats, 
  activities, 
  onSectionChange, 
  loading = false, 
  onRefresh, 
  insights, 
  isRefreshing = false, 
  autoRefresh = false, 
  onAutoRefreshChange 
}) => {
  
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading Welcome Section */}
        <div className="bg-gradient-to-r from-myslt-primary via-myslt-secondary to-myslt-primary-dark rounded-xl shadow-lg p-6 text-white myslt-card-glow">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Loading Dashboard...</h1>
              <p className="text-white/90 text-sm sm:text-base">
                Please wait while we fetch your real-time data.
              </p>
            </div>
            <div className="hidden sm:block">
              <RefreshCw className="w-16 h-16 opacity-80 animate-spin" />
            </div>
          </div>
        </div>

        {/* Loading Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-myslt-card rounded-xl shadow-sm p-6 border border-myslt-accent/20 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-myslt-accent/30 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-myslt-accent/30 rounded w-1/2"></div>
                </div>
                <div className="w-12 h-12 bg-myslt-accent/30 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-myslt-text-primary">Dashboard Overview</h1>
          <p className="text-myslt-text-secondary mt-1">Customer Support Representative Dashboard</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-myslt-text-secondary">Auto-refresh:</label>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => onAutoRefreshChange && onAutoRefreshChange(e.target.checked)}
              className="rounded border-gray-300 text-myslt-primary focus:ring-myslt-primary"
            />
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-myslt-primary text-white rounded-lg hover:bg-myslt-primary/90 disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-myslt-text-secondary">Total Customers</p>
              <p className="text-2xl font-bold text-myslt-text-primary">{stats.totalCustomers.toLocaleString()}</p>
              <p className="text-xs text-myslt-success mt-1">Active accounts</p>
            </div>
            <div className="p-3 bg-myslt-success/20 rounded-full">
              <Users className="w-6 h-6 text-myslt-success" />
            </div>
          </div>
        </div>

        <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-myslt-text-secondary">Pending Requests</p>
              <p className="text-2xl font-bold text-myslt-text-primary">{stats.pendingRequests}</p>
              <p className="text-xs text-orange-400 mt-1">Awaiting response</p>
            </div>
            <div className="p-3 bg-orange-400/20 rounded-full">
              <Clock className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-myslt-text-secondary">Consent Updates</p>
              <p className="text-2xl font-bold text-myslt-text-primary">{stats.consentUpdates}</p>
              <p className="text-xs text-myslt-success mt-1">This period</p>
            </div>
            <div className="p-3 bg-myslt-success/20 rounded-full">
              <CheckCircle className="w-6 h-6 text-myslt-success" />
            </div>
          </div>
        </div>

        <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-myslt-text-secondary">Guardian Managed</p>
              <p className="text-2xl font-bold text-myslt-text-primary">{stats.guardiansManaged}</p>
              <p className="text-xs text-purple-400 mt-1">Under supervision</p>
            </div>
            <div className="p-3 bg-purple-400/20 rounded-full">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-myslt-text-secondary">Today's Actions</p>
              <p className="text-2xl font-bold text-myslt-text-primary">{stats.todayActions}</p>
              <p className="text-xs text-indigo-400 mt-1">Completed tasks</p>
            </div>
            <div className="p-3 bg-indigo-400/20 rounded-full">
              <TrendingUp className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
        </div>

        <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-myslt-text-secondary">Risk Alerts</p>
              <p className="text-2xl font-bold text-myslt-text-primary">{stats.riskAlerts}</p>
              <p className="text-xs text-red-400 mt-1">Requires attention</p>
            </div>
            <div className="p-3 bg-red-400/20 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20 p-6">
          <h3 className="text-lg font-semibold text-myslt-text-primary mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => onSectionChange('customer-search')}
              className="w-full flex items-center space-x-3 p-3 bg-myslt-accent/30 hover:bg-myslt-accent/50 rounded-lg transition-colors"
            >
              <div className="p-2 bg-myslt-success/20 rounded-lg">
                <Users className="w-5 h-5 text-myslt-success" />
              </div>
              <div className="text-left">
                <p className="font-medium text-myslt-text-primary">Search Customers</p>
                <p className="text-sm text-myslt-text-secondary">Find and manage customer accounts</p>
              </div>
            </button>
            
            <button
              onClick={() => onSectionChange('dsar-requests')}
              className="w-full flex items-center space-x-3 p-3 bg-orange-400/20 hover:bg-orange-400/30 rounded-lg transition-colors"
            >
              <div className="p-2 bg-orange-400/30 rounded-lg">
                <FileText className="w-5 h-5 text-orange-400" />
              </div>
              <div className="text-left">
                <p className="font-medium text-myslt-text-primary">DSAR Requests</p>
                <p className="text-sm text-myslt-text-secondary">Process data subject requests</p>
              </div>
            </button>
            
            <button
              onClick={() => onSectionChange('consent-history')}
              className="w-full flex items-center space-x-3 p-3 bg-myslt-success/20 hover:bg-myslt-success/30 rounded-lg transition-colors"
            >
              <div className="p-2 bg-myslt-success/30 rounded-lg">
                <Shield className="w-5 h-5 text-myslt-success" />
              </div>
              <div className="text-left">
                <p className="font-medium text-myslt-text-primary">Consent Management</p>
                <p className="text-sm text-myslt-text-secondary">Review and update consents</p>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-myslt-text-primary">Recent Activity</h3>
            {isRefreshing && (
              <div className="flex items-center text-myslt-success text-sm">
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                Refreshing...
              </div>
            )}
          </div>
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-myslt-service-card rounded-lg">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'consent' ? 'bg-green-100' :
                    activity.type === 'dsar' ? 'bg-orange-100' :
                    'bg-myslt-service-card'
                  }`}>
                    {activity.type === 'consent' ? (
                      <Shield className={`w-4 h-4 ${
                        activity.type === 'consent' ? 'text-green-600' :
                        activity.type === 'dsar' ? 'text-orange-600' :
                        'text-blue-600'
                      }`} />
                    ) : activity.type === 'dsar' ? (
                      <FileText className={`w-4 h-4 ${
                        activity.type === 'consent' ? 'text-green-600' :
                        activity.type === 'dsar' ? 'text-orange-600' :
                        'text-blue-600'
                      }`} />
                    ) : (
                      <Activity className={`w-4 h-4 ${
                        activity.type === 'consent' ? 'text-green-600' :
                        activity.type === 'dsar' ? 'text-orange-600' :
                        'text-blue-600'
                      }`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-myslt-text-primary">{activity.message}</p>
                    <p className="text-xs text-myslt-text-muted mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-myslt-text-muted">
                <Activity className="w-12 h-12 mx-auto mb-3 text-myslt-text-muted/50" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Insights */}
      <div className="bg-myslt-card rounded-xl shadow-sm p-6 border border-myslt-accent/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-myslt-text-primary">Today's Insights</h3>
          {isRefreshing && (
            <div className="flex items-center text-myslt-success text-sm">
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              Refreshing...
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-myslt-gradient p-4 rounded-lg border border-myslt-accent/30">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-myslt-primary" />
              <span className="text-sm font-medium text-myslt-text-primary">Consent Rate</span>
            </div>
            <p className="text-2xl font-bold text-myslt-text-primary mt-2">{insights?.consentRate || 0}%</p>
            <p className="text-sm text-myslt-primary">Based on active consents</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Resolved Requests</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-2">{insights?.resolvedRequests || 0}</p>
            <p className="text-sm text-green-600">Completed DSAR requests</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">New Customers</span>
            </div>
            <p className="text-2xl font-bold text-orange-900 mt-2">{insights?.newCustomers || 0}</p>
            <p className="text-sm text-orange-600">Registered today</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSRDashboard;
