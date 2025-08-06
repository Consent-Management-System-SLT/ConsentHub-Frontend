import React, { useEffect, useState } from 'react';

interface Customer {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  type?: string;
  [key: string]: any;
}

interface CustomerSearchFormProps {
  onCustomerSelect?: (customer: Customer) => void;
  className?: string;
}

const CustomerSearchForm: React.FC<CustomerSearchFormProps> = ({
  onCustomerSelect,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'email' | 'phone' | 'name' | 'id'>('email');
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('http://localhost:3000/api/v1/party', {
          headers: getAuthHeaders(),
        });
        const data = await res.json();
        const customers = Array.isArray(data) ? data : data.parties || [];
        setAllCustomers(customers);
        setFilteredCustomers(customers); // Show all initially
      } catch {
        setError('Failed to fetch customer data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(allCustomers); // Show all if empty
      return;
    }

    const lowerTerm = searchTerm.toLowerCase();

    const filtered = allCustomers.filter((customer) => {
      const value = customer[searchType];
      if (value && typeof value === 'string') {
        return value.toLowerCase().includes(lowerTerm);
      }
      return false;
    });

    setFilteredCustomers(filtered);
  };

  return (
    <div className={`bg-white rounded-xl shadow border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-blue-100">
        <h2 className="text-xl font-semibold text-gray-900">Customer Search</h2>
        <p className="text-sm text-gray-600">Search customers by email, phone, name, or ID.</p>
      </div>

      {/* Search Controls */}
      <div className="p-6 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 flex gap-2">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
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
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Search
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 mx-6 mt-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      {/* Results */}
      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-8 text-gray-600">Loading...</div>
        ) : filteredCustomers.length > 0 ? (
          <div>
            <h3 className="mb-4 font-medium text-gray-900">
              Showing {filteredCustomers.length} customer{filteredCustomers.length > 1 ? 's' : ''}
            </h3>
            <div className="space-y-4 max-h-[60vh] overflow-auto border rounded p-2 bg-gray-50">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="bg-white p-4 border rounded hover:shadow-sm transition cursor-pointer"
                  onClick={() => onCustomerSelect?.(customer)}
                >
                  <p><strong>ID:</strong> {customer.id}</p>
                  <p><strong>Name:</strong> {customer.name || '-'}</p>
                  <p><strong>Email:</strong> {customer.email || '-'}</p>
                  <p><strong>Phone:</strong> {customer.phone || customer.mobile || '-'}</p>
                  <p><strong>Type:</strong> {customer.type || '-'}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">
            {searchTerm.trim()
              ? 'No matching customers found.'
              : 'No customers to display.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerSearchForm;
