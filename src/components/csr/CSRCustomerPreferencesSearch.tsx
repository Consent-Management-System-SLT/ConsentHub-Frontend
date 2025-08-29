import React, { useState } from 'react';
import { 
  Search, 
  User, 
  Mail, 
  Phone, 
  Settings, 
  MessageSquare, 
  Bell,
  Calendar,
  MapPin,
  RefreshCw,
  AlertCircle,
  Clock,
  Check,
  X,
  Globe,
  Shield
} from 'lucide-react';
import { csrDashboardService } from '../../services/csrDashboardService';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  mobile?: string;
  status: string;
  type: string;
  createdAt: string;
  address?: string;
  dateOfBirth?: string;
  lastLogin?: string | null;
}

interface CommunicationPreference {
  id: string;
  partyId: string;
  preferredChannels: {
    email: boolean;
    sms: boolean;
    push: boolean;
    phone: boolean;
  };
  topicSubscriptions: {
    marketing: boolean;
    promotional: boolean;
    transactional: boolean;
    service: boolean;
    security: boolean;
    billing: boolean;
  };
  doNotDisturb: {
    enabled: boolean;
    startTime?: string;
    endTime?: string;
    days?: string[];
  };
  frequency: string;
  timezone: string;
  language: string;
  lastUpdated: string;
  updatedBy: string;
}

const CSRCustomerPreferencesSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [preferences, setPreferences] = useState<CommunicationPreference | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Handle customer selection and load their preferences
  const handleSelectCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setPreferences(null);
    setIsLoadingPreferences(true);
    setError(null);

    try {
      const customerPrefs = await csrDashboardService.getCustomerPreferences(customer.id);
      setPreferences(customerPrefs);
    } catch (error) {
      console.error('Failed to load customer preferences:', error);
      setError('Failed to load customer preferences. The customer may not have set their preferences yet.');
    } finally {
      setIsLoadingPreferences(false);
    }
  };

  // Handle search on Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6 p-6 bg-myslt-background min-h-full">
      {/* Header */}
      <div className="bg-myslt-card rounded-xl p-6 shadow-sm border border-myslt-accent/20">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-myslt-accent rounded-xl">
            <MessageSquare className="w-6 h-6 text-myslt-success" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-myslt-text-primary">Communication Preferences</h1>
            <p className="text-myslt-text-secondary">
              Search and view customer communication preferences dashboard
            </p>
          </div>
        </div>

        {/* Search Section */}
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-myslt-text-muted w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search by customer name or email..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-myslt-accent/30 bg-myslt-background/50 text-myslt-text-primary placeholder-myslt-text-muted focus:outline-none focus:ring-2 focus:ring-myslt-success focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchTerm.trim()}
            className="px-6 py-3 bg-myslt-success text-white rounded-xl hover:bg-myslt-success/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
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

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20">
          <div className="p-6 border-b border-myslt-accent/20">
            <h2 className="text-lg font-semibold text-myslt-text-primary">
              Search Results ({searchResults.length} found)
            </h2>
          </div>
          <div className="divide-y divide-myslt-accent/20">
            {searchResults.map((customer) => (
              <div
                key={customer.id}
                onClick={() => handleSelectCustomer(customer)}
                className="p-4 hover:bg-myslt-accent/10 cursor-pointer transition-colors duration-200 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-myslt-accent rounded-lg">
                    <User className="w-5 h-5 text-myslt-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-myslt-text-primary">{customer.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-myslt-text-secondary">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-4 h-4" />
                        <span>{customer.email}</span>
                      </div>
                      {customer.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="w-4 h-4" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-myslt-text-muted">
                  Status: <span className="capitalize">{customer.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer Preferences Display */}
      {selectedCustomer && (
        <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20">
          <div className="p-6 border-b border-myslt-accent/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-myslt-success/10 rounded-lg">
                  <User className="w-5 h-5 text-myslt-success" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-myslt-text-primary">
                    {selectedCustomer.name} - Communication Preferences
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
            {isLoadingPreferences ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin text-myslt-success" />
                <span className="ml-2 text-myslt-text-secondary">Loading preferences...</span>
              </div>
            ) : preferences ? (
              <div className="space-y-6">
                {/* Preferred Channels */}
                <div className="bg-myslt-accent/5 rounded-xl p-4">
                  <h3 className="flex items-center space-x-2 text-lg font-semibold text-myslt-text-primary mb-4">
                    <MessageSquare className="w-5 h-5 text-myslt-success" />
                    <span>Preferred Communication Channels</span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(preferences.preferredChannels).map(([channel, enabled]) => (
                      <div key={channel} className="flex items-center space-x-2 p-3 bg-myslt-card rounded-lg">
                        {enabled ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`capitalize ${enabled ? 'text-myslt-text-primary' : 'text-myslt-text-muted'}`}>
                          {channel}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Topic Subscriptions */}
                <div className="bg-myslt-accent/5 rounded-xl p-4">
                  <h3 className="flex items-center space-x-2 text-lg font-semibold text-myslt-text-primary mb-4">
                    <Bell className="w-5 h-5 text-myslt-success" />
                    <span>Topic Subscriptions</span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(preferences.topicSubscriptions).map(([topic, enabled]) => (
                      <div key={topic} className="flex items-center space-x-2 p-3 bg-myslt-card rounded-lg">
                        {enabled ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`capitalize ${enabled ? 'text-myslt-text-primary' : 'text-myslt-text-muted'}`}>
                          {topic}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Do Not Disturb */}
                {preferences.doNotDisturb.enabled && (
                  <div className="bg-myslt-accent/5 rounded-xl p-4">
                    <h3 className="flex items-center space-x-2 text-lg font-semibold text-myslt-text-primary mb-4">
                      <Clock className="w-5 h-5 text-myslt-success" />
                      <span>Do Not Disturb Settings</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-myslt-card rounded-lg">
                        <span className="text-sm text-myslt-text-secondary">Start Time</span>
                        <p className="font-semibold text-myslt-text-primary">
                          {preferences.doNotDisturb.startTime || 'Not set'}
                        </p>
                      </div>
                      <div className="p-3 bg-myslt-card rounded-lg">
                        <span className="text-sm text-myslt-text-secondary">End Time</span>
                        <p className="font-semibold text-myslt-text-primary">
                          {preferences.doNotDisturb.endTime || 'Not set'}
                        </p>
                      </div>
                      <div className="p-3 bg-myslt-card rounded-lg">
                        <span className="text-sm text-myslt-text-secondary">Days</span>
                        <p className="font-semibold text-myslt-text-primary">
                          {preferences.doNotDisturb.days?.join(', ') || 'All days'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Settings */}
                <div className="bg-myslt-accent/5 rounded-xl p-4">
                  <h3 className="flex items-center space-x-2 text-lg font-semibold text-myslt-text-primary mb-4">
                    <Settings className="w-5 h-5 text-myslt-success" />
                    <span>Additional Settings</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-myslt-card rounded-lg">
                      <span className="text-sm text-myslt-text-secondary flex items-center space-x-1">
                        <RefreshCw className="w-4 h-4" />
                        <span>Frequency</span>
                      </span>
                      <p className="font-semibold text-myslt-text-primary capitalize">
                        {preferences.frequency}
                      </p>
                    </div>
                    <div className="p-3 bg-myslt-card rounded-lg">
                      <span className="text-sm text-myslt-text-secondary flex items-center space-x-1">
                        <Globe className="w-4 h-4" />
                        <span>Language</span>
                      </span>
                      <p className="font-semibold text-myslt-text-primary">
                        {preferences.language}
                      </p>
                    </div>
                    <div className="p-3 bg-myslt-card rounded-lg">
                      <span className="text-sm text-myslt-text-secondary flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>Timezone</span>
                      </span>
                      <p className="font-semibold text-myslt-text-primary">
                        {preferences.timezone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Last Updated Info */}
                <div className="bg-myslt-accent/5 rounded-xl p-4">
                  <h3 className="flex items-center space-x-2 text-lg font-semibold text-myslt-text-primary mb-3">
                    <Calendar className="w-5 h-5 text-myslt-success" />
                    <span>Update Information</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-myslt-card rounded-lg">
                      <Clock className="w-4 h-4 text-myslt-text-muted" />
                      <div>
                        <span className="text-sm text-myslt-text-secondary">Last Updated</span>
                        <p className="font-semibold text-myslt-text-primary">
                          {new Date(preferences.lastUpdated).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-myslt-card rounded-lg">
                      <Shield className="w-4 h-4 text-myslt-text-muted" />
                      <div>
                        <span className="text-sm text-myslt-text-secondary">Updated By</span>
                        <p className="font-semibold text-myslt-text-primary">
                          {preferences.updatedBy}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-myslt-text-muted mx-auto mb-3" />
                <p className="text-myslt-text-secondary">
                  No communication preferences found for this customer.
                </p>
                <p className="text-sm text-myslt-text-muted mt-1">
                  The customer may not have configured their preferences yet.
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

export default CSRCustomerPreferencesSearch;