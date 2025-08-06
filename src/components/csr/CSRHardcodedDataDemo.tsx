import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Shield, 
  Database, 
  Search,
  Bell,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Activity,
  Settings,
  UserCheck,
  Baby,
  MessageCircle,
  Volume2,
  Globe
} from 'lucide-react';

const CSRHardcodedDataDemo: React.FC = () => {
  const [stats, setStats] = useState<any>({});
  const [customers, setCustomers] = useState<any[]>([]);
  const [consents, setConsents] = useState<any[]>([]);
  const [dsarRequests, setDsarRequests] = useState<any[]>([]);
  const [auditEvents, setAuditEvents] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<any[]>([]);
  const [guardianData, setGuardianData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [
        statsData,
        customersData,
        consentsData,
        dsarData,
        auditData,
        preferencesData,
        guardianConsentData
      ] = await Promise.all([
        csrDashboardService.getCSRStats(),
        csrDashboardService.getCustomers(),
        csrDashboardService.getConsents(),
        csrDashboardService.getDSARRequests(),
        csrDashboardService.getAuditEvents(),
        csrDashboardService.getCommunicationPreferences(),
        csrDashboardService.getGuardianConsentData()
      ]);

      setStats(statsData);
      setCustomers(customersData);
      setConsents(consentsData);
      setDsarRequests(dsarData);
      setAuditEvents(auditData);
      setPreferences(preferencesData);
      setGuardianData(guardianConsentData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'granted': case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': case 'in_progress': return 'text-yellow-600 bg-yellow-100';
      case 'inactive': case 'denied': case 'withdrawn': case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading comprehensive CSR data...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-xl">
        <h1 className="text-3xl font-bold mb-2">CSR Dashboard - Comprehensive Hardcoded Data Demo</h1>
        <p className="text-blue-100">Demonstrating all CSR dashboard sections with rich sample data</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Guardians Managed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.guardiansManaged}</p>
            </div>
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Actions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayActions}</p>
            </div>
            <Activity className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Customer Search Results */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Search className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Customer Database ({customers.length} customers)</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid gap-4">
            {customers.slice(0, 5).map((customer) => (
              <div key={customer.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                      {customer.type === 'guardian' ? <Shield className="w-5 h-5 text-purple-600" /> : <User className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{customer.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {customer.email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {customer.phone}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {customer.address}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                      {customer.status.toUpperCase()}
                    </span>
                    <div className="text-sm text-gray-500">
                      {customer.totalConsents} consents • Risk: {customer.riskLevel}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Consent History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Consent History ({consents.length} consents)</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid gap-4">
            {consents.slice(0, 6).map((consent) => (
              <div key={consent.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{consent.purpose}</h3>
                    <p className="text-sm text-gray-600 mt-1">{consent.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>Customer ID: {consent.customerId}</span>
                      <span>Category: {consent.category}</span>
                      <span>Source: {consent.source}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(consent.status)}`}>
                      {consent.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {consent.grantedAt ? new Date(consent.grantedAt).toLocaleDateString() : 
                       consent.deniedAt ? new Date(consent.deniedAt).toLocaleDateString() : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DSAR Requests */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Database className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">DSAR Requests ({dsarRequests.length} requests)</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid gap-4">
            {dsarRequests.slice(0, 5).map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{request.category}</h3>
                    <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>By: {request.requestorName}</span>
                      <span>Assigned: {request.assignedTo}</span>
                      <span>Legal: {request.legalBasis}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                      {request.priority.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(request.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {request.notes && (
                  <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                    <strong>Note:</strong> {request.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Communication Preferences */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Communication Preferences ({preferences.length} customers)</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid gap-6">
            {preferences.slice(0, 3).map((pref) => (
              <div key={pref.customerId} className="border border-gray-200 rounded-lg p-4">
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900">{pref.customerName}</h3>
                  <p className="text-sm text-gray-600">{pref.email}</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Channels</h4>
                    <div className="space-y-1">
                      {Object.entries(pref.preferences.channels).map(([channel, enabled]: [string, any]) => (
                        <div key={channel} className="flex items-center space-x-2">
                          {enabled ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Volume2 className="w-4 h-4 text-gray-400" />}
                          <span className="text-sm capitalize">{channel}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Active Topics</h4>
                    <div className="space-y-1">
                      {Object.entries(pref.preferences.topics).filter(([_, enabled]: [string, any]) => enabled).map(([topic]) => (
                        <div key={topic} className="flex items-center space-x-2">
                          <Bell className="w-4 h-4 text-blue-600" />
                          <span className="text-sm capitalize">{topic.replace('_', ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Settings</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-gray-600" />
                        <span>Language: {pref.preferences.language.toUpperCase()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-600" />
                        <span>Max emails/day: {pref.preferences.frequency.maxEmailsPerDay}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="w-4 h-4 text-gray-600" />
                        <span>Max SMS/day: {pref.preferences.frequency.maxSmsPerDay}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Guardian Consent Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Guardian Consent Management ({guardianData.length} guardians)</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid gap-6">
            {guardianData.map((guardian) => (
              <div key={guardian.id} className="border border-gray-200 rounded-lg p-4">
                <div className="mb-4">
                  <div className="flex items-center space-x-3">
                    <UserCheck className="w-6 h-6 text-purple-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">{guardian.guardianName}</h3>
                      <p className="text-sm text-gray-600">{guardian.guardianEmail} • {guardian.guardianPhone}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {guardian.children.map((child: any) => (
                    <div key={child.id} className="ml-4 border-l-2 border-purple-200 pl-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Baby className="w-4 h-4 text-purple-500" />
                        <h4 className="font-medium text-gray-800">{child.name}</h4>
                        <span className="text-sm text-gray-500">
                          (Age {child.age}, {child.relationship})
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {child.consents.map((consent: any) => (
                          <div key={consent.id} className="flex items-start justify-between bg-purple-50 p-3 rounded">
                            <div>
                              <p className="font-medium text-sm text-gray-900">{consent.purpose}</p>
                              <p className="text-xs text-gray-600">Category: {consent.category}</p>
                              {consent.restrictions && (
                                <p className="text-xs text-purple-600 mt-1">
                                  Restrictions: {consent.restrictions.join(', ')}
                                </p>
                              )}
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(consent.status)}`}>
                              {consent.status.toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Audit Events */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Activity className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Recent Audit Events ({auditEvents.length} events)</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid gap-3">
            {auditEvents.slice(0, 8).map((event) => (
              <div key={event.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  event.severity === 'high' ? 'bg-red-500' :
                  event.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{event.description}</p>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    <span>By: {event.userName}</span>
                    <span>Category: {event.category}</span>
                    <span>{new Date(event.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Hardcoded Data Summary</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span><strong>{customers.length}</strong> customers with detailed profiles</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span><strong>{consents.length}</strong> consent records with various statuses</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span><strong>{dsarRequests.length}</strong> DSAR requests in different stages</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span><strong>{preferences.length}</strong> communication preference profiles</span>
              </li>
            </ul>
          </div>
          <div>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span><strong>{guardianData.length}</strong> guardian accounts with child consents</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span><strong>{auditEvents.length}</strong> detailed audit trail events</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Complete dashboard statistics and insights</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Realistic data relationships and workflows</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSRHardcodedDataDemo;
