import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, MapPin, Edit, Camera } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account and preferences</p>
        </div>
        <button className="btn-primary flex items-center">
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card p-6 text-center">
            <div className="relative inline-block">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover mx-auto"
                />
              ) : (
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                  <User className="w-12 h-12 text-primary-600" />
                </div>
              )}
              <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border">
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mt-4">
              {user?.firstName} {user?.lastName}
            </h2>
            
            <div className="flex items-center justify-center text-gray-500 mt-2">
              <Mail className="w-4 h-4 mr-2" />
              <span className="text-sm">{user?.email}</span>
            </div>
            
            <div className="flex items-center justify-center text-gray-500 mt-1">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="text-sm">Your Neighborhood</span>
            </div>

            {user?.isVerified && (
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-3">
                ✓ Verified Neighbor
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={user?.firstName || ''}
                  readOnly
                  className="input bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={user?.lastName || ''}
                  readOnly
                  className="input bg-gray-50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  readOnly
                  className="input bg-gray-50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell your neighbors about yourself..."
                  className="textarea bg-gray-50"
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                  <p className="text-sm text-gray-500">Receive updates via email</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Safety Alerts</h4>
                  <p className="text-sm text-gray-500">Get notified of safety incidents</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Show Contact Info</h4>
                  <p className="text-sm text-gray-500">Let neighbors see your contact information</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Activity</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600">12</p>
                <p className="text-sm text-gray-500">Forum Posts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">5</p>
                <p className="text-sm text-gray-500">Items Sold</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">2</p>
                <p className="text-sm text-gray-500">Safety Reports</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">8</p>
                <p className="text-sm text-gray-500">Connections</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
