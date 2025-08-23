import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Download, CheckCircle, AlertCircle, RefreshCw, FileText, X, Search } from 'lucide-react';
import axios from 'axios';

interface BulkImport {
  _id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  importType: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
  };
  totalCount?: number;
  processedCount?: number;
  successfulCount?: number;
  failedCount?: number;
  progressPercentage?: number;
  errors?: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  statistics?: {
    customers?: number;
    consents?: number;
    preferences?: number;
    users?: number;
  };
  summary?: {
    totalRows: number;
    processedRows: number;
    successfulRows: number;
    failedRows: number;
    processingTime: number;
  };
  createdAt: string;
  updatedAt: string;
  startTime?: string;
  endTime?: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const BulkImportManager: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<string>('customers');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [selectedImport, setSelectedImport] = useState<BulkImport | null>(null);
  const [importHistory, setImportHistory] = useState<BulkImport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Search and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API Base URL
  const API_BASE_URL = 'http://localhost:3001/api/v1';

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // Fetch import history
  const fetchImportHistory = useCallback(async (page = 1) => {
    try {
      setLoading(page === 1);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('importType', typeFilter);

      const response = await axios.get(
        `${API_BASE_URL}/bulk-import/history?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        }
      );

      if (response.data.success) {
        setImportHistory(response.data.data);
        setPagination(response.data.pagination);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error fetching import history:', error);
      // Set empty state on error
      setImportHistory([]);
      setPagination({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
        hasNext: false,
        hasPrev: false
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchTerm, statusFilter, typeFilter]);

  // Load import history on component mount and when filters change
  useEffect(() => {
    fetchImportHistory(1);
  }, [fetchImportHistory]);

  // Auto-refresh processing imports every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const hasProcessingImports = importHistory.some(imp => imp.status === 'processing');
      if (hasProcessingImports) {
        fetchImportHistory(currentPage);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [importHistory, currentPage, fetchImportHistory]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setSelectedFile(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('importType', importType);
      formData.append('columnMapping', JSON.stringify({})); // Default mapping

      const response = await axios.post(
        `${API_BASE_URL}/bulk-import/upload`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(progress);
            }
          }
        }
      );

      if (response.data.success) {
        // Refresh import history
        await fetchImportHistory(1);
        
        setSelectedFile(null);
        setUploadProgress(0);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
      
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please check your connection and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const templates = {
      customers: `name,email,phone
John Doe,john.doe@example.com,+1234567890
Jane Smith,jane.smith@example.com,+1987654321`,
      consents: `userId,purpose,status
60f7b1b5e4b0c1d2e3f4g5h6,marketing,granted
60f7b1b5e4b0c1d2e3f4g5h7,analytics,denied`,
      preferences: `userId,categoryId,itemId,value
60f7b1b5e4b0c1d2e3f4g5h6,60f7b1b5e4b0c1d2e3f4g5h8,60f7b1b5e4b0c1d2e3f4g5h9,true
60f7b1b5e4b0c1d2e3f4g5h7,60f7b1b5e4b0c1d2e3f4g5h8,60f7b1b5e4b0c1d2e3f4g5h9,false`,
      users: `name,email,phone,role,isActive
Admin User,admin@example.com,+1234567890,admin,true
CSR User,csr@example.com,+1987654321,csr,true`
    };
    
    const csvContent = templates[importType as keyof typeof templates] || templates.customers;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${importType}_import_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleViewErrors = (importItem: BulkImport) => {
    setSelectedImport(importItem);
    setShowErrorModal(true);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchImportHistory(currentPage);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'processing':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'pending':
        return <FileText className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => {
    if (!ms) return '0s';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bulk Import</h1>
          <p className="text-gray-600 mt-2">Import customer data and consents in bulk</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleDownloadTemplate}
            className="px-4 py-2 bg-myslt-card-solid border border-myslt-border rounded-lg hover:bg-myslt-service-card transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Download Template</span>
          </button>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="bg-myslt-card-solid rounded-xl shadow-sm border border-myslt-border p-6">
          <h3 className="text-lg font-semibold text-myslt-text-primary mb-4">Upload Data</h3>
          
          {/* Import Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Import Type
            </label>
            <select
              value={importType}
              onChange={(e) => setImportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="customers">Customers</option>
              <option value="consents">Consents</option>
              <option value="preferences">Preferences</option>
              <option value="users">Users</option>
            </select>
          </div>
          
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            {selectedFile ? (
              <div className="space-y-4">
                <div className="bg-myslt-service-card rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
                
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <button 
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? 'Uploading...' : 'Upload File'}
                  </button>
                  <button 
                    onClick={() => setSelectedFile(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-2">Drop your CSV file here or click to browse</p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Choose File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Supported Formats</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• CSV files only</li>
              <li>• Maximum file size: 10MB</li>
              <li>• UTF-8 encoding recommended</li>
              <li>• First row should contain headers</li>
            </ul>
          </div>
        </div>

        {/* Import History Section */}
        <div className="bg-myslt-card-solid rounded-xl shadow-sm border border-myslt-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-myslt-text-primary">Import History</h3>
          </div>

          {/* Filters */}
          <div className="mb-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search imports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All Types</option>
                <option value="customers">Customers</option>
                <option value="consents">Consents</option>
                <option value="preferences">Preferences</option>
                <option value="users">Users</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          ) : (
            <>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {importHistory.length > 0 ? importHistory.map((item) => (
                  <div key={item._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(item.status)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.fileName}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            Type: {item.importType} • Size: {formatFileSize(item.fileSize)}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Total Records</p>
                        <p className="font-medium">{(item.totalCount || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Processed</p>
                        <p className="font-medium">{(item.processedCount || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Successful</p>
                        <p className="font-medium text-green-600">{(item.successfulCount || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Errors</p>
                        <p className="font-medium text-red-600">{(item.failedCount || 0).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    {item.status === 'processing' && item.progressPercentage !== undefined && (
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{item.progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${item.progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {(item.failedCount || 0) > 0 && item.errors && (
                      <div className="mt-3">
                        <button 
                          onClick={() => handleViewErrors(item)}
                          className="text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                          View {item.failedCount} Error{(item.failedCount || 0) > 1 ? 's' : ''}
                        </button>
                      </div>
                    )}
                    
                    {item.summary && item.status === 'completed' && (
                      <div className="mt-3 text-xs text-gray-500">
                        Processing time: {formatDuration(item.summary.processingTime)}
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    No import history found
                  </div>
                )}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} imports
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => fetchImportHistory(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                      className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    <span className="px-3 py-1 text-sm bg-blue-600 text-white rounded">
                      {pagination.page}
                    </span>
                    
                    <button
                      onClick={() => fetchImportHistory(pagination.page + 1)}
                      disabled={!pagination.hasNext}
                      className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Error Details Modal */}
      {showErrorModal && selectedImport && selectedImport.errors && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-myslt-card-solid rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Import Errors - {selectedImport.fileName}
                </h3>
                <button 
                  onClick={() => setShowErrorModal(false)}
                  className="p-2 hover:bg-myslt-service-card rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Found {selectedImport.failedCount} errors in {selectedImport.fileName}
                </p>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {selectedImport.errors.map((error, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-red-800 font-medium">Row {error.row}</p>
                      <p className="text-sm text-red-700">Field: {error.field}</p>
                      <p className="text-sm text-red-800">{error.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button 
                  onClick={() => setShowErrorModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkImportManager;
