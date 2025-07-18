import React from 'react';
import CustomerMainDashboard from './CustomerMainDashboard';

// Demo component to showcase the Customer Dashboard
const CustomerDashboardDemo: React.FC = () => {
  const mockCustomer = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+94 77 123 4567",
    customerId: "CUST-001234"
  };

  const handleLogout = () => {
    alert('Logout functionality would redirect to login page');
    console.log('Customer logged out');
  };

  return (
    <div>
      <CustomerMainDashboard 
        customerName={mockCustomer.name}
        onLogout={handleLogout}
      />
    </div>
  );
};

export default CustomerDashboardDemo;
