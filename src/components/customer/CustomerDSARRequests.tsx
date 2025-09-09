import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Download, 
  Trash2, 
  Upload,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  RefreshCw,
  Eye,
  Shield,
  Database,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { customerApiClient } from '../../services/customerApiClient';
import fastRealTimeService from '../../services/fastRealTimeService';

interface DSARRequest {
  id: string;
  type: 'export' | 'delete' | 'correct' | 'portability' | 'restrict' | 'object' | 'withdraw';
  status: 'pending' | 'processing' | 'completed' | 'rejected' | 'expired';
  requestedDate: string;
  completedDate?: string;
  estimatedCompletion?: string;
  description: string;
  reason?: string;
  downloadUrl?: string;
  expiryDate?: string;
  requestedBy: string;
}

interface CustomerDSARRequestsProps {
  onBack?: () => void;
}

const CustomerDSARRequests: React.FC<CustomerDSARRequestsProps> = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'new-request' | 'my-requests'>('my-requests');
  const [requestType, setRequestType] = useState<'export' | 'delete' | 'correct' | 'portability' | 'restrict' | 'object' | 'withdraw'>('export');
  const [requestReason, setRequestReason] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [dsarRequests, setDsarRequests] = useState<DSARRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [realTimeConnected, setRealTimeConnected] = useState(false);
  const previousRequestsRef = useRef<DSARRequest[]>([]);
  
  // Add notification functionality
  const { addNotification } = useNotifications();

  // Load real DSAR requests from backend
  const loadDSARRequests = async () => {
    try {
      setLoading(true);
      console.log('Loading real DSAR requests from backend...');
      
      const response = await customerApiClient.getDSARRequests();
      console.log('DSAR requests loaded:', response);
      
      if (response?.data?.requests) {
        // Transform backend data to frontend format
        const transformedRequests: DSARRequest[] = response.data.requests.map((req: any) => ({
          id: req.id,
          type: req.requestType,
          status: req.status,
          requestedDate: req.submittedDate?.split('T')[0] || req.submittedAt?.split('T')[0],
          completedDate: req.completedDate?.split('T')[0],
          estimatedCompletion: req.expectedCompletionDate?.split('T')[0],
          description: req.description || `${req.requestType} request`,
          reason: req.requestDetails?.reason || req.reason,
          downloadUrl: req.responseFiles?.[0]?.downloadUrl,
          expiryDate: req.responseFiles?.[0]?.expiryDate?.split('T')[0],
          requestedBy: 'Customer Portal'
        }));
        
        // Check for status changes and create notifications
        console.log('About to check for status changes...');
        console.log('previousRequestsRef.current.length:', previousRequestsRef.current.length);
        console.log('transformedRequests.length:', transformedRequests.length);
        
        if (previousRequestsRef.current.length > 0) {
          checkForStatusChanges(previousRequestsRef.current, transformedRequests);
        } else {
          console.log('No previous requests to compare - first load');
        }

        // Update states
        setDsarRequests(transformedRequests);
        // Store current requests for next comparison
        previousRequestsRef.current = transformedRequests;
        console.log('Transformed DSAR requests:', transformedRequests);
      } else {
        console.warn('No DSAR requests found in response, using empty array');
        setDsarRequests([]);
      }
      
    } catch (error) {
      console.error('Failed to load DSAR requests:', error);
      // Fallback to empty array on error
      setDsarRequests([]);
      addNotification({
        title: 'Error Loading DSAR Requests',
        message: 'Unable to load your data requests. Please try again later.',
        type: 'system',
        category: 'warning'
      });
    } finally {
      setLoading(false);
    }
  };

  // Check for status changes and create notifications
  const checkForStatusChanges = (previous: DSARRequest[], current: DSARRequest[]) => {
    console.log('Checking for status changes...');
    console.log('Previous requests:', previous.length);
    console.log('Current requests:', current.length);
    
    current.forEach(currentRequest => {
      const previousRequest = previous.find(prev => prev.id === currentRequest.id);
      
      if (previousRequest) {
        console.log(`Request ${currentRequest.id}: ${previousRequest.status} → ${currentRequest.status}`);
        
        if (previousRequest.status !== currentRequest.status) {
          // Status has changed - create notification
          const statusMessages = {
            'in_progress': {
              title: 'DSAR Request Approved',
              message: `Your ${currentRequest.type} request has been approved by our CSR team and is now being processed.`,
              category: 'success' as const
            },
            'completed': {
              title: 'DSAR Request Completed',
              message: `Your ${currentRequest.type} request has been completed successfully. ${currentRequest.downloadUrl ? 'Download link is available.' : ''}`,
              category: 'success' as const
            },
            'rejected': {
              title: 'DSAR Request Rejected',
              message: `Your ${currentRequest.type} request has been rejected. ${currentRequest.reason || 'Please contact support for more information.'}`,
              category: 'warning' as const
            }
          };

          const statusMessage = statusMessages[currentRequest.status as keyof typeof statusMessages];
          
          if (statusMessage) {
            console.log(`Status change detected: ${previousRequest.status} → ${currentRequest.status}`);
            
            addNotification({
              title: statusMessage.title,
              message: statusMessage.message,
              type: 'dsar',
              category: statusMessage.category,
              metadata: {
                requestId: currentRequest.id,
                requestType: currentRequest.type,
                previousStatus: previousRequest.status,
                newStatus: currentRequest.status,
                timestamp: new Date().toISOString()
              }
            });
          } else {
            console.log(`No notification message for status: ${currentRequest.status}`);
          }
        } else {
          console.log(`No status change for request ${currentRequest.id}`);
        }
      } else {
        console.log(`New request detected: ${currentRequest.id} (${currentRequest.status})`);
      }
    });
  };

  useEffect(() => {
    loadDSARRequests();
    
    // Set up fast real-time updates (2-second polling)
    console.log('Setting up fast real-time DSAR updates...');
    
    // Start fast polling service
    fastRealTimeService.start((updateData: any) => {
      console.log('Fast real-time update received:', updateData);
      
      if (updateData.type === 'dsar_updates') {
        // Reload DSAR requests to get latest data
        loadDSARRequests();
        
        // Check for recent updates and show notifications
        if (updateData.recentUpdates && updateData.recentUpdates.length > 0) {
          updateData.recentUpdates.forEach((request: any) => {
            const statusMessages = {
              'in_progress': {
                title: 'DSAR Request Approved',
                message: `Your ${request.requestType} request has been approved and is now being processed.`,
                category: 'success' as const
              },
              'completed': {
                title: 'DSAR Request Completed',
                message: `Your ${request.requestType} request has been completed successfully.`,
                category: 'success' as const
              },
              'rejected': {
                title: 'DSAR Request Rejected',
                message: `Your ${request.requestType} request has been rejected. Please contact support.`,
                category: 'warning' as const
              }
            };

            const statusMessage = statusMessages[request.status as keyof typeof statusMessages];
            
            if (statusMessage) {
              addNotification({
                title: statusMessage.title,
                message: statusMessage.message,
                type: 'dsar',
                category: statusMessage.category,
                metadata: {
                  requestId: request._id,
                  requestType: request.requestType,
                  status: request.status,
                  timestamp: new Date().toISOString(),
                  realTime: true
                }
              });
            }
          });
        }
      }
    });

    // Check connection status periodically
    const connectionCheck = setInterval(() => {
      const status = fastRealTimeService.getStatus();
      setRealTimeConnected(status.connected);
      
      if (!status.connected) {
        console.log('Fast polling connection check - not active');
      }
    }, 10000); // Check every 10 seconds
    
    return () => {
      clearInterval(connectionCheck);
      fastRealTimeService.stop();
    };
  }, []);

  // Remove the old hardcoded mock data - now using real backend data

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-myslt-success" />;
      case 'processing':
        return <RefreshCw className="w-5 h-5 text-myslt-primary animate-spin" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'expired':
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-myslt-success/10 text-myslt-success border-myslt-success/20';
      case 'processing':
        return 'bg-myslt-primary/10 text-myslt-primary border-myslt-primary/20';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expired':
        return 'bg-myslt-service-card text-myslt-text-muted border-myslt-accent/30';
      default:
        return 'bg-myslt-service-card text-myslt-text-muted border-myslt-accent/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'export':
        return <Download className="w-5 h-5 text-myslt-primary" />;
      case 'delete':
        return <Trash2 className="w-5 h-5 text-red-600" />;
      case 'rectify':
        return <FileText className="w-5 h-5 text-orange-600" />;
      case 'restrict':
        return <Shield className="w-5 h-5 text-purple-600" />;
      default:
        return <Database className="w-5 h-5 text-gray-600" />;
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Prepare the request data according to backend expectations
      const requestData = {
        type: requestType, // 'export', 'delete', 'rectify', 'restrict'
        reason: requestReason,
        additionalDetails: additionalDetails,
        description: `${requestType} request: ${requestReason}${additionalDetails ? `. Additional details: ${additionalDetails}` : ''}`
      };
      
      console.log('Submitting DSAR request:', requestData);
      
      // Make real API call to create DSAR request
      const response = await customerApiClient.createDSARRequest(requestData);
      
      console.log('DSAR request submitted successfully:', response);
      
      setSubmitStatus('success');
      
      // Add notification for user confirmation
      addNotification({
        title: 'DSAR Request Submitted Successfully',
        message: `Your ${requestType} request has been submitted and is now pending review by our customer service team.`,
        type: 'dsar',
        category: 'success',
        metadata: {
          requestType,
          requestId: response?.data?.request?.id || response?.data?.request?._id,
          status: 'pending'
        }
      });
      
      // Reset form
      setRequestReason('');
      setAdditionalDetails('');
      
      // Switch to requests view and reload data to show the new request
      setTimeout(() => {
        setActiveTab('my-requests');
        setSubmitStatus('idle');
        // Reload DSAR requests to show the new request immediately
        loadDSARRequests();
      }, 2000);
      
    } catch (error) {
      console.error('Failed to submit DSAR request:', error);
      
      setSubmitStatus('error');
      
      // Show error notification
      addNotification({
        title: 'Request Submission Failed',
        message: 'There was an error submitting your DSAR request. Please try again or contact support.',
        type: 'system',
        category: 'warning'
      });
      
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestTypeOptions = [
    {
      value: 'export' as const,
      label: 'Export My Data',
      description: 'Download a copy of all your personal data we have stored',
      icon: <Download className="w-6 h-6 text-blue-600" />,
      color: 'border-blue-200 hover:border-blue-300'
    },
    {
      value: 'delete' as const,
      label: 'Delete My Data',
      description: 'Permanently delete your personal data from our systems',
      icon: <Trash2 className="w-6 h-6 text-red-600" />,
      color: 'border-red-200 hover:border-red-300'
    },
    {
      value: 'correct' as const,
      label: 'Correct My Data',
      description: 'Request correction of inaccurate personal information',
      icon: <FileText className="w-6 h-6 text-orange-600" />,
      color: 'border-orange-200 hover:border-orange-300'
    },
    {
      value: 'portability' as const,
      label: 'Data Portability',
      description: 'Receive your data in a portable format to transfer elsewhere',
      icon: <Download className="w-6 h-6 text-green-600" />,
      color: 'border-green-200 hover:border-green-300'
    },
    {
      value: 'restrict' as const,
      label: 'Restrict Processing',
      description: 'Limit how we process your personal data',
      icon: <Shield className="w-6 h-6 text-purple-600" />,
      color: 'border-purple-200 hover:border-purple-300'
    },
    {
      value: 'object' as const,
      label: 'Object to Processing',
      description: 'Object to specific types of data processing',
      icon: <XCircle className="w-6 h-6 text-red-600" />,
      color: 'border-red-200 hover:border-red-300'
    },
    {
      value: 'withdraw' as const,
      label: 'Withdraw Consent',
      description: 'Withdraw your consent for data processing',
      icon: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
      color: 'border-yellow-200 hover:border-yellow-300'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-myslt-text-primary">DSAR Requests</h1>
          <p className="text-myslt-text-muted mt-2">Submit and manage your data subject access rights requests</p>
        </div>
        
        {/* Fast Real-time Connection Status */}
        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium ${
          realTimeConnected 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
        }`}>
          {realTimeConnected ? (
            <>
              <Wifi className="w-3 h-3" />
              <span>Fast Updates (2s)</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3" />
              <span>Starting...</span>
            </>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20">
        <div className="flex">
          <button
            onClick={() => setActiveTab('my-requests')}
            className={`flex-1 px-6 py-4 text-sm font-medium rounded-l-xl transition-colors ${
              activeTab === 'my-requests'
                ? 'bg-myslt-primary/10 text-myslt-primary border-b-2 border-myslt-primary'
                : 'text-myslt-text-muted hover:text-myslt-text-primary'
            }`}
          >
            My Requests ({dsarRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('new-request')}
            className={`flex-1 px-6 py-4 text-sm font-medium rounded-r-xl transition-colors ${
              activeTab === 'new-request'
                ? 'bg-myslt-primary/10 text-myslt-primary border-b-2 border-myslt-primary'
                : 'text-myslt-text-muted hover:text-myslt-text-primary'
            }`}
          >
            New Request
          </button>
        </div>
      </div>

      {activeTab === 'my-requests' ? (
        <>
          {/* Status Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-myslt-card rounded-lg border border-myslt-accent/20 p-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-8 h-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold text-myslt-text-primary">
                    {dsarRequests.filter(r => r.status === 'pending').length}
                  </p>
                  <p className="text-sm text-myslt-text-muted">Pending</p>
                </div>
              </div>
            </div>
            <div className="bg-myslt-card rounded-lg border border-myslt-accent/20 p-4">
              <div className="flex items-center space-x-3">
                <RefreshCw className="w-8 h-8 text-myslt-primary" />
                <div>
                  <p className="text-2xl font-bold text-myslt-text-primary">
                    {dsarRequests.filter(r => r.status === 'processing').length}
                  </p>
                  <p className="text-sm text-myslt-text-muted">Processing</p>
                </div>
              </div>
            </div>
            <div className="bg-myslt-card rounded-lg border border-myslt-accent/20 p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8 text-myslt-success" />
                <div>
                  <p className="text-2xl font-bold text-myslt-text-primary">
                    {dsarRequests.filter(r => r.status === 'completed').length}
                  </p>
                  <p className="text-sm text-myslt-text-muted">Completed</p>
                </div>
              </div>
            </div>
            <div className="bg-myslt-card rounded-lg border border-myslt-accent/20 p-4">
              <div className="flex items-center space-x-3">
                <Database className="w-8 h-8 text-myslt-primary" />
                <div>
                  <p className="text-2xl font-bold text-myslt-text-primary">{dsarRequests.length}</p>
                  <p className="text-sm text-myslt-text-muted">Total Requests</p>
                </div>
              </div>
            </div>
          </div>

          {/* Requests Header with Refresh */}
          <div className="flex items-center justify-between mt-6 mb-4">
            <h3 className="text-lg font-semibold text-myslt-text-primary">My DSAR Requests</h3>
            <button
              onClick={loadDSARRequests}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 text-sm text-myslt-accent hover:text-myslt-accent-hover hover:bg-myslt-accent/10 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh to see latest status updates"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Requests List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <RefreshCw className="w-6 h-6 text-myslt-primary animate-spin" />
                <span className="text-myslt-text-muted">Loading your DSAR requests...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {dsarRequests.map((request) => (
              <div key={request.id} className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getTypeIcon(request.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-myslt-text-primary">{request.description}</h3>
                      <p className="text-sm text-myslt-text-muted">Request ID: {request.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(request.status)}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center text-sm text-myslt-text-muted">
                    <Calendar className="w-4 h-4 mr-2" />
                    Requested: {new Date(request.requestedDate).toLocaleDateString()}
                  </div>
                  {request.completedDate && (
                    <div className="flex items-center text-sm text-myslt-text-muted">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Completed: {new Date(request.completedDate).toLocaleDateString()}
                    </div>
                  )}
                  {request.estimatedCompletion && !request.completedDate && (
                    <div className="flex items-center text-sm text-myslt-text-muted">
                      <Clock className="w-4 h-4 mr-2" />
                      Est. Completion: {new Date(request.estimatedCompletion).toLocaleDateString()}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="w-4 h-4 mr-2" />
                    {request.requestedBy}
                  </div>
                </div>

                {request.reason && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-myslt-text-primary mb-1">Reason:</p>
                    <p className="text-sm text-myslt-text-muted">{request.reason}</p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="flex space-x-3">
                    {request.status === 'completed' && request.downloadUrl && (
                      <button
                        onClick={() => console.log('Download', request.downloadUrl)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    )}
                    <button
                      onClick={() => console.log('View details', request.id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                  
                  {request.expiryDate && (
                    <p className="text-xs text-gray-500">
                      Download expires: {new Date(request.expiryDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {dsarRequests.length === 0 && !loading && (
              <div className="text-center py-12">
                <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                <p className="text-gray-500 mb-4">You haven't submitted any DSAR requests yet.</p>
                <button
                  onClick={() => setActiveTab('new-request')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit Your First Request
                </button>
              </div>
            )}
            </div>
          )}
        </>
      ) : (
        /* New Request Form */
        <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20 p-6">
          <form onSubmit={handleSubmitRequest} className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-myslt-text-primary mb-4">Submit New DSAR Request</h2>
              <p className="text-myslt-text-muted mb-6">
                Choose the type of request you'd like to submit. We'll process your request within 30 days as required by data protection regulations.
              </p>
            </div>

            {/* Request Type Selection */}
            <div>
              <label className="block text-sm font-medium text-myslt-text-primary mb-3">Request Type</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requestTypeOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start space-x-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      requestType === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : `border-gray-200 hover:border-gray-300 ${option.color}`
                    }`}
                  >
                    <input
                      type="radio"
                      name="requestType"
                      value={option.value}
                      checked={requestType === option.value}
                      onChange={(e) => setRequestType(e.target.value as typeof requestType)}
                      className="sr-only"
                    />
                    <div className="flex-shrink-0 mt-1">
                      {option.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{option.label}</h3>
                      <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-myslt-text-primary mb-2">
                Reason for Request (Optional)
              </label>
              <textarea
                id="reason"
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Please explain why you're making this request..."
              />
            </div>

            {/* Additional Details */}
            <div>
              <label htmlFor="details" className="block text-sm font-medium text-myslt-text-primary mb-2">
                Additional Details (Optional)
              </label>
              <textarea
                id="details"
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any specific information or data categories you'd like to include..."
              />
            </div>

            {/* Important Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900">Important Notice</h4>
                  <p className="text-sm text-yellow-800 mt-1">
                    We will verify your identity before processing this request. You may be asked to provide additional documentation. 
                    Processing typically takes 15-30 days. For data deletion requests, this action cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            {/* Status Messages */}
            {submitStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-medium text-green-900">
                    Request submitted successfully! We'll process it within 30 days.
                  </p>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm font-medium text-red-900">
                    Error submitting request. Please try again later.
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setActiveTab('my-requests')}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Submit Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CustomerDSARRequests;
