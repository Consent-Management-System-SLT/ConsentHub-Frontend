import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Shield,
  FileText,
  TrendingUp,
  Calendar,
  Clock,
  Users,
  Database,
  Eye,
  Download,
  Filter,
  Search,
  BarChart3,
  PieChart,
  Activity,
  Globe,
  Scale,
  BookOpen
} from 'lucide-react';

interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  type: 'GDPR' | 'CCPA' | 'PDP' | 'PIPEDA' | 'LGPD' | 'Internal';
  jurisdiction: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: string;
  createdBy: string;
  automationEnabled: boolean;
  nextReview: string;
  complianceScore: number;
  affectedDataSubjects: number;
  lastExecuted?: string;
  executionStatus?: 'success' | 'failed' | 'pending';
}

interface ComplianceReport {
  id: string;
  title: string;
  type: 'audit' | 'regulatory' | 'internal' | 'quarterly' | 'annual';
  framework: 'GDPR' | 'CCPA' | 'PDP' | 'PIPEDA' | 'LGPD';
  status: 'draft' | 'under_review' | 'approved' | 'submitted';
  overallScore: number;
  criticalIssues: number;
  reportingPeriod: {
    startDate: string;
    endDate: string;
  };
  generatedBy: string;
  generatedAt: string;
}

interface ComplianceMetrics {
  totalRules: number;
  activeRules: number;
  complianceScore: number;
  criticalIssues: number;
  overdueReviews: number;
  dsarCompliance: number;
  consentCompliance: number;
  dataRetentionCompliance: number;
}

const ComplianceRulesManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rules' | 'reports' | 'metrics' | 'monitoring'>('rules');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState<ComplianceRule | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize sample data directly (not in useEffect to ensure immediate load)
  const sampleRules: ComplianceRule[] = [
    {
      id: '1',
      name: 'GDPR Consent Expiry Automation',
      description: 'Automatically expire marketing consents after 12 months and notify data subjects for renewal',
      status: 'active',
      type: 'GDPR',
      jurisdiction: 'European Union',
      severity: 'high',
      lastUpdated: '2024-01-15',
      createdBy: 'Admin User',
      automationEnabled: true,
      nextReview: '2024-04-15',
      complianceScore: 95,
      affectedDataSubjects: 15420,
      lastExecuted: '2024-01-14',
      executionStatus: 'success'
    },
    {
      id: '2',
      name: 'CCPA Data Retention Policy',
      description: 'Automatically delete customer data after 24 months of inactivity with proper audit trail',
      status: 'active',
      type: 'CCPA',
      jurisdiction: 'California, USA',
      severity: 'critical',
      lastUpdated: '2024-01-10',
      createdBy: 'Compliance Officer',
      automationEnabled: true,
      nextReview: '2024-03-10',
      complianceScore: 88,
      affectedDataSubjects: 8750,
      lastExecuted: '2024-01-09',
      executionStatus: 'success'
    },
    {
      id: '3',
      name: 'Marketing Consent Validation',
      description: 'Require explicit double opt-in consent for all marketing communications with verification',
      status: 'active',
      type: 'Internal',
      jurisdiction: 'Global',
      severity: 'medium',
      lastUpdated: '2024-01-05',
      createdBy: 'Marketing Team',
      automationEnabled: false,
      nextReview: '2024-02-05',
      complianceScore: 92,
      affectedDataSubjects: 25600,
      lastExecuted: '2024-01-04',
      executionStatus: 'success'
    },
    {
      id: '4',
      name: 'Minor Data Protection Rule',
      description: 'Require parental consent and additional verification for users under 16 years old',
      status: 'draft',
      type: 'GDPR',
      jurisdiction: 'European Union',
      severity: 'critical',
      lastUpdated: '2024-01-01',
      createdBy: 'Legal Team',
      automationEnabled: false,
      nextReview: '2024-02-01',
      complianceScore: 75,
      affectedDataSubjects: 450,
      lastExecuted: undefined,
      executionStatus: 'pending'
    },
    {
      id: '5',
      name: 'Data Breach Notification',
      description: 'Automatically detect potential data breaches and notify authorities within 72 hours',
      status: 'active',
      type: 'GDPR',
      jurisdiction: 'European Union',
      severity: 'critical',
      lastUpdated: '2023-12-28',
      createdBy: 'Security Team',
      automationEnabled: true,
      nextReview: '2024-01-28',
      complianceScore: 98,
      affectedDataSubjects: 50000,
      lastExecuted: '2024-01-13',
      executionStatus: 'success'
    },
    {
      id: '6',
      name: 'Cookie Consent Management',
      description: 'Manage cookie consents with granular controls and regular consent refresh',
      status: 'active',
      type: 'GDPR',
      jurisdiction: 'European Union',
      severity: 'medium',
      lastUpdated: '2023-12-20',
      createdBy: 'Web Team',
      automationEnabled: true,
      nextReview: '2024-03-20',
      complianceScore: 85,
      affectedDataSubjects: 32000,
      lastExecuted: '2024-01-12',
      executionStatus: 'failed'
    }
  ];

  const [rules, setRules] = useState<ComplianceRule[]>(sampleRules);
  
  const sampleReports: ComplianceReport[] = [
    {
      id: '1',
      title: 'Q4 2023 GDPR Compliance Report',
      type: 'quarterly',
      framework: 'GDPR',
      status: 'approved',
      overallScore: 94,
      criticalIssues: 2,
      reportingPeriod: {
        startDate: '2023-10-01',
        endDate: '2023-12-31'
      },
      generatedBy: 'Compliance Officer',
      generatedAt: '2024-01-05'
    },
    {
      id: '2',
      title: 'CCPA Annual Audit Report 2023',
      type: 'annual',
      framework: 'CCPA',
      status: 'submitted',
      overallScore: 91,
      criticalIssues: 1,
      reportingPeriod: {
        startDate: '2023-01-01',
        endDate: '2023-12-31'
      },
      generatedBy: 'External Auditor',
      generatedAt: '2024-01-15'
    },
    {
      id: '3',
      title: 'Internal Security Compliance Review',
      type: 'internal',
      framework: 'GDPR',
      status: 'under_review',
      overallScore: 87,
      criticalIssues: 3,
      reportingPeriod: {
        startDate: '2023-12-01',
        endDate: '2023-12-31'
      },
      generatedBy: 'Security Team',
      generatedAt: '2024-01-10'
    }
  ];

  const sampleMetrics: ComplianceMetrics = {
    totalRules: sampleRules.length,
    activeRules: sampleRules.filter(r => r.status === 'active').length,
    complianceScore: 91,
    criticalIssues: 4,
    overdueReviews: 1,
    dsarCompliance: 96,
    consentCompliance: 94,
    dataRetentionCompliance: 89
  };

  const [reports, setReports] = useState<ComplianceReport[]>(sampleReports);
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(sampleMetrics);

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || rule.type === filterType;
    const matchesStatus = filterStatus === 'all' || rule.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'inactive':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'draft':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'GDPR':
        return 'bg-blue-100 text-blue-800';
      case 'CCPA':
        return 'bg-purple-100 text-purple-800';
      case 'PDP':
        return 'bg-indigo-100 text-indigo-800';
      case 'PIPEDA':
        return 'bg-pink-100 text-pink-800';
      case 'LGPD':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-yellow-600';
    if (score >= 75) return 'text-orange-600';
    return 'text-red-600';
  };

  const handleRunRule = (ruleId: string) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setRules(prev => prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, lastExecuted: new Date().toISOString().split('T')[0], executionStatus: 'success' }
          : rule
      ));
      setLoading(false);
    }, 2000);
  };

  const AddRuleModal = () => {
    if (!showAddRuleModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-10 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Add New Compliance Rule</h3>
              <button
                onClick={() => setShowAddRuleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>
          <div className="px-6 py-4">
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter rule name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe the compliance rule"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="GDPR">GDPR</option>
                    <option value="CCPA">CCPA</option>
                    <option value="PDP">PDP</option>
                    <option value="PIPEDA">PIPEDA</option>
                    <option value="LGPD">LGPD</option>
                    <option value="Internal">Internal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jurisdiction</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., European Union, California, Global"
                />
              </div>
            </form>
          </div>
          <div className="px-6 py-4 border-t flex justify-end space-x-3">
            <button
              onClick={() => setShowAddRuleModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Handle rule creation
                setShowAddRuleModal(false);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Rule
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Scale className="text-blue-600" />
                Compliance Management
              </h1>
              <p className="text-gray-600 mt-2">
                Monitor, manage, and enforce compliance rules across your organization
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowReportModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Generate Report
              </button>
              <button
                onClick={() => setShowAddRuleModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Rule
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Dashboard */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overall Compliance Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(metrics.complianceScore)}`}>
                    {metrics.complianceScore}%
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Rules</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.activeRules}/{metrics.totalRules}</p>
                </div>
                <Shield className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Critical Issues</p>
                  <p className="text-2xl font-bold text-red-600">{metrics.criticalIssues}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue Reviews</p>
                  <p className="text-2xl font-bold text-orange-600">{metrics.overdueReviews}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'rules', label: 'Compliance Rules', icon: Settings },
                { id: 'reports', label: 'Reports', icon: FileText },
                { id: 'metrics', label: 'Analytics', icon: BarChart3 },
                { id: 'monitoring', label: 'Real-time Monitoring', icon: Activity }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'rules' && (
              <div>
                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search rules..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="GDPR">GDPR</option>
                    <option value="CCPA">CCPA</option>
                    <option value="PDP">PDP</option>
                    <option value="PIPEDA">PIPEDA</option>
                    <option value="LGPD">LGPD</option>
                    <option value="Internal">Internal</option>
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                {/* Rules Grid */}
                <div className="grid gap-6">
                  {filteredRules.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border">
                      <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Compliance Rules Found</h3>
                      <p className="text-gray-500 mb-4">
                        {rules.length === 0 
                          ? "No compliance rules have been created yet."
                          : "No rules match your current search and filter criteria."
                        }
                      </p>
                      <p className="text-sm text-gray-400">
                        Total rules: {rules.length}, Filtered: {filteredRules.length}
                      </p>
                      <button
                        onClick={() => setShowAddRuleModal(true)}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
                      >
                        <Plus className="w-4 h-4" />
                        Create First Rule
                      </button>
                    </div>
                  ) : (
                    filteredRules.map((rule) => (
                    <div key={rule.id} className="bg-gray-50 border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                            {getStatusIcon(rule.status)}
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(rule.status)}`}>
                              {rule.status.charAt(0).toUpperCase() + rule.status.slice(1)}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${getTypeColor(rule.type)}`}>
                              {rule.type}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${getSeverityColor(rule.severity)}`}>
                              {rule.severity.charAt(0).toUpperCase() + rule.severity.slice(1)}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{rule.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Jurisdiction:</span>
                              <p className="text-gray-600">{rule.jurisdiction}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Compliance Score:</span>
                              <p className={`font-semibold ${getScoreColor(rule.complianceScore)}`}>
                                {rule.complianceScore}%
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Affected Subjects:</span>
                              <p className="text-gray-600">{rule.affectedDataSubjects.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Next Review:</span>
                              <p className="text-gray-600">{new Date(rule.nextReview).toLocaleDateString()}</p>
                            </div>
                          </div>

                          {rule.lastExecuted && (
                            <div className="mt-3 flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-700">Last Executed:</span>
                                <span className="text-gray-600">{new Date(rule.lastExecuted).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-700">Status:</span>
                                <span className={`flex items-center gap-1 ${
                                  rule.executionStatus === 'success' ? 'text-green-600' :
                                  rule.executionStatus === 'failed' ? 'text-red-600' : 'text-yellow-600'
                                }`}>
                                  {rule.executionStatus === 'success' && <CheckCircle className="w-4 h-4" />}
                                  {rule.executionStatus === 'failed' && <XCircle className="w-4 h-4" />}
                                  {rule.executionStatus === 'pending' && <Clock className="w-4 h-4" />}
                                  {rule.executionStatus ? rule.executionStatus.charAt(0).toUpperCase() + rule.executionStatus.slice(1) : 'Unknown'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          {rule.automationEnabled && (
                            <button
                              onClick={() => handleRunRule(rule.id)}
                              disabled={loading}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                              title="Run Rule"
                            >
                              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedRule(rule)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedRule(rule)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            title="Edit Rule"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this rule?')) {
                                setRules(prev => prev.filter(r => r.id !== rule.id));
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete Rule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Compliance Reports</h3>
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Generate New Report
                  </button>
                </div>

                <div className="grid gap-6">
                  {reports.map((report) => (
                    <div key={report.id} className="bg-gray-50 border rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">{report.title}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${getTypeColor(report.framework)}`}>
                              {report.framework}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(report.status)}`}>
                              {report.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                            <div>
                              <span className="font-medium text-gray-700">Overall Score:</span>
                              <p className={`font-semibold ${getScoreColor(report.overallScore)}`}>
                                {report.overallScore}%
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Critical Issues:</span>
                              <p className="text-red-600 font-semibold">{report.criticalIssues}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Reporting Period:</span>
                              <p className="text-gray-600">
                                {new Date(report.reportingPeriod.startDate).toLocaleDateString()} - {new Date(report.reportingPeriod.endDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Generated:</span>
                              <p className="text-gray-600">{new Date(report.generatedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'metrics' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Compliance Analytics</h3>
                
                {metrics && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-50 border rounded-lg p-6">
                      <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-blue-600" />
                        Compliance Scores by Category
                      </h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">DSAR Compliance</span>
                          <span className={`font-semibold ${getScoreColor(metrics.dsarCompliance)}`}>
                            {metrics.dsarCompliance}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Consent Management</span>
                          <span className={`font-semibold ${getScoreColor(metrics.consentCompliance)}`}>
                            {metrics.consentCompliance}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Data Retention</span>
                          <span className={`font-semibold ${getScoreColor(metrics.dataRetentionCompliance)}`}>
                            {metrics.dataRetentionCompliance}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 border rounded-lg p-6">
                      <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        Compliance Trends
                      </h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">This Month</span>
                          <span className="text-green-600 font-semibold">+2.5%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Last 3 Months</span>
                          <span className="text-green-600 font-semibold">+8.2%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Year to Date</span>
                          <span className="text-green-600 font-semibold">+12.1%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'monitoring' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Real-time Compliance Monitoring
                </h3>
                
                <div className="grid gap-6">
                  <div className="bg-gray-50 border rounded-lg p-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Active Monitoring</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-gray-700">Consent Validation Service</span>
                        </div>
                        <span className="text-green-600 text-sm">Active</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-gray-700">Data Retention Monitor</span>
                        </div>
                        <span className="text-green-600 text-sm">Active</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                          <span className="text-gray-700">DSAR Processing Monitor</span>
                        </div>
                        <span className="text-yellow-600 text-sm">Warning</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 border rounded-lg p-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Recent Alerts</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Consent expiration approaching</p>
                          <p className="text-xs text-gray-600">450 marketing consents expire in next 7 days</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <Users className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">High DSAR volume detected</p>
                          <p className="text-xs text-gray-600">25% increase in data subject access requests this week</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
      </div>

      <AddRuleModal />
    </div>
  );
};

export default ComplianceRulesManager;
