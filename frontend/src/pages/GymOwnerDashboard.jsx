import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../userServices/api';
import {
  Plus,
  Trash2,
  ShieldAlert,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  LogOut,
  LayoutDashboard,
  Dumbbell,
  User,
  Landmark,
  FileText,
  Building,
  Menu,
  X,
  Eye,
  Settings,
  CreditCard
} from 'lucide-react';

const GymOwnerDashboard = () => {
  const navigate = useNavigate();
  const [owner, setOwner] = useState(null);
  const [gyms, setGyms] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [membershipsLoading, setMembershipsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // overview, kyc, memberships
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedGymForModal, setSelectedGymForModal] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('gymOwnerToken');
    localStorage.removeItem('gymOwner');
    navigate('/gym-owner/login');
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/gyms');
      if (response.data.success) {
        setGyms(response.data.data);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        setError('Failed to fetch gyms data.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberships = async () => {
    try {
      setMembershipsLoading(true);
      const response = await api.get('/memberships/owner');
      if (response.data.success) {
        setMemberships(response.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch memberships data.');
    } finally {
      setMembershipsLoading(false);
    }
  };

  useEffect(() => {
    const storedOwner = localStorage.getItem('gymOwner');
    if (!storedOwner) {
      navigate('/gym-owner/login');
      return;
    }
    setOwner(JSON.parse(storedOwner));
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'memberships') {
      fetchMemberships();
    }
  }, [activeTab]);

  const handleDeleteGym = async (gymId) => {
    if (!window.confirm("Are you sure you want to delete this gym? This action cannot be undone.")) return;
    try {
      const response = await api.delete(`/gyms/${gymId}`);
      if (response.data.success) {
        setGyms(prev => prev.filter(g => g._id !== gymId));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete gym.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex justify-center items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-t-orange-500 border-slate-200 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const verifiedGymsCount = gyms.filter(g => g.verified).length;
  const pendingGymsCount = gyms.filter(g => !g.verified).length;
  const totalCapacity = gyms.reduce((acc, curr) => acc + (curr.capacity || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row relative">
      {/* Sidebar - Dark theme matching city admin */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 md:translate-x-0 md:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-orange-500" />
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-orange-600">
              livesale.Fitness Owner
            </span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-grow p-4 space-y-1.5">
          <button
            onClick={() => {
              setActiveTab('overview');
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'overview'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'text-slate-300 hover:bg-slate-805 hover:text-white'
              }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('memberships');
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'memberships'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'text-slate-300 hover:bg-slate-805 hover:text-white'
              }`}
          >
            <CreditCard className="w-5 h-5" />
            <span>Memberships</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('kyc');
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'kyc'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'text-slate-300 hover:bg-slate-805 hover:text-white'
              }`}
          >
            <FileText className="w-5 h-5" />
            <span>KYC Profile</span>
          </button>

          <Link
            to="/gym-owner/add-gym"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-805 hover:text-white transition font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Gym</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-red-600 hover:text-white text-slate-300 rounded-xl transition font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800 focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-slate-800 capitalize">
              {activeTab === 'overview' ? 'Dashboard Overview' : 'KYC Verification Details'}
            </h2>
          </div>

          <div className="flex items-center space-x-6">
            {owner && (
              <span className={`px-2.5 py-1 text-xs rounded-full font-semibold border ${owner.status === 'active'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                }`}>
                {owner.status === 'active' ? '● Verified' : '● Verification Pending'}
              </span>
            )}

            <div className="relative">
              <button className="text-slate-500 hover:text-orange-500 transition-colors relative">
                <span className="text-xl">🔔</span>
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
            </div>

            {owner && (
              <div className="flex items-center space-x-3 border-l pl-6 border-slate-200">
                <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold border border-orange-200 shadow-sm">
                  {(() => {
                    const name = owner.name || 'Gym Owner';
                    const parts = name.trim().split(' ');
                    if (parts.length >= 2) {
                      return (parts[0][0] + parts[1][0]).toUpperCase();
                    }
                    return name.substring(0, 2).toUpperCase();
                  })()}
                </div>
                <div className="hidden md:block text-sm text-left">
                  <p className="font-semibold text-slate-800 leading-none">{owner.name}</p>
                  <p className="text-slate-500 text-xs mt-1 leading-none">{owner.email}</p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Content body */}
        <main className="flex-grow p-6 md:p-8 space-y-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {activeTab === 'overview' && (
            <>
              {/* Verification alert message */}
              {owner?.status === 'pending' && (
                <div className="bg-orange-50 border border-orange-200 p-5 rounded-2xl flex items-start gap-4 text-orange-800">
                  <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5 text-orange-600" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">Account Awaiting Approval</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      Your business documents and KYC credentials are being reviewed by the city admins.
                      You can register your gyms now, but they will be made live and visible to end-customers only after the profile verification is complete.
                    </p>
                  </div>
                </div>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition">
                  <div className="text-3xl mb-2">🏢</div>
                  <div className="text-slate-550 text-sm font-semibold">Total Gyms</div>
                  <div className="text-3xl font-extrabold text-slate-800 mt-1">{gyms.length}</div>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition">
                  <div className="text-3xl mb-2">✅</div>
                  <div className="text-slate-550 text-sm font-semibold">Verified Gyms</div>
                  <div className="text-3xl font-extrabold text-green-600 mt-1">{verifiedGymsCount}</div>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition">
                  <div className="text-3xl mb-2">⏳</div>
                  <div className="text-slate-550 text-sm font-semibold">Pending Gyms</div>
                  <div className="text-3xl font-extrabold text-orange-600 mt-1">{pendingGymsCount}</div>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition">
                  <div className="text-3xl mb-2">👥</div>
                  <div className="text-slate-550 text-sm font-semibold">Total Capacity</div>
                  <div className="text-3xl font-extrabold text-slate-800 mt-1">{totalCapacity}</div>
                </div>
              </div>

              {/* Gyms Grid Section */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Building className="text-orange-500 w-5 h-5" />
                    <span>Your Registered Gyms</span>
                  </h3>
                  <Link
                    to="/gym-owner/add-gym"
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-xl text-sm font-semibold transition text-white shadow-md shadow-orange-500/20"
                  >
                    <Plus className="w-4 h-4" /> Add Gym
                  </Link>
                </div>

                {gyms.length === 0 ? (
                  <div className="bg-white border border-slate-200 p-12 text-center rounded-2xl shadow-sm">
                    <p className="text-slate-500 mb-4 font-medium">You haven't registered any gyms yet.</p>
                    <Link
                      to="/gym-owner/add-gym"
                      className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 px-6 py-2.5 rounded-xl font-semibold transition text-white shadow-lg shadow-orange-500/20"
                    >
                      <Plus className="w-5 h-5" /> Add Your First Gym
                    </Link>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm font-semibold">
                            <th className="p-4">Gym Name</th>
                            <th className="p-4">Location</th>
                            <th className="p-4">Capacity</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Setup Status</th>
                            <th className="p-4">Registered Date</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="text-slate-700 text-sm divide-y divide-slate-100">
                          {gyms.map((gym) => (
                            <tr key={gym._id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-4 font-semibold text-slate-900">
                                <div>{gym.name}</div>
                                <div className="text-xs text-slate-500 font-normal line-clamp-1 mt-0.5">{gym.description}</div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                                  <span className="line-clamp-1">{gym.location?.address}, {gym.location?.city}</span>
                                </div>
                              </td>
                              <td className="p-4">{gym.capacity} members</td>
                              <td className="p-4">
                                <span className={`px-2.5 py-0.5 text-xs rounded-full font-semibold border ${gym.verified
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                  }`}>
                                  {gym.verified ? 'Verified' : 'Pending'}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className={`px-2.5 py-0.5 text-xs rounded-full font-semibold border ${gym.setupCompleted
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-orange-50 text-orange-705 border-orange-200'
                                  }`}>
                                  {gym.setupCompleted ? 'Setup Completed' : 'Setup Incomplete'}
                                </span>
                              </td>
                              <td className="p-4 text-slate-500">
                                {new Date(gym.createdAt).toLocaleDateString()}
                              </td>
                              <td className="p-4 text-right space-x-2">
                                <button
                                  onClick={() => navigate(`/gym-setup/${gym._id}`)}
                                  className="text-orange-600 hover:text-orange-800 p-1.5 hover:bg-orange-55 rounded-lg transition inline-flex items-center justify-center"
                                  title="Setup Gym"
                                >
                                  <Settings className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setSelectedGymForModal(gym)}
                                  className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded-lg transition inline-flex items-center justify-center"
                                  title="View Gym Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteGym(gym._id)}
                                  className="text-red-655 hover:text-red-800 p-1.5 hover:bg-red-50 rounded-lg transition inline-flex items-center justify-center"
                                  title="Delete Gym"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          {activeTab === 'memberships' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <CreditCard className="text-orange-500 w-5 h-5" />
                <span>Gym Membership Bookings</span>
              </h3>

              {membershipsLoading ? (
                <div className="bg-white border border-slate-200 p-12 text-center rounded-2xl shadow-sm">
                  <div className="w-8 h-8 border-4 border-t-orange-500 border-slate-200 rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-slate-500 text-sm">Fetching memberships...</p>
                </div>
              ) : memberships.length === 0 ? (
                <div className="bg-white border border-slate-200 p-12 text-center rounded-2xl shadow-sm">
                  <p className="text-slate-500 font-medium">No memberships purchased yet.</p>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm font-semibold">
                          <th className="p-4">Customer Details</th>
                          <th className="p-4">Gym Name</th>
                          <th className="p-4">Plan Name</th>
                          <th className="p-4">Invoice No</th>
                          <th className="p-4">Price Paid</th>
                          <th className="p-4">Validity</th>
                          <th className="p-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-700 text-sm divide-y divide-slate-100">
                        {memberships.map((membership) => (
                          <tr key={membership._id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4">
                              <div className="font-semibold text-slate-900">{membership.customerId?.name || 'N/A'}</div>
                              <div className="text-xs text-slate-500">{membership.customerId?.email}</div>
                              <div className="text-xs text-slate-500">{membership.customerId?.phone}</div>
                            </td>
                            <td className="p-4 font-medium text-slate-800">
                              {membership.gymId?.name || 'N/A'}
                            </td>
                            <td className="p-4">
                              <span className="font-medium">{membership.planTitle}</span>
                              {membership.planType && (
                                <span className="text-xs text-slate-500 block">Type: {membership.planType}</span>
                              )}
                            </td>
                            <td className="p-4 font-mono text-slate-600">
                              {membership.invoiceNumber || 'N/A'}
                            </td>
                            <td className="p-4 font-semibold text-slate-900">
                              ₹{membership.pricePaid?.toLocaleString()}
                            </td>
                            <td className="p-4 text-xs text-slate-600">
                              <div>From: {membership.startDate ? new Date(membership.startDate).toLocaleDateString() : 'N/A'}</div>
                              <div>To: {membership.endDate ? new Date(membership.endDate).toLocaleDateString() : 'N/A'}</div>
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-0.5 text-xs rounded-full font-semibold border ${membership.status === 'active'
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : membership.status === 'pending'
                                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                    : 'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                {membership.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'kyc' && owner && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Details */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <User className="text-orange-500 w-5 h-5" />
                  <span>Business Profile Details</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs text-slate-450 font-semibold uppercase tracking-wider mb-1">Owner Name</label>
                    <div className="text-slate-800 font-bold">{owner.name}</div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-450 font-semibold uppercase tracking-wider mb-1">Email Address</label>
                    <div className="text-slate-800 font-bold">{owner.email}</div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-450 font-semibold uppercase tracking-wider mb-1">Phone Number</label>
                    <div className="text-slate-800 font-bold">{owner.phone || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-450 font-semibold uppercase tracking-wider mb-1">GST Number</label>
                    <div className="text-slate-800 font-bold">{owner.gstNumber || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Landmark className="text-orange-500 w-5 h-5" />
                  <span>Bank Account Information</span>
                </h3>
                {owner.bankAccount ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs text-slate-450 font-semibold uppercase tracking-wider mb-1">Bank Name</label>
                      <div className="text-slate-800 font-bold">{owner.bankAccount.bankName}</div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-450 font-semibold uppercase tracking-wider mb-1">Account Holder Name</label>
                      <div className="text-slate-800 font-bold">{owner.bankAccount.accountHolderName}</div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-450 font-semibold uppercase tracking-wider mb-1">Account Number</label>
                      <div className="text-slate-800 font-bold">{owner.bankAccount.accountNumber}</div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-450 font-semibold uppercase tracking-wider mb-1">IFSC Code</label>
                      <div className="text-slate-800 font-bold">{owner.bankAccount.ifscCode}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400 text-sm">No bank account details configured.</div>
                )}
              </div>

              {/* KYC Document Verification */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 lg:col-span-2 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <FileText className="text-orange-500 w-5 h-5" />
                  <span>KYC Documents Verification</span>
                </h3>
                {owner.kyc ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-slate-450 font-semibold uppercase tracking-wider mb-1">Aadhar Number</label>
                        <div className="text-slate-800 font-bold">{owner.kyc.aadharNumber}</div>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-450 font-semibold uppercase tracking-wider mb-1">PAN Number</label>
                        <div className="text-slate-800 font-bold">{owner.kyc.panNumber}</div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="block text-xs text-slate-450 font-semibold uppercase tracking-wider mb-1">Uploaded Documents</label>
                      <div className="flex flex-col sm:flex-row gap-4">
                        {owner.kyc.kycDocumentUrl && (
                          <a
                            href={owner.kyc.kycDocumentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 hover:border-orange-500/50 hover:bg-orange-50/10 rounded-xl transition text-slate-700 font-semibold"
                          >
                            📄 Open KYC Document
                          </a>
                        )}
                        {owner.kyc.bankProofUrl && (
                          <a
                            href={owner.kyc.bankProofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 hover:border-orange-500/50 hover:bg-orange-50/10 rounded-xl transition text-slate-700 font-semibold"
                          >
                            📄 Open Bank Proof
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400 text-sm">No KYC documents registered.</div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Gym Details Modal */}
      {selectedGymForModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedGymForModal.name}</h3>
                <span className={`mt-1.5 inline-block px-2.5 py-0.5 text-xs rounded-full font-semibold border ${selectedGymForModal.verified
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                  }`}>
                  {selectedGymForModal.verified ? 'Verified' : 'Pending Approval'}
                </span>
              </div>
              <button
                onClick={() => setSelectedGymForModal(null)}
                className="p-1.5 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-left">
              {/* Gym Images */}
              {selectedGymForModal.images && selectedGymForModal.images.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Gym Images</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedGymForModal.images.map((imgUrl, i) => (
                      <div key={i} className="aspect-video rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                        <img src={imgUrl} alt={`Gym ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gym Description */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">About Gym</h4>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {selectedGymForModal.description}
                </p>
              </div>

              {/* Grid of Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Location Address</h4>
                  <div className="text-sm font-semibold text-slate-800 flex items-start gap-1">
                    <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <span>
                      {selectedGymForModal.location?.address}, {selectedGymForModal.location?.city}, {selectedGymForModal.location?.state} - {selectedGymForModal.location?.zipCode}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-450 uppercase tracking-wider mb-1">Contact Details</h4>
                  <div className="text-sm font-semibold text-slate-800 space-y-1">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-orange-500 shrink-0" />
                      <span>{selectedGymForModal.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                      <span>{selectedGymForModal.email}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-450 uppercase tracking-wider mb-1">Capacity & Members</h4>
                  <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <Building className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>Capacity: {selectedGymForModal.capacity} / Current: {selectedGymForModal.currentMembers || 0}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-450 uppercase tracking-wider mb-1">Monthly Fee</h4>
                  <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <span className="text-base text-orange-500 font-bold">₹</span>
                    <span>₹{selectedGymForModal.monthlyRevenue?.toLocaleString() || '1,200'} / month</span>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              {selectedGymForModal.amenities && selectedGymForModal.amenities.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Amenities & Facilities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedGymForModal.amenities.map((amenity, i) => (
                      <span key={i} className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-semibold rounded-full border border-orange-100">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedGymForModal(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymOwnerDashboard;
