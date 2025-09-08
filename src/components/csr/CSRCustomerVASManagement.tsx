import React, { useState, useEffect } from 'react';
import { 
  Search, 
  User, 
  Mail, 
  Phone, 
  Settings, 
  RefreshCw,
  AlertCircle,
  X
} from 'lucide-react';
import { csrDashboardService, CustomerData } from '../../services/csrDashboardService';
import { websocketService, VASSubscriptionUpdate } from '../../services/websocketService';

interface VASService {
  id: string;
  name: string;
  description: string;
  category: string;
  provider: string;
  price: string;
  features: string[];
  isSubscribed: boolean;
  popularity: number;
  benefits: string[];
}

const CSRCustomerVASManagement: React.FC = () => {
  // Search and customer selection state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<CustomerData[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  
  // VAS services state
  const [vasServices, setVasServices] = useState<VASService[]>([]);
  
  // UI state
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingVAS, setIsLoadingVAS] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Statistics
  const [stats, setStats] = useState({
    totalServices: 0,
    activeSubscriptions: 0,
    availableServices: 0
  });

  // Handle customer search
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setSelectedCustomer(null);
      setVasServices([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      console.log('🔍 [CSR VAS] Searching for customers:', searchTerm);
      const customers = await csrDashboardService.searchCustomers(searchTerm);
      
      setSearchResults(customers);
      
      // If only one result, auto-select it
      if (customers.length === 1) {
        await handleSelectCustomer(customers[0]);
      }
      
      console.log(`🔍 [CSR VAS] Found ${customers.length} customers`);
    } catch (error) {
      console.error('🚨 [CSR VAS] Search failed:', error);
      setError('Failed to search customers. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle customer selection and load their VAS services
  const handleSelectCustomer = async (customer: CustomerData) => {
    console.log('👤 [CSR VAS] Selecting customer:', customer.name);
    setSelectedCustomer(customer);
    setVasServices([]);
    setIsLoadingVAS(true);
    setError(null);

    try {
      const response = await csrDashboardService.getCustomerVASServices(
        customer.id, 
        customer.email
      );
      
      const responseData = response as any;
      const services = responseData.services || responseData.data || [];
      setVasServices(services);
      
      // Update statistics
      const activeCount = services.filter((s: VASService) => s.isSubscribed).length;
      setStats({
        totalServices: services.length,
        activeSubscriptions: activeCount,
        availableServices: services.length - activeCount
      });
      
      console.log(`📊 [CSR VAS] Loaded ${services.length} services (${activeCount} active) for ${customer.name}`);
      
    } catch (error) {
      console.error('🚨 [CSR VAS] Failed to load customer VAS services:', error);
      setError('Failed to load customer VAS services. Please try again.');
    } finally {
      setIsLoadingVAS(false);
    }
  };

  // Handle VAS subscription toggle
  const handleVASToggle = async (serviceId: string, currentStatus: boolean) => {
    if (!selectedCustomer) return;

    setIsUpdating(serviceId);
    setError(null);

    try {
      const action = currentStatus ? 'unsubscribe' : 'subscribe';
      
      console.log(`🔄 [CSR VAS] ${action}ing customer ${selectedCustomer.name} ${action === 'subscribe' ? 'to' : 'from'} service ${serviceId}`);
      
      await csrDashboardService.toggleCustomerVASSubscription(
        selectedCustomer.id,
        selectedCustomer.email,
        serviceId,
        action
      );
      
      // Update local state
      setVasServices(prev => prev.map(service => 
        service.id === serviceId 
          ? { ...service, isSubscribed: !currentStatus }
          : service
      ));

      // Update statistics
      const newActiveCount = vasServices.filter(s => 
        s.id === serviceId ? !currentStatus : s.isSubscribed
      ).length;
      
      setStats(prev => ({
        ...prev,
        activeSubscriptions: newActiveCount,
        availableServices: prev.totalServices - newActiveCount
      }));

      console.log(`✅ [CSR VAS] Successfully ${action}d ${serviceId} for ${selectedCustomer.name}`);
      
    } catch (error) {
      console.error('🚨 [CSR VAS] Failed to update VAS subscription:', error);
      setError(`Failed to ${currentStatus ? 'unsubscribe from' : 'subscribe to'} service. Please try again.`);
    } finally {
      setIsUpdating(null);
    }
  };

  // Handle search on Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Clear search and selection
  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setSelectedCustomer(null);
    setVasServices([]);
    setError(null);
  };

  // WebSocket real-time updates
  useEffect(() => {
    const handleVASUpdate = (update: VASSubscriptionUpdate) => {
      if (selectedCustomer && update.customerId === selectedCustomer.id) {
        console.log('🔄 [CSR VAS] Real-time VAS update received:', update);
        
        setVasServices(prev => prev.map(service => 
          service.id === update.serviceId 
            ? { ...service, isSubscribed: update.isSubscribed }
            : service
        ));

        // Update statistics
        const updatedServices = vasServices.map(service => 
          service.id === update.serviceId 
            ? { ...service, isSubscribed: update.isSubscribed }
            : service
        );
        const newActiveCount = updatedServices.filter(s => s.isSubscribed).length;
        
        setStats(prev => ({
          ...prev,
          activeSubscriptions: newActiveCount,
          availableServices: prev.totalServices - newActiveCount
        }));
      }
    };

    websocketService.onCSRVASUpdate(handleVASUpdate);

    return () => {
      websocketService.offCSRVASUpdate();
    };
  }, [selectedCustomer, vasServices]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-lg">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">VAS Management</h1>
              <p className="text-sm text-gray-500">Search and manage customer Value Added Services</p>
            </div>
          </div>
          {selectedCustomer && (
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span className="font-medium">Managing:</span>
                <span className="text-blue-600">{selectedCustomer.name}</span>
              </div>
            </div>
          )}
        </div>

        {/* Search Section */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search customer by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchTerm.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSearching ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Search</span>
          </button>
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="px-3 py-2 text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && !selectedCustomer && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Results</h2>
          <div className="space-y-3">
            {searchResults.map((customer) => (
              <div
                key={customer.id}
                onClick={() => handleSelectCustomer(customer)}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{customer.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Mail className="w-3 h-3" />
                          <span>{customer.email}</span>
                        </span>
                        {customer.phone && (
                          <span className="flex items-center space-x-1">
                            <Phone className="w-3 h-3" />
                            <span>{customer.phone}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    customer.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {customer.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VAS Services Management */}
      {selectedCustomer && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                VAS Services for {selectedCustomer.name}
              </h2>
              <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Active:</span> {stats.activeSubscriptions} / {stats.totalServices}
              </div>
              <button
                onClick={() => handleSelectCustomer(selectedCustomer)}
                disabled={isLoadingVAS}
                className="flex items-center space-x-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingVAS ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {isLoadingVAS ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading VAS services...</span>
            </div>
          ) : vasServices.length === 0 ? (
            <div className="text-center py-12">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No VAS Services</h3>
              <p className="text-gray-500">No Value Added Services available for this customer.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {vasServices.map((service) => (
                <div
                  key={service.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    service.isSubscribed 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{service.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded">{service.category}</span>
                        <span>{service.price}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${
                      service.isSubscribed ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {service.isSubscribed ? 'Active' : 'Available'}
                    </span>
                    
                    <button
                      onClick={() => handleVASToggle(service.id, service.isSubscribed)}
                      disabled={isUpdating === service.id}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors disabled:opacity-50 ${
                        service.isSubscribed
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {isUpdating === service.id ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : service.isSubscribed ? (
                        'Unsubscribe'
                      ) : (
                        'Subscribe'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!selectedCustomer && searchResults.length === 0 && searchTerm && !isSearching && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No customers found</h3>
          <p className="text-gray-500">
            Try searching with a different name or email address.
          </p>
        </div>
      )}
    </div>
  );
};

export default CSRCustomerVASManagement;
