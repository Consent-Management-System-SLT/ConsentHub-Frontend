import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';

interface DSARRequest {
  id: string;
  requestType: 'export' | 'deletion' | 'portability' | 'rectification';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  createdAt: string;
  completedAt?: string;
  processingResult?: any;
}

interface DSARAutomationProps {
  requests?: DSARRequest[];
  onRefresh?: () => void;
}

const DSARAutomation: React.FC<DSARAutomationProps> = ({ requests: propRequests, onRefresh }) => {
  const [requests, setRequests] = useState<DSARRequest[]>(propRequests || []);
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());
  const [processingResults, setProcessingResults] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!propRequests) {
      loadDSARRequests();
    }
  }, [propRequests]);

  const loadDSARRequests = async () => {
    try {
      const response = await apiClient.get('/api/dsar-requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Error loading DSAR requests:', error);
      // Mock data for demo
      setRequests([
        {
          id: '1',
          requestType: 'export',
          status: 'pending',
          requesterId: 'user123',
          requesterName: 'John Smith',
          requesterEmail: 'john.smith@email.com',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          requestType: 'deletion',
          status: 'processing',
          requesterId: 'user456',
          requesterName: 'Sarah Johnson',
          requesterEmail: 'sarah.johnson@email.com',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
    }
  };

  const handleAutoProcess = async (dsarId: string) => {
    setProcessingRequests(prev => new Set(prev).add(dsarId));
    
    try {
      const response = await apiClient.post(`/api/v1/dsar/${dsarId}/auto-process`);
      const result = (response.data as any).result;
      
      setProcessingResults(prev => ({
        ...prev,
        [dsarId]: result
      }));
      
      // Refresh the requests list
      setTimeout(() => {
        onRefresh?.();
      }, 1000);
      
    } catch (error) {
      console.error('Auto-processing failed:', error);
      alert('Auto-processing failed. Please try again.');
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(dsarId);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const badgeClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badgeClasses[status as keyof typeof badgeClasses]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRequestTypeIcon = (type: string) => {
    const icons = {
      export: '📄',
      deletion: '🗑️',
      portability: '📤',
      rectification: '✏️'
    };
    return icons[type as keyof typeof icons] || '📋';
  };

  const getAutomationRecommendation = (request: DSARRequest) => {
    if (request.status !== 'pending') return null;

    const daysSinceCreation = Math.floor(
      (Date.now() - new Date(request.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceCreation >= 7) {
      return {
        level: 'high',
        message: `Overdue by ${daysSinceCreation - 7} days. Auto-processing recommended.`,
        action: 'process'
      };
    } else if (daysSinceCreation >= 3) {
      return {
        level: 'medium',
        message: 'Approaching deadline. Consider auto-processing.',
        action: 'process'
      };
    } else if (request.requestType === 'export') {
      return {
        level: 'low',
        message: 'Data export can be automated.',
        action: 'process'
      };
    }

    return null;
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processingRequests_ = requests.filter(r => r.status === 'processing');
  const completedRequests = requests.filter(r => r.status === 'completed');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">DSAR Automation Dashboard</h1>
        <p className="text-gray-600">
          Intelligent automation for Data Subject Access Requests with compliance tracking
        </p>
      </div>

      {/* Automation Statistics */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Automation Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-2xl font-bold">{pendingRequests.length}</div>
            <div className="text-sm opacity-90">Pending Requests</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-2xl font-bold">{processingRequests_.length}</div>
            <div className="text-sm opacity-90">Processing</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-2xl font-bold">{completedRequests.length}</div>
            <div className="text-sm opacity-90">Auto-Completed</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-2xl font-bold">
              {completedRequests.length > 0 ? 
                Math.round((completedRequests.length / requests.length) * 100) : 0}%
            </div>
            <div className="text-sm opacity-90">Completion Rate</div>
          </div>
        </div>
      </div>

      {/* Pending Requests with Auto-Processing */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900">Pending DSAR Requests</h4>
          <p className="text-gray-600 mt-1">Requests eligible for automated processing</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {pendingRequests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p>No pending DSAR requests</p>
            </div>
          ) : (
            pendingRequests.map(request => {
              const recommendation = getAutomationRecommendation(request);
              const isProcessing = processingRequests.has(request.id);
              
              return (
                <div key={request.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="text-2xl">{getRequestTypeIcon(request.requestType)}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h5 className="font-medium text-gray-900">
                            {request.requestType.charAt(0).toUpperCase() + request.requestType.slice(1)} Request
                          </h5>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Requester: {request.requesterName} ({request.requesterEmail})
                        </p>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                        
                        {recommendation && (
                          <div className={`mt-3 p-3 rounded-lg ${
                            recommendation.level === 'high' ? 'bg-red-50 border border-red-200' :
                            recommendation.level === 'medium' ? 'bg-yellow-50 border border-yellow-200' :
                            'bg-blue-50 border border-blue-200'
                          }`}>
                            <div className="flex items-start">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
                                recommendation.level === 'high' ? 'bg-red-100' :
                                recommendation.level === 'medium' ? 'bg-yellow-100' :
                                'bg-blue-100'
                              }`}>
                                {recommendation.level === 'high' ? '⚠️' :
                                 recommendation.level === 'medium' ? '⏰' : 'ℹ️'}
                              </div>
                              <div>
                                <p className={`text-sm font-medium ${
                                  recommendation.level === 'high' ? 'text-red-800' :
                                  recommendation.level === 'medium' ? 'text-yellow-800' :
                                  'text-blue-800'
                                }`}>
                                  Automation Recommendation
                                </p>
                                <p className={`text-sm ${
                                  recommendation.level === 'high' ? 'text-red-700' :
                                  recommendation.level === 'medium' ? 'text-yellow-700' :
                                  'text-blue-700'
                                }`}>
                                  {recommendation.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleAutoProcess(request.id)}
                        disabled={isProcessing}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          recommendation?.level === 'high' 
                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isProcessing ? (
                          <div className="flex items-center">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Processing...
                          </div>
                        ) : (
                          'Auto-Process'
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Processing Result */}
                  {processingResults[request.id] && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h6 className="font-medium text-green-800 mb-2">Processing Completed</h6>
                      <div className="text-sm text-green-700 space-y-1">
                        {processingResults[request.id].dataExported && (
                          <p>✅ Data exported successfully</p>
                        )}
                        {processingResults[request.id].dataDeleted && (
                          <p>✅ Data deleted and anonymized</p>
                        )}
                        {processingResults[request.id].exportSize && (
                          <p>📊 Export size: {Math.round(processingResults[request.id].exportSize / 1024)} KB</p>
                        )}
                        <p>⏰ Processed at: {new Date(processingResults[request.id].processingTime).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Recently Completed Requests */}
      {completedRequests.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900">Recently Auto-Processed Requests</h4>
            <p className="text-gray-600 mt-1">Successfully automated DSAR completions</p>
          </div>
          
          <div className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
            {completedRequests.slice(0, 5).map(request => (
              <div key={request.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-xl">{getRequestTypeIcon(request.requestType)}</div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {request.requestType.charAt(0).toUpperCase() + request.requestType.slice(1)} Request
                    </p>
                    <p className="text-sm text-gray-600">{request.requesterName}</p>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(request.status)}
                  {request.completedAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(request.completedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DSARAutomation;
