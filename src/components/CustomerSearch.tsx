import React, { useState } from 'react';
import { Search, User, Mail, Phone, MapPin } from 'lucide-react';
import { Party } from '../types/consent';

interface CustomerSearchProps {
  onCustomerSelect: (customer: Party) => void;
  selectedCustomer?: Party;
}

export const CustomerSearch: React.FC<CustomerSearchProps> = ({ 
  onCustomerSelect, 
  selectedCustomer 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Party[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    setError('');
    
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get auth token
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Make API call to search customers
      const response = await fetch(`/api/v1/csr/customers/search?query=${encodeURIComponent(term)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Transform the API response to match the Party interface
        const transformedResults = data.customers.map((customer: any) => ({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          mobile: customer.phone || customer.mobile || '',
          type: customer.type || 'individual',
          status: customer.status || 'active',
          address: customer.address || '',
          organization: customer.organization || '',
          department: customer.department || '',
          jobTitle: customer.jobTitle || '',
          createdAt: customer.createdAt || new Date().toISOString(),
          lastUpdated: customer.lastUpdated || customer.createdAt || new Date().toISOString(),
          userDetails: customer.userDetails
        }));
        
        setSearchResults(transformedResults);
      } else {
        throw new Error(data.message || 'Search failed');
      }
    } catch (err: any) {
      console.error('Customer search error:', err);
      setError(err.message || 'Failed to search customers');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Search</h2>
        
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {isLoading && (
          <div className="mt-4 p-4 text-center">
            <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Searching customers...</p>
          </div>
        )}

        {!isLoading && searchResults.length > 0 && (
          <div className="mt-4 max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            {searchResults.map((party) => (
              <div
                key={party.id}
                onClick={() => onCustomerSelect(party)}
                className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{party.name}</h3>
                      <p className="text-sm text-gray-500">{party.email}</p>
                      {party.organization && (
                        <p className="text-xs text-gray-400">{party.organization}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{party.mobile}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      party.type === 'guardian' ? 'bg-purple-100 text-purple-800' :
                      party.type === 'organization' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {party.type}
                    </span>
                    {party.status && (
                      <span className={`block mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        party.status === 'active' ? 'bg-green-100 text-green-800' :
                        party.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {party.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && searchTerm.length >= 2 && searchResults.length === 0 && !error && (
          <div className="mt-4 p-4 text-center text-gray-500">
            <p className="text-sm">No customers found matching "{searchTerm}"</p>
          </div>
        )}
      </div>

      {selectedCustomer && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Customer</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Name:</span>
                <span className="text-sm font-medium text-gray-900">{selectedCustomer.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Email:</span>
                <span className="text-sm font-medium text-gray-900">{selectedCustomer.email}</span>
              </div>
              {selectedCustomer.organization && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Organization:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedCustomer.organization}</span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Mobile:</span>
                <span className="text-sm font-medium text-gray-900">{selectedCustomer.mobile}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Type:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  selectedCustomer.type === 'guardian' ? 'bg-purple-100 text-purple-800' :
                  selectedCustomer.type === 'organization' ? 'bg-green-100 text-green-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {selectedCustomer.type}
                </span>
              </div>
              {selectedCustomer.userDetails && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Last Login:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedCustomer.userDetails.lastLoginAt ? 
                      new Date(selectedCustomer.userDetails.lastLoginAt).toLocaleDateString() : 
                      'Never'
                    }
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};