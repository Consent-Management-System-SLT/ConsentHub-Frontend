import React, { useCallback, useEffect, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import Modal from '../shared/Modal';
import { notificationManager } from '../shared/NotificationContainer';
import { consentCatalogService, ConsentCatalog } from '../../services/consentCatalogService';

const fieldClass = 'mt-1 block w-full bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
const messageOf = (error: unknown) => (error as { message?: string })?.message || 'Could not save the consent type.';

const ConsentManagement: React.FC = () => {
  const [catalog, setCatalog] = useState<ConsentCatalog | null>(null);
  const [loadError, setLoadError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [values, setValues] = useState({
    consentCode: '', consentName: '', description: '', consentCategory: '', purpose: '',
    isMandatory: 'N', applicability: '', isActive: 'Y',
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
    setValues({ consentCode: '', consentName: '', description: '', consentCategory: catalog?.categories[0]?.categoryCode ?? '', purpose: '', isMandatory: 'N', applicability: '', isActive: 'Y' });
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
      notificationManager.success('Consent type created', `${values.consentName.trim()} was added.`);
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

  const th = 'px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider whitespace-nowrap';
  const td = 'px-4 py-3 text-sm text-slate-900 align-top';
  const categoryLabel = (code: string) => catalog?.categories.find((category) => category.categoryCode === code)?.categoryName || code;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Consent Management</h1>
          <p className="text-slate-600">Create and review the consent types customers may be asked to accept. Manage their versions in Consent Catalog.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => void load()} className="inline-flex items-center gap-2 bg-white border border-gray-300 text-slate-800 hover:bg-slate-50 text-sm font-medium rounded-lg px-4 py-2"><RefreshCw className="w-4 h-4" aria-hidden="true" />Refresh</button>
          <button onClick={openCreate} disabled={!catalog?.categories.length} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg px-4 py-2 disabled:opacity-60"><Plus className="w-4 h-4" aria-hidden="true" />New Consent Type</button>
        </div>
      </div>

      {loadError && <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-slate-900">{loadError}</div>}
      {!catalog && !loadError && <p className="text-slate-600">Loading consent types…</p>}
      {catalog && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50"><tr>{['Consent Type ID', 'Code', 'Name', 'Description', 'Category', 'Purpose', 'Mandatory', 'Applies To', 'Active', 'Created By', 'Created', 'Updated By', 'Updated'].map((name) => <th key={name} scope="col" className={th}>{name}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-200">
              {catalog.masters.map((master) => (
                <tr key={master.consentId} className="hover:bg-slate-50">
                  <td className={`${td} font-mono`}>{master.consentId}</td>
                  <td className={`${td} font-mono text-xs`}>{master.consentCode}</td>
                  <td className={`${td} font-medium`}>{master.consentName}</td>
                  <td className={`${td} max-w-xs`}>{master.description || '—'}</td>
                  <td className={td}>{master.consentCategory} <span className="text-slate-500">({categoryLabel(master.consentCategory)})</span></td>
                  <td className={`${td} max-w-xs`}>{master.purpose || '—'}</td>
                  <td className={td}>{master.isMandatory}</td>
                  <td className={td}>{master.applicability || '—'}</td>
                  <td className={td}>{master.isActive}</td>
                  <td className={td}>{master.createdBy}</td>
                  <td className={`${td} whitespace-nowrap`}>{master.createdDate ? new Date(master.createdDate).toLocaleString() : '—'}</td>
                  <td className={td}>{master.updatedBy || '—'}</td>
                  <td className={`${td} whitespace-nowrap`}>{master.updatedDate ? new Date(master.updatedDate).toLocaleString() : '—'}</td>
                </tr>
              ))}
              {catalog.masters.length === 0 && <tr><td colSpan={13} className="px-4 py-10 text-center text-slate-600">No consent types yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title="New Consent Type" footer={(
        <>
          <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">Cancel</button>
          <button type="submit" form="master-form" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">{saving ? 'Saving…' : 'Create Consent Type'}</button>
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
          {input('applicability', 'Applicability')}
          <div>
            <label htmlFor="master-isActive" className="block text-sm font-medium text-gray-700">Is Active *</label>
            <select id="master-isActive" value={values.isActive} onChange={(e) => setValues({ ...values, isActive: e.target.value })} className={fieldClass}><option value="Y">Y — Active</option><option value="N">N — Inactive</option></select>
          </div>
          {formError && <div role="alert" className="sm:col-span-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-slate-900">{formError}</div>}
          <p className="sm:col-span-2 text-xs text-slate-600">CONSENT_ID, CREATED_BY, CREATED_DATE, UPDATED_BY, and UPDATED_DATE are assigned or maintained by the system.</p>
        </form>
      </Modal>
    </div>
  );
};

export default ConsentManagement;
