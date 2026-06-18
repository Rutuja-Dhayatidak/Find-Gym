import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getTrainerProfile,
  getTrainerStatus,
  updateAvailability,
  reapplyTrainer
} from '../../userServices/trainerApi';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = ['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'];

const TrainerDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Reapply state
  const [reapplyFiles, setReapplyFiles] = useState({ aadharCard: null, certificates: [] });
  const [reapplyNames, setReapplyNames] = useState({ aadharCard: '' });
  const [reapplyLoading, setReapplyLoading] = useState(false);
  const [reapplyError, setReapplyError] = useState('');
  const [reapplySuccess, setReapplySuccess] = useState(false);

  // Availability state
  const [availDays, setAvailDays] = useState([]);
  const [availSlots, setAvailSlots] = useState([]);
  const [updatingAvail, setUpdatingAvail] = useState(false);
  const [availMsg, setAvailMsg] = useState('');

  // Tab state (for active users)
  const [activeTab, setActiveTab] = useState('overview');

  const fetchTrainerData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const statusRes = await getTrainerStatus();
      setStatus(statusRes.status);

      const profileRes = await getTrainerProfile();
      if (profileRes.success) {
        setProfile(profileRes.trainer);
        setAvailDays(profileRes.trainer.availability?.days || []);
        setAvailSlots(profileRes.trainer.availability?.timeSlots || []);
      }
    } catch (err) {
      setError('Session expired or unauthorized.');
      localStorage.removeItem('trainerToken');
      navigate('/trainer/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainerData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('trainerToken');
    navigate('/trainer/login');
  };

  // Availability Update Handler
  const handleSaveAvailability = async () => {
    setUpdatingAvail(true);
    setAvailMsg('');
    try {
      const res = await updateAvailability({ days: availDays, timeSlots: availSlots });
      if (res.success) {
        setAvailMsg('✅ Availability updated successfully!');
      }
    } catch (err) {
      setAvailMsg('❌ Failed to update availability.');
    } finally {
      setUpdatingAvail(false);
    }
  };

  // Reapply Form Submission Handler
  const handleReapply = async (e) => {
    e.preventDefault();
    if (!reapplyFiles.aadharCard) {
      setReapplyError('Aadhar card file is required');
      return;
    }
    setReapplyLoading(true);
    setReapplyError('');
    setReapplySuccess(false);

    try {
      const fd = new FormData();
      if (reapplyFiles.aadharCard) fd.append('aadharCard', reapplyFiles.aadharCard);
      reapplyFiles.certificates.forEach(f => fd.append('certificates', f));

      const res = await reapplyTrainer(fd);
      if (res.success) {
        setReapplySuccess(true);
        setStatus('pending');
      } else {
        setReapplyError(res.message || 'Failed to reapply.');
      }
    } catch (err) {
      setReapplyError(err?.response?.data?.message || 'Server error re-applying.');
    } finally {
      setReapplyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  // ─────────────── FLOW 1: PENDING ───────────────
  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4">
        <div className="max-w-lg w-full bg-white border border-slate-200 shadow-xl rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4 animate-pulse">⏳</div>
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Application Under Review</h1>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Thank you for registering, <span className="text-orange-500 font-semibold">{profile?.name}</span>! 
            Our admin team is currently reviewing your certificates, experience, and details. 
            You will receive an email notification as soon as your account is approved.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-sm space-y-2 mb-6">
            <div><span className="text-slate-400 font-medium">Status:</span> <span className="text-amber-500 font-bold">Pending Review</span></div>
            <div><span className="text-slate-400 font-medium">City:</span> <span className="text-slate-700 font-semibold">{profile?.city}</span></div>
            <div><span className="text-slate-400 font-medium">Specializations:</span> <span className="text-slate-700 font-semibold">{profile?.specializations?.join(', ')}</span></div>
          </div>
          <button onClick={handleLogout} className="px-6 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 transition-all text-sm font-medium text-slate-700">
            Logout
          </button>
        </div>
      </div>
    );
  }

  // ─────────────── FLOW 2: REJECTED ───────────────
  if (status === 'rejected') {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-xl mx-auto bg-white border border-slate-200 shadow-xl rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">❌</div>
            <h1 className="text-3xl font-bold text-red-600">Application Rejected</h1>
            <p className="text-slate-500 text-sm mt-1">Don't worry, you can upload correct files and re-apply</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
            <h3 className="text-red-700 font-bold mb-1">Reason for Rejection:</h3>
            <p className="text-slate-800 text-sm leading-relaxed">{profile?.rejectionReason || 'Details mismatch or incorrect certificate upload.'}</p>
          </div>

          <form onSubmit={handleReapply} className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Re-upload Documents</h3>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Aadhar Card *</label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-5 cursor-pointer hover:border-orange-500/60 transition-all bg-slate-50">
                <span className="text-2xl mb-1">📎</span>
                <span className="text-slate-500 text-sm">Upload Aadhar card (PDF/Image)</span>
                {reapplyNames.aadharCard && <span className="text-orange-600 text-xs mt-1 font-semibold">{reapplyNames.aadharCard}</span>}
                <input type="file" accept="image/*,.pdf" onChange={e => {
                  setReapplyFiles(p => ({ ...p, aadharCard: e.target.files[0] }));
                  setReapplyNames(p => ({ ...p, aadharCard: e.target.files[0]?.name || '' }));
                }} className="hidden" />
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Certificates (up to 3 files)</label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-5 cursor-pointer hover:border-orange-500/60 transition-all bg-slate-50">
                <span className="text-2xl mb-1">🏅</span>
                <span className="text-slate-500 text-sm">Upload Certificates</span>
                {reapplyFiles.certificates.length > 0 && <span className="text-orange-600 text-xs mt-1 font-semibold">{reapplyFiles.certificates.length} file(s) selected</span>}
                <input type="file" accept="image/*,.pdf" multiple onChange={e => {
                  setReapplyFiles(p => ({ ...p, certificates: Array.from(e.target.files) }));
                }} className="hidden" />
              </label>
            </div>

            {reapplyError && <div className="text-red-600 text-sm">⚠️ {reapplyError}</div>}
            {reapplySuccess && <div className="text-green-600 text-sm">✅ Reapplied successfully! Page will refresh.</div>}

            <div className="flex items-center justify-between pt-4">
              <button type="button" onClick={handleLogout} className="px-5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-all text-sm font-medium">
                Logout
              </button>
              <button type="submit" disabled={reapplyLoading} className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all text-sm disabled:opacity-50 shadow-md">
                {reapplyLoading ? 'Uploading...' : 'Submit and Re-apply'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ─────────────── FLOW 3: BLOCKED ───────────────
  if (status === 'blocked') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4">
        <div className="max-w-lg w-full bg-white border border-red-200 shadow-xl rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-red-600 mb-2">Account Blocked</h1>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Your trainer account has been suspended or blocked by the administrator. 
            Please contact customer support at <span className="text-orange-500">trainers@findgym.com</span> for details.
          </p>
          {profile?.blockedReason && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-left text-sm text-red-700 mb-6">
              <strong>Block Reason:</strong> {profile.blockedReason}
            </div>
          )}
          <button onClick={handleLogout} className="px-6 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 transition-all text-sm font-medium text-slate-700">
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Calculate profile initials
  const initials = profile?.name 
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) 
    : 'TR';

  // ─────────────── APPROVED & ACTIVE DASHBOARD (MATCHING THE SCREENSHOT THEME) ───────────────
  return (
    <div className="min-h-screen bg-[#f8fafc] flex text-slate-800">
      
      {/* 1. Left Sidebar (Platform Admin Style) */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-lg shrink-0">
        <div className="p-6 border-b border-slate-750 flex items-center justify-center">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-orange-600">
            Find Gym Trainer
          </h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-205 group ${
              activeTab === 'overview'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="text-xl group-hover:scale-110 transition-transform">📊</span>
            <span className="font-medium">Dashboard Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('availability')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-205 group ${
              activeTab === 'availability'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="text-xl group-hover:scale-110 transition-transform">🕒</span>
            <span className="font-medium">Availability Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('earnings')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-205 group ${
              activeTab === 'earnings'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="text-xl group-hover:scale-110 transition-transform">💰</span>
            <span className="font-medium">Earnings & Bookings</span>
          </button>
        </nav>
        
        <div className="p-4 border-t border-slate-750">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-red-600 hover:text-white text-slate-300 px-4 py-2.5 rounded-lg transition-colors duration-200 text-sm font-medium"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header (Platform Admin Style) */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'availability' && 'Availability Settings'}
              {activeTab === 'earnings' && 'Earnings & Bookings'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
              {status}
            </span>
            
            {/* User Profile Info Dropdown Area */}
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold shadow-sm border border-orange-200 shrink-0">
                {initials}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-bold text-slate-800 leading-tight">{profile?.name}</p>
                <p className="text-xs text-slate-500">{profile?.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Trainer Dashboard</h1>
                  <p className="text-slate-500 text-sm">Welcome back! Manage your sessions, reviews and profile settings here.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
                    <span className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Total Sessions</span>
                    <span className="text-3xl font-bold text-slate-900">{profile?.totalBookings || 0}</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
                    <span className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Rating</span>
                    <span className="text-3xl font-bold text-yellow-500">⭐ {profile?.rating?.average || 0}</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
                    <span className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Price per Session</span>
                    <span className="text-3xl font-bold text-orange-600">₹{profile?.pricePerSession || 0}</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-800 text-lg border-b border-slate-100 pb-2">My Active Profile Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-slate-500">City:</span> 
                      <span className="text-slate-800 font-bold">{profile?.city || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-slate-500">Experience:</span> 
                      <span className="text-slate-800 font-bold">{profile?.experience || 0} Years</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-slate-500">Training Formats:</span> 
                      <span className="text-slate-800 font-bold">{profile?.trainingTypes?.join(', ') || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-slate-500">Languages:</span> 
                      <span className="text-slate-800 font-bold">{profile?.languages?.join(', ') || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'availability' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Manage Availability</h3>
                  <p className="text-slate-500 text-sm">Set your available training days and time slots.</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-3">Available Days</label>
                    <div className="flex flex-wrap gap-2.5">
                      {DAYS.map(d => {
                        const isSelected = availDays.includes(d);
                        return (
                          <button key={d} type="button"
                            onClick={() => setAvailDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d])}
                            className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                              isSelected 
                                ? 'bg-orange-500 text-white border-orange-500 shadow-sm' 
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {d}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-3">Available Time Slots</label>
                    <div className="flex flex-wrap gap-2.5">
                      {TIME_SLOTS.map(t => {
                        const isSelected = availSlots.includes(t);
                        return (
                          <button key={t} type="button"
                            onClick={() => setAvailSlots(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t])}
                            className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                              isSelected 
                                ? 'bg-orange-500 text-white border-orange-500 shadow-sm' 
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {availMsg && (
                    <div className={`text-sm font-semibold p-3 rounded-lg ${availMsg.includes('❌') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {availMsg}
                    </div>
                  )}

                  <button onClick={handleSaveAvailability} disabled={updatingAvail}
                    className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all text-sm disabled:opacity-50 shadow-md"
                  >
                    {updatingAvail ? 'Saving...' : 'Save Availability'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'earnings' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Earnings & Bookings</h3>
                  <p className="text-slate-500 text-sm">Check your payouts and booking status details.</p>
                </div>
                <div className="p-12 border border-dashed border-slate-300 rounded-xl text-center text-slate-450 text-sm">
                  📈 Bookings list and payout history will appear here once you receive client requests.
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
      
    </div>
  );
};

export default TrainerDashboard;
