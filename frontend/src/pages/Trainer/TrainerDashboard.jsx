import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getTrainerProfile,
  getTrainerStatus,
  updateAvailability,
  reapplyTrainer,
  getTrainerBookings,
  getTrainerEarnings,
  updateTrainerProfile
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

  // Bookings & Earnings state
  const [bookings, setBookings] = useState([]);
  const [earnings, setEarnings] = useState(null);

  // Tab state (for active users)
  const [activeTab, setActiveTab] = useState('overview');

  // Edit profile state
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    city: '',
    experience: '',
    pricePerSession: '',
    pricePerMonth: '',
    bio: '',
    languages: '',
    specializations: '',
    certifications: '',
    trainingTypes: [],
    gender: '',
    dateOfBirth: '',
    trialSession: false,
    trialPrice: '',
    aadharNumber: '',
    panNumber: '',
    bankAccountNumber: '',
    bankIfscCode: '',
    bankAccountHolderName: '',
    review: '',
    rating: '',
    clients: ''
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  const fetchTrainerData = async () => {
    try {
      setLoading(true);
      setError('');

      const statusRes = await getTrainerStatus();
      setStatus(statusRes.status);

      const profileRes = await getTrainerProfile();
      if (profileRes.success) {
        const tr = profileRes.trainer;
        setProfile(tr);
        setAvailDays(tr.availability?.days || []);
        setAvailSlots(tr.availability?.timeSlots || []);

        // Populate edit form
        setEditForm({
          name: tr.name || '',
          phone: tr.phone || '',
          city: tr.city || '',
          experience: tr.experience || '',
          pricePerSession: tr.pricePerSession || '',
          pricePerMonth: tr.pricePerMonth || '',
          bio: tr.bio || '',
          languages: tr.languages?.join(', ') || '',
          specializations: tr.specializations?.join(', ') || '',
          certifications: tr.certifications?.join(', ') || '',
          trainingTypes: tr.trainingTypes || [],
          gender: tr.gender || '',
          dateOfBirth: tr.dateOfBirth ? new Date(tr.dateOfBirth).toISOString().split('T')[0] : '',
          trialSession: tr.trialSession || false,
          trialPrice: tr.trialPrice || '',
          aadharNumber: tr.kyc?.aadharNumber || '',
          panNumber: tr.kyc?.panNumber || '',
          bankAccountNumber: tr.bankAccount?.accountNumber || '',
          bankIfscCode: tr.bankAccount?.ifscCode || '',
          bankAccountHolderName: tr.bankAccount?.accountHolderName || '',
          review: tr.review || '',
          rating: tr.rating?.average || tr.rating || '',
          clients: tr.clients || ''
        });
      }

      try {
        const bookingsRes = await getTrainerBookings();
        if (bookingsRes.success) {
          setBookings(bookingsRes.bookings || []);
        }
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      }

      try {
        const earningsRes = await getTrainerEarnings();
        if (earningsRes.success) {
          setEarnings(earningsRes.earnings);
        }
      } catch (err) {
        console.error("Failed to fetch earnings:", err);
      }
    } catch (err) {
      setError('Session expired or unauthorized.');
      localStorage.removeItem('trainerToken');
      navigate('/trainer/login');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileMsg('');

    try {
      const fd = new FormData();
      fd.append('name', editForm.name);
      fd.append('phone', editForm.phone);
      fd.append('city', editForm.city);
      fd.append('experience', editForm.experience);
      fd.append('pricePerSession', editForm.pricePerSession);
      fd.append('pricePerMonth', editForm.pricePerMonth);
      fd.append('bio', editForm.bio);
      fd.append('gender', editForm.gender);
      fd.append('dateOfBirth', editForm.dateOfBirth);
      fd.append('trialSession', editForm.trialSession);
      fd.append('trialPrice', editForm.trialPrice);
      fd.append('aadharNumber', editForm.aadharNumber);
      fd.append('panNumber', editForm.panNumber);
      fd.append('bankAccountNumber', editForm.bankAccountNumber);
      fd.append('bankIfscCode', editForm.bankIfscCode);
      fd.append('bankAccountHolderName', editForm.bankAccountHolderName);
      fd.append('review', editForm.review);
      fd.append('rating', editForm.rating);
      fd.append('clients', editForm.clients);

      const specs = editForm.specializations.split(',').map(s => s.trim()).filter(Boolean);
      const certs = editForm.certifications.split(',').map(c => c.trim()).filter(Boolean);
      const langs = editForm.languages.split(',').map(l => l.trim()).filter(Boolean);

      fd.append('specializations', JSON.stringify(specs));
      fd.append('certifications', JSON.stringify(certs));
      fd.append('languages', JSON.stringify(langs));
      fd.append('trainingTypes', JSON.stringify(editForm.trainingTypes));

      if (profilePhoto) {
        fd.append('profilePhoto', profilePhoto);
      }

      const res = await updateTrainerProfile(fd);
      if (res.success) {
        setProfileMsg('✅ Profile updated successfully!');
        fetchTrainerData();
      } else {
        setProfileMsg(`❌ ${res.message || 'Update failed.'}`);
      }
    } catch (err) {
      setProfileMsg(`❌ ${err?.response?.data?.message || 'Server error updating profile.'}`);
    } finally {
      setUpdatingProfile(false);
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
    <div className="h-screen bg-[#f8fafc] flex text-slate-800 overflow-hidden">

      {/* 1. Left Sidebar (Platform Admin Style) */}
      <aside className="w-64 h-full bg-slate-900 text-white flex flex-col shadow-lg shrink-0">
        <div className="p-6 border-b border-slate-750 flex items-center justify-center">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-orange-600">
            livesale.Fitness Trainer
          </h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-205 group ${activeTab === 'overview'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
          >
            <span className="text-xl group-hover:scale-110 transition-transform">📊</span>
            <span className="font-medium">Dashboard Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('availability')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-205 group ${activeTab === 'availability'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
          >
            <span className="text-xl group-hover:scale-110 transition-transform">🕒</span>
            <span className="font-medium">Availability Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('earnings')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-205 group ${activeTab === 'earnings'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
          >
            <span className="text-xl group-hover:scale-110 transition-transform">💰</span>
            <span className="font-medium">Earnings & Bookings</span>
          </button>

          <button
            onClick={() => setActiveTab('edit-profile')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-205 group ${activeTab === 'edit-profile'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
          >
            <span className="text-xl group-hover:scale-110 transition-transform">👤</span>
            <span className="font-medium">Edit Profile</span>
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
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">

        {/* Top Header (Platform Admin Style) */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'availability' && 'Availability Settings'}
              {activeTab === 'earnings' && 'Earnings & Bookings'}
              {activeTab === 'edit-profile' && 'Edit Profile Details'}
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
                    <span className="text-3xl font-bold text-slate-900">{bookings.filter(b => ['confirmed', 'completed'].includes(b.status.toLowerCase())).length}</span>
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

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-left">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h3 className="font-bold text-slate-800 text-lg">My Active Profile Details</h3>
                    <button
                      onClick={() => setActiveTab('edit-profile')}
                      className="text-xs text-orange-500 font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      ✏️ Edit Profile
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                    <div className="border-b border-slate-100 pb-3">
                      <span className="block text-slate-400 text-[10px] uppercase tracking-wider font-bold mb-1">City</span>
                      <span className="text-slate-800 font-semibold text-sm">{profile?.city || 'N/A'}</span>
                    </div>
                    <div className="border-b border-slate-100 pb-3">
                      <span className="block text-slate-400 text-[10px] uppercase tracking-wider font-bold mb-1">Experience</span>
                      <span className="text-slate-800 font-semibold text-sm">{profile?.experience || 0} Years</span>
                    </div>
                    <div className="border-b border-slate-100 pb-3 sm:col-span-2">
                      <span className="block text-slate-400 text-[10px] uppercase tracking-wider font-bold mb-1">Training Formats</span>
                      <span className="text-slate-800 font-semibold text-sm">{profile?.trainingTypes?.join(', ') || 'N/A'}</span>
                    </div>
                    <div className="border-b border-slate-100 pb-3">
                      <span className="block text-slate-400 text-[10px] uppercase tracking-wider font-bold mb-1">Languages</span>
                      <span className="text-slate-800 font-semibold text-sm">{profile?.languages?.join(', ') || 'N/A'}</span>
                    </div>
                    <div className="border-b border-slate-100 pb-3">
                      <span className="block text-slate-400 text-[10px] uppercase tracking-wider font-bold mb-1">Clients Trained</span>
                      <span className="text-slate-800 font-semibold text-sm">{profile?.clients || '0'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'edit-profile' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6 animate-in fade-in duration-200 text-left">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Edit Profile Details</h3>
                  <p className="text-slate-500 text-sm">Update your public profile, rates, experience, and bio.</p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-700">Full Name</label>
                      <input
                        type="text"
                        required
                        value={editForm.name}
                        onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-orange-500 text-sm"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-700">Phone Number</label>
                      <input
                        type="text"
                        required
                        value={editForm.phone}
                        onChange={(e) => setEditForm(p => ({ ...p, phone: e.target.value }))}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-orange-500 text-sm"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-700">City</label>
                      <input
                        type="text"
                        required
                        value={editForm.city}
                        onChange={(e) => setEditForm(p => ({ ...p, city: e.target.value }))}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-orange-500 text-sm"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-700">Experience (Years)</label>
                      <input
                        type="number"
                        required
                        value={editForm.experience}
                        onChange={(e) => setEditForm(p => ({ ...p, experience: e.target.value }))}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-orange-500 text-sm"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-700">Price Per Session (₹)</label>
                      <input
                        type="number"
                        required
                        value={editForm.pricePerSession}
                        onChange={(e) => setEditForm(p => ({ ...p, pricePerSession: e.target.value }))}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-orange-500 text-sm"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-700">Price Per Month (₹)</label>
                      <input
                        type="number"
                        value={editForm.pricePerMonth}
                        onChange={(e) => setEditForm(p => ({ ...p, pricePerMonth: e.target.value }))}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-orange-500 text-sm"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-700">Gender</label>
                      <select
                        value={editForm.gender}
                        onChange={(e) => setEditForm(p => ({ ...p, gender: e.target.value }))}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-orange-500 text-sm bg-white"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-700">Date of Birth</label>
                      <input
                        type="date"
                        value={editForm.dateOfBirth}
                        onChange={(e) => setEditForm(p => ({ ...p, dateOfBirth: e.target.value }))}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-orange-500 text-sm"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-700">Languages (comma separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. English, Hindi, Marathi"
                        value={editForm.languages}
                        onChange={(e) => setEditForm(p => ({ ...p, languages: e.target.value }))}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-orange-500 text-sm"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-700">Trial Price (₹)</label>
                      <input
                        type="number"
                        disabled={!editForm.trialSession}
                        value={editForm.trialPrice}
                        onChange={(e) => setEditForm(p => ({ ...p, trialPrice: e.target.value }))}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-orange-500 text-sm disabled:bg-slate-50 disabled:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">Specializations (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Strength Training, Weight Loss, Bodybuilding"
                      value={editForm.specializations}
                      onChange={(e) => setEditForm(p => ({ ...p, specializations: e.target.value }))}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-orange-500 text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">Certifications (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. ACE Certified, Gold Medalist Yoga, CPR First Aid"
                      value={editForm.certifications}
                      onChange={(e) => setEditForm(p => ({ ...p, certifications: e.target.value }))}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-orange-500 text-sm"
                    />
                  </div>

                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 text-sm text-slate-700 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.trialSession}
                        onChange={(e) => setEditForm(p => ({ ...p, trialSession: e.target.checked, trialPrice: e.target.checked ? p.trialPrice : '' }))}
                        className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 border-slate-350"
                      />
                      Offer Free/Paid Trial Session
                    </label>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700 block">Training Formats</label>
                    <div className="flex flex-wrap gap-4">
                      {['Personal Training', 'Group Training', 'Online Training'].map(format => {
                        const isChecked = editForm.trainingTypes.includes(format);
                        return (
                          <label key={format} className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                setEditForm(p => {
                                  const list = p.trainingTypes.includes(format)
                                    ? p.trainingTypes.filter(x => x !== format)
                                    : [...p.trainingTypes, format];
                                  return { ...p, trainingTypes: list };
                                });
                              }}
                              className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 border-slate-350"
                            />
                            {format}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">Profile Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProfilePhoto(e.target.files[0])}
                      className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">Bio</label>
                    <textarea
                      rows={4}
                      value={editForm.bio}
                      onChange={(e) => setEditForm(p => ({ ...p, bio: e.target.value }))}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-orange-500 text-sm resize-y"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">Featured Review Quote / Snippet</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Best trainer ever! Helped me lose 10 kgs in 3 months."
                      value={editForm.review}
                      onChange={(e) => setEditForm(p => ({ ...p, review: e.target.value }))}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-orange-500 text-sm resize-y"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">Star Rating (1 - 5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      placeholder="e.g. 4.8"
                      value={editForm.rating}
                      onChange={(e) => setEditForm(p => ({ ...p, rating: e.target.value }))}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-orange-500 text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">Clients Trained</label>
                    <input
                      type="text"
                      placeholder="e.g. 250+ or 100"
                      value={editForm.clients}
                      onChange={(e) => setEditForm(p => ({ ...p, clients: e.target.value }))}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-orange-500 text-sm"
                    />
                  </div>

                  <div className="border border-slate-150 rounded-2xl p-5 bg-slate-50/50">
                    <h4 className="text-slate-800 font-bold mb-4 flex items-center gap-2">🏦 Bank Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600">Account Holder Name</label>
                        <input
                          type="text"
                          value={editForm.bankAccountHolderName}
                          onChange={(e) => setEditForm(p => ({ ...p, bankAccountHolderName: e.target.value }))}
                          className="w-full px-4 py-2 border border-slate-200 bg-white rounded-xl outline-none focus:border-orange-500 text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600">Account Number</label>
                        <input
                          type="text"
                          value={editForm.bankAccountNumber}
                          onChange={(e) => setEditForm(p => ({ ...p, bankAccountNumber: e.target.value }))}
                          className="w-full px-4 py-2 border border-slate-200 bg-white rounded-xl outline-none focus:border-orange-500 text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600">IFSC Code</label>
                        <input
                          type="text"
                          value={editForm.bankIfscCode}
                          onChange={(e) => setEditForm(p => ({ ...p, bankIfscCode: e.target.value.toUpperCase() }))}
                          className="w-full px-4 py-2 border border-slate-200 bg-white rounded-xl outline-none focus:border-orange-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border border-slate-150 rounded-2xl p-5 bg-slate-50/50">
                    <h4 className="text-slate-800 font-bold mb-4">🪪 KYC Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600">Aadhar Number</label>
                        <input
                          type="text"
                          maxLength="12"
                          value={editForm.aadharNumber}
                          onChange={(e) => setEditForm(p => ({ ...p, aadharNumber: e.target.value.replace(/\D/g, '') }))}
                          className="w-full px-4 py-2 border border-slate-200 bg-white rounded-xl outline-none focus:border-orange-500 text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600">PAN Number</label>
                        <input
                          type="text"
                          maxLength="10"
                          value={editForm.panNumber}
                          onChange={(e) => setEditForm(p => ({ ...p, panNumber: e.target.value.toUpperCase() }))}
                          className="w-full px-4 py-2 border border-slate-200 bg-white rounded-xl outline-none focus:border-orange-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {profileMsg && (
                    <div className={`text-sm font-semibold p-3 rounded-lg ${profileMsg.includes('❌') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {profileMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={updatingProfile}
                    className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all text-sm disabled:opacity-50 shadow-md"
                  >
                    {updatingProfile ? 'Updating...' : 'Update Profile'}
                  </button>
                </form>
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
                            className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${isSelected
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
                            className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${isSelected
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
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Earnings Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Total Earnings</span>
                    <span className="text-3xl font-black text-emerald-600">₹{earnings?.total || 0}</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Pending Payouts</span>
                    <span className="text-3xl font-black text-orange-600">₹{earnings?.pending || 0}</span>
                  </div>
                </div>

                {/* Client Bookings List */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Client Bookings</h3>
                    <p className="text-slate-500 text-xs">A list of all booking requests and sessions.</p>
                  </div>

                  {bookings.length > 0 ? (
                    <div className="overflow-x-auto border border-slate-100 rounded-xl">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                            <th className="p-3.5">ID</th>
                            <th className="p-3.5">Client Name</th>
                            <th className="p-3.5">Format</th>
                            <th className="p-3.5">Date</th>
                            <th className="p-3.5">Time Slot</th>
                            <th className="p-3.5">Amount</th>
                            <th className="p-3.5 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-105/40 text-slate-700">
                          {bookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-3.5 font-mono text-xs text-slate-400">{booking.id}</td>
                              <td className="p-3.5 font-semibold text-slate-800">
                                <div>{booking.clientName}</div>
                                <div className="text-[11px] text-slate-400 font-normal mt-0.5">📞 {booking.phone}</div>
                              </td>
                              <td className="p-3.5">
                                <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full font-medium">{booking.type}</span>
                                {booking.address && booking.address !== 'N/A' && (
                                  <div className="text-[11px] text-slate-500 mt-1 max-w-[200px] truncate" title={booking.address}>
                                    📍 {booking.address}
                                  </div>
                                )}
                              </td>
                              <td className="p-3.5">{booking.date}</td>
                              <td className="p-3.5 text-slate-500">{booking.time}</td>
                              <td className="p-3.5 font-bold text-slate-900">₹{booking.price}</td>
                              <td className="p-3.5 text-right">
                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${booking.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                    booking.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                                  }`}>
                                  {booking.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-12 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-sm">
                      📈 Bookings list will appear here once you receive client requests.
                    </div>
                  )}
                </div>

                {/* Payout Transactions List */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Payout Transactions</h3>
                    <p className="text-slate-500 text-xs">History of payouts transferred to your bank account.</p>
                  </div>

                  {earnings?.transactions?.length > 0 ? (
                    <div className="overflow-x-auto border border-slate-100 rounded-xl">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                            <th className="p-3.5">Tx ID</th>
                            <th className="p-3.5">Booking ID</th>
                            <th className="p-3.5">Amount</th>
                            <th className="p-3.5">Type</th>
                            <th className="p-3.5">Date</th>
                            <th className="p-3.5 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-105/40 text-slate-700">
                          {earnings.transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-3.5 font-mono text-xs text-slate-400">{tx.id}</td>
                              <td className="p-3.5 font-mono text-xs text-slate-500">{tx.bookingId}</td>
                              <td className="p-3.5 font-bold text-emerald-600">₹{tx.amount}</td>
                              <td className="p-3.5 text-slate-600">{tx.type}</td>
                              <td className="p-3.5 text-slate-500">{tx.date}</td>
                              <td className="p-3.5 text-right">
                                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                                  {tx.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-12 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-sm">
                      💸 Payout transactions history is empty.
                    </div>
                  )}
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
