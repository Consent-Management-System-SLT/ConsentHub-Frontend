import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  FileText,
  Activity,
  Edit,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings
} from 'lucide-react';

interface CustomerProfileProps {
  customer: any;
  onBack: () => void;
  onSectionChange: (section: string) => void;
}

const CustomerProfile: React.FC<CustomerProfileProps> = ({
  customer,
  onBack,
  onSectionChange
}) => {
  const [customerData, setCustomerData] = useState(customer);
  const [consents, setConsents] = useState<any[]>([]);
  const [dsarRequests, setDsarRequests] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(customer);

  useEffect(() => {
    if (customer) {
      setEditedData(customer);
      loadCustomerDetails();
    }
  }, [customer]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const loadCustomerDetails = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication token missing');

      // Fetch consents
      const consentsRes = await fetch('/api/v1/csr/consents', {
        headers: getAuthHeaders()
      });
      if (!consentsRes.ok) throw new Error('Failed to fetch consents');
      const allConsents = await consentsRes.json();
      setConsents(allConsents.filter((c: any) => c.partyId === customer.id));

      // Fetch DSAR requests
      const dsarRes = await fetch('/api/v1/csr/dsar-requests', {
        headers: getAuthHeaders()
      });
      if (!dsarRes.ok) throw new Error('Failed to fetch DSAR requests');
      const allDsar = await dsarRes.json();
      setDsarRequests(allDsar.filter((d: any) => d.partyId === customer.id));

      // Fetch preferences
      const prefsRes = await fetch('/api/v1/csr/preferences', {
        headers: getAuthHeaders()
      });
      if (!prefsRes.ok) throw new Error('Failed to fetch preferences');
      const allPrefs = await prefsRes.json();
      setPreferences(allPrefs.find((p: any) => p.partyId === customer.id) || null);

      // Fetch audit events
      const eventsRes = await fetch('/api/v1/csr/audit-events', {
        headers: getAuthHeaders()
      });
      if (!eventsRes.ok) throw new Error('Failed to fetch audit events');
      const allEvents = await eventsRes.json();
      const customerEvents = allEvents
        .filter((e: any) => e.partyId === customer.id)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);
      setRecentActivities(customerEvents);

    } catch (error) {
      console.error('Error loading customer details:', error);
      alert(`Error loading customer data: ${error instanceof Error ? error.message : error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required');

      const response = await fetch(`/api/v1/csr/customers/${customer.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: editedData.name,
          email: editedData.email,
          phone: editedData.mobile || editedData.phone,
          address: editedData.address,
          organization: editedData.organization,
          department: editedData.department,
          jobTitle: editedData.jobTitle,
          status: editedData.status
        })
      });

      if (!response.ok) throw new Error(`Update failed: ${response.status}`);

      const data = await response.json();

      if (data.success) {
        setCustomerData(editedData);
        setIsEditing(false);
        alert('Customer profile updated successfully!');
        await loadCustomerDetails();
      } else {
        throw new Error(data.message || 'Update failed');
      }
    } catch (error: any) {
      console.error('Error updating customer:', error);
      alert(`Failed to update customer profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getConsentStatus = (consents: any[]) => {
    const active = consents.filter(c => c.status === 'granted').length;
    const revoked = consents.filter(c => c.status === 'revoked').length;
    return { active, revoked, total: consents.length };
  };

  const getDSARStatus = (requests: any[]) => {
    const pending = requests.filter(r => r.status === 'pending').length;
    const completed = requests.filter(r => r.status === 'completed').length;
    return { pending, completed, total: requests.length };
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  if (!customer) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No customer selected</p>
      </div>
    );
  }

  const consentStatus = getConsentStatus(consents);
  const dsarStatus = getDSARStatus(dsarRequests);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Search
          </button>
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveEdit}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedData(customerData);
                }}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.name || ''}
                    onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="flex items-center text-gray-900">
                    <User className="w-4 h-4 mr-2 text-gray-500" />
                    {customerData.name}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedData.email || ''}
                    onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="flex items-center text-gray-900">
                    <Mail className="w-4 h-4 mr-2 text-gray-500" />
                    {customerData.email}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedData.phone || ''}
                    onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="flex items-center text-gray-900">
                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                    {customerData.phone}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.address || ''}
                    onChange={(e) => setEditedData({ ...editedData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="flex items-center text-gray-900">
                    <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                    {customerData.address || 'Not provided'}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Since</label>
                <p className="flex items-center text-gray-900">
                  <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                  {new Date(customerData.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-900">{consentStatus.active}</p>
                <p className="text-sm text-green-700">Active Consents</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-900">{dsarStatus.total}</p>
                <p className="text-sm text-blue-700">DSAR Requests</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Activity className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-900">{recentActivities.length}</p>
                <p className="text-sm text-purple-700">Activities</p>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activities</h2>
            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <Activity className="w-5 h-5 text-gray-500 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{getRelativeTime(activity.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activities</p>
            )}
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => onSectionChange('consent-history')}
                className="w-full flex items-center px-4 py-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Shield className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-blue-900">View Consents</p>
                  <p className="text-sm text-blue-700">{consentStatus.total} total</p>
                </div>
              </button>
              <button
                onClick={() => onSectionChange('dsar-requests')}
                className="w-full flex items-center px-4 py-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <FileText className="w-5 h-5 text-purple-600 mr-3" />
                <div>
                  <p className="font-medium text-purple-900">DSAR Requests</p>
                  <p className="text-sm text-purple-700">{dsarStatus.pending} pending</p>
                </div>
              </button>
              <button
                onClick={() => onSectionChange('preference-editor')}
                className="w-full flex items-center px-4 py-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-green-900">Edit Preferences</p>
                  <p className="text-sm text-green-700">Communication settings</p>
                </div>
              </button>
              <button
                onClick={() => onSectionChange('audit-logs')}
                className="w-full flex items-center px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Activity className="w-5 h-5 text-gray-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">View Audit Trail</p>
                  <p className="text-sm text-gray-700">Complete history</p>
                </div>
              </button>
            </div>
          </div>

          {/* Status Alerts */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Alerts</h3>
            <div className="space-y-3">
              {dsarStatus.pending > 0 && (
                <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600 mr-3" />
                  <div>
                    <p className="font-medium text-yellow-900">Pending DSAR</p>
                    <p className="text-sm text-yellow-700">{dsarStatus.pending} requests waiting</p>
                  </div>
                </div>
              )}
              {consentStatus.revoked > 0 && (
                <div className="flex items-center p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
                  <div>
                    <p className="font-medium text-red-900">Revoked Consents</p>
                    <p className="text-sm text-red-700">{consentStatus.revoked} revoked consents</p>
                  </div>
                </div>
              )}
              {recentActivities.length === 0 && (
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-gray-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">No alerts</p>
                    <p className="text-sm text-gray-700">All clear for this customer</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="p-4 bg-white rounded-lg shadow-lg text-gray-700 font-semibold">
            Loading...
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProfile;
