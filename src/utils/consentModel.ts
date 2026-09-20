// Values of SLT_Consent_Management_Data_Model.pdf (CUSTOMER_CONSENT). The consent types and
// versions themselves come from the backend (consent_scopes); only the fixed lists live here.

export const CONSENT_STATUSES = [
  { value: 'GRANTED', label: 'Granted' },
  { value: 'DENIED', label: 'Denied' },
  { value: 'WITHDRAWN', label: 'Withdrawn' },
  { value: 'NOT_RESPONDED', label: 'Not Responded' },
] as const;

export type ConsentStatus = (typeof CONSENT_STATUSES)[number]['value'];

export const CONSENT_CHANNELS = [
  { value: 'WEB', label: 'Web' },
  { value: 'MOBILE_APP', label: 'Mobile App' },
  { value: 'SMS', label: 'SMS' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'IVR', label: 'IVR' },
  { value: 'CALL_CENTER', label: 'Call Center' },
  { value: 'BRANCH', label: 'Branch' },
] as const;

// Where a decision can be recorded from. Anything else the system writes (REGISTRATION,
// CUSTOMER_PORTAL, ...) is shown by turning the code into words.
export const CONSENT_SOURCES = [
  { value: 'ADMIN_DASHBOARD', label: 'Admin Dashboard' },
  { value: 'CSR_DASHBOARD', label: 'CSR Dashboard' },
  { value: 'ONBOARDING_PORTAL', label: 'Onboarding Portal' },
  { value: 'SELF_CARE_APP', label: 'Self-Care App' },
  { value: 'IVR_SYSTEM', label: 'IVR System' },
  { value: 'SURVEY_CAMPAIGN', label: 'Survey Campaign' },
  { value: 'EMAIL_CAMPAIGN', label: 'Email Campaign' },
  { value: 'BRANCH_POS', label: 'Branch POS' },
] as const;

const humanize = (code: string) =>
  code
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

// Codes arrive in either case (the API returns channels in lower case), so compare upper-cased.
const labeller = (list: readonly { value: string; label: string }[]) => (value?: string | null) =>
  list.find((o) => o.value === String(value).toUpperCase())?.label ?? (value ? humanize(value) : '—');

export const consentStatusLabel = labeller(CONSENT_STATUSES);
export const consentChannelLabel = labeller(CONSENT_CHANNELS);
export const consentSourceLabel = labeller(CONSENT_SOURCES);

/** Options for a select, plus the record's current value when it is not in the list (older records), so editing never silently changes it. */
export const withCurrent = <T extends { value: string; label: string }>(
  list: readonly T[],
  current: string | undefined,
  labelFor: (v?: string) => string,
): { value: string; label: string }[] => {
  const code = current?.toUpperCase();
  return code && !list.some((o) => o.value === code)
    ? [...list, { value: code, label: `${labelFor(code)} (existing)` }]
    : [...list];
};

/** <input type="datetime-local"> wants local time as YYYY-MM-DDTHH:mm. */
export const toLocalInput = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const nowLocalInput = () => toLocalInput(new Date().toISOString());
