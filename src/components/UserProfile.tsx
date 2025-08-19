import React, { useState } from 'react';
import { User, Edit2, Save, X, Mail, Phone, Building } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: user?.company || '',
    department: user?.department || '',
    jobTitle: user?.jobTitle || '',
    role: user?.role || 'customer' as 'admin' | 'customer' | 'csr'
  });

  const handleSave = () => {
    updateUser?.(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      company: user?.company || '',
      department: user?.department || '',
      jobTitle: user?.jobTitle || '',
      role: user?.role || 'customer'
    });
    setIsEditing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-myslt-card-solid rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-myslt-accent/20 flex items-center justify-between">
          <h2 className="text-xl font-bold text-myslt-text-primary">User Profile</h2>
          <button
            onClick={onClose}
            className="p-2 text-myslt-text-muted hover:text-myslt-text-primary rounded-lg hover:bg-myslt-accent/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Profile Picture */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-myslt-primary to-myslt-primary/80 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-myslt-text-secondary mb-1">
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-myslt-accent/30 bg-myslt-service-card text-myslt-text-primary rounded-lg focus:ring-2 focus:ring-myslt-primary focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-2 bg-myslt-service-card rounded-lg">
                    <User className="w-4 h-4 text-myslt-text-muted" />
                    <span className="text-myslt-text-primary">{user?.firstName || 'Not set'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-myslt-text-secondary mb-1">
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-myslt-accent/30 bg-myslt-service-card text-myslt-text-primary rounded-lg focus:ring-2 focus:ring-myslt-primary focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-2 bg-myslt-service-card rounded-lg">
                    <User className="w-4 h-4 text-myslt-text-muted" />
                    <span className="text-myslt-text-primary">{user?.lastName || 'Not set'}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-myslt-text-secondary mb-1">
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-myslt-accent/30 bg-myslt-service-card text-myslt-text-primary rounded-lg focus:ring-2 focus:ring-myslt-primary focus:border-transparent"
                  disabled
                />
              ) : (
                <div className="flex items-center space-x-2 p-2 bg-myslt-service-card rounded-lg">
                  <Mail className="w-4 h-4 text-myslt-text-muted" />
                  <span className="text-myslt-text-primary">{user?.email || 'Not set'}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-myslt-text-secondary mb-1">
                Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-myslt-accent/30 bg-myslt-service-card text-myslt-text-primary rounded-lg focus:ring-2 focus:ring-myslt-primary focus:border-transparent"
                />
              ) : (
                <div className="flex items-center space-x-2 p-2 bg-myslt-accent/20 rounded-lg">
                  <Phone className="w-4 h-4 text-myslt-text-muted" />
                  <span className="text-myslt-text-primary">{user?.phone || 'Not set'}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-myslt-text-secondary mb-1">
                Company
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="myslt-input w-full"
                />
              ) : (
                <div className="flex items-center space-x-2 p-2 bg-myslt-accent/20 rounded-lg">
                  <Building className="w-4 h-4 text-myslt-text-muted" />
                  <span className="text-myslt-text-primary">{user?.company || 'Not set'}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-myslt-text-secondary mb-1">
                Department
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="myslt-input w-full"
                />
              ) : (
                <div className="flex items-center space-x-2 p-2 bg-myslt-accent/20 rounded-lg">
                  <Building className="w-4 h-4 text-myslt-text-muted" />
                  <span className="text-myslt-text-primary">{user?.department || 'Not set'}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-myslt-text-secondary mb-1">
                Job Title
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  className="myslt-input w-full"
                />
              ) : (
                <div className="flex items-center space-x-2 p-2 bg-myslt-accent/20 rounded-lg">
                  <Building className="w-4 h-4 text-myslt-text-muted" />
                  <span className="text-myslt-text-primary">{user?.jobTitle || 'Not set'}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-myslt-text-secondary mb-1">
                Role
              </label>
              {isEditing ? (
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'customer' })}
                  className="myslt-input w-full"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              ) : (
                <div className="flex items-center space-x-2 p-2 bg-myslt-accent/20 rounded-lg">
                  <User className="w-4 h-4 text-myslt-text-muted" />
                  <span className="text-myslt-text-primary">{user?.role || 'Not set'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-myslt-text-secondary bg-myslt-service-card rounded-lg hover:bg-myslt-card-gradient transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-myslt-primary text-white rounded-lg hover:bg-myslt-primary/90 transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-myslt-primary text-white rounded-lg hover:bg-myslt-primary/90 transition-colors flex items-center space-x-2"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
