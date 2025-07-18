import React, { useState } from 'react';
import { Navigation } from './Navigation';
import { CustomerSearch } from './CustomerSearch';
import { ConsentManagement } from './ConsentManagement';
import { CommunicationPreferences } from './CommunicationPreferences';
import { PrivacyNotices } from './PrivacyNotices';
import { AuditTrail } from './AuditTrail';
import { DSARRequests } from './DSARRequests';
import { Party } from '../types/consent';

const CSRDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [selectedCustomer, setSelectedCustomer] = useState<Party | undefined>();

  const renderContent = () => {
    switch (activeTab) {
      case 'search':
        return (
          <CustomerSearch 
            onCustomerSelect={setSelectedCustomer} 
            selectedCustomer={selectedCustomer}
          />
        );
      case 'consents':
        return <ConsentManagement selectedCustomer={selectedCustomer} />;
      case 'preferences':
        return <CommunicationPreferences selectedCustomer={selectedCustomer} />;
      case 'notices':
        return <PrivacyNotices />;
      case 'audit':
        return <AuditTrail selectedCustomer={selectedCustomer} />;
      case 'dsar':
        return <DSARRequests selectedCustomer={selectedCustomer} />;
      default:
        return <CustomerSearch onCustomerSelect={setSelectedCustomer} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default CSRDashboard;
