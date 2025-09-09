import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  AlertTriangle,
  Calendar,
  Globe,
  User,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Download,
  Search,
  Filter,
  Check,
  X
} from 'lucide-react';
import { authService } from '../../services/authService';
import { multiServiceApiClient } from '../../services/multiServiceApiClient';
import { io, Socket } from 'socket.io-client';

interface PrivacyNotice {
  id: string;
  _id?: string;
  noticeId?: string;
  title: string;
  description?: string;
  content: string | any;
  version: string;
  category: string;
  status: string;
  language: string;
  effectiveDate: string;
  expirationDate?: string;
  acknowledged?: boolean;
  acknowledgedAt?: string;
  customerDecision?: 'accept' | 'decline';
  mandatory?: boolean;
  priority?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

interface CustomerPrivacyNoticesProps {
  onBack?: () => void;
}

const CustomerPrivacyNotices: React.FC<CustomerPrivacyNoticesProps> = () => {
  const { t } = useTranslation();
  const [notices, setNotices] = useState<PrivacyNotice[]>([]);
  const [filteredNotices, setFilteredNotices] = useState<PrivacyNotice[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<PrivacyNotice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Load privacy notices from backend
  const loadPrivacyNotices = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Loading privacy notices from backend...');
      const response = await multiServiceApiClient.makeRequest(
        'GET',
        '/api/v1/customer/privacy-notices',
        undefined,
        'customer'
      );
      
      console.log('Privacy notices API response:', response);
      console.log('Response structure:', {
        success: response.success,
        hasData: !!response.data,
        hasNotices: !!(response.data && response.data.notices),
        noticesCount: response.data && response.data.notices ? response.data.notices.length : 0
      });
      
      if (response.success && response.data && response.data.notices) {
        const noticesData = response.data.notices;
        console.log(`Loaded ${noticesData.length} privacy notices`);
        
        // Process and normalize the notices data
        const processedNotices = noticesData.map((notice: any) => ({
          id: notice.id || notice._id || notice.noticeId,
          _id: notice._id,
          noticeId: notice.noticeId,
          title: notice.title || 'Untitled Notice',
          description: notice.description || '',
          content: notice.content || '',
          version: notice.version || '1.0',
          category: notice.category || 'general',
          status: notice.status || 'active',
          language: notice.language || 'en',
          effectiveDate: notice.effectiveDate || notice.createdAt,
          expirationDate: notice.expirationDate,
          acknowledged: notice.acknowledged || false,
          acknowledgedAt: notice.acknowledgedAt,
          customerDecision: notice.customerDecision,
          mandatory: notice.priority === 'high' || notice.category === 'general',
          priority: notice.priority || 'medium',
          metadata: notice.metadata || {},
          createdAt: notice.createdAt,
          updatedAt: notice.updatedAt
        }));

        setNotices(processedNotices);
        setFilteredNotices(processedNotices);
      } else {
        console.log('No notices found or unexpected response format');
        setNotices([]);
        setFilteredNotices([]);
      }
    } catch (error: any) {
      console.error('Error loading privacy notices:', error);
      setError(error.response?.data?.message || 'Failed to load privacy notices');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle accept/decline decision
  const handleDecision = async (noticeId: string, decision: 'accept' | 'decline') => {
    setIsProcessing(noticeId);
    setError(null);
    
    try {
      console.log(`${decision === 'accept' ? 'Accepting' : 'Declining'} privacy notice: ${noticeId}`);
      
      const response = await multiServiceApiClient.makeRequest(
        'POST',
        `/api/v1/privacy-notices/${noticeId}/acknowledge`,
        { decision: decision },
        'customer'
      );

      if (response.success) {
        console.log(`Privacy notice ${decision}ed successfully`);
        
        // Update the notice in state
        setNotices(prevNotices => 
          prevNotices.map(notice => 
            notice.id === noticeId || notice._id === noticeId || notice.noticeId === noticeId
              ? { 
                  ...notice, 
                  acknowledged: true, 
                  acknowledgedAt: new Date().toISOString(),
                  customerDecision: decision,
                  status: decision === 'accept' ? 'accepted' : 'declined'
                }
              : notice
          )
        );

        // Update filtered notices as well
        setFilteredNotices(prevNotices => 
          prevNotices.map(notice => 
            notice.id === noticeId || notice._id === noticeId || notice.noticeId === noticeId
              ? { 
                  ...notice, 
                  acknowledged: true, 
                  acknowledgedAt: new Date().toISOString(),
                  customerDecision: decision,
                  status: decision === 'accept' ? 'accepted' : 'declined'
                }
              : notice
          )
        );

        // Close the detail view
        if (selectedNotice && (selectedNotice.id === noticeId || selectedNotice._id === noticeId || selectedNotice.noticeId === noticeId)) {
          setSelectedNotice(null);
        }
      } else {
        setError(`Failed to ${decision} privacy notice`);
      }
    } catch (error: any) {
      console.error(`Error ${decision}ing privacy notice:`, error);
      setError(error.message || `Failed to ${decision} privacy notice`);
    } finally {
      setIsProcessing(null);
    }
  };

  // Filter notices based on search and status
  useEffect(() => {
    let filtered = notices;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(notice => 
        notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notice.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notice.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending') {
        filtered = filtered.filter(notice => !notice.acknowledged);
      } else if (statusFilter === 'accepted') {
        filtered = filtered.filter(notice => notice.customerDecision === 'accept');
      } else if (statusFilter === 'declined') {
        filtered = filtered.filter(notice => notice.customerDecision === 'decline');
      }
    }

    setFilteredNotices(filtered);
  }, [notices, searchTerm, statusFilter]);

  // Load notices on component mount
  useEffect(() => {
    loadPrivacyNotices();
  }, []);

  // Real-time updates via Socket.IO
  useEffect(() => {
    let socket: Socket | null = null;

    try {
      // Connect to Socket.IO server
      const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3001';
      socket = io(wsUrl);

      console.log('🔌 Customer Privacy Notices: Connected to real-time updates');

      // Listen for privacy notice updates
      socket.on('privacy-notice-updated', (data) => {
        console.log('📡 Real-time update received:', data);

        if (data.action === 'deleted' || data.action === 'updated' || data.action === 'created') {
          // Reload notices to get the latest data
          console.log('🔄 Refreshing privacy notices due to real-time update');
          loadPrivacyNotices();
        }
      });

      // Handle connection events
      socket.on('connect', () => {
        console.log('✅ Customer dashboard connected to real-time updates');
      });

      socket.on('disconnect', () => {
        console.log('❌ Customer dashboard disconnected from real-time updates');
      });

    } catch (error) {
      console.error('❌ Failed to connect to real-time updates:', error);
    }

    // Cleanup on component unmount
    return () => {
      if (socket) {
        socket.disconnect();
        console.log('🔌 Customer Privacy Notices: Disconnected from real-time updates');
      }
    };
  }, []);

  // Get status icon and color
  const getStatusIcon = (notice: PrivacyNotice) => {
    if (!notice.acknowledged) {
      return <Clock className="w-5 h-5 text-amber-500" />;
    } else if (notice.customerDecision === 'accept') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusText = (notice: PrivacyNotice) => {
    if (!notice.acknowledged) {
      return 'Pending Review';
    } else if (notice.customerDecision === 'accept') {
      return 'Accepted';
    } else {
      return 'Declined';
    }
  };

  const getStatusBadgeClass = (notice: PrivacyNotice) => {
    if (!notice.acknowledged) {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    } else if (notice.customerDecision === 'accept') {
      return 'bg-green-100 text-green-800 border-green-200';
    } else {
      return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  // Render content (handle both string and object content)
  const renderContent = (content: string | any) => {
    if (typeof content === 'string') {
      return <div dangerouslySetInnerHTML={{ __html: content }} />;
    } else if (content && typeof content === 'object') {
      // If content is an object, try to extract meaningful text
      const textContent = content.text || content.description || content.html || JSON.stringify(content, null, 2);
      return <div dangerouslySetInnerHTML={{ __html: textContent }} />;
    }
    return <p>Content not available</p>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-myslt-background">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-myslt-success mx-auto mb-4" />
          <p className="text-myslt-text-secondary">Loading privacy notices...</p>
        </div>
      </div>
    );
  }

  if (selectedNotice) {
    return (
      <div className="min-h-screen bg-myslt-background p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedNotice(null)}
                  className="p-2 rounded-lg bg-myslt-accent/10 hover:bg-myslt-accent/20 transition-colors"
                >
                  <X className="w-5 h-5 text-myslt-text-secondary" />
                </button>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-myslt-text-primary">{selectedNotice.title}</h1>
                  <p className="text-myslt-text-secondary">Version {selectedNotice.version}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(selectedNotice)}
                <span className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusBadgeClass(selectedNotice)}`}>
                  {getStatusText(selectedNotice)}
                </span>
              </div>
            </div>
          </div>

          {/* Notice Details */}
          <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-myslt-text-muted" />
                <div>
                  <p className="text-sm text-myslt-text-secondary">Effective Date</p>
                  <p className="font-medium text-myslt-text-primary">
                    {new Date(selectedNotice.effectiveDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-myslt-text-muted" />
                <div>
                  <p className="text-sm text-myslt-text-secondary">Category</p>
                  <p className="font-medium text-myslt-text-primary capitalize">{selectedNotice.category}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-myslt-text-muted" />
                <div>
                  <p className="text-sm text-myslt-text-secondary">Language</p>
                  <p className="font-medium text-myslt-text-primary uppercase">{selectedNotice.language}</p>
                </div>
              </div>
            </div>

            {selectedNotice.description && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800">{selectedNotice.description}</p>
              </div>
            )}

            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold text-myslt-text-primary mb-4">Notice Content</h3>
              <div className="text-myslt-text-secondary">
                {renderContent(selectedNotice.content)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {!selectedNotice.acknowledged && (
            <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20 p-6">
              <h3 className="text-lg font-semibold text-myslt-text-primary mb-4">Your Response Required</h3>
              <p className="text-myslt-text-secondary mb-6">
                Please review this privacy notice and indicate your acceptance or decline.
              </p>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-red-700">{error}</span>
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={() => handleDecision(selectedNotice.id || selectedNotice._id || selectedNotice.noticeId || '', 'accept')}
                  disabled={isProcessing !== null}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 px-6 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isProcessing === (selectedNotice.id || selectedNotice._id || selectedNotice.noticeId) ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <ThumbsUp className="w-5 h-5" />
                  )}
                  <span>Accept</span>
                </button>
                <button
                  onClick={() => handleDecision(selectedNotice.id || selectedNotice._id || selectedNotice.noticeId || '', 'decline')}
                  disabled={isProcessing !== null}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 px-6 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isProcessing === (selectedNotice.id || selectedNotice._id || selectedNotice.noticeId) ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <ThumbsDown className="w-5 h-5" />
                  )}
                  <span>Decline</span>
                </button>
              </div>
            </div>
          )}

          {/* Already responded */}
          {selectedNotice.acknowledged && (
            <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20 p-6">
              <div className="flex items-center space-x-3">
                {selectedNotice.customerDecision === 'accept' ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500" />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-myslt-text-primary">
                    You {selectedNotice.customerDecision === 'accept' ? 'Accepted' : 'Declined'} this Notice
                  </h3>
                  <p className="text-myslt-text-secondary">
                    Responded on {new Date(selectedNotice.acknowledgedAt || '').toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-myslt-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-myslt-text-primary">Privacy Notices</h1>
                <p className="text-myslt-text-secondary">Review and respond to privacy notices</p>
              </div>
            </div>
            <button
              onClick={loadPrivacyNotices}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-myslt-success hover:bg-myslt-success/90 text-white rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20 p-6 mb-6">
          <h3 className="text-lg font-semibold text-myslt-text-primary mb-4">Privacy Notice Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{notices.length}</div>
              <div className="text-sm text-blue-800">Total Notices</div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">
                {notices.filter(n => !n.acknowledged).length}
              </div>
              <div className="text-sm text-amber-800">Pending Review</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {notices.filter(n => n.customerDecision === 'accept').length}
              </div>
              <div className="text-sm text-green-800">Accepted</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {notices.filter(n => n.customerDecision === 'decline').length}
              </div>
              <div className="text-sm text-red-800">Declined</div>
            </div>
          </div>
          
          {/* Status Information */}
          <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-600">
            <h4 className="font-semibold text-white mb-2">How Privacy Notices Work</h4>
            <div className="text-sm text-gray-200 space-y-1">
              <p>• <strong className="text-yellow-400">Pending:</strong> Notices that require your response</p>
              <p>• <strong className="text-green-400">Accepted:</strong> Notices you have agreed to</p>
              <p>• <strong className="text-red-400">Declined:</strong> Notices you have refused</p>
              <p>• You can change your decision at any time by reviewing and responding again</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-myslt-text-muted w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search privacy notices..."
                className="w-full pl-10 pr-4 py-2 border border-myslt-accent/30 rounded-lg bg-myslt-background focus:ring-2 focus:ring-myslt-success focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-myslt-text-muted" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-myslt-accent/30 rounded-lg bg-myslt-background focus:ring-2 focus:ring-myslt-success focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <span className="text-red-700 font-medium">Error Processing Request</span>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                <p className="text-red-500 text-xs mt-2">
                  If this error persists, please try refreshing the page or contact support.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notices List */}
        {filteredNotices.length > 0 ? (
          <div className="space-y-4">
            {filteredNotices.map((notice) => (
              <div key={notice.id || notice._id} className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-myslt-text-primary">{notice.title}</h3>
                          <span className={`px-2 py-1 rounded-full border text-xs font-medium ${getStatusBadgeClass(notice)}`}>
                            {getStatusText(notice)}
                          </span>
                          {notice.mandatory && (
                            <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs font-medium">
                              Required
                            </span>
                          )}
                        </div>
                        
                        {notice.description && (
                          <p className="text-myslt-text-secondary mb-3">{notice.description}</p>
                        )}
                        
                        <div className="flex items-center space-x-6 text-sm text-myslt-text-muted">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Version {notice.version}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Globe className="w-4 h-4" />
                            <span className="capitalize">{notice.category}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(notice.effectiveDate).toLocaleDateString()}</span>
                          </span>
                        </div>

                        {notice.acknowledged && notice.acknowledgedAt && (
                          <div className="mt-2 text-sm text-myslt-text-muted">
                            {notice.customerDecision === 'accept' ? 'Accepted' : 'Declined'} on{' '}
                            {new Date(notice.acknowledgedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {getStatusIcon(notice)}
                    
                    <button
                      onClick={() => setSelectedNotice(notice)}
                      className="flex items-center space-x-2 px-4 py-2 text-myslt-success hover:bg-myslt-success/10 border border-myslt-success/30 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Review</span>
                    </button>

                    {!notice.acknowledged && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDecision(notice.id || notice._id || notice.noticeId || '', 'accept')}
                          disabled={isProcessing !== null}
                          className="flex items-center space-x-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                        >
                          {isProcessing === (notice.id || notice._id || notice.noticeId) ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleDecision(notice.id || notice._id || notice.noticeId || '', 'decline')}
                          disabled={isProcessing !== null}
                          className="flex items-center space-x-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                        >
                          {isProcessing === (notice.id || notice._id || notice.noticeId) ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                          <span>Decline</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20 p-8 text-center">
            <FileText className="w-12 h-12 text-myslt-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-myslt-text-primary mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No Matching Notices' : 'No Privacy Notices Available'}
            </h3>
            <p className="text-myslt-text-secondary">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'There are currently no privacy notices that require your attention.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerPrivacyNotices;
