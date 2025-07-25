import React, { useState } from 'react';
import { 
  BarChart3, 
  Shield, 
  Settings, 
  FileText, 
  Database, 
  Activity, 
  Upload, 
  Webhook, 
  Users, 
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Clock,
  Eye,
  Download,
  Filter
} from 'lucide-react';

// Import admin components
import AdminHeader from './admin/AdminHeader';
import AdminSidebar from './admin/AdminSidebar';
import DashboardHome from './admin/DashboardHome';
import ConsentOverviewTable from './admin/ConsentOverviewTable';
import PreferenceManager from './admin/PreferenceManager';
import PrivacyNoticeManager from './admin/PrivacyNoticeManager';
import DSARManager from './admin/DSARManager';
import AuditLogViewer from './admin/AuditLogViewer';
import BulkImportManager from './admin/BulkImportManager';
import EventListenerManager from './admin/EventListenerManager';
import UserManagement from './admin/UserManagement';
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
      case 'preferences':
        return <PreferenceManager />;
      case 'privacy-notices':
        return <PrivacyNoticeManager />;
      case 'dsar-requests':
        return <DSARManager />;
      case 'audit-logs':
        return <AuditLogViewer />;
      case 'bulk-import':
        return <BulkImportManager />;
      case 'event-listeners':
        return <EventListenerManager />;
      case 'user-management':
        return <UserManagement />;
      case 'compliance-rules':
        return <ComplianceRulesManager />;
      default:
        return <DashboardHome />;
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
