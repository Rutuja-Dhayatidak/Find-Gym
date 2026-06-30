import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyActiveMembership, getMyMemberships, getQRCode } from '../userServices/membershipApi';
import toast from 'react-hot-toast';

const MyMembership = () => {
  const navigate = useNavigate();
  const [activeMem, setActiveMem] = useState(null);
  const [daysLeft, setDaysLeft] = useState(0);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenuTab, setActiveMenuTab] = useState('details'); // details, history, trainer, goals, help
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [activeRes, historyRes] = await Promise.all([
          getMyActiveMembership(),
          getMyMemberships()
        ]);
        
        if (activeRes.success && activeRes.active) {
          setActiveMem(activeRes.data);
          setDaysLeft(activeRes.daysLeft);
          
          try {
            const qrRes = await getQRCode(activeRes.data._id);
            setQrCodeUrl(qrRes.qrCodeUrl);
          } catch (qrErr) {
            console.error("Failed to load QR code:", qrErr.message);
          }
        }
        
        if (historyRes.success) {
          setMemberships(historyRes.data || []);
        }
      } catch (err) {
        console.error('Error fetching memberships:', err);
        toast.error('Failed to load membership details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  try {
    if (loading) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-400 font-medium">Retrieving active memberships...</p>
          </div>
        </div>
      );
    }

    if (!activeMem) {
      return (
        <div className="min-h-screen bg-black py-12 px-4 flex flex-col items-center justify-center text-white">
          <div className="max-w-md w-full bg-zinc-900/60 rounded-[28px] shadow-xl border border-zinc-800/80 p-8 text-center space-y-6 backdrop-blur-md">
            <div className="w-20 h-20 bg-purple-955/40 rounded-full flex items-center justify-center mx-auto text-purple-400">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-white">No Active Subscription</h2>
              <p className="text-zinc-400 text-xs leading-relaxed max-w-xs mx-auto">
                Unlock workouts, nutrition plans, professional coaching, and premium classes by joining a membership plan today.
              </p>
            </div>
            <button 
              onClick={() => navigate('/gyms')}
              className="w-full h-12 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white font-bold rounded-2xl text-sm transition-all shadow-md shadow-purple-100 hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer outline-none"
            >
              Browse Gym Plans
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-black py-10 px-4 md:px-8 text-white">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Top Header Banner */}
          <div className="flex justify-between items-center bg-zinc-900/60 p-6 rounded-[24px] border border-zinc-800/80 shadow-lg backdrop-blur-md">
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">My Subscription Pass</h1>
              <p className="text-xs text-zinc-400 font-semibold mt-0.5">Manage benefits, trainer requests, and gym scan entry codes</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-955/60 flex items-center justify-center text-purple-400 text-lg font-bold">
              🎫
            </div>
          </div>

          {/* Website Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left Column: Active Card & Verification (5 cols) */}
            <div className="md:col-span-5 space-y-6">
              <div className="bg-gradient-to-br from-purple-700 to-indigo-900 rounded-[28px] border border-purple-800/60 shadow-xl overflow-hidden relative group">
                <div className="p-6 md:p-8 text-white space-y-5">
                  <div className="flex justify-between items-center">
                    <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm animate-pulse">
                      Active Pass
                    </span>
                    <span className="text-[10px] font-extrabold tracking-wider text-purple-200 uppercase bg-white/10 px-2.5 py-0.5 rounded-full">
                      {daysLeft} Days Remaining
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <h2 className="text-xl md:text-2xl font-black leading-tight">
                      {activeMem.gymName || activeMem.gymId?.name}
                    </h2>
                    <p className="text-xs text-purple-200 font-semibold uppercase tracking-wider">
                      {activeMem.planName || activeMem.planTitle}
                    </p>
                  </div>
                  
                  <div className="pt-6 flex justify-between items-end border-t border-white/10 text-xs text-purple-200">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-purple-300 font-bold">Expiration Date</p>
                      <p className="font-extrabold text-white mt-1">
                        {activeMem.endDate ? new Date(activeMem.endDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-purple-300 font-bold">Membership ID</p>
                      <p className="font-mono font-bold text-white mt-1">{activeMem.membershipId || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-zinc-950/40 border-t border-purple-900/40 flex justify-between items-center">
                  <span className="text-[10px] text-purple-200 font-bold uppercase tracking-widest">Entrance Verification</span>
                  <button 
                    onClick={() => setShowQRModal(true)}
                    className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer outline-none shadow-md shadow-purple-955/40"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    Scan QR Pass
                  </button>
                </div>
              </div>

              {/* Renew Actions */}
              <button 
                onClick={() => navigate(`/membership/plans?gymId=${activeMem.gymId?._id || activeMem.gymId || ''}`)}
                className="w-full h-12 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white font-bold rounded-2xl text-sm transition-all shadow-md shadow-purple-955/40 hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer outline-none"
              >
                Renew / Upgrade Subscription
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5" />
                </svg>
              </button>
            </div>

            {/* Right Column: Tabbed Menu Information (7 cols) */}
            <div className="md:col-span-7 bg-zinc-900/60 rounded-[28px] border border-zinc-800/80 shadow-lg p-6 backdrop-blur-md flex flex-col justify-between">
              <div>
                {/* Tabs buttons */}
                <div className="flex border-b border-zinc-800 pb-3 gap-2.5 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'details', label: 'Details', icon: '📝' },
                    { id: 'history', label: 'Check-ins', icon: '🏃' },
                    { id: 'trainer', label: 'Coaching', icon: '🏋️' },
                    { id: 'goals', label: 'Goals', icon: '🎯' },
                    { id: 'help', label: 'Support', icon: '❓' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveMenuTab(tab.id)}
                      className={`px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-colors outline-none cursor-pointer ${
                        activeMenuTab === tab.id 
                          ? 'bg-purple-700 text-white shadow-sm shadow-purple-900/40' 
                          : 'bg-zinc-950/40 text-zinc-400 hover:bg-zinc-850'
                      }`}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Display Areas */}
                <div className="mt-6 min-h-[200px]">
                  
                  {/* Details Tab */}
                  {activeMenuTab === 'details' && (
                    <div className="space-y-4 text-xs md:text-sm">
                      <div className="flex justify-between py-2 border-b border-zinc-800/60">
                        <span className="text-zinc-400 font-semibold">Facilities Included</span>
                        <span className="font-bold text-zinc-100 text-right">
                          {activeMem.facilitiesIncluded?.join(', ') || 'General Equipment Access'}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-zinc-800/60">
                        <span className="text-zinc-400 font-semibold">Start Date</span>
                        <span className="font-bold text-zinc-200">
                          {activeMem.startDate ? new Date(activeMem.startDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-zinc-800/60">
                        <span className="text-zinc-400 font-semibold">Coupon Discount</span>
                        <span className="font-bold text-emerald-400">₹{activeMem.discountAmount || 0}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-zinc-400 font-semibold">Invoice Number</span>
                        <span className="font-mono font-bold text-purple-400">{activeMem.invoiceNumber || 'N/A'}</span>
                      </div>
                    </div>
                  )}

                  {/* Check-ins Tab */}
                  {activeMenuTab === 'history' && (
                    <div className="space-y-3 text-xs md:text-sm">
                      <p className="text-zinc-400 font-semibold italic">Visit logs and check-ins are updated at the entry gate scanner.</p>
                      <div className="bg-zinc-950/40 p-5 rounded-2xl border border-zinc-800/60 text-center text-zinc-400">
                        Total check-in entries logged: <span className="font-extrabold text-white text-base">0 entries</span>
                      </div>
                    </div>
                  )}

                  {/* Coaching Tab */}
                  {activeMenuTab === 'trainer' && (
                    <div className="space-y-4 text-xs md:text-sm">
                      <h4 className="font-bold text-white">Assigned Gym Trainer</h4>
                      <div className="flex items-center gap-4 p-4 bg-zinc-950/40 border border-zinc-800/60 rounded-2xl">
                        <div className="w-12 h-12 rounded-full bg-purple-950/60 flex items-center justify-center font-bold text-purple-400 text-lg">
                          🏋️
                        </div>
                        <div>
                          <h5 className="font-bold text-zinc-200">Assigned upon request</h5>
                          <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">Please consult the receptionist desk to request personal trainer settings</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Goals Tab */}
                  {activeMenuTab === 'goals' && (
                    <div className="space-y-4 text-xs md:text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400 font-semibold">Current Program Target</span>
                        <span className="px-3.5 py-1 bg-purple-950/60 text-purple-300 rounded-full font-bold uppercase tracking-wider text-[10px] border border-purple-900/60">
                          {activeMem.fitnessGoal || 'General Fitness'}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-450 leading-relaxed font-semibold">
                        Goal-oriented targets help our personal training staff modify exercise and dietary guidance regimes specifically for you.
                      </p>
                    </div>
                  )}

                  {/* Support Tab */}
                  {activeMenuTab === 'help' && (
                    <div className="space-y-4 text-xs md:text-sm">
                      <h4 className="font-bold text-white">Contact Reception Help</h4>
                      <p className="text-zinc-400 leading-relaxed font-semibold">Have inquiries regarding schedules, billing queries, lockers, or towels?</p>
                      <div className="space-y-2 bg-zinc-950/30 p-4 rounded-xl border border-zinc-800/60">
                        <p className="font-bold text-zinc-200">📧 support@livesale.fitness</p>
                        <p className="font-bold text-zinc-200">📞 +91 98765 43210</p>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>

        </div>

        {/* QR Modal Backdrop */}
        {showQRModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-zinc-900 rounded-[28px] max-w-sm w-full p-6 text-center space-y-4 relative border border-zinc-800 shadow-2xl">
              <button 
                onClick={() => setShowQRModal(false)}
                className="absolute right-4 top-4 w-8 h-8 rounded-full bg-zinc-950 hover:bg-zinc-850 text-zinc-400 flex items-center justify-center transition-colors cursor-pointer outline-none"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="text-base font-black tracking-tight text-white pt-2">Entrance Scan QR Pass</h3>
              {qrCodeUrl ? (
                <div className="bg-white p-3 rounded-2xl border border-purple-900 shadow-sm inline-block">
                  <img src={qrCodeUrl} alt="Entrance QR" className="w-48 h-48 mx-auto" />
                </div>
              ) : (
                <div className="w-48 h-48 bg-zinc-950 rounded-2xl flex items-center justify-center mx-auto text-zinc-600 text-xs">
                  Generating code...
                </div>
              )}
              <p className="text-[11px] text-purple-400 font-extrabold uppercase tracking-widest">
                Scan this QR code at gym gate scanner
              </p>
            </div>
          </div>
        )}
      </div>
    );
  } catch (renderError) {
    console.error("Render error in MyMembership:", renderError);
    return (
      <div className="min-h-screen bg-black text-red-500 p-8 flex flex-col items-center justify-center">
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 max-w-md text-center space-y-4">
          <h2 className="text-xl font-bold text-white">Application Render Error</h2>
          <p className="text-sm text-zinc-400 font-mono text-left bg-black p-3 rounded-lg overflow-x-auto">
            {renderError.message}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-all"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
};

export default MyMembership;
