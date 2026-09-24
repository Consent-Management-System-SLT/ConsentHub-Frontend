import React, { useState } from 'react';
// Import admin components
import DashboardHeader from './shared/DashboardHeader';
import DashboardFooter from './shared/DashboardFooter';
import AdminSidebar from './admin/AdminSidebar';
import DashboardHome from './admin/DashboardHome';
import CustomerConsentsTable from './admin/CustomerConsentsTable';
import ConsentManagement from './admin/ConsentManagement';
import ConsentCatalogManager from './admin/ConsentCatalogManager';
// import GuardianConsent from './admin/GuardianConsent'; // hidden
import PreferenceManagement from './admin/PreferenceManagementNew';
// import VASManagement from './admin/VASManagement'; // hidden
import { PrivacyNotices } from './PrivacyNotices';
import DSARManager from './admin/DSARManager';
import DSARAutomation from './admin/DSARAutomation';
import AuditLogViewer from './admin/AuditLogViewer';
import BulkImportManager from './admin/BulkImportManager';
import EventListenerManager from './admin/EventListenerManager';
import UserManagement from './admin/UserManagement';
import CustomerManagement from './admin/CustomerManagement';
import EnterpriseManagement from './admin/EnterpriseManagement';
import EnterpriseCampaignReview from './admin/EnterpriseCampaignReview';
import ComplianceRulesManager from './admin/ComplianceRulesManager';
import ServerConnectionAlert from './shared/ServerConnectionAlert';

interface AdminDashboardProps {
  className?: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ className = '' }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showConnectionAlert, setShowConnectionAlert] = useState(true);
  // Bumping this remounts the active section, which re-runs its data fetch.
  const [refreshKey, setRefreshKey] = useState(0);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardHome />;
      case 'enterprise-management':
        return <EnterpriseManagement />;
      case 'enterprise-campaigns':
        return <EnterpriseCampaignReview />;
      case 'consents':
        return <CustomerConsentsTable />;
      case 'consent-management':
        return <ConsentManagement />;
      case 'consent-catalog':
        return <ConsentCatalogManager />;
      // case 'guardian-consent':
      //   return <GuardianConsent />;
      case 'preference-management':
        return <PreferenceManagement />;
      // case 'vas-management':
      //   return <VASManagement />;
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
    <div className={`h-screen bg-slate-50 flex flex-col overflow-hidden ${className}`}>
      {/* Server Connection Alert */}
      {showConnectionAlert && (
        <ServerConnectionAlert 
          onClose={() => setShowConnectionAlert(false)}
          autoHide={true}
          autoHideDelay={4000}
        />
      )}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <DashboardHeader
        subtitle="Admin Dashboard"
        navId="admin-nav"
        onRefresh={() => setRefreshKey((k) => k + 1)}
        sidebarOpen={sidebarOpen}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Rail and content each scroll on their own */}
      <div className="flex flex-1 min-h-0">
        <AdminSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden"
        >
          <div className="p-4 sm:p-5 lg:p-6">
            <div className="max-w-7xl mx-auto" key={refreshKey}>
              {renderContent()}
            </div>
          </div>
        </main>
      </div>

      <DashboardFooter />
    </div>
  );
};

export default AdminDashboard;
