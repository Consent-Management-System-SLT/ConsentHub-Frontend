import React from 'react';
import { useTranslation } from 'react-i18next';
import { Home, Shield, Settings, FileText, Download, Zap } from 'lucide-react';
import DashboardSidebar, { NavItem } from '../shared/DashboardSidebar';

/** Labels come from i18n, so the items are built per render rather than hoisted. */
const SECTIONS = [
  { id: 'dashboard', icon: Home, key: 'dashboard' },
  { id: 'consent-center', icon: Shield, key: 'consentCenter' },
  { id: 'preferences', icon: Settings, key: 'preferences' },
  { id: 'value-added-services', icon: Zap, key: 'valueAddedServices' },
  { id: 'privacy-notices', icon: FileText, key: 'privacyNotices' },
  { id: 'dsar-requests', icon: Download, key: 'dsarRequests' },
];

interface CustomerSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const CustomerSidebar: React.FC<CustomerSidebarProps> = (props) => {
  const { t } = useTranslation();
  const items: NavItem[] = SECTIONS.map((s) => ({
    id: s.id,
    icon: s.icon,
    label: t(`customerDashboard.navigation.${s.key}`),
    description: t(`customerDashboard.navigation.${s.key}Desc`),
  }));

  return (
    <DashboardSidebar
      navId="customer-nav"
      navLabel={t('customerDashboard.navigation.ariaLabel', 'Dashboard sections')}
      items={items}
      {...props}
    />
  );
};

export default CustomerSidebar;
