export interface PreferenceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
}

export interface PreferenceItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  type: 'boolean' | 'string' | 'number' | 'array' | 'object';
  required: boolean;
  defaultValue: any;
  options?: string[]; // for enum/select types
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  enabled: boolean;
  priority: number;
  users: number; // number of users who have this preference set
  createdAt: string;
  updatedAt: string;
}

export interface UserPreference {
  id: string;
  userId: string;
  partyId: string;
  preferenceId: string;
  value: any;
  source: 'user' | 'admin' | 'system' | 'consent';
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface PreferenceTemplate {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  settings: Record<string, any>;
  isDefault: boolean;
  applicableUserTypes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BulkPreferenceUpdate {
  userIds: string[];
  preferenceId: string;
  value: any;
  source: string;
}

export interface PreferenceAudit {
  id: string;
  userId: string;
  partyId: string;
  preferenceId: string;
  action: 'create' | 'update' | 'delete' | 'bulk_update';
  oldValue?: any;
  newValue?: any;
  source: string;
  performedBy: string;
  timestamp: string;
  reason?: string;
}

export interface PreferenceStats {
  totalPreferences: number;
  activePreferences: number;
  totalUsers: number;
  categoriesCount: number;
  lastUpdated: string;
  categoryStats: Record<string, {
    count: number;
    users: number;
    enabled: number;
  }>;
  userEngagement: {
    customizedUsers: number;
    defaultUsers: number;
    engagementRate: number;
  };
}
