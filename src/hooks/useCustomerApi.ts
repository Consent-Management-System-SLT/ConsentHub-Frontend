// Customer-specific React hooks for ConsentHub API services
import { useState, useEffect, useCallback } from 'react';
import { customerApiClient } from '../services/customerApiClient';

// Generic customer API hook
export function useCustomerApi<T>(apiCall: () => Promise<{ success: boolean; data: T }>, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      setData(result.data);
    } catch (err: any) {
      setError(err.error || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Customer dashboard hooks
export function useCustomerDashboard() {
  return useCustomerApi(
    () => customerApiClient.getDashboardOverview(),
    []
  );
}

export function useCustomerProfile() {
  return useCustomerApi(
    () => customerApiClient.getCustomerProfile(),
    []
  );
}

export function useCustomerSummary() {
  return useCustomerApi(
    () => customerApiClient.getCustomerSummary(),
    []
  );
}

export function useCustomerActivityHistory(params?: { page?: number; limit?: number }) {
  return useCustomerApi(
    () => customerApiClient.getActivityHistory(params),
    [params?.page, params?.limit]
  );
}

// Customer consent hooks
export function useCustomerConsents(params?: { 
  page?: number; 
  limit?: number; 
  status?: string; 
  purpose?: string; 
  consentType?: string; 
}) {
  return useCustomerApi(
    () => customerApiClient.getConsents(params),
    [params?.page, params?.limit, params?.status, params?.purpose, params?.consentType]
  );
}

export function useCustomerConsentById(id: string) {
  return useCustomerApi(
    () => customerApiClient.getConsentById(id),
    [id]
  );
}

export function useCustomerConsentSummary() {
  return useCustomerApi(
    () => customerApiClient.getConsentSummary(),
    []
  );
}

export function useCustomerConsentHistory(id: string) {
  return useCustomerApi(
    () => customerApiClient.getConsentHistory(id),
    [id]
  );
}

// Customer preference hooks
export function useCustomerPreferences(params?: { 
  page?: number; 
  limit?: number; 
  preferenceType?: string; 
  channelType?: string; 
  isAllowed?: boolean; 
}) {
  return useCustomerApi(
    () => customerApiClient.getPreferences(params),
    [params?.page, params?.limit, params?.preferenceType, params?.channelType, params?.isAllowed]
  );
}

export function useCustomerPreferenceById(id: string) {
  return useCustomerApi(
    () => customerApiClient.getPreferenceById(id),
    [id]
  );
}

export function useCustomerPreferenceSummary() {
  return useCustomerApi(
    () => customerApiClient.getPreferenceSummary(),
    []
  );
}

export function useCustomerPreferencesByChannel() {
  return useCustomerApi(
    () => customerApiClient.getPreferencesByChannel(),
    []
  );
}

// Customer DSAR hooks
export function useCustomerDSARRequests(params?: { 
  page?: number; 
  limit?: number; 
  status?: string; 
  requestType?: string; 
  category?: string; 
}) {
  return useCustomerApi(
    () => customerApiClient.getDSARRequests(params),
    [params?.page, params?.limit, params?.status, params?.requestType, params?.category]
  );
}

export function useCustomerDSARRequestById(id: string) {
  return useCustomerApi(
    () => customerApiClient.getDSARRequestById(id),
    [id]
  );
}

export function useCustomerDSARRequestSummary() {
  return useCustomerApi(
    () => customerApiClient.getDSARRequestSummary(),
    []
  );
}

export function useCustomerDSARRequestHistory(id: string) {
  return useCustomerApi(
    () => customerApiClient.getDSARRequestHistory(id),
    [id]
  );
}

export function useCustomerDSARRequestTypes() {
  return useCustomerApi(
    () => customerApiClient.getDSARRequestTypes(),
    []
  );
}

// Action hooks with mutation support
export function useCustomerConsentActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grantConsent = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await customerApiClient.grantConsent(data);
      return result;
    } catch (err: any) {
      setError(err.error || err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await customerApiClient.revokeConsent(id);
      return result;
    } catch (err: any) {
      setError(err.error || err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { grantConsent, revokeConsent, loading, error };
}

export function useCustomerPreferenceActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrUpdatePreference = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await customerApiClient.createOrUpdatePreference(data);
      return result;
    } catch (err: any) {
      setError(err.error || err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePreference = useCallback(async (id: string, data: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await customerApiClient.updatePreference(id, data);
      return result;
    } catch (err: any) {
      setError(err.error || err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePreference = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await customerApiClient.deletePreference(id);
      return result;
    } catch (err: any) {
      setError(err.error || err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createOrUpdatePreference, updatePreference, deletePreference, loading, error };
}

export function useCustomerDSARActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDSARRequest = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await customerApiClient.createDSARRequest(data);
      return result;
    } catch (err: any) {
      setError(err.error || err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelDSARRequest = useCallback(async (id: string, reason: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await customerApiClient.cancelDSARRequest(id, reason);
      return result;
    } catch (err: any) {
      setError(err.error || err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createDSARRequest, cancelDSARRequest, loading, error };
}

export function useCustomerProfileActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await customerApiClient.updateCustomerProfile(data);
      return result;
    } catch (err: any) {
      setError(err.error || err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateProfile, loading, error };
}
