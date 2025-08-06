import React, { useState } from 'react';
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
  Database
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

interface DSARRequest {
  id: string;
  type: 'export' | 'delete' | 'rectify' | 'restrict';
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
  const [activeTab, setActiveTab] = useState<'new-request' | 'my-requests'>('my-requests');
  const [requestType, setRequestType] = useState<'export' | 'delete' | 'rectify' | 'restrict'>('export');
  const [requestReason, setRequestReason] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // Add notification functionality
  const { addNotification } = useNotifications();

  // Mock data - replace with API calls
  const dsarRequests: DSARRequest[] = [
    {
      id: 'DSAR-001',
      type: 'export',
      status: 'completed',
      requestedDate: '2024-07-01',
      completedDate: '2024-07-08',
      description: 'Export all personal data',
      downloadUrl: '/downloads/export-2024-07-08.zip',
      expiryDate: '2024-08-08',
      requestedBy: 'Customer Portal'
    },
    {
      id: 'DSAR-002',
      type: 'delete',
      status: 'processing',
      requestedDate: '2024-07-15',
      estimatedCompletion: '2024-07-25',
      description: 'Delete marketing preferences data',
      reason: 'No longer wish to receive marketing communications',
      requestedBy: 'Customer Portal'
    },
    {
      id: 'DSAR-003',
      type: 'export',
      status: 'pending',
      requestedDate: '2024-07-18',
      estimatedCompletion: '2024-07-28',
      description: 'Export billing and usage data',
      reason: 'Required for personal records',
      requestedBy: 'Customer Portal'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'processing':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'export':
        return <Download className="w-5 h-5 text-blue-600" />;
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newRequest = {
        type: requestType,
        reason: requestReason,
        additionalDetails: additionalDetails
      };
      
      console.log('Submitting DSAR request:', newRequest);
      setSubmitStatus('success');
      
      // Add notification for admin/CSR users about the new DSAR request
      addNotification({
        title: 'New DSAR Request Submitted',
        message: `Customer has submitted a new ${requestType} request at ${new Date().toLocaleString()}`,
        type: 'dsar',
        category: 'urgent',
        metadata: {
          requestType,
          reason: requestReason
        }
      });
      
      // Reset form
      setRequestReason('');
      setAdditionalDetails('');
      
      // Switch to requests view
      setTimeout(() => {
        setActiveTab('my-requests');
        setSubmitStatus('idle');
      }, 2000);
      
    } catch (error) {
      setSubmitStatus('error');
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
      value: 'rectify' as const,
      label: 'Correct My Data',
      description: 'Request correction of inaccurate personal information',
      icon: <FileText className="w-6 h-6 text-orange-600" />,
      color: 'border-orange-200 hover:border-orange-300'
    },
    {
      value: 'restrict' as const,
      label: 'Restrict Processing',
      description: 'Limit how we process your personal data',
      icon: <Shield className="w-6 h-6 text-purple-600" />,
      color: 'border-purple-200 hover:border-purple-300'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">DSAR Requests</h1>
        <p className="text-gray-600 mt-2">Submit and manage your data subject access rights requests</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('my-requests')}
            className={`flex-1 px-6 py-4 text-sm font-medium rounded-l-xl transition-colors ${
              activeTab === 'my-requests'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            My Requests ({dsarRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('new-request')}
            className={`flex-1 px-6 py-4 text-sm font-medium rounded-r-xl transition-colors ${
              activeTab === 'new-request'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-700'
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
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-8 h-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {dsarRequests.filter(r => r.status === 'pending').length}
                  </p>
                  <p className="text-sm text-gray-500">Pending</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <RefreshCw className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {dsarRequests.filter(r => r.status === 'processing').length}
                  </p>
                  <p className="text-sm text-gray-500">Processing</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {dsarRequests.filter(r => r.status === 'completed').length}
                  </p>
                  <p className="text-sm text-gray-500">Completed</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <Database className="w-8 h-8 text-gray-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{dsarRequests.length}</p>
                  <p className="text-sm text-gray-500">Total Requests</p>
                </div>
              </div>
            </div>
          </div>

          {/* Requests List */}
          <div className="space-y-4">
            {dsarRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getTypeIcon(request.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{request.description}</h3>
                      <p className="text-sm text-gray-500">Request ID: {request.id}</p>
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
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    Requested: {new Date(request.requestedDate).toLocaleDateString()}
                  </div>
                  {request.completedDate && (
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Completed: {new Date(request.completedDate).toLocaleDateString()}
                    </div>
                  )}
                  {request.estimatedCompletion && !request.completedDate && (
                    <div className="flex items-center text-sm text-gray-600">
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
                    <p className="text-sm font-medium text-gray-700 mb-1">Reason:</p>
                    <p className="text-sm text-gray-600">{request.reason}</p>
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
          </div>

          {dsarRequests.length === 0 && (
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
        </>
      ) : (
        /* New Request Form */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmitRequest} className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Submit New DSAR Request</h2>
              <p className="text-gray-600 mb-6">
                Choose the type of request you'd like to submit. We'll process your request within 30 days as required by data protection regulations.
              </p>
            </div>

            {/* Request Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Request Type</label>
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
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
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
              <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-2">
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
