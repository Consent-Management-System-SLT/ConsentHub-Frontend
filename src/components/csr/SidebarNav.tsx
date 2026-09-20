import React from 'react';
import {
  Home,
  Search,
  FileText,
  Database,
  Shield,
  Activity,
  UserCheck,
  Bell,
  MessageSquare,
  Smartphone,
} from 'lucide-react';
import DashboardSidebar, { NavItem } from '../shared/DashboardSidebar';

export const csrNavItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: Home, description: 'Overview and statistics' },
  { id: 'customer-search', label: 'Customer Search', icon: Search, description: 'Find and manage customers' },
  { id: 'consent-history', label: 'Consent History', icon: FileText, description: 'Customer consent records' },
  { id: 'consent-management', label: 'Consent Management', icon: Shield, description: 'Update customer consents' },
  { id: 'preference-editor', label: 'Communication Preferences', icon: MessageSquare, description: 'Channels and topics' },
  { id: 'vas-management', label: 'VAS Management', icon: Smartphone, description: 'Service subscriptions' },
  { id: 'notification-center', label: 'Notification Center', icon: Bell, description: 'Notifications and campaigns' },
  { id: 'dsar-requests', label: 'DSAR Requests', icon: Database, description: 'Subject access requests' },
  { id: 'guardian-consent', label: 'Guardian Consent', icon: UserCheck, description: 'Consent for minors' },
  { id: 'audit-logs', label: 'Audit Logs', icon: Activity, description: 'Recorded system activity' },
];

interface SidebarNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const SidebarNav: React.FC<SidebarNavProps> = (props) => (
  <DashboardSidebar navId="csr-nav" navLabel="CSR sections" items={csrNavItems} {...props} />
);

export default SidebarNav;
