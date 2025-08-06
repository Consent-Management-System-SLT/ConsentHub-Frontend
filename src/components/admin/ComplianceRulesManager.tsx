import React from 'react';
import { AlertTriangle, Settings, Plus, Edit, Trash2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const ComplianceRulesManager: React.FC = () => {
  const rules = [
    { id: 1, name: 'GDPR Consent Expiry', description: 'Automatically expire consents after 12 months', status: 'active', type: 'GDPR', lastUpdated: '2024-01-15' },
    { id: 2, name: 'CCPA Data Retention', description: 'Delete customer data after 24 months of inactivity', status: 'active', type: 'CCPA', lastUpdated: '2024-01-10' },
    { id: 3, name: 'Marketing Consent Validation', description: 'Require explicit consent for marketing communications', status: 'active', type: 'Marketing', lastUpdated: '2024-01-05' },
    { id: 4, name: 'Minor Data Protection', description: 'Require parental consent for users under 16', status: 'inactive', type: 'GDPR', lastUpdated: '2024-01-01' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance Rules</h1>
          <p className="text-gray-600 mt-2">Configure and manage compliance automation rules</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add Rule</span>
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rules.map((rule) => (
          <div key={rule.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex items-center space-x-2">
                {rule.status === 'active' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  rule.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {rule.status}
                </span>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{rule.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{rule.description}</p>
            
            <div className="flex items-center justify-between mb-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                rule.type === 'GDPR' ? 'bg-blue-100 text-blue-800' :
                rule.type === 'CCPA' ? 'bg-purple-100 text-purple-800' :
                'bg-green-100 text-green-800'
              }`}>
                {rule.type}
              </span>
              <span className="text-xs text-gray-500">Updated: {rule.lastUpdated}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                <Settings className="w-4 h-4" />
                <span className="text-sm">Configure</span>
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <Edit className="w-4 h-4" />
              </button>
              <button className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComplianceRulesManager;
