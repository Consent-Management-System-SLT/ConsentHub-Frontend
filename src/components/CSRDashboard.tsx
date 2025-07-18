import React, { useState } from 'react';
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
  HelpCircle
} from 'lucide-react';

// Import CSR components (using default imports for now)
import CSRHeader from './csr/CSRHeader';
import SidebarNav from './csr/SidebarNav';
import CustomerSearchForm from './csr/CustomerSearchForm';
import ConsentHistoryTable from './csr/ConsentHistoryTable';
import PreferenceEditorForm from './csr/PreferenceEditorForm';
import DSARRequestPanel from './csr/DSARRequestPanel';
import GuardianConsentForm from './csr/GuardianConsentForm';
import AuditLogTable from './csr/AuditLogTable';
import HelpModal from './csr/HelpModal';

interface CSRDashboardProps {
  className?: string;
}

const CSRDashboard: React.FC<CSRDashboardProps> = ({ className = '' }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Use sidebarOpen instead of collapsed
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Mock dashboard statistics
  const dashboardStats = {
    totalCustomers: 15487,
    pendingRequests: 23,
    consentUpdates: 156,
    guardiansManaged: 45,
    todayActions: 89,
    riskAlerts: 3
  };

  const recentActivities = [
    {
      id: 1,
      type: 'consent',
      message: 'John Doe updated marketing preferences',
      timestamp: '2 minutes ago',
      priority: 'medium'
    },
    {
      id: 2,
      type: 'dsar',
      message: 'New DSAR request from Jane Smith',
      timestamp: '15 minutes ago',
      priority: 'high'
    },
    {
      id: 3,
      type: 'guardian',
      message: 'Guardian consent verified for Alex Johnson',
      timestamp: '1 hour ago',
      priority: 'low'
    }
  ];

  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
    setActiveSection('customer-profile');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <DashboardOverview stats={dashboardStats} activities={recentActivities} onSectionChange={setActiveSection} />;
      case 'customer-search':
        return <CustomerSearchForm onCustomerSelect={handleCustomerSelect} />;
      case 'consent-history':
        return <ConsentHistoryTable />;
      case 'preference-editor':
        return <PreferenceEditorForm />;
      case 'dsar-requests':
        return <DSARRequestPanel />;
      case 'guardian-consent':
        return <GuardianConsentForm />;
      case 'audit-logs':
        return <AuditLogTable />;
      case 'customer-profile':
        return <CustomerProfile customer={selectedCustomer} onBack={() => setActiveSection('customer-search')} onSectionChange={setActiveSection} />;
      default:
        return <DashboardOverview stats={dashboardStats} activities={recentActivities} onSectionChange={setActiveSection} />;
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 flex ${className}`}>
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
        <CSRHeader />
        
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
const DashboardOverview: React.FC<{ stats: any; activities: any[]; onSectionChange: (section: string) => void }> = ({ stats, activities, onSectionChange }) => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome to ConsentHub CSR Dashboard</h1>
            <p className="text-blue-100 text-sm sm:text-base">
              Manage customer consent, preferences, and data requests efficiently. 
              Your comprehensive tool for privacy compliance and customer service.
            </p>
          </div>
          <div className="hidden sm:block">
            <img 
              src="/SLTMobitel_Logo.svg.png" 
              alt="SLT Mobitel" 
              className="h-16 w-auto opacity-80"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers.toLocaleString()}
          icon={Users}
          color="blue"
          onClick={() => onSectionChange('customer-search')}
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingRequests}
          icon={Clock}
          color="orange"
          onClick={() => onSectionChange('dsar-requests')}
        />
        <StatCard
          title="Consent Updates"
          value={stats.consentUpdates}
          icon={CheckCircle}
          color="green"
          onClick={() => onSectionChange('consent-history')}
        />
        <StatCard
          title="Guardian Managed"
          value={stats.guardiansManaged}
          icon={Shield}
          color="purple"
          onClick={() => onSectionChange('guardian-consent')}
        />
        <StatCard
          title="Today's Actions"
          value={stats.todayActions}
          icon={TrendingUp}
          color="indigo"
          onClick={() => onSectionChange('audit-logs')}
        />
        <StatCard
          title="Risk Alerts"
          value={stats.riskAlerts}
          icon={AlertTriangle}
          color="red"
          onClick={() => onSectionChange('audit-logs')}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions onSectionChange={onSectionChange} />
        <RecentActivity activities={activities} onSectionChange={onSectionChange} />
      </div>

      {/* Recent Insights */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Consent Rate</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-2">87%</p>
            <p className="text-sm text-blue-600">↑ 3% from yesterday</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Resolved Requests</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-2">45</p>
            <p className="text-sm text-green-600">↑ 12% from yesterday</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">New Customers</span>
            </div>
            <p className="text-2xl font-bold text-orange-900 mt-2">23</p>
            <p className="text-sm text-orange-600">↑ 8% from yesterday</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{ title: string; value: string | number; icon: any; color: string; onClick?: () => void }> = ({
  title,
  value,
  icon: Icon,
  color,
  onClick
}) => {
  const colorClasses = {
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 border-blue-200',
    orange: 'bg-gradient-to-br from-orange-50 to-orange-100 text-orange-600 border-orange-200',
    green: 'bg-gradient-to-br from-green-50 to-green-100 text-green-600 border-green-200',
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600 border-purple-200',
    indigo: 'bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 border-indigo-200',
    red: 'bg-gradient-to-br from-red-50 to-red-100 text-red-600 border-red-200'
  };

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm p-6 border border-gray-200 transition-all duration-200 ${onClick ? 'hover:shadow-md cursor-pointer hover:scale-105' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]} border`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Component>
  );
};

// Quick Actions Component
const QuickActions: React.FC<{ onSectionChange: (section: string) => void }> = ({ onSectionChange }) => {
  const actions = [
    { id: 'customer-search', label: 'Search Customer', icon: Search, color: 'blue' },
    { id: 'consent-history', label: 'Manage Consent', icon: FileText, color: 'green' },
    { id: 'dsar-requests', label: 'DSAR Request', icon: Database, color: 'purple' },
    { id: 'guardian-consent', label: 'Guardian Consent', icon: Shield, color: 'indigo' },
    { id: 'preference-editor', label: 'Preferences', icon: Settings, color: 'orange' },
    { id: 'audit-logs', label: 'Audit Logs', icon: Database, color: 'red' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map(action => (
          <button
            key={action.id}
            onClick={() => onSectionChange(action.id)}
            className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-blue-50 hover:to-blue-100 hover:border-blue-200 transition-all duration-200 text-left border border-gray-200 group"
          >
            <action.icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
            <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Recent Activity Component
const RecentActivity: React.FC<{ activities: any[]; onSectionChange: (section: string) => void }> = ({ activities, onSectionChange }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'consent':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'dsar':
        return <Database className="w-4 h-4 text-purple-600" />;
      case 'guardian':
        return <Shield className="w-4 h-4 text-green-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActivitySection = (type: string) => {
    switch (type) {
      case 'consent':
        return 'consent-history';
      case 'dsar':
        return 'dsar-requests';
      case 'guardian':
        return 'guardian-consent';
      default:
        return 'overview';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activities.map(activity => (
          <button
            key={activity.id}
            onClick={() => onSectionChange(getActivitySection(activity.type))}
            className="w-full flex items-start space-x-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:from-blue-50 hover:to-blue-100 hover:border-blue-200 transition-all duration-200 text-left"
          >
            <div className="flex-shrink-0 mt-1 p-2 bg-white rounded-full shadow-sm">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 mb-1">{activity.message}</p>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">{activity.timestamp}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(activity.priority)}`}>
                  {activity.priority}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
      <button 
        onClick={() => onSectionChange('audit-logs')}
        className="w-full mt-4 p-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-medium rounded-lg transition-colors border border-blue-200"
      >
        View All Activities
      </button>
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
