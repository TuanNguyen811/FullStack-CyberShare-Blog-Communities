import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api';
import { X, Save, Key } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function EditProfileModal({ user, onClose }) {
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: user.displayName || '',
    bio: user.bio || '',
    about: user.about || '',
    avatarUrl: user.avatarUrl || '',
  });
  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl || '');

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    // Preview image
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setUploadingAvatar(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Don't set Content-Type header - axios will set it automatically with boundary
      // This ensures Authorization header from interceptor is preserved
      const response = await apiClient.post('/api/users/me/avatar', formData);

      // Update avatarUrl in form data
      setProfileData({
        ...profileData,
        avatarUrl: response.data.avatarUrl,
      });
      // Update auth context and localStorage so header updates immediately
      try {
        const updatedUser = { ...user, avatarUrl: response.data.avatarUrl };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        updateUser({ avatarUrl: response.data.avatarUrl });
      } catch (e) {
        console.error('Failed to update user after avatar upload', e);
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      setError(err.response?.data?.message || err.message || 'Failed to upload avatar');
      setAvatarPreview(user.avatarUrl || '');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Submitting profile update:', profileData);
      const response = await apiClient.patch('/api/users/me', profileData);
      console.log('Profile updated successfully:', response.data);
      
  // Update user in context and localStorage so header reflects changes
  const updatedUser = { ...user, ...profileData };
  localStorage.setItem('user', JSON.stringify(updatedUser));
  updateUser(profileData);
  onClose();
    } catch (err) {
      console.error('Update profile error:', err.response || err);
      setError(err.response?.data?.message || 'Failed to update profile');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0 relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
                  {profileData.displayName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}
                </div>
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Picture
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                disabled={uploadingAvatar}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF (max 5MB)</p>
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              name="displayName"
              value={profileData.displayName}
              onChange={handleChange}
              required
              minLength={1}
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your display name"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio (Short description)
            </label>
            <textarea
              name="bio"
              value={profileData.bio}
              onChange={handleChange}
              rows={2}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="A short bio about yourself..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {profileData.bio.length}/500 characters • Displayed under your name
            </p>
          </div>

          {/* About */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              About (Full description)
            </label>
            <textarea
              name="about"
              value={profileData.about}
              onChange={handleChange}
              rows={8}
              maxLength={5000}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Write a longer description about yourself, your interests, or your work..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {profileData.about.length}/5000 characters • Displayed in About tab
            </p>
          </div>

          {/* Read-only Info */}
          <div className="border-t pt-6">
            <p className="text-sm text-gray-600 mb-4">Cannot be changed:</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Username</label>
                <p className="text-sm text-gray-900">@{user.username}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                <p className="text-sm text-gray-900">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Change Password Link */}
          <div className="border-t pt-6">
            <Link to="/change-password" onClick={onClose}>
              <Button type="button" variant="outline" className="w-full gap-2">
                <Key className="h-4 w-4" />
                Change Password
              </Button>
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}