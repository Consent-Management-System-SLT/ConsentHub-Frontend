// Values from SLT_Consent_Management_Data_Model.pdf (CONSENT_MASTER + CUSTOMER_CONSENT).
// `value` is what the backend stores; `label` is the PDF's wording.

export const CONSENT_TYPES = [
  { value: 'termsAndConditions', label: 'Terms & Conditions' },
  { value: 'privacyPolicy', label: 'Privacy Policy' },
  { value: 'serviceCommunication', label: 'Service Communications' },
  { value: 'marketing', label: 'Marketing Communications' },
  { value: 'personalization', label: 'Personalized Offers' },
  { value: 'partnerOffers', label: 'Partner Offers' },
  { value: 'customerFeedback', label: 'Customer Feedback' },
] as const;

// Stored as the existing backend statuses so CSR and customer screens keep working.
export const CONSENT_STATUSES = [
  { value: 'granted', label: 'Granted' },
  { value: 'declined', label: 'Denied' },
  { value: 'revoked', label: 'Withdrawn' },
  { value: 'pending', label: 'Not Responded' },
] as const;

export const CONSENT_CHANNELS = [
  { value: 'web', label: 'Web' },
  { value: 'mobile_app', label: 'Mobile App' },
  { value: 'sms', label: 'SMS' },
  { value: 'email', label: 'Email' },
  { value: 'ivr', label: 'IVR' },
  { value: 'call_center', label: 'Call Center' },
  { value: 'branch', label: 'Branch' },
] as const;

export const CONSENT_SOURCES = [
  { value: 'admin-dashboard', label: 'Admin Dashboard' },
  { value: 'csr-dashboard', label: 'CSR Dashboard' },
  { value: 'onboarding_portal', label: 'Onboarding Portal' },
  { value: 'self_care_app', label: 'Self-Care App' },
  { value: 'ivr_system', label: 'IVR System' },
  { value: 'survey_campaign', label: 'Survey Campaign' },
] as const;

const humanize = (key: string) =>
  key
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const labeller = (list: readonly { value: string; label: string }[]) => (value?: string) =>
  list.find((o) => o.value === value)?.label ?? (value ? humanize(value) : '—');

export const consentTypeLabel = labeller(CONSENT_TYPES);
export const consentStatusLabel = labeller(CONSENT_STATUSES);
export const consentChannelLabel = labeller(CONSENT_CHANNELS);
export const consentSourceLabel = labeller(CONSENT_SOURCES);

/** Options for a select, plus the record's current value when it is not in the list (older records), so editing never silently changes it. */
export const withCurrent = <T extends { value: string; label: string }>(
  list: readonly T[],
  current: string | undefined,
  labelFor: (v?: string) => string,
): { value: string; label: string }[] =>
  current && !list.some((o) => o.value === current)
    ? [...list, { value: current, label: `${labelFor(current)} (existing)` }]
    : [...list];

/** <input type="datetime-local"> wants local time as YYYY-MM-DDTHH:mm. */
export const toLocalInput = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const nowLocalInput = () => toLocalInput(new Date().toISOString());
