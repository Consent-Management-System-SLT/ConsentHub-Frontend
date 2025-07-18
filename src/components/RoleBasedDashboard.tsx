import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import CustomerDashboard from './CustomerDashboard';
import CSRDashboard from './CSRDashboard';

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
    case 'csradmin':
      return <CSRDashboard/>;
    default:
      return <AdminDashboard />; // Default to admin dashboard
  }
};

export default RoleBasedDashboard;
