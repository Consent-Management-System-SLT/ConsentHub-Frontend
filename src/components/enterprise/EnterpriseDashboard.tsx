import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Building, Megaphone, Users, Activity } from 'lucide-react';
import { multiServiceApiClient, API_SERVICES } from '../../services/multiServiceApiClient';
import CampaignList from './CampaignList';
import CampaignWizard from './CampaignWizard';
import CampaignDetail from './CampaignDetail';

const EnterpriseDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'audience'>('overview');
  
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
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <Building className="h-6 w-6 text-blue-400" />
            <span className="font-bold text-lg">Partner Portal</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">Enterprise Console</div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => { setActiveTab('overview'); setCampaignView('list'); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Overview</span>
          </button>
          <button 
            onClick={() => { setActiveTab('campaigns'); setCampaignView('list'); }}
            className={`w-full flex flex-wrap items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              activeTab === 'campaigns' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Megaphone className="h-4 w-4" />
            <span>Campaigns</span>
          </button>
          <button 
            onClick={() => { setActiveTab('audience'); setCampaignView('list'); }}
            className={`w-full flex flex-wrap items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              activeTab === 'audience' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Audience Builder</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="mb-4">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.organization || 'Enterprise User'}</p>
          </div>
          <button 
            onClick={logout}
            className="w-full flex flex-wrap items-center gap-2 px-3 py-2 text-red-400 hover:bg-slate-800 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4">
          <h1 className="text-2xl font-bold text-slate-800 capitalize">
            {activeTab}
          </h1>
        </header>
        
        <main className="p-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
                <h3 className="text-sm font-medium text-slate-500 mb-2">Active Campaigns</h3>
                <p className="text-3xl font-bold text-slate-800">{metrics.activeCampaigns}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
                <h3 className="text-sm font-medium text-slate-500 mb-2">Total Reach</h3>
                <p className="text-3xl font-bold text-slate-800">{metrics.totalReach}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
                <h3 className="text-sm font-medium text-slate-500 mb-2">Consent Rate</h3>
                <p className="text-3xl font-bold text-slate-800">{metrics.consentRate}%</p>
              </div>
            </div>
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
    </div>
  );
};

export default EnterpriseDashboard;
