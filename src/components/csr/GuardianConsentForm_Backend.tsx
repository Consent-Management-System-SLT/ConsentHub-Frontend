import React, { useState, useEffect } from 'react';
import { 
  User, 
  FileText, 
  Shield, 
  Calendar, 
  Phone, 
  Mail, 
  Upload, 
  Check, 
  X, 
  AlertCircle,
  Eye,
  Download,
  Clock,
  CheckCircle,
  Search,
  RefreshCw,
  Plus
} from 'lucide-react';
import { csrDashboardService } from '../../services/csrDashboardService';

interface GuardianConsentFormProps {
  onClose?: () => void;
  customerId?: string;
}

const GuardianConsentForm: React.FC<GuardianConsentFormProps> = ({ onClose, customerId }) => {
  const [activeTab, setActiveTab] = useState<'search' | 'create' | 'manage'>('search');
  const [selectedMinor, setSelectedMinor] = useState<string>(customerId || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [minors, setMinors] = useState<any[]>([]);
  const [guardianConsents, setGuardianConsents] = useState<any[]>([]);
  const [guardians, setGuardians] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    minorId: '',
    guardianId: '',
    consentType: 'data_processing',
    verificationMethod: 'identity_document',
    documents: [] as File[],
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadMinors(),
        loadGuardianConsents(),
        loadGuardians()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMinors = async () => {
    try {
      const allCustomers = await csrDashboardService.getCustomers();
      // Filter for minors (assuming we have an age field or type)
      const minorCustomers = allCustomers.filter((customer: any) => 
        customer.type === 'minor' || 
        (customer.dateOfBirth && calculateAge(customer.dateOfBirth) < 18)
      );
      setMinors(minorCustomers);
    } catch (error) {
      console.error('Error loading minors:', error);
    }
  };

  const loadGuardians = async () => {
    try {
      const allCustomers = await csrDashboardService.getCustomers();
      // Filter for guardians (adults)
      const guardianCustomers = allCustomers.filter((customer: any) => 
        customer.type === 'guardian' || 
        (customer.dateOfBirth && calculateAge(customer.dateOfBirth) >= 18)
      );
      setGuardians(guardianCustomers);
    } catch (error) {
      console.error('Error loading guardians:', error);
    }
  };

  const loadGuardianConsents = async () => {
    try {
      const guardianConsentData = await csrDashboardService.getGuardianConsentData();
      setGuardianConsents(guardianConsentData);
    } catch (error) {
      console.error('Error loading guardian consents:', error);
    }
  };

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleCreateConsent = async () => {
    if (!formData.minorId || !formData.guardianId || !formData.consentType) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const newConsent = {
        id: Date.now().toString(),
        partyId: formData.minorId,
        guardianId: formData.guardianId,
        consentType: formData.consentType,
        status: 'pending',
        verificationMethod: formData.verificationMethod,
        notes: formData.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // For demo purposes, just add to local state
      setGuardianConsents(prev => [...prev, newConsent]);
      
      // Reset form
      setFormData({
        minorId: '',
        guardianId: '',
        consentType: 'data_processing',
        verificationMethod: 'identity_document',
        documents: [],
        notes: ''
      });
      
      setActiveTab('manage');
      alert('Guardian consent created successfully! (Demo Mode)');
    } catch (error) {
      console.error('Error creating consent:', error);
      alert('Error creating consent. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateConsentStatus = async (consentId: string, newStatus: string) => {
    try {
      // Update local state for demo
      setGuardianConsents(prev => 
        prev.map(consent => 
          consent.id === consentId 
            ? { ...consent, status: newStatus, updatedAt: new Date().toISOString() }
            : consent
        )
      );
      
      alert('Consent status updated successfully! (Demo Mode)');
    } catch (error) {
      console.error('Error updating consent status:', error);
      alert('Error updating consent status. Please try again.');
    }
  };

  const filteredMinors = minors.filter(minor =>
    minor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    minor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'revoked':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'revoked':
        return <X className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
          <span className="ml-2 text-gray-600">Loading guardian consent data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Guardian Consent Management</h2>
              <p className="text-sm text-gray-600">Manage consent for minor customers</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('search')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'search'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Search className="w-4 h-4 inline mr-2" />
            Search Minors
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'create'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Create Consent
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'manage'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Manage Consents
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search minor customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMinors.map(minor => (
                <div key={minor.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{minor.name}</h3>
                      <p className="text-sm text-gray-600">{minor.email}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Age:</span>
                      <span className="font-medium">
                        {minor.dateOfBirth ? calculateAge(minor.dateOfBirth) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Guardian:</span>
                      <span className="font-medium">{minor.guardianName || 'Not assigned'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMinor(minor.id);
                      setFormData(prev => ({ ...prev, minorId: minor.id }));
                      setActiveTab('create');
                    }}
                    className="w-full mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Create Consent
                  </button>
                </div>
              ))}
            </div>

            {filteredMinors.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No minor customers found</p>
              </div>
            )}
          </div>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minor Customer *
                </label>
                <select
                  value={formData.minorId}
                  onChange={(e) => setFormData(prev => ({ ...prev, minorId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select minor customer</option>
                  {minors.map(minor => (
                    <option key={minor.id} value={minor.id}>
                      {minor.name} ({minor.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guardian *
                </label>
                <select
                  value={formData.guardianId}
                  onChange={(e) => setFormData(prev => ({ ...prev, guardianId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select guardian</option>
                  {guardians.map(guardian => (
                    <option key={guardian.id} value={guardian.id}>
                      {guardian.name} ({guardian.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consent Type *
                </label>
                <select
                  value={formData.consentType}
                  onChange={(e) => setFormData(prev => ({ ...prev, consentType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="data_processing">Data Processing</option>
                  <option value="marketing">Marketing Communications</option>
                  <option value="service_improvement">Service Improvement</option>
                  <option value="third_party_sharing">Third Party Sharing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Method
                </label>
                <select
                  value={formData.verificationMethod}
                  onChange={(e) => setFormData(prev => ({ ...prev, verificationMethod: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="identity_document">Identity Document</option>
                  <option value="digital_signature">Digital Signature</option>
                  <option value="biometric">Biometric Verification</option>
                  <option value="video_call">Video Call Verification</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Add any additional notes about this consent..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setActiveTab('search')}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateConsent}
                disabled={saving}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{saving ? 'Creating...' : 'Create Consent'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Manage Tab */}
        {activeTab === 'manage' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Guardian Consents</h3>
              <button
                onClick={loadGuardianConsents}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Minor</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Guardian</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Consent Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Created</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {guardianConsents.map(consent => {
                    const minor = minors.find(m => m.id === consent.partyId);
                    const guardian = guardians.find(g => g.id === consent.guardianId);
                    
                    return (
                      <tr key={consent.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {minor?.name || 'Unknown'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {guardian?.name || 'Unknown'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 capitalize">
                          {consent.consentType?.replace(/_/g, ' ') || 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(consent.status)}`}>
                            {getStatusIcon(consent.status)}
                            <span className="ml-1 capitalize">{consent.status}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {consent.createdAt ? new Date(consent.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            {consent.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateConsentStatus(consent.id, 'active')}
                                  className="text-green-600 hover:text-green-800 transition-colors"
                                  title="Approve"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleUpdateConsentStatus(consent.id, 'revoked')}
                                  className="text-red-600 hover:text-red-800 transition-colors"
                                  title="Reject"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {consent.status === 'active' && (
                              <button
                                onClick={() => handleUpdateConsentStatus(consent.id, 'revoked')}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Revoke"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {guardianConsents.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No guardian consents found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuardianConsentForm;
