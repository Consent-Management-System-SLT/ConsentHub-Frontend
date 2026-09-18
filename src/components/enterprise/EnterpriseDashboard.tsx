import React, { useState, useEffect } from 'react';
import { Megaphone, Users, Activity } from 'lucide-react';
import { multiServiceApiClient, API_SERVICES } from '../../services/multiServiceApiClient';
import DashboardHeader from '../shared/DashboardHeader';
import DashboardFooter from '../shared/DashboardFooter';
import DashboardSidebar, { NavItem } from '../shared/DashboardSidebar';
import CampaignList from './CampaignList';
import CampaignWizard from './CampaignWizard';
import CampaignDetail from './CampaignDetail';

type Tab = 'overview' | 'campaigns' | 'audience';

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: Activity, description: 'Campaign performance' },
  { id: 'campaigns', label: 'Campaigns', icon: Megaphone, description: 'Create and track campaigns' },
  { id: 'audience', label: 'Audience Builder', icon: Users, description: 'Target and estimate reach' },
];

const EnterpriseDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  
  // Campaign view states
  const [campaignView, setCampaignView] = useState<'list' | 'wizard' | 'detail'>('list');
  const [editCampaignId, setEditCampaignId] = useState<string | undefined>(undefined);
  const [viewCampaignId, setViewCampaignId] = useState<string | undefined>(undefined);

  const [metrics, setMetrics] = useState({
    activeCampaigns: 0,
    totalReach: 0,
    consentRate: 0
  });

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchAnalytics();
    }
  }, [activeTab]);

  const fetchAnalytics = async () => {
    try {
      const res = await multiServiceApiClient.get('/enterprise/analytics', { service: API_SERVICES.CONSENT });
      if (res.data.success) {
        setMetrics({
          activeCampaigns: res.data.metrics.totalCampaigns || 0,
          totalReach: res.data.metrics.deliveries?.total || 0,
          consentRate: res.data.metrics.grantRate || 0
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <DashboardHeader
        subtitle="Partner Portal"
        navId="enterprise-nav"
        sidebarOpen={sidebarOpen}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        onRefresh={fetchAnalytics}
      />

      {/* Rail and content each scroll on their own */}
      <div className="flex flex-1 min-h-0">
        <DashboardSidebar
          navId="enterprise-nav"
          navLabel="Partner sections"
          items={navItems}
          activeSection={activeTab}
          onSectionChange={(id) => { setActiveTab(id as Tab); setCampaignView('list'); }}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-4 sm:p-5 lg:p-6"
        >
          {activeTab === 'overview' && (
            <>
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Overview</h1>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">Campaign reach and consent performance</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
                <h3 className="text-sm font-medium text-slate-600 mb-2">Active Campaigns</h3>
                <p className="text-3xl font-bold text-slate-800">{metrics.activeCampaigns}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
                <h3 className="text-sm font-medium text-slate-600 mb-2">Total Reach</h3>
                <p className="text-3xl font-bold text-slate-800">{metrics.totalReach}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
                <h3 className="text-sm font-medium text-slate-600 mb-2">Consent Rate</h3>
                <p className="text-3xl font-bold text-slate-800">{metrics.consentRate}%</p>
              </div>
            </div>
            </>
          )}
          
          {activeTab === 'campaigns' && (
            <>
              {campaignView === 'list' && (
                <CampaignList 
                  onCreateNew={() => { setEditCampaignId(undefined); setCampaignView('wizard'); }}
                  onViewDetail={(id) => { setViewCampaignId(id); setCampaignView('detail'); }}
                />
              )}
              {campaignView === 'wizard' && (
                <CampaignWizard 
                  editCampaignId={editCampaignId}
                  onCancel={() => setCampaignView('list')}
                  onComplete={() => setCampaignView('list')}
                />
              )}
              {campaignView === 'detail' && viewCampaignId && (
                <CampaignDetail
                  campaignId={viewCampaignId}
                  onBack={() => setCampaignView('list')}
                  onEdit={(id) => { setEditCampaignId(id); setCampaignView('wizard'); }}
                />
              )}
            </>
          )}

          {activeTab === 'audience' && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <h2 className="text-lg font-medium text-slate-800 mb-2">Audience Builder</h2>
              <p className="mb-4">Use the Campaign Wizard to build and estimate your audience.</p>
              <button 
                onClick={() => { setActiveTab('campaigns'); setEditCampaignId(undefined); setCampaignView('wizard'); }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Go to Campaign Wizard
              </button>
            </div>
          )}
        </main>
      </div>

      <DashboardFooter />
    </div>
  );
};

export default EnterpriseDashboard;
