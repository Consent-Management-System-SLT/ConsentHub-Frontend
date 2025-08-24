import React, { useState, useEffect } from 'react';
import { Users, Search, Eye, Shield, Calendar, Phone, Mail, RefreshCw, Filter, UserPlus, X } from 'lucide-react';
import { useCRUDNotifications } from '../shared/withNotifications';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string | null;
  createdAt: string;
  emailVerified?: boolean;
  // Customer-specific metrics
  totalConsents: number;
  activeConsents: number;
  totalPreferences: number;
  activePreferences: number;
  dsarRequests: number;
  lastActivity: string;
}

const CustomerManagement: React.FC = () => {
  const { notifyCustom } = useCRUDNotifications();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);

  useEffect(() => {
    fetchCustomers();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchCustomers, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCustomers = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('authToken');
      
      // Fetch all users and filter customers
      const response = await fetch('http://localhost:3001/api/v1/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch customers: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Filter only customer role users and enhance with metrics
      const customerUsers = (data.users || [])
        .filter((user: any) => user.role === 'customer')
        .map((user: any) => ({
          id: user.id || user._id,
          name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          email: user.email || '',
          phone: user.phone || '',
          company: user.company || 'Individual',
          status: user.status || 'active',
          lastLogin: user.lastLoginAt || user.lastLogin,
          createdAt: user.createdAt,
          emailVerified: user.emailVerified || false,
          // Mock metrics - in real implementation, these would come from separate API calls
          totalConsents: Math.floor(Math.random() * 10) + 1,
          activeConsents: Math.floor(Math.random() * 8) + 1,
          totalPreferences: Math.floor(Math.random() * 6) + 1,
          activePreferences: Math.floor(Math.random() * 4) + 1,
          dsarRequests: Math.floor(Math.random() * 3),
          lastActivity: user.lastLoginAt || user.createdAt
        }));

      setCustomers(customerUsers);
      
      notifyCustom(
        'system',
        'info',
        'Customer Data Refreshed',
        `Loaded ${customerUsers.length} customers successfully`,
        { source: 'customer_management' }
      );

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch customers';
      setError(errorMessage);
      console.error('Customer fetch error:', err);
      
      notifyCustom(
        'system',
        'urgent',
        'Customer Data Error',
        errorMessage,
        { source: 'customer_management' }
      );
    } finally {
      setLoading(false);
    }
  };

  const viewCustomerDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status as keyof typeof statusClasses] || statusClasses.inactive}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Filter customers based on search and status
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (customer.phone && customer.phone.includes(searchTerm));
    
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-myslt-text-primary flex items-center gap-2">
            <Users className="w-8 h-8 text-myslt-primary" />
            Customer Management
          </h1>
          <p className="text-myslt-text-secondary mt-1">
            Manage all customer accounts and view their consent & preference data
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={fetchCustomers}
            className="flex items-center gap-2 px-4 py-2 bg-myslt-primary text-white rounded-lg hover:bg-myslt-primary-dark transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-myslt-accent/20 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-myslt-text-secondary">Total Customers</p>
              <p className="text-xl font-bold text-myslt-text-primary">{customers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-myslt-accent/20 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserPlus className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-myslt-text-secondary">Active Customers</p>
              <p className="text-xl font-bold text-myslt-text-primary">
                {customers.filter(c => c.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-myslt-accent/20 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-myslt-text-secondary">Avg Consents</p>
              <p className="text-xl font-bold text-myslt-text-primary">
                {customers.length > 0 ? Math.round(customers.reduce((sum, c) => sum + c.totalConsents, 0) / customers.length) : 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-myslt-accent/20 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-myslt-text-secondary">New This Month</p>
              <p className="text-xl font-bold text-myslt-text-primary">
                {customers.filter(c => new Date(c.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-myslt-text-secondary" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-myslt-accent/30 rounded-lg focus:ring-2 focus:ring-myslt-primary focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-myslt-text-secondary" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-myslt-accent/30 rounded-lg focus:ring-2 focus:ring-myslt-primary focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Customer Table */}
      <div className="bg-white rounded-lg border border-myslt-accent/20 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-myslt-accent/5">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-myslt-text-secondary">Customer</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-myslt-text-secondary">Contact</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-myslt-text-secondary">Status</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-myslt-text-secondary">Consents</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-myslt-text-secondary">Preferences</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-myslt-text-secondary">Last Activity</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-myslt-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-myslt-accent/10">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-myslt-accent/5">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-myslt-text-primary">{customer.name}</div>
                      <div className="text-sm text-myslt-text-secondary">{customer.company}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-3 h-3" />
                        {customer.email}
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-sm text-myslt-text-secondary">
                          <Phone className="w-3 h-3" />
                          {customer.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(customer.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium">{customer.activeConsents}/{customer.totalConsents}</div>
                      <div className="text-myslt-text-secondary">active/total</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium">{customer.activePreferences}/{customer.totalPreferences}</div>
                      <div className="text-myslt-text-secondary">active/total</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-myslt-text-secondary">
                    {formatDate(customer.lastActivity)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => viewCustomerDetails(customer)}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-myslt-primary text-white rounded hover:bg-myslt-primary-dark transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-myslt-text-secondary mx-auto mb-4" />
              <p className="text-myslt-text-secondary">
                {searchTerm || statusFilter !== 'all' ? 'No customers match your filters' : 'No customers found'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Customer Details Modal */}
      {showCustomerDetails && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-myslt-text-primary">Customer Details</h2>
              <button
                onClick={() => setShowCustomerDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-myslt-text-secondary mb-1">Name</label>
                  <p className="text-myslt-text-primary">{selectedCustomer.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-myslt-text-secondary mb-1">Email</label>
                  <p className="text-myslt-text-primary">{selectedCustomer.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-myslt-text-secondary mb-1">Phone</label>
                  <p className="text-myslt-text-primary">{selectedCustomer.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-myslt-text-secondary mb-1">Company</label>
                  <p className="text-myslt-text-primary">{selectedCustomer.company}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-myslt-text-secondary mb-1">Status</label>
                  {getStatusBadge(selectedCustomer.status)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-myslt-text-secondary mb-1">Member Since</label>
                  <p className="text-myslt-text-primary">{formatDate(selectedCustomer.createdAt)}</p>
                </div>
              </div>

              {/* Activity Summary */}
              <div className="border-t pt-6">
                <h3 className="font-medium text-myslt-text-primary mb-4">Activity Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{selectedCustomer.totalConsents}</div>
                    <div className="text-sm text-blue-800">Total Consents</div>
                    <div className="text-xs text-blue-600">{selectedCustomer.activeConsents} active</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{selectedCustomer.totalPreferences}</div>
                    <div className="text-sm text-green-800">Total Preferences</div>
                    <div className="text-xs text-green-600">{selectedCustomer.activePreferences} active</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{selectedCustomer.dsarRequests}</div>
                    <div className="text-sm text-purple-800">DSAR Requests</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
