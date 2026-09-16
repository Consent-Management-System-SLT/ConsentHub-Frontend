import React, { useState, useEffect } from 'react';
import { Building, Filter, Search, ArrowRight, ArrowLeft, CheckCircle, XCircle, FileText, Send } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { API_ORIGIN } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

interface Organization {
  _id: string;
  legalName: string;
  tradingName?: string;
  registrationNumber: string;
  organizationType?: string;
  industry: string;
  website?: string;
  registeredAddress?: string;
  country?: string;
  status: string;
  authorizedRepresentative?: {
    name?: string; designation?: string; department?: string; email?: string; phone?: string;
  };
  privacyContact?: {
    name?: string; designation?: string; email?: string; phone?: string;
  };
  requestedCapabilities?: string[];
  requestedChannels?: string[];
  documents?: any[];
  activationEmailStatus?: string;
}

export default function EnterpriseManagement() {
  const { addNotification } = useNotifications();
  const { getAuthToken } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'pending' | 'active' | 'rejected'>('overview');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRequestInfoModal, setShowRequestInfoModal] = useState(false);
  const [reviewReason, setReviewReason] = useState('');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_ORIGIN}/api/v2/admin/enterprise/applications`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const json = await res.json();
      if (json.success) {
        setOrganizations(json.data);
      }
    } catch (error) {
      console.error('Fetch error', error);
      addNotification({ type: 'system', category: 'error', title: 'Error', message: 'Failed to load applications' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async (id: string) => {
    if (!window.confirm('Are you sure you want to approve this enterprise?')) return;
    try {
      const res = await fetch(`${API_ORIGIN}/api/v2/admin/enterprise/applications/${id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        addNotification({ type: 'system', category: 'success', title: 'Approved', message: 'Enterprise approved successfully' });
        setSelectedOrg(null);
        fetchApplications();
      } else {
        throw new Error(data.message);
      }
    } catch (e: any) {
      addNotification({ type: 'system', category: 'error', title: 'Error', message: e.message || 'Failed to approve' });
    }
  };

  const handleReject = async () => {
    if (!reviewReason.trim()) return alert('Reason is required');
    try {
      const res = await fetch(`${API_ORIGIN}/api/v2/admin/enterprise/applications/${selectedOrg!._id}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getAuthToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reviewReason })
      });
      const data = await res.json();
      if (data.success) {
        addNotification({ type: 'system', category: 'success', title: 'Rejected', message: 'Application rejected' });
        setShowRejectModal(false);
        setReviewReason('');
        setSelectedOrg(null);
        fetchApplications();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRequestInfo = async () => {
    if (!reviewReason.trim()) return alert('Reason is required');
    try {
      const res = await fetch(`${API_ORIGIN}/api/v2/admin/enterprise/applications/${selectedOrg!._id}/request-information`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getAuthToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reviewReason })
      });
      const data = await res.json();
      if (data.success) {
        addNotification({ type: 'system', category: 'success', title: 'Information Requested', message: 'Request sent to enterprise' });
        setShowRequestInfoModal(false);
        setReviewReason('');
        setSelectedOrg(null);
        fetchApplications();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResendActivation = async (id: string) => {
    try {
      const res = await fetch(`${API_ORIGIN}/api/v2/admin/enterprise/applications/${id}/resend-activation`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        addNotification({ type: 'system', category: 'success', title: 'Resent', message: 'Activation email sent successfully' });
        fetchApplications();
        if (selectedOrg && selectedOrg._id === id) {
           setSelectedOrg({ ...selectedOrg, activationEmailStatus: 'SENT' });
        }
      } else {
        throw new Error(data.message);
      }
    } catch (e: any) {
      addNotification({ type: 'system', category: 'error', title: 'Error', message: e.message });
    }
  };

  const handleViewDocument = async (docId: string, originalFilename: string) => {
    try {
      addNotification({ type: 'system', category: 'info', title: 'Loading...', message: 'Fetching secure document' });
      const res = await fetch(`${API_ORIGIN}/api/v2/admin/enterprise/documents/${docId}`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      if (!res.ok) throw new Error('Failed to load document');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = originalFilename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      addNotification({ type: 'system', category: 'error', title: 'Error', message: 'Could not load document securely' });
    }
  };

  const pending = organizations.filter(o => ['SUBMITTED', 'UNDER_REVIEW', 'MORE_INFORMATION_REQUIRED'].includes(o.status));
  const active = organizations.filter(o => o.status === 'ACTIVE');
  const rejected = organizations.filter(o => o.status === 'REJECTED');
  
  if (selectedOrg) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button onClick={() => setSelectedOrg(null)} className="p-2 bg-white rounded-lg border hover:bg-slate-50">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="text-2xl font-bold text-slate-800">Application Review: {selectedOrg.legalName}</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            selectedOrg.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
            selectedOrg.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {selectedOrg.status}
          </span>
        </div>

        {selectedOrg.status === 'ACTIVE' && (
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="font-semibold text-blue-900">Activation Status</p>
              <p className="text-sm text-blue-700 mt-1">
                Email Status: <span className="font-bold">{selectedOrg.activationEmailStatus || 'PENDING'}</span>
              </p>
            </div>
            <button 
              onClick={() => handleResendActivation(selectedOrg._id)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
              <span>Resend Activation Email</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">A. Organization Information</h3>
            <div className="space-y-3 text-sm">
              <p><span className="text-slate-500 w-32 inline-block">Legal Name:</span> {selectedOrg.legalName || 'Not provided'}</p>
              <p><span className="text-slate-500 w-32 inline-block">Trading Name:</span> {selectedOrg.tradingName || 'Not provided'}</p>
              <p><span className="text-slate-500 w-32 inline-block">Reg Number:</span> {selectedOrg.registrationNumber || 'Not provided'}</p>
              <p><span className="text-slate-500 w-32 inline-block">Org Type:</span> {selectedOrg.organizationType || 'Not provided'}</p>
              <p><span className="text-slate-500 w-32 inline-block">Industry:</span> {selectedOrg.industry || 'Not provided'}</p>
              <p><span className="text-slate-500 w-32 inline-block">Website:</span> {selectedOrg.website || 'Not provided'}</p>
              <p><span className="text-slate-500 w-32 inline-block">Country:</span> {selectedOrg.country || 'Not provided'}</p>
              <p><span className="text-slate-500 w-32 inline-block align-top">Registered Address:</span> <span className="inline-block w-48">{selectedOrg.registeredAddress || 'Not provided'}</span></p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">B. Authorized Representative</h3>
            <div className="space-y-3 text-sm">
              <p><span className="text-slate-500 w-32 inline-block">Name:</span> {selectedOrg.authorizedRepresentative?.name || 'Not provided'}</p>
              <p><span className="text-slate-500 w-32 inline-block">Designation:</span> {selectedOrg.authorizedRepresentative?.designation || 'Not provided'}</p>
              <p><span className="text-slate-500 w-32 inline-block">Department:</span> {selectedOrg.authorizedRepresentative?.department || 'Not provided'}</p>
              <p><span className="text-slate-500 w-32 inline-block">Email:</span> {selectedOrg.authorizedRepresentative?.email || 'Not provided'}</p>
              <p><span className="text-slate-500 w-32 inline-block">Phone:</span> {selectedOrg.authorizedRepresentative?.phone || 'Not provided'}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">C. Privacy / Compliance Contact</h3>
            <div className="space-y-3 text-sm">
              <p><span className="text-slate-500 w-32 inline-block">Name:</span> {selectedOrg.privacyContact?.name || 'Not provided'}</p>
              <p><span className="text-slate-500 w-32 inline-block">Designation:</span> {selectedOrg.privacyContact?.designation || 'Not provided'}</p>
              <p><span className="text-slate-500 w-32 inline-block">Email:</span> {selectedOrg.privacyContact?.email || 'Not provided'}</p>
              <p><span className="text-slate-500 w-32 inline-block">Phone:</span> {selectedOrg.privacyContact?.phone || 'Not provided'}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">D. Requested Capabilities</h3>
            <div className="flex flex-wrap gap-2">
              {selectedOrg.requestedCapabilities && selectedOrg.requestedCapabilities.length > 0 ? selectedOrg.requestedCapabilities.map(cap => {
                const label = cap === 'marketing.sms' ? 'SMS Marketing' : cap === 'marketing.email' ? 'Email Marketing' : cap;
                return <span key={cap} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">{label}</span>;
              }) : <span className="text-sm text-gray-500">None provided</span>}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">F. Documents</h3>
            {selectedOrg.documents && selectedOrg.documents.length > 0 ? selectedOrg.documents.map((doc: any) => (
              <div key={doc._id} className="flex items-center space-x-2 py-2 border-b last:border-0">
                <FileText className="w-5 h-5 text-slate-400" />
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-medium">{doc.documentType}</span>
                  <span className="text-xs text-gray-500">{doc.originalFilename} • {new Date(doc.createdAt).toLocaleDateString()}</span>
                </div>
                <button 
                  onClick={() => handleViewDocument(doc._id, doc.originalFilename)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 border border-blue-200 rounded-md hover:bg-blue-50"
                >
                  View
                </button>
              </div>
            )) : <span className="text-sm text-gray-500">No documents provided</span>}
          </div>
        </div>

        {['SUBMITTED', 'UNDER_REVIEW', 'MORE_INFORMATION_REQUIRED'].includes(selectedOrg.status) && (
          <div className="flex space-x-4 bg-white p-6 rounded-xl border shadow-sm">
            <button onClick={() => handleApprove(selectedOrg._id)} className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <CheckCircle className="w-5 h-5" /> <span>Approve</span>
            </button>
            <button onClick={() => setShowRejectModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              <XCircle className="w-5 h-5" /> <span>Reject</span>
            </button>
            <button onClick={() => setShowRequestInfoModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
              <span>Request Info</span>
            </button>
          </div>
        )}

        {showRejectModal && (
          <div role="dialog" aria-modal="true" aria-label="Reject Application" className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">Reject Application</h3>
              <textarea
                value={reviewReason}
                onChange={e => setReviewReason(e.target.value)}
                className="w-full border rounded-lg p-3 h-32 mb-4"
                placeholder="Provide reason for rejection..."
              />
              <div className="flex justify-end space-x-3">
                <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 text-slate-500">Cancel</button>
                <button onClick={handleReject} className="px-4 py-2 bg-red-600 text-white rounded-lg">Reject Application</button>
              </div>
            </div>
          </div>
        )}

        {showRequestInfoModal && (
          <div role="dialog" aria-modal="true" aria-label="Request More Information" className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">Request More Information</h3>
              <textarea
                value={reviewReason}
                onChange={e => setReviewReason(e.target.value)}
                className="w-full border rounded-lg p-3 h-32 mb-4"
                placeholder="What information do you need?..."
              />
              <div className="flex justify-end space-x-3">
                <button onClick={() => setShowRequestInfoModal(false)} className="px-4 py-2 text-slate-500">Cancel</button>
                <button onClick={handleRequestInfo} className="px-4 py-2 bg-yellow-500 text-white rounded-lg">Send Request</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Enterprise Applications</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="flex border-b">
          {[
            { id: 'overview', label: 'Overview', count: organizations.length },
            { id: 'pending', label: 'Pending Review', count: pending.length },
            { id: 'active', label: 'Active', count: active.length },
            { id: 'rejected', label: 'Rejected', count: rejected.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading applications...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-sm text-slate-500 border-b">
                    <th scope="col" className="pb-3 font-medium">Company</th>
                    <th scope="col" className="pb-3 font-medium">Registration</th>
                    <th scope="col" className="pb-3 font-medium">Industry</th>
                    <th scope="col" className="pb-3 font-medium">Representative</th>
                    <th scope="col" className="pb-3 font-medium">Status</th>
                    <th scope="col" className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {organizations
                    .filter(o => {
                      if (activeTab === 'pending') return ['SUBMITTED', 'UNDER_REVIEW', 'MORE_INFORMATION_REQUIRED'].includes(o.status);
                      if (activeTab === 'active') return o.status === 'ACTIVE';
                      if (activeTab === 'rejected') return o.status === 'REJECTED';
                      return true;
                    })
                    .map(org => (
                    <tr key={org._id} className="hover:bg-slate-50">
                      <td className="py-4">
                        <div className="font-medium text-slate-800">{org.legalName}</div>
                        <div className="text-sm text-slate-500">{org.country}</div>
                      </td>
                      <td className="py-4 text-sm text-slate-600">{org.registrationNumber}</td>
                      <td className="py-4 text-sm text-slate-600">{org.industry}</td>
                      <td className="py-4">
                        <div className="text-sm font-medium text-slate-800">{org.authorizedRepresentative?.name || 'N/A'}</div>
                        <div className="text-sm text-slate-500">{org.authorizedRepresentative?.email || 'N/A'}</div>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          org.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          org.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {org.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button 
                          onClick={() => setSelectedOrg(org)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 border border-blue-200 rounded-md hover:bg-blue-50"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {organizations.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  No applications found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
