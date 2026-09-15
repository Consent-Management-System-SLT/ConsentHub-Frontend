import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Send, Edit, Trash } from 'lucide-react';
import { multiServiceApiClient, API_SERVICES } from '../../services/multiServiceApiClient';

interface CampaignDetailProps {
  campaignId: string;
  onBack: () => void;
  onEdit: (id: string) => void;
}

const CampaignDetail: React.FC<CampaignDetailProps> = ({ campaignId, onBack, onEdit }) => {
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [campaignId]);

  const fetchDetail = async () => {
    try {
      const res = await multiServiceApiClient.get(`/enterprise/campaigns/${campaignId}`, {
        service: API_SERVICES.CONSENT
      });
      if (res.data.success) {
        setCampaign(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const submitCampaign = async () => {
    try {
      const res = await multiServiceApiClient.post(`/enterprise/campaigns/${campaignId}/submit`, {}, {
        service: API_SERVICES.CONSENT
      });
      if (res.data.success) {
        alert('Campaign submitted for approval');
        fetchDetail();
      }
    } catch (error) {
      alert('Failed to submit campaign');
    }
  };

  const launchCampaign = async () => {
    try {
      const res = await multiServiceApiClient.post(`/enterprise/campaigns/${campaignId}/launch`, {}, {
        service: API_SERVICES.CONSENT
      });
      if (res.data.success) {
        alert('Campaign launched!');
        fetchDetail();
      }
    } catch (error) {
      alert('Failed to launch campaign');
    }
  };

  if (loading) return <div>Loading details...</div>;
  if (!campaign) return <div>Campaign not found</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold text-slate-800">{campaign.campaignName}</h2>
          <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-medium">
            {campaign.status}
          </span>
        </div>
        <div className="flex gap-2">
          {(campaign.status === 'DRAFT' || campaign.status === 'CHANGES_REQUIRED') && (
            <>
              <button onClick={() => onEdit(campaign._id)} className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md">
                Edit
              </button>
              <button onClick={submitCampaign} className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center gap-2">
                <Send className="w-4 h-4" />
                Submit for Approval
              </button>
            </>
          )}
          {campaign.status === 'APPROVED' && (
            <button onClick={launchCampaign} className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-md flex items-center gap-2">
              <Play className="w-4 h-4" />
              Launch Campaign
            </button>
          )}
        </div>
      </div>

      <div className="p-6 grid grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-1">Description</h3>
            <p className="text-slate-800">{campaign.description}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-1">Purpose</h3>
            <p className="text-slate-800">{campaign.purposeId?.name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-1">Scopes</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              {campaign.scopeIds?.map((s: any) => (
                <span key={s._id} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs border border-blue-100">
                  {s.name}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-1">Channels</h3>
            <p className="text-slate-800">{campaign.channels?.join(', ')}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-1">Audience</h3>
            <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 block">Age Range</span>
                  <span className="font-medium text-slate-800">
                    {campaign.audienceDefinition?.ageRange?.min || 0} - {campaign.audienceDefinition?.ageRange?.max || 'Any'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Region</span>
                  <span className="font-medium text-slate-800">{campaign.audienceDefinition?.region || 'All Regions'}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <h3 className="text-sm font-medium text-slate-500 mb-1">Start Date</h3>
                <p className="text-slate-800">{campaign.campaignStart ? new Date(campaign.campaignStart).toLocaleDateString() : 'Not set'}</p>
             </div>
             <div>
                <h3 className="text-sm font-medium text-slate-500 mb-1">End Date</h3>
                <p className="text-slate-800">{campaign.campaignEnd ? new Date(campaign.campaignEnd).toLocaleDateString() : 'Not set'}</p>
             </div>
          </div>
          {campaign.rejectionReason && (
            <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-800 text-sm">
              <strong>Reviewer Notes:</strong> {campaign.rejectionReason}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
