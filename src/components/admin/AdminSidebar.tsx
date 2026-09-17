import React from 'react';
import {
  BarChart3,
  Shield,
  FileText,
  Database,
  Activity,
  Upload,
  Webhook,
  Users,
  UserCheck,
  Zap,
  Cog,
  Smartphone,
  Megaphone,
  ScrollText,
  ShieldCheck,
} from 'lucide-react';
import DashboardSidebar, { NavItem } from '../shared/DashboardSidebar';

export const adminNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, description: 'Overview and analytics' },
  { id: 'enterprise-management', label: 'Enterprise Management', icon: Webhook, description: 'Manage enterprise registrations' },
  { id: 'enterprise-campaigns', label: 'Enterprise Campaigns', icon: Megaphone, description: 'Review and approve campaigns' },
  { id: 'consents', label: 'Consents', icon: Shield, description: 'Manage all customer consents' },
  { id: 'guardian-consent', label: 'Guardian Consent', icon: UserCheck, description: 'Consent for minors' },
  { id: 'preference-management', label: 'Preference Management', icon: Cog, description: 'Channels and topic preferences' },
  { id: 'vas-management', label: 'VAS Management', icon: Smartphone, description: 'Value Added Services' },
  { id: 'privacy-notices', label: 'Privacy Notices', icon: FileText, description: 'Manage privacy policies' },
  { id: 'dsar-requests', label: 'DSAR Requests', icon: Database, description: 'Data subject access requests' },
  { id: 'dsar-automation', label: 'DSAR Automation', icon: Zap, description: 'Automated DSAR processing' },
  { id: 'audit-logs', label: 'Audit Logs', icon: ScrollText, description: 'Recorded system activity' },
  { id: 'bulk-import', label: 'Bulk Import', icon: Upload, description: 'Import customer data' },
  { id: 'event-listeners', label: 'Event Listeners', icon: Activity, description: 'System events and errors' },
  { id: 'user-management', label: 'User Management', icon: Users, description: 'Manage users and roles' },
  { id: 'customer-management', label: 'Customer Management', icon: UserCheck, description: 'Customer accounts and data' },
  { id: 'compliance-rules', label: 'Compliance Rules', icon: ShieldCheck, description: 'Automated compliance rules' },
];

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = (props) => (
  <DashboardSidebar navId="admin-nav" navLabel="Admin sections" items={adminNavItems} {...props} />
);

export default AdminSidebar;
