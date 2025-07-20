import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CustomerMainDashboard from './customer/CustomerMainDashboard';
import ServerConnectionAlert from './shared/ServerConnectionAlert';

const CustomerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [showConnectionAlert, setShowConnectionAlert] = useState(true);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Please log in to access the customer dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Server Connection Alert */}
      {showConnectionAlert && (
        <ServerConnectionAlert 
          onClose={() => setShowConnectionAlert(false)}
          autoHide={true}
          autoHideDelay={4000}
        />
      )}

      <CustomerMainDashboard 
        customerName={user.name || user.email || 'Customer'} 
        onLogout={logout} 
      />
    </div>
  );
};

export default CustomerDashboard;
