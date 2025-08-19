import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Eye, Calendar, Mail, Phone, Building } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  createdAt: string;
}

interface UserListResponse {
  success: boolean;
  data: {
    users: User[];
    totalUsers: number;
  };
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3008/api/v1/auth/users');
      const data: UserListResponse = await response.json();
      
      if (data.success) {
        setUsers(data.data.users);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="bg-myslt-card rounded-lg shadow-sm border border-myslt-accent/20">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-myslt-primary" />
            <div>
              <h2 className="text-xl font-semibold text-myslt-text-primary">Registered Users</h2>
              <p className="text-sm text-gray-600">All users who have created accounts in the system</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <UserPlus className="h-4 w-4" />
            <span>{users.length} Total Users</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="divide-y divide-gray-200">
        {users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium">No users registered yet</p>
            <p className="text-sm">Users who sign up will appear here</p>
          </div>
        ) : (
          users.map((user) => (
            <div key={user.id} className="p-6 hover:bg-myslt-service-card transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-myslt-service-card rounded-full p-2">
                      <Users className="h-5 w-5 text-myslt-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {user.role}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                    
                    {user.phone && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {formatDate(user.createdAt)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Building className="h-4 w-4" />
                      <span>ID: {user.id}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => window.open(`/dashboard`, '_blank')}
                  className="ml-4 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-myslt-card hover:bg-myslt-service-card focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-myslt-primary"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Dashboard
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-6 bg-myslt-background border-t">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Multi-User System Active</strong> - Each user has their own secure account and dashboard
          </p>
          <div className="flex justify-center space-x-6 text-xs text-gray-500">
            <span>✅ Individual User Accounts</span>
            <span>✅ Secure Authentication</span>
            <span>✅ Personal Dashboards</span>
            <span>✅ Data Isolation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
