import React, { useCallback, useEffect, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import Modal from '../shared/Modal';
import { notificationManager } from '../shared/NotificationContainer';
import { consentCatalogService, ConsentCatalog } from '../../services/consentCatalogService';

const fieldClass = 'mt-1 block w-full bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
const messageOf = (error: unknown) => (error as { message?: string })?.message || 'Could not save the consent.';
const APPLICABILITY_OPTIONS = ['All active customers', 'Customer Base 01', 'Customer Base 02'];

const ConsentManagement: React.FC = () => {
  const [catalog, setCatalog] = useState<ConsentCatalog | null>(null);
  const [loadError, setLoadError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [values, setValues] = useState({
    consentCode: '', consentName: '', description: '', consentCategory: '', purpose: '',
    isMandatory: 'N', applicability: APPLICABILITY_OPTIONS[0], isActive: 'Y',
  });

  const load = useCallback(async () => {
    try {
      setCatalog(await consentCatalogService.load());
      setLoadError('');
    } catch (error) {
      setLoadError(messageOf(error));
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const openCreate = () => {
    setValues({ consentCode: '', consentName: '', description: '', consentCategory: catalog?.categories[0]?.categoryCode ?? '', purpose: '', isMandatory: 'N', applicability: APPLICABILITY_OPTIONS[0], isActive: 'Y' });
    setFormError('');
    setFormOpen(true);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!values.consentCode.trim() || !values.consentName.trim() || !values.consentCategory) {
      setFormError('Consent code, name, and category are required.');
      return;
    }
    setSaving(true);
    try {
      await consentCatalogService.createMaster({
        ...values,
        consentCode: values.consentCode.trim().toUpperCase().replace(/\s+/g, '_'),
        consentName: values.consentName.trim(),
      });
      setFormOpen(false);
      notificationManager.success('Consent created', `${values.consentName.trim()} was added.`);
      await load();
    } catch (error) {
      setFormError(messageOf(error));
    } finally {
      setSaving(false);
    }
  };

  const input = (name: keyof typeof values, label: string, required = false, kind: 'text' | 'textarea' = 'text') => (
    <div className={kind === 'textarea' ? 'sm:col-span-2' : ''}>
      <label htmlFor={`master-${name}`} className="block text-sm font-medium text-gray-700">{label}{required ? ' *' : ''}</label>
      {kind === 'textarea'
        ? <textarea id={`master-${name}`} rows={3} value={values[name]} onChange={(e) => setValues({ ...values, [name]: e.target.value })} className={fieldClass} />
        : <input id={`master-${name}`} value={values[name]} onChange={(e) => setValues({ ...values, [name]: e.target.value })} className={fieldClass} required={required} />}
    </div>
  );

  const th = 'sticky top-0 z-10 bg-slate-50 px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap border-b border-slate-200';
  const td = 'px-3 py-3 text-sm text-slate-900 align-top';
  const categoryLabel = (code: string) => catalog?.categories.find((category) => category.categoryCode === code)?.categoryName || code;
  const consentVersions = (consentId: number) => catalog?.scopes
    .filter((scope) => scope.consentId === consentId)
    .map((scope) => scope.scopeVersion)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true })) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Consent Management</h1>
          <p className="text-slate-600">Create and review the consent types customers may be asked to accept. Manage their versions in Consent Catalog.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => void load()} className="inline-flex items-center gap-2 bg-white border border-gray-300 text-slate-800 hover:bg-slate-50 text-sm font-medium rounded-lg px-4 py-2"><RefreshCw className="w-4 h-4" aria-hidden="true" />Refresh</button>
          <button onClick={openCreate} disabled={!catalog?.categories.length} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg px-4 py-2 disabled:opacity-60"><Plus className="w-4 h-4" aria-hidden="true" />New Consent</button>
        </div>
      </div>

      {loadError && <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-slate-900">{loadError}</div>}
      {!catalog && !loadError && <p className="text-slate-600">Loading consent types…</p>}
      {catalog && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="min-w-[1450px] divide-y divide-slate-200">
            <caption className="sr-only">Consent definitions with their details and audit dates</caption>
            <thead><tr>{['Consent ID', 'Code', 'Name', 'Version', 'Description', 'Category', 'Purpose', 'Mandatory', 'Applies To', 'Active', 'Created By', 'Created', 'Updated By', 'Updated'].map((name) => <th key={name} scope="col" className={th}>{name}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-200">
              {catalog.masters.map((master) => (
                <tr key={master.consentId} className="odd:bg-white even:bg-slate-50/50 hover:bg-blue-50/60">
                  <td className={`${td} font-mono tabular-nums`}>{master.consentId}</td>
                  <td className={`${td} font-mono text-xs max-w-48 whitespace-normal break-words`}>{master.consentCode}</td>
                  <td className={`${td} font-medium min-w-44`}>{master.consentName}</td>
                  <td className={`${td} min-w-24 whitespace-nowrap`}>{consentVersions(master.consentId).length ? consentVersions(master.consentId).map((version) => `v${version}`).join(', ') : '—'}</td>
                  <td className={`${td} max-w-64 whitespace-normal break-words text-slate-700`}>{master.description || '—'}</td>
                  <td className={`${td} min-w-40`}><div>{categoryLabel(master.consentCategory)}</div><div className="text-xs text-slate-500">{master.consentCategory}</div></td>
                  <td className={`${td} max-w-64 whitespace-normal break-words text-slate-700`}>{master.purpose || '—'}</td>
                  <td className={`${td} text-center font-medium`}>{master.isMandatory === 'Y' ? 'Yes' : 'No'}</td>
                  <td className={`${td} min-w-44`}>{master.applicability || '—'}</td>
                  <td className={`${td} text-center`}><span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${master.isActive === 'Y' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'}`}>{master.isActive === 'Y' ? 'Active' : 'Inactive'}</span></td>
                  <td className={`${td} min-w-40`}>{master.createdBy}</td>
                  <td className={`${td} whitespace-nowrap`}>{master.createdDate ? new Date(master.createdDate).toLocaleString() : '—'}</td>
                  <td className={td}>{master.updatedBy || '—'}</td>
                  <td className={`${td} whitespace-nowrap`}>{master.updatedDate ? new Date(master.updatedDate).toLocaleString() : '—'}</td>
                </tr>
              ))}
              {catalog.masters.length === 0 && <tr><td colSpan={14} className="px-4 py-10 text-center text-slate-600">No consent types yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title="New Consent" size="lg" footer={(
        <>
          <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">Cancel</button>
          <button type="submit" form="master-form" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">{saving ? 'Saving…' : 'Create Consent'}</button>
        </>
      )}>
        <form id="master-form" onSubmit={submit} noValidate className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {input('consentCode', 'Consent Code', true)}
          {input('consentName', 'Consent Name', true)}
          <div>
            <label htmlFor="master-consentCategory" className="block text-sm font-medium text-gray-700">Consent Category *</label>
            <select id="master-consentCategory" value={values.consentCategory} onChange={(e) => setValues({ ...values, consentCategory: e.target.value })} className={fieldClass} required>
              <option value="">Select category…</option>
              {catalog?.categories.filter((category) => category.isActive === 'Y').map((category) => <option key={category.categoryCode} value={category.categoryCode}>{category.categoryName} ({category.categoryCode})</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="master-isMandatory" className="block text-sm font-medium text-gray-700">Mandatory *</label>
            <select id="master-isMandatory" value={values.isMandatory} onChange={(e) => setValues({ ...values, isMandatory: e.target.value })} className={fieldClass}><option value="Y">Y — Yes</option><option value="N">N — No</option></select>
          </div>
          {input('description', 'Description', false, 'textarea')}
          {input('purpose', 'Purpose', false, 'textarea')}
          <div>
            <label htmlFor="master-applicability" className="block text-sm font-medium text-gray-700">Applicability *</label>
            <select id="master-applicability" value={values.applicability} onChange={(e) => setValues({ ...values, applicability: e.target.value })} className={fieldClass} required>
              {APPLICABILITY_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="master-isActive" className="block text-sm font-medium text-gray-700">Is Active *</label>
            <select id="master-isActive" value={values.isActive} onChange={(e) => setValues({ ...values, isActive: e.target.value })} className={fieldClass}><option value="Y">Y — Active</option><option value="N">N — Inactive</option></select>
          </div>
          {formError && <div role="alert" className="sm:col-span-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-slate-900">{formError}</div>}
          <p className="sm:col-span-2 text-xs text-slate-600">Identifiers and audit details are assigned or maintained by the system.</p>
        </form>
      </Modal>
    </div>
  );
};

export default ConsentManagement;
