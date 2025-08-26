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
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="myslt-card p-8 max-w-md w-full relative">
          {/* Close button */}
          <button
            onClick={() => onClose?.()}
            className="absolute top-4 right-4 text-myslt-text-muted hover:text-myslt-text-secondary transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-myslt-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-myslt-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-myslt-text-primary mb-2">Guardian Consent Created</h3>
            <p className="text-myslt-text-secondary mb-6">Consent preferences have been successfully recorded for your dependent.</p>
            
            {/* Action buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowConsentView(true);
                  setSuccess(false);
                }}
                className="myslt-btn-primary flex-1 px-4 py-2"
              >
                View Consents
              </button>
              <button
                onClick={() => onClose?.()}
                className="myslt-btn-secondary flex-1 px-4 py-2"
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
        <div className="myslt-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-myslt-text-primary">Guardian Consent Records</h1>
              <p className="text-myslt-text-secondary">Recently created consent preferences</p>
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
                className="myslt-btn-primary px-4 py-2"
              >
                Create New Consent
              </button>
              <button
                onClick={() => onClose?.()}
                className="myslt-btn-secondary px-4 py-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        {/* Consent Records Table */}
        <div className="myslt-card overflow-hidden">
          <div className="px-6 py-4 border-b border-myslt-border">
            <h3 className="text-lg font-medium text-myslt-text-primary">Created Consent Records</h3>
            <p className="text-sm text-myslt-text-secondary">Total: {createdConsents.length} consent(s)</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-myslt-border">
              <thead className="bg-myslt-muted/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-myslt-text-muted uppercase tracking-wider">
                    Purpose
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-myslt-text-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-myslt-text-muted uppercase tracking-wider">
                    Guardian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-myslt-text-muted uppercase tracking-wider">
                    Minor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-myslt-text-muted uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-myslt-text-muted uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-myslt-card divide-y divide-myslt-border">
                {createdConsents.map((consent, index) => (
                  <tr key={consent.id} className={index % 2 === 0 ? 'bg-myslt-card' : 'bg-myslt-muted/5'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-myslt-text-primary">
                      {consent.purpose}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        consent.status === 'granted' 
                          ? 'bg-myslt-success/20 text-myslt-success border border-myslt-success/30' 
                          : 'bg-myslt-danger/20 text-myslt-danger border border-myslt-danger/30'
                      }`}>
                        {consent.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-myslt-text-primary">
                      {consent.guardianName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-myslt-text-primary">
                      {consent.minorName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-myslt-text-secondary">
                      {consent.minorAge} years
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-myslt-text-secondary">
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
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-myslt-text-primary mb-2">Guardian Consent Management</h1>
        <p className="text-myslt-text-secondary">
          Manage consent preferences for minors under guardian supervision (GDPR Article 8 compliance)
        </p>
      </div>

      {/* Guardian Selection (if not provided) */}
      {!guardianId && (
        <div className="myslt-card p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-myslt-text-primary mb-4">Select Guardian</h2>
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
            className="myslt-input"
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
      <div className="myslt-card p-4 sm:p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-myslt-text-primary mb-2">
              Select Dependent
            </label>
            <select
              value={selectedMinor}
              onChange={(e) => setSelectedMinor(e.target.value)}
              className="myslt-input"
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
            <h3 className="text-lg font-medium text-myslt-text-primary mb-4">Consent Preferences</h3>
            <div className="space-y-4">
              {consents.map((consent, index) => (
                <div key={index} className="bg-myslt-muted/10 p-4 rounded-lg border border-myslt-border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-myslt-text-primary">{consent.purpose}</h4>
                      <p className="text-sm text-myslt-text-secondary mt-1">
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
                          className="mr-2 text-myslt-accent"
                        />
                        <span className="text-sm text-myslt-success font-medium">Allow</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`consent-${index}`}
                          value="revoked"
                          checked={consent.status === 'revoked'}
                          onChange={() => updateConsent(index, 'status', 'revoked')}
                          className="mr-2 text-myslt-accent"
                        />
                        <span className="text-sm text-myslt-danger font-medium">Deny</span>
                      </label>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-myslt-text-primary mb-1">
                      Valid Until
                    </label>
                    <input
                      type="date"
                      value={consent.validTo?.split('T')[0] || ''}
                      onChange={(e) => updateConsent(index, 'validTo', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                      className="myslt-input w-48"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-myslt-info/20 border border-myslt-info/30 p-4 rounded-lg mb-6">
            <div className="flex">
              <svg className="w-5 h-5 text-myslt-info mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-myslt-info">Guardian Consent Notice</h4>
                <p className="text-sm text-myslt-info mt-1">
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
              className="myslt-btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
