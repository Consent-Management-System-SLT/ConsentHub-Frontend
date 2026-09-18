import axios from 'axios';

/**
 * EasyApply customer sign-in.
 *
 * Kept separate from authService: this is a different identity (an EasyApply
 * customer resolved to a partyId, not a ConsentHub user record) and a different
 * token, so mixing them into one store would let one sign-in clobber the other.
 */

const BASE =
  import.meta.env.VITE_CUSTOMER_API_URL ||
  import.meta.env.VITE_GATEWAY_API_URL ||
  'http://localhost:3001';

export const CUSTOMER_TOKEN_KEY = 'customerToken';

const api = axios.create({ baseURL: `${BASE}/api/v1` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(CUSTOMER_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** The server returns its own message for these; surface it rather than a generic one. */
const messageFrom = (err: unknown, fallback: string) => {
  const axiosErr = err as { response?: { data?: { error?: { message?: string }; message?: string } } };
  return axiosErr?.response?.data?.error?.message || axiosErr?.response?.data?.message || fallback;
};

export async function requestOtp(mobileNumber: string) {
  try {
    const { data } = await api.post('/customer-auth/easyapply/request-otp', { mobileNumber });
    return data;
  } catch (err) {
    throw new Error(messageFrom(err, 'Could not send the code. Please try again.'));
  }
}

export async function verifyOtp(mobileNumber: string, otp: string) {
  try {
    const { data } = await api.post('/customer-auth/easyapply/verify-otp', { mobileNumber, otp });
    if (data?.token) localStorage.setItem(CUSTOMER_TOKEN_KEY, data.token);
    return data;
  } catch (err) {
    throw new Error(messageFrom(err, 'That code is not valid or has expired.'));
  }
}

export interface CustomerConsent {
  consentId: string;
  purpose: string;
  status: string;
  grantedAt?: string;
  revokedAt?: string;
  expiresAt?: string;
  privacyNoticeVersion?: string;
  channel?: string;
  sourceSystem?: string;
  createdAt?: string;
}

export async function fetchCustomerConsents(): Promise<CustomerConsent[]> {
  const { data } = await api.get('/customer/consents');
  return data?.data ?? [];
}

export function logoutCustomer() {
  localStorage.removeItem(CUSTOMER_TOKEN_KEY);
}

export const hasCustomerSession = () => Boolean(localStorage.getItem(CUSTOMER_TOKEN_KEY));
