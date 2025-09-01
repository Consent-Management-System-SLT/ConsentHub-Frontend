import React, { useState, useEffect } from 'react';
import { FileText, Trash2, Upload, Edit, AlertTriangle, Clock, Info, BarChart, CheckCircle } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { secureLog } from '../../utils/secureLogger';

interface DSARRequest {
  id: string;
  _id?: string;
  requestType: 'data_access' | 'data_erasure' | 'data_portability' | 'data_rectification' | 'export' | 'deletion' | 'portability' | 'rectification';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
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
      const response = await apiClient.get('/api/v1/dsar/requests');
      secureLog.log('DSAR requests response:', response.data);
      const responseData = response.data as any;
      setRequests(responseData.requests || responseData);
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
          status: 'in_progress',
          requesterId: 'user456',
          requesterName: 'Sarah Johnson',
          requesterEmail: 'sarah.johnson@email.com',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
    }
  };

  const handleAutoProcess = async (dsarId: string) => {
    secureLog.log('Auto-processing DSAR with ID:', dsarId);
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

  const renderRequestTypeIcon = (type: string) => {
    const icons = {
      export: FileText,
      deletion: Trash2,
      portability: Upload,
      rectification: Edit
    };
    const IconComponent = icons[type as keyof typeof icons] || FileText;
    return <IconComponent className="myslt-icon" />;
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
  const processingRequests_ = requests.filter(r => r.status === 'in_progress');
  const completedRequests = requests.filter(r => r.status === 'completed');

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-myslt-text-primary mb-2">DSAR Automation Dashboard</h1>
        <p className="text-myslt-text-secondary">
          Intelligent automation for Data Subject Access Requests with compliance tracking
        </p>
      </div>

      {/* Automation Statistics */}
      <div className="bg-gradient-to-r from-myslt-accent to-myslt-accent/80 rounded-lg p-4 sm:p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Automation Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-xl sm:text-2xl font-bold">{pendingRequests.length}</div>
            <div className="text-xs sm:text-sm opacity-90">Pending Requests</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-xl sm:text-2xl font-bold">{processingRequests_.length}</div>
            <div className="text-xs sm:text-sm opacity-90">Processing</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-xl sm:text-2xl font-bold">{completedRequests.length}</div>
            <div className="text-xs sm:text-sm opacity-90">Auto-Completed</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-xl sm:text-2xl font-bold">
              {completedRequests.length > 0 ? 
                Math.round((completedRequests.length / requests.length) * 100) : 0}%
            </div>
            <div className="text-xs sm:text-sm opacity-90">Completion Rate</div>
          </div>
        </div>
      </div>

      {/* Pending Requests with Auto-Processing */}
      <div className="myslt-card overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-myslt-border">
          <h4 className="text-lg font-semibold text-myslt-text-primary">Pending DSAR Requests</h4>
          <p className="text-myslt-text-secondary text-sm mt-1">Requests eligible for automated processing</p>
        </div>
        
        <div className="divide-y divide-myslt-border">
          {pendingRequests.length === 0 ? (
            <div className="p-6 sm:p-8 text-center text-myslt-text-muted">
              <div className="w-12 sm:w-16 h-12 sm:h-16 bg-myslt-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 sm:w-8 h-6 sm:h-8 text-myslt-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div key={request.id} className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="text-xl sm:text-2xl">{renderRequestTypeIcon(request.requestType)}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h5 className="font-medium text-myslt-text-primary">
                            {request.requestType.charAt(0).toUpperCase() + request.requestType.slice(1)} Request
                          </h5>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-myslt-text-secondary mb-2">
                          Requester: {request.requesterName} ({request.requesterEmail})
                        </p>
                        <p className="text-sm text-myslt-text-muted">
                          Created: {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                        
                        {recommendation && (
                          <div className={`mt-3 p-3 rounded-lg border ${
                            recommendation.level === 'high' ? 'bg-myslt-danger/20 border-myslt-danger/30' :
                            recommendation.level === 'medium' ? 'bg-myslt-warning/20 border-myslt-warning/30' :
                            'bg-myslt-info/20 border-myslt-info/30'
                          }`}>
                            <div className="flex items-start">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
                                recommendation.level === 'high' ? 'bg-myslt-danger/30' :
                                recommendation.level === 'medium' ? 'bg-myslt-warning/30' :
                                'bg-myslt-info/30'
                              }`}>
                                {recommendation.level === 'high' ? <AlertTriangle className="w-3 h-3 text-myslt-danger" /> :
                                 recommendation.level === 'medium' ? <Clock className="w-3 h-3 text-myslt-warning" /> : 
                                 <Info className="w-3 h-3 text-myslt-info" />}
                              </div>
                              <div>
                                <p className={`text-sm font-medium ${
                                  recommendation.level === 'high' ? 'text-myslt-danger' :
                                  recommendation.level === 'medium' ? 'text-myslt-warning' :
                                  'text-myslt-info'
                                }`}>
                                  Automation Recommendation
                                </p>
                                <p className={`text-sm ${
                                  recommendation.level === 'high' ? 'text-myslt-danger' :
                                  recommendation.level === 'medium' ? 'text-myslt-warning' :
                                  'text-myslt-info'
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
                        onClick={() => {
                          const requestId = request.id || request._id;
                          if (requestId) {
                            handleAutoProcess(requestId);
                          } else {
                            console.error('No valid ID found for request:', request);
                          }
                        }}
                        disabled={isProcessing}
                        className={`myslt-btn-primary px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                          recommendation?.level === 'high' 
                            ? 'bg-myslt-danger hover:bg-myslt-danger/90 text-white border-myslt-danger' 
                            : ''
                        }`}
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
                    <div className="mt-4 p-4 bg-myslt-success/20 border border-myslt-success/30 rounded-lg">
                      <h6 className="font-medium text-myslt-success mb-2">Processing Completed</h6>
                      <div className="text-sm text-myslt-success space-y-1">
                        {processingResults[request.id].dataExported && (
                          <p className="flex items-center"><CheckCircle className="myslt-icon mr-1 text-green-500" /> Data exported successfully</p>
                        )}
                        {processingResults[request.id].dataDeleted && (
                          <p className="flex items-center"><CheckCircle className="myslt-icon mr-1 text-green-500" /> Data deleted and anonymized</p>
                        )}
                        {processingResults[request.id].exportSize && (
                          <p className="flex items-center"><BarChart className="myslt-icon mr-1" /> Export size: {Math.round(processingResults[request.id].exportSize / 1024)} KB</p>
                        )}
                        <p className="flex items-center"><Clock className="myslt-icon mr-1" /> Processed at: {new Date(processingResults[request.id].processingTime).toLocaleString()}</p>
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
        <div className="myslt-card overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-myslt-border">
            <h4 className="text-lg font-semibold text-myslt-text-primary">Recently Auto-Processed Requests</h4>
            <p className="text-myslt-text-secondary text-sm mt-1">Successfully automated DSAR completions</p>
          </div>
          
          <div className="divide-y divide-myslt-border max-h-64 overflow-y-auto">
            {completedRequests.slice(0, 5).map(request => (
              <div key={request.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-lg sm:text-xl">{renderRequestTypeIcon(request.requestType)}</div>
                  <div>
                    <p className="font-medium text-myslt-text-primary">
                      {request.requestType.charAt(0).toUpperCase() + request.requestType.slice(1)} Request
                    </p>
                    <p className="text-sm text-myslt-text-secondary">{request.requesterName}</p>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(request.status)}
                  {request.completedAt && (
                    <p className="text-xs text-myslt-text-muted mt-1">
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
