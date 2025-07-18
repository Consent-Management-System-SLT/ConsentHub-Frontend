import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import CustomerMainDashboard from './customer/CustomerMainDashboard';

const CustomerDashboard: React.FC = () => {
  const { user, logout } = useAuth();

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
    <CustomerMainDashboard 
      customerName={user.name || user.email || 'Customer'} 
      onLogout={logout} 
    />
  );
};

export default CustomerDashboard;
