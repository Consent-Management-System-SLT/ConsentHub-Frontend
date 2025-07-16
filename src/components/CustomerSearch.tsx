import React, { useState } from 'react';
import { Search, User, Mail, Phone, MapPin } from 'lucide-react';
import { mockParties } from '../data/mockData';
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

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.length > 0) {
      const results = mockParties.filter(party =>
        party.name.toLowerCase().includes(term.toLowerCase()) ||
        party.email.toLowerCase().includes(term.toLowerCase()) ||
        party.mobile.includes(term)
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
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

        {searchResults.length > 0 && (
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
                  </div>
                </div>
              </div>
            ))}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};