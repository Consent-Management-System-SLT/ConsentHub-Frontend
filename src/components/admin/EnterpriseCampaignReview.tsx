import React, { useState, useEffect } from 'react';
import { multiServiceApiClient, API_SERVICES } from '../../services/multiServiceApiClient';
import { CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';

const EnterpriseCampaignReview: React.FC = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await multiServiceApiClient.get('/admin/enterprise/campaigns', { service: API_SERVICES.CONSENT });
      if (res.data.success) {
        setCampaigns(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'approve' | 'reject' | 'request-changes') => {
    try {
      if ((action === 'reject' || action === 'request-changes') && !reason) {
        alert('Please provide a reason');
        return;
      }

      await multiServiceApiClient.post(`/admin/enterprise/campaigns/${selectedCampaign._id}/${action}`, 
        { reason }, 
        { service: API_SERVICES.CONSENT }
      );
      
      alert(`Campaign ${action}d successfully`);
      setSelectedCampaign(null);
      setReason('');
      fetchCampaigns();
    } catch (error) {
      alert(`Failed to ${action} campaign`);
    }
  };

  if (loading) return <div className="p-8">Loading campaigns...</div>;

  if (selectedCampaign) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <button onClick={() => setSelectedCampaign(null)} className="mb-4 text-blue-600 hover:underline">
          &larr; Back to List
        </button>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{selectedCampaign.campaignName}</h2>
              <p className="text-slate-500">By: {selectedCampaign.organizationId?.legalName}</p>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {selectedCampaign.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
             <div>
                <p className="text-sm text-slate-500">Purpose</p>
                <p className="font-medium">{selectedCampaign.purposeId?.name}</p>
             </div>
             <div>
                <p className="text-sm text-slate-500">Channels</p>
                <p className="font-medium">{selectedCampaign.channels?.join(', ')}</p>
             </div>
             <div className="col-span-2">
                <p className="text-sm text-slate-500">Description</p>
                <p className="font-medium">{selectedCampaign.description}</p>
             </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-medium mb-2 text-slate-700">Review Decision</h3>
            <textarea 
              className="w-full border rounded-md p-3 h-24 mb-4" 
              placeholder="Provide reason for rejection or changes..."
              value={reason}
              onChange={e => setReason(e.target.value)}
             aria-label="Provide reason for rejection or changes"/>
            <div className="flex gap-3">
              <button onClick={() => handleAction('approve')} className="flex flex-wrap items-center gap-2 bg-green-700 text-white px-4 py-2 rounded hover:bg-green-700">
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
              <button onClick={() => handleAction('request-changes')} className="flex flex-wrap items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
                <AlertCircle className="w-4 h-4" /> Request Changes
              </button>
              <button onClick={() => handleAction('reject')} className="flex flex-wrap items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                <XCircle className="w-4 h-4" /> Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Enterprise Campaign Review</h1>
      
      {campaigns.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center border text-slate-500">
          No campaigns pending review.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Enterprise</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Campaign Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => (
                <tr key={c._id} className="border-b hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-700 font-medium">{c.organizationId?.legalName}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{c.campaignName}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 text-right">
                    <button onClick={() => setSelectedCampaign(c)} className="text-blue-600 hover:underline">
                      Review <Eye className="w-4 h-4 inline" />
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

export default EnterpriseCampaignReview;
