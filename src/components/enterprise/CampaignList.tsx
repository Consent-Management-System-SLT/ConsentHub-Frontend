import React, { useState, useEffect } from 'react';
import { Eye, Edit, Trash, Play, Send } from 'lucide-react';
import { multiServiceApiClient, API_SERVICES } from '../../services/multiServiceApiClient';

interface Campaign {
  _id: string;
  campaignName: string;
  purposeId: any;
  channels: string[];
  audienceDefinition: any;
  campaignStart: string;
  campaignEnd: string;
  status: string;
  createdAt: string;
}

interface CampaignListProps {
  onCreateNew: () => void;
  onViewDetail: (id: string) => void;
}

const CampaignList: React.FC<CampaignListProps> = ({ onCreateNew, onViewDetail }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await multiServiceApiClient.get('/enterprise/campaigns', {
        service: API_SERVICES.CONSENT
      });
      if (response.data.success) {
        setCampaigns(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch campaigns', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-slate-100 text-slate-800';
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800';
      case 'UNDER_REVIEW': return 'bg-purple-100 text-purple-800';
      case 'CHANGES_REQUIRED': return 'bg-orange-100 text-orange-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'RUNNING': return 'bg-emerald-100 text-emerald-800';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-slate-200 text-slate-600';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) return <div>Loading campaigns...</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">Campaigns</h2>
        <button 
          onClick={onCreateNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Create Campaign
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="p-12 text-center text-slate-500">
          <p className="mb-4">No Campaigns Yet</p>
          <p className="text-sm">Create your first partner campaign to reach consented customers.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600">
                <th scope="col" className="p-4 font-medium">Campaign Name</th>
                <th scope="col" className="p-4 font-medium">Channel</th>
                <th scope="col" className="p-4 font-medium">Dates</th>
                <th scope="col" className="p-4 font-medium">Status</th>
                <th scope="col" className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {campaigns.map((camp) => (
                <tr key={camp._id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-800">{camp.campaignName}</td>
                  <td className="p-4 text-slate-600">{camp.channels?.join(', ')}</td>
                  <td className="p-4 text-slate-600">
                    {new Date(camp.campaignStart).toLocaleDateString()} - {new Date(camp.campaignEnd).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(camp.status)}`}>
                      {camp.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => onViewDetail(camp._id)} className="text-blue-600 hover:text-blue-800" title="View Details">
                      <Eye className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CampaignList;
