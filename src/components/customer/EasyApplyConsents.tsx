import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ShieldCheck, AlertCircle } from 'lucide-react';
import {
  fetchCustomerConsents, logoutCustomer, hasCustomerSession, CustomerConsent,
} from '../../services/easyApplyService';
import { LoadingPanel } from '../shared/Loading';
import DashboardFooter from '../shared/DashboardFooter';
import { consentStatusLabel, consentChannelLabel, consentSourceLabel } from '../../utils/consentModel';

const STATUS_STYLES: Record<CustomerConsent['consentStatus'], string> = {
  GRANTED: 'bg-green-100 text-green-800',
  WITHDRAWN: 'bg-red-100 text-red-800',
  DENIED: 'bg-red-100 text-red-800',
  NOT_RESPONDED: 'bg-amber-100 text-amber-800',
};

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : '—');

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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Consent</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Consent Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Withdrawn</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Channel</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {consents.map((c) => (
                    <tr key={c.customerConsentId} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-800">
                        {c.consentName}
                        <div className="text-xs font-normal text-slate-500">Version {c.scopeVersion}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[c.consentStatus] || 'bg-slate-100 text-slate-800'}`}>
                          {consentStatusLabel(c.consentStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">{formatDate(c.consentDateTime)}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{formatDate(c.withdrawalDateTime)}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{consentChannelLabel(c.channel)}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{consentSourceLabel(c.source)}</td>
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
