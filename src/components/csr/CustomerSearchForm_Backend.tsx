import React, { useState } from 'react';
import { Search, User, Phone, Mail, Shield, AlertCircle, RefreshCw } from 'lucide-react';
import { csrDashboardService } from '../../services/csrDashboardService';

interface CustomerSearchFormProps {
  onCustomerSelect?: (customer: any) => void;
  className?: string;
}

const CustomerSearchForm: React.FC<CustomerSearchFormProps> = ({ 
  onCustomerSelect, 
  className = '' 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('email');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      // Use CSR dashboard service with comprehensive hardcoded fallback data
      const results = await csrDashboardService.searchCustomers(searchTerm);
      setSearchResults(results);
      
      if (results.length === 0) {
        setError('No customers found matching your search criteria.');
      }
    } catch (err) {
      console.error('Error searching customers:', err);
      setError('Failed to search customers. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCustomerSelect = (customer: any) => {
    onCustomerSelect?.(customer);
  };

  const getCustomerIcon = (type: string) => {
    switch (type) {
      case 'guardian':
        return <Shield className="w-4 h-4 text-amber-600" />;
      case 'individual':
        return <User className="w-4 h-4 text-blue-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="flex items-center space-x-3">
          <Search className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Customer Search</h2>
            <p className="text-sm text-gray-600">Search for customers by email, phone, name, or ID</p>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex space-x-4">
          <div className="flex-1">
            <div className="flex space-x-2">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="name">Name</option>
                <option value="id">Customer ID</option>
              </select>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search by ${searchType}...`}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            disabled={!searchTerm.trim() || isSearching}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center gap-2"
          >
            {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 mx-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Search Results */}
      <div className="p-6">
        {isSearching ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Searching customers...</span>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">
              Search Results ({searchResults.length})
            </h3>
            <div className="grid gap-3">
              {searchResults.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => handleCustomerSelect(customer)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getCustomerIcon(customer.type || customer.partyType)}
                      <div>
                        <div className="font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-600">ID: {customer.id}</div>
                        <div className="flex items-center space-x-4 mt-2">
                          {customer.email && (
                            <div className="flex items-center space-x-1">
                              <Mail className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{customer.email}</span>
                            </div>
                          )}
                          {(customer.phone || customer.mobile) && (
                            <div className="flex items-center space-x-1">
                              <Phone className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{customer.phone || customer.mobile}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        customer.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.status || 'active'}
                      </span>
                      {customer.type === 'guardian' && (
                        <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                          Guardian
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : searchTerm ? (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No customers found matching your search criteria.</p>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your search terms or search type.</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Enter search criteria to find customers.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerSearchForm;
