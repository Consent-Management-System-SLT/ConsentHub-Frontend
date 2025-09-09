import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  TrendingUp, 
  Calendar,
  Clock,
  Smartphone,
  Settings,
  BarChart3,
  Filter,
  Download,
  Upload,
  Star,
  DollarSign,
  Package,
  Activity,
  History,
  User,
  X
} from 'lucide-react';
import { multiServiceApiClient } from '../../services/multiServiceApiClient';

interface VASService {
  id: string;
  name: string;
  description: string;
  category: string;
  provider: string;
  price: string;
  popularity: number;
  features: string[];
  benefits: string[];
  status: 'active' | 'inactive' | 'deprecated';
  totalSubscribers: number;
  monthlyRevenue: number;
  createdAt: string;
  updatedAt: string;
}

interface VASSubscription {
  id: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  serviceId: string;
  serviceName: string;
  isSubscribed: boolean;
  subscriptionDate: string;
  lastUpdated: string;
  action: 'subscribe' | 'unsubscribe';
  updatedBy: string;
  subscriptionHistory: Array<{
    action: string;
    timestamp: string;
    updatedBy: string;
    requestInfo?: any;
  }>;
}

interface CustomerVASData {
  customerId: string;
  customerEmail: string;
  customerName: string;
  activeServices: number;
  monthlyValue: number;
  totalSpent: number;
  subscriptions: VASSubscription[];
}

const VASManagement: React.FC = () => {
  // No need for getAuthToken anymore since we're using multiServiceApiClient
  
  // State for tabs
  const [activeTab, setActiveTab] = useState<'services' | 'subscriptions' | 'analytics' | 'history'>('services');
  
  // State for VAS Services Management
  const [vasServices, setVasServices] = useState<VASService[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  
  // State for Customer Subscriptions
  const [customerSubscriptions, setCustomerSubscriptions] = useState<CustomerVASData[]>([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  
  // State for Subscription History
  const [subscriptionHistory, setSubscriptionHistory] = useState<VASSubscription[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // UI states
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedService, setSelectedService] = useState<VASService | null>(null);

  // Create/Edit form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'entertainment',
    provider: '',
    price: '',
    features: [''],
    benefits: [''],
    popularity: 0,
    status: 'active'
  });

  useEffect(() => {
    fetchVASServices();
  }, []);

  useEffect(() => {
    if (activeTab === 'subscriptions') {
      fetchCustomerSubscriptions();
    } else if (activeTab === 'history') {
      fetchSubscriptionHistory();
    }
  }, [activeTab]);

  // Reset form when modals close
  useEffect(() => {
    if (!showCreateModal && !showEditModal) {
      setFormData({
        name: '',
        description: '',
        category: 'entertainment',
        provider: '',
        price: '',
        features: [''],
        benefits: [''],
        popularity: 0,
        status: 'active'
      });
      setSelectedService(null);
    }
  }, [showCreateModal, showEditModal]);

  // Set form data when editing
  useEffect(() => {
    if (selectedService && showEditModal) {
      setFormData({
        name: selectedService.name,
        description: selectedService.description,
        category: selectedService.category,
        provider: selectedService.provider,
        price: selectedService.price,
        features: selectedService.features,
        benefits: selectedService.benefits,
        popularity: selectedService.popularity,
        status: selectedService.status
      });
    }
  }, [selectedService, showEditModal]);

  useEffect(() => {
    fetchVASServices();
  }, []);

  useEffect(() => {
    if (activeTab === 'subscriptions') {
      fetchCustomerSubscriptions();
    } else if (activeTab === 'history') {
      fetchSubscriptionHistory();
    }
  }, [activeTab]);

  const fetchVASServices = async () => {
    try {
      setLoadingServices(true);
      setError(null);
      
      const result = await multiServiceApiClient.makeRequest(
        'GET',
        '/api/admin/vas/services',
        undefined,
        'admin',
        'gateway'
      );

      if (result.success) {
        setVasServices(result.data || []);
        console.log('VAS Services loaded:', result.data?.length, 'services');
      } else {
        setError(result.message || 'Failed to fetch VAS services');
      }
    } catch (error) {
      console.error('Error fetching VAS services:', error);
      setError('Network error while fetching VAS services');
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchCustomerSubscriptions = async () => {
    try {
      setLoadingSubscriptions(true);
      setError(null);
      
      const result = await multiServiceApiClient.makeRequest(
        'GET',
        '/api/admin/vas/subscriptions',
        undefined,
        'admin',
        'gateway'
      );

      if (result.success) {
        setCustomerSubscriptions(result.data || []);
      } else {
        setError(result.message || 'Failed to fetch customer subscriptions');
      }
    } catch (error) {
      console.error('Error fetching customer subscriptions:', error);
      setError('Network error while fetching customer subscriptions');
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  const fetchSubscriptionHistory = async () => {
    try {
      setLoadingHistory(true);
      setError(null);
      
      const result = await multiServiceApiClient.makeRequest(
        'GET',
        '/api/admin/vas/analytics',
        undefined,
        'admin',
        'gateway'
      );

      if (result.success) {
        setSubscriptionHistory(result.data?.subscriptionHistory || []);
      } else {
        setError(result.message || 'Failed to fetch subscription history');
      }
    } catch (error) {
      console.error('Error fetching subscription history:', error);
      setError('Network error while fetching subscription history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCreateService = async (serviceData: Partial<VASService>) => {
    try {
      const result = await multiServiceApiClient.makeRequest(
        'POST',
        '/api/admin/vas/services',
        serviceData,
        'admin',
        'gateway'
      );

      if (result.success) {
        // Refresh the entire services list to ensure consistency
        await fetchVASServices();
        setShowCreateModal(false);
        setError(null);
      } else {
        setError(result.message || 'Failed to create VAS service');
      }
    } catch (error) {
      console.error('Error creating VAS service:', error);
      setError('Network error while creating VAS service');
    }
  };

  const handleUpdateService = async (serviceId: string, serviceData: Partial<VASService>) => {
    try {
      const result = await multiServiceApiClient.makeRequest(
        'PUT',
        `/api/admin/vas/services/${serviceId}`,
        serviceData,
        'admin',
        'gateway'
      );

      if (result.success) {
        // Refresh the entire services list to ensure consistency
        await fetchVASServices();
        setShowEditModal(false);
        setSelectedService(null);
        setError(null);
      } else {
        setError(result.message || 'Failed to update VAS service');
      }
    } catch (error) {
      console.error('Error updating VAS service:', error);
      setError('Network error while updating VAS service');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this VAS service? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await multiServiceApiClient.makeRequest(
        'DELETE',
        `/api/admin/vas/services/${serviceId}`,
        undefined,
        'admin',
        'gateway'
      );

      if (result.success) {
        // Refresh the entire services list to ensure consistency
        await fetchVASServices();
        setError(null);
      } else {
        setError(result.message || 'Failed to delete VAS service');
      }
    } catch (error) {
      console.error('Error deleting VAS service:', error);
      setError('Network error while deleting VAS service');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.description || !formData.provider || !formData.price) {
      setError('Please fill in all required fields');
      return;
    }

    const serviceData = {
      ...formData,
      features: formData.features.filter(f => f.trim() !== ''),
      benefits: formData.benefits.filter(b => b.trim() !== ''),
    };

    if (selectedService) {
      await handleUpdateService(selectedService.id, serviceData);
    } else {
      await handleCreateService(serviceData);
    }
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }));
  };

  const addBenefit = () => {
    setFormData(prev => ({
      ...prev,
      benefits: [...prev.benefits, '']
    }));
  };

  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const updateBenefit = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.map((b, i) => i === index ? value : b)
    }));
  };

  const filteredServices = vasServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || service.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(vasServices.map(service => service.category))];

  const ServiceCard: React.FC<{ service: VASService }> = ({ service }) => (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
            <p className="text-sm text-gray-600">{service.provider}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            service.status === 'active' ? 'bg-green-100 text-green-800' :
            service.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {service.status}
          </span>
        </div>
      </div>

      <p className="text-gray-600 mb-4">{service.description}</p>

      <div className="flex items-center justify-between mb-4">
        <span className="text-lg font-bold text-gray-900">{service.price}</span>
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-sm text-gray-600">{service.popularity}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{service.totalSubscribers}</div>
          <div className="text-sm text-gray-600">Subscribers</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">LKR {service.monthlyRevenue}</div>
          <div className="text-sm text-gray-600">Monthly Revenue</div>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => {
            setSelectedService(service);
            setShowEditModal(true);
          }}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
        >
          <Edit className="w-4 h-4" />
          <span>Edit</span>
        </button>
        <button
          onClick={() => handleDeleteService(service.id)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const SubscriptionRow: React.FC<{ subscription: CustomerVASData }> = ({ subscription }) => (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{subscription.customerName}</div>
            <div className="text-sm text-gray-500">{subscription.customerEmail}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {subscription.activeServices}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        LKR {subscription.monthlyValue}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        LKR {subscription.totalSpent}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button className="text-blue-600 hover:text-blue-900">
          <Eye className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">VAS Management</h1>
        <p className="text-gray-600">Manage Value Added Services and customer subscriptions</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-600">
              <span className="text-sm">{error}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('services')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'services'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Services</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'subscriptions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Customer Subscriptions</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <History className="w-4 h-4" />
              <span>Subscription History</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div>
          {/* Services Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="deprecated">Deprecated</option>
              </select>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Service</span>
            </button>
            <button
              onClick={fetchVASServices}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Activity className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>

          {/* Services Count */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing {filteredServices.length} of {vasServices.length} services
            </p>
          </div>

          {/* Services Grid */}
          {loadingServices ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map(service => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Customer Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div>
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Customer Subscriptions</h3>
            </div>
            {loadingSubscriptions ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Active Services
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monthly Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Spent
                      </th>
                      <th className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customerSubscriptions.map(subscription => (
                      <SubscriptionRow key={subscription.customerId} subscription={subscription} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Services</dt>
                  <dd className="text-lg font-medium text-gray-900">{vasServices.length}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Subscribers</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {vasServices.reduce((sum, service) => sum + service.totalSubscribers, 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Monthly Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    LKR {vasServices.reduce((sum, service) => sum + service.monthlyRevenue, 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg. Popularity</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {vasServices.length > 0 
                      ? Math.round(vasServices.reduce((sum, service) => sum + service.popularity, 0) / vasServices.length)
                      : 0}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Subscription History</h3>
          </div>
          {loadingHistory ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updated By
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subscriptionHistory.map(history => (
                    <tr key={history.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(history.lastUpdated).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{history.customerName}</div>
                        <div className="text-sm text-gray-500">{history.customerEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {history.serviceName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          history.action === 'subscribe' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {history.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {history.updatedBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* Create/Edit Service Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedService ? 'Edit VAS Service' : 'Create New VAS Service'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter service name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Provider *
                  </label>
                  <input
                    type="text"
                    value={formData.provider}
                    onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Service provider"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="entertainment">Entertainment</option>
                    <option value="security">Security</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="cloud">Cloud Services</option>
                    <option value="connectivity">Connectivity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="LKR 299/month"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Popularity (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.popularity}
                    onChange={(e) => setFormData(prev => ({ ...prev, popularity: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="85"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' | 'deprecated' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="deprecated">Deprecated</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter service description"
                  required
                />
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Features
                </label>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Feature ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="text-red-600 hover:text-red-800"
                        disabled={formData.features.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeature}
                    className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Feature</span>
                  </button>
                </div>
              </div>

              {/* Benefits */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Benefits
                </label>
                <div className="space-y-2">
                  {formData.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={benefit}
                        onChange={(e) => updateBenefit(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Benefit ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeBenefit(index)}
                        className="text-red-600 hover:text-red-800"
                        disabled={formData.benefits.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addBenefit}
                    className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Benefit</span>
                  </button>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {selectedService ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VASManagement;
