import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Edit, RefreshCw } from 'lucide-react';
import Modal from '../shared/Modal';
import { notificationManager } from '../shared/NotificationContainer';
import { toLocalInput } from '../../utils/consentModel';
import {
  consentCatalogService, ConsentCatalog, ConsentCategory, ConsentScopeRow,
} from '../../services/consentCatalogService';

type Tab = 'scopes' | 'categories';
type Row = Record<string, unknown>;

interface Field {
  name: string;
  label: string;
  kind?: 'text' | 'textarea' | 'select' | 'date';
  options?: { value: string; label: string }[];
  required?: boolean;
  /** set once when the row is created, then read-only */
  createOnly?: boolean;
  hint?: string;
}

const ACTIVE = [{ value: 'Y', label: 'Active' }, { value: 'N', label: 'Inactive' }];
const SCOPE_STATUSES = ['DRAFT', 'UNDER_REVIEW', 'APPROVAL_PENDING', 'APPROVED', 'PLANNED', 'ACTIVE', 'REJECTED', 'RETIRED']
  .map((v) => ({ value: v, label: v.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) }));

const fieldClass = 'mt-1 block w-full bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600';

// Dates are the browser's local calendar day, the same day show() prints.
const dateOnly = (v?: string | null) => toLocalInput(v).slice(0, 10);
const localMidnight = (day: string) => (day ? new Date(`${day}T00:00:00`).toISOString() : '');
const show = (v?: string | null) => (v ? new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const messageOf = (e: unknown) => (e as { message?: string })?.message || 'Could not save. Please try again.';

const Chip: React.FC<{ on: boolean; onLabel?: string; offLabel?: string }> = ({ on, onLabel = 'Active', offLabel = 'Inactive' }) => (
  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${on ? 'bg-green-600/20 text-green-800' : 'bg-slate-200 text-slate-700'}`}>{on ? onLabel : offLabel}</span>
);

const ConsentCatalogManager: React.FC = () => {
  const [catalog, setCatalog] = useState<ConsentCatalog | null>(null);
  const [loadError, setLoadError] = useState('');
  const [tab, setTab] = useState<Tab>('scopes');
  const [editor, setEditor] = useState<{ row: Row | null } | null>(null); // row null = create
  const [values, setValues] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setCatalog(await consentCatalogService.load());
      setLoadError('');
    } catch (e) {
      setLoadError(messageOf(e));
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const masterOptions = (catalog?.masters ?? []).map((m) => ({ value: String(m.consentId), label: m.consentName }));
  const masterName = (id: number) => catalog?.masters.find((m) => m.consentId === id)?.consentName ?? `#${id}`;

  const FIELDS: Record<Tab, Field[]> = {
    categories: [
      { name: 'categoryCode', label: 'Category Code', required: true, createOnly: true, hint: 'Capital letters, digits and underscores, e.g. COMMUNICATION' },
      { name: 'categoryName', label: 'Category Name', required: true },
      { name: 'description', label: 'Description', kind: 'textarea' },
      { name: 'isActive', label: 'Status', kind: 'select', options: ACTIVE, required: true },
    ],
    scopes: [
      { name: 'consentId', label: 'Consent Type', kind: 'select', options: masterOptions, required: true, createOnly: true },
      { name: 'scopeVersion', label: 'Version', required: true, hint: 'e.g. 2.0' },
      { name: 'scopeCode', label: 'Scope Code', required: true },
      { name: 'scopeName', label: 'Scope Name', required: true },
      { name: 'status', label: 'Status', kind: 'select', options: SCOPE_STATUSES, required: true, hint: 'Customers are recorded against the Active version; only one version per consent type can be active.' },
      { name: 'description', label: 'Description', kind: 'textarea', hint: 'Briefly describe the wording or document covered by this scope.' },
      { name: 'effectiveFrom', label: 'Effective From', kind: 'date', required: true },
      { name: 'effectiveTo', label: 'Effective To', kind: 'date', hint: 'Leave empty if it has no end date' },
    ],
  };

  const open = (row: Row | null) => {
    const start: Record<string, string> = {};
    for (const f of FIELDS[tab]) {
      const current = row?.[f.name];
      start[f.name] = f.kind === 'date' ? dateOnly(current as string) : current == null ? '' : String(current);
    }
    if (!row) {
      if (tab === 'scopes') Object.assign(start, { status: 'DRAFT', effectiveFrom: toLocalInput(new Date().toISOString()).slice(0, 10) });
      if (tab === 'categories') start.isActive = 'Y';
    }
    setValues(start);
    setFormError('');
    setEditor({ row });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing = FIELDS[tab].find((f) => f.required && !(editor?.row && f.createOnly) && !values[f.name]?.trim());
    if (missing) return setFormError(`${missing.label} is required.`);
    if (tab === 'scopes' && values.effectiveTo && values.effectiveTo < values.effectiveFrom) return setFormError('Effective To cannot be before Effective From.');
    const row = editor?.row;
    // Fields that are fixed after creation are not sent again.
    const body = Object.fromEntries(FIELDS[tab].filter((f) => !(row && f.createOnly)).map((f) => [f.name, values[f.name]]));
    if (tab === 'scopes') {
      if (!row) body.consentId = values.consentId;
      body.effectiveFrom = localMidnight(values.effectiveFrom);
      body.effectiveTo = localMidnight(values.effectiveTo);
    }
    setSaving(true);
    try {
      if (tab === 'categories') await (row ? consentCatalogService.updateCategory(String(row.categoryCode), body) : consentCatalogService.createCategory(body));
      else await (row ? consentCatalogService.updateScope(Number(row.consentScopeId), body) : consentCatalogService.createScope(body));
      setEditor(null);
      notificationManager.success('Saved', row ? 'The change was saved.' : 'Created.');
      await load();
    } catch (err) {
      setFormError(messageOf(err));
    } finally {
      setSaving(false);
    }
  };

  const th = 'sticky top-0 z-10 bg-slate-50 px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap border-b border-slate-200';
  const td = 'px-4 py-3 text-sm text-slate-900 align-top';
  const editButton = (row: Row, label: string) => (
    <button onClick={() => open(row)} aria-label={`Edit ${label}`} className="p-2 text-blue-700 hover:bg-blue-50 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"><Edit className="w-4 h-4" aria-hidden="true" /></button>
  );

  const tables: Record<Tab, { head: string[]; rows: () => React.ReactNode }> = {
    scopes: {
      head: ['Scope ID', 'Consent Type', 'Version', 'Scope Code', 'Scope Name', 'Description', 'Status', 'Effective From', 'Effective To', 'Active', 'Customers', ''],
      rows: () => (catalog?.scopes ?? []).map((s: ConsentScopeRow) => (
        <tr key={s.consentScopeId} className="odd:bg-white even:bg-slate-50/50 hover:bg-blue-50/60">
          <td className={`${td} font-mono`}>{s.consentScopeId}</td>
          <td className={td}>{masterName(s.consentId)}</td>
          <td className={`${td} font-medium`}>{s.scopeVersion}</td>
          <td className={`${td} font-mono text-xs max-w-44 whitespace-normal break-words`}>{s.scopeCode}</td>
          <td className={`${td} font-medium min-w-44 whitespace-normal`}>{s.scopeName}</td>
          <td className={`${td} max-w-64 whitespace-normal break-words text-slate-700`}>{s.description || '—'}</td>
          <td className={td}><Chip on={s.status === 'ACTIVE'} onLabel="Active" offLabel={SCOPE_STATUSES.find((o) => o.value === s.status)?.label ?? s.status} /></td>
          <td className={`${td} whitespace-nowrap`}>{show(s.effectiveFrom)}</td>
          <td className={`${td} whitespace-nowrap`}>{show(s.effectiveTo)}</td>
          <td className={td}><Chip on={s.isActive === 'Y'} /></td>
          <td className={`${td} text-center tabular-nums`}>{s.customerConsents}</td>
          <td className={td}>{editButton(s as unknown as Row, `${masterName(s.consentId)} ${s.scopeVersion}`)}</td>
        </tr>
      )),
    },
    categories: {
      head: ['Code', 'Name', 'Description', 'Status', 'Created', 'Updated', ''],
      rows: () => (catalog?.categories ?? []).map((c: ConsentCategory) => (
        <tr key={c.categoryCode} className="odd:bg-white even:bg-slate-50/50 hover:bg-blue-50/60">
          <td className={`${td} font-mono text-xs`}>{c.categoryCode}</td>
          <td className={`${td} font-medium`}>{c.categoryName}</td>
          <td className={`${td} max-w-xl whitespace-normal break-words text-slate-700`}>{c.description || '—'}</td>
          <td className={td}><Chip on={c.isActive === 'Y'} /></td>
          <td className={`${td} whitespace-nowrap`}>{show(c.createdDate)}</td>
          <td className={`${td} whitespace-nowrap`}>{show(c.updatedDate)}</td>
          <td className={`${td} w-12 px-2 text-center`}>
            {editButton(c as unknown as Row, c.categoryName)}
          </td>
        </tr>
      )),
    },
  };

  const TABS: { id: Tab; label: string; noun: string }[] = [
    { id: 'scopes', label: 'Scopes', noun: 'Scope' },
    { id: 'categories', label: 'Categories', noun: 'Category' },
  ];
  const current = TABS.find((t) => t.id === tab)!;
  const isCreate = editor && !editor.row;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Consent Catalog</h1>
          <p className="text-slate-600">Manage consent scopes, their versions, and categories.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="inline-flex items-center gap-2 bg-white border border-gray-300 text-slate-800 hover:bg-slate-50 text-sm font-medium rounded-lg px-4 py-2"><RefreshCw className="w-4 h-4" aria-hidden="true" />Refresh</button>
          <button onClick={() => open(null)} disabled={!catalog || (tab === 'scopes' && catalog.masters.length === 0)} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg px-4 py-2 disabled:opacity-60"><Plus className="w-4 h-4" aria-hidden="true" />New {current.noun}</button>
        </div>
      </div>

      <div role="tablist" aria-label="Consent catalog" className="flex gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === t.id ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>
            {t.label}{catalog && <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${tab === t.id ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}`}>{catalog[t.id].length}</span>}
          </button>
        ))}
      </div>

      {loadError && <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-slate-900">{loadError}</div>}
      {!catalog && !loadError && <p className="text-slate-600">Loading…</p>}

      {catalog && (
        <div className={`${tab === 'categories' ? 'w-fit max-w-full' : 'w-full'} bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto`}>
          <table className={`${tab === 'scopes' ? 'min-w-[1450px]' : 'w-max min-w-0'} divide-y divide-slate-200`}>
            <caption className="sr-only">{tab === 'scopes' ? 'Consent scopes and their versions' : 'Consent categories'}</caption>
            <thead><tr>{tables[tab].head.map((h, index) => <th key={h || 'actions'} scope="col" className={`${th} ${tab === 'categories' && index === tables[tab].head.length - 1 ? 'w-12 px-2' : ''}`}>{h || <span className="sr-only">Actions</span>}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-200">
              {tables[tab].rows()}
              {catalog[tab].length === 0 && <tr><td colSpan={tables[tab].head.length} className="px-4 py-10 text-center text-slate-600">No {current.noun.toLowerCase()} records yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={!!editor}
        onClose={() => setEditor(null)}
        title={isCreate ? `New ${current.noun}` : `Edit ${current.noun}`}
        footer={(
          <>
            <button type="button" onClick={() => setEditor(null)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors">Cancel</button>
            <button type="submit" form="catalog-form" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60">{saving ? 'Saving…' : isCreate ? 'Create' : 'Save changes'}</button>
          </>
        )}
      >
        <form id="catalog-form" onSubmit={submit} noValidate className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FIELDS[tab].map((f) => {
            const id = `catalog-${f.name}`;
            const locked = !!editor?.row && !!f.createOnly;
            const wide = f.kind === 'textarea' || f.name === 'consentId';
            const set = (v: string) => {
              const next = { ...values, [f.name]: v };
              if (tab === 'scopes' && f.name === 'scopeName' && !values.description?.trim()) {
                next.description = v ? `Consent wording and terms for ${v}.` : '';
              }
              setValues(next);
              setFormError('');
            };
            const hintId = f.hint ? `${id}-hint` : undefined;
            return (
              <div key={f.name} className={wide ? 'sm:col-span-2' : ''}>
                <label htmlFor={id} className="block text-sm font-medium text-gray-700">{f.label}{f.required ? ' *' : ''}</label>
                {f.kind === 'select' ? (
                  <select id={id} value={values[f.name] ?? ''} onChange={(e) => set(e.target.value)} disabled={locked} aria-required={f.required} aria-describedby={hintId} className={fieldClass}>
                    {!values[f.name] && <option value="">Select…</option>}
                    {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : f.kind === 'textarea' ? (
                  <textarea id={id} rows={3} value={values[f.name] ?? ''} onChange={(e) => set(e.target.value)} aria-required={f.required} aria-describedby={hintId} className={fieldClass} />
                ) : (
                  <input id={id} type={f.kind === 'date' ? 'date' : 'text'} value={values[f.name] ?? ''} onChange={(e) => set(e.target.value)} disabled={locked} aria-required={f.required} aria-describedby={hintId} className={fieldClass} />
                )}
                {f.hint && <p id={hintId} className="mt-1 text-xs text-slate-600">{f.hint}</p>}
              </div>
            );
          })}
          {formError && <div role="alert" className="sm:col-span-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-slate-900">{formError}</div>}
        </form>
      </Modal>
    </div>
  );
};

export default ConsentCatalogManager;
