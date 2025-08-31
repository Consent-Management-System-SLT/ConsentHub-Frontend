import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit, Trash2, Shield, UserCheck, RefreshCw, Eye, EyeOff, X, UserX, Pause, Play, AlertTriangle } from 'lucide-react';
import { useCRUDNotifications } from '../shared/withNotifications';

// Utility function to format dates
const formatDateTime = (dateString: string | null) => {
  if (!dateString) return 'Never';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    // Less than 1 minute
    if (diffInSeconds < 60) {
      return 'Just now';
    }
    
    // Less than 1 hour
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    
    // Less than 24 hours
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    
    // Less than 7 days
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    
    // Format as full date
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'csr' | 'customer' | 'guardian';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string | null;
  createdAt: string;
  department?: string;
  jobTitle?: string;
  company?: string;
  emailVerified?: boolean;
  permissions: string[];
  hasNeverLoggedIn?: boolean; // New flag to distinguish never logged in vs recent login
  // Guardian-specific fields
  address?: string;
  relationship?: string;
  dependents?: Array<{
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    relationship: string;
  }>;
}

// Error Boundary Component
class UserManagementErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('UserManagement Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-red-800 mb-2">Something went wrong</h3>
            <p className="text-red-600 mb-4">
              {this.state.error?.message || 'An error occurred while rendering the User Management component'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
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

  // Notification hooks
  const {
    notifyCreate,
    notifyUpdate,
    notifyDelete,
    notifyCustom
  } = useCRUDNotifications();

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'csr' as User['role'],
    department: '',
    permissions: [] as string[],
    // Guardian-specific fields
    firstName: '',
    lastName: '',
    address: '',
    relationship: 'parent',
    dependents: [] as Array<{
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      relationship: string;
    }>
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Edit guardian state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedGuardian, setSelectedGuardian] = useState<any>(null);
  const [editGuardianData, setEditGuardianData] = useState<any>(null);

  // Helper functions for guardian dependents
  const addDependent = () => {
    setNewUser({
      ...newUser,
      dependents: [
        ...newUser.dependents,
        {
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          relationship: 'child'
        }
      ]
    });
  };

  const removeDependent = (index: number) => {
    setNewUser({
      ...newUser,
      dependents: newUser.dependents.filter((_, i) => i !== index)
    });
  };

  const updateDependent = (index: number, field: string, value: string) => {
    const updatedDependents = [...newUser.dependents];
    updatedDependents[index] = { ...updatedDependents[index], [field]: value };
    setNewUser({ ...newUser, dependents: updatedDependents });
  };

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

  // API Functions
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      
      // Fetch regular users
      const baseURL = import.meta.env.VITE_GATEWAY_API_URL || 'http://localhost:3001';
      const usersResponse = await fetch(`${baseURL}/api/v1/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!usersResponse.ok) {
        throw new Error(`Failed to fetch users: ${usersResponse.statusText}`);
      }
      
      const usersData = await usersResponse.json();
      const regularUsers = (usersData.users || []).map((user: any) => ({
        ...user,
        email: user.email || '',
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || '',
        phone: user.phone || ''
      }));
      
      // Fetch guardians
      const guardiansResponse = await fetch(`${baseURL}/api/v1/guardians`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      let guardians = [];
      if (guardiansResponse.ok) {
        const guardiansData = await guardiansResponse.json();
        guardians = (guardiansData.guardians || []).map((guardian: any) => ({
          id: guardian._id || guardian.id,
          name: `${guardian.firstName || ''} ${guardian.lastName || ''}`.trim() || 'Unknown Guardian',
          email: guardian.email || '',
          phone: guardian.phone || '',
          role: 'guardian' as const,
          status: guardian.isActive !== false ? 'active' : 'inactive',
          lastLogin: guardian.lastLoginAt, // Don't fallback to createdAt
          hasNeverLoggedIn: !guardian.lastLoginAt, // Explicit flag for guardians too
          createdAt: guardian.createdAt,
          address: guardian.address || '',
          relationship: guardian.relationship || '',
          dependents: guardian.dependents || [],
          permissions: ['guardian_consent']
        }));
      }
      
      // Combine users and guardians
      const allUsers = [...regularUsers, ...guardians];
      setUsers(allUsers);
      setTotalCount(allUsers.length);
      setLastRefresh(new Date()); // Track when data was last refreshed for real-time login updates
    } catch (err) {
      console.error('❌ UserManagement: Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const validateUserForm = () => {
    if (newUser.role === 'guardian') {
      // Guardian-specific validation
      if (!newUser.firstName.trim()) {
        setError('First name is required');
        return false;
      }
      if (!newUser.lastName.trim()) {
        setError('Last name is required');
        return false;
      }
      if (!newUser.email.trim()) {
        setError('Email is required');
        return false;
      }
      if (!/\S+@\S+\.\S+/.test(newUser.email)) {
        setError('Please enter a valid email address');
        return false;
      }
      if (!newUser.phone.trim()) {
        setError('Phone is required');
        return false;
      }
      if (newUser.dependents.length === 0) {
        setError('At least one dependent minor is required');
        return false;
      }
      // Validate each dependent
      for (const dependent of newUser.dependents) {
        if (!dependent.firstName.trim() || !dependent.lastName.trim()) {
          setError('All dependents must have first and last names');
          return false;
        }
        if (!dependent.dateOfBirth) {
          setError('All dependents must have a date of birth');
          return false;
        }
      }
    } else {
      // Regular user validation
      if (!newUser.name.trim()) {
        setError('Name is required');
        return false;
      }
      if (!newUser.email.trim()) {
        setError('Email is required');
        return false;
      }
      if (!/\S+@\S+\.\S+/.test(newUser.email)) {
        setError('Please enter a valid email address');
        return false;
      }
      if (!newUser.password) {
        setError('Password is required');
        return false;
      }
      if (newUser.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
      if (newUser.password !== newUser.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }
    return true;
  };

  // Real-time email validation helper
  const checkEmailExists = (email: string) => {
    if (!email.trim()) return false;
    return users.some(user => 
      user.email && user.email.toLowerCase() === email.toLowerCase()
    );
  };

  const handleAddUser = async () => {
    if (!validateUserForm()) return;
    
    // Check if email already exists
    const emailExists = users.some(user => 
      user.email && user.email.toLowerCase() === newUser.email.toLowerCase()
    );
    
    if (emailExists) {
      setError(`⚠️ User with email "${newUser.email}" is already registered in the system. Please use a different email address.`);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      
      let response, data;
      
      if (newUser.role === 'guardian') {
        // Create guardian with dependents
        const baseURL = import.meta.env.VITE_GATEWAY_API_URL || 'http://localhost:3001';
        response = await fetch(`${baseURL}/api/v1/guardians`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            phone: newUser.phone,
            address: newUser.address,
            relationship: newUser.relationship,
            dependents: newUser.dependents
          })
        });
        
        data = await response.json();
        
        if (!response.ok) {
          // Handle specific error messages from backend
          if (response.status === 409 || (data.message && data.message.includes('already exists'))) {
            throw new Error(`⚠️ User with email "${newUser.email}" is already registered in the system. Please use a different email address.`);
          }
          throw new Error(data.message || 'Failed to create guardian');
        }
        
        // Add the new guardian to the list (transform guardian to user format)
        const guardianAsUser: User = {
          ...data.guardian,
          role: 'guardian' as const
        };
        setUsers([...users, guardianAsUser]);
      } else {
        // Create regular user
        const baseURL = import.meta.env.VITE_GATEWAY_API_URL || 'http://localhost:3001';
        response = await fetch(`${baseURL}/api/v1/users`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: newUser.name,
            email: newUser.email,
            password: newUser.password,
            phone: newUser.phone,
            role: newUser.role,
            department: newUser.department
          })
        });
        
        data = await response.json();
        
        if (!response.ok) {
          // Handle specific error messages from backend
          if (response.status === 409 || (data.message && data.message.includes('already exists'))) {
            throw new Error(`⚠️ User with email "${newUser.email}" is already registered in the system. Please use a different email address.`);
          }
          throw new Error(data.message || 'Failed to create user');
        }
        
        // Add the new user to the list
        setUsers([...users, data.user]);
      }
      
      setTotalCount(prev => prev + 1);
      
      // Show success message
      setError(null);
      setSuccessMessage(`✅ Successfully created ${newUser.role === 'guardian' ? 'guardian' : 'user'}: ${newUser.email}`);
      
      // Send notification
      const entityName = newUser.firstName && newUser.lastName 
        ? `${newUser.firstName} ${newUser.lastName}` 
        : newUser.name || newUser.email;
      
      if (newUser.role === 'guardian') {
        notifyCreate('guardian', entityName, {
          email: newUser.email,
          dependentsCount: newUser.dependents?.length || 0
        });
      } else {
        notifyCreate('user', entityName, {
          email: newUser.email,
          role: newUser.role,
          department: newUser.department
        });
      }
      
      // Reset form
      setNewUser({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'csr',
        department: '',
        permissions: [],
        firstName: '',
        lastName: '',
        address: '',
        relationship: 'parent',
        dependents: []
      });
      
      setShowAddModal(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user/guardian');
      console.error('Error creating user/guardian:', err);
    } finally {
      setLoading(false);
    }
  };

  // Guardian editing functions
  const handleEditGuardian = (user: User) => {
    if (user.role !== 'guardian') return;
    
    // Normalize dependents data - handle both data structures
    const dependentsData = user.dependents || (user as any).minorDependents || [];
    const normalizedDependents = dependentsData.map((dep: any) => {
      // If the dependent has a 'name' field, split it into firstName and lastName
      if (dep.name && !dep.firstName && !dep.lastName) {
        const nameParts = dep.name.split(' ');
        return {
          ...dep,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || ''
        };
      }
      return dep;
    });
    
    setSelectedGuardian(user);
    setEditGuardianData({
      id: user.id,
      firstName: user.name ? user.name.split(' ')[0] : '',
      lastName: user.name ? user.name.split(' ').slice(1).join(' ') : '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      relationship: user.relationship || 'parent',
      dependents: normalizedDependents
    });
    setIsEditModalOpen(true);
  };

  const addDependentToEdit = () => {
    setEditGuardianData({
      ...editGuardianData,
      dependents: [
        ...editGuardianData.dependents,
        {
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          relationship: 'child'
        }
      ]
    });
  };

  const removeDependentFromEdit = (index: number) => {
    setEditGuardianData({
      ...editGuardianData,
      dependents: editGuardianData.dependents.filter((_: any, i: number) => i !== index)
    });
  };

  const updateDependentInEdit = (index: number, field: string, value: string) => {
    const updatedDependents = editGuardianData.dependents.map((dep: any, i: number) => {
      if (i === index) {
        const updatedDep = { ...dep, [field]: value };
        // Also update the name field when firstName or lastName changes
        if (field === 'firstName' || field === 'lastName') {
          const firstName = field === 'firstName' ? value : (updatedDep.firstName || '');
          const lastName = field === 'lastName' ? value : (updatedDep.lastName || '');
          updatedDep.name = `${firstName} ${lastName}`.trim();
        }
        return updatedDep;
      }
      return dep;
    });
    setEditGuardianData({
      ...editGuardianData,
      dependents: updatedDependents
    });
  };

  const handleUpdateGuardian = async () => {
    if (!editGuardianData) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      const baseURL = import.meta.env.VITE_GATEWAY_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseURL}/api/v1/guardians/${editGuardianData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: editGuardianData.firstName,
          lastName: editGuardianData.lastName,
          email: editGuardianData.email,
          phone: editGuardianData.phone,
          address: editGuardianData.address,
          relationship: editGuardianData.relationship,
          minorDependents: editGuardianData.dependents
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update guardian');
      }

      // Refresh the user list to show updated data
      await fetchUsers();
      
      setSuccessMessage(`✅ Successfully updated guardian: ${editGuardianData.email}`);
      
      // Send notification
      const entityName = editGuardianData.firstName && editGuardianData.lastName 
        ? `${editGuardianData.firstName} ${editGuardianData.lastName}` 
        : editGuardianData.email;
      
      notifyUpdate('guardian', entityName, {
        email: editGuardianData.email,
        dependentsCount: editGuardianData.dependents?.length || 0
      });
      
      setIsEditModalOpen(false);
      setSelectedGuardian(null);
      setEditGuardianData(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update guardian');
      console.error('Error updating guardian:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load users on component mount and set up auto-refresh for real-time last login updates
  useEffect(() => {
    fetchUsers();
    
    // Set up auto-refresh every 30 seconds for real-time last login updates
    const refreshInterval = setInterval(() => {
      fetchUsers();
    }, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  const handleEditUser = (user: User) => {
    if (user.role === 'guardian') {
      handleEditGuardian(user);
    } else {
      setSelectedUser(user);
      setShowEditModal(true);
    }
  };

  // const handleUpdateUser = () => {
  //   if (!selectedUser) return;
  //   
  //   setUsers(users.map(u => u.id === selectedUser.id ? selectedUser : u));
  //   setShowEditModal(false);
  //   setSelectedUser(null);
  // };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const baseURL = import.meta.env.VITE_GATEWAY_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseURL}/api/v1/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          confirmDelete: true,
          reason: `Deleted by admin via UserManagement interface`
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Remove user from local state
        setUsers(users.filter(u => u.id !== userToDelete.id));
        setSuccessMessage(`User ${userToDelete.name} deleted successfully`);
        
        // Send notification
        const entityName = userToDelete.name || userToDelete.email;
        if (userToDelete.role === 'guardian') {
          notifyDelete('guardian', entityName, {
            email: userToDelete.email,
            role: userToDelete.role
          });
        } else {
          notifyDelete('user', entityName, {
            email: userToDelete.email,
            role: userToDelete.role
          });
        }
      } else {
        setError(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user. Please try again.');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setUserToDelete(null);
      // Clear messages after delay
      setTimeout(() => {
        setError(null);
        setSuccessMessage(null);
      }, 3000);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: User['status']) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const baseURL = import.meta.env.VITE_GATEWAY_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseURL}/api/v1/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          reason: `Status changed to ${newStatus} by admin via UserManagement interface`
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Update user in local state
        setUsers(users.map(u => 
          u.id === userId 
            ? { ...u, status: newStatus }
            : u
        ));
        setSuccessMessage(`User status updated to ${newStatus} successfully`);
        
        // Send notification
        const updatedUser = users.find(u => u.id === userId);
        if (updatedUser) {
          const entityName = updatedUser.name || updatedUser.email;
          notifyCustom(
            'user',
            newStatus === 'active' ? 'success' : 'warning',
            `User Status Changed`,
            `User ${entityName} status changed to ${newStatus}.`,
            {
              userId: userId,
              oldStatus: updatedUser.status,
              newStatus: newStatus,
              email: updatedUser.email
            }
          );
        }
      } else {
        setError(data.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      setError('Failed to update user status. Please try again.');
    } finally {
      setLoading(false);
      // Clear messages after delay
      setTimeout(() => {
        setError(null);
        setSuccessMessage(null);
      }, 3000);
    }
  };

  const filteredUsers = users.filter(user => {
    // Skip users with invalid data
    if (!user || !user.id) {
      console.warn('⚠️  UserManagement: Skipping invalid user:', user);
      return false;
    }
    
    const userName = (user.name && user.name !== 'undefined undefined') ? user.name : '';
    const userEmail = user.email || '';
    
    // Skip users with completely invalid names and emails
    if (!userName && !userEmail) {
      // Silently skip users with no valid name/email data
      return false;
    }
    
    const searchQuery = searchTerm.toLowerCase().trim();
    const matchesSearch = !searchQuery || 
                         userName.toLowerCase().includes(searchQuery) ||
                         userEmail.toLowerCase().includes(searchQuery);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const shouldInclude = matchesSearch && matchesRole && matchesStatus;
    
    return shouldInclude;
  });

  // Sort users by last login time - most recent first
  const sortedUsers = filteredUsers.sort((a, b) => {
    // Users who have never logged in go to the bottom
    if (a.hasNeverLoggedIn && !b.hasNeverLoggedIn) return 1;
    if (!a.hasNeverLoggedIn && b.hasNeverLoggedIn) return -1;
    if (a.hasNeverLoggedIn && b.hasNeverLoggedIn) {
      // Both never logged in, sort by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    
    // Both have logged in, sort by last login time (most recent first)
    if (a.lastLogin && b.lastLogin) {
      return new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime();
    }
    
    // Fallback to creation date if login times are missing
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return <Shield className="w-4 h-4 text-red-600" />;
      case 'csr':
        return <Users className="w-4 h-4 text-green-600" />;
      case 'customer':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'guardian':
        return <UserCheck className="w-4 h-4 text-purple-600" />;
      default:
        return <Users className="w-4 h-4 text-myslt-text-secondary" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'csr':
        return 'bg-myslt-success/10 text-myslt-success';
      case 'customer':
        return 'bg-blue-100 text-blue-800';
      case 'guardian':
        return 'bg-purple-100 text-purple-800';
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

  // Early return for error state with fallback UI
  if (error && users.length === 0) {
    console.error('🔴 UserManagement: Error state with no users:', error);
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Users</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-myslt-text-primary truncate">User Management</h1>
          <p className="text-myslt-text-secondary mt-1 sm:mt-2 text-sm sm:text-base">
            Manage user accounts and permissions {totalCount > 0 && `(${totalCount} total users)`}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 shrink-0">
          <button 
            onClick={() => {
              setShowAddModal(true);
              setError(null);
            }}
            disabled={loading}
            className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
          <button 
            onClick={fetchUsers}
            disabled={loading}
            className="px-3 sm:px-4 py-2 bg-myslt-primary text-white rounded-lg hover:bg-myslt-primary/90 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 text-sm font-medium"
            title={lastRefresh ? `Last updated: ${lastRefresh.toLocaleTimeString()}` : 'Click to refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          {lastRefresh && (
            <span className="text-xs text-gray-500 hidden sm:block">
              Updated: {formatDateTime(lastRefresh.toISOString())}
            </span>
          )}
        </div>
      </div>
      
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <div className="text-green-400 mr-3">
              <UserCheck className="w-5 h-5" />
            </div>
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="text-red-400 mr-3">
              <X className="w-5 h-5" />
            </div>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800 font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <div className="bg-myslt-card rounded-lg sm:rounded-xl shadow-sm border border-myslt-accent/20 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-myslt-text-secondary">Total Users</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-myslt-success">{users.length}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-myslt-accent/20 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-myslt-success" />
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
                {users.filter(u => u.role === 'admin').length}
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
                {users.filter(u => u.role === 'csr').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-myslt-accent/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-myslt-primary" />
            </div>
          </div>
        </div>
        
        <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-myslt-text-secondary">Guardians</p>
              <p className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.role === 'guardian').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-myslt-accent/20 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-purple-600" />
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
            <option value="admin">Admin</option>
            <option value="csr">CSR</option>
            <option value="customer">Customer</option>
            <option value="guardian">Guardian</option>
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
      {loading && users.length === 0 ? (
        <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20 p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-myslt-primary mx-auto mb-4"></div>
            <p className="text-myslt-text-secondary">Loading users...</p>
          </div>
        </div>
      ) : error && users.length === 0 ? (
        <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20 p-8">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-myslt-text-primary mb-2">Error Loading Users</h3>
            <p className="text-myslt-text-secondary mb-4">{error}</p>
            <button
              onClick={fetchUsers}
              className="px-4 py-2 bg-myslt-primary text-white rounded-lg hover:bg-myslt-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-myslt-background">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-myslt-text-secondary uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-myslt-text-secondary uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-myslt-text-secondary uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-myslt-text-secondary uppercase tracking-wider">
                    Last Login
                    <span className="ml-1 text-xs text-green-600" title="Sorted by most recent login first">↓</span>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-myslt-text-secondary uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-myslt-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-myslt-card divide-y divide-myslt-accent/20">
                {sortedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <div className="text-myslt-text-secondary">
                        {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' 
                          ? 'No users found matching your search criteria.'
                          : 'No users found. Create your first user to get started.'
                        }
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedUsers.map((user, index) => (
                <tr key={`${user.id}-${user.email || 'no-email'}-${index}`} className="hover:bg-myslt-background">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-myslt-accent/20 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-myslt-text-primary" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-myslt-text-primary">
                          {(user.name && user.name !== 'undefined undefined') ? user.name : (user.email || 'Unknown User')}
                        </div>
                        <div className="text-sm text-myslt-text-secondary">{user.email || 'No email'}</div>
                        {user.phone && <div className="text-xs text-gray-400">{user.phone}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getRoleIcon(user.role)}
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-myslt-text-primary">
                    <div className="flex flex-col">
                      {user.hasNeverLoggedIn ? (
                        <>
                          <span className="font-medium text-gray-400">Never logged in</span>
                          <span className="text-xs text-gray-500">
                            Created: {new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="font-medium text-gray-900">
                            {formatDateTime(user.lastLogin)}
                          </span>
                          {user.lastLogin && (
                            <span className="text-xs text-gray-500">
                              {new Date(user.lastLogin).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-myslt-text-primary">{user.department || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="text-myslt-primary hover:text-myslt-primary-dark p-2 hover:bg-myslt-service-card rounded transition-colors"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      {/* Quick Status Actions */}
                      {user.status === 'active' ? (
                        <>
                          <button 
                            onClick={() => handleStatusChange(user.id, 'inactive')}
                            className="text-orange-600 hover:text-orange-800 p-2 hover:bg-orange-50 rounded transition-colors"
                            title="Deactivate User"
                            disabled={loading}
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleStatusChange(user.id, 'suspended')}
                            className="text-yellow-600 hover:text-yellow-800 p-2 hover:bg-yellow-50 rounded transition-colors"
                            title="Suspend User"
                            disabled={loading}
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        </>
                      ) : user.status === 'inactive' ? (
                        <>
                          <button 
                            onClick={() => handleStatusChange(user.id, 'active')}
                            className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded transition-colors"
                            title="Activate User"
                            disabled={loading}
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleStatusChange(user.id, 'suspended')}
                            className="text-yellow-600 hover:text-yellow-800 p-2 hover:bg-yellow-50 rounded transition-colors"
                            title="Suspend User"
                            disabled={loading}
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => handleStatusChange(user.id, 'active')}
                          className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded transition-colors"
                          title="Reactivate User"
                          disabled={loading}
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      
                      {/* Delete button - only if not admin */}
                      {user.role !== 'admin' && (
                        <button 
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition-colors"
                          title="Delete User"
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-10 z-50 flex items-center justify-center p-4">
          <div className={`bg-white rounded-xl shadow-2xl border border-gray-200 ${
            newUser.role === 'guardian' ? 'max-w-2xl w-full max-h-[90vh] overflow-y-auto' : 'max-w-md w-full'
          }`}>
            <div className="p-6 border-b border-gray-200 bg-white rounded-t-xl">
              <h3 className="text-lg font-semibold text-gray-900">
                {newUser.role === 'guardian' ? 'Add New Guardian' : 'Add New User'}
              </h3>
            </div>
            <div className="p-6 space-y-4 bg-white">
              {/* Role Selection - Always First */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => {
                    const role = e.target.value as User['role'];
                    setNewUser({
                      ...newUser,
                      role,
                      // Reset form fields when changing role
                      name: '',
                      firstName: '',
                      lastName: '',
                      address: '',
                      dependents: role === 'guardian' ? [{ firstName: '', lastName: '', dateOfBirth: '', relationship: 'child' }] : []
                    });
                    setError(null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="csr">CSR</option>
                  <option value="admin">Admin</option>
                  <option value="customer">Customer</option>
                  <option value="guardian">Guardian</option>
                </select>
              </div>

              {newUser.role === 'guardian' ? (
                <>
                  {/* Guardian Form Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">First Name</label>
                      <input
                        type="text"
                        value={newUser.firstName}
                        onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={newUser.lastName}
                        onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Email</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => {
                        setNewUser({...newUser, email: e.target.value});
                        // Clear error when user starts typing
                        if (error && error.includes('email')) {
                          setError(null);
                        }
                      }}
                      onBlur={() => {
                        // Check for duplicate email on blur
                        if (newUser.email && checkEmailExists(newUser.email)) {
                          setError(`⚠️ User with email "${newUser.email}" is already registered in the system.`);
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                        newUser.email && checkEmailExists(newUser.email) 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-300'
                      }`}
                      placeholder="guardian@example.com"
                    />
                    {newUser.email && checkEmailExists(newUser.email) && (
                      <p className="text-red-500 text-xs mt-1">⚠️ This email is already registered</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="0771234567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Address</label>
                    <textarea
                      value={newUser.address}
                      onChange={(e) => setNewUser({...newUser, address: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Home address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Relationship</label>
                    <select
                      value={newUser.relationship}
                      onChange={(e) => setNewUser({...newUser, relationship: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="parent">Parent</option>
                      <option value="guardian">Legal Guardian</option>
                      <option value="grandparent">Grandparent</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Dependents Section */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-900">Dependent Minors</h4>
                      <button
                        type="button"
                        onClick={addDependent}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Minor</span>
                      </button>
                    </div>
                    
                    {newUser.dependents.map((dependent, index) => (
                      <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-sm font-medium text-gray-800">Minor #{index + 1}</h5>
                          {newUser.dependents.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeDependent(index)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
                            <input
                              type="text"
                              value={dependent.firstName}
                              onChange={(e) => updateDependent(index, 'firstName', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-transparent"
                              placeholder="Child's first name"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
                            <input
                              type="text"
                              value={dependent.lastName}
                              onChange={(e) => updateDependent(index, 'lastName', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-transparent"
                              placeholder="Child's last name"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth</label>
                            <input
                              type="date"
                              value={dependent.dateOfBirth}
                              onChange={(e) => updateDependent(index, 'dateOfBirth', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Relationship</label>
                            <select
                              value={dependent.relationship}
                              onChange={(e) => updateDependent(index, 'relationship', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-transparent"
                            >
                              <option value="child">Child</option>
                              <option value="stepchild">Step Child</option>
                              <option value="ward">Ward</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {/* Regular User Form Fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Name</label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Email</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => {
                        setNewUser({...newUser, email: e.target.value});
                        // Clear error when user starts typing
                        if (error && error.includes('email')) {
                          setError(null);
                        }
                      }}
                      onBlur={() => {
                        // Check for duplicate email on blur
                        if (newUser.email && checkEmailExists(newUser.email)) {
                          setError(`⚠️ User with email "${newUser.email}" is already registered in the system.`);
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                        newUser.email && checkEmailExists(newUser.email) 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-300'
                      }`}
                      placeholder="user@example.com"
                    />
                    {newUser.email && checkEmailExists(newUser.email) && (
                      <p className="text-red-500 text-xs mt-1">⚠️ This email is already registered</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter password (min 6 characters)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={newUser.confirmPassword}
                        onChange={(e) => setNewUser({...newUser, confirmPassword: e.target.value})}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Confirm password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Department</label>
                    <input
                      type="text"
                      value={newUser.department}
                      onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}
            </div>
            {error && (
              <div className="p-6 pt-0 bg-white">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}
            <div className="p-6 border-t border-gray-200 bg-white rounded-b-xl flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setError(null);
                }}
                disabled={loading}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                disabled={loading || (newUser.role === 'guardian' ? (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.phone || newUser.dependents.length === 0) : (!newUser.name || !newUser.email || !newUser.password || newUser.password !== newUser.confirmPassword))}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  newUser.role === 'guardian' ? 'Add Guardian' : 'Add User'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-25 z-50 flex items-center justify-center p-4">
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
                  <option value="csr">CSR</option>
                  <option value="admin">Admin</option>
                  <option value="customer">Customer</option>
                  <option value="guardian">Guardian</option>
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
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="text-red-500 mr-3">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-700 mb-2">
                  Are you sure you want to delete the following user?
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-gray-900">
                    {(userToDelete.name && userToDelete.name !== 'undefined undefined') ? userToDelete.name : 'Unknown User'}
                  </p>
                  <p className="text-gray-600 text-sm">{userToDelete.email}</p>
                  <p className="text-gray-600 text-sm capitalize">Role: {userToDelete.role}</p>
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <X className="w-5 h-5 text-red-500 mr-2" />
                  <p className="text-red-800 text-sm font-medium">
                    This action cannot be undone. All user data will be permanently deleted.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
                disabled={loading}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>{loading ? 'Deleting...' : 'Delete User'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Guardian Modal */}
      {isEditModalOpen && editGuardianData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-myslt-text-primary">Edit Guardian</h2>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {/* Guardian Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-myslt-text-primary mb-4">Guardian Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={editGuardianData.firstName}
                      onChange={(e) => setEditGuardianData({...editGuardianData, firstName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="First Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={editGuardianData.lastName}
                      onChange={(e) => setEditGuardianData({...editGuardianData, lastName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Last Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={editGuardianData.email}
                      onChange={(e) => setEditGuardianData({...editGuardianData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="guardian@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={editGuardianData.phone}
                      onChange={(e) => setEditGuardianData({...editGuardianData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={editGuardianData.address}
                      onChange={(e) => setEditGuardianData({...editGuardianData, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Full Address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relationship to Dependents</label>
                    <select
                      value={editGuardianData.relationship}
                      onChange={(e) => setEditGuardianData({...editGuardianData, relationship: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="parent">Parent</option>
                      <option value="guardian">Guardian</option>
                      <option value="grandparent">Grandparent</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dependents Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-myslt-text-primary">Minor Dependents</h3>
                  <button
                    onClick={addDependentToEdit}
                    className="flex items-center gap-2 bg-myslt-primary text-white px-4 py-2 rounded-lg hover:bg-myslt-primary-dark transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Child
                  </button>
                </div>
                
                <div className="space-y-4">
                  {editGuardianData.dependents.map((dependent: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-md font-medium text-gray-700">Child {index + 1}</h4>
                        <button
                          onClick={() => removeDependentFromEdit(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Remove Child"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                          <input
                            type="text"
                            value={dependent.firstName || (dependent.name ? dependent.name.split(' ')[0] : '') || ''}
                            onChange={(e) => updateDependentInEdit(index, 'firstName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="First Name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                          <input
                            type="text"
                            value={dependent.lastName || (dependent.name ? dependent.name.split(' ').slice(1).join(' ') : '') || ''}
                            onChange={(e) => updateDependentInEdit(index, 'lastName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="Last Name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                          <input
                            type="date"
                            value={dependent.dateOfBirth || ''}
                            onChange={(e) => updateDependentInEdit(index, 'dateOfBirth', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {editGuardianData.dependents.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No children added yet</p>
                      <p className="text-sm">Click "Add Child" to add a dependent</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateGuardian}
                disabled={loading}
                className="px-6 py-2 bg-myslt-primary text-white rounded-lg hover:bg-myslt-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  'Update Guardian'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Wrapped component with error boundary
const UserManagementWithErrorBoundary: React.FC = () => {
  return (
    <UserManagementErrorBoundary>
      <UserManagement />
    </UserManagementErrorBoundary>
  );
};

export default UserManagementWithErrorBoundary;
