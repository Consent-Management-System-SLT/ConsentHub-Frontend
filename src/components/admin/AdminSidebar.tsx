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
  ListChecks,
} from 'lucide-react';
import DashboardSidebar, { NavItem } from '../shared/DashboardSidebar';

export const adminNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, description: 'Overview and analytics' },
  { id: 'enterprise-management', label: 'Enterprise Management', icon: Webhook, description: 'Registrations and approvals' },
  { id: 'enterprise-campaigns', label: 'Enterprise Campaigns', icon: Megaphone, description: 'Review and approve' },
  { id: 'consent-management', label: 'Consent Management', icon: Shield, description: 'Consent types customers can be asked to accept' },
  { id: 'consent-catalog', label: 'Consent Catalog', icon: ListChecks, description: 'Versions and categories' },
  { id: 'consents', label: 'Customer Consents', icon: Shield, description: 'Read-only customer decision history' },
  { id: 'guardian-consent', label: 'Guardian Consent', icon: UserCheck, description: 'Consent for minors' },
  { id: 'preference-management', label: 'Preference Management', icon: Cog, description: 'Channels and topics' },
  { id: 'vas-management', label: 'VAS Management', icon: Smartphone, description: 'Value Added Services' },
  { id: 'privacy-notices', label: 'Privacy Notices', icon: FileText, description: 'Manage privacy policies' },
  { id: 'dsar-requests', label: 'DSAR Requests', icon: Database, description: 'Subject access requests' },
  { id: 'dsar-automation', label: 'DSAR Automation', icon: Zap, description: 'Automated processing' },
  { id: 'audit-logs', label: 'Audit Logs', icon: ScrollText, description: 'Recorded system activity' },
  { id: 'bulk-import', label: 'Bulk Import', icon: Upload, description: 'Import customer data' },
  { id: 'event-listeners', label: 'Event Listeners', icon: Activity, description: 'Events and errors' },
  { id: 'user-management', label: 'User Management', icon: Users, description: 'Users and roles' },
  { id: 'customer-management', label: 'Customer Management', icon: UserCheck, description: 'Accounts and data' },
  { id: 'compliance-rules', label: 'Compliance Rules', icon: ShieldCheck, description: 'Automated rule checks' },
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
