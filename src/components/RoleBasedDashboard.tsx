import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import CustomerDashboard from './CustomerDashboard';
import CSRDashboard from './CSRDashboard';
import EnterpriseDashboard from './enterprise/EnterpriseDashboard';

const RoleBasedDashboard: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) {
    return null;
  }
  
  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'customer':
      return <CustomerDashboard />;
    case 'csr':
      return <CSRDashboard />;
    case 'enterprise':
      return <EnterpriseDashboard />;
    default:
      // Never fall through to the admin dashboard for an unrecognised role.
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md text-center">
            <h1 className="text-xl font-semibold text-slate-900 mb-2">
              No dashboard available
            </h1>
            <p className="text-sm text-slate-600">
              Your account role ({user.role}) has no dashboard assigned. Please
              contact your administrator.
            </p>
          </div>
        </div>
      );
  }
};

export default RoleBasedDashboard;