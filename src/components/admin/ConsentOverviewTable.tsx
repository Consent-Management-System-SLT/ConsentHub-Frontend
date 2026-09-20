import React, { useState, useEffect } from 'react';
import { pageWindow } from '../../utils/pagination';
import {
  Search, Download, Eye, Edit, Shield, CheckCircle, XCircle, AlertCircle, Calendar, User, ChevronDown, RefreshCw, Plus
} from 'lucide-react';
import { useConsents, useParties, useConsentMutation } from '../../hooks/useApi';
import { consentService, ConsentScope } from '../../services/consentService';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../shared/Modal';
import {
  ConsentStatus, CONSENT_STATUSES, CONSENT_CHANNELS, CONSENT_SOURCES,
  consentStatusLabel, consentChannelLabel, consentSourceLabel, withCurrent, toLocalInput, nowLocalInput
} from '../../utils/consentModel';
import { websocketService } from '../../services/websocketService';
import { notificationManager } from '../shared/NotificationContainer';
import { secureLog } from '../../utils/secureLogger';

// A row of the CUSTOMER_CONSENT table, with its consent type and version, as GET /api/v1/consent returns it.
interface ConsentRecord {
  customerConsentId: number;
  customerId: string;
  consentScopeId: number;
  consentStatus: ConsentStatus;
  channel: string;
  source: string;
  capturedBy: string;
  consentDateTime: string | null;
  withdrawalDateTime: string | null;
  createdDate: string;
  updatedDate?: string;
  consentName?: string;
  scopeVersion?: string;
  scopeCode?: string;
}

interface Party { id: string; name?: string; email?: string }

interface ConsentForm {
  consentScopeId: string;
  consentStatus: ConsentStatus;
  channel: string;
  source: string;
  consentDateTime: string;
  withdrawalDateTime: string;
}

const STATUS_STYLE: Record<ConsentStatus, { icon: React.ReactNode; chip: string }> = {
  GRANTED: { icon: <CheckCircle className="w-4 h-4 text-green-700" aria-hidden="true" />, chip: 'bg-green-600/20 text-green-800' },
  DENIED: { icon: <XCircle className="w-4 h-4 text-red-600" aria-hidden="true" />, chip: 'bg-red-50 text-red-800' },
  WITHDRAWN: { icon: <XCircle className="w-4 h-4 text-red-600" aria-hidden="true" />, chip: 'bg-red-50 text-red-800' },
  NOT_RESPONDED: { icon: <AlertCircle className="w-4 h-4 text-amber-700" aria-hidden="true" />, chip: 'bg-amber-600/20 text-amber-800' },
};

const fieldClass = 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true })
    : '—';

const messageOf = (error: unknown, fallback: string) =>
  (error instanceof Error && error.message) || (error as { message?: string })?.message || fallback;

/** The date the row was last acted on, for "newest first". */
const latestActivity = (c: ConsentRecord) =>
  Math.max(...[c.consentDateTime, c.withdrawalDateTime, c.updatedDate, c.createdDate].map((d) => (d ? new Date(d).getTime() : 0)));

const ConsentOverviewTable: React.FC = () => {
  const { user } = useAuth();
  const { data: partiesData } = useParties();
  const { data: consentsData, loading, error: loadError, refetch } = useConsents();
  const { createConsent, updateConsent } = useConsentMutation();

  const [scopes, setScopes] = useState<ConsentScope[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [viewing, setViewing] = useState<ConsentRecord | null>(null);
  const [editing, setEditing] = useState<ConsentRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [createCustomerId, setCreateCustomerId] = useState('');
  const [form, setForm] = useState<ConsentForm>({ consentScopeId: '', consentStatus: 'GRANTED', channel: 'WEB', source: 'ADMIN_DASHBOARD', consentDateTime: '', withdrawalDateTime: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const itemsPerPage = 5;

  // The consent types and versions come from the backend; only the active ones can be newly recorded.
  useEffect(() => {
    consentService.getConsentScopes().then((r) => setScopes(r.data ?? [])).catch((e) => secureLog.error('Could not load consent scopes', e));
  }, []);
  const activeScopes = scopes.filter((s) => s.status === 'ACTIVE');

  useEffect(() => {
    websocketService.joinCSRDashboard();
    const onUpdate = (event: { type?: string; source?: string; user?: { email?: string } }) => {
      const source = event.source === 'csr' ? 'CSR Staff' : event.source === 'customer' ? 'Customer' : 'System';
      notificationManager.info(
        `Consent ${event.type === 'granted' ? 'Granted' : 'Withdrawn'}`,
        `${event.user?.email || 'Unknown Customer'} ${event.type === 'granted' ? 'granted' : 'withdrew'} consent${source !== 'System' ? ` via ${source}` : ''}`
      );
      refetch();
      setLastUpdated(new Date());
    };
    websocketService.onConsentUpdate(onUpdate);
    return () => websocketService.leaveCSRDashboard();
  }, [refetch]);

  // A validation message describes the last submit; drop it as soon as the form changes.
  useEffect(() => { setFormError(''); }, [form, createCustomerId]);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, typeFilter]);

  const parties: Party[] = Array.isArray(partiesData) ? partiesData : (partiesData as { parties?: Party[] } | null)?.parties ?? [];
  const partyById = new Map(parties.map((p) => [p.id, p]));
  const customerOf = (id: string) => ({ name: partyById.get(id)?.name || `Customer ${id.slice(0, 8)}…`, email: partyById.get(id)?.email || '' });

  const records: ConsentRecord[] = Array.isArray(consentsData) ? consentsData : (consentsData as { consents?: ConsentRecord[] } | null)?.consents ?? [];
  const typeOptions = [...new Set([...scopes.map((s) => s.consentName), ...records.map((r) => r.consentName || '')])].filter(Boolean);

  const filtered = records
    .filter((c) => {
      const who = customerOf(c.customerId);
      const q = searchTerm.toLowerCase();
      return (
        (!q || who.name.toLowerCase().includes(q) || who.email.toLowerCase().includes(q) || c.customerId.toLowerCase().includes(q)) &&
        (statusFilter === 'all' || c.consentStatus === statusFilter) &&
        (typeFilter === 'all' || c.consentName === typeFilter)
      );
    })
    .sort((a, b) => {
      const cmp = sortBy === 'name' ? customerOf(a.customerId).name.localeCompare(customerOf(b.customerId).name)
        : sortBy === 'status' ? a.consentStatus.localeCompare(b.consentStatus)
        : latestActivity(a) - latestActivity(b);
      return sortOrder === 'asc' ? cmp : -cmp;
    });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageRows = filtered.slice(startIndex, startIndex + itemsPerPage);
  const count = (status: ConsentStatus) => records.filter((c) => c.consentStatus === status).length;

  const toggleSort = (column: 'date' | 'name' | 'status') => {
    setSortOrder(sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc');
    setSortBy(column);
  };

  const scopeLabel = (s: ConsentScope) => `${s.consentName} — ${s.scopeVersion}`;

  const openCreate = () => {
    setForm({ consentScopeId: activeScopes[0] ? String(activeScopes[0].consentScopeId) : '', consentStatus: 'GRANTED', channel: 'WEB', source: 'ADMIN_DASHBOARD', consentDateTime: nowLocalInput(), withdrawalDateTime: '' });
    setCreateCustomerId('');
    setFormError('');
    setCreating(true);
  };

  const openEdit = (c: ConsentRecord) => {
    setViewing(null);
    setEditing(c);
    setForm({
      consentScopeId: String(c.consentScopeId),
      consentStatus: c.consentStatus,
      channel: c.channel.toUpperCase(),
      source: c.source,
      consentDateTime: toLocalInput(c.consentDateTime),
      withdrawalDateTime: toLocalInput(c.withdrawalDateTime),
    });
    setFormError('');
  };

  // What the PDF's column rules imply for each status.
  const validate = () => {
    if (form.consentStatus !== 'NOT_RESPONDED') {
      if (!form.consentDateTime) return 'Consent date & time is required.';
      if (new Date(form.consentDateTime).getTime() > Date.now()) return 'Consent date & time cannot be in the future.';
    }
    if (form.consentStatus === 'WITHDRAWN') {
      if (!form.withdrawalDateTime) return 'Withdrawal date & time is required for a withdrawn consent.';
      if (new Date(form.withdrawalDateTime) < new Date(form.consentDateTime)) return 'Withdrawal cannot be before the consent date & time.';
      if (new Date(form.withdrawalDateTime).getTime() > Date.now()) return 'Withdrawal date & time cannot be in the future.';
    }
    return '';
  };

  // Only the dates that apply to the chosen status are sent.
  const payload = () => ({
    consentScopeId: Number(form.consentScopeId),
    consentStatus: form.consentStatus,
    channel: form.channel,
    source: form.source,
    consentDateTime: form.consentStatus !== 'NOT_RESPONDED' && form.consentDateTime ? new Date(form.consentDateTime).toISOString() : undefined,
    withdrawalDateTime: form.consentStatus === 'WITHDRAWN' && form.withdrawalDateTime ? new Date(form.withdrawalDateTime).toISOString() : undefined,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creating && !createCustomerId) return setFormError('Please select a customer.');
    if (!form.consentScopeId) return setFormError('Please select a consent type.');
    const problem = validate();
    if (problem) return setFormError(problem);
    setSaving(true);
    try {
      if (creating) {
        await createConsent({ customerId: createCustomerId, ...payload() });
        setCreating(false);
        notificationManager.success('Consent recorded', 'The consent decision was saved.');
      } else if (editing) {
        await updateConsent(String(editing.customerConsentId), payload());
        setEditing(null);
        notificationManager.success('Consent updated', 'The consent decision was updated.');
      }
      await refetch();
    } catch (err) {
      setFormError(messageOf(err, 'Could not save the consent. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  const exportRecords = (rows: ConsentRecord[]) => {
    const data = rows.map((c) => ({
      customerConsentId: c.customerConsentId,
      customerId: c.customerId,
      customerName: customerOf(c.customerId).name,
      email: customerOf(c.customerId).email,
      consent: c.consentName,
      scopeVersion: c.scopeVersion,
      consentStatus: c.consentStatus,
      channel: c.channel.toUpperCase(),
      source: c.source,
      consentDateTime: c.consentDateTime,
      withdrawalDateTime: c.withdrawalDateTime,
      capturedBy: c.capturedBy,
    }));
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `consent-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSelected = (id: number) => {
    const next = new Set(selected);
    if (!next.delete(id)) next.add(id);
    setSelected(next);
  };

  const activeOptions = activeScopes.map((s) => ({ value: String(s.consentScopeId), label: scopeLabel(s) }));
  // Editing keeps the record's own version selectable even once it is no longer active.
  const scopeOptions = editing
    ? withCurrent(activeOptions, String(editing.consentScopeId), () => `${editing.consentName ?? 'Consent'} — ${editing.scopeVersion ?? ''}`)
    : activeOptions;

  const renderFields = (prefix: string) => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="sm:col-span-2">
          <label htmlFor={`${prefix}-scope`} className="block text-sm font-medium text-gray-700">Consent Type & Version *</label>
          <select id={`${prefix}-scope`} value={form.consentScopeId} onChange={(e) => setForm({ ...form, consentScopeId: e.target.value })} className={fieldClass} required>
            {scopeOptions.length === 0 && <option value="">No active consent types</option>}
            {scopeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={`${prefix}-status`} className="block text-sm font-medium text-gray-700">Consent Status *</label>
          <select
            id={`${prefix}-status`}
            value={form.consentStatus}
            onChange={(e) => setForm({ ...form, consentStatus: e.target.value as ConsentStatus, consentDateTime: form.consentDateTime || nowLocalInput() })}
            className={fieldClass}
            required
          >
            {CONSENT_STATUSES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={`${prefix}-channel`} className="block text-sm font-medium text-gray-700">Channel *</label>
          <select id={`${prefix}-channel`} value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })} className={fieldClass} required>
            {CONSENT_CHANNELS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={`${prefix}-source`} className="block text-sm font-medium text-gray-700">Source *</label>
          <select id={`${prefix}-source`} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className={fieldClass} required>
            {withCurrent(CONSENT_SOURCES, editing?.source, consentSourceLabel).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        {form.consentStatus !== 'NOT_RESPONDED' && (
          <div>
            <label htmlFor={`${prefix}-consent-date`} className="block text-sm font-medium text-gray-700">Consent Date & Time *</label>
            <input id={`${prefix}-consent-date`} type="datetime-local" value={form.consentDateTime} max={nowLocalInput()} onChange={(e) => setForm({ ...form, consentDateTime: e.target.value })} className={fieldClass} required />
          </div>
        )}
        {form.consentStatus === 'WITHDRAWN' && (
          <div>
            <label htmlFor={`${prefix}-withdrawal-date`} className="block text-sm font-medium text-gray-700">Withdrawal Date & Time *</label>
            <input id={`${prefix}-withdrawal-date`} type="datetime-local" value={form.withdrawalDateTime} min={form.consentDateTime || undefined} max={nowLocalInput()} onChange={(e) => setForm({ ...form, withdrawalDateTime: e.target.value })} className={fieldClass} required />
          </div>
        )}
      </div>
    </>
  );

  const formFooter = (label: string, close: () => void) => (
    <>
      <button type="button" onClick={close} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors">Cancel</button>
      <button type="submit" form="consent-form" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60">
        {saving ? 'Saving…' : label}
      </button>
    </>
  );

  const errorBox = formError && (
    <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-slate-900">{formError}</div>
  );

  const sortHeader = (label: string, column: 'date' | 'name' | 'status') => (
    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide cursor-pointer hover:bg-slate-100" onClick={() => toggleSort(column)}>
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${sortBy === column && sortOrder === 'desc' ? 'rotate-180' : ''}`} />
      </div>
    </th>
  );
  const plainHeader = (label: string) => (
    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</th>
  );

  const statusChip = (status: ConsentStatus) => (
    <div className="flex items-center gap-2">
      {STATUS_STYLE[status]?.icon}
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[status]?.chip ?? ''}`}>{consentStatusLabel(status)}</span>
    </div>
  );

  const actions = (c: ConsentRecord) => (
    <div className="flex items-center space-x-1">
      <button onClick={() => setViewing(c)} className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition-colors" title="View Details" aria-label="View Details">
        <Eye className="w-4 h-4" />
      </button>
      <button onClick={() => openEdit(c)} className="text-green-700 hover:text-green-900 p-2 hover:bg-green-50 rounded transition-colors" title="Edit Consent" aria-label="Edit Consent">
        <Edit className="w-4 h-4" />
      </button>
    </div>
  );

  const statCard = (label: string, value: number, color: string, iconBg: string, icon: React.ReactNode) => (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center`}>{icon}</div>
      </div>
    </div>
  );

  const detailRow = (label: string, value: React.ReactNode) => (
    <p className="break-words"><span className="font-medium">{label}:</span> {value}</p>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {loading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-slate-600">Loading consents...</span>
        </div>
      )}
      {loadError && (
        <div className="bg-red-50 border border-red-200 text-slate-900 px-4 py-3 rounded mb-4">
          <p>Error loading consents: {loadError}</p>
        </div>
      )}

      {!loading && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Consent Management</h1>
              <div className="flex items-center space-x-4 mt-2">
                <p className="text-slate-600">Manage and monitor all customer consents</p>
                <span className="text-xs text-slate-500 flex items-center">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 flex items-center gap-2 whitespace-nowrap">
                <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
                Create New Consent
              </button>
              <button onClick={() => exportRecords(filtered)} className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium rounded-lg px-4 py-2.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 flex items-center gap-2 whitespace-nowrap">
                <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
                Export
              </button>
            </div>
          </div>

          {selected.size > 0 && (
            <div role="region" aria-label="Bulk actions" className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
              <span className="text-sm font-medium text-blue-900 whitespace-nowrap">{selected.size} selected</span>
              <span className="flex-1" />
              <button onClick={() => exportRecords(records.filter((c) => selected.has(c.customerConsentId)))} className="bg-white border border-blue-300 text-blue-800 hover:bg-blue-100 text-sm font-medium rounded-lg px-4 py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 whitespace-nowrap">
                Export selected
              </button>
              <button onClick={() => setSelected(new Set())} className="text-sm font-medium text-blue-800 hover:text-blue-900 underline px-2 py-2 whitespace-nowrap">Clear</button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {statCard('Granted', count('GRANTED'), 'text-green-700', 'bg-green-600/20', <CheckCircle className="w-6 h-6 text-green-700" />)}
            {statCard('Withdrawn', count('WITHDRAWN'), 'text-red-600', 'bg-red-50', <XCircle className="w-6 h-6 text-red-600" />)}
            {statCard('Denied', count('DENIED'), 'text-red-600', 'bg-red-50', <XCircle className="w-6 h-6 text-red-600" />)}
            {statCard('Not Responded', count('NOT_RESPONDED'), 'text-amber-700', 'bg-amber-600/20', <AlertCircle className="w-6 h-6 text-amber-700" />)}
            {statCard('Total Consents', records.length, 'text-blue-600', 'bg-blue-100', <Shield className="w-6 h-6 text-blue-600" />)}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input type="text" placeholder="Search customers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" aria-label="Search customers" />
              </div>
              <div className="relative">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-red-500 focus:border-transparent" aria-label="Filter by status">
                  <option value="all">All Status</option>
                  {CONSENT_STATUSES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
              </div>
              <div className="relative">
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-red-500 focus:border-transparent" aria-label="Filter by type">
                  <option value="all">All Types</option>
                  {typeOptions.map((name) => <option key={name} value={name}>{name}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="block lg:hidden">
              <div className="p-4 space-y-4">
                {pageRows.map((c) => {
                  const who = customerOf(c.customerId);
                  return (
                    <div key={c.customerConsentId} className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
                      <div className="flex flex-wrap gap-4 items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <input type="checkbox" aria-label={`Select ${c.consentName} consent for ${who.name}`} checked={selected.has(c.customerConsentId)} onChange={() => toggleSelected(c.customerConsentId)} className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
                          <div>
                            <div className="text-sm font-medium text-slate-900">{who.name}</div>
                            <div className="text-xs text-slate-600">{who.email}</div>
                          </div>
                        </div>
                        {actions(c)}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="text-slate-600">Type:</span> <span className="ml-1 text-slate-900">{c.consentName} {c.scopeVersion}</span></div>
                        <div className="flex items-center"><span className="text-slate-600 mr-1">Status:</span>{statusChip(c.consentStatus)}</div>
                        <div><span className="text-slate-600">Consent:</span> <span className="ml-1 text-slate-900">{formatDateTime(c.consentDateTime)}</span></div>
                        <div><span className="text-slate-600">Channel:</span> <span className="ml-1 text-slate-900">{consentChannelLabel(c.channel)}</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white border border-slate-200">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left">
                      <input type="checkbox" aria-label="Select all consents" checked={filtered.length > 0 && selected.size === filtered.length} onChange={() => setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map((c) => c.customerConsentId)))} className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
                    </th>
                    {sortHeader('Customer', 'name')}
                    {plainHeader('Consent Type')}
                    {sortHeader('Status', 'status')}
                    {sortHeader('Consent Date', 'date')}
                    {plainHeader('Withdrawn')}
                    {plainHeader('Channel / Source')}
                    {plainHeader('Actions')}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pageRows.map((c) => {
                    const who = customerOf(c.customerId);
                    return (
                      <tr key={c.customerConsentId} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input type="checkbox" aria-label={`Select ${c.consentName} consent for ${who.name}`} checked={selected.has(c.customerConsentId)} onChange={() => toggleSelected(c.customerConsentId)} className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center"><User className="w-5 h-5 text-slate-600" /></div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-slate-900">{who.name}</div>
                              <div className="text-sm text-slate-600">{who.email}</div>
                              <div className="text-xs text-slate-500">{c.customerId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-900">{c.consentName}</div>
                          <div className="text-xs text-slate-500">Version {c.scopeVersion}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{statusChip(c.consentStatus)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                          <div className="flex items-center"><Calendar className="w-4 h-4 text-slate-500 mr-2" />{formatDateTime(c.consentDateTime)}</div>
                          <div className="text-xs text-slate-500 mt-1">by {c.capturedBy}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">{formatDateTime(c.withdrawalDateTime)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900">{consentChannelLabel(c.channel)}</div>
                          <div className="text-xs text-slate-500">{consentSourceLabel(c.source)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{actions(c)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && <p className="p-8 text-center text-slate-600">No consents match the current filters.</p>}
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-slate-600">
              Showing {filtered.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length} consents
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-slate-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
              {pageWindow(currentPage, totalPages).map((page, i) =>
                page === null ? (
                  <span key={`gap-${i}`} className="px-1 text-slate-500" aria-hidden="true">…</span>
                ) : (
                  <button key={page} onClick={() => setCurrentPage(page)} aria-current={currentPage === page ? 'page' : undefined} aria-label={`Page ${page}`} className={`min-w-[44px] px-3 py-2 rounded-lg transition-colors text-sm ${currentPage === page ? 'bg-blue-600 text-white font-semibold' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
                    {page}
                  </button>
                )
              )}
              <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage >= totalPages} className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-slate-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
            </div>
          </div>
        </>
      )}

      <Modal isOpen={!!viewing} onClose={() => setViewing(null)} title="Consent Details" footer={viewing && (
        <>
          <button onClick={() => setViewing(null)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors">Close</button>
          <button onClick={() => openEdit(viewing)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Edit className="w-4 h-4" aria-hidden="true" /><span>Edit Consent</span>
          </button>
        </>
      )}>
        {viewing && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Customer</h3>
                <div className="border border-slate-200 rounded-lg p-4 space-y-2">
                  {detailRow('Name', customerOf(viewing.customerId).name)}
                  {detailRow('Email', customerOf(viewing.customerId).email || '—')}
                  {detailRow('Customer ID', viewing.customerId)}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Consent</h3>
                <div className="border border-slate-200 rounded-lg p-4 space-y-2">
                  {detailRow('Consent ID', viewing.customerConsentId)}
                  {detailRow('Type', viewing.consentName)}
                  {detailRow('Version', `${viewing.scopeVersion} (${viewing.scopeCode})`)}
                  {detailRow('Status', consentStatusLabel(viewing.consentStatus))}
                  {detailRow('Channel', consentChannelLabel(viewing.channel))}
                  {detailRow('Source', consentSourceLabel(viewing.source))}
                  {detailRow('Captured By', viewing.capturedBy)}
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Timeline</h3>
              <div className="border border-slate-200 rounded-lg p-4 space-y-2">
                {detailRow('Consent date & time', formatDateTime(viewing.consentDateTime))}
                {detailRow('Withdrawal date & time', formatDateTime(viewing.withdrawalDateTime))}
                {detailRow('Recorded', formatDateTime(viewing.createdDate))}
                {detailRow('Last updated', formatDateTime(viewing.updatedDate))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={creating} onClose={() => setCreating(false)} title="Create New Consent" footer={formFooter('Create Consent', () => setCreating(false))}>
        <form id="consent-form" onSubmit={submit} noValidate>
          <div className="mb-4">
            <label htmlFor="create-customer" className="block text-sm font-medium text-gray-700">Customer *</label>
            <select id="create-customer" value={createCustomerId} onChange={(e) => setCreateCustomerId(e.target.value)} className={fieldClass} required>
              <option value="">Select Customer</option>
              {parties.map((p) => <option key={p.id} value={p.id}>{p.name} - {p.email}</option>)}
            </select>
          </div>
          {renderFields('create')}
          <div className="mb-4">
            <label htmlFor="create-captured-by" className="block text-sm font-medium text-gray-700">Captured By</label>
            <input id="create-captured-by" type="text" value={user?.email || ''} readOnly className={`${fieldClass} bg-gray-50 text-gray-600`} />
            <p className="mt-1 text-xs text-slate-600">Recorded automatically from your sign-in.</p>
          </div>
          {errorBox}
        </form>
      </Modal>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title={editing ? `Edit Consent - ${customerOf(editing.customerId).name}` : 'Edit Consent'} footer={formFooter('Update Consent', () => setEditing(null))}>
        {editing && (
          <form id="consent-form" onSubmit={submit} noValidate>
            <div className="mb-4">
              <span className="block text-sm font-medium text-gray-700">Customer</span>
              <div className="mt-1 p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-600 break-words">
                {customerOf(editing.customerId).name} - {customerOf(editing.customerId).email}
              </div>
            </div>
            {renderFields('edit')}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Consent Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="min-w-0"><span className="text-gray-600">Consent ID:</span><div className="font-mono text-gray-900 break-all">{editing.customerConsentId}</div></div>
                <div className="min-w-0"><span className="text-gray-600">Captured By:</span><div className="text-gray-900 break-words">{editing.capturedBy}</div></div>
              </div>
            </div>
            {errorBox}
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ConsentOverviewTable;
