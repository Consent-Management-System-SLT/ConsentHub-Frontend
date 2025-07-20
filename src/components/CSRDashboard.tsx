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

// Import CSR components (using backend-integrated versions)
import CSRHeader from './csr/CSRHeader';
import SidebarNav from './csr/SidebarNav';
import CustomerSearchForm from './csr/CustomerSearchForm_Backend';
import ConsentHistoryTable from './csr/ConsentHistoryTable_Backend';
import PreferenceEditorForm from './csr/PreferenceEditorForm_Backend';
import DSARRequestPanel from './csr/DSARRequestPanel_Backend';
import GuardianConsentForm from './csr/GuardianConsentForm_Backend';
import AuditLogTable from './csr/AuditLogTable_Backend';
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
      
      // Fetch data from multiple endpoints
      const [partiesResponse, consentsResponse, dsarResponse, eventsResponse] = await Promise.all([
        apiClient.get('/api/v1/party'),
        apiClient.get('/api/v1/consent'),
        apiClient.get('/api/v1/dsar'),
        apiClient.get('/api/v1/event')
      ]);

      const parties = partiesResponse.data as any[];
      const consents = consentsResponse.data as any[];
      const dsarRequests = dsarResponse.data as any[];
      const events = eventsResponse.data as any[];

      // Calculate real statistics
      const totalCustomers = parties.length;
      const pendingRequests = dsarRequests.filter((req: any) => req.status === 'pending').length;
      const grantedConsents = consents.filter((consent: any) => consent.status === 'granted').length;
      const todayEvents = events.filter((event: any) => {
        const eventDate = new Date(event.createdAt);
        const today = new Date();
        return eventDate.toDateString() === today.toDateString();
      }).length;

      setDashboardStats({
        totalCustomers,
        pendingRequests,
        consentUpdates: grantedConsents,
        guardiansManaged: 0, // No guardian data in current API
        todayActions: todayEvents,
        riskAlerts: dsarRequests.filter((req: any) => req.status === 'pending' && 
          new Date(req.submittedAt) < new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) // 25+ days old
        ).length
      });

      // Calculate insights
      const totalConsents = consents.length;
      const consentRate = totalConsents > 0 ? Math.round((grantedConsents / totalConsents) * 100) : 0;
      const resolvedRequests = dsarRequests.filter((req: any) => req.status === 'completed').length;
      const newCustomersCount = parties.filter((party: any) => {
        const createdDate = new Date(party.createdAt);
        const today = new Date();
        return createdDate.toDateString() === today.toDateString();
      }).length;

      setInsights({
        consentRate,
        resolvedRequests,
        newCustomers: newCustomersCount
      });

      // Create recent activities from events
      const recentEvents = events
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map((event: any, index: number) => ({
          id: index + 1,
          type: event.eventType.includes('consent') ? 'consent' : 
                event.eventType.includes('dsar') ? 'dsar' : 'system',
          message: event.description,
          timestamp: getRelativeTime(event.createdAt),
          priority: event.eventType.includes('dsar') ? 'high' : 'medium'
        }));

      setRecentActivities(recentEvents);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Keep default values if API fails
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
        return <DashboardOverview 
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
        return <ConsentHistoryTable customerId={selectedCustomer?.id} />;
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
        return <DashboardOverview 
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
    <div className={`min-h-screen bg-gray-50 flex ${className}`}>
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
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group z-40"
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
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Loading Dashboard...</h1>
              <p className="text-blue-100 text-sm sm:text-base">
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
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Customer Support Representative Dashboard</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Auto-refresh:</label>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => onAutoRefreshChange && onAutoRefreshChange(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers.toLocaleString()}</p>
              <p className="text-xs text-blue-600 mt-1">Active accounts</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
              <p className="text-xs text-orange-600 mt-1">Awaiting response</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Consent Updates</p>
              <p className="text-2xl font-bold text-gray-900">{stats.consentUpdates}</p>
              <p className="text-xs text-green-600 mt-1">This period</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Guardian Managed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.guardiansManaged}</p>
              <p className="text-xs text-purple-600 mt-1">Under supervision</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Actions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayActions}</p>
              <p className="text-xs text-indigo-600 mt-1">Completed tasks</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Risk Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.riskAlerts}</p>
              <p className="text-xs text-red-600 mt-1">Requires attention</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => onSectionChange('customer-search')}
              className="w-full flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Search Customers</p>
                <p className="text-sm text-gray-600">Find and manage customer accounts</p>
              </div>
            </button>
            
            <button
              onClick={() => onSectionChange('dsar-requests')}
              className="w-full flex items-center space-x-3 p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
            >
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">DSAR Requests</p>
                <p className="text-sm text-gray-600">Process data subject requests</p>
              </div>
            </button>
            
            <button
              onClick={() => onSectionChange('consent-history')}
              className="w-full flex items-center space-x-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Consent Management</p>
                <p className="text-sm text-gray-600">Review and update consents</p>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            {isRefreshing && (
              <div className="flex items-center text-blue-600 text-sm">
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                Refreshing...
              </div>
            )}
          </div>
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'consent' ? 'bg-green-100' :
                    activity.type === 'dsar' ? 'bg-orange-100' :
                    'bg-blue-100'
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
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Insights */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Today's Insights</h3>
          {isRefreshing && (
            <div className="flex items-center text-blue-600 text-sm">
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              Refreshing...
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Consent Rate</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-2">{insights?.consentRate || 0}%</p>
            <p className="text-sm text-blue-600">Based on active consents</p>
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

// Customer Profile Component
const CustomerProfile: React.FC<{ customer: any; onBack: () => void; onSectionChange: (section: string) => void }> = ({ customer, onBack, onSectionChange }) => {
  if (!customer) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          <span>← Back to Search</span>
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{customer.name}</h2>
            <p className="text-gray-600">{customer.email}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Phone:</span>
                <span className="text-gray-900 font-medium">{customer.mobile}</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Customer ID:</span>
                <span className="text-gray-900 font-medium">{customer.id}</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Type:</span>
                <span className="text-gray-900 font-medium">{customer.type}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button 
                onClick={() => onSectionChange('consent-history')}
                className="w-full p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium"
              >
                View Consent History
              </button>
              <button 
                onClick={() => onSectionChange('preference-editor')}
                className="w-full p-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium"
              >
                Edit Preferences
              </button>
              <button 
                onClick={() => onSectionChange('dsar-requests')}
                className="w-full p-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium"
              >
                DSAR Request
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSRDashboard;
