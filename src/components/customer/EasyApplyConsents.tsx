import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ShieldCheck, AlertCircle } from 'lucide-react';
import {
  fetchCustomerConsents, logoutCustomer, hasCustomerSession, CustomerConsent,
} from '../../services/easyApplyService';
import { LoadingPanel } from '../shared/Loading';
import DashboardFooter from '../shared/DashboardFooter';
import { consentTypeLabel, consentStatusLabel, consentChannelLabel } from '../../utils/consentModel';

const STATUS_STYLES: Record<string, string> = {
  granted: 'bg-green-100 text-green-800',
  active: 'bg-green-100 text-green-800',
  revoked: 'bg-red-100 text-red-800',
  withdrawn: 'bg-red-100 text-red-800',
  declined: 'bg-red-100 text-red-800',
  expired: 'bg-slate-100 text-slate-800',
  pending: 'bg-amber-100 text-amber-800',
};

const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : '—');

/** The consent records tied to an EasyApply customer's partyId. */
const EasyApplyConsents: React.FC = () => {
  const navigate = useNavigate();
  const [consents, setConsents] = useState<CustomerConsent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!hasCustomerSession()) {
      navigate('/customer/login', { replace: true });
      return;
    }
    fetchCustomerConsents()
      .then(setConsents)
      .catch((err) => setError(err?.message || 'Could not load your consents.'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const signOut = () => {
    logoutCustomer();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/Logo-SLT.png" alt="SLT Mobitel" className="h-8 w-auto shrink-0" />
            <div className="min-w-0 pl-3 border-l border-slate-200">
              <h1 className="text-base sm:text-lg font-semibold text-slate-900 leading-tight">My Consents</h1>
              <p className="text-[11px] text-slate-500 leading-tight">EasyApply customer</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <LoadingPanel label="Loading your consents" />
        ) : error ? (
          <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-700 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-slate-700">{error}</p>
          </div>
        ) : consents.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
            <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" aria-hidden="true" />
            <p className="font-medium text-slate-900">No consent records yet</p>
            <p className="text-sm text-slate-600 mt-1">
              Consents you give through SLT Mobitel services will appear here.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Purpose</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Consent Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Withdrawn</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Expires</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Channel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {consents.map((c) => (
                    <tr key={c.consentId} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-800">{consentTypeLabel(c.purpose)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          STATUS_STYLES[String(c.status).toLowerCase()] || 'bg-slate-100 text-slate-800'
                        }`}>
                          {consentStatusLabel(c.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">{formatDate(c.grantedAt || c.deniedAt || c.createdAt)}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{c.status === 'revoked' ? formatDate(c.revokedAt) : '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{c.expiresAt ? formatDate(c.expiresAt) : 'No expiry'}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{consentChannelLabel(c.channel)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <DashboardFooter />
    </div>
  );
};

export default EasyApplyConsents;
