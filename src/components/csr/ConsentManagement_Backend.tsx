import React, { useState, useEffect } from 'react';
import {
  Search, User, Shield, Check, X, Clock, RefreshCw, Edit, ChevronDown, ChevronUp, Filter
} from 'lucide-react';
import { csrDashboardService, CustomerData, ConsentData } from '../../services/csrDashboardService';
import { websocketService } from '../../services/websocketService';
import { notificationManager } from '../shared/NotificationContainer';
import {
  CONSENT_STATUSES,
  consentStatusLabel, consentChannelLabel, consentSourceLabel,
} from '../../utils/consentModel';

const formatDate = (v?: string | null) =>
  v ? new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const formatDateTime = (v?: string | null) =>
  v ? new Date(v).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const STATUS_STYLE: Record<string, { chip: string; icon: React.ReactNode }> = {
  GRANTED:       { chip: 'bg-green-600/20 text-green-800', icon: <Check className="w-3 h-3 mr-1" /> },
  DENIED:        { chip: 'bg-red-100 text-red-800',        icon: <X className="w-3 h-3 mr-1" /> },
  WITHDRAWN:     { chip: 'bg-amber-100 text-amber-800',    icon: <X className="w-3 h-3 mr-1" /> },
  NOT_RESPONDED: { chip: 'bg-slate-100 text-slate-700',   icon: <Clock className="w-3 h-3 mr-1" /> },
};

const statusChip = (s: string) => {
  const cfg = STATUS_STYLE[s] || STATUS_STYLE.NOT_RESPONDED;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.chip}`}>
      {cfg.icon}{consentStatusLabel(s)}
    </span>
  );
};

const detail = (label: string, value: React.ReactNode) => (
  <div className="flex justify-between text-sm">
    <span className="text-slate-600">{label}</span>
    <span className="text-slate-900 text-right ml-4 break-words max-w-xs">{value || '—'}</span>
  </div>
);

interface ConsentManagementProps {
  className?: string;
  customerId?: string;
}

const ConsentManagement: React.FC<ConsentManagementProps> = ({ className = '', customerId }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<string>(customerId || '');
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [consents, setConsents] = useState<ConsentData[]>([]);
  const [customerConsents, setCustomerConsents] = useState<ConsentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [expandedConsent, setExpandedConsent] = useState<string | null>(null);
  const [editingConsent, setEditingConsent] = useState<string | null>(null);
  const [selectedCustomerInfo, setSelectedCustomerInfo] = useState<CustomerData | null>(null);

  useEffect(() => {
    csrDashboardService.getCustomers().then(setCustomers).catch(() => setCustomers([]));
    csrDashboardService.getConsents().then(setConsents).catch(() => setConsents([]));
  }, []);

  useEffect(() => {
    if (!selectedCustomer) return;
    setLoading(true);
    const filtered = consents.filter(c => c.customerId === selectedCustomer || c.partyId === selectedCustomer);
    setCustomerConsents(filtered);
    setSelectedCustomerInfo(customers.find(c => c.id === selectedCustomer) || null);
    setLoading(false);
  }, [selectedCustomer, consents, customers]);

  // Real-time consent updates
  useEffect(() => {
    websocketService.joinCSRDashboard();
    const onUpdate = (event: any) => {
      const c = event.consent;
      const name = c.consentName || c.purpose || 'consent';
      if (event.type === 'granted') notificationManager.success('Consent Granted', `${event.user?.email || ''} granted ${name}`);
      else notificationManager.warning('Consent Updated', `${event.user?.email || ''} updated ${name}`);
      setCustomerConsents(prev =>
        prev.map(consent => consent.id === c.id
          ? { ...consent, consentStatus: c.consentStatus || (c.status === 'granted' ? 'GRANTED' : 'WITHDRAWN'), updatedDate: event.timestamp }
          : consent)
      );
    };
    websocketService.onConsentUpdate(onUpdate);
    return () => websocketService.offConsentUpdate();
  }, []);

  const handleUpdate = async (consentId: string, newStatus: 'GRANTED' | 'WITHDRAWN') => {
    setSaving(consentId);
    try {
      await csrDashboardService.updateConsentStatus(consentId, newStatus === 'GRANTED' ? 'granted' : 'revoked');
      setCustomerConsents(prev =>
        prev.map(c => c.id === consentId
          ? {
              ...c,
              consentStatus: newStatus,
              status: newStatus === 'GRANTED' ? 'granted' : 'revoked',
              consentDateTime: newStatus === 'GRANTED' ? new Date().toISOString() : c.consentDateTime,
              withdrawalDateTime: newStatus === 'WITHDRAWN' ? new Date().toISOString() : c.withdrawalDateTime,
              grantedAt: newStatus === 'GRANTED' ? new Date().toISOString() : c.grantedAt,
            }
          : c)
      );
      setEditingConsent(null);
      notificationManager.success('Consent updated', `Marked as ${consentStatusLabel(newStatus)}`);
    } catch {
      notificationManager.error('Update failed', 'Please try again.');
    } finally {
      setSaving(null);
    }
  };

  const filteredCustomers = customers.filter(c =>
    !searchTerm ||
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const typeOptions = [...new Set(customerConsents.map(c => c.consentName).filter(Boolean))];

  const filteredConsents = customerConsents.filter(c => {
    const matchStatus = statusFilter === 'all' || c.consentStatus === statusFilter;
    const matchType = typeFilter === 'all' || c.consentName === typeFilter;
    return matchStatus && matchType;
  });

  const consentKey = (c: ConsentData) => String(c.customerConsentId || c.id);

  return (
    <div className={`bg-white border border-slate-200 rounded-xl shadow-sm ${className}`}>
      {/* Header */}
      <div className="border-b border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Consent Management</h2>
              <p className="text-sm text-slate-600 mt-1">Search customers and manage their consent records</p>
            </div>
          </div>
          <button
            onClick={() => {
              csrDashboardService.getCustomers().then(setCustomers).catch(() => {});
              csrDashboardService.getConsents().then(setConsents).catch(() => {});
            }}
            className="px-4 py-2 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />Refresh
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Customer Search */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Search Customer</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-600" />
              <input
                type="text"
                placeholder="Search by name, email, or phone…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
                aria-label="Search customers"
              />
            </div>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-slate-600" />
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white appearance-none"
                aria-label="Select a customer"
              >
                <option value="">Select a customer…</option>
                {filteredCustomers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} — {c.email}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-slate-600 pointer-events-none" />
            </div>
          </div>

          {selectedCustomerInfo && (
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center">
                <User className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-semibold text-slate-900">{selectedCustomerInfo.name}</p>
                  <p className="text-sm text-slate-600">{selectedCustomerInfo.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-slate-600">
                <span>Phone: {selectedCustomerInfo.phone}</span>
                <span className="flex items-center"><Shield className="w-4 h-4 mr-1" />{filteredConsents.length} Consents</span>
              </div>
            </div>
          )}
        </div>

        {/* Consents Section */}
        {selectedCustomer && (
          <>
            {/* Filters */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Customer Consents</h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-600" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm"
                    aria-label="Filter by status"
                  >
                    <option value="all">All Status</option>
                    {CONSENT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm"
                    aria-label="Filter by consent type"
                  >
                    <option value="all">All Types</option>
                    {typeOptions.map(t => <option key={t} value={t!}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* List */}
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                <p className="text-slate-600">Loading consents…</p>
              </div>
            ) : filteredConsents.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">No Consents Found</h3>
                <p className="text-slate-500">No consent records match your filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredConsents.map(consent => {
                  const key = consentKey(consent);
                  const isExp = expandedConsent === key;
                  const isEdit = editingConsent === key;
                  return (
                    <div key={key} className="border border-slate-200 rounded-lg bg-slate-50 hover:shadow-md transition-shadow">
                      {/* Row header */}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold text-slate-900">
                                {consent.consentName || consent.purpose || '—'}
                              </h4>
                              {consent.isMandatory === 'Y' && (
                                <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Mandatory</span>
                              )}
                              {consent.scopeVersion && (
                                <span className="text-xs text-slate-500">v{consent.scopeVersion}</span>
                              )}
                            </div>
                            {consent.description && (
                              <p className="text-sm text-slate-600 mt-0.5 line-clamp-1">{consent.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            {statusChip(consent.consentStatus)}
                            <button
                              onClick={() => setExpandedConsent(isExp ? null : key)}
                              className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
                              aria-label={isExp ? 'Collapse' : 'Expand'}
                            >
                              {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Quick row */}
                        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
                          {consent.consentDateTime && (
                            <span>Consent: {formatDate(consent.consentDateTime)}</span>
                          )}
                          {consent.withdrawalDateTime && (
                            <span>Withdrawn: {formatDate(consent.withdrawalDateTime)}</span>
                          )}
                          {consent.channel && (
                            <span>Channel: {consentChannelLabel(consent.channel)}</span>
                          )}
                          <span>Source: {consentSourceLabel(consent.source)}</span>
                        </div>
                      </div>

                      {/* Expanded panel */}
                      {isExp && (
                        <div className="border-t border-slate-200 p-4 bg-white rounded-b-lg">
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* PDF fields */}
                            <div>
                              <h5 className="font-semibold text-slate-900 mb-3">Consent Details</h5>
                              <div className="space-y-2">
                                {detail('Consent ID', consent.customerConsentId)}
                                {detail('Consent Code', consent.consentCode)}
                                {detail('Consent Name', consent.consentName)}
                                {detail('Version', consent.scopeVersion)}
                                {detail('Scope Code', consent.scopeCode)}
                                {detail('Category', consent.categoryName || consent.consentCategory)}
                                {detail('Mandatory', consent.isMandatory === 'Y' ? 'Yes' : consent.isMandatory === 'N' ? 'No' : '—')}
                                {detail('Status', consentStatusLabel(consent.consentStatus))}
                                {detail('Channel', consentChannelLabel(consent.channel))}
                                {detail('Source', consentSourceLabel(consent.source))}
                                {detail('Consent Date & Time', formatDateTime(consent.consentDateTime))}
                                {detail('Withdrawal Date & Time', formatDateTime(consent.withdrawalDateTime))}
                                {detail('Captured By', consent.capturedBy)}
                                {detail('Recorded', formatDateTime(consent.createdDate))}
                                {detail('Last Updated', formatDateTime(consent.updatedDate))}
                              </div>
                            </div>

                            {/* Actions */}
                            <div>
                              <h5 className="font-semibold text-slate-900 mb-3">Update Consent</h5>
                              {isEdit ? (
                                <div className="space-y-3">
                                  <p className="text-sm text-slate-600">Select the new status for this consent:</p>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleUpdate(String(consent.customerConsentId || consent.id), 'GRANTED')}
                                      disabled={saving === key}
                                      className="flex-1 px-3 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors flex items-center justify-center text-sm disabled:opacity-50"
                                    >
                                      {saving === key ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1" />Grant</>}
                                    </button>
                                    <button
                                      onClick={() => handleUpdate(String(consent.customerConsentId || consent.id), 'WITHDRAWN')}
                                      disabled={saving === key}
                                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center text-sm disabled:opacity-50"
                                    >
                                      {saving === key ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4 mr-1" />Withdraw</>}
                                    </button>
                                  </div>
                                  <button
                                    onClick={() => setEditingConsent(null)}
                                    className="w-full px-3 py-2 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors text-sm"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setEditingConsent(key)}
                                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                                >
                                  <Edit className="w-4 h-4 mr-2" />Update Consent
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ConsentManagement;
