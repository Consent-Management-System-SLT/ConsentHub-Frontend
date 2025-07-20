import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Building, MapPin, Calendar, Edit, Save, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { customerDashboardService, CustomerProfile } from '../../services/customerDashboardService';

const CustomerProfileSection: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<CustomerProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const profileData = await customerDashboardService.getCustomerProfile();
      setProfile(profileData);
      setEditData(profileData);
    } catch (error) {
      console.error('Failed to load profile:', error);
      // Fallback to user context data
      if (user) {
        const fallbackProfile: CustomerProfile = {
          id: user.id,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          company: user.company,
          department: user.department,
          jobTitle: user.jobTitle,
          status: user.status,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt
        };
        setProfile(fallbackProfile);
        setEditData(fallbackProfile);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(profile || {});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(profile || {});
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setIsSaving(true);
      const updatedProfile = await customerDashboardService.updateProfile(editData);
      setProfile(updatedProfile);
      
      // Update auth context
      await updateUser({
        name: updatedProfile.name,
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        phone: updatedProfile.phone,
        company: updatedProfile.company,
        department: updatedProfile.department,
        jobTitle: updatedProfile.jobTitle
      });
      
      setIsEditing(false);
    } catch (error: any) {
      console.error('Failed to save profile:', error);
      alert(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof CustomerProfile, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Profile information not available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <User className="w-5 h-5 mr-2 text-blue-500" />
          Profile Information
        </h3>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center px-3 py-1.5 text-sm bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-1" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center px-3 py-1.5 text-sm bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.firstName || ''}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profile.firstName || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.lastName || ''}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profile.lastName || 'Not provided'}</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                {profile.email}
              </p>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+94 77 123 4567"
                />
              ) : (
                <p className="text-gray-900">{profile.phone || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Work Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Building className="w-4 h-4 mr-2" />
              Company
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editData.company || ''}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="SLT Mobitel"
              />
            ) : (
              <p className="text-gray-900">{profile.company || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Department
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editData.department || ''}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Marketing"
              />
            ) : (
              <p className="text-gray-900">{profile.department || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editData.jobTitle || ''}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Marketing Manager"
              />
            ) : (
              <p className="text-gray-900">{profile.jobTitle || 'Not provided'}</p>
            )}
          </div>
        </div>

        {/* Account Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Member Since
            </label>
            <p className="text-gray-900">
              {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Status
            </label>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              profile.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {profile.status || 'Active'}
            </span>
          </div>
        </div>

        {profile.lastLoginAt && (
          <div className="pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Login
            </label>
            <p className="text-gray-900">
              {new Date(profile.lastLoginAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerProfileSection;
