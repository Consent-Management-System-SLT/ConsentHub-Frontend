import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Shield, 
  Monitor, 
  Film, 
  BarChart3, 
  Phone, 
  Cloud, 
  Heart, 
  Zap,
  CheckCircle,
  XCircle,
  Loader,
  Star,
  Info,
  AlertCircle,
  Wifi,
  TrendingUp,
  Users,
  Lock,
  PlayCircle,
  FileText,
  Calendar,
  Globe,
  Tv,
  HeartHandshake,
  HardDrive,
  Router,
  Activity,
  CreditCard,
  Smartphone
} from 'lucide-react';
import { vasService } from '../../services/vasService';
import websocketService, { VASSubscriptionUpdate } from '../../services/websocketService';

interface VASService {
  id: string;
  name: string;
  description: string;
  category: string;
  provider: string;
  price: string;
  features: string[];
  isSubscribed: boolean;
  icon?: React.ComponentType<any>;
  color?: string;
  popularity?: number;
  benefits?: string[];
}

const ValueAddedServices: React.FC = () => {
  const { t } = useTranslation();
  const [services, setServices] = useState<VASService[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [subscriptionLoading, setSubscriptionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [wsConnected, setWsConnected] = useState(false);
  const [monthlyTotal, setMonthlyTotal] = useState<number>(0);

  // Mock customer ID - in a real app, this would come from authentication context
  const customerId = '68b689c1d945be3295ad8e5e'; // This should be dynamic from auth

  // Component version: 2025-09-07-v2 - Force browser cache refresh
  console.log('ValueAddedServices component loaded - Version: 2025-09-07-v2');

  useEffect(() => {
    const fetchVASServices = async () => {
      try {
        setLoading(true);
        console.log('VAS: Starting fetchVASServices...');
        console.log('VAS: Fetching VAS services using vasService...');
        
        const result = await vasService.getVASServices();
        console.log('VAS: API Response received:', result);
        console.log('VAS: API Response type:', typeof result);
        console.log('VAS: API Response success:', result.success);
        console.log('VAS: API Response data:', result.data);
        console.log('VAS: API Response data length:', result.data?.length);
        
        // Handle both possible response formats
        let servicesData: any[] = [];
        if (result.success && result.data) {
          servicesData = result.data;
          console.log('VAS: Using result.data');
        } else if (Array.isArray(result)) {
          servicesData = result;
          console.log('VAS: Using result as array');
        } else if (Array.isArray(result.data)) {
          servicesData = result.data;
          console.log('VAS: Using result.data as array');
        }
        
        console.log('VAS: Processed services data:', servicesData);
        console.log('VAS: Services data length:', servicesData.length);
        
        if (servicesData.length > 0) {
          // Debug: Log raw service data before processing
          console.log('VAS Debug: Raw services data before processing:', servicesData);
          
          // Check specifically for International Roaming Plus
          const roamingService = servicesData.find((s: any) => s.name === 'International Roaming Plus');
          if (roamingService) {
            console.log('VAS Debug: International Roaming Plus in raw data:');
            console.log('   - isSubscribed:', roamingService.isSubscribed, '(Type:', typeof roamingService.isSubscribed, ')');
          }
          
          // Map backend data to frontend format with icons
          const servicesWithIcons = servicesData.map((service: any) => ({
            ...service,
            icon: getIconForCategory(service.category),
            color: getColorForCategory(service.category),
          }));
          
          // Debug: Check International Roaming Plus after processing
          const processedRoamingService = servicesWithIcons.find((s: any) => s.name === 'International Roaming Plus');
          if (processedRoamingService) {
            console.log('VAS Debug: International Roaming Plus after processing:');
            console.log('   - isSubscribed:', processedRoamingService.isSubscribed, '(Type:', typeof processedRoamingService.isSubscribed, ')');
          }
          
          setServices(servicesWithIcons);
          console.log('VAS: Services loaded from API:', servicesWithIcons.length, 'services');
          console.log('VAS: Service IDs:', servicesWithIcons.map((s: VASService) => s.id));
          console.log('VAS: Service Names:', servicesWithIcons.map((s: VASService) => s.name));
          console.log('VAS: Subscribed services:', servicesWithIcons.filter((s: VASService) => s.isSubscribed).map((s: VASService) => s.name));
        } else {
          console.log('VAS: No services found in API response');
          setServices([]); // Show empty list instead of fallback services
          setMessage('No VAS services available at this time. Please contact customer support.');
        }
      } catch (error) {
        console.error('VAS: API failed:', error);
        console.log('VAS: API failed, showing empty service list');
        setServices([]); // Show empty list instead of fallback services  
        setMessage('Unable to load VAS services. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchVASServices();
  }, []);

  // WebSocket setup for real-time VAS updates
  useEffect(() => {
    console.log('VAS: Setting up WebSocket for real-time updates...');
    
    // Set up WebSocket connection status tracking
    const checkConnection = () => {
      setWsConnected(websocketService.isConnected());
    };

    // Initial connection check
    checkConnection();

    // Authenticate and join customer room
    if (customerId) {
      websocketService.authenticateCustomer(customerId);
      websocketService.joinCustomerRoom(customerId);
    }

    // Set up VAS update listener
    const handleVASUpdate = (update: VASSubscriptionUpdate) => {
      console.log('VAS: Received real-time subscription update:', update);
      
      // Update the local state to reflect the change
      setServices(prevServices => 
        prevServices.map(service => 
          service.id === update.serviceId 
            ? { ...service, isSubscribed: update.isSubscribed }
            : service
        )
      );

      // Show a brief success message
      setMessage(`${update.serviceName} ${update.action} successful! Status updated in real-time.`);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    };

    websocketService.onVASUpdate(handleVASUpdate);

    // Set up periodic connection check
    const connectionCheck = setInterval(checkConnection, 5000);

    // Cleanup function
    return () => {
      console.log('VAS: Cleaning up WebSocket listeners...');
      clearInterval(connectionCheck);
      websocketService.offVASUpdate();
      if (customerId) {
        websocketService.leaveCustomerRoom();
      }
    };
  }, [customerId]);

  // Helper functions for icons and colors
  const getIconForCategory = (category: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      'entertainment': Smartphone,
      'security': Shield,
      'healthcare': HeartHandshake,
      'cloud': HardDrive,
      'connectivity': Router,
    };
    return iconMap[category] || Activity;
  };

  const getColorForCategory = (category: string) => {
    const colorMap: { [key: string]: string } = {
      'entertainment': 'text-red-600 bg-red-50 border-red-200',
      'security': 'text-orange-600 bg-orange-50 border-orange-200',
      'healthcare': 'text-green-600 bg-green-50 border-green-200',
      'cloud': 'text-blue-600 bg-blue-50 border-blue-200',
      'connectivity': 'text-purple-600 bg-purple-50 border-purple-200',
      'default': 'text-gray-600 bg-gray-50 border-gray-200'
    };
    return colorMap[category] || colorMap['default'];
  };

  // Calculate monthly total for subscribed services
  const calculateMonthlyTotal = (servicesList: VASService[]) => {
    return servicesList
      .filter(service => service.isSubscribed)
      .reduce((total, service) => {
        // Extract numeric value from price string - handle multiple formats
        // Examples: "Rs. 500/month", "Rs.500", "500", "Rs 500 per month", etc.
        const priceString = service.price.replace(/[^\d.]/g, ''); // Remove all non-numeric characters except decimal
        const price = parseFloat(priceString) || 0;
        return total + price;
      }, 0);
  };

  // Update monthly total whenever services change
  useEffect(() => {
    const total = calculateMonthlyTotal(services);
    setMonthlyTotal(total);
  }, [services]);

  const categories = [
    { id: 'all', name: 'All Services', icon: Activity },
    { id: 'entertainment', name: 'Entertainment', icon: Smartphone },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'healthcare', name: 'Healthcare', icon: HeartHandshake },
    { id: 'cloud', name: 'Cloud Services', icon: HardDrive },
    { id: 'connectivity', name: 'Connectivity', icon: Router }
  ];

  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubscriptionToggle = async (serviceId: string) => {
    setSubscriptionLoading(serviceId);
    
    try {
      const currentService = services.find(s => s.id === serviceId);
      const action = currentService?.isSubscribed ? 'unsubscribe' : 'subscribe';
      const displayAction = action.toUpperCase(); // For display purposes
      
      console.group(`VAS Subscription ${displayAction}`);
      console.log(`Service Details:`, {
        serviceId,
        serviceName: currentService?.name,
        provider: currentService?.provider,
        currentStatus: currentService?.isSubscribed ? 'SUBSCRIBED' : 'NOT SUBSCRIBED',
        requestedAction: displayAction,
        apiAction: action, // Log both for debugging
        price: currentService?.price,
        category: currentService?.category
      });
      console.log(`Request initiated at:`, new Date().toISOString());
      
      console.log(`Making API request using vasService...`);
      
      const result = await vasService.toggleVASSubscription(serviceId, action);
      
      console.log(`API Success Response:`, result);
      console.log(`API Response Type:`, typeof result);
      console.log(`API Response Keys:`, Object.keys(result || {}));
      
      // Check if result has success property - backend always returns this now
      const isSuccessful = result && result.success === true;
      
      if (isSuccessful) {
        // Note: WebSocket will handle the real-time update automatically
        // but we'll also update locally for immediate feedback
        const newSubscriptionStatus = action === 'subscribe';
        setServices(prev => prev.map(service => 
          service.id === serviceId 
            ? { ...service, isSubscribed: newSubscriptionStatus }
            : service
        ));
        
        console.log(`Local state updated:`, {
          serviceId,
          newStatus: newSubscriptionStatus ? 'SUBSCRIBED' : 'UNSUBSCRIBED',
          action: (result as any).action || action
        });
        
        console.log(`${displayAction} SUCCESSFUL for ${currentService?.name}`);
        
        // Show immediate feedback (WebSocket will update all connected clients)
        if (wsConnected) {
          setMessage(`${action === 'subscribe' ? 'Subscribed to' : 'Unsubscribed from'} ${currentService?.name}. Real-time update sent to all devices!`);
        } else {
          setMessage(`${action === 'subscribe' ? 'Subscribed to' : 'Unsubscribed from'} ${currentService?.name}. Update saved.`);
        }
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      } else {
        console.error(`API Error:`, result?.message || 'Unknown error');
        // Show error message to user
        alert(`Error: ${result?.message || 'Unknown error occurred'}`);
      }
    } catch (error: any) {
      console.error(`Subscription toggle error:`, {
        error: error.message,
        errorType: typeof error,
        errorObject: error,
        stack: error.stack
      });
      
      // Show detailed error to user
      const errorMessage = error.message || 'Unknown error occurred';
      alert(`API Error: ${errorMessage}`);
      
      // Fallback - toggle locally if API fails
      setServices(prev => prev.map(service => 
        service.id === serviceId 
          ? { ...service, isSubscribed: !service.isSubscribed }
          : service
      ));
      console.log(`Fallback: Local state toggled for ${serviceId}`);
    } finally {
      setSubscriptionLoading(null);
      console.log(`Request completed at:`, new Date().toISOString());
      console.groupEnd();
    }
  };

  const subscribedCount = services.filter(s => s.isSubscribed).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-myslt-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header - SLT Red Theme */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-700 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Value Added Services</h1>
              <p className="text-white/90">Enhance your SLT experience with premium services</p>
              {/* WebSocket Status Indicator */}
              <div className="flex items-center space-x-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-white/75 text-xs">
                  {wsConnected ? 'Real-time updates active' : 'Real-time updates offline'}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right space-y-4">
            {/* Active Services Count */}
            <div>
              <div className="text-3xl font-bold">{subscribedCount}</div>
              <div className="text-white/90 text-sm">Active Services</div>
            </div>
            
            {/* Monthly Total */}
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <CreditCard className="w-4 h-4 text-white/90" />
                <span className="text-white/90 text-xs font-medium">Monthly Total</span>
              </div>
              <div className="text-2xl font-bold text-white">
                Rs. {monthlyTotal.toLocaleString()}
              </div>
              <div className="text-white/75 text-xs">
                {subscribedCount > 0 ? (
                  <>
                    <div>{subscribedCount} service{subscribedCount > 1 ? 's' : ''} active</div>
                    <div className="text-white/60">Rs. {(monthlyTotal * 12).toLocaleString()}/year</div>
                  </>
                ) : (
                  'No active subscriptions'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Summary - Only show if user has subscriptions */}
      {subscribedCount > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Active Subscriptions</h3>
            </div>
            <div className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
              Rs. {monthlyTotal.toLocaleString()}/month
            </div>
          </div>
          
          {/* Billing Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-blue-900 font-medium text-sm">Billing Information</h4>
                <p className="text-blue-700 text-sm mt-1">
                  Your VAS charges will appear on your next SLT bill. 
                  Annual total: <span className="font-semibold">Rs. {(monthlyTotal * 12).toLocaleString()}</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services
              .filter(service => service.isSubscribed)
              .map(service => {
                // Extract numeric value using the same logic as calculateMonthlyTotal
                const priceString = service.price.replace(/[^\d.]/g, '');
                const price = parseFloat(priceString) || 0;
                
                return (
                  <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        {React.createElement(service.icon || Activity, { 
                          className: "w-4 h-4 text-red-600" 
                        })}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{service.name}</div>
                        <div className="text-gray-500 text-xs">{service.provider}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 text-sm">Rs. {price.toLocaleString()}</div>
                      <div className="text-gray-500 text-xs">per month</div>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>
      )}

      {/* Error/Info Message */}
      {message && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <Info className="w-5 h-5 text-yellow-600" />
            <p className="text-yellow-800">{message}</p>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search services..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600'
                }`}
              >
                <category.icon className="w-4 h-4" />
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => {
          const Icon = service.icon || Activity;
          const isLoading = subscriptionLoading === service.id;
          
          return (
            <div
              key={service.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:border-red-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${service.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  service.isSubscribed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {service.isSubscribed ? 'SUBSCRIBED' : 'NOT SUBSCRIBED'}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                <div className="text-red-600 font-bold text-lg">{service.price}</div>
              </div>

              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-2 font-medium">Features:</div>
                <div className="space-y-1">
                  {service.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleSubscriptionToggle(service.id)}
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  service.isSubscribed
                    ? 'bg-gray-600 hover:bg-gray-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <Loader className="w-4 h-4 animate-spin mx-auto" />
                ) : service.isSubscribed ? (
                  'Unsubscribe'
                ) : (
                  'Subscribe'
                )}
              </button>
            </div>
          );
        })}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No services found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default ValueAddedServices;
