import React, { useState } from 'react';
import CustomerHeader from './CustomerHeader';
import CustomerSidebar from './CustomerSidebar';
import CustomerDashboardOverview from './CustomerDashboardOverview';
import ConsentCenter from './ConsentCenter';
import CustomerPreferences from './CustomerPreferences';
import CustomerPrivacyNotices from './CustomerPrivacyNotices';
import CustomerDSARRequests from './CustomerDSARRequests';

interface CustomerMainDashboardProps {
  customerName?: string;
  onLogout?: () => void;
}

const CustomerMainDashboard: React.FC<CustomerMainDashboardProps> = ({ 
  customerName = "John Doe", 
  onLogout = () => console.log('Logout clicked') 
}) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <CustomerDashboardOverview customerName={customerName} />;
      case 'consent-center':
        return <ConsentCenter />;
      case 'preferences':
        return <CustomerPreferences />;
      case 'privacy-notices':
        return <CustomerPrivacyNotices />;
      case 'dsar-requests':
        return <CustomerDSARRequests />;
      default:
        return <CustomerDashboardOverview customerName={customerName} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <CustomerSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main content area */}
      <div className="flex-1 lg:ml-0 flex flex-col">
        {/* Header */}
        <CustomerHeader customerName={customerName} onLogout={onLogout} onProfileClick={() => setShowProfile(true)} />

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {activeSection === 'dashboard' ? (
              <CustomerDashboardOverview customerName={customerName} showProfile={showProfile} setShowProfile={setShowProfile} />
            ) : renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CustomerMainDashboard;
