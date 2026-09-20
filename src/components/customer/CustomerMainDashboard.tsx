import React, { useState } from 'react';
import DashboardHeader from '../shared/DashboardHeader';
import DashboardFooter from '../shared/DashboardFooter';
import CustomerSidebar from './CustomerSidebar';
import CustomerDashboardOverview from './CustomerDashboardOverview';
import ConsentCenter from './ConsentCenter';
import CustomerPreferences from './CustomerPreferences';
import CustomerPrivacyNotices from './CustomerPrivacyNotices';
import CustomerDSARRequests from './CustomerDSARRequests';
import ValueAddedServices from './ValueAddedServices';
interface CustomerMainDashboardProps {
  customerName?: string;
}
const CustomerMainDashboard: React.FC<CustomerMainDashboardProps> = ({
  customerName = 'Customer',
}) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  // Bumping this remounts the active section, which re-runs its data fetch.
  const [refreshKey, setRefreshKey] = useState(0);
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <CustomerDashboardOverview customerName={customerName} />;
      case 'consent-center':
        return <ConsentCenter />;
      case 'preferences':
        return <CustomerPreferences />;
      case 'value-added-services':
        return <ValueAddedServices />;
      case 'privacy-notices':
        return <CustomerPrivacyNotices />;
      case 'dsar-requests':
        return <CustomerDSARRequests />;
      default:
        return <CustomerDashboardOverview customerName={customerName} />;
    }
  };
  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <DashboardHeader
        subtitle="My Privacy Dashboard"
        navId="customer-nav"
        sidebarOpen={sidebarOpen}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        onRefresh={() => setRefreshKey((k) => k + 1)}
        onOpenSettings={() => setShowProfile(true)}
      />

      {/* Rail and content each scroll on their own */}
      <div className="flex flex-1 min-h-0">
        <CustomerSidebar
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
              {activeSection === 'dashboard' ? (
                <CustomerDashboardOverview
                  customerName={customerName}
                  showProfile={showProfile}
                  setShowProfile={setShowProfile}
                  onNavigate={setActiveSection}
                />
              ) : renderContent()}
            </div>
          </div>
        </main>
      </div>

      <DashboardFooter />
    </div>
  );
};
export default CustomerMainDashboard;
