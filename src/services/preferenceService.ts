import { 
  PreferenceCategory, 
  PreferenceItem, 
  UserPreference, 
  PreferenceTemplate,
  PreferenceAudit,
  PreferenceStats 
} from '../types/preference';

const API_BASE_URL = 'http://localhost:3001/api/v1';

// API Response interfaces
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Request interfaces
export interface CategoryCreateRequest {
  name: string;
  description: string;
  icon: string;
  priority: number;
}

export interface PreferenceCreateRequest {
  categoryId: string;
  name: string;
  description: string;
  type: 'boolean' | 'string' | 'number' | 'array' | 'object' | 'enum';
  required: boolean;
  defaultValue: any;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    allowedValues?: any[];
  };
  priority: number;
}

export interface PreferenceUpdateRequest extends Partial<PreferenceCreateRequest> {
  enabled?: boolean;
}

export interface PreferenceFilters {
  search?: string;
  categoryId?: string;
  enabled?: boolean;
  type?: string;
  limit?: number;
  offset?: number;
}

export interface BulkPreferenceUpdate {
  preferenceIds: string[];
  action: 'enable' | 'disable' | 'delete';
  categoryId?: string;
}

// Utility function for making API requests
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(`API Request Error [${endpoint}]:`, error);
    return {
      success: false,
      data: null as any,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

export const preferenceService = {
  // ==================== CATEGORY MANAGEMENT ====================
  
  /**
   * Get all preference categories
   */
  async getCategories(): Promise<ApiResponse<{ categories: PreferenceCategory[] }>> {
    return apiRequest<{ categories: PreferenceCategory[] }>('/preferences/categories');
  },

  /**
   * Create a new preference category
   */
  async createCategory(categoryData: CategoryCreateRequest): Promise<ApiResponse<PreferenceCategory>> {
    return apiRequest<PreferenceCategory>('/preferences/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },

  /**
   * Update a preference category
   */
  async updateCategory(
    categoryId: string,
    categoryData: Partial<CategoryCreateRequest>
  ): Promise<ApiResponse<PreferenceCategory>> {
    return apiRequest<PreferenceCategory>(`/preferences/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  },

  /**
   * Delete a preference category
   */
  async deleteCategory(categoryId: string): Promise<ApiResponse<{ message: string }>> {
    return apiRequest<{ message: string }>(`/preferences/categories/${categoryId}`, {
      method: 'DELETE',
    });
  },

  // ==================== PREFERENCE MANAGEMENT ====================

  /**
   * Get preferences with optional filters
   */
  async getPreferences(filters: PreferenceFilters = {}): Promise<ApiResponse<{ preferences: PreferenceItem[]; total: number }>> {
    const queryParams = new URLSearchParams();
    
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.categoryId) queryParams.append('categoryId', filters.categoryId);
    if (filters.enabled !== undefined) queryParams.append('enabled', filters.enabled.toString());
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.offset) queryParams.append('offset', filters.offset.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/preferences/admin?${queryString}` : '/preferences/admin';
    
    return apiRequest<{ preferences: PreferenceItem[]; total: number }>(endpoint);
  },

  /**
   * Get a specific preference by ID
   */
  async getPreference(preferenceId: string): Promise<ApiResponse<PreferenceItem>> {
    return apiRequest<PreferenceItem>(`/preferences/admin/${preferenceId}`);
  },

  /**
   * Create a new preference
   */
  async createPreference(preferenceData: PreferenceCreateRequest): Promise<ApiResponse<PreferenceItem>> {
    return apiRequest<PreferenceItem>('/preferences/admin', {
      method: 'POST',
      body: JSON.stringify(preferenceData),
    });
  },

  /**
   * Update a preference
   */
  async updatePreference(
    preferenceId: string,
    preferenceData: PreferenceUpdateRequest
  ): Promise<ApiResponse<PreferenceItem>> {
    return apiRequest<PreferenceItem>(`/preferences/admin/${preferenceId}`, {
      method: 'PUT',
      body: JSON.stringify(preferenceData),
    });
  },

  /**
   * Delete a preference
   */
  async deletePreference(preferenceId: string): Promise<ApiResponse<{ message: string }>> {
    return apiRequest<{ message: string }>(`/preferences/admin/${preferenceId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Toggle preference enabled status
   */
  async togglePreference(preferenceId: string, enabled: boolean): Promise<ApiResponse<PreferenceItem>> {
    return apiRequest<PreferenceItem>(`/preferences/admin/${preferenceId}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled }),
    });
  },

  // ==================== USER PREFERENCES ====================

  /**
   * Get user preferences for a specific user
   */
  async getUserPreferences(userId: string): Promise<ApiResponse<{ preferences: UserPreference[] }>> {
    return apiRequest<{ preferences: UserPreference[] }>(`/preference/users/${userId}`);
  },

  /**
   * Set user preference value
   */
  async setUserPreference(
    userId: string,
    preferenceId: string,
    value: any
  ): Promise<ApiResponse<UserPreference>> {
    return apiRequest<UserPreference>(`/preference/users/${userId}/${preferenceId}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  },

  /**
   * Bulk update user preferences
   */
  async bulkUpdateUserPreferences(
    userId: string,
    preferences: { preferenceId: string; value: any }[]
  ): Promise<ApiResponse<{ updated: number; preferences: UserPreference[] }>> {
    return apiRequest<{ updated: number; preferences: UserPreference[] }>(`/preference/users/${userId}/bulk`, {
      method: 'POST',
      body: JSON.stringify({ preferences }),
    });
  },

  /**
   * Reset user preferences to defaults
   */
  async resetUserPreferences(userId: string): Promise<ApiResponse<{ message: string; reset: number }>> {
    return apiRequest<{ message: string; reset: number }>(`/preference/users/${userId}/reset`, {
      method: 'POST',
    });
  },

  // ==================== BULK OPERATIONS ====================

  /**
   * Bulk update preferences
   */
  async bulkUpdatePreferences(updateData: BulkPreferenceUpdate): Promise<ApiResponse<{ affected: number; message: string }>> {
    return apiRequest<{ affected: number; message: string }>('/preference/items/bulk', {
      method: 'POST',
      body: JSON.stringify(updateData),
    });
  },

  // ==================== TEMPLATES ====================

  /**
   * Get preference templates
   */
  async getTemplates(): Promise<ApiResponse<{ templates: PreferenceTemplate[] }>> {
    return apiRequest<{ templates: PreferenceTemplate[] }>('/preference/templates');
  },

  /**
   * Create preference template
   */
  async createTemplate(
    templateData: Omit<PreferenceTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<PreferenceTemplate>> {
    return apiRequest<PreferenceTemplate>('/preference/templates', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });
  },

  /**
   * Apply template to user
   */
  async applyTemplate(
    templateId: string,
    userId: string
  ): Promise<ApiResponse<{ applied: number; preferences: UserPreference[] }>> {
    return apiRequest<{ applied: number; preferences: UserPreference[] }>(`/preference/templates/${templateId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  // ==================== STATISTICS & ANALYTICS ====================

  /**
   * Get preference statistics
   */
  async getStats(): Promise<ApiResponse<PreferenceStats>> {
    return apiRequest<PreferenceStats>('/preferences/stats');
  },

  /**
   * Get category statistics
   */
  async getCategoryStats(categoryId: string): Promise<ApiResponse<{
    category: PreferenceCategory;
    totalPreferences: number;
    activePreferences: number;
    userEngagement: number;
    avgValue: number;
  }>> {
    return apiRequest<{
      category: PreferenceCategory;
      totalPreferences: number;
      activePreferences: number;
      userEngagement: number;
      avgValue: number;
    }>(`/preference/categories/${categoryId}/stats`);
  },

  // ==================== AUDIT TRAIL ====================

  /**
   * Get preference audit trail
   */
  async getAuditTrail(filters: {
    userId?: string;
    preferenceId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<ApiResponse<{ audits: PreferenceAudit[]; total: number }>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/preference/audit?${queryString}` : '/preference/audit';
    
    return apiRequest<{ audits: PreferenceAudit[]; total: number }>(endpoint);
  },

  // ==================== VALIDATION & UTILITIES ====================

  /**
   * Validate preference value against its definition
   */
  async validatePreferenceValue(
    preferenceId: string,
    value: any
  ): Promise<ApiResponse<{ valid: boolean; errors?: string[] }>> {
    return apiRequest<{ valid: boolean; errors?: string[] }>(`/preference/items/${preferenceId}/validate`, {
      method: 'POST',
      body: JSON.stringify({ value }),
    });
  },

  /**
   * Export preferences configuration
   */
  async exportPreferences(): Promise<ApiResponse<{
    categories: PreferenceCategory[];
    preferences: PreferenceItem[];
    exportedAt: string;
  }>> {
    return apiRequest<{
      categories: PreferenceCategory[];
      preferences: PreferenceItem[];
      exportedAt: string;
    }>('/preference/export');
  },

  /**
   * Import preferences configuration
   */
  async importPreferences(
    configData: {
      categories: Omit<PreferenceCategory, 'id' | 'createdAt' | 'updatedAt'>[];
      preferences: Omit<PreferenceItem, 'id' | 'createdAt' | 'updatedAt'>[];
    },
    options: {
      overwrite?: boolean;
      skipDuplicates?: boolean;
    } = {}
  ): Promise<ApiResponse<{
    imported: { categories: number; preferences: number };
    skipped: { categories: number; preferences: number };
    errors: string[];
  }>> {
    return apiRequest<{
      imported: { categories: number; preferences: number };
      skipped: { categories: number; preferences: number };
      errors: string[];
    }>('/preference/import', {
      method: 'POST',
      body: JSON.stringify({ ...configData, options }),
    });
  }
};

export default preferenceService;
