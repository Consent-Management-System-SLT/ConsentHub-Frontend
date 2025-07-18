// React hooks for ConsentHub API services
import { useState, useEffect, useCallback } from 'react';
import { 
  consentService, 
  preferenceService, 
  partyService, 
  dsarService, 
  authService,
  customerService,
  privacyNoticeService,
  auditService
} from '../services';
import { 
  PrivacyPreference
} from '../types/consent';

// Generic API hook
export function useApi<T>(apiCall: () => Promise<T>, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Consent management hooks
export function useConsents(partyId?: string) {
  return useApi(
    () => consentService.getConsents({ partyId }).then(r => r.data),
    [partyId]
  );
}

export function useConsentHistory(partyId: string) {
  return useApi(
    () => consentService.getConsentHistory(partyId).then(r => r.data),
    [partyId]
  );
}

export function useConsentStats(partyId?: string) {
  return useApi(
    () => consentService.getConsentStats(partyId).then(r => r.data),
    [partyId]
  );
}

// Preference management hooks
export function usePreferences(partyId?: string): { data: PrivacyPreference | PrivacyPreference[] | null; loading: boolean; error: string | null; refetch: () => void } {
  return useApi(
    () => {
      if (partyId) {
        return preferenceService.getPreferenceByPartyId(partyId).then(r => r.data);
      }
      return preferenceService.getPreferences().then(r => r.data.preferences);
    },
    [partyId]
  );
}

export function usePreferencesSummary(partyId: string) {
  return useApi(
    () => preferenceService.getPreferencesSummary(partyId).then(r => r.data),
    [partyId]
  );
}

// Party management hooks
export function useParties(searchTerm?: string) {
  return useApi(
    () => {
      if (searchTerm) {
        return partyService.searchParties(searchTerm).then(r => r.data);
      }
      return partyService.getParties().then(r => r.data);
    },
    [searchTerm]
  );
}

export function useParty(partyId: string) {
  return useApi(
    () => partyService.getPartyById(partyId).then(r => r.data),
    [partyId]
  );
}

export function usePartyStats() {
  return useApi(
    () => partyService.getPartyStats().then(r => r.data),
    []
  );
}

// DSAR management hooks
export function useDSARRequests(partyId?: string) {
  return useApi(
    () => {
      if (partyId) {
        return dsarService.getDSARRequestsByPartyId(partyId).then(r => r.data);
      }
      return dsarService.getDSARRequests().then(r => r.data);
    },
    [partyId]
  );
}

export function useDSARRequest(requestId: string) {
  return useApi(
    () => dsarService.getDSARRequestById(requestId).then(r => r.data),
    [requestId]
  );
}

export function useDSARStats() {
  return useApi(
    () => dsarService.getDSARStats().then(r => r.data),
    []
  );
}

// Customer service hooks
export function useCustomerProfile(customerId: string) {
  return useApi(
    () => customerService.getCustomerProfile(customerId),
    [customerId]
  );
}

export function useCustomerDashboard(customerId: string) {
  return useApi(
    () => customerService.getCustomerDashboardData(customerId),
    [customerId]
  );
}

export function useConsentPreferences(customerId: string) {
  return useApi(
    () => customerService.getConsentPreferences(customerId),
    [customerId]
  );
}

export function useCommunicationPreferences(customerId: string) {
  return useApi(
    () => customerService.getCommunicationPreferences(customerId),
    [customerId]
  );
}

// Authentication hooks
export function useAuth() {
  const [user, setUser] = useState(() => authService.getCurrentUserFromStorage());
  const [isAuthenticated, setIsAuthenticated] = useState(() => authService.isAuthenticated());

  const login = useCallback(async (email: string, password: string, rememberMe?: boolean) => {
    try {
      const response = await authService.login({ email, password, rememberMe });
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response.data;
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const register = useCallback(async (userData: {
    name: string;
    email: string;
    password: string;
    mobile?: string;
    acceptTerms: boolean;
    acceptPrivacy: boolean;
    language?: string;
  }) => {
    try {
      const response = await authService.register(userData);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response.data;
    } catch (error) {
      throw error;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authService.getCurrentUser();
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, []);

  return {
    user,
    isAuthenticated,
    login,
    logout,
    register,
    refreshUser,
    hasPermission: (permission: string) => authService.hasPermission(permission),
    hasRole: (role: string) => authService.hasRole(role)
  };
}

// Mutation hooks for updating data
export function useConsentMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createConsent = useCallback(async (consent: Parameters<typeof consentService.createConsent>[0]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await consentService.createConsent(consent);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create consent';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConsent = useCallback(async (id: string, updates: Parameters<typeof consentService.updateConsent>[1]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await consentService.updateConsent(id, updates);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update consent';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeConsent = useCallback(async (id: string, reason?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await consentService.revokeConsent(id, reason);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to revoke consent';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createConsent,
    updateConsent,
    revokeConsent,
    loading,
    error
  };
}

export function usePreferenceMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePreference = useCallback(async (id: string, updates: Parameters<typeof preferenceService.updatePreference>[1]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await preferenceService.updatePreference(id, updates);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update preference';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePreferenceByPartyId = useCallback(async (partyId: string, updates: Parameters<typeof preferenceService.updatePreferenceByPartyId>[1]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await preferenceService.updatePreferenceByPartyId(partyId, updates);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update preference';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updatePreference,
    updatePreferenceByPartyId,
    loading,
    error
  };
}

export function useDSARMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDSARRequest = useCallback(async (request: Parameters<typeof dsarService.createDSARRequest>[0]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dsarService.createDSARRequest(request);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create DSAR request';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDSARRequest = useCallback(async (id: string, updates: Parameters<typeof dsarService.updateDSARRequest>[1]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dsarService.updateDSARRequest(id, updates);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update DSAR request';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createDSARRequest,
    updateDSARRequest,
    loading,
    error
  };
}

// Privacy Notice hooks
export function usePrivacyNotices(jurisdiction?: string, active?: boolean) {
  return useApi(
    () => privacyNoticeService.getPrivacyNotices({ jurisdiction, active }).then(r => r.data),
    [jurisdiction, active]
  );
}

export function usePrivacyNotice(id: string) {
  return useApi(
    () => privacyNoticeService.getPrivacyNoticeById(id).then(r => r.data),
    [id]
  );
}

export function usePrivacyNoticeMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPrivacyNotice = useCallback(async (notice: Parameters<typeof privacyNoticeService.createPrivacyNotice>[0]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await privacyNoticeService.createPrivacyNotice(notice);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create privacy notice';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePrivacyNotice = useCallback(async (id: string, updates: Parameters<typeof privacyNoticeService.updatePrivacyNotice>[1]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await privacyNoticeService.updatePrivacyNotice(id, updates);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update privacy notice';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const activatePrivacyNotice = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await privacyNoticeService.updatePrivacyNotice(id, { active: true });
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to activate privacy notice';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deactivatePrivacyNotice = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await privacyNoticeService.updatePrivacyNotice(id, { active: false });
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deactivate privacy notice';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createPrivacyNotice,
    updatePrivacyNotice,
    activatePrivacyNotice,
    deactivatePrivacyNotice,
    loading,
    error
  };
}

// Audit hooks
export function useAuditLogs(query?: Parameters<typeof auditService.getAuditLogs>[0]) {
  return useApi(
    () => auditService.getAuditLogs(query).then(r => r.data),
    [query]
  );
}

export function useAuditLogsByEntity(entityType: string, entityId: string) {
  return useApi(
    () => auditService.getAuditLogsByEntity(entityType, entityId).then(r => r.data),
    [entityType, entityId]
  );
}

export function useAuditLogsByUser(userId: string) {
  return useApi(
    () => auditService.getAuditLogsByUser(userId).then(r => r.data),
    [userId]
  );
}

export function useAuditStats(startDate?: string, endDate?: string) {
  return useApi(
    () => auditService.getAuditStats(startDate, endDate).then(r => r.data),
    [startDate, endDate]
  );
}
