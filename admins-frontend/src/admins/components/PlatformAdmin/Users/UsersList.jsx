import React, { useState, useEffect, useCallback } from 'react';
import { getAllUsers } from '../../../../services/adminApi';
import UserDetails from './UserDetails';
import BlockUserModal from './BlockUserModal';
import { Users, Monitor, Smartphone, Search, RotateCw, Mail, Phone, Calendar } from 'lucide-react';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, limit: 10, totalCount: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userType, setUserType] = useState('all');
  const [stats, setStats] = useState({ total: 0, website: 0, mobile: 0 });
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [blockModalInfo, setBlockModalInfo] = useState({ isOpen: false, user: null, action: 'block' });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
        search,
        status: statusFilter,
        userType
      };
      const response = await getAllUsers(params);
      if (response.success) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
        if (response.data.stats) {
          setStats(response.data.stats);
        }
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.limit, search, statusFilter, userType]);

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
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  const openBlockModal = (user, action) => {
    setBlockModalInfo({ isOpen: true, user, action });
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
      'bg-purple-100 text-purple-700 border-purple-200',
      'bg-blue-100 text-blue-700 border-blue-200',
      'bg-emerald-100 text-emerald-700 border-emerald-200',
      'bg-rose-100 text-rose-700 border-rose-200',
      'bg-orange-100 text-orange-700 border-orange-200',
      'bg-indigo-100 text-indigo-700 border-indigo-200',
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
      
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; 
      const formattedHours = String(hours).padStart(2, '0');

      return (
        <div className="flex items-start gap-2 text-slate-600 text-sm">
          <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
          <div className="flex flex-col">
            <span className="font-medium text-slate-700">{`${day}/${month}/${year}`}</span>
            <span className="text-xs text-slate-400">{`${formattedHours}:${minutes} ${ampm}`}</span>
          </div>
        </div>
      );
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats Card Row */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Users Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and monitor all platform users</p>
        </div>
        
        {/* Stats Cards */}
        <div className="flex flex-wrap sm:flex-nowrap gap-4 w-full lg:w-auto">
          <div className="bg-white px-5 py-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 min-w-[170px] flex-1 sm:flex-none">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Users</p>
              <p className="text-xl font-bold text-slate-800 mt-0.5">{stats.total}</p>
            </div>
          </div>
          
          <div className="bg-white px-5 py-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 min-w-[170px] flex-1 sm:flex-none">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Website Users</p>
              <p className="text-xl font-bold text-slate-800 mt-0.5">{stats.website}</p>
            </div>
          </div>
          
          <div className="bg-white px-5 py-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 min-w-[170px] flex-1 sm:flex-none">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg text-emerald-600">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Mobile Users</p>
              <p className="text-xl font-bold text-slate-800 mt-0.5">{stats.mobile}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Tabs and Filters Row */}
        <div className="p-6 border-b border-slate-200 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white">
          {/* Tabs */}
          <div className="flex items-center gap-2 border border-slate-100 p-1 bg-slate-50/55 rounded-xl">
            <button
              onClick={() => {
                setUserType('all');
                setPagination(prev => ({ ...prev, currentPage: 1 }));
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                userType === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
              }`}
            >
              <Users className="w-4 h-4" />
              All Users
            </button>
            <button
              onClick={() => {
                setUserType('website');
                setPagination(prev => ({ ...prev, currentPage: 1 }));
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                userType === 'website'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
              }`}
            >
              <Monitor className="w-4 h-4" />
              Website Users
            </button>
            <button
              onClick={() => {
                setUserType('mobile');
                setPagination(prev => ({ ...prev, currentPage: 1 }));
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                userType === 'mobile'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              Mobile App Users
            </button>
          </div>

          {/* Search, Status, Refresh */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] sm:w-64">
              <Search className="absolute inset-y-0 left-3 my-auto text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-sm placeholder-slate-400 bg-slate-50/20"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination(prev => ({ ...prev, currentPage: 1 })); 
                }}
              />
            </div>
            
            <select 
              className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm font-semibold text-slate-600 cursor-pointer"
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
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-all text-sm font-semibold"
              onClick={fetchUsers}
            >
              <RotateCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="p-4">User Info</th>
                <th className="p-4">Contact</th>
                <th className="p-4">User Type</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400 font-medium">No users found.</td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-sm shadow-sm ${getAvatarBg(user.name)}`}>
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-sm hover:text-indigo-600 cursor-pointer" onClick={() => openDetails(user)}>{user.name}</div>
                          <div className="text-xs text-slate-400 font-mono mt-0.5">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{user.phone || 'N/A'}</span>
                      </div>
                    </td>
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
                    <td className="p-4">
                      {user.status === 'active' ? (
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
                    <td className="p-4">
                      {formatDate(user.joinDate)}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => openDetails(user)}
                        className="px-3 py-1.5 border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 transition-colors text-xs"
                      >
                        View
                      </button>
                      {user.status === 'active' ? (
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
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
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

