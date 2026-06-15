import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
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
  X
} from 'lucide-react';

const GymOwnerDashboard = () => {
  const navigate = useNavigate();
  const [owner, setOwner] = useState(null);
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // overview or kyc
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  useEffect(() => {
    const storedOwner = localStorage.getItem('gymOwner');
    if (!storedOwner) {
      navigate('/gym-owner/login');
      return;
    }
    setOwner(JSON.parse(storedOwner));
    fetchDashboardData();
  }, []);

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
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 md:translate-x-0 md:static ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-orange-500" />
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-orange-600">
              Find Gym Owner
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
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
              activeTab === 'overview'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'text-slate-300 hover:bg-slate-805 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('kyc');
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
              activeTab === 'kyc'
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
              <span className={`px-2.5 py-1 text-xs rounded-full font-semibold border ${
                owner.status === 'active' 
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gyms.map(gym => (
                      <div
                        key={gym._id}
                        className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between space-y-4 hover:shadow-md transition"
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{gym.name}</h3>
                            <span className={`px-2.5 py-0.5 text-xs rounded-full font-semibold shrink-0 ${
                              gym.verified 
                                ? 'bg-green-50 text-green-700 border border-green-200' 
                                : 'bg-yellow-50 text-yellow-755 border border-yellow-200'
                            }`}>
                              {gym.verified ? 'Verified' : 'Pending'}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 line-clamp-2">{gym.description}</p>
                        </div>

                        <div className="space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600 font-medium">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                            <span className="line-clamp-1">{gym.location?.address}, {gym.location?.city}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-orange-500 shrink-0" />
                            <span>Capacity: {gym.capacity} members</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                          <span className="text-[10px] text-slate-400">Registered on {new Date(gym.createdAt).toLocaleDateString()}</span>
                          <button
                            onClick={() => handleDeleteGym(gym._id)}
                            className="text-red-600 hover:text-red-800 p-1.5 hover:bg-red-50 rounded-lg transition"
                            title="Delete Gym"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
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
    </div>
  );
};

export default GymOwnerDashboard;
