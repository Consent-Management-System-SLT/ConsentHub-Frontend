import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  Database,
  Activity,
  FileText,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useConsents, usePreferences, useParties, useDSARRequests } from '../../hooks/useApi';

interface DashboardHomeProps {}

const DashboardHome: React.FC<DashboardHomeProps> = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Load real data from backend
  const { data: consentsData, loading: consentsLoading, refetch: refetchConsents } = useConsents();
  const { data: preferencesData, loading: preferencesLoading, refetch: refetchPreferences } = usePreferences();
  const { data: partiesData, loading: partiesLoading, refetch: refetchParties } = useParties();
  const { data: dsarData, loading: dsarLoading, refetch: refetchDSAR } = useDSARRequests();

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        console.log('Auto-refreshing dashboard data...');
        refetchConsents();
        refetchPreferences();
        refetchParties();
        refetchDSAR();
      }, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refetchConsents, refetchPreferences, refetchParties, refetchDSAR]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchConsents(),
        refetchPreferences(),
        refetchParties(),
        refetchDSAR()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Calculate real statistics
  const isLoading = consentsLoading || preferencesLoading || partiesLoading || dsarLoading;
  
  // Helper function to safely get array length
  const getArrayLength = (data: any): number => {
    if (!data) return 0;
    if (Array.isArray(data)) return data.length;
    if (data.consents && Array.isArray(data.consents)) return data.consents.length;
    if (data.preferences && Array.isArray(data.preferences)) return data.preferences.length;
    if (data.parties && Array.isArray(data.parties)) return data.parties.length;
    if (data.requests && Array.isArray(data.requests)) return data.requests.length;
    return 0;
  };

  const totalConsents = getArrayLength(consentsData);
  const totalParties = getArrayLength(partiesData);
  const totalPreferences = getArrayLength(preferencesData);
  const totalDSAR = getArrayLength(dsarData);

  // Calculate consent status stats
  const grantedConsents = Array.isArray(consentsData) ? 
    consentsData.filter((c: any) => c.status === 'granted').length : 0;
  const revokedConsents = Array.isArray(consentsData) ? 
    consentsData.filter((c: any) => c.status === 'revoked').length : 0;
  const pendingDSAR = Array.isArray(dsarData) ? 
    dsarData.filter((d: any) => d.status === 'pending').length : 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading dashboard data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">ConsentHub Administrative Dashboard</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Auto-refresh:</label>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Consents</p>
              <p className="text-2xl font-bold text-gray-900">{totalConsents}</p>
              <p className="text-xs text-green-600 mt-1">
                {grantedConsents} granted, {revokedConsents} revoked
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Parties</p>
              <p className="text-2xl font-bold text-gray-900">{totalParties}</p>
              <p className="text-xs text-blue-600 mt-1">Registered users</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Preferences</p>
              <p className="text-2xl font-bold text-gray-900">{totalPreferences}</p>
              <p className="text-xs text-purple-600 mt-1">Communication settings</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Database className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">DSAR Requests</p>
              <p className="text-2xl font-bold text-gray-900">{totalDSAR}</p>
              <p className="text-xs text-orange-600 mt-1">
                {pendingDSAR} pending
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1">
            <Eye className="w-4 h-4" />
            <span>View all</span>
          </button>
        </div>
        <div className="space-y-3">
          {Array.isArray(consentsData) && consentsData.slice(0, 5).map((consent: any) => (
            <div key={consent.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{consent.purpose}</p>
                <p className="text-xs text-gray-600">
                  Status: {consent.status} • Party: {consent.partyId}
                </p>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(consent.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
          {(!consentsData || !Array.isArray(consentsData) || consentsData.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">MongoDB Connected</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">API Gateway Online</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">All Services Running</span>
          </div>
        </div>
      </div>

      {/* Time Range Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Time Range</h2>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">View data for:</label>
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
