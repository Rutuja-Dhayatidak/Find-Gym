import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyActiveMembership } from '../userServices/membershipApi';
import toast from 'react-hot-toast';

const MembershipDashboard = () => {
  const navigate = useNavigate();
  const [activeMem, setActiveMem] = useState(null);
  const [daysLeft, setDaysLeft] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await getMyActiveMembership();
        if (res.success && res.active) {
          setActiveMem(res.data);
          setDaysLeft(res.daysLeft);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        toast.error('Failed to retrieve dashboard details');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Loading fitness dashboard...</p>
        </div>
      </div>
    );
  }

  const showRenewalAlert = activeMem && daysLeft <= 7;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Top welcome */}
        <div className="flex justify-between items-center bg-white p-6 rounded-[24px] border border-slate-100 shadow-lg">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Fitness Dashboard</h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Track your progress and active packages</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-lg font-bold">
            💪
          </div>
        </div>

        {/* Renewal warning alert */}
        {showRenewalAlert && (
          <div className="bg-amber-50 border border-amber-200 rounded-[20px] p-4 flex gap-3.5 items-start">
            <span className="text-xl">⚠️</span>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide">Upcoming Package Expiry</h4>
              <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                Your subscription expires in <span className="font-extrabold">{daysLeft} days</span>. Renew now to maintain your streak and avoid premium facility service interruptions.
              </p>
              <button 
                onClick={() => navigate(`/membership/plans?gymId=${activeMem.gymId}`)}
                className="mt-2 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
              >
                Renew Package
              </button>
            </div>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Active plan card */}
          <div className="bg-white p-5 rounded-[22px] border border-slate-100 shadow-md">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Plan</span>
            <h3 className="text-sm font-extrabold text-slate-800 mt-2 truncate">
              {activeMem ? (activeMem.planName || activeMem.planTitle) : 'No Package Active'}
            </h3>
            {activeMem && (
              <p className="text-[10px] text-purple-600 font-bold mt-1 uppercase">
                {activeMem.gymName || activeMem.gymId?.name}
              </p>
            )}
          </div>

          {/* Days Left card */}
          <div className="bg-white p-5 rounded-[22px] border border-slate-100 shadow-md">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Days Remaining</span>
            <h3 className="text-2xl font-black text-purple-700 mt-1">
              {activeMem ? `${daysLeft} Days` : '0 Days'}
            </h3>
            {activeMem && (
              <p className="text-[10px] text-slate-400 font-semibold mt-1">
                Till {new Date(activeMem.endDate).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Total visits card */}
          <div className="bg-white p-5 rounded-[22px] border border-slate-100 shadow-md">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Visits</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">0</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Gym Check-in entries</p>
          </div>

          {/* Fitness goals card */}
          <div className="bg-white p-5 rounded-[22px] border border-slate-100 shadow-md">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Goal Status</span>
            <h3 className="text-sm font-bold text-slate-800 mt-2">
              {activeMem ? activeMem.fitnessGoal : 'Not Configured'}
            </h3>
            <p className="text-[10px] text-purple-600 font-bold mt-1 uppercase">Fit Program</p>
          </div>
        </div>

        {/* Assigned Trainer */}
        <div className="bg-white p-5 rounded-[22px] border border-slate-100 shadow-lg space-y-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assigned Coach</span>
          <div className="flex justify-between items-center pt-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-700 text-lg">
                🏋️
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">
                  {activeMem ? 'Select from reception' : 'No active coach'}
                </h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Personal training setting</p>
              </div>
            </div>
            {activeMem && (
              <button 
                onClick={() => navigate('/trainers')}
                className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl text-[10px] transition-colors cursor-pointer outline-none"
              >
                Browse Coaches
              </button>
            )}
          </div>
        </div>

        {/* Bottom actions */}
        <div className="flex gap-4">
          <button 
            onClick={() => navigate(activeMem ? `/membership/plans?gymId=${activeMem.gymId}` : '/gyms')}
            className="flex-grow h-12 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white font-bold rounded-2xl text-sm transition-all shadow-md shadow-purple-100 hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            {activeMem ? 'Upgrade Plan' : 'Buy Membership'}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
          
          <button 
            onClick={() => navigate('/membership/my')}
            className="px-5 h-12 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold rounded-2xl text-sm transition-colors cursor-pointer"
          >
            My Card
          </button>
        </div>

      </div>
    </div>
  );
};

export default MembershipDashboard;
