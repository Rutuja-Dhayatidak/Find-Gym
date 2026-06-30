import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getPlanDetails } from '../userServices/membershipApi';
import MembershipStepper from '../components/MembershipStepper';
import toast from 'react-hot-toast';

const MembershipPlanDetails = () => {
  const { planId } = useParams();
  const [searchParams] = useSearchParams();
  const gymId = searchParams.get('gymId');
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setLoading(true);
        const res = await getPlanDetails(planId);
        setPlan(res.data);
      } catch (error) {
        console.error('Error fetching plan details:', error);
        toast.error('Failed to load plan details');
        navigate('/gyms');
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [planId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-400 font-medium">Loading details...</p>
        </div>
      </div>
    );
  }

  const basePrice = plan?.price || 0;
  const joiningFee = plan?.joiningFee || 0;
  const estimatedTotal = basePrice + joiningFee;

  return (
    <div className="min-h-screen bg-black py-10 px-4 md:px-8 text-white">
      <div className="max-w-6xl mx-auto bg-zinc-900/60 rounded-[32px] border border-zinc-800/80 overflow-hidden backdrop-blur-md">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-850 p-8 text-white relative flex flex-col md:flex-row justify-between items-center gap-4 border-b border-zinc-800">
          <button 
            onClick={() => navigate(-1)} 
            className="md:absolute left-8 top-1/2 md:-translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center md:text-left md:pl-16">
            <h1 className="text-2xl font-black tracking-tight text-white">Review Membership Package</h1>
            <p className="text-xs text-purple-200 mt-1 font-medium">Verify your selected package benefits and payable details</p>
          </div>
          <div className="text-right">
            <span className="px-4 py-1.5 bg-purple-700/60 text-white text-xs font-bold rounded-full uppercase tracking-wider">
              Step 1 of 3
            </span>
          </div>
        </div>

        {/* Stepper progress */}
        <div className="px-6 py-6 border-b border-zinc-800 bg-zinc-950/20">
          <MembershipStepper currentStep={1} />
        </div>

        {/* Website Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800/80">
          
          {/* Left Column: Benefits & Rules (7 cols) */}
          <div className="lg:col-span-7 p-6 md:p-10 space-y-8 bg-zinc-950/10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="w-2.5 h-6 bg-purple-600 rounded-full"></span>
                <h3 className="text-lg font-black text-white tracking-tight uppercase">Package Inclusions</h3>
              </div>
              <p className="text-zinc-400 text-xs font-semibold mb-6">These premium services are bundled free with your purchase:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(plan?.facilities && plan.facilities.length > 0 ? plan.facilities : [
                  'Access to Strength Training',
                  'Access to Cardio Section',
                  'Locker & Shower Room Access',
                  'Personalized Workout Log',
                  'Certified Trainer Guidance'
                ]).map((facility, index) => (
                  <div key={index} className="flex items-start bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/60">
                    <span className="w-5 h-5 rounded-full bg-emerald-950 flex items-center justify-center mr-3 text-emerald-400 flex-shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-xs text-zinc-200 font-bold leading-tight">{facility}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-zinc-800/80 pt-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-2.5 h-6 bg-purple-600 rounded-full"></span>
                <h3 className="text-lg font-black text-white tracking-tight uppercase">Gym Terms & Rules</h3>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-1">
                {(plan?.rules && plan.rules.length > 0 ? plan.rules : [
                  'Carry a personal towel for hygiene.',
                  'Always use indoor clean sports shoes.',
                  'Membership benefits are non-transferable.',
                  'Re-rack weights after completion.'
                ]).map((rule, idx) => (
                  <li key={idx} className="flex items-start text-xs text-zinc-400 leading-relaxed gap-2">
                    <span className="text-purple-500 font-bold mt-0.5">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Pricing Summary & Call-To-Action (5 cols) */}
          <div className="lg:col-span-5 p-6 md:p-10 bg-zinc-900/20 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-2.5 h-6 bg-purple-600 rounded-full"></span>
                <h3 className="text-lg font-black text-white tracking-tight uppercase">Billing Estimate</h3>
              </div>

              {/* Package Highlight Box */}
              <div className="bg-gradient-to-br from-purple-700 to-indigo-700 p-6 rounded-3xl text-white shadow-md relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
                  <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/>
                  </svg>
                </div>
                <span className="text-[10px] font-bold text-purple-200 bg-white/15 px-3 py-1 rounded-full uppercase tracking-wider">
                  {plan?.accessTime || 'All Access'}
                </span>
                <h4 className="text-xl font-extrabold mt-3.5 mb-0.5">{plan?.name}</h4>
                <p className="text-xs text-purple-200 font-medium">{plan?.durationDays} Days Validity</p>
                <div className="text-3xl font-black mt-5">
                  ₹{basePrice.toLocaleString()}
                </div>
              </div>

              {/* Estimate Calculation List */}
              <div className="bg-zinc-900/60 rounded-2xl p-5 border border-zinc-800 text-sm space-y-3.5 shadow-sm">
                <div className="flex justify-between text-zinc-400 font-semibold">
                  <span>Base Package Cost</span>
                  <span className="text-white">₹{basePrice}</span>
                </div>
                {joiningFee > 0 && (
                  <div className="flex justify-between text-zinc-400 font-semibold">
                    <span>One-time Joining Fee</span>
                    <span className="text-white">₹{joiningFee}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-400 font-semibold">
                  <span>GST (18% estimated)</span>
                  <span className="text-white">₹{Math.round(estimatedTotal * 0.18)}</span>
                </div>
                <div className="border-t border-zinc-800 pt-3 flex justify-between font-black text-base text-white">
                  <span>Estimated Total</span>
                  <span className="text-purple-400 text-lg">₹{Math.round(estimatedTotal * 1.18)}</span>
                </div>
              </div>
            </div>

            {/* Bottom Proceed CTA */}
            <div className="mt-8 pt-4">
              <button 
                onClick={() => navigate(`/membership/user-details/${planId}?gymId=${gymId || plan?.gymId}`)}
                className="w-full h-12 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white font-bold rounded-2xl text-sm transition-all shadow-md shadow-purple-100 hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer outline-none"
              >
                Proceed to Enter Details
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MembershipPlanDetails;
