import React, { useState, useEffect } from 'react';
import { Shield, Settings, Plus, AlertTriangle, Eye, Edit, Trash2, X, Save, RefreshCw, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ComplianceRulesManager = () => {
  const { getAuthToken } = useAuth();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    ruleType: 'GDPR',
    category: 'consent_management',
    status: 'draft',
    priority: 'medium'
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await fetch('http://localhost:3001/api/v1/compliance-rules', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setRules(data.data.rules);
        setError('');
      } else {
        setError('Failed to fetch compliance rules');
      }
    } catch (err) {
      console.error('Error fetching compliance rules:', err);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('http://localhost:3001/api/v1/compliance-rules', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRule)
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Compliance rule created successfully');
        setShowAddModal(false);
        setNewRule({
          name: '',
          description: '',
          ruleType: 'GDPR',
          category: 'consent_management',
          status: 'draft',
          priority: 'medium'
        });
        fetchRules();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to create compliance rule');
      }
    } catch (err) {
      console.error('Error creating rule:', err);
      setError('Error creating compliance rule');
    }
  };

  const handleUpdateRule = async () => {
    if (!selectedRule) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://consenthub-backend.onrender.com'}/api/v1/compliance-rules/${selectedRule._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: selectedRule.name,
          description: selectedRule.description,
          status: selectedRule.status,
          priority: selectedRule.priority
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Compliance rule updated successfully');
        setShowEditModal(false);
        setSelectedRule(null);
        fetchRules();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update compliance rule');
      }
    } catch (err) {
      console.error('Error updating rule:', err);
      setError('Error updating compliance rule');
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (!confirm('Are you sure you want to delete this compliance rule?')) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://consenthub-backend.onrender.com'}/api/v1/compliance-rules/${ruleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Compliance rule deleted successfully');
        fetchRules();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to delete compliance rule');
      }
    } catch (err) {
      console.error('Error deleting rule:', err);
      setError('Error deleting compliance rule');
    }
  };

  const getPriorityColor = (priority: any) => {
    switch (priority) {
      case 'critical': return 'text-myslt-danger bg-myslt-danger/20 border border-myslt-danger/30';
      case 'high': return 'text-myslt-warning bg-myslt-warning/20 border border-myslt-warning/30';
      case 'medium': return 'text-myslt-info bg-myslt-info/20 border border-myslt-info/30';
      case 'low': return 'text-myslt-success bg-myslt-success/20 border border-myslt-success/30';
      default: return 'text-myslt-text-muted bg-myslt-muted/20 border border-myslt-muted/30';
    }
  };

  const getStatusColor = (status: any) => {
    switch (status) {
      case 'active': return 'text-myslt-success bg-myslt-success/20 border border-myslt-success/30';
      case 'inactive': return 'text-myslt-danger bg-myslt-danger/20 border border-myslt-danger/30';
      case 'draft': return 'text-myslt-text-muted bg-myslt-muted/20 border border-myslt-muted/30';
      case 'pending_review': return 'text-myslt-warning bg-myslt-warning/20 border border-myslt-warning/30';
      default: return 'text-myslt-text-muted bg-myslt-muted/20 border border-myslt-muted/30';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-myslt-text-primary">Compliance Rules Management</h1>
          <p className="text-myslt-text-secondary mt-2">Configure and manage automated compliance rules</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchRules}
            className="myslt-btn-secondary px-4 py-2 flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-medium">Refresh</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="myslt-btn-primary px-4 py-2 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add Rule</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="mb-6 bg-myslt-success/20 border border-myslt-success/30 text-myslt-success px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            {success}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-myslt-danger/20 border border-myslt-danger/30 text-myslt-danger px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-myslt-accent"></div>
        </div>
      ) : rules.length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-myslt-text-muted mb-4" />
          <p className="text-myslt-text-secondary text-lg">No compliance rules found</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="myslt-btn-primary mt-4 px-4 py-2"
          >
            Create your first rule
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rules.map((rule: any) => (
            <div key={rule._id} className="myslt-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-myslt-muted/10 rounded-lg">
                    <Shield className="w-5 h-5 text-myslt-accent" />
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rule.status)}`}>
                    {rule.status.replace('_', ' ')}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rule.priority)}`}>
                  {rule.priority}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-myslt-text-primary mb-2">{rule.name}</h3>
              <p className="text-sm text-myslt-text-secondary mb-4">{rule.description}</p>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-myslt-text-muted">Type:</span>
                  <span className="font-medium text-myslt-text-primary">{rule.ruleType}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-myslt-text-muted">Success Rate:</span>
                  <span className="font-medium text-myslt-success">{rule.metrics?.success_rate || 0}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-myslt-text-muted">Executions:</span>
                  <span className="font-medium text-myslt-text-primary">{rule.metrics?.enforcement_count || 0}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => { setSelectedRule(rule); setShowDetailsModal(true); }}
                  className="flex-1 myslt-btn-primary px-3 py-2 flex items-center justify-center space-x-2 text-sm"
                >
                  <Eye className="w-4 h-4" />
                  <span>Details</span>
                </button>
                <button
                  onClick={() => { setSelectedRule(rule); setShowEditModal(true); }}
                  className="p-2 text-myslt-accent hover:text-myslt-accent-hover hover:bg-myslt-accent/10 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteRule(rule._id)}
                  className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Add New Compliance Rule</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter rule name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter rule description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rule Type</label>
                  <select
                    value={newRule.ruleType}
                    onChange={(e) => setNewRule({ ...newRule, ruleType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="GDPR">GDPR</option>
                    <option value="CCPA">CCPA</option>
                    <option value="PIPEDA">PIPEDA</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newRule.priority}
                    onChange={(e) => setNewRule({ ...newRule, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRule}
                disabled={!newRule.name || !newRule.description}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Create Rule</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRule && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Compliance Rule Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{selectedRule.name}</h3>
                <p className="text-gray-600">{selectedRule.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Rule Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span className="font-medium">{selectedRule.ruleType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Category:</span>
                      <span className="font-medium">{selectedRule.category?.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedRule.status)}`}>
                        {selectedRule.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Priority:</span>
                      <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(selectedRule.priority)}`}>
                        {selectedRule.priority}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Performance Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Success Rate:</span>
                      <span className="font-medium text-green-600">{selectedRule.metrics?.success_rate || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Executions:</span>
                      <span className="font-medium">{selectedRule.metrics?.enforcement_count || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Created:</span>
                      <span className="font-medium">
                        {new Date(selectedRule.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => { setShowDetailsModal(false); setShowEditModal(true); }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Rule</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedRule && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Edit Compliance Rule</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={selectedRule.name}
                  onChange={(e) => setSelectedRule({ ...selectedRule, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={selectedRule.description}
                  onChange={(e) => setSelectedRule({ ...selectedRule, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={selectedRule.status}
                    onChange={(e) => setSelectedRule({ ...selectedRule, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending_review">Pending Review</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={selectedRule.priority}
                    onChange={(e) => setSelectedRule({ ...selectedRule, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRule}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Update Rule</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceRulesManager;
