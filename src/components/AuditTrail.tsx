import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  User,
  Settings,
  FileText,
  Search,
  ArrowRight,
  CircleDot,
  RefreshCw,
  AlertTriangle,
  Wifi,
  WifiOff,
  Clock,
} from 'lucide-react';
import { AuditLog, Party } from '../types/consent';
import { useParties } from '../hooks/useApi';
import { apiClient } from '../services/apiClient';
import { websocketService, ConsentUpdateEvent, PreferenceUpdateEvent } from '../services/websocketService';

interface AuditTrailProps {
  selectedCustomer?: Party;
}

export const AuditTrail: React.FC<AuditTrailProps> = ({ selectedCustomer }) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'consent' | 'preference' | 'notice'>('all');
  const [filterOperation, setFilterOperation] = useState<'all' | 'create' | 'update' | 'revoke' | 'view'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);
  const [newUpdates, setNewUpdates] = useState<Set<string>>(new Set());
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  // Load parties from backend for name resolution
  const { data: partiesData, loading: partiesLoading } = useParties();

  // Transform data to ensure it's an array
  const parties = Array.isArray(partiesData) ? partiesData : 
    (partiesData && (partiesData as any).parties ? (partiesData as any).parties : []);

  useEffect(() => {
    loadAuditLogs();
    setupRealTimeListeners();
    
    return () => {
      cleanupRealTimeListeners();
    };
  }, []);

  useEffect(() => {
    // Check WebSocket connection status periodically
    const checkConnection = setInterval(() => {
      setIsRealTimeConnected(websocketService.isConnected());
    }, 5000);

    return () => clearInterval(checkConnection);
  }, []);

  const setupRealTimeListeners = useCallback(() => {
    console.log('Setting up real-time audit trail listeners');
    setIsRealTimeConnected(websocketService.isConnected());

    // Join CSR dashboard room to receive updates
    websocketService.joinCSRDashboard();

    // Listen for consent updates
    websocketService.onConsentUpdate((event: ConsentUpdateEvent) => {
      console.log('Real-time consent update received in AuditTrail:', event);
      handleRealTimeConsentUpdate(event);
    });

    // Listen for preference updates from customers
    websocketService.onCustomerPreferenceUpdate((event: PreferenceUpdateEvent) => {
      console.log('Real-time customer preference update received in AuditTrail:', event);
      handleRealTimePreferenceUpdate(event);
    });

    // Listen for preference updates from CSRs
    websocketService.onCSRPreferenceUpdate((event: PreferenceUpdateEvent) => {
      console.log('Real-time CSR preference update received in AuditTrail:', event);
      handleRealTimePreferenceUpdate(event);
    });
  }, []);

  const cleanupRealTimeListeners = useCallback(() => {
    console.log('Cleaning up real-time audit trail listeners');
    websocketService.offConsentUpdate();
    websocketService.offCustomerPreferenceUpdate();
    websocketService.offCSRPreferenceUpdate();
  }, []);

  const handleRealTimeConsentUpdate = useCallback((event: ConsentUpdateEvent) => {
    const logId = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const newAuditLog = {
      id: logId,
      _id: logId,
      auditId: `AUDIT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      action: event.type === 'granted' ? 'consent_granted' : 'consent_revoked',
      entity: 'Consent',
      entityId: event.consent?.id || 'unknown',
      entityType: 'consent' as const,
      operation: event.type === 'granted' ? 'create' : 'revoke' as const,
      userId: event.user?.id || 'unknown',
      userName: event.user?.email?.split('@')[0] || 'Unknown User',
      userEmail: event.user?.email || 'unknown@example.com',
      userRole: 'customer',
      actorId: event.user?.id || 'unknown',
      actorType: 'customer' as const,
      timestamp: new Date(event.timestamp).toISOString(),
      changes: {
        status: {
          from: event.type === 'granted' ? 'revoked' : 'granted',
          to: event.type
        }
      },
      details: {
        consentType: event.consent?.type || 'unknown',
        reason: `Consent ${event.type} by customer`,
        source: 'customer_portal',
        realTime: true
      },
      source: 'customer_portal',
      ipAddress: '127.0.0.1',
      userAgent: 'Real-time Update'
    };

    setAuditLogs(prev => [newAuditLog as any, ...prev]);
    setNewUpdates(prev => new Set([...prev, logId]));
    setLastUpdateTime(new Date());

    // Remove the highlight after 10 seconds
    setTimeout(() => {
      setNewUpdates(prev => {
        const updated = new Set(prev);
        updated.delete(logId);
        return updated;
      });
    }, 10000);
  }, []);

  const handleRealTimePreferenceUpdate = useCallback((event: PreferenceUpdateEvent) => {
    const logId = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const newAuditLog = {
      id: logId,
      _id: logId,
      auditId: `AUDIT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      action: 'preference_updated',
      entity: 'Preference',
      entityId: event.customerId,
      entityType: 'preference' as const,
      operation: 'update' as const,
      userId: event.updatedBy || event.customerId,
      userName: event.updatedBy ? 'CSR Representative' : 'Customer',
      userEmail: 'system@consenthub.com',
      userRole: event.source === 'csr' ? 'csr' : 'customer',
      actorId: event.updatedBy || event.customerId,
      actorType: event.source === 'csr' ? 'csr' : 'customer' as const,
      timestamp: new Date(event.timestamp).toISOString(),
      changes: {
        preferences: {
          from: 'previous_state',
          to: 'updated_state'
        }
      },
      details: {
        preferenceType: 'communication',
        customerId: event.customerId,
        updatedBy: event.updatedBy,
        source: event.source,
        realTime: true
      },
      source: event.source === 'csr' ? 'csr_dashboard' : 'customer_portal',
      ipAddress: '127.0.0.1',
      userAgent: 'Real-time Update'
    };

    setAuditLogs(prev => [newAuditLog as any, ...prev]);
    setNewUpdates(prev => new Set([...prev, logId]));
    setLastUpdateTime(new Date());

    // Remove the highlight after 10 seconds
    setTimeout(() => {
      setNewUpdates(prev => {
        const updated = new Set(prev);
        updated.delete(logId);
        return updated;
      });
    }, 10000);
  }, []);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/api/v1/audit?limit=100');
      const data = response.data as any;
      setAuditLogs(data.logs || data);
    } catch (err) {
      console.error('Error loading audit logs:', err);
      setError('Failed to load audit logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = auditLogs.filter((log: any) => {
    const matchesType = filterType === 'all' || log.entityType === filterType;
    const matchesOperation = filterOperation === 'all' || log.operation === filterOperation;
    const matchesSearch =
      searchTerm === '' ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedCustomer) {
      const customerMatch =
        log.actorId === selectedCustomer.id ||
        (log.entityType === 'consent' && log.entityId.includes(selectedCustomer.id));
      return matchesType && matchesOperation && matchesSearch && customerMatch;
    }

    return matchesType && matchesOperation && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadAuditLogs}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (partiesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading audit logs...</span>
      </div>
    );
  }

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'consent':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'preference':
        return <Settings className="h-4 w-4 text-green-500" />;
      case 'notice':
        return <FileText className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'revoke':
        return 'bg-red-100 text-red-800';
      case 'view':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActorTypeColor = (actorType: string) => {
    switch (actorType) {
      case 'customer':
        return 'bg-blue-100 text-blue-800';
      case 'csr':
        return 'bg-purple-100 text-purple-800';
      case 'system':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCustomerName = (partyId: string) => {
    const party = parties.find((p: any) => p.id === partyId);
    return party ? party.name : partyId;
  };

  const formatChanges = (changes: Record<string, any>) => {
    return Object.entries(changes).map(([key, value], index) => {
      const displayValue = (val: any) =>
        val === null || val === undefined ? 'N/A' : typeof val === 'boolean' ? (val ? 'Yes' : 'No') : val;

      // Handle status with badge
      if (typeof value === 'object' && value?.from !== undefined && value?.to !== undefined) {
        if (key === 'status') {
          return (
            <div key={index} className="flex items-center space-x-2">
              <CircleDot className="h-3 w-3 text-gray-500" />
              <span className="text-sm font-medium text-gray-800 capitalize">{key}:</span>
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                {displayValue(value.from)}
              </span>
              <ArrowRight className="h-3 w-3 text-gray-400" />
              <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                {displayValue(value.to)}
              </span>
            </div>
          );
        }

        // Handle object-like fields like preferredChannels
        if (typeof value.from === 'object' && typeof value.to === 'object') {
          return (
            <div key={index} className="text-sm">
              <strong className="text-gray-700 capitalize">{key}:</strong>
              <div className="ml-2 text-gray-600">
                {Object.keys(value.from).map((channel) => {
                  const fromVal = value.from[channel];
                  const toVal = value.to[channel];
                  if (fromVal !== toVal) {
                    return (
                      <div key={channel} className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500">{channel}:</span>
                        <span className="text-xs text-red-600 font-semibold">
                          {displayValue(fromVal)}
                        </span>
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-green-600 font-semibold">
                          {displayValue(toVal)}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          );
        }

        // Fallback for simple from → to
        return (
          <div key={index} className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-800 capitalize">{key}:</span>
            <span className="text-sm text-red-600 font-semibold">{displayValue(value.from)}</span>
            <ArrowRight className="h-3 w-3 text-gray-400" />
            <span className="text-sm text-green-600 font-semibold">{displayValue(value.to)}</span>
          </div>
        );
      }

      return (
        <div key={index} className="text-sm text-gray-600">
          {key}: {displayValue(value)}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-600" />
              Consent History & Audit Trail
            </h2>
            <div className="flex items-center space-x-2">
              {isRealTimeConnected ? (
                <div className="flex items-center space-x-1 text-green-600">
                  <Wifi className="h-4 w-4" />
                  <span className="text-xs font-medium">Live</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-red-600">
                  <WifiOff className="h-4 w-4" />
                  <span className="text-xs font-medium">Offline</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm text-gray-500">
              {selectedCustomer ? `Customer: ${selectedCustomer.name}` : 'All Activities'}
            </span>
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              <span>Last updated: {lastUpdateTime.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by entity ID, actor, or source..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Types</option>
              <option value="consent">Consent</option>
              <option value="preference">Preference</option>
              <option value="notice">Notice</option>
            </select>

            <select
              value={filterOperation}
              onChange={(e) => setFilterOperation(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Operations</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="revoke">Revoke</option>
              <option value="view">View</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Total: {filteredLogs.length} | Real-time: {filteredLogs.filter(log => log.details?.realTime).length}
            </div>
            <button
              onClick={loadAuditLogs}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Changes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => {
                const logId = log._id || log.id;
                const isNewUpdate = newUpdates.has(logId);
                const isRealTimeLog = log.details?.realTime;
                
                return (
                  <tr 
                    key={logId} 
                    className={`hover:bg-gray-50 transition-colors ${
                      isNewUpdate 
                        ? 'bg-blue-50 border-l-4 border-l-blue-500 animate-pulse' 
                        : isRealTimeLog 
                        ? 'bg-green-50 border-l-4 border-l-green-400' 
                        : ''
                    }`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                        {isNewUpdate && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            NEW
                          </span>
                        )}
                        {isRealTimeLog && !isNewUpdate && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            LIVE
                          </span>
                        )}
                      </div>
                    </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {getEntityIcon(log.entityType)}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{log.entityType}</div>
                        <div className="text-sm text-gray-500">{log.entityId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOperationColor(
                        log.operation
                      )}`}
                    >
                      {log.operation}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActorTypeColor(
                          log.actorType
                        )}`}
                      >
                        {log.actorType}
                      </span>
                      <div className="text-sm text-gray-900">
                        {log.actorType === 'customer' ? getCustomerName(log.actorId) : log.actorId}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs space-y-1">{formatChanges(log.changes)}</div>
                  </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{log.source}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No audit logs found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
