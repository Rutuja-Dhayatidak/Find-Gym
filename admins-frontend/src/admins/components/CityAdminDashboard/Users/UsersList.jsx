import React, { useState, useEffect, useCallback } from 'react';
import { getAllUsers } from '../../../../services/cityAdminApi';
import UserDetails from './UserDetails';
import BlockUserModal from './BlockUserModal';
import { Users, Monitor, Smartphone, Search, RotateCw, Mail, Phone, Calendar, UserPlus } from 'lucide-react';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignedCities, setAssignedCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userType, setUserType] = useState('all');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, limit: 10, totalCount: 0 });
  const [stats, setStats] = useState({ total: 0, website: 0, mobile: 0, newThisMonth: 0 });

  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [blockModalInfo, setBlockModalInfo] = useState({ isOpen: false, user: null, action: 'block' });

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem('admin') || '{}');
    const cities = admin.assignedCities || [];
    setAssignedCities(cities);
    if (cities.length > 0) {
      setSelectedCity(cities[0]);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        city: selectedCity || undefined,
        search: searchTerm || undefined,
        status: statusFilter,
        userType,
        page: pagination.currentPage,
        limit: pagination.limit
      };
      const res = await getAllUsers(params);
      if (res.success) {
        setUsers(res.data.users);
        setPagination(res.data.pagination);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      } else {
        setError(res.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error communicating with server');
    } finally {
      setLoading(false);
    }
  }, [selectedCity, searchTerm, statusFilter, userType, pagination.currentPage, pagination.limit]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchUsers]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const openDetails = (user) => {
    // Format to have standard ID key for UserDetails
    setSelectedUser({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
      joinDate: user.joinDate
    });
    setIsDetailsModalOpen(true);
  };

  const openBlockModal = (user, action) => {
    setBlockModalInfo({
      isOpen: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      action
    });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1 && parts[1]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const getAvatarBg = (name) => {
    const colors = [
      'bg-orange-100 text-orange-700 border-orange-255',
      'bg-purple-100 text-purple-700 border-purple-255',
      'bg-blue-100 text-blue-700 border-blue-255',
      'bg-emerald-100 text-emerald-700 border-emerald-255',
      'bg-rose-100 text-rose-700 border-rose-255',
      'bg-indigo-100 text-indigo-700 border-indigo-255',
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Users Management</h1>
          <p className="text-slate-500 text-sm">View and manage gym members in your assigned city.</p>
        </div>
        
        <div className="flex gap-3 items-center w-full md:w-auto">
          {assignedCities.length > 1 && (
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setPagination(prev => ({ ...prev, currentPage: 1 }));
              }}
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer font-semibold text-slate-600"
            >
              <option value="">All Assigned Cities</option>
              {assignedCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
          
          <div className="relative flex-1 md:w-64">
            <Search className="absolute inset-y-0 left-3 my-auto text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPagination(prev => ({ ...prev, currentPage: 1 }));
              }}
              className="border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 w-full placeholder-slate-400"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-450 font-semibold uppercase tracking-wider">Total Users</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">{stats.total}</p>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-450 font-semibold uppercase tracking-wider">Website Users</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">{stats.website}</p>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-450 font-semibold uppercase tracking-wider">Mobile App Users</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">{stats.mobile}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-455 font-semibold uppercase tracking-wider">New This Month</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">{stats.newThisMonth}</p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Tabs and Filters Row */}
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
          {/* Tabs */}
          <div className="flex items-center gap-2 border border-slate-100 p-1 bg-slate-50/55 rounded-xl">
            <button
              onClick={() => {
                setUserType('all');
                setPagination(prev => ({ ...prev, currentPage: 1 }));
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                userType === 'all'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
              }`}
            >
              All Users
            </button>
            <button
              onClick={() => {
                setUserType('website');
                setPagination(prev => ({ ...prev, currentPage: 1 }));
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                userType === 'website'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
              }`}
            >
              Website Users
            </button>
            <button
              onClick={() => {
                setUserType('mobile');
                setPagination(prev => ({ ...prev, currentPage: 1 }));
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                userType === 'mobile'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
              }`}
            >
              Mobile App Users
            </button>
          </div>

          {/* Status filter and Refresh */}
          <div className="flex items-center gap-3">
            <select 
              className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-sm font-semibold text-slate-650 cursor-pointer"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination(prev => ({ ...prev, currentPage: 1 }));
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
            
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-orange-50 hover:bg-orange-100/70 text-orange-700 border border-orange-200/50 rounded-xl transition-all text-sm font-semibold"
              onClick={fetchUsers}
            >
              <RotateCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">User Type</th>
                <th className="p-4">City</th>
                <th className="p-4">Status</th>
                <th className="p-4">Join Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent"></div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-slate-400 font-medium">No users found.</td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full border flex items-center justify-center font-bold text-xs shadow-sm ${getAvatarBg(user.name)}`}>
                          {getInitials(user.name)}
                        </div>
                        <div className="font-semibold text-slate-800 text-sm hover:text-orange-500 cursor-pointer" onClick={() => openDetails(user)}>{user.name}</div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 text-sm">{user.email}</td>
                    <td className="p-4 text-slate-500 text-sm">{user.phone || '-'}</td>
                    <td className="p-4">
                      {user.userType === 'mobile' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                          <Smartphone className="w-3.5 h-3.5" />
                          Mobile App
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                          <Monitor className="w-3.5 h-3.5" />
                          Website
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-650 text-sm">{user.city || '-'}</td>
                    <td className="p-4">
                      {user.status === 'active' || !user.status ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          Blocked
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-550 text-sm">
                      {formatDate(user.joinDate || user.createdAt)}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => openDetails(user)}
                        className="px-3 py-1.5 border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 transition-colors text-xs"
                      >
                        View
                      </button>
                      {(user.status === 'active' || !user.status) ? (
                        <button 
                          onClick={() => openBlockModal(user, 'block')}
                          className="px-3 py-1.5 border border-rose-200 text-rose-600 font-semibold rounded-lg hover:bg-rose-50 transition-colors text-xs"
                        >
                          Block
                        </button>
                      ) : (
                        <button 
                          onClick={() => openBlockModal(user, 'unblock')}
                          className="px-3 py-1.5 border border-emerald-200 text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition-colors text-xs"
                        >
                          Unblock
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && pagination.totalPages > 1 && (
          <div className="p-5 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500 bg-slate-50/25">
            <div>
              Showing <span className="font-semibold text-slate-700">{(pagination.currentPage - 1) * pagination.limit + 1}</span> to <span className="font-semibold text-slate-700">{Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)}</span> of <span className="font-semibold text-slate-700">{pagination.totalCount}</span> users
            </div>
            <div className="flex items-center gap-1.5">
              <button 
                disabled={pagination.currentPage === 1}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent font-semibold transition-all text-xs"
              >
                Prev
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-xs transition-all ${
                    pagination.currentPage === p 
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'border border-slate-200 text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button 
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent font-semibold transition-all text-xs"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {isDetailsModalOpen && (
        <UserDetails 
          userId={selectedUser?.id} 
          onClose={() => setIsDetailsModalOpen(false)} 
        />
      )}

      {blockModalInfo.isOpen && (
        <BlockUserModal 
          user={blockModalInfo.user} 
          action={blockModalInfo.action}
          onClose={() => setBlockModalInfo({ isOpen: false, user: null, action: 'block' })} 
          onSuccess={fetchUsers}
        />
      )}
    </div>
  );
};

export default UsersList;

