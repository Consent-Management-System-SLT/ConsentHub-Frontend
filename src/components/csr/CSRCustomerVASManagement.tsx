import React, { useState, useEffect } from 'react';
import { 
  Search, 
  User, 
  Mail, 
  Phone, 
  Settings, 
  Shield,
  RefreshCw,
  AlertCircle,
  Clock,
  Check,
  X,
  Globe,
  Smartphone,
  Monitor,
  Play,
  Wifi,
  Cloud,
  Camera,
  Star,
  Eye,
  EyeOff
} from 'lucide-react';
import { csrDashboardService } from '../../services/csrDashboardService';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  mobile?: string;
  status?: string;
  joinDate?: string;
  lastLogin?: string;
}

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
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [vasServices, setVasServices] = useState<VASService[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingVAS, setIsLoadingVAS] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Handle customer search
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const response = await csrDashboardService.searchCustomersForPreferences(searchTerm);
      setSearchResults(response.customers || []);
    } catch (error) {
      console.error('Search failed:', error);
      setError('Failed to search customers. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle customer selection and load their VAS services
  const handleSelectCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setVasServices([]);
    setIsLoadingVAS(true);
    setError(null);

    try {
      console.log('CSR loading VAS services for customer:', customer.email);
      
      const response = await csrDashboardService.getCustomerVASServices(
        customer.id, 
        customer.email
      );
      
      setVasServices(response.data || []);
      console.log(`CSR loaded ${response.data?.length || 0} VAS services for customer`);
      
    } catch (error) {
      console.error('Failed to load customer VAS services:', error);
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
      
      console.log(`CSR ${action}ing customer ${selectedCustomer.email} ${action === 'subscribe' ? 'to' : 'from'} ${serviceId}`);
      
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

      // Show success notification
      console.log(`CSR successfully ${action}d ${serviceId} for customer ${selectedCustomer.email}`);
      
    } catch (error) {
      console.error('Failed to update VAS subscription:', error);
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

  // Get service icon
  const getServiceIcon = (serviceId: string) => {
    switch (serviceId) {
      case 'slt-filmhall': return <Play className="w-5 h-5" />;
      case 'peo-tv': return <Monitor className="w-5 h-5" />;
      case 'kaspersky-security': return <Shield className="w-5 h-5" />;
      case 'e-channelling-plus': return <Smartphone className="w-5 h-5" />;
      case 'slt-cloud-pro': return <Cloud className="w-5 h-5" />;
      case 'slt-international-roaming': return <Globe className="w-5 h-5" />;
      case 'slt-wifi-plus': return <Wifi className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'entertainment': return 'bg-purple-500/10 text-purple-600 border-purple-200';
      case 'security': return 'bg-red-500/10 text-red-600 border-red-200';
      case 'communication': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'cloud': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'health': return 'bg-pink-500/10 text-pink-600 border-pink-200';
      case 'travel': return 'bg-orange-500/10 text-orange-600 border-orange-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 p-6 bg-myslt-background min-h-full">
      {/* Header */}
      <div className="bg-myslt-card rounded-xl p-6 shadow-sm border border-myslt-accent/20">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-myslt-accent rounded-xl">
            <Settings className="w-6 h-6 text-myslt-success" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-myslt-text-primary">VAS Management</h1>
            <p className="text-myslt-text-secondary">
              Search and manage customer Value Added Services subscriptions
            </p>
          </div>
        </div>

        {/* Search Section */}
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-myslt-text-muted" />
            <input
              type="text"
              placeholder="Search by customer name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-4 py-3 border border-myslt-accent/30 rounded-xl bg-myslt-card text-myslt-text-primary placeholder-myslt-text-muted focus:outline-none focus:ring-2 focus:ring-myslt-success focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchTerm.trim()}
            className="px-6 py-3 bg-myslt-success text-white rounded-xl hover:bg-myslt-success/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isSearching ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <div>
            <p className="text-red-700 font-medium">Error</p>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && !selectedCustomer && (
        <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20">
          <div className="p-6 border-b border-myslt-accent/20">
            <h2 className="text-lg font-semibold text-myslt-text-primary">
              Search Results ({searchResults.length} customers found)
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {searchResults.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => handleSelectCustomer(customer)}
                  className="flex items-center justify-between p-4 border border-myslt-accent/20 rounded-lg hover:bg-myslt-accent/10 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-myslt-success/10 rounded-lg">
                      <User className="w-5 h-5 text-myslt-success" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-myslt-text-primary">{customer.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-myslt-text-secondary">
                        <span className="flex items-center space-x-1">
                          <Mail className="w-4 h-4" />
                          <span>{customer.email}</span>
                        </span>
                        {customer.phone && (
                          <span className="flex items-center space-x-1">
                            <Phone className="w-4 h-4" />
                            <span>{customer.phone}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-myslt-success">
                    <Settings className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Selected Customer VAS Management */}
      {selectedCustomer && (
        <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20">
          {/* Customer Header */}
          <div className="p-6 border-b border-myslt-accent/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-myslt-success/10 rounded-lg">
                  <User className="w-5 h-5 text-myslt-success" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-myslt-text-primary">
                    {selectedCustomer.name} - VAS Management
                  </h2>
                  <p className="text-myslt-text-secondary">{selectedCustomer.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 text-myslt-text-muted hover:text-myslt-text-secondary hover:bg-myslt-accent/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {isLoadingVAS ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin text-myslt-success" />
                <span className="ml-3 text-myslt-text-secondary">Loading VAS services...</span>
              </div>
            ) : vasServices.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-myslt-text-primary">
                    Value Added Services
                  </h3>
                  <div className="text-sm text-myslt-text-secondary">
                    Active: {vasServices.filter(s => s.isSubscribed).length} / {vasServices.length}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {vasServices.map((service) => (
                    <div key={service.id} className="border border-myslt-accent/20 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${service.isSubscribed ? 'bg-myslt-success/10' : 'bg-myslt-accent/10'}`}>
                            {getServiceIcon(service.id)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-myslt-text-primary">{service.name}</h4>
                            <p className="text-sm text-myslt-text-secondary">{service.provider}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs border ${getCategoryColor(service.category)}`}>
                          {service.category}
                        </span>
                      </div>

                      <p className="text-sm text-myslt-text-secondary mb-3">{service.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-myslt-text-primary">
                          {service.price}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm ${service.isSubscribed ? 'text-myslt-success' : 'text-myslt-text-muted'}`}>
                            {service.isSubscribed ? 'Subscribed' : 'Not Subscribed'}
                          </span>
                          <button
                            onClick={() => handleVASToggle(service.id, service.isSubscribed)}
                            disabled={isUpdating === service.id}
                            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                              service.isSubscribed
                                ? 'bg-red-500/10 text-red-600 hover:bg-red-500/20'
                                : 'bg-myslt-success/10 text-myslt-success hover:bg-myslt-success/20'
                            }`}
                          >
                            {isUpdating === service.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : service.isSubscribed ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                            <span>
                              {isUpdating === service.id 
                                ? 'Updating...' 
                                : service.isSubscribed 
                                  ? 'Unsubscribe' 
                                  : 'Subscribe'
                              }
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Service Features */}
                      {service.features && service.features.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-myslt-accent/20">
                          <p className="text-xs text-myslt-text-muted mb-1">Key Features:</p>
                          <div className="flex flex-wrap gap-1">
                            {service.features.slice(0, 3).map((feature, index) => (
                              <span key={index} className="text-xs bg-myslt-accent/10 text-myslt-text-secondary px-2 py-1 rounded">
                                {feature}
                              </span>
                            ))}
                            {service.features.length > 3 && (
                              <span className="text-xs text-myslt-text-muted">
                                +{service.features.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-myslt-text-muted mx-auto mb-3" />
                <p className="text-myslt-text-secondary">
                  No VAS services found for this customer.
                </p>
                <p className="text-sm text-myslt-text-muted mt-1">
                  The customer may not have any VAS services configured yet.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {searchTerm.trim() && searchResults.length === 0 && !isSearching && (
        <div className="bg-myslt-card rounded-xl p-8 text-center shadow-sm border border-myslt-accent/20">
          <Search className="w-12 h-12 text-myslt-text-muted mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-myslt-text-primary mb-2">No customers found</h3>
          <p className="text-myslt-text-secondary">
            Try searching with a different name or email address.
          </p>
        </div>
      )}
    </div>
  );
};

export default CSRCustomerVASManagement;
