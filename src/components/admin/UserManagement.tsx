import React, { useState } from 'react';
import { Users, Plus, Search, Edit, Trash2, Shield, UserCheck, RefreshCw, X, Mail, Phone, Calendar, Eye, EyeOff } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'Admin' | 'Manager' | 'CSR' | 'Customer';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  createdAt: string;
  department?: string;
  permissions: string[];
}

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [users, setUsers] = useState<User[]>([
    { 
      id: 1, 
      name: 'John Smith', 
      email: 'john.smith@company.com', 
      phone: '+1 (555) 123-4567',
      role: 'Admin', 
      status: 'active', 
      lastLogin: '2024-01-28',
      createdAt: '2023-06-15',
      department: 'IT',
      permissions: ['user_management', 'system_config', 'audit_logs', 'data_export']
    },
    { 
      id: 2, 
      name: 'Sarah Wilson', 
      email: 'sarah.wilson@company.com', 
      phone: '+1 (555) 234-5678',
      role: 'CSR', 
      status: 'active', 
      lastLogin: '2024-01-27',
      createdAt: '2023-08-22',
      department: 'Customer Service',
      permissions: ['customer_support', 'consent_management', 'dsar_handling']
    },
    { 
      id: 3, 
      name: 'Mike Johnson', 
      email: 'mike.johnson@company.com', 
      phone: '+1 (555) 345-6789',
      role: 'CSR', 
      status: 'active', 
      lastLogin: '2024-01-26',
      createdAt: '2023-09-10',
      department: 'Customer Service',
      permissions: ['customer_support', 'consent_management']
    },
    { 
      id: 4, 
      name: 'Alice Brown', 
      email: 'alice.brown@company.com', 
      phone: '+1 (555) 456-7890',
      role: 'Manager', 
      status: 'inactive', 
      lastLogin: '2024-01-20',
      createdAt: '2023-05-03',
      department: 'Operations',
      permissions: ['team_management', 'reporting', 'consent_management']
    }
  ]);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'CSR' as User['role'],
    department: '',
    permissions: [] as string[]
  });

  const availablePermissions = [
    'user_management',
    'system_config',
    'audit_logs',
    'data_export',
    'customer_support',
    'consent_management',
    'dsar_handling',
    'team_management',
    'reporting'
  ];

  const handleAddUser = () => {
    const user: User = {
      id: Math.max(...users.map(u => u.id)) + 1,
      ...newUser,
      status: 'active',
      lastLogin: 'Never',
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setUsers([...users, user]);
    setNewUser({
      name: '',
      email: '',
      phone: '',
      role: 'CSR',
      department: '',
      permissions: []
    });
    setShowAddModal(false);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = () => {
    if (!selectedUser) return;
    
    setUsers(users.map(u => u.id === selectedUser.id ? selectedUser : u));
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = () => {
    if (!userToDelete) return;
    
    setUsers(users.filter(u => u.id !== userToDelete.id));
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleStatusChange = (userId: number, newStatus: User['status']) => {
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, status: newStatus }
        : u
    ));
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin':
        return <Shield className="w-4 h-4 text-red-600" />;
      case 'Manager':
        return <UserCheck className="w-4 h-4 text-myslt-primary" />;
      case 'CSR':
        return <Users className="w-4 h-4 text-green-600" />;
      default:
        return <Users className="w-4 h-4 text-myslt-text-secondary" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-800';
      case 'Manager':
        return 'bg-myslt-primary/10 text-myslt-primary';
      case 'CSR':
        return 'bg-myslt-success/10 text-myslt-success';
      default:
        return 'bg-myslt-service-card text-myslt-text-primary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-myslt-success/10 text-myslt-success';
      case 'inactive':
        return 'bg-myslt-service-card text-myslt-text-muted';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-myslt-service-card text-myslt-text-primary';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-myslt-text-primary">User Management</h1>
          <p className="text-myslt-text-secondary mt-2">Manage user accounts and permissions</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add User</span>
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-myslt-text-secondary">Total Users</p>
              <p className="text-2xl font-bold text-myslt-success">{users.length}</p>
            </div>
            <div className="w-12 h-12 bg-myslt-accent/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-myslt-success" />
            </div>
          </div>
        </div>
        
        <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-myslt-text-secondary">Active Users</p>
              <p className="text-2xl font-bold text-myslt-success">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-myslt-accent/20 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-myslt-success" />
            </div>
          </div>
        </div>
        
        <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-myslt-text-secondary">Admins</p>
              <p className="text-2xl font-bold text-myslt-danger">
                {users.filter(u => u.role === 'Admin').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-myslt-accent/20 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-myslt-danger" />
            </div>
          </div>
        </div>
        
        <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-myslt-text-secondary">CSR Staff</p>
              <p className="text-2xl font-bold text-myslt-primary">
                {users.filter(u => u.role === 'CSR').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-myslt-accent/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-myslt-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20 p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-myslt-text-muted w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="CSR">CSR</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-myslt-background">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-myslt-text-secondary uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-myslt-text-secondary uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-myslt-text-secondary uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-myslt-text-secondary uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-myslt-text-secondary uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-myslt-text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-myslt-card divide-y divide-myslt-accent/20">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-myslt-background">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-myslt-accent/20 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-myslt-text-primary" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-myslt-text-primary">{user.name}</div>
                        <div className="text-sm text-myslt-text-secondary">{user.email}</div>
                        {user.phone && <div className="text-xs text-gray-400">{user.phone}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getRoleIcon(user.role)}
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.status}
                      onChange={(e) => handleStatusChange(user.id, e.target.value as User['status'])}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(user.status)}`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-myslt-text-primary">{user.lastLogin}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-myslt-text-primary">{user.department || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="text-myslt-primary hover:text-myslt-primary-dark p-1 hover:bg-myslt-service-card rounded transition-colors"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-myslt-card rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-myslt-accent/20">
              <h3 className="text-lg font-semibold text-myslt-text-primary">Add New User</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as User['role']})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="CSR">CSR</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={newUser.department}
                  onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="p-6 border-t border-myslt-border flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-myslt-text-secondary bg-myslt-service-card rounded-lg hover:bg-myslt-card-gradient transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-myslt-success text-white rounded-lg hover:bg-myslt-success/90 transition-colors"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-myslt-card rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-myslt-accent/20">
              <h3 className="text-lg font-semibold text-myslt-text-primary">Edit User</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={selectedUser.phone}
                  onChange={(e) => setSelectedUser({...selectedUser, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value as User['role']})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="CSR">CSR</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={selectedUser.department}
                  onChange={(e) => setSelectedUser({...selectedUser, department: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="p-6 border-t border-myslt-border flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setUsers(users.map(u => u.id === selectedUser.id ? selectedUser : u));
                  setShowEditModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-myslt-card rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-myslt-accent/20">
              <h3 className="text-lg font-semibold text-myslt-text-primary">Confirm Delete</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700">
                Are you sure you want to delete user <strong>{selectedUser.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="p-6 border-t border-myslt-border flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setUsers(users.filter(u => u.id !== selectedUser.id));
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
