import React, { useState, useRef } from 'react';
import { Upload, Download, CheckCircle, AlertCircle, RefreshCw, FileText, X, Eye } from 'lucide-react';

interface ImportHistory {
  id: string;
  filename: string;
  status: 'success' | 'error' | 'processing';
  recordsTotal: number;
  recordsProcessed: number;
  errors: number;
  timestamp: string;
  errorDetails?: string[];
}

const BulkImportManager: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [selectedImport, setSelectedImport] = useState<ImportHistory | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importHistory, setImportHistory] = useState<ImportHistory[]>([
    {
      id: '1',
      filename: 'customer_data.csv',
      status: 'success',
      recordsTotal: 1250,
      recordsProcessed: 1250,
      errors: 0,
      timestamp: '2024-01-28T10:30:00Z'
    },
    {
      id: '2',
      filename: 'consent_updates.csv',
      status: 'error',
      recordsTotal: 500,
      recordsProcessed: 495,
      errors: 5,
      timestamp: '2024-01-27T14:15:00Z',
      errorDetails: [
        'Row 45: Invalid email format',
        'Row 123: Missing required field "consent_type"',
        'Row 234: Invalid date format',
        'Row 345: Duplicate customer ID',
        'Row 456: Unknown consent type'
      ]
    },
    {
      id: '3',
      filename: 'privacy_preferences.csv',
      status: 'processing',
      recordsTotal: 800,
      recordsProcessed: 456,
      errors: 0,
      timestamp: '2024-01-28T15:45:00Z'
    }
  ]);

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
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Add to import history
    const newImport: ImportHistory = {
      id: Date.now().toString(),
      filename: selectedFile.name,
      status: 'processing',
      recordsTotal: Math.floor(Math.random() * 1000) + 100,
      recordsProcessed: 0,
      errors: 0,
      timestamp: new Date().toISOString()
    };
    
    setImportHistory(prev => [newImport, ...prev]);
    setSelectedFile(null);
    setIsUploading(false);
    setUploadProgress(0);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = `customer_id,customer_name,email,consent_type,status,granted_date,expiry_date,source
CUST001,John Doe,john.doe@example.com,marketing,active,2024-01-15,2025-01-15,website
CUST002,Jane Smith,jane.smith@example.com,analytics,active,2024-01-20,,mobile`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleViewErrors = (importItem: ImportHistory) => {
    setSelectedImport(importItem);
    setShowErrorModal(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'processing':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Download Template</span>
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Data</h3>
          
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
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Import History</h3>
          <div className="space-y-4">
            {importHistory.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(item.status)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.filename}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Total Records</p>
                    <p className="font-medium">{item.recordsTotal.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Processed</p>
                    <p className="font-medium">{item.recordsProcessed.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Errors</p>
                    <p className="font-medium text-red-600">{item.errors}</p>
                  </div>
                </div>
                
                {item.status === 'processing' && (
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{Math.round((item.recordsProcessed / item.recordsTotal) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(item.recordsProcessed / item.recordsTotal) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {item.errors > 0 && (
                  <div className="mt-3">
                    <button 
                      onClick={() => handleViewErrors(item)}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      View Error Details
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Error Details Modal */}
      {showErrorModal && selectedImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Import Errors - {selectedImport.filename}</h3>
                <button 
                  onClick={() => setShowErrorModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Found {selectedImport.errors} errors in {selectedImport.filename}
                </p>
              </div>
              
              <div className="space-y-2">
                {selectedImport.errorDetails?.map((error, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-end">
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
