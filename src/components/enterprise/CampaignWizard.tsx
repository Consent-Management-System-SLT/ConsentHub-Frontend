import React, { useState, useEffect } from 'react';
import { multiServiceApiClient, API_SERVICES } from '../../services/multiServiceApiClient';
import { ArrowLeft } from 'lucide-react';

interface CampaignWizardProps {
  onCancel: () => void;
  onComplete: () => void;
  editCampaignId?: string;
}

const CampaignWizard: React.FC<CampaignWizardProps> = ({ onCancel, onComplete, editCampaignId }) => {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<any>(null);
  const [consentTemplates, setConsentTemplates] = useState<any[]>([]);
  const [messageTemplates, setMessageTemplates] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    campaignName: '',
    description: '',
    purposeId: '',
    scopes: [] as string[],
    channels: [] as string[],
    ageMin: '',
    ageMax: '',
    region: 'All Regions',
    consentTemplateVersionId: '',
    messageTemplateId: '',
    campaignStart: '',
    campaignEnd: ''
  });

  const [estimatedReach, setEstimatedReach] = useState<number | null>(null);

  useEffect(() => {
    fetchConfig();
    fetchTemplates();
    if (editCampaignId) {
       fetchExistingCampaign();
    }
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await multiServiceApiClient.get('/enterprise/configuration', { service: API_SERVICES.CONSENT });
      if (res.data.success) setConfig(res.data.data);
    } catch (e) {}
  };

  const fetchTemplates = async () => {
    try {
      const cons = await multiServiceApiClient.get('/enterprise/consent-templates', { service: API_SERVICES.CONSENT });
      if (cons.data.success) setConsentTemplates(cons.data.data);

      const msg = await multiServiceApiClient.get('/enterprise/message-templates', { service: API_SERVICES.CONSENT });
      if (msg.data.success) setMessageTemplates(msg.data.data);
    } catch (e) {}
  };

  const fetchExistingCampaign = async () => {
      try {
        const res = await multiServiceApiClient.get(`/enterprise/campaigns/${editCampaignId}`, { service: API_SERVICES.CONSENT });
        if (res.data.success) {
            const c = res.data.data;
            setFormData({
                campaignName: c.campaignName,
                description: c.description,
                purposeId: c.purposeId._id || c.purposeId,
                scopes: c.scopeIds.map((s:any) => s._id || s),
                channels: c.channels,
                ageMin: c.audienceDefinition?.ageRange?.min || '',
                ageMax: c.audienceDefinition?.ageRange?.max || '',
                region: c.audienceDefinition?.region || 'All Regions',
                consentTemplateVersionId: c.consentTemplateVersionId || '',
                messageTemplateId: c.messageTemplateId || '',
                campaignStart: c.campaignStart ? new Date(c.campaignStart).toISOString().split('T')[0] : '',
                campaignEnd: c.campaignEnd ? new Date(c.campaignEnd).toISOString().split('T')[0] : ''
            });
        }
      } catch(e) {}
  };

  const estimateReach = async () => {
    try {
      const res = await multiServiceApiClient.post('/enterprise/audience/estimate', {
        ageRange: { min: formData.ageMin, max: formData.ageMax },
        region: formData.region === 'All Regions' ? null : formData.region
      }, { service: API_SERVICES.CONSENT });
      
      if (res.data.success) {
        setEstimatedReach(res.data.estimatedCount);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveDraft = async () => {
    try {
      const payload = { ...formData };
      if (payload.region === 'All Regions') delete (payload as any).region;
      
      if (editCampaignId) {
          await multiServiceApiClient.put(`/enterprise/campaigns/${editCampaignId}`, payload, { service: API_SERVICES.CONSENT });
      } else {
          await multiServiceApiClient.post('/enterprise/campaigns', payload, { service: API_SERVICES.CONSENT });
      }
      onComplete();
    } catch (e) {
      alert('Failed to save draft');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Details</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Campaign Name *</label>
              <input type="text" className="w-full border rounded-md px-3 py-2" value={formData.campaignName} onChange={e => setFormData({...formData, campaignName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea className="w-full border rounded-md px-3 py-2 h-24" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Purpose & Scopes</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Purpose *</label>
              <select className="w-full border rounded-md px-3 py-2" value={formData.purposeId} onChange={e => setFormData({...formData, purposeId: e.target.value})}>
                <option value="">Select Purpose</option>
                {config?.approvedPurposes?.map((p: any) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>
            {formData.purposeId && (
              <div>
                <label className="block text-sm font-medium mb-2">Approved Scopes *</label>
                <div className="space-y-2">
                  {config?.approvedScopes?.map((s: any) => (
                    <label key={s._id} className="flex items-center gap-2">
                      <input type="checkbox" checked={formData.scopes.includes(s._id)} 
                        onChange={(e) => {
                          const scopes = e.target.checked 
                            ? [...formData.scopes, s._id]
                            : formData.scopes.filter(id => id !== s._id);
                          setFormData({...formData, scopes});
                        }}
                      />
                      <span>{s.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Channel & Audience</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Channel *</label>
              <div className="flex gap-4">
                {config?.approvedChannels?.map((ch: string) => (
                  <label key={ch} className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.channels.includes(ch)}
                      onChange={(e) => {
                          const channels = e.target.checked 
                            ? [...formData.channels, ch]
                            : formData.channels.filter(c => c !== ch);
                          setFormData({...formData, channels});
                      }}
                    />
                    <span>{ch}</span>
                  </label>
                ))}
              </div>
              {formData.channels.includes('SMS') && (
                  <p className="mt-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                    SMS delivery is currently unavailable. For UAT, approved SMS campaigns may be delivered using the configured Email fallback.
                  </p>
              )}
            </div>
            <div className="pt-4 border-t">
              <label className="block text-sm font-medium mb-1">Target Age Range</label>
              <div className="flex gap-2 mb-4">
                <input type="number" placeholder="Min Age" className="border rounded-md px-3 py-2 flex-1" value={formData.ageMin} onChange={e => setFormData({...formData, ageMin: e.target.value})} />
                <input type="number" placeholder="Max Age" className="border rounded-md px-3 py-2 flex-1" value={formData.ageMax} onChange={e => setFormData({...formData, ageMax: e.target.value})} />
              </div>
              <label className="block text-sm font-medium mb-1">Region</label>
              <select className="w-full border rounded-md px-3 py-2 mb-4" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})}>
                <option>All Regions</option>
                <option>Western Province</option>
                <option>Central Province</option>
                <option>Southern Province</option>
              </select>
              <button onClick={estimateReach} className="bg-slate-800 text-white px-4 py-2 rounded-md">Estimate Reach</button>
              {estimatedReach !== null && (
                <div className="mt-4 p-3 bg-green-50 text-green-800 rounded-md border border-green-200">
                  <strong>Estimated Reach:</strong> {estimatedReach.toLocaleString()} customers
                </div>
              )}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Templates & Schedule</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Consent Template *</label>
              <select className="w-full border rounded-md px-3 py-2" value={formData.consentTemplateVersionId} onChange={e => setFormData({...formData, consentTemplateVersionId: e.target.value})}>
                <option value="">Select Template</option>
                {consentTemplates.map(t => (
                  <option key={t._id} value={t._id}>{t.title} (v{t.version})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Promotional Message Template *</label>
              <select className="w-full border rounded-md px-3 py-2" value={formData.messageTemplateId} onChange={e => setFormData({...formData, messageTemplateId: e.target.value})}>
                <option value="">Select Message</option>
                {messageTemplates.map(m => (
                  <option key={m._id} value={m._id}>{m.version} - {m.channel}</option>
                ))}
              </select>
              {messageTemplates.length === 0 && <p className="text-xs text-red-500 mt-1">No templates found. Please create one first.</p>}
            </div>
            <div className="flex gap-4 pt-4 border-t">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Start Date *</label>
                <input type="date" className="w-full border rounded-md px-3 py-2" value={formData.campaignStart} onChange={e => setFormData({...formData, campaignStart: e.target.value})} />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">End Date *</label>
                <input type="date" className="w-full border rounded-md px-3 py-2" value={formData.campaignEnd} onChange={e => setFormData({...formData, campaignEnd: e.target.value})} />
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-4">Review Campaign</h3>
            <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-6 rounded-lg border border-slate-200">
              <div><span className="text-slate-500">Name:</span> <br/>{formData.campaignName}</div>
              <div><span className="text-slate-500">Dates:</span> <br/>{formData.campaignStart} to {formData.campaignEnd}</div>
              <div><span className="text-slate-500">Channels:</span> <br/>{formData.channels.join(', ')}</div>
              <div><span className="text-slate-500">Region:</span> <br/>{formData.region}</div>
              <div className="col-span-2"><span className="text-slate-500">Description:</span> <br/>{formData.description}</div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 max-w-3xl mx-auto">
      <div className="p-6 border-b border-slate-200 flex items-center gap-4">
        <button onClick={onCancel} className="text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-slate-800">{editCampaignId ? 'Edit Campaign' : 'Create Campaign'}</h2>
      </div>
      
      <div className="flex bg-slate-50 border-b border-slate-200">
        {[1,2,3,4,5].map(num => (
          <div key={num} className={`flex-1 py-3 text-center text-sm font-medium ${step === num ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`}>
            Step {num}
          </div>
        ))}
      </div>

      <div className="p-8">
        {renderStep()}
        
        <div className="mt-8 pt-6 border-t flex justify-between">
          <button 
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            className="px-4 py-2 text-slate-600 disabled:opacity-50"
          >
            Previous
          </button>
          
          <div className="flex gap-2">
            <button onClick={handleSaveDraft} className="px-4 py-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100">
              Save Draft
            </button>
            {step < 5 ? (
              <button 
                onClick={() => setStep(s => Math.min(5, s + 1))}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button 
                onClick={handleSaveDraft}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Finish & Save
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignWizard;
