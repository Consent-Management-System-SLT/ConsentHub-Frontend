import React, { useState, useEffect } from 'react';
import { 
  Settings, Shield, Database, Users, Bell, Mail, Globe, Lock, RefreshCw,
  Plus, Edit, Trash2, Eye, EyeOff, Search, Filter, ChevronDown,
  Save, X, AlertTriangle, CheckCircle, Info, Download, Upload
} from 'lucide-react';
import { preferenceService, PreferenceCreateRequest, CategoryCreateRequest } from '../../services/preferenceService';
import { PreferenceCategory, PreferenceItem, PreferenceStats } from '../../types/preference';

interface PreferenceFormData extends Omit<PreferenceCreateRequest, 'categoryId'> {
  categoryId: string;
}

interface CategoryFormData extends CategoryCreateRequest {
  id?: string;
}

const PreferenceManager: React.FC = () => {
  // State management
  const [preferences, setPreferences] = useState<PreferenceItem[]>([]);
  const [categories, setCategories] = useState<PreferenceCategory[]>([]);
  const [stats, setStats] = useState<PreferenceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [enabledFilter, setEnabledFilter] = useState<boolean | null>(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingPreference, setEditingPreference] = useState<PreferenceItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<PreferenceCategory | null>(null);

  // Form states
  const [preferenceForm, setPreferenceForm] = useState<PreferenceFormData>({
    categoryId: '',
    name: '',
    description: '',
    type: 'boolean',
    required: false,
    defaultValue: false,
    priority: 0
  });

  const [categoryForm, setCategoryForm] = useState<CategoryFormData>({
    name: '',
    description: '',
    icon: 'Settings',
    priority: 0
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [categoriesResult, preferencesResult, statsResult] = await Promise.all([
        preferenceService.getCategories(),
        preferenceService.getPreferences({
          search: searchTerm,
          categoryId: selectedCategory || undefined,
          enabled: enabledFilter ?? undefined,
          type: typeFilter || undefined,
          limit: itemsPerPage,
          offset: (currentPage - 1) * itemsPerPage
        }),
        preferenceService.getStats()
      ]);

      if (categoriesResult.success) setCategories(categoriesResult.data.categories);
      if (preferencesResult.success) setPreferences(preferencesResult.data.preferences);
      if (statsResult.success) setStats(statsResult.data);

    } catch (err) {
      setError('Failed to load preference data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Preference CRUD operations
  const handleCreatePreference = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await preferenceService.createPreference(preferenceForm);
      if (result.success) {
        setPreferences([...preferences, result.data]);
        setShowCreateModal(false);
        resetPreferenceForm();
        await loadData(); // Refresh stats
      }
    } catch (err) {
      setError('Failed to create preference');
    }
  };

  const handleEditPreference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPreference) return;

    try {
      const result = await preferenceService.updatePreference(editingPreference.id, preferenceForm);
      if (result.success) {
        setPreferences(preferences.map(p => 
          p.id === editingPreference.id ? result.data : p
        ));
        setShowEditModal(false);
        setEditingPreference(null);
        resetPreferenceForm();
      }
    } catch (err) {
      setError('Failed to update preference');
    }
  };

  const handleDeletePreference = async (id: string) => {
    if (!confirm('Are you sure you want to delete this preference? This will also remove all user preferences for this item.')) {
      return;
    }

    try {
      const result = await preferenceService.deletePreference(id);
      if (result.success) {
        setPreferences(preferences.filter(p => p.id !== id));
        await loadData(); // Refresh stats
      }
    } catch (err) {
      setError('Failed to delete preference');
    }
  };

  const handleTogglePreference = async (id: string, enabled: boolean) => {
    try {
      const result = await preferenceService.togglePreference(id, enabled);
      if (result.success) {
        setPreferences(preferences.map(p => 
          p.id === id ? { ...p, enabled } : p
        ));
      }
    } catch (err) {
      setError('Failed to toggle preference');
    }
  };

  // Category CRUD operations
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await preferenceService.createCategory(categoryForm);
      if (result.success) {
        setCategories([...categories, result.data]);
        setShowCategoryModal(false);
        resetCategoryForm();
        await loadData();
      }
    } catch (err) {
      setError('Failed to create category');
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      const result = await preferenceService.updateCategory(editingCategory.id, categoryForm);
      if (result.success) {
        setCategories(categories.map(c => 
          c.id === editingCategory.id ? result.data : c
        ));
        setShowCategoryModal(false);
        setEditingCategory(null);
        resetCategoryForm();
      }
    } catch (err) {
      setError('Failed to update category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? All preferences in this category will also be deleted.')) {
      return;
    }

    try {
      const result = await preferenceService.deleteCategory(id);
      if (result.success) {
        setCategories(categories.filter(c => c.id !== id));
        setPreferences(preferences.filter(p => p.categoryId !== id));
        await loadData();
      }
    } catch (err) {
      setError('Failed to delete category');
    }
  };

  // Form helpers
  const resetPreferenceForm = () => {
    setPreferenceForm({
      categoryId: '',
      name: '',
      description: '',
      type: 'boolean',
      required: false,
      defaultValue: false,
      priority: 0
    });
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      icon: 'Settings',
      priority: 0
    });
  };

  const openEditModal = (preference: PreferenceItem) => {
    setEditingPreference(preference);
    setPreferenceForm({
      categoryId: preference.categoryId,
      name: preference.name,
      description: preference.description,
      type: preference.type,
      required: preference.required,
      defaultValue: preference.defaultValue,
      options: preference.options,
      validation: preference.validation,
      priority: preference.priority
    });
    setShowEditModal(true);
  };

  const openCategoryEditModal = (category: PreferenceCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      id: category.id,
      name: category.name,
      description: category.description,
      icon: category.icon,
      priority: category.priority
    });
    setShowCategoryModal(true);
  };

  // UI helper functions
  const getCategoryIcon = (icon: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'Settings': <Settings className="w-5 h-5" />,
      'Shield': <Shield className="w-5 h-5" />,
      'Mail': <Mail className="w-5 h-5" />,
      'Bell': <Bell className="w-5 h-5" />,
      'Lock': <Lock className="w-5 h-5" />,
      'Users': <Users className="w-5 h-5" />,
      'Globe': <Globe className="w-5 h-5" />,
      'Database': <Database className="w-5 h-5" />
    };
    return iconMap[icon] || <Settings className="w-5 h-5" />;
  };

  const getTypeColor = (type: string) => {
    const typeColors: { [key: string]: string } = {
      'boolean': 'bg-blue-100 text-blue-800',
      'string': 'bg-green-100 text-green-800',
      'number': 'bg-yellow-100 text-yellow-800',
      'array': 'bg-purple-100 text-purple-800',
      'object': 'bg-red-100 text-red-800',
      'enum': 'bg-indigo-100 text-indigo-800'
    };
    return typeColors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading preferences...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-myslt-background">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-myslt-text-primary">Preference Management</h1>
          <p className="text-myslt-text-secondary mt-2">Configure and manage customer preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add Category</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-myslt-primary text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add Preference</span>
          </button>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-myslt-surface rounded-xl shadow-sm border border-myslt-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-myslt-text-secondary">Total Preferences</p>
                <p className="text-2xl font-bold text-myslt-primary">{stats.totalPreferences}</p>
              </div>
              <div className="w-12 h-12 bg-myslt-accent rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-myslt-primary" />
              </div>
            </div>
          </div>
          
          <div className="bg-myslt-surface rounded-xl shadow-sm border border-myslt-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-myslt-text-secondary">Active Preferences</p>
                <p className="text-2xl font-bold text-green-600">{stats.activePreferences}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-myslt-surface rounded-xl shadow-sm border border-myslt-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-myslt-text-secondary">Total Users</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-myslt-surface rounded-xl shadow-sm border border-myslt-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-myslt-text-secondary">Categories</p>
                <p className="text-2xl font-bold text-orange-600">{stats.categoriesCount}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-myslt-surface rounded-xl shadow-sm border border-myslt-border p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-myslt-text-primary mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-myslt-text-muted" />
              <input
                type="text"
                placeholder="Search preferences..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-myslt-border rounded-lg focus:ring-2 focus:ring-myslt-primary focus:border-myslt-primary bg-myslt-background text-myslt-text-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-myslt-text-primary mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-myslt-border rounded-lg focus:ring-2 focus:ring-myslt-primary focus:border-myslt-primary bg-myslt-background text-myslt-text-primary"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-myslt-text-primary mb-2">Status</label>
            <select
              value={enabledFilter === null ? '' : enabledFilter.toString()}
              onChange={(e) => setEnabledFilter(e.target.value === '' ? null : e.target.value === 'true')}
              className="w-full px-3 py-2 border border-myslt-border rounded-lg focus:ring-2 focus:ring-myslt-primary focus:border-myslt-primary bg-myslt-background text-myslt-text-primary"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-myslt-text-primary mb-2">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-myslt-border rounded-lg focus:ring-2 focus:ring-myslt-primary focus:border-myslt-primary bg-myslt-background text-myslt-text-primary"
            >
              <option value="">All Types</option>
              <option value="boolean">Boolean</option>
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="array">Array</option>
              <option value="object">Object</option>
              <option value="enum">Enum</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={loadData}
            className="px-4 py-2 bg-myslt-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
              setEnabledFilter(null);
              setTypeFilter('');
              loadData();
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Preferences Table */}
      <div className="bg-myslt-surface rounded-xl shadow-sm border border-myslt-border overflow-hidden">
        <div className="p-6 border-b border-myslt-border">
          <h3 className="text-lg font-semibold text-myslt-text-primary">Preference Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full myslt-table">
            <thead className="myslt-table-header">
              <tr>
                <th className="myslt-table-header-cell">
                  Preference
                </th>
                <th className="myslt-table-header-cell">
                  Category
                </th>
                <th className="myslt-table-header-cell">
                  Type
                </th>
                <th className="myslt-table-header-cell">
                  Status
                </th>
                <th className="myslt-table-header-cell">
                  Users
                </th>
                <th className="myslt-table-header-cell">
                  Priority
                </th>
                <th className="myslt-table-header-cell">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-myslt-surface divide-y divide-myslt-border">
              {preferences.map((preference) => {
                const category = categories.find(c => c.id === preference.categoryId);
                return (
                  <tr key={preference.id} className="hover:bg-myslt-accent">
                    <td className="myslt-table-cell">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-myslt-accent rounded-xl flex items-center justify-center mr-4">
                          {category && getCategoryIcon(category.icon)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-myslt-text-primary">{preference.name}</div>
                          <div className="text-sm text-myslt-text-secondary">{preference.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="myslt-table-cell">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-myslt-accent text-myslt-text-primary">
                        {category?.name || 'Unknown'}
                      </span>
                    </td>
                    <td className="myslt-table-cell">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(preference.type)}`}>
                        {preference.type}
                      </span>
                    </td>
                    <td className="myslt-table-cell">
                      <button
                        onClick={() => handleTogglePreference(preference.id, !preference.enabled)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          preference.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {preference.enabled ? (
                          <>
                            <Eye className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="myslt-table-cell">
                      {preference.users.toLocaleString()}
                    </td>
                    <td className="myslt-table-cell">
                      {preference.priority}
                    </td>
                    <td className="myslt-table-cell">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(preference)}
                          className="text-myslt-primary hover:text-blue-900 p-1 hover:bg-myslt-accent rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePreference(preference.id)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Preference Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-myslt-surface rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-myslt-text-primary mb-4">Create Preference</h2>
            <form onSubmit={handleCreatePreference}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={preferenceForm.categoryId}
                    onChange={(e) => setPreferenceForm({...preferenceForm, categoryId: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={preferenceForm.name}
                    onChange={(e) => setPreferenceForm({...preferenceForm, name: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={preferenceForm.description}
                    onChange={(e) => setPreferenceForm({...preferenceForm, description: e.target.value})}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={preferenceForm.type}
                    onChange={(e) => setPreferenceForm({...preferenceForm, type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="boolean">Boolean</option>
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="array">Array</option>
                    <option value="object">Object</option>
                    <option value="enum">Enum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <input
                    type="number"
                    value={preferenceForm.priority}
                    onChange={(e) => setPreferenceForm({...preferenceForm, priority: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="required"
                    checked={preferenceForm.required}
                    onChange={(e) => setPreferenceForm({...preferenceForm, required: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="required" className="ml-2 block text-sm text-gray-900">
                    Required
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetPreferenceForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Preference
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Preference Modal */}
      {showEditModal && editingPreference && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Preference</h2>
            <form onSubmit={handleEditPreference}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={preferenceForm.categoryId}
                    onChange={(e) => setPreferenceForm({...preferenceForm, categoryId: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={preferenceForm.name}
                    onChange={(e) => setPreferenceForm({...preferenceForm, name: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={preferenceForm.description}
                    onChange={(e) => setPreferenceForm({...preferenceForm, description: e.target.value})}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={preferenceForm.type}
                    onChange={(e) => setPreferenceForm({...preferenceForm, type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="boolean">Boolean</option>
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="array">Array</option>
                    <option value="object">Object</option>
                    <option value="enum">Enum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <input
                    type="number"
                    value={preferenceForm.priority}
                    onChange={(e) => setPreferenceForm({...preferenceForm, priority: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit-required"
                    checked={preferenceForm.required}
                    onChange={(e) => setPreferenceForm({...preferenceForm, required: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="edit-required" className="ml-2 block text-sm text-gray-900">
                    Required
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPreference(null);
                    resetPreferenceForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Preference
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create/Edit Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </h2>
            <form onSubmit={editingCategory ? handleEditCategory : handleCreateCategory}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <select
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm({...categoryForm, icon: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Settings">Settings</option>
                    <option value="Shield">Shield</option>
                    <option value="Mail">Mail</option>
                    <option value="Bell">Bell</option>
                    <option value="Lock">Lock</option>
                    <option value="Users">Users</option>
                    <option value="Globe">Globe</option>
                    <option value="Database">Database</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <input
                    type="number"
                    value={categoryForm.priority}
                    onChange={(e) => setCategoryForm({...categoryForm, priority: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryModal(false);
                    setEditingCategory(null);
                    resetCategoryForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories Section */}
      <div className="mt-12 bg-myslt-surface rounded-xl shadow-sm border border-myslt-border">
        <div className="p-6 border-b border-myslt-border">
          <h3 className="text-lg font-semibold text-myslt-text-primary">Categories</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="border border-myslt-border rounded-lg p-4 bg-myslt-background">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-myslt-accent rounded-lg flex items-center justify-center">
                      {getCategoryIcon(category.icon)}
                    </div>
                    <div>
                      <h4 className="font-medium text-myslt-text-primary">{category.name}</h4>
                      <p className="text-sm text-myslt-text-secondary">Priority: {category.priority}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => openCategoryEditModal(category)}
                      className="p-1 text-myslt-primary hover:bg-myslt-accent rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-myslt-text-secondary">{category.description}</p>
                <div className="mt-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    category.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {category.enabled ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferenceManager;
