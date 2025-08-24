import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';

interface GuardianConsentProps {
  guardianId?: string;
  onClose?: () => void;
}

interface Guardian {
  id: string;
  name: string;
  email: string;
  minors: MinorInfo[];
}

interface MinorInfo {
  id: string;
  name: string;
  age: number;
}

interface ConsentItem {
  purpose: string;
  status: 'granted' | 'revoked';
  validTo?: string;
  minorAge: number;
}

interface CreatedConsent {
  id: string;
  purpose: string;
  status: string;
  createdAt: string;
  guardianName: string;
  minorName: string;
  minorAge: number;
}

const GuardianConsent: React.FC<GuardianConsentProps> = ({ guardianId, onClose }) => {
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [selectedGuardian, setSelectedGuardian] = useState<string>(guardianId || '');
  const [minors, setMinors] = useState<MinorInfo[]>([]);
  const [selectedMinor, setSelectedMinor] = useState<string>('');
  const [consents, setConsents] = useState<ConsentItem[]>([
    { purpose: 'Marketing Communications', status: 'granted', minorAge: 0 },
    { purpose: 'Service Updates', status: 'granted', minorAge: 0 },
    { purpose: 'Educational Content', status: 'granted', minorAge: 0 },
    { purpose: 'Account Management', status: 'granted', minorAge: 0 }
  ]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdConsents, setCreatedConsents] = useState<CreatedConsent[]>([]);
  const [showConsentView, setShowConsentView] = useState(false);

  useEffect(() => {
    if (!guardianId) {
      loadGuardians();
    } else {
      fetchMinors();
    }
  }, [guardianId]);

  const loadGuardians = async () => {
    try {
      const response = await apiClient.get('/api/guardians');
      setGuardians(response.data);
    } catch (error) {
      console.error('Error loading guardians:', error);
      // Mock data for demo
      setGuardians([
        {
          id: '1',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          minors: [
            { id: '1-1', name: 'Emma Johnson', age: 12 },
            { id: '1-2', name: 'Jack Johnson', age: 8 }
          ]
        },
        {
          id: '2', 
          name: 'Michael Chen',
          email: 'michael.chen@email.com',
          minors: [
            { id: '2-1', name: 'Lily Chen', age: 14 }
          ]
        }
      ]);
    }
  };

  const fetchMinors = async () => {
    try {
      // In a real implementation, this would fetch dependents from the guardian's profile
      setMinors([
        { id: 'minor_001', name: 'Alice Johnson', age: 12 },
        { id: 'minor_002', name: 'Bob Johnson', age: 8 }
      ]);
      if (minors.length > 0) {
        setSelectedMinor(minors[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch minors:', error);
    }
  };

  const updateConsent = (index: number, field: keyof ConsentItem, value: any) => {
    const updatedConsents = [...consents];
    updatedConsents[index] = { ...updatedConsents[index], [field]: value };
    setConsents(updatedConsents);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMinor) {
      alert('Please select a minor dependent');
      return;
    }

    const currentGuardianId = guardianId || selectedGuardian;
    if (!currentGuardianId) {
      alert('Please select a guardian');
      return;
    }

    setLoading(true);
    try {
      const selectedMinorInfo = minors.find(m => m.id === selectedMinor);
      const consentData = {
        guardianId: currentGuardianId,
        minorId: selectedMinor,
        consents: consents.map(consent => ({
          ...consent,
          minorAge: selectedMinorInfo?.age || 0,
          validTo: consent.validTo || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        }))
      };

      console.log('Sending guardian consent data:', consentData);
      const response = await apiClient.post('/api/v1/guardian/consent', consentData);
      
      if (response.data && ((response.data as any).success || (response.data as any).guardianConsents)) {
        // Store created consent information
        const selectedGuardianInfo = guardians.find(g => g.id === currentGuardianId);
        const selectedMinorInfo = minors.find(m => m.id === selectedMinor);
        
        const newConsents: CreatedConsent[] = consents.map((consent, index) => ({
          id: `consent_${Date.now()}_${index}`,
          purpose: consent.purpose,
          status: consent.status,
          createdAt: new Date().toISOString(),
          guardianName: selectedGuardianInfo?.name || 'Unknown Guardian',
          minorName: selectedMinorInfo?.name || 'Unknown Minor',
          minorAge: selectedMinorInfo?.age || 0
        }));
        
        setCreatedConsents(newConsents);
        setSuccess(true);
        console.log('Guardian consent created successfully:', response.data);
        
        // Remove the automatic close timeout - let user manually close
        // setTimeout(() => { onClose?.(); }, 2000);
      }
    } catch (error) {
      console.error('Failed to create guardian consent:', error);
      alert('Failed to create guardian consent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
          {/* Close button */}
          <button
            onClick={() => onClose?.()}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Guardian Consent Created</h3>
            <p className="text-gray-600 mb-6">Consent preferences have been successfully recorded for your dependent.</p>
            
            {/* Action buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowConsentView(true);
                  setSuccess(false);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                View Consents
              </button>
              <button
                onClick={() => onClose?.()}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show created consents view
  if (showConsentView) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with back button */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Guardian Consent Records</h1>
              <p className="text-gray-600">Recently created consent preferences</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowConsentView(false);
                  setSuccess(false);
                  // Reset form for new consent creation
                  setSelectedMinor('');
                  setConsents([
                    { purpose: 'Marketing Communications', status: 'granted', minorAge: 0 },
                    { purpose: 'Service Updates', status: 'granted', minorAge: 0 },
                    { purpose: 'Educational Content', status: 'granted', minorAge: 0 },
                    { purpose: 'Account Management', status: 'granted', minorAge: 0 }
                  ]);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create New Consent
              </button>
              <button
                onClick={() => onClose?.()}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        {/* Consent Records Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Created Consent Records</h3>
            <p className="text-sm text-gray-500">Total: {createdConsents.length} consent(s)</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purpose
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guardian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Minor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {createdConsents.map((consent, index) => (
                  <tr key={consent.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {consent.purpose}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        consent.status === 'granted' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {consent.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {consent.guardianName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {consent.minorName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {consent.minorAge} years
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(consent.createdAt).toLocaleDateString()} {new Date(consent.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Consent Successfully Recorded</h3>
              <div className="mt-1 text-sm text-blue-700">
                <p>All {createdConsents.length} consent preferences have been saved and are now active. The guardian and minor can view these settings in their respective dashboards.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Guardian Consent Management</h1>
        <p className="text-gray-600">
          Manage consent preferences for minors under guardian supervision (GDPR Article 8 compliance)
        </p>
      </div>

      {/* Guardian Selection (if not provided) */}
      {!guardianId && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Guardian</h2>
          <select
            value={selectedGuardian}
            onChange={(e) => {
              setSelectedGuardian(e.target.value);
              const guardian = guardians.find(g => g.id === e.target.value);
              if (guardian) {
                setMinors(guardian.minors);
                setSelectedMinor('');
              }
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a guardian...</option>
            {guardians.map(guardian => (
              <option key={guardian.id} value={guardian.id}>
                {guardian.name} ({guardian.email}) - {guardian.minors.length} minor(s)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Consent Management Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Dependent
            </label>
            <select
              value={selectedMinor}
              onChange={(e) => setSelectedMinor(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select a dependent...</option>
              {minors.map(minor => (
                <option key={minor.id} value={minor.id}>
                  {minor.name} (Age: {minor.age})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Consent Preferences</h3>
            <div className="space-y-4">
              {consents.map((consent, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{consent.purpose}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Data processing for {consent.purpose.toLowerCase()} purposes
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`consent-${index}`}
                          value="granted"
                          checked={consent.status === 'granted'}
                          onChange={() => updateConsent(index, 'status', 'granted')}
                          className="mr-2"
                        />
                        <span className="text-sm text-green-600">Allow</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`consent-${index}`}
                          value="revoked"
                          checked={consent.status === 'revoked'}
                          onChange={() => updateConsent(index, 'status', 'revoked')}
                          className="mr-2"
                        />
                        <span className="text-sm text-red-600">Deny</span>
                      </label>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valid Until
                    </label>
                    <input
                      type="date"
                      value={consent.validTo?.split('T')[0] || ''}
                      onChange={(e) => updateConsent(index, 'validTo', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                      className="p-2 border border-gray-300 rounded"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="flex">
              <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-blue-800">Guardian Consent Notice</h4>
                <p className="text-sm text-blue-700 mt-1">
                  As a legal guardian, you are providing consent on behalf of your dependent. 
                  This consent can be modified or revoked at any time through your guardian portal.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="submit"
              disabled={loading || !selectedMinor}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Guardian Consent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GuardianConsent;
