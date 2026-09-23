import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { consentService } from '../../services/consentService';

interface CustomerConsentRow {
  customerConsentId: number;
  customerId: string;
  consentScopeId: number;
  consentStatus: 'GRANTED' | 'DENIED' | 'WITHDRAWN' | 'NOT_RESPONDED';
  channel: string;
  source: string;
  consentDateTime: string | null;
  withdrawalDateTime: string | null;
  capturedBy: string;
  createdDate: string;
  updatedDate?: string;
  consentName?: string;
  scopeVersion?: string;
}

const date = (value?: string | null) => value ? new Date(value).toLocaleString() : '—';
const messageOf = (error: unknown) => (error as { message?: string })?.message || 'Could not load customer consent records.';
const statuses = ['GRANTED', 'DENIED', 'WITHDRAWN', 'NOT_RESPONDED'] as const;

const CustomerConsentsTable: React.FC = () => {
  const [rows, setRows] = useState<CustomerConsentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await consentService.getConsents();
      setRows(response.data.consents as unknown as CustomerConsentRow[]);
      setError('');
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => rows.filter((row) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [row.customerId, row.consentName, row.consentScopeId, row.source, row.capturedBy]
      .some((value) => String(value ?? '').toLowerCase().includes(query));
    return matchesSearch && (status === 'all' || row.consentStatus === status);
  }), [rows, search, status]);

  const th = 'px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider whitespace-nowrap';
  const td = 'px-4 py-3 text-sm text-slate-900 whitespace-nowrap';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customer Consents</h1>
          <p className="text-slate-600">A read-only history of customer consent decisions received through customer and integration APIs.</p>
        </div>
        <button onClick={() => void load()} disabled={loading} className="inline-flex items-center justify-center gap-2 bg-white border border-gray-300 text-slate-800 hover:bg-slate-50 text-sm font-medium rounded-lg px-4 py-2 disabled:opacity-60"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />Refresh</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <label className="relative flex-1">
          <span className="sr-only">Search customer consent records</span>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" aria-hidden="true" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customer, consent, source…" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </label>
        <label>
          <span className="sr-only">Filter consent status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full sm:w-auto bg-white border border-gray-300 rounded-lg px-4 py-2">
            <option value="all">All statuses</option>
            {statuses.map((value) => <option key={value} value={value}>{value.replace(/_/g, ' ')}</option>)}
          </select>
        </label>
      </div>

      {error && <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-slate-900">{error}</div>}
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50"><tr>{['Record ID', 'Customer ID', 'Version ID', 'Status', 'Channel', 'Source', 'Decision Date & Time', 'Withdrawal Date & Time', 'Captured By', 'Created', 'Updated'].map((name) => <th key={name} scope="col" className={th}>{name}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-200">
            {loading && <tr><td colSpan={11} className="px-4 py-10 text-center text-slate-600">Loading customer consents…</td></tr>}
            {!loading && filtered.map((row) => (
              <tr key={row.customerConsentId} className="hover:bg-slate-50">
                <td className={`${td} font-mono`}>{row.customerConsentId}</td>
                <td className={`${td} font-mono text-xs`}>{row.customerId}</td>
                <td className={td}>{row.consentScopeId}{row.consentName && <div className="text-xs text-slate-500">{row.consentName}{row.scopeVersion ? ` · v${row.scopeVersion}` : ''}</div>}</td>
                <td className={td}>{row.consentStatus}</td>
                <td className={td}>{row.channel}</td>
                <td className={td}>{row.source}</td>
                <td className={td}>{date(row.consentDateTime)}</td>
                <td className={td}>{date(row.withdrawalDateTime)}</td>
                <td className={td}>{row.capturedBy}</td>
                <td className={td}>{date(row.createdDate)}</td>
                <td className={td}>{date(row.updatedDate)}</td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && <tr><td colSpan={11} className="px-4 py-10 text-center text-slate-600">No customer consent records found.</td></tr>}
          </tbody>
        </table>
      </div>
      {!loading && <p className="text-sm text-slate-600">Showing {filtered.length} of {rows.length} customer consent records.</p>}
    </div>
  );
};

export default CustomerConsentsTable;
