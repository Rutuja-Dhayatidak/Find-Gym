import React, { useState, useEffect } from 'react';
import { getUserDetails } from '../../../../services/cityAdminApi';
import UserActivity from './UserActivity';

const UserDetails = ({ userId, onClose }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const response = await getUserDetails(userId);
        if (response.success) {
          setUser(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch user details:', error);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchDetails();
  }, [userId]);

  if (!userId) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">User Details</h2>
          <button onClick={onClose} className="text-slate-500 hover:bg-slate-200 p-2 rounded-full transition-colors">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : !user ? (
            <div className="text-center text-red-500 py-10">Failed to load user data.</div>
          ) : (
            <div className="space-y-8">
              {/* Profile Header */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-3xl font-bold border-4 border-white shadow-lg overflow-hidden shrink-0">
                  {user.profilePhoto ? <img src={user.profilePhoto} alt={user.fullName} className="w-full h-full object-cover" /> : user.fullName?.charAt(0)}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-slate-800">{user.fullName}</h3>
                  <p className="text-slate-500">{user.email}</p>
                  <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {user.status.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      ID: {user.id}
                    </span>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex space-x-6 text-center">
                  <div>
                    <p className="text-sm text-slate-500">Bookings</p>
                    <p className="text-xl font-bold text-slate-800">{user.totalBookings}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Spent</p>
                    <p className="text-xl font-bold text-slate-800">₹{user.totalAmount}</p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'profile' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                    Profile Info
                  </button>
                  <button
                    onClick={() => setActiveTab('activity')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'activity' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                    Activity Log
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              {activeTab === 'profile' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-slate-800 border-b pb-2">Personal Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Phone</p>
                        <p className="font-medium text-slate-800">{user.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Age</p>
                        <p className="font-medium text-slate-800">{user.age || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Gender</p>
                        <p className="font-medium text-slate-800 capitalize">{user.gender || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Location</p>
                        <p className="font-medium text-slate-800">{user.city || user.location || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-slate-800 border-b pb-2">Body Metrics</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Height</p>
                        <p className="font-medium text-slate-800">{user.height ? `${user.height} cm` : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Weight</p>
                        <p className="font-medium text-slate-800">{user.weight ? `${user.weight} kg` : 'N/A'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-slate-500">Fitness Goal</p>
                        <p className="font-medium text-slate-800 capitalize">{(user.fitnessGoal || 'N/A').replace('_', ' ')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 md:col-span-2">
                    <h4 className="text-lg font-semibold text-slate-800 border-b pb-2">Account Info</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Joined Date</p>
                        <p className="font-medium text-slate-800">{new Date(user.joinDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Last Login</p>
                        <p className="font-medium text-slate-800">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Verifications</p>
                        <div className="flex space-x-2 mt-1">
                          <span className={`px-2 py-0.5 rounded text-xs ${user.emailVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>Email {user.emailVerified ? '✓' : '✗'}</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${user.phoneVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>Phone {user.phoneVerified ? '✓' : '✗'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <UserActivity userId={user.id} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
