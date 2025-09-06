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

interface VASService {
  id: string;
  name: string;
  description: string;
  category: string;
  provider: string;
  price: string;
  features: string[];
  isSubscribed: boolean;
  icon: React.ComponentType<any>;
  color: string;
  popularity: number;
  benefits: string[];
}

const ValueAddedServices: React.FC = () => {
  const { t } = useTranslation();
  const [services, setServices] = useState<VASService[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [subscriptionLoading, setSubscriptionLoading] = useState<string | null>(null);

  // Initialize services from backend API
  useEffect(() => {
    const fetchVASServices = async () => {
      try {
        setLoading(true);
        
        // Get auth token from localStorage
        const token = localStorage.getItem('authToken');
        
        const response = await fetch('/api/customer/vas/services', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
          },
        });
        
        console.log('VAS API Response Status:', response.status);
        console.log('VAS API Response OK:', response.ok);
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Map backend data to frontend format with icons
            const servicesWithIcons = result.data.map((service: any) => ({
              ...service,
              icon: getIconForCategory(service.category),
              color: getColorForCategory(service.category),
            }));
            setServices(servicesWithIcons);
            console.log('VAS Services loaded from API:', servicesWithIcons.length, 'services');
            console.log('All services default to UNSUBSCRIBED');
            console.log('Subscribed services:', servicesWithIcons.filter((s: VASService) => s.isSubscribed).map((s: VASService) => s.name));
          }
        } else {
          console.log('API failed, using fallback services (all unsubscribed by default)');
          // Fallback to 6 popular SLT services if API fails - ALL UNSUBSCRIBED
          const fallbackServices: VASService[] = [
            {
              id: 'slt-filmhall',
              name: 'SLT Filmhall',
              description: 'Premium OTT streaming platform with movies, TV shows, music, and games. Enjoy unlimited entertainment on any device.',
              category: 'entertainment',
              provider: 'SLT Mobitel',
              price: 'LKR 299/month',
              features: [
                'HD & 4K video streaming',
                'Unlimited music downloads',
                'Interactive gaming platform',
                'Multi-device access',
                'Offline viewing capability',
                'Family sharing (up to 5 profiles)'
              ],
              isSubscribed: false, // DEFAULT: UNSUBSCRIBED
              icon: Smartphone,
              color: 'text-myslt-primary bg-myslt-primary/10 border-myslt-primary/30',
              popularity: 95,
              benefits: ['Premium content', 'No ads', 'Family friendly']
            },
            {
              id: 'peo-tv',
              name: 'PEO TV Plus',
              description: 'Complete IPTV solution with 200+ channels, sports packages, and premium entertainment content.',
              category: 'entertainment',
              provider: 'SLT Net',
              price: 'LKR 1,200/month',
              features: [
                '200+ live TV channels',
                'Premium sports channels',
                'Time-shift & catch-up TV',
                'Video-on-demand library',
                '4K Ultra HD content',
                'Multi-room viewing'
              ],
              isSubscribed: false, // DEFAULT: UNSUBSCRIBED
              icon: Tv,
              color: 'text-myslt-secondary bg-myslt-secondary/10 border-myslt-secondary/30',
              popularity: 92,
              benefits: ['Live sports', 'Premium channels', 'Family entertainment']
            },
            {
              id: 'kaspersky-security',
              name: 'Kaspersky Total Security',
              description: 'Complete digital protection for your family with antivirus, VPN, password manager, and parental controls.',
              category: 'security',
              provider: 'Kaspersky Lab',
              price: 'LKR 450/month',
              features: [
                'Real-time antivirus protection',
                'Secure VPN (unlimited data)',
                'Password manager',
                'Parental controls & monitoring',
                'Safe banking & shopping',
                'Identity theft protection'
              ],
              isSubscribed: false, // DEFAULT: UNSUBSCRIBED
              icon: Shield,
              color: 'text-myslt-warning bg-myslt-warning/10 border-myslt-warning/30',
              popularity: 88,
              benefits: ['Complete security', 'Family protection', 'Privacy shield']
            },
            {
              id: 'e-channelling-plus',
              name: 'e-Channelling Health+',
              description: 'Comprehensive healthcare service with doctor consultations, lab bookings, and health monitoring.',
              category: 'healthcare',
              provider: 'e-Channelling (SLT)',
              price: 'LKR 650/month',
              features: [
                'Unlimited doctor consultations',
                'Lab test bookings & home collection',
                'Prescription delivery',
                'Health record management',
                '24/7 medical helpline',
                'Specialist referrals'
              ],
              isSubscribed: false, // DEFAULT: UNSUBSCRIBED
              icon: HeartHandshake,
              color: 'text-myslt-success bg-myslt-success/10 border-myslt-success/30',
              popularity: 86,
              benefits: ['Healthcare access', 'Home services', 'Emergency support']
            },
            {
              id: 'slt-cloud-pro',
              name: 'SLT Cloud Pro',
              description: 'Professional cloud storage and collaboration suite with advanced security and team features.',
              category: 'cloud',
              provider: 'SLT Digital Services',
              price: 'LKR 850/month',
              features: [
                '1TB secure cloud storage',
                'Real-time collaboration tools',
                'Advanced file sharing',
                'Automated backup',
                'Version control & history',
                'Enterprise-grade security'
              ],
              isSubscribed: false, // DEFAULT: UNSUBSCRIBED
              icon: HardDrive,
              color: 'text-myslt-info bg-myslt-info/10 border-myslt-info/30',
              popularity: 78,
              benefits: ['Secure storage', 'Team collaboration', 'Business tools']
            },
            {
              id: 'slt-international-roaming',
              name: 'International Roaming Plus',
              description: 'Affordable international roaming with data packages and competitive call rates worldwide.',
              category: 'connectivity',
              provider: 'SLT Mobitel',
              price: 'LKR 950/month',
              features: [
                'Global roaming coverage',
                'Discounted international calls',
                'Data roaming packages',
                'SMS bundles worldwide',
                'Emergency support 24/7',
                'Usage monitoring & alerts'
              ],
              isSubscribed: false, // DEFAULT: UNSUBSCRIBED
              icon: Router,
              color: 'text-myslt-accent bg-myslt-accent/10 border-myslt-accent/30',
              popularity: 75,
              benefits: ['Global connectivity', 'Cost savings', 'Travel convenience']
            }
          ];
          console.log('Using fallback: ALL services set to UNSUBSCRIBED');
          setServices(fallbackServices);
        }
      } catch (error) {
        console.error('Error fetching VAS services:', error);
        console.log('API Error - using fallback services (all unsubscribed)');
        // Set fallback data on error - ALL UNSUBSCRIBED
        const fallbackServices: VASService[] = [
          {
            id: 'slt-filmhall',
            name: 'SLT Filmhall',
            description: 'Premium OTT streaming platform with movies, TV shows, music, and games. Enjoy unlimited entertainment on any device.',
            category: 'entertainment',
            provider: 'SLT Mobitel',
            price: 'LKR 299/month',
            features: ['HD & 4K video streaming', 'Unlimited music downloads', 'Interactive gaming platform'],
            isSubscribed: false, // FORCED UNSUBSCRIBED
            icon: Smartphone,
            color: 'text-myslt-primary bg-myslt-primary/10 border-myslt-primary/30',
            popularity: 95,
            benefits: ['Premium content', 'No ads', 'Family friendly']
          },
          {
            id: 'peo-tv',
            name: 'PEO TV Plus',
            description: 'Complete IPTV solution with 200+ channels, sports packages, and premium entertainment content.',
            category: 'entertainment',
            provider: 'SLT Net',
            price: 'LKR 1,200/month',
            features: ['200+ live TV channels', 'Premium sports channels', 'Time-shift & catch-up TV'],
            isSubscribed: false, // FORCED UNSUBSCRIBED
            icon: Tv,
            color: 'text-myslt-secondary bg-myslt-secondary/10 border-myslt-secondary/30',
            popularity: 92,
            benefits: ['Live sports', 'Premium channels', 'Family entertainment']
          },
          {
            id: 'kaspersky-security',
            name: 'Kaspersky Total Security',
            description: 'Complete digital protection for your family with antivirus, VPN, password manager, and parental controls.',
            category: 'security',
            provider: 'Kaspersky Lab',
            price: 'LKR 450/month',
            features: ['Real-time antivirus protection', 'Secure VPN (unlimited data)', 'Password manager'],
            isSubscribed: false, // FORCED UNSUBSCRIBED
            icon: Shield,
            color: 'text-myslt-warning bg-myslt-warning/10 border-myslt-warning/30',
            popularity: 88,
            benefits: ['Complete security', 'Family protection', 'Privacy shield']
          },
          {
            id: 'e-channelling-plus',
            name: 'e-Channelling Health+',
            description: 'Comprehensive healthcare service with doctor consultations, lab bookings, and health monitoring.',
            category: 'healthcare',
            provider: 'e-Channelling (SLT)',
            price: 'LKR 650/month',
            features: ['Unlimited doctor consultations', 'Lab test bookings & home collection', 'Prescription delivery'],
            isSubscribed: false, // FORCED UNSUBSCRIBED
            icon: HeartHandshake,
            color: 'text-myslt-success bg-myslt-success/10 border-myslt-success/30',
            popularity: 86,
            benefits: ['Healthcare access', 'Home services', 'Emergency support']
          },
          {
            id: 'slt-cloud-pro',
            name: 'SLT Cloud Pro',
            description: 'Professional cloud storage and collaboration suite with advanced security and team features.',
            category: 'cloud',
            provider: 'SLT Digital Services',
            price: 'LKR 850/month',
            features: ['1TB secure cloud storage', 'Real-time collaboration tools', 'Advanced file sharing'],
            isSubscribed: false, // FORCED UNSUBSCRIBED
            icon: HardDrive,
            color: 'text-myslt-info bg-myslt-info/10 border-myslt-info/30',
            popularity: 78,
            benefits: ['Secure storage', 'Team collaboration', 'Business tools']
          },
          {
            id: 'slt-international-roaming',
            name: 'International Roaming Plus',
            description: 'Affordable international roaming with data packages and competitive call rates worldwide.',
            category: 'connectivity',
            provider: 'SLT Mobitel',
            price: 'LKR 950/month',
            features: ['Global roaming coverage', 'Discounted international calls', 'Data roaming packages'],
            isSubscribed: false, // FORCED UNSUBSCRIBED
            icon: Router,
            color: 'text-myslt-accent bg-myslt-accent/10 border-myslt-accent/30',
            popularity: 75,
            benefits: ['Global connectivity', 'Cost savings', 'Travel convenience']
          }
        ];
        setServices(fallbackServices);
      } finally {
        setLoading(false);
      }
    };

    fetchVASServices();
  }, []);

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
      'entertainment': 'text-myslt-primary bg-myslt-primary/10 border-myslt-primary/30',
      'security': 'text-myslt-warning bg-myslt-warning/10 border-myslt-warning/30',
      'healthcare': 'text-myslt-success bg-myslt-success/10 border-myslt-success/30',
      'cloud': 'text-myslt-info bg-myslt-info/10 border-myslt-info/30',
      'connectivity': 'text-myslt-accent bg-myslt-accent/10 border-myslt-accent/30',
    };
    return colorMap[category] || 'text-myslt-text-secondary bg-myslt-service-card border-myslt-accent/20';
  };

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
      
      // Console logging for subscription actions
      console.group(`VAS Subscription ${action.toUpperCase()}`);
      console.log(`Service Details:`, {
        serviceId,
        serviceName: currentService?.name,
        provider: currentService?.provider,
        currentStatus: currentService?.isSubscribed ? 'SUBSCRIBED' : 'NOT SUBSCRIBED',
        requestedAction: action.toUpperCase(),
        price: currentService?.price,
        category: currentService?.category
      });
      console.log(`Request initiated at:`, new Date().toISOString());
      
      // Get auth token from localStorage
      const token = localStorage.getItem('authToken');
      console.log(`Authentication:`, token ? 'Token found' : 'No token found');
      
      console.log(`Making API request to:`, `/api/customer/vas/services/${serviceId}/toggle`);
      
      const response = await fetch(`/api/customer/vas/services/${serviceId}/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
      
      console.log(`API Response:`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`API Success Response:`, result);
        
        if (result.success) {
          // Update local state
          setServices(prev => prev.map(service => 
            service.id === serviceId 
              ? { ...service, isSubscribed: result.data.isSubscribed }
              : service
          ));
          
          console.log(`Local state updated:`, {
            serviceId,
            newStatus: result.data.isSubscribed ? 'SUBSCRIBED' : 'UNSUBSCRIBED',
            timestamp: result.data.timestamp
          });
          
          // Show success notification
          console.log(`${action.toUpperCase()} SUCCESSFUL for ${currentService?.name}`);
        } else {
          console.error(`API Error:`, result.message);
        }
      } else {
        console.warn(`API request failed, using fallback`);
        // Fallback - toggle locally if API fails
        setServices(prev => prev.map(service => 
          service.id === serviceId 
            ? { ...service, isSubscribed: !service.isSubscribed }
            : service
        ));
        console.log(`Fallback: Local state toggled for ${serviceId}`);
      }
    } catch (error) {
      console.error(`Subscription toggle error:`, error);
      // Fallback - toggle locally if API fails
      setServices(prev => prev.map(service => 
        service.id === serviceId 
          ? { ...service, isSubscribed: !service.isSubscribed }
          : service
      ));
      console.log(`Error fallback: Local state toggled for ${serviceId}`);
    } finally {
      setSubscriptionLoading(null);
      console.log(`Request completed at:`, new Date().toISOString());
      console.groupEnd();
    }
  };

  const subscribedCount = services.filter(s => s.isSubscribed).length;
  const totalSavings = services.filter(s => s.isSubscribed).length * 150; // Mock savings

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-myslt-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header - SLT Mobitel Themed */}
      <div className="bg-gradient-to-r from-myslt-primary via-myslt-secondary to-myslt-primary-dark rounded-xl p-6 text-white myslt-card-glow">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2 text-white">
                SLT Value Added Services
              </h1>
              <p className="text-blue-100 text-lg">
                Enhance your digital lifestyle with premium SLT services
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{subscribedCount}</div>
              <div className="text-blue-100 text-sm">Active Services</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">LKR {totalSavings.toLocaleString()}</div>
              <div className="text-blue-100 text-sm">Monthly Value</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{services.length}</div>
              <div className="text-blue-100 text-sm">Available Services</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters - SLT Styled */}
      <div className="myslt-card p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search SLT services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 border-2 border-myslt-accent/30 rounded-lg focus:ring-2 focus:ring-myslt-primary focus:border-myslt-primary transition-colors bg-myslt-background text-myslt-text-primary placeholder-myslt-text-muted"
              />
              <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-myslt-text-muted" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-myslt-primary text-white shadow-md myslt-button-glow'
                      : 'bg-myslt-service-card text-myslt-text-primary hover:bg-myslt-accent/20 border border-myslt-accent/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredServices.map((service) => {
          const Icon = service.icon;
          const isLoading = subscriptionLoading === service.id;
          
          return (
            <div
              key={service.id}
              className={`myslt-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                service.isSubscribed ? 'ring-2 ring-myslt-success/30 bg-myslt-success/5' : ''
              }`}
            >
              {/* Card Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${service.color} transition-transform hover:scale-110`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="flex items-center space-x-3">
                    {service.isSubscribed && (
                      <div className="flex items-center space-x-1 bg-myslt-success/10 text-myslt-success px-2 py-1 rounded-full">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs font-medium">Active</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1 bg-myslt-warning/10 text-myslt-warning px-2 py-1 rounded-full">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-xs font-medium">{service.popularity}%</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-myslt-text-primary mb-2 line-clamp-2">
                  {service.name}
                </h3>
                <p className="text-myslt-text-secondary text-sm mb-4 line-clamp-3 leading-relaxed">
                  {service.description}
                </p>

                {/* Provider and Price */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs text-myslt-text-muted">Provider</div>
                    <div className="text-sm font-medium text-myslt-text-primary">
                      {service.provider}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-myslt-text-muted">Price</div>
                    <div className="text-sm font-medium text-myslt-primary">
                      {service.price}
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="mb-4">
                  <div className="text-xs text-myslt-text-muted mb-2">Key Benefits</div>
                  <div className="flex flex-wrap gap-1">
                    {service.benefits.slice(0, 3).map((benefit, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 bg-myslt-accent/10 text-myslt-text-primary rounded"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <div className="text-xs text-myslt-text-muted mb-2">Features</div>
                  <ul className="space-y-1">
                    {service.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                        <span className="text-myslt-text-secondary">{feature}</span>
                      </li>
                    ))}
                    {service.features.length > 3 && (
                      <li className="text-sm text-myslt-text-muted">
                        +{service.features.length - 3} more features
                      </li>
                    )}
                  </ul>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleSubscriptionToggle(service.id)}
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                    service.isSubscribed
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-myslt-primary hover:bg-myslt-primary-dark text-white'
                  } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : service.isSubscribed ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  <span>
                    {isLoading 
                      ? 'Processing...' 
                      : service.isSubscribed 
                        ? 'Unsubscribe' 
                        : 'Subscribe'
                    }
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-myslt-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium text-myslt-text-primary mb-2">
            No services found
          </h3>
          <p className="text-myslt-text-secondary">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Service Information
            </h4>
            <p className="text-sm text-blue-700">
              Changes to your service subscriptions will be reflected in your next billing cycle. 
              For immediate assistance, contact SLT customer support at 1212.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValueAddedServices;
