import { apiClient } from './apiClient';

// Rows of CONSENT_CATEGORY, CONSENT_MASTER and CONSENT_SCOPE (SLT_Consent_Management_Data_Model.pdf).
export interface ConsentCategory {
  categoryCode: string;
  categoryName: string;
  description?: string;
  isActive: 'Y' | 'N';
  createdDate?: string;
  updatedDate?: string;
}

export interface ConsentMaster {
  consentId: number;
  consentCode: string;
  consentName: string;
  description?: string;
  consentCategory: string;
  purpose?: string;
  isMandatory: 'Y' | 'N';
  applicability?: string;
  isActive: 'Y' | 'N';
  createdBy: string;
  createdDate?: string;
  updatedBy?: string;
  updatedDate?: string;
}

export interface ConsentScopeRow {
  consentScopeId: number;
  consentId: number;
  scopeType: string;
  scopeCode: string;
  scopeName: string;
  scopeVersion: string;
  status: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: 'Y' | 'N';
  createdDate?: string;
  customerConsents: number;
}

export interface ConsentCatalog {
  categories: ConsentCategory[];
  masters: ConsentMaster[];
  scopes: ConsentScopeRow[];
}

const base = '/api/v1/admin/consent-catalog';

export const consentCatalogService = {
  load: async () => (await apiClient.get<ConsentCatalog>(base)).data,
  createCategory: (body: Partial<ConsentCategory>) => apiClient.post(`${base}/categories`, body),
  updateCategory: (code: string, body: Partial<ConsentCategory>) => apiClient.put(`${base}/categories/${encodeURIComponent(code)}`, body),
  createMaster: (body: Partial<ConsentMaster>) => apiClient.post(`${base}/masters`, body),
  updateMaster: (id: number, body: Partial<ConsentMaster>) => apiClient.put(`${base}/masters/${id}`, body),
  createScope: (body: Partial<ConsentScopeRow>) => apiClient.post(`${base}/scopes`, body),
  updateScope: (id: number, body: Partial<ConsentScopeRow>) => apiClient.put(`${base}/scopes/${id}`, body),
};
