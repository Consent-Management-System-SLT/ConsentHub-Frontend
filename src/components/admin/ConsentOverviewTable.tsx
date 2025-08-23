import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye,
  Edit,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  User,
  ChevronDown,
  RefreshCw,
  X,
  Plus
} from 'lucide-react';
import { useConsents, useParties, useConsentMutation } from '../../hooks/useApi';
import { ConsentCreateRequest } from '../../services/consentService';
import { ConsentPurpose, ConsentStatus } from '../../types/consent';

interface Consent {
  id: string;
  customerId: string;
  customerName: string;
  email: string;
  consentType: 'marketing' | 'analytics' | 'functional' | 'necessary';
  status: 'active' | 'withdrawn' | 'expired' | 'pending';
  grantedDate: string;
  expiryDate?: string;
  lastUpdated: string;
  source: 'website' | 'mobile' | 'email' | 'phone' | 'in-person' | 'sms' | 'push' | 'all' | 'customer_service' | 'mobile_app' | 'registration';
  version: string;
  isRealUser?: boolean;
}

interface ConsentOverviewTableProps {}

const ConsentOverviewTable: React.FC<ConsentOverviewTableProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [consentTypeFilter, setConsentTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedConsents, setSelectedConsents] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalData, setModalData] = useState<Consent | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingConsent, setEditingConsent] = useState<Consent | null>(null);

  // API hooks
  const { data: partiesData } = useParties();
  const { data: consentsData, loading: consentsLoading, error: consentsError, refetch: refetchConsents } = useConsents();
  const { createConsent, updateConsent } = useConsentMutation();
  
  // Form state for creating new consent
  const [newConsentForm, setNewConsentForm] = useState<{
    partyId: string;
    purpose: ConsentPurpose;
    status: ConsentStatus;
    channel: string;
    geoLocation: string;
    privacyNoticeId: string;
    versionAccepted: string;
  }>({
    partyId: '',
    purpose: 'marketing',
    status: 'granted',
    channel: 'email',
    geoLocation: 'Sri Lanka',
    privacyNoticeId: 'PN-001',
    versionAccepted: '1.0'
  });
  
  // Form state for editing existing consent
  const [editConsentForm, setEditConsentForm] = useState<{
    status: ConsentStatus;
    purpose: ConsentPurpose;
    channel: string;
    geoLocation: string;
  }>({
    status: 'granted',
    purpose: 'marketing',
    channel: 'email',
    geoLocation: 'Sri Lanka'
  });
  
  // Transform parties data
  const parties = Array.isArray(partiesData) ? partiesData : 
    (partiesData && (partiesData as any).parties ? (partiesData as any).parties : []);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, consentTypeFilter]);

  // Create party lookup map for efficient customer data lookup
  const partyLookup = new Map();
  parties.forEach((party: any) => {
    partyLookup.set(party.id, party);
  });

  // Transform consents data from API
  const rawConsents = Array.isArray(consentsData) ? consentsData : 
    (consentsData && (consentsData as any).consents ? (consentsData as any).consents : []);

  // Transform API consent data to match UI interface
  const consents: Consent[] = rawConsents.map((consent: any) => {
    const party = partyLookup.get(consent.partyId) || {};
    
    // Map consent types to UI-friendly names
    const mapConsentType = (purpose: string) => {
      const purposeMap: { [key: string]: string } = {
        'marketing': 'marketing',
        'analytics': 'analytics', 
        'functional': 'functional',
        'necessary': 'necessary',
        'dataprocessing': 'functional',
        'data_processing': 'functional',
        'personalization': 'functional',
        'thirdpartysharing': 'analytics',
        'third_party_sharing': 'analytics',
        'cookies': 'necessary',
        'service': 'necessary',
        'sms_marketing': 'marketing',
        'location_tracking': 'analytics',
        'push_notifications': 'functional',
        'research': 'analytics',
        'social_media': 'functional',
        'newsletter': 'marketing',
        'guardian_consent': 'necessary'
      };
      return purposeMap[purpose?.toLowerCase()] || 'marketing';
    };

    // Map status values to UI expectations
    const mapStatus = (status: string) => {
      const statusMap: { [key: string]: string } = {
        'granted': 'active',
        'denied': 'withdrawn',
        'revoked': 'withdrawn',
        'active': 'active',
        'withdrawn': 'withdrawn',
        'expired': 'expired',
        'pending': 'pending'
      };
      return statusMap[status?.toLowerCase()] || 'pending';
    };

    // Check if this is a real MongoDB user (24-character hex string)
    const isRealUser = /^[a-f0-9]{24}$/i.test(consent.partyId);

    // Generate customer name and email - prioritize real MongoDB users
    const getCustomerInfo = () => {
      if (party.name && party.email) {
        // Real MongoDB user found
        return {
          name: party.name,
          email: party.email,
          isRealUser: true
        };
      } else if (isRealUser) {
        // Real MongoDB ID but user not found in lookup (should not happen)
        return {
          name: `User ${consent.partyId.substr(0, 8)}...`,
          email: `user${consent.partyId.substr(0, 8)}@example.com`,
          isRealUser: true
        };
      } else {
        // Legacy data with simple numeric IDs - create placeholder names
        const legacyNames: { [key: string]: string } = {
          '1': 'John Doe Legacy',
          '2': 'Jane Smith Legacy', 
          '3': 'Mike Johnson Legacy',
          '4': 'Sarah Wilson Legacy',
          '5': 'David Brown Legacy'
        };
        const legacyEmails: { [key: string]: string } = {
          '1': 'john.doe@example.com',
          '2': 'jane.smith@example.com',
          '3': 'mike.johnson@example.com', 
          '4': 'sarah.wilson@example.com',
          '5': 'david.brown@example.com'
        };
        return {
          name: legacyNames[consent.partyId] || `Customer ${consent.partyId}`,
          email: legacyEmails[consent.partyId] || `customer${consent.partyId}@example.com`,
          isRealUser: false
        };
      }
    };

    const customerInfo = getCustomerInfo();
    
    return {
      id: consent.id || consent._id,
      customerId: consent.partyId || '',
      customerName: customerInfo.name,
      email: customerInfo.email,
      consentType: mapConsentType(consent.purpose || consent.type),
      status: mapStatus(consent.status),
      grantedDate: consent.grantedAt ? new Date(consent.grantedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }) : (consent.validFrom ? new Date(consent.validFrom).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }) : ''),
      expiryDate: consent.expiresAt ? new Date(consent.expiresAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }) : undefined,
      lastUpdated: consent.updatedAt ? new Date(consent.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }) : '',
      source: consent.channel || consent.source || 'website',
      version: consent.versionAccepted || 'v1.0',
      isRealUser: customerInfo.isRealUser // Add flag for sorting
    };
  })
  
  // Sort to prioritize real MongoDB users first, then by date
  .sort((a: Consent, b: Consent) => {
    // First, sort by whether they are real users (real users first)
    if (a.isRealUser && !b.isRealUser) return -1;
    if (!a.isRealUser && b.isRealUser) return 1;
    
    // Then sort by date (most recent first)
    const dateA = new Date(a.grantedDate).getTime();
    const dateB = new Date(b.grantedDate).getTime();
    return dateB - dateA;
  });

  // Handle consent actions
  const handleViewConsent = (consent: Consent) => {
    setModalData(consent);
    setShowModal(true);
  };

  // Reverse mapping from UI status to database status
  const reverseMapStatus = (uiStatus: string): ConsentStatus => {
    const reverseStatusMap: { [key: string]: ConsentStatus } = {
      'active': 'granted',
      'withdrawn': 'revoked',
      'expired': 'expired',
      'pending': 'pending'
    };
    return reverseStatusMap[uiStatus] || 'granted';
  };

  const handleEditConsent = (consent: Consent) => {
    setEditingConsent(consent);
    setEditConsentForm({
      status: reverseMapStatus(consent.status),
      purpose: (consent.consentType === 'marketing' ? 'marketing' : 'analytics') as ConsentPurpose,
      channel: consent.source || 'email',
      geoLocation: 'Sri Lanka'
    });
    setShowEditModal(true);
  };

  const handleCreateConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConsentForm.partyId) {
      alert('Please select a customer');
      return;
    }

    try {
      const consentData: ConsentCreateRequest = {
        partyId: newConsentForm.partyId,
        purpose: newConsentForm.purpose,
        status: newConsentForm.status,
        channel: newConsentForm.channel,
        geoLocation: newConsentForm.geoLocation,
        privacyNoticeId: newConsentForm.privacyNoticeId,
        versionAccepted: newConsentForm.versionAccepted,
        validFor: {
          startDateTime: new Date().toISOString()
        }
      };

      await createConsent(consentData);
      setShowCreateModal(false);
      
      // Reset form
      setNewConsentForm({
        partyId: '',
        purpose: 'marketing',
        status: 'granted',
        channel: 'email',
        geoLocation: 'Sri Lanka',
        privacyNoticeId: 'PN-001',
        versionAccepted: '1.0'
      });
      
      alert('Consent created successfully!');
      // Refresh the consents data
      await refetchConsents();
    } catch (error) {
      console.error('Failed to create consent:', error);
      alert('Failed to create consent. Please try again.');
    }
  };

  const handleUpdateConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConsent) {
      alert('No consent selected for editing');
      return;
    }

    try {
      const updates = {
        status: editConsentForm.status,
        purpose: editConsentForm.purpose,
        channel: editConsentForm.channel,
        geoLocation: editConsentForm.geoLocation,
        lastUpdated: new Date().toISOString()
      };

      await updateConsent(editingConsent.id, updates);
      setShowEditModal(false);
      setEditingConsent(null);
      
      // Reset form
      setEditConsentForm({
        status: 'granted',
        purpose: 'marketing',
        channel: 'email',
        geoLocation: 'Sri Lanka'
      });
      
      alert('Consent updated successfully!');
      // Refresh the consents data
      await refetchConsents();
    } catch (error) {
      console.error('Failed to update consent:', error);
      alert('Failed to update consent. Please try again.');
    }
  };

  const handleBulkAction = async (action: 'export' | 'delete' | 'update') => {
    if (selectedConsents.size === 0) {
      alert('Please select consents to perform bulk actions');
      return;
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    switch (action) {
      case 'export':
        alert(`Exporting ${selectedConsents.size} consents...`);
        break;
      case 'delete':
        alert(`Deleting ${selectedConsents.size} consents...`);
        setSelectedConsents(new Set());
        break;
      case 'update':
        alert(`Updating ${selectedConsents.size} consents...`);
        break;
    }
  };

  const handleSelectAll = () => {
    if (selectedConsents.size === filteredConsents.length) {
      setSelectedConsents(new Set());
    } else {
      setSelectedConsents(new Set(filteredConsents.map(c => c.id)));
    }
  };

  const handleSelectConsent = (id: string) => {
    const newSelected = new Set(selectedConsents);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedConsents(newSelected);
  };

  const handleExportData = () => {
    const dataToExport = filteredConsents.map(consent => ({
      id: consent.id,
      customerName: consent.customerName,
      email: consent.email,
      consentType: consent.consentType,
      status: consent.status,
      grantedDate: consent.grantedDate,
      expiryDate: consent.expiryDate,
      source: consent.source,
      version: consent.version
    }));
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consent-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'withdrawn':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-myslt-text-secondary" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'withdrawn':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-myslt-service-card text-gray-800';
    }
  };

  const getConsentTypeColor = (type: string) => {
    switch (type) {
      case 'marketing':
        return 'bg-purple-100 text-purple-800';
      case 'analytics':
        return 'bg-blue-100 text-blue-800';
      case 'functional':
        return 'bg-green-100 text-green-800';
      case 'necessary':
        return 'bg-myslt-service-card text-gray-800';
      default:
        return 'bg-myslt-service-card text-gray-800';
    }
  };

  const filteredConsents = consents.filter(consent => {
    const matchesSearch = consent.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consent.customerId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || consent.status === statusFilter;
    const matchesType = consentTypeFilter === 'all' || consent.consentType === consentTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const sortedConsents = [...filteredConsents].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
        break;
      case 'name':
        comparison = a.customerName.localeCompare(b.customerName);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Pagination calculation
  const totalPages = Math.ceil(sortedConsents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedConsents = sortedConsents.slice(startIndex, endIndex);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Loading State */}
      {consentsLoading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-myslt-text-secondary">Loading consents...</span>
        </div>
      )}

      {/* Error State */}
      {consentsError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Error loading consents: {consentsError}</p>
        </div>
      )}

      {/* Main Content - Only show when not loading */}
      {!consentsLoading && (
      <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-myslt-text-primary">Consent Management</h1>
          <p className="text-myslt-text-secondary mt-2">Manage and monitor all customer consents</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Create New Consent</span>
          </button>
          <button 
            onClick={handleExportData}
            className="px-4 py-2 bg-myslt-card-solid border border-gray-300 rounded-lg hover:bg-myslt-service-card transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Export</span>
          </button>
          {selectedConsents.size > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-myslt-text-secondary">{selectedConsents.size} selected</span>
              <button 
                onClick={() => handleBulkAction('export')}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Export Selected
              </button>
              <button 
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Delete Selected
              </button>
            </div>
          )}
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-myslt-card-solid rounded-xl shadow-sm border border-myslt-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-myslt-text-secondary">Active Consents</p>
              <p className="text-2xl font-bold text-green-600">
                {consents.filter(c => c.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-myslt-card-solid rounded-xl shadow-sm border border-myslt-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-myslt-text-secondary">Withdrawn</p>
              <p className="text-2xl font-bold text-red-600">
                {consents.filter(c => c.status === 'withdrawn').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-myslt-card-solid rounded-xl shadow-sm border border-myslt-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-myslt-text-secondary">Expired</p>
              <p className="text-2xl font-bold text-yellow-600">
                {consents.filter(c => c.status === 'expired').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-myslt-card-solid rounded-xl shadow-sm border border-myslt-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-myslt-text-secondary">Total Consents</p>
              <p className="text-2xl font-bold text-blue-600">{consents.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-myslt-card-solid rounded-xl shadow-sm border border-myslt-border p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-myslt-card-solid border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="withdrawn">Withdrawn</option>
                  <option value="expired">Expired</option>
                  <option value="pending">Pending</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              
              <div className="relative">
                <select
                  value={consentTypeFilter}
                  onChange={(e) => setConsentTypeFilter(e.target.value)}
                  className="appearance-none bg-myslt-card-solid border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="marketing">Marketing</option>
                  <option value="analytics">Analytics</option>
                  <option value="functional">Functional</option>
                  <option value="necessary">Necessary</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-myslt-service-card hover:bg-gray-200 rounded-lg transition-colors flex items-center space-x-2">
              <Filter className="w-4 h-4 text-myslt-text-secondary" />
              <span className="text-sm font-medium text-gray-700">More Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Consents Table */}
      <div className="bg-myslt-card-solid rounded-xl shadow-sm border border-myslt-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-myslt-service-card">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedConsents.size === filteredConsents.length && filteredConsents.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-myslt-service-card"
                  onClick={() => {
                    setSortBy('name');
                    setSortOrder(sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <div className="flex items-center space-x-1">
                    <span>Customer</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${sortBy === 'name' && sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Consent Type
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-myslt-service-card"
                  onClick={() => {
                    setSortBy('status');
                    setSortOrder(sortBy === 'status' && sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${sortBy === 'status' && sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-myslt-service-card"
                  onClick={() => {
                    setSortBy('date');
                    setSortOrder(sortBy === 'date' && sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <div className="flex items-center space-x-1">
                    <span>Granted Date</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${sortBy === 'date' && sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-myslt-card-solid divide-y divide-gray-200">
              {paginatedConsents.map((consent) => (
                <tr key={consent.id} className="hover:bg-myslt-service-card">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedConsents.has(consent.id)}
                      onChange={() => handleSelectConsent(consent.id)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-myslt-service-card rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-myslt-text-secondary" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-myslt-text-primary">{consent.customerName}</div>
                        <div className="text-sm text-gray-500">{consent.email}</div>
                        <div className="text-xs text-gray-400">{consent.customerId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getConsentTypeColor(consent.consentType)}`}>
                      {consent.consentType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(consent.status)}
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(consent.status)}`}>
                        {consent.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-myslt-text-primary">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      {new Date(consent.grantedDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-myslt-text-primary">
                    {consent.expiryDate ? (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        {new Date(consent.expiryDate).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-gray-400">No expiry</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-myslt-service-card text-gray-800 capitalize">
                      {consent.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewConsent(consent)}
                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditConsent(consent)}
                        className="text-myslt-text-secondary hover:text-myslt-text-primary p-1 hover:bg-myslt-service-card rounded transition-colors"
                        title="Edit Consent"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-500">
          Showing {sortedConsents.length === 0 ? 0 : Math.min(startIndex + 1, sortedConsents.length)} to {Math.min(endIndex, sortedConsents.length)} of {sortedConsents.length} consents
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-myslt-service-card transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                currentPage === page
                  ? 'bg-red-600 text-white'
                  : 'border border-gray-300 hover:bg-myslt-service-card'
              }`}
            >
              {page}
            </button>
          ))}
          <button 
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-myslt-service-card transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Consent Details Modal */}
      {showModal && modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-myslt-card-solid rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-myslt-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-myslt-text-primary">Consent Details</h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-myslt-service-card rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Customer Information</h4>
                  <div className="bg-myslt-service-card rounded-lg p-4 space-y-2">
                    <p><span className="font-medium">Name:</span> {modalData.customerName}</p>
                    <p><span className="font-medium">Email:</span> {modalData.email}</p>
                    <p><span className="font-medium">ID:</span> {modalData.customerId}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Consent Details</h4>
                  <div className="bg-myslt-service-card rounded-lg p-4 space-y-2">
                    <p><span className="font-medium">Type:</span> {modalData.consentType}</p>
                    <p><span className="font-medium">Status:</span> {modalData.status}</p>
                    <p><span className="font-medium">Source:</span> {modalData.source}</p>
                    <p><span className="font-medium">Version:</span> {modalData.version}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Timeline</h4>
                <div className="bg-myslt-service-card rounded-lg p-4 space-y-2">
                  <p><span className="font-medium">Granted:</span> {new Date(modalData.grantedDate).toLocaleDateString()}</p>
                  <p><span className="font-medium">Last Updated:</span> {new Date(modalData.lastUpdated).toLocaleDateString()}</p>
                  {modalData.expiryDate && (
                    <p><span className="font-medium">Expires:</span> {new Date(modalData.expiryDate).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => handleEditConsent(modalData)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Consent</span>
                </button>
                <button 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Consent Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create New Consent</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateConsent}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer *</label>
                  <select
                    value={newConsentForm.partyId}
                    onChange={(e) => setNewConsentForm({ ...newConsentForm, partyId: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Customer</option>
                    {parties.map((party: any) => (
                      <option key={party.id} value={party.id}>
                        {party.name} - {party.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Purpose *</label>
                  <select
                    value={newConsentForm.purpose}
                    onChange={(e) => setNewConsentForm({ ...newConsentForm, purpose: e.target.value as ConsentPurpose })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="marketing">Marketing</option>
                    <option value="analytics">Analytics</option>
                    <option value="thirdPartySharing">Third Party Sharing</option>
                    <option value="dataProcessing">Data Processing</option>
                    <option value="location">Location</option>
                    <option value="research">Research</option>
                    <option value="personalization">Personalization</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status *</label>
                  <select
                    value={newConsentForm.status}
                    onChange={(e) => setNewConsentForm({ ...newConsentForm, status: e.target.value as ConsentStatus })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="granted">Granted</option>
                    <option value="pending">Pending</option>
                    <option value="revoked">Revoked</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Channel *</label>
                  <select
                    value={newConsentForm.channel}
                    onChange={(e) => setNewConsentForm({ ...newConsentForm, channel: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="push">Push</option>
                    <option value="voice">Voice</option>
                    <option value="all">All</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Geo Location</label>
                  <input
                    type="text"
                    value={newConsentForm.geoLocation}
                    onChange={(e) => setNewConsentForm({ ...newConsentForm, geoLocation: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Sri Lanka"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Privacy Notice ID</label>
                  <input
                    type="text"
                    value={newConsentForm.privacyNoticeId}
                    onChange={(e) => setNewConsentForm({ ...newConsentForm, privacyNoticeId: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="PN-001"
                  />
                </div>
              </div>

              <div className="mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Version</label>
                  <input
                    type="text"
                    value={newConsentForm.versionAccepted}
                    onChange={(e) => setNewConsentForm({ ...newConsentForm, versionAccepted: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1.0"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Consent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Consent Modal */}
      {showEditModal && editingConsent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Consent - {editingConsent.customerName}</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateConsent}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Customer</label>
                <div className="mt-1 p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-600">
                  {editingConsent.customerName} - {editingConsent.email}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Purpose *</label>
                  <select
                    value={editConsentForm.purpose}
                    onChange={(e) => setEditConsentForm({ ...editConsentForm, purpose: e.target.value as ConsentPurpose })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="marketing">Marketing</option>
                    <option value="analytics">Analytics</option>
                    <option value="thirdPartySharing">Third Party Sharing</option>
                    <option value="dataProcessing">Data Processing</option>
                    <option value="location">Location</option>
                    <option value="research">Research</option>
                    <option value="personalization">Personalization</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status *</label>
                  <select
                    value={editConsentForm.status}
                    onChange={(e) => setEditConsentForm({ ...editConsentForm, status: e.target.value as ConsentStatus })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="granted">Granted</option>
                    <option value="pending">Pending</option>
                    <option value="revoked">Revoked</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Channel *</label>
                  <select
                    value={editConsentForm.channel}
                    onChange={(e) => setEditConsentForm({ ...editConsentForm, channel: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="push">Push</option>
                    <option value="voice">Voice</option>
                    <option value="all">All</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Geo Location</label>
                  <input
                    type="text"
                    value={editConsentForm.geoLocation}
                    onChange={(e) => setEditConsentForm({ ...editConsentForm, geoLocation: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Sri Lanka"
                  />
                </div>
              </div>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Consent Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Consent ID:</span>
                    <div className="font-mono text-gray-900">{editingConsent.id}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Original Date:</span>
                    <div className="text-gray-900">{editingConsent.grantedDate}</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Consent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
};

export default ConsentOverviewTable;
