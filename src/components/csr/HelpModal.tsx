import React, { useState } from 'react';
import { HelpCircle, Search, X, User, Shield, Database, Activity } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('overview');

  const helpContent = {
    overview: {
      title: 'CSR Dashboard Overview',
      icon: User,
      content: [
        {
          title: 'Getting Started',
          description: 'Learn how to navigate the CSR dashboard and access key features.',
          steps: [
            'Use the sidebar navigation to switch between different sections',
            'Click on dashboard cards to quickly access related features',
            'Use the search function to find specific customers',
            'Monitor recent activities and notifications in the header'
          ]
        },
        {
          title: 'Dashboard Cards',
          description: 'Interactive cards that provide quick access to key metrics.',
          steps: [
            'Total Customers: Click to access customer search',
            'Pending Requests: View and manage DSAR requests',
            'Consent Updates: Check recent consent modifications',
            'Guardian Managed: Access guardian consent features'
          ]
        }
      ]
    },
    customerSearch: {
      title: 'Customer Search',
      icon: Search,
      content: [
        {
          title: 'Search Functionality',
          description: 'Find customers using multiple search criteria.',
          steps: [
            'Select search type: Email, Phone, Name, or Customer ID',
            'Enter search terms in the input field',
            'Press Enter or click Search button',
            'Click on customer cards to view detailed profiles'
          ]
        },
        {
          title: 'Customer Profile',
          description: 'Access detailed customer information and quick actions.',
          steps: [
            'View customer contact information and details',
            'Use quick action buttons to access related features',
            'Navigate directly to consent history, preferences, or DSAR requests',
            'Use the back button to return to search results'
          ]
        }
      ]
    },
    consentManagement: {
      title: 'Consent Management',
      icon: Shield,
      content: [
        {
          title: 'Consent History',
          description: 'View and manage customer consent records.',
          steps: [
            'Browse all consent records in the table view',
            'Use filters to find specific consent types',
            'View detailed consent information in modal dialogs',
            'Track consent status changes and timestamps'
          ]
        },
        {
          title: 'Preference Management',
          description: 'Update customer communication preferences.',
          steps: [
            'Select a customer to edit preferences',
            'Toggle communication channels (email, SMS, push)',
            'Update topic subscriptions and frequency limits',
            'Save changes and notify the customer'
          ]
        }
      ]
    },
    dsarRequests: {
      title: 'DSAR Requests',
      icon: Database,
      content: [
        {
          title: 'Request Management',
          description: 'Handle data subject access requests efficiently.',
          steps: [
            'View all DSAR requests in the requests panel',
            'Create new requests for customers',
            'Track request status and progress',
            'Assign requests to team members'
          ]
        },
        {
          title: 'Request Types',
          description: 'Different types of DSAR requests and their handling.',
          steps: [
            'Data Export: Provide customer data in readable format',
            'Data Deletion: Remove customer data from systems',
            'Data Rectification: Correct inaccurate customer information',
            'Data Portability: Transfer data to another service'
          ]
        }
      ]
    },
    guardianConsent: {
      title: 'Guardian Consent',
      icon: Shield,
      content: [
        {
          title: 'Guardian Management',
          description: 'Handle consent for minor customers.',
          steps: [
            'Search for minor customers and their guardians',
            'Create new guardian consent records',
            'Verify guardian identity and relationship',
            'Manage consent expiration and renewal'
          ]
        },
        {
          title: 'Verification Process',
          description: 'Verify guardian identity and authority.',
          steps: [
            'Upload identity documents (ID, birth certificate)',
            'Verify guardian relationship to minor',
            'Check document authenticity',
            'Approve or reject guardian consent'
          ]
        }
      ]
    },
    auditLogs: {
      title: 'Audit Logs',
      icon: Activity,
      content: [
        {
          title: 'Activity Monitoring',
          description: 'Track all system activities and changes.',
          steps: [
            'View chronological list of all system activities',
            'Filter by category, severity, or date range',
            'Export audit logs for compliance reporting',
            'Monitor user actions and system changes'
          ]
        },
        {
          title: 'Compliance Reporting',
          description: 'Generate reports for regulatory compliance.',
          steps: [
            'Use date range filters for specific periods',
            'Filter by activity type (consent, DSAR, etc.)',
            'Export filtered results to CSV or PDF',
            'Include audit trails in compliance documentation'
          ]
        }
      ]
    }
  };

  const categories = [
    { id: 'overview', label: 'Dashboard Overview', icon: User },
    { id: 'customerSearch', label: 'Customer Search', icon: Search },
    { id: 'consentManagement', label: 'Consent Management', icon: Shield },
    { id: 'dsarRequests', label: 'DSAR Requests', icon: Database },
    { id: 'guardianConsent', label: 'Guardian Consent', icon: Shield },
    { id: 'auditLogs', label: 'Audit Logs', icon: Activity }
  ];

  const filteredContent = helpContent[activeCategory as keyof typeof helpContent];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <HelpCircle className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">CSR Dashboard Help</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search help..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <nav className="px-2 pb-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeCategory === category.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <category.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{category.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <filteredContent.icon className="w-8 h-8 text-blue-600" />
                <h3 className="text-2xl font-bold text-gray-900">{filteredContent.title}</h3>
              </div>

              <div className="space-y-6">
                {filteredContent.content.map((section, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">{section.title}</h4>
                    <p className="text-gray-600 mb-4">{section.description}</p>
                    <div className="space-y-2">
                      {section.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                            {stepIndex + 1}
                          </div>
                          <p className="text-gray-700">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
