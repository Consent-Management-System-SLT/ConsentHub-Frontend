import React, { useState } from 'react';

// Import admin components
import AdminHeader from './admin/AdminHeader';
import AdminSidebar from './admin/AdminSidebar';
import DashboardHome from './admin/DashboardHome';
import ConsentOverviewTable from './admin/ConsentOverviewTable';
import GuardianConsent from './admin/GuardianConsent';
import PreferenceManagerNew from './admin/PreferenceManagerNew';
import TopicPreferences from './admin/TopicPreferences';
import { PrivacyNotices } from './PrivacyNotices';
import DSARManager from './admin/DSARManager';
import DSARAutomation from './admin/DSARAutomation';
import AuditLogViewer from './admin/AuditLogViewer';
import BulkImportManager from './admin/BulkImportManager';
import EventListenerManager from './admin/EventListenerManager';
import UserManagement from './admin/UserManagement';
import CustomerManagement from './admin/CustomerManagement';
import ComplianceRulesManager from './admin/ComplianceRulesManager';
import ServerConnectionAlert from './shared/ServerConnectionAlert';

interface AdminDashboardProps {
  className?: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ className = '' }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showConnectionAlert, setShowConnectionAlert] = useState(true);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardHome />;
      case 'consents':
        return <ConsentOverviewTable />;
      case 'guardian-consent':
        return <GuardianConsent />;
      case 'preferences':
        return <PreferenceManagerNew />;
      case 'topic-preferences':
        return <TopicPreferences />;
      case 'privacy-notices':
        return <PrivacyNotices />;
      case 'dsar-requests':
        return <DSARManager />;
      case 'dsar-automation':
        return <DSARAutomation />;
      case 'audit-logs':
        return <AuditLogViewer />;
      case 'bulk-import':
        return <BulkImportManager />;
      case 'event-listeners':
        return <EventListenerManager />;
      case 'user-management':
        return <UserManagement />;
      case 'customer-management':
        return <CustomerManagement />;
      case 'compliance-rules':
        return <ComplianceRulesManager />;
      default:
        return <DashboardHome />;
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
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      {/* Main content area */}
      <div className="flex-1 lg:ml-0 flex flex-col">
        {/* Header */}
        <AdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
