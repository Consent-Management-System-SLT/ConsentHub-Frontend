import React, { useState } from 'react';
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
  CheckCircle
} from 'lucide-react';
import { mockGuardianConsents, mockMinorCustomers } from '../../data/mockData';

interface GuardianConsentFormProps {
  onClose?: () => void;
}

const GuardianConsentForm: React.FC<GuardianConsentFormProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'search' | 'create' | 'manage'>('search');
  const [selectedMinor, setSelectedMinor] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  const [formData, setFormData] = useState({
    minorId: '',
    guardianId: '',
    consentType: '',
    verificationMethod: 'identity_document',
    documents: [] as File[],
    notes: ''
  });

  const filteredMinors = mockMinorCustomers.filter(minor =>
    minor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    minor.guardianName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'revoked':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <X className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...Array.from(files)]
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Guardian consent form submitted:', formData);
    // Reset form or show success message
  };

  const handleDocumentView = (doc: any) => {
    setSelectedDocument(doc);
    setShowDocumentModal(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-indigo-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Guardian Consent Management</h2>
              <p className="text-gray-600">Manage parental consent for minor customers</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8 px-6">
          {[
            { id: 'search', label: 'Search & View', icon: User },
            { id: 'create', label: 'Create Consent', icon: FileText },
            { id: 'manage', label: 'Manage Existing', icon: Shield }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* Search & View Tab */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by minor name or guardian name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Search
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMinors.map(minor => {
                const consent = mockGuardianConsents.find(c => c.minorId === minor.id);
                return (
                  <div key={minor.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{minor.name}</h3>
                          <p className="text-sm text-gray-500">Age: {minor.age}</p>
                        </div>
                      </div>
                      {consent && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(consent.status)}`}>
                          {consent.status}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Guardian: {minor.guardianName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Relation: {minor.guardianRelation}</span>
                      </div>
                      {consent && (
                        <div className="flex items-center space-x-2">
                          {getVerificationStatusIcon(consent.verificationStatus)}
                          <span className="text-gray-600">
                            Verification: {consent.verificationStatus}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => setSelectedMinor(minor.id)}
                        className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        View Details
                      </button>
                      {consent && consent.documents && (
                        <button
                          onClick={() => handleDocumentView(consent.documents?.[0])}
                          className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Create Consent Tab */}
        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minor Customer
                  </label>
                  <select
                    value={formData.minorId}
                    onChange={(e) => setFormData(prev => ({ ...prev, minorId: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select minor customer</option>
                    {mockMinorCustomers.map(minor => (
                      <option key={minor.id} value={minor.id}>
                        {minor.name} (Age: {minor.age})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guardian ID
                  </label>
                  <input
                    type="text"
                    value={formData.guardianId}
                    onChange={(e) => setFormData(prev => ({ ...prev, guardianId: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter guardian ID"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consent Type
                </label>
                <select
                  value={formData.consentType}
                  onChange={(e) => setFormData(prev => ({ ...prev, consentType: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select consent type</option>
                  <option value="data_processing">Data Processing</option>
                  <option value="marketing_communications">Marketing Communications</option>
                  <option value="data_sharing">Data Sharing</option>
                  <option value="cookies">Cookies & Tracking</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Method
                </label>
                <select
                  value={formData.verificationMethod}
                  onChange={(e) => setFormData(prev => ({ ...prev, verificationMethod: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="identity_document">Identity Document</option>
                  <option value="phone_verification">Phone Verification</option>
                  <option value="email_verification">Email Verification</option>
                  <option value="in_person">In-Person Verification</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Documents
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-300 transition-colors">
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Upload verification documents (ID, birth certificate, etc.)
                    </p>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="document-upload"
                    />
                    <label
                      htmlFor="document-upload"
                      className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors inline-block"
                    >
                      Choose Files
                    </label>
                  </div>
                  {formData.documents.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Selected Files:</p>
                      {formData.documents.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm text-gray-600">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              documents: prev.documents.filter((_, i) => i !== index)
                            }))}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Additional notes or comments..."
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Create Guardian Consent
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({
                    minorId: '',
                    guardianId: '',
                    consentType: '',
                    verificationMethod: 'identity_document',
                    documents: [],
                    notes: ''
                  })}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Manage Existing Tab */}
        {activeTab === 'manage' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Existing Guardian Consents</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Minor / Guardian
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Consent Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Verification
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Granted Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockGuardianConsents.map(consent => {
                      const minor = mockMinorCustomers.find(m => m.id === consent.minorId);
                      return (
                        <tr key={consent.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {minor?.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                Guardian: {minor?.guardianName}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {consent.consentType.replace('_', ' ')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(consent.status)}`}>
                              {consent.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {getVerificationStatusIcon(consent.verificationStatus)}
                              <span className="text-sm text-gray-600">
                                {consent.verificationStatus}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(consent.grantedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-indigo-600 hover:text-indigo-900">
                                <Eye className="w-4 h-4" />
                              </button>
                              {consent.documents && (
                                <button className="text-green-600 hover:text-green-900">
                                  <Download className="w-4 h-4" />
                                </button>
                              )}
                              <button className="text-red-600 hover:text-red-900">
                                <X className="w-4 h-4" />
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
          </div>
        )}
      </div>

      {/* Document Modal */}
      {showDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Document Viewer</h3>
                <button
                  onClick={() => setShowDocumentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Document preview would appear here</p>
                <p className="text-sm text-gray-500 mt-2">
                  {selectedDocument?.type}: {selectedDocument?.url}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuardianConsentForm;
