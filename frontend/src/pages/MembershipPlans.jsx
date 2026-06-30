import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getActivePlans } from '../userServices/membershipApi';
import { getGymById } from '../userServices/gymApi';
import toast from 'react-hot-toast';

const MembershipPlans = () => {
  const [searchParams] = useSearchParams();
  const gymId = searchParams.get('gymId');
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [gym, setGym] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gymId) {
      toast.error('Gym ID is required to view membership plans');
      navigate('/gyms');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [plansRes, gymRes] = await Promise.all([
          getActivePlans(gymId),
          getGymById(gymId)
        ]);
        setPlans(plansRes.data || []);
        setGym(gymRes);
      } catch (error) {
        console.error('Failed to load plans:', error);
        toast.error(error.message || 'Error loading membership plans');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [gymId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Loading premium plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full uppercase tracking-wider">
            Premium Access
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 mb-2 tracking-tight">
            Choose Your Membership Plan
          </h1>
          <p className="text-slate-600 text-sm md:text-base max-w-xl mx-auto">
            Get unlimited access to {gym?.name || 'our gym'}, premium amenities, and customized training plans.
          </p>
        </div>

        {plans.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100 max-w-md mx-auto">
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Active Plans Found</h3>
            <p className="text-slate-500 text-sm mb-6">This gym hasn't configured any membership plans yet.</p>
            <button 
              onClick={() => navigate('/gyms')} 
              className="px-6 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white font-semibold rounded-xl text-sm transition-all"
            >
              Browse Other Gyms
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div 
                key={plan._id} 
                className="bg-white rounded-3xl border border-slate-200 hover:border-purple-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative group"
              >
                {/* Visual Accent */}
                <div className="h-2 bg-gradient-to-r from-purple-600 to-indigo-600 w-full"></div>
                
                <div className="p-6 md:p-8 flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                      {plan.name}
                    </h3>
                    <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-[11px] font-bold rounded-md uppercase tracking-wider">
                      {plan.accessTime || 'All Hours'}
                    </span>
                  </div>

                  <div className="flex items-baseline mb-6">
                    <span className="text-4xl font-extrabold text-slate-900 tracking-tight">₹{plan.price}</span>
                    <span className="text-slate-500 text-sm ml-2 font-medium">/{plan.durationDays} days</span>
                  </div>

                  {plan.joiningFee > 0 && (
                    <div className="text-xs text-slate-500 font-semibold mb-4 bg-slate-50 p-2 rounded-lg">
                      Joining Fee: <span className="text-slate-800">₹{plan.joiningFee}</span>
                    </div>
                  )}

                  {plan.description && (
                    <p className="text-slate-600 text-xs leading-relaxed mb-6">
                      {plan.description}
                    </p>
                  )}

                  {/* Facilities list */}
                  <div className="border-t border-slate-100 pt-6">
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Facilities Included</p>
                    <ul className="space-y-3">
                      {(plan.facilities && plan.facilities.length > 0 ? plan.facilities : ['Gym Access', 'Locker Room']).map((facility, i) => (
                        <li key={i} className="flex items-center text-xs text-slate-600">
                          <span className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center mr-3 text-emerald-600 flex-shrink-0">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          <span className="font-medium">{facility}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={() => navigate(`/membership/plan/${plan._id}?gymId=${gymId}`)}
                    className="w-full h-12 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white font-bold rounded-2xl text-sm transition-all shadow-md shadow-purple-100 hover:shadow-lg flex items-center justify-center gap-2 group/btn cursor-pointer"
                  >
                    Buy Now
                    <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MembershipPlans;
