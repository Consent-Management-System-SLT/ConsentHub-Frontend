import React, { useState, useEffect } from 'react';
import { pageWindow } from '../../utils/pagination';
import { 
  Search, 
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
import { ConsentStatus } from '../../types/consent';
import { useAuth } from '../../contexts/AuthContext';
import {
  CONSENT_TYPES, CONSENT_STATUSES, CONSENT_CHANNELS, CONSENT_SOURCES,
  consentTypeLabel, consentStatusLabel, consentChannelLabel, consentSourceLabel,
  withCurrent, toLocalInput, nowLocalInput
} from '../../utils/consentModel';
import { websocketService } from '../../services/websocketService';
import { notificationManager } from '../shared/NotificationContainer';
import { secureLog } from '../../utils/secureLogger';
interface Consent {
  id: string;
  customerId: string;
  customerName: string;
  email: string;
  consentType: string;
  status: 'active' | 'withdrawn' | 'expired' | 'pending' | 'denied' | 'granted' | 'revoked';
  grantedDate: string;
  expiryDate?: string;
  lastUpdated: string;
  source: 'website' | 'mobile' | 'email' | 'phone' | 'in-person' | 'sms' | 'push' | 'all' | 'customer_service' | 'mobile_app' | 'registration';
  version: string;
  isRealUser?: boolean;
  channel: string;
  recordSource: string;
  capturedBy?: string;
  consentDateTime?: string;
  withdrawalDateTime?: string;
  // Add raw timestamps for sorting
  grantedAt?: string;
  revokedAt?: string;
  updatedAt?: string;
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
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  // Helper function to format grant/revoke date with time and source
  const formatGrantRevokeDateTime = (consent: any) => {
    const formatDateTime = (dateString: string) => {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: '2-digit'
        }),
        time: date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      };
    };
    if (consent.status === 'granted' && consent.grantedAt) {
      const formatted = formatDateTime(consent.grantedAt);
      return {
        action: 'Granted',
        date: formatted.date,
        time: formatted.time,
        source: consent.source || 'customer-portal'
      };
    } else if ((consent.status === 'revoked' || consent.status === 'withdrawn') && consent.revokedAt) {
      const formatted = formatDateTime(consent.revokedAt);
      return {
        action: 'Withdrawn',
        date: formatted.date,
        time: formatted.time,
        source: consent.source || 'customer-portal'
      };
    } else if (consent.status === 'declined' && consent.deniedAt) {
      const formatted = formatDateTime(consent.deniedAt);
      return {
        action: 'Denied',
        date: formatted.date,
        time: formatted.time,
        source: consent.source || 'customer-portal'
      };
    } else if (consent.grantedAt) {
      const formatted = formatDateTime(consent.grantedAt);
      return {
        action: 'Granted',
        date: formatted.date,
        time: formatted.time,
        source: consent.source || 'customer-portal'
      };
    } else if (consent.validFrom) {
      const formatted = formatDateTime(consent.validFrom);
      return {
        action: 'Created',
        date: formatted.date,
        time: formatted.time,
        source: consent.source || 'system'
      };
    }
    return {
      action: 'Unknown',
      date: 'N/A',
      time: 'N/A',
      source: 'unknown'
    };
  };
  const [itemsPerPage] = useState(5);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingConsent, setEditingConsent] = useState<Consent | null>(null);
  // API hooks
  const { data: partiesData } = useParties();
  const { data: consentsData, loading: consentsLoading, error: consentsError, refetch: refetchConsents } = useConsents();
  const { createConsent, updateConsent } = useConsentMutation();
  // Form state for creating new consent
  const { user } = useAuth();
  const emptyCreateForm = () => ({
    partyId: '',
    purpose: CONSENT_TYPES[0].value as string,
    status: 'granted' as ConsentStatus,
    channel: 'web',
    recordSource: 'admin-dashboard',
    versionAccepted: '1.0',
    consentDateTime: nowLocalInput(),
    withdrawalDateTime: ''
  });
  const [newConsentForm, setNewConsentForm] = useState(emptyCreateForm);
  const [formError, setFormError] = useState('');
  // Form state for editing existing consent
  const [editConsentForm, setEditConsentForm] = useState({
    status: 'granted' as ConsentStatus,
    purpose: '',
    channel: 'web',
    recordSource: 'admin-dashboard',
    versionAccepted: '1.0',
    consentDateTime: '',
    withdrawalDateTime: ''
  });
  // A validation message describes the last submit; drop it as soon as the form changes.
  useEffect(() => { setFormError(''); }, [newConsentForm, editConsentForm]);
  // Transform parties data
  const parties = Array.isArray(partiesData) ? partiesData : 
    (partiesData && (partiesData as any).parties ? (partiesData as any).parties : []);
  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, consentTypeFilter]);
  // WebSocket real-time updates
  useEffect(() => {
    secureLog.log('Admin Dashboard: Setting up WebSocket for real-time consent updates');
    // Join CSR dashboard room for real-time updates
    websocketService.joinCSRDashboard();
    // Listen for consent updates
    const handleConsentUpdate = (event: any) => {
      secureLog.log('Admin Dashboard: Received real-time consent update:', event);
      // Show notification
      const customerName = event.user?.email || 'Unknown Customer';
      const actionType = event.type === 'granted' ? 'granted' : 'revoked';
      const source = event.source === 'csr' ? 'CSR Staff' : 
                    event.source === 'customer' ? 'Customer' : 'System';
      notificationManager.info(
        `Consent ${actionType.charAt(0).toUpperCase() + actionType.slice(1)}`,
        `${customerName} ${actionType} consent${source !== 'System' ? ` via ${source}` : ''}`
      );
      // Refresh the data to get latest updates
      refetchConsents();
      // Update last updated timestamp
      setLastUpdated(new Date());
    };
    // Set up the WebSocket listener
    websocketService.onConsentUpdate(handleConsentUpdate);
    // Cleanup on unmount
    return () => {
      secureLog.log('Admin Dashboard: Cleaning up WebSocket listeners');
      websocketService.leaveCSRDashboard();
    };
  }, [refetchConsents]);
  // Create party lookup map for efficient customer data lookup
  const partyLookup = new Map();
  parties.forEach((party: any) => {
    partyLookup.set(party.id, party);
  });
  // Transform consents data from API
  const rawConsents = Array.isArray(consentsData) ? consentsData : 
    (consentsData && (consentsData as any).consents ? (consentsData as any).consents : []);
  // Helper function to get the latest action timestamp for true chronological sorting
  const getLatestActionTimestamp = (consent: any) => {
    const timestamps = [];
    // Add available timestamps
    if (consent.grantedAt) timestamps.push(new Date(consent.grantedAt).getTime());
    if (consent.revokedAt) timestamps.push(new Date(consent.revokedAt).getTime());
    if (consent.updatedAt) timestamps.push(new Date(consent.updatedAt).getTime());
    if (consent.lastModified) timestamps.push(new Date(consent.lastModified).getTime());
    // Return the most recent timestamp
    return timestamps.length > 0 ? Math.max(...timestamps) : 0;
  };
  // Transform API consent data to match UI interface
  const consents: Consent[] = rawConsents.map((consent: any) => {
    const party = partyLookup.get(consent.partyId) || {};
    // Map status values to UI expectations
    const mapStatus = (status: string) => {
      const statusMap: { [key: string]: string } = {
        'granted': 'active',
        'denied': 'denied',
        'declined': 'denied',
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
      consentType: consent.purpose || consent.type || 'marketing',
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
      source: consent.channel || consent.source || 'web',
      channel: consent.channel || 'web',
      recordSource: consent.recordSource || 'admin-dashboard',
      capturedBy: consent.capturedBy,
      consentDateTime: consent.grantedAt || consent.deniedAt,
      withdrawalDateTime: consent.revokedAt,
      version: consent.versionAccepted || '1.0',
      isRealUser: customerInfo.isRealUser,
      // Preserve raw timestamps for sorting
      grantedAt: consent.grantedAt,
      revokedAt: consent.revokedAt,
      updatedAt: consent.updatedAt
    };
  })
  // Sort to prioritize real MongoDB users first, then by latest action timestamp
  .sort((a: Consent, b: Consent) => {
    // First, sort by whether they are real users (real users first)
    if (a.isRealUser && !b.isRealUser) return -1;
    if (!a.isRealUser && b.isRealUser) return 1;
    // Then sort by latest action timestamp (most recent first)
    const timestampA = getLatestActionTimestamp(a);
    const timestampB = getLatestActionTimestamp(b);
    return timestampB - timestampA;
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
      'denied': 'declined',
      'expired': 'expired',
      'pending': 'pending'
    };
    return reverseStatusMap[uiStatus] || 'granted';
  };
  const handleEditConsent = (consent: Consent) => {
    setEditingConsent(consent);
    setEditConsentForm({
      status: reverseMapStatus(consent.status),
      purpose: consent.consentType,
      channel: consent.channel,
      recordSource: consent.recordSource,
      versionAccepted: consent.version,
      consentDateTime: toLocalInput(consent.consentDateTime),
      withdrawalDateTime: toLocalInput(consent.withdrawalDateTime)
    });
    setFormError('');
    setShowEditModal(true);
  };
  // Shared by create and edit: the checks the PDF's column rules imply.
  const validateForm = (f: { status: ConsentStatus; consentDateTime: string; withdrawalDateTime: string }) => {
    const needsDate = f.status !== 'pending';
    if (needsDate && !f.consentDateTime) return 'Consent date & time is required.';
    if (f.consentDateTime && new Date(f.consentDateTime).getTime() > Date.now()) return 'Consent date & time cannot be in the future.';
    if (f.status === 'revoked') {
      if (!f.withdrawalDateTime) return 'Withdrawal date & time is required for a withdrawn consent.';
      if (new Date(f.withdrawalDateTime) < new Date(f.consentDateTime)) return 'Withdrawal cannot be before the consent date & time.';
      if (new Date(f.withdrawalDateTime).getTime() > Date.now()) return 'Withdrawal date & time cannot be in the future.';
    }
    return '';
  };
  // Only the dates that apply to the chosen status are sent.
  const datesFor = (f: { status: ConsentStatus; consentDateTime: string; withdrawalDateTime: string }) => ({
    consentDateTime: f.status !== 'pending' && f.consentDateTime ? new Date(f.consentDateTime).toISOString() : undefined,
    withdrawalDateTime: f.status === 'revoked' && f.withdrawalDateTime ? new Date(f.withdrawalDateTime).toISOString() : undefined
  });
  const handleCreateConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConsentForm.partyId) {
      setFormError('Please select a customer.');
      return;
    }
    const problem = validateForm(newConsentForm);
    if (problem) {
      setFormError(problem);
      return;
    }
    try {
      const consentData: ConsentCreateRequest = {
        partyId: newConsentForm.partyId,
        purpose: newConsentForm.purpose,
        status: newConsentForm.status,
        channel: newConsentForm.channel,
        recordSource: newConsentForm.recordSource,
        versionAccepted: newConsentForm.versionAccepted,
        ...datesFor(newConsentForm),
        validFor: {
          startDateTime: new Date().toISOString()
        }
      };
      await createConsent(consentData);
      setShowCreateModal(false);
      setNewConsentForm(emptyCreateForm());
      setFormError('');
      alert('Consent created successfully!');
      // Refresh the consents data
      await refetchConsents();
    } catch (error) {
      console.error('Failed to create consent:', error);
      setFormError('Failed to create consent. Please try again.');
    }
  };
  const handleUpdateConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConsent) {
      alert('No consent selected for editing');
      return;
    }
    const problem = validateForm(editConsentForm);
    if (problem) {
      setFormError(problem);
      return;
    }
    try {
      const updates = {
        status: editConsentForm.status,
        purpose: editConsentForm.purpose,
        channel: editConsentForm.channel,
        recordSource: editConsentForm.recordSource,
        versionAccepted: editConsentForm.versionAccepted,
        ...datesFor(editConsentForm)
      };
      await updateConsent(editingConsent.id, updates);
      setShowEditModal(false);
      setEditingConsent(null);
      setFormError('');
      alert('Consent updated successfully!');
      await refetchConsents();
    } catch (error) {
      console.error('Failed to update consent:', error);
      setFormError('Failed to update consent. Please try again.');
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
      consentType: consentTypeLabel(consent.consentType),
      status: statusText(consent.status),
      channel: consentChannelLabel(consent.channel),
      source: consentSourceLabel(consent.recordSource),
      capturedBy: consent.capturedBy,
      consentDateTime: consent.consentDateTime,
      withdrawalDateTime: consent.withdrawalDateTime,
      expiryDate: consent.expiryDate,
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
  // List statuses are display buckets ('active' = granted); label them with the PDF's wording.
  const statusText = (status: string) =>
    consentStatusLabel(({ active: 'granted', denied: 'declined', withdrawn: 'revoked' } as Record<string, string>)[status] ?? status);
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-700" />;
      case 'withdrawn':
      case 'denied':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4 text-amber-700" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-600" />;
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-600/20 text-green-800';
      case 'withdrawn':
      case 'denied':
        return 'bg-red-50 text-red-800';
      case 'expired':
        return 'bg-amber-600/20 text-amber-800';
      case 'pending':
        return 'bg-blue-50/20 text-blue-600';
      default:
        return 'bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600';
    }
  };
  const getConsentTypeColor = (type: string) => {
    switch (type) {
      case 'marketing':
        return 'bg-blue-600/20 text-blue-800';
      case 'analytics':
        return 'bg-blue-50/20 text-blue-600';
      case 'functional':
        return 'bg-green-600/20 text-green-800';
      case 'necessary':
        return 'bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600';
      default:
        return 'bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600';
    }
  };
  // Filter by label so old free-text purposes that read the same as a standard type merge into it.
  const typeOptions = [...new Set([
    ...CONSENT_TYPES.map((o) => o.label),
    ...consents.map((c) => consentTypeLabel(c.consentType))
  ])].map((label) => ({ value: label, label }));
  const filteredConsents = consents.filter(consent => {
    const matchesSearch = consent.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consent.customerId.toLowerCase().includes(searchTerm.toLowerCase());
    // Enhanced status filtering to support granted/revoked
    const matchesStatus = statusFilter === 'all' || consent.status === statusFilter;
    const matchesType = consentTypeFilter === 'all' || consentTypeLabel(consent.consentType) === consentTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });
  const sortedConsents = [...filteredConsents].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'date':
        // Use latest action timestamp for true chronological sorting
        const timestampA = getLatestActionTimestamp(a);
        const timestampB = getLatestActionTimestamp(b);
        comparison = timestampA - timestampB;
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
  const fieldClass = 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
  type ConsentFieldsState = {
    purpose: string;
    status: ConsentStatus;
    channel: string;
    recordSource: string;
    versionAccepted: string;
    consentDateTime: string;
    withdrawalDateTime: string;
  };
  // The CUSTOMER_CONSENT fields from the data model, shared by the create and edit dialogs.
  // `existing` is the record being edited: its current values stay selectable even if they are
  // not in the standard lists, so saving never silently changes them.
  const renderConsentFields = <T extends ConsentFieldsState>(
    prefix: string,
    form: T,
    setForm: (next: T) => void,
    existing?: Consent
  ) => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor={`${prefix}-type`} className="block text-sm font-medium text-gray-700">Consent Type *</label>
          <select id={`${prefix}-type`} value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} className={fieldClass} required>
            {withCurrent(CONSENT_TYPES, existing?.consentType, consentTypeLabel).map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${prefix}-status`} className="block text-sm font-medium text-gray-700">Consent Status *</label>
          <select
            id={`${prefix}-status`}
            value={form.status}
            onChange={(e) => {
              const status = e.target.value as ConsentStatus;
              setForm({ ...form, status, consentDateTime: form.consentDateTime || nowLocalInput() });
            }}
            className={fieldClass}
            required
          >
            {withCurrent(CONSENT_STATUSES, form.status, consentStatusLabel).map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor={`${prefix}-channel`} className="block text-sm font-medium text-gray-700">Channel *</label>
          <select id={`${prefix}-channel`} value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })} className={fieldClass} required>
            {withCurrent(CONSENT_CHANNELS, existing?.channel, consentChannelLabel).map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${prefix}-source`} className="block text-sm font-medium text-gray-700">Source *</label>
          <select id={`${prefix}-source`} value={form.recordSource} onChange={(e) => setForm({ ...form, recordSource: e.target.value })} className={fieldClass} required>
            {withCurrent(CONSENT_SOURCES, existing?.recordSource, consentSourceLabel).map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor={`${prefix}-version`} className="block text-sm font-medium text-gray-700">Scope Version</label>
          <input
            id={`${prefix}-version`}
            type="text"
            value={form.versionAccepted}
            onChange={(e) => setForm({ ...form, versionAccepted: e.target.value })}
            className={fieldClass}
            placeholder="1.0"
            maxLength={20}
          />
        </div>
        {form.status !== 'pending' && (
          <div>
            <label htmlFor={`${prefix}-consent-date`} className="block text-sm font-medium text-gray-700">Consent Date & Time *</label>
            <input
              id={`${prefix}-consent-date`}
              type="datetime-local"
              value={form.consentDateTime}
              max={nowLocalInput()}
              onChange={(e) => setForm({ ...form, consentDateTime: e.target.value })}
              className={fieldClass}
              required
            />
          </div>
        )}
      </div>
      {form.status === 'revoked' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor={`${prefix}-withdrawal-date`} className="block text-sm font-medium text-gray-700">Withdrawal Date & Time *</label>
            <input
              id={`${prefix}-withdrawal-date`}
              type="datetime-local"
              value={form.withdrawalDateTime}
              min={form.consentDateTime || undefined}
              max={nowLocalInput()}
              onChange={(e) => setForm({ ...form, withdrawalDateTime: e.target.value })}
              className={fieldClass}
              required
            />
          </div>
        </div>
      )}
    </>
  );
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Loading State */}
      {consentsLoading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-slate-600">Loading consents...</span>
        </div>
      )}
      {/* Error State */}
      {consentsError && (
        <div className="bg-red-50 border border-red-200 text-slate-900 px-4 py-3 rounded mb-4">
          <p>Error loading consents: {consentsError}</p>
        </div>
      )}
      {/* Main Content - Only show when not loading */}
      {!consentsLoading && (
      <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Consent Management</h1>
          <div className="flex items-center space-x-4 mt-2">
            <p className="text-slate-600">Manage and monitor all customer consents</p>
            <span className="text-xs text-slate-500 flex items-center">
              <RefreshCw className="w-3 h-3 mr-1" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => { setNewConsentForm(emptyCreateForm()); setFormError(''); setShowCreateModal(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
            Create New Consent
          </button>
          <button
            onClick={handleExportData}
            className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium rounded-lg px-4 py-2.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 flex items-center gap-2 whitespace-nowrap"
          >
            <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
            Export
          </button>
        </div>
      </div>

      {/* Bulk actions get their own bar once rows are ticked, rather than being
          squeezed in beside the page actions. */}
      {selectedConsents.size > 0 && (
        <div
          role="region"
          aria-label="Bulk actions"
          className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3"
        >
          <span className="text-sm font-medium text-blue-900 whitespace-nowrap">
            {selectedConsents.size} selected
          </span>
          <span className="flex-1" />
          <button
            onClick={() => handleBulkAction('export')}
            className="bg-white border border-blue-300 text-blue-800 hover:bg-blue-100 text-sm font-medium rounded-lg px-4 py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 whitespace-nowrap"
          >
            Export selected
          </button>
          <button
            onClick={() => handleBulkAction('delete')}
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 whitespace-nowrap"
          >
            Delete selected
          </button>
          <button
            onClick={() => setSelectedConsents(new Set())}
            className="text-sm font-medium text-blue-800 hover:text-blue-900 underline px-2 py-2 whitespace-nowrap"
          >
            Clear
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Active Consents</p>
              <p className="text-2xl font-bold text-green-700">
                {consents.filter(c => c.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Withdrawn</p>
              <p className="text-2xl font-bold text-red-600">
                {consents.filter(c => c.status === 'withdrawn').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Expired</p>
              <p className="text-2xl font-bold text-amber-700">
                {consents.filter(c => c.status === 'expired').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-600/20 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-amber-700" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Consents</p>
              <p className="text-2xl font-bold text-blue-600">{consents.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>
      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
               aria-label="Search customers"/>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                 aria-label="Filter by status">
                  <option value="all">All Status</option>
                  <option value="active">Granted</option>
                  <option value="denied">Denied</option>
                  <option value="withdrawn">Withdrawn</option>
                  <option value="pending">Not Responded</option>
                  <option value="expired">Expired</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
              </div>
              <div className="relative">
                <select
                  value={consentTypeFilter}
                  onChange={(e) => setConsentTypeFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                 aria-label="Filter by type">
                  <option value="all">All Types</option>
                  {typeOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Consents Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Mobile Card View */}
        <div className="block lg:hidden">
          <div className="p-4 space-y-4">
            {paginatedConsents.map((consent) => (
              <div key={consent.id} className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
                <div className="flex flex-wrap gap-4 items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      aria-label={`Select ${consentTypeLabel(consent.consentType)} consent for ${consent.customerName}`}
                      checked={selectedConsents.has(consent.id)}
                      onChange={() => handleSelectConsent(consent.id)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">{consent.customerName}</div>
                      <div className="text-xs text-slate-600">{consent.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => handleViewConsent(consent)}
                      className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition-colors"
                      title="View Details"
                     aria-label="View Details">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEditConsent(consent)}
                      className="text-green-700 hover:text-green-900 p-2 hover:bg-green-50 rounded transition-colors"
                      title="Edit Consent"
                     aria-label="Edit Consent">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-600">Type:</span>
                    <span className={`ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getConsentTypeColor(consent.consentType)}`}>
                      {consentTypeLabel(consent.consentType)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Status:</span>
                    <div className="flex items-center ml-1">
                      {getStatusIcon(consent.status)}
                      <span className={`ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(consent.status)}`}>
                        {statusText(consent.status)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-600">Granted:</span>
                    <span className="ml-1 text-slate-900">{new Date(consent.grantedDate).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Channel:</span>
                    <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-white text-gray-800">
                      {consentChannelLabel(consent.channel)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white border border-slate-200">
              <tr>
                <th scope="col" className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    aria-label="Select all consents"
                    checked={selectedConsents.size === filteredConsents.length && filteredConsents.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                </th>
                <th scope="col" 
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide cursor-pointer hover:bg-slate-100"
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Consent Type
                </th>
                <th scope="col" 
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide cursor-pointer hover:bg-slate-100"
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
                <th scope="col" 
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide cursor-pointer hover:bg-slate-100"
                  onClick={() => {
                    setSortBy('date');
                    setSortOrder(sortBy === 'date' && sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <div className="flex items-center space-x-1">
                    <span>Consent / Withdrawal Date</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${sortBy === 'date' && sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Expiry Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Channel
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedConsents.map((consent) => (
                <tr key={consent.id} className="hover:bg-white border border-slate-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      aria-label={`Select ${consentTypeLabel(consent.consentType)} consent for ${consent.customerName}`}
                      checked={selectedConsents.has(consent.id)}
                      onChange={() => handleSelectConsent(consent.id)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-slate-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">{consent.customerName}</div>
                        <div className="text-sm text-slate-600">{consent.email}</div>
                        <div className="text-xs text-slate-500">{consent.customerId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConsentTypeColor(consent.consentType)}`}>
                      {consentTypeLabel(consent.consentType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(consent.status)}
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(consent.status)}`}>
                        {statusText(consent.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-slate-500 mr-2" />
                      <div>
                        <div className="font-medium">
                          {(() => {
                            const rawConsent = rawConsents.find((c: any) => (c.id || c._id) === consent.id);
                            if (!rawConsent) return new Date(consent.grantedDate).toLocaleDateString();
                            const dateInfo = formatGrantRevokeDateTime(rawConsent);
                            return (
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                dateInfo.action === 'Granted' ? 'bg-green-100 text-green-800' :
                                dateInfo.action === 'Withdrawn' || dateInfo.action === 'Denied' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {dateInfo.action}
                              </span>
                            );
                          })()}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {(() => {
                            const rawConsent = rawConsents.find((c: any) => (c.id || c._id) === consent.id);
                            if (!rawConsent) return new Date(consent.grantedDate).toLocaleDateString();
                            const dateInfo = formatGrantRevokeDateTime(rawConsent);
                            return `${dateInfo.date} at ${dateInfo.time}`;
                          })()}
                        </div>
                        <div className="text-xs text-slate-500">
                          by {(() => {
                            const rawConsent = rawConsents.find((c: any) => (c.id || c._id) === consent.id);
                            if (!rawConsent) return 'Customer';
                            const dateInfo = formatGrantRevokeDateTime(rawConsent);
                            return dateInfo.source === 'csr-dashboard' ? 'CSR Staff' : 
                                   dateInfo.source === 'customer-portal' ? 'Customer' :
                                   dateInfo.source === 'admin-dashboard' ? 'Admin' : 'System';
                          })()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                    {consent.expiryDate ? (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-slate-500 mr-2" />
                        {new Date(consent.expiryDate).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-slate-500">No expiry</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white border border-slate-200 text-gray-800">
                      {consentChannelLabel(consent.channel)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewConsent(consent)}
                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition-colors"
                        title="View Details"
                       aria-label="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditConsent(consent)}
                        className="text-slate-600 hover:text-slate-900 p-1 hover:bg-white border border-slate-200 rounded transition-colors"
                        title="Edit Consent"
                       aria-label="Edit Consent">
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
        <div className="text-sm text-slate-600">
          Showing {sortedConsents.length === 0 ? 0 : Math.min(startIndex + 1, sortedConsents.length)} to {Math.min(endIndex, sortedConsents.length)} of {sortedConsents.length} consents
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-white border-slate-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {pageWindow(currentPage, totalPages).map((page, i) =>
            page === null ? (
              <span key={`gap-${i}`} className="px-1 text-slate-500" aria-hidden="true">…</span>
            ) : (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                aria-current={currentPage === page ? 'page' : undefined}
                aria-label={`Page ${page}`}
                className={`min-w-[44px] px-3 py-2 rounded-lg transition-colors text-sm ${
                  currentPage === page
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            )
          )}
          <button 
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-white border-slate-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
      {/* Consent Details Modal */}
      {showModal && modalData && (
        <div role="dialog" aria-modal="true" aria-label="Consent Details" className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Consent Details</h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white border border-slate-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Customer Information</h4>
                  <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2">
                    <p><span className="font-medium">Name:</span> {modalData.customerName}</p>
                    <p><span className="font-medium">Email:</span> {modalData.email}</p>
                    <p><span className="font-medium">ID:</span> {modalData.customerId}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Consent Details</h4>
                  <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2">
                    <p><span className="font-medium">Type:</span> {consentTypeLabel(modalData.consentType)}</p>
                    <p><span className="font-medium">Status:</span> {statusText(modalData.status)}</p>
                    <p><span className="font-medium">Channel:</span> {consentChannelLabel(modalData.channel)}</p>
                    <p><span className="font-medium">Source:</span> {consentSourceLabel(modalData.recordSource)}</p>
                    <p><span className="font-medium">Captured By:</span> {modalData.capturedBy || '—'}</p>
                    <p><span className="font-medium">Scope Version:</span> {modalData.version}</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Timeline</h4>
                <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2">
                  {(() => {
                    // Find the raw consent for full audit info
                    const rawConsent = rawConsents.find((c: any) => (c.id || c._id) === modalData.id);
                    const dateInfo = rawConsent ? formatGrantRevokeDateTime(rawConsent) : null;
                    return (
                      <>
                        {dateInfo && (
                          <p>
                            <span className="font-medium">{dateInfo.action}:</span> {dateInfo.date} at {dateInfo.time} <span className="text-xs text-slate-500">by {dateInfo.source === 'csr-dashboard' ? 'CSR Staff' : dateInfo.source === 'customer-portal' ? 'Customer' : dateInfo.source === 'admin-dashboard' ? 'Admin' : 'System'}</span>
                          </p>
                        )}
                        {modalData.expiryDate && (
                          <p><span className="font-medium">Expires:</span> {new Date(modalData.expiryDate).toLocaleDateString()}</p>
                        )}
                        <p><span className="font-medium">Last Updated:</span> {new Date(modalData.lastUpdated).toLocaleDateString()}</p>
                      </>
                    );
                  })()}
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
        <div role="dialog" aria-modal="true" aria-label="Create New Consent" className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create New Consent</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-gray-600" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateConsent} noValidate>
              <div className="mb-4">
                <label htmlFor="create-customer" className="block text-sm font-medium text-gray-700">Customer *</label>
                <select
                  id="create-customer"
                  value={newConsentForm.partyId}
                  onChange={(e) => setNewConsentForm({ ...newConsentForm, partyId: e.target.value })}
                  className={fieldClass}
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
              {renderConsentFields('create', newConsentForm, setNewConsentForm)}
              <div className="mb-6">
                <label htmlFor="create-captured-by" className="block text-sm font-medium text-gray-700">Captured By</label>
                <input
                  id="create-captured-by"
                  type="text"
                  value={user?.email || ''}
                  readOnly
                  className={`${fieldClass} bg-gray-50 text-gray-600`}
                />
                <p className="mt-1 text-xs text-slate-600">Recorded automatically from your sign-in.</p>
              </div>
              {formError && (
                <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-slate-900">{formError}</div>
              )}
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
        <div role="dialog" aria-modal="true" aria-labelledby="consentoverviewtable-dialog-3-title" className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 id="consentoverviewtable-dialog-3-title" className="text-lg font-semibold text-gray-900">Edit Consent - {editingConsent.customerName}</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-500 hover:text-gray-600" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateConsent} noValidate>
              <div className="mb-4">
                <span className="block text-sm font-medium text-gray-700">Customer</span>
                <div className="mt-1 p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-600 break-words">
                  {editingConsent.customerName} - {editingConsent.email}
                </div>
              </div>
              {renderConsentFields('edit', editConsentForm, setEditConsentForm, editingConsent)}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Consent Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="min-w-0 sm:col-span-2">
                    <span className="text-gray-600">Consent ID:</span>
                    <div className="font-mono text-gray-900 break-all">{editingConsent.id}</div>
                  </div>
                  <div className="min-w-0">
                    <span className="text-gray-600">Original Date:</span>
                    <div className="text-gray-900">{editingConsent.grantedDate || '—'}</div>
                  </div>
                  <div className="min-w-0">
                    <span className="text-gray-600">Captured By:</span>
                    <div className="text-gray-900 break-words">{editingConsent.capturedBy || '—'}</div>
                  </div>
                </div>
              </div>
              {formError && (
                <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-slate-900">{formError}</div>
              )}
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
