import React, { useState } from 'react';
import { Search, User, Phone, Mail, Shield, AlertCircle } from 'lucide-react';
import { mockParties } from '../../data/mockData';

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

  const handleSearch = () => {
    setIsSearching(true);
    
    // Simulate API call
    setTimeout(() => {
      const results = mockParties.filter((customer: any) => {
        switch (searchType) {
          case 'email':
            return customer.email.toLowerCase().includes(searchTerm.toLowerCase());
          case 'phone':
            return customer.mobile.includes(searchTerm);
          case 'name':
            return customer.name.toLowerCase().includes(searchTerm.toLowerCase());
          case 'id':
            return customer.id.toLowerCase().includes(searchTerm.toLowerCase());
          default:
            return false;
        }
      });
      
      setSearchResults(results);
      setIsSearching(false);
    }, 1000);
  };

  const handleCustomerSelect = (customer: any) => {
    onCustomerSelect?.(customer);
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
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Search Results */}
      <div className="p-6">
        {isSearching ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Searching customers...</span>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Search Results ({searchResults.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map(customer => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  onSelect={handleCustomerSelect}
                />
              ))}
            </div>
          </div>
        ) : searchTerm && !isSearching ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No customers found matching your search.</p>
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

// Customer Card Component
const CustomerCard: React.FC<{ customer: any; onSelect: (customer: any) => void }> = ({ 
  customer, 
  onSelect 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const hasGuardianship = customer.type === 'guardian';
  
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-r from-gray-50 to-gray-100">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{customer.name}</h4>
            <p className="text-sm text-gray-500">ID: {customer.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(customer.status || 'active')}`}>
            {customer.status || 'active'}
          </span>
          {hasGuardianship && (
            <div className="flex items-center">
              <Shield className="w-4 h-4 text-purple-600" />
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm">
          <Mail className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">{customer.email}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Phone className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">{customer.mobile}</span>
        </div>
        {customer.relationship && (
          <div className="flex items-center space-x-2 text-sm">
            <Shield className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              {customer.relationship.role} {customer.relationship.linkedPartyId && `(${customer.relationship.linkedPartyId})`}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={() => onSelect(customer)}
          className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium"
        >
          Select Customer
        </button>
        <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
          View Profile
        </button>
      </div>
    </div>
  );
};

export default CustomerSearchForm;
