import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getUserProfile } from '../userServices/Auth';
import { getPlanDetails } from '../userServices/membershipApi';
import MembershipStepper from '../components/MembershipStepper';
import toast from 'react-hot-toast';

const MembershipUserDetails = () => {
  const { planId } = useParams();
  const [searchParams] = useSearchParams();
  const gymId = searchParams.get('gymId');
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    gender: 'Male',
    dateOfBirth: '',
    city: '',
    emergencyContact: '',
    healthIssue: '',
    preferredJoiningDate: new Date().toISOString().split('T')[0],
    fitnessGoal: 'General Fitness'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await getPlanDetails(planId);
        setPlan(res.data);
      } catch (err) {
        console.warn("Failed to load plan summary:", err.message);
      }
    };
    fetchPlan();

    const cachedData = sessionStorage.getItem(`checkout_user_${planId}`);
    if (cachedData) {
      try {
        setFormData(JSON.parse(cachedData));
        return;
      } catch (e) {
        console.warn("Cached data parse error:", e);
      }
    }

    const prefillUser = async () => {
      try {
        setLoading(true);
        const profile = await getUserProfile();
        if (profile && (profile.user || profile.data)) {
          const user = profile.user || profile.data;
          setFormData(prev => ({
            ...prev,
            fullName: user.name || '',
            mobile: user.phone || '',
            email: user.email || '',
            city: user.city || '',
            gender: user.gender ? (user.gender.charAt(0).toUpperCase() + user.gender.slice(1)) : 'Male'
          }));
        }
      } catch (err) {
        console.log('Skipping prefill, user details auth check failed:', err.message);
      } finally {
        setLoading(false);
      }
    };
    prefillUser();
  }, [planId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile Number is required';
    } else if (!/^\d{10}$/.test(formData.mobile.trim())) {
      newErrors.mobile = 'Mobile Number must be exactly 10 digits';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of Birth is required';
    if (!formData.emergencyContact.trim()) newErrors.emergencyContact = 'Emergency Contact is required';
    
    if (!formData.preferredJoiningDate) {
      newErrors.preferredJoiningDate = 'Joining date is required';
    } else {
      const selectedDate = new Date(formData.preferredJoiningDate);
      const today = new Date();
      today.setHours(0,0,0,0);
      if (selectedDate < today) {
        newErrors.preferredJoiningDate = 'Joining date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }

    sessionStorage.setItem(`checkout_user_${planId}`, JSON.stringify(formData));
    navigate(`/membership/payment/${planId}?gymId=${gymId}`);
  };

  return (
    <div className="min-h-screen bg-black py-10 px-4 md:px-8 text-white">
      <div className="max-w-5xl mx-auto bg-zinc-900/60 rounded-[32px] border border-zinc-800/80 overflow-hidden backdrop-blur-md">
        
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
            <h1 className="text-2xl font-black tracking-tight text-white">Enter Your Details</h1>
            <p className="text-xs text-purple-200 mt-1 font-medium">Please provide accurate information to configure your subscription pass</p>
          </div>
          <div className="text-right">
            <span className="px-4 py-1.5 bg-purple-700/60 text-white text-xs font-bold rounded-full uppercase tracking-wider">
              Step 2 of 3
            </span>
          </div>
        </div>

        {/* Stepper */}
        <div className="px-6 py-6 border-b border-zinc-800 bg-zinc-950/20">
          <MembershipStepper currentStep={2} />
        </div>

        {loading ? (
          <div className="p-20 text-center">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-zinc-400 font-medium">Prefilling user profile...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800/80">
            
            {/* Left Column: Form Fields (8 cols) */}
            <form onSubmit={handleSubmit} className="lg:col-span-8 p-6 md:p-10 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-2.5 h-6 bg-purple-600 rounded-full"></span>
                <h3 className="text-lg font-black text-white tracking-tight uppercase">Registration Form</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Full Name *</label>
                  <input 
                    type="text" 
                    name="fullName"
                    value={formData.fullName} 
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={`w-full h-11 px-4 rounded-xl border bg-zinc-950/80 text-white text-sm focus:bg-zinc-900 transition-all outline-none ${errors.fullName ? 'border-red-500' : 'border-zinc-800 focus:border-purple-500'}`}
                  />
                  {errors.fullName && <p className="text-red-500 text-[11px] mt-1">{errors.fullName}</p>}
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Mobile Number *</label>
                  <input 
                    type="text" 
                    name="mobile"
                    value={formData.mobile} 
                    onChange={handleChange}
                    placeholder="9876543210"
                    className={`w-full h-11 px-4 rounded-xl border bg-zinc-955/80 text-white text-sm focus:bg-zinc-900 transition-all outline-none ${errors.mobile ? 'border-red-500' : 'border-zinc-800 focus:border-purple-500'}`}
                  />
                  {errors.mobile && <p className="text-red-500 text-[11px] mt-1">{errors.mobile}</p>}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Email Address *</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email} 
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className={`w-full h-11 px-4 rounded-xl border bg-zinc-950/80 text-white text-sm focus:bg-zinc-900 transition-all outline-none ${errors.email ? 'border-red-500' : 'border-zinc-800 focus:border-purple-500'}`}
                  />
                  {errors.email && <p className="text-red-500 text-[11px] mt-1">{errors.email}</p>}
                </div>

                {/* Gender select */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Gender *</label>
                  <select 
                    name="gender"
                    value={formData.gender} 
                    onChange={handleChange}
                    className="w-full h-11 px-3 rounded-xl border border-zinc-800 bg-zinc-950/80 text-white text-sm outline-none focus:border-purple-500 focus:bg-zinc-900"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Date of Birth *</label>
                  <input 
                    type="date" 
                    name="dateOfBirth"
                    value={formData.dateOfBirth} 
                    onChange={handleChange}
                    className={`w-full h-11 px-3 rounded-xl border bg-zinc-955/80 text-white text-sm outline-none ${errors.dateOfBirth ? 'border-red-500' : 'border-zinc-800 focus:border-purple-500'}`}
                  />
                  {errors.dateOfBirth && <p className="text-red-500 text-[11px] mt-1">{errors.dateOfBirth}</p>}
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">City</label>
                  <input 
                    type="text" 
                    name="city"
                    value={formData.city} 
                    onChange={handleChange}
                    placeholder="Mumbai"
                    className="w-full h-11 px-4 rounded-xl border border-zinc-800 bg-zinc-950/80 text-white text-sm outline-none focus:border-purple-500"
                  />
                </div>

                {/* Emergency Contact */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Emergency Contact *</label>
                  <input 
                    type="text" 
                    name="emergencyContact"
                    value={formData.emergencyContact} 
                    onChange={handleChange}
                    placeholder="9876543211"
                    className={`w-full h-11 px-4 rounded-xl border bg-zinc-950/80 text-white text-sm outline-none ${errors.emergencyContact ? 'border-red-500' : 'border-zinc-800 focus:border-purple-500'}`}
                  />
                  {errors.emergencyContact && <p className="text-red-500 text-[11px] mt-1">{errors.emergencyContact}</p>}
                </div>

                {/* Preferred Joining Date */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Preferred Joining Date *</label>
                  <input 
                    type="date" 
                    name="preferredJoiningDate"
                    value={formData.preferredJoiningDate} 
                    onChange={handleChange}
                    className={`w-full h-11 px-3 rounded-xl border bg-zinc-955/80 text-white text-sm outline-none ${errors.preferredJoiningDate ? 'border-red-500' : 'border-zinc-800 focus:border-purple-500'}`}
                  />
                  {errors.preferredJoiningDate && <p className="text-red-500 text-[11px] mt-1">{errors.preferredJoiningDate}</p>}
                </div>

                {/* Fitness Goal dropdown */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Fitness Goal *</label>
                  <select 
                    name="fitnessGoal"
                    value={formData.fitnessGoal} 
                    onChange={handleChange}
                    className="w-full h-11 px-3 rounded-xl border border-zinc-800 bg-zinc-950/80 text-white text-sm outline-none focus:border-purple-500 focus:bg-zinc-900"
                  >
                    <option>Weight Loss</option>
                    <option>Muscle Gain</option>
                    <option>General Fitness</option>
                    <option>Strength Training</option>
                    <option>Bodybuilding</option>
                    <option>Cardio Fitness</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              {/* Health Issue text area */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Health Issues, if any</label>
                <textarea 
                  name="healthIssue"
                  value={formData.healthIssue} 
                  onChange={handleChange}
                  placeholder="Mention asthma, back pain, heart issues, etc. if any"
                  rows="3"
                  className="w-full p-4 rounded-xl border border-zinc-800 bg-zinc-955/80 text-white text-sm outline-none focus:border-purple-500 resize-none focus:bg-zinc-900"
                />
              </div>

              {/* Action Button */}
              <button 
                type="submit"
                className="w-full h-12 mt-4 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white font-bold rounded-2xl text-sm transition-all shadow-md shadow-purple-100 hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer outline-none"
              >
                Proceed to Payment Summary
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </form>

            {/* Right Column: Package Recap Summary (4 cols) */}
            <div className="lg:col-span-4 p-6 md:p-10 bg-zinc-900/20 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-6 bg-purple-600 rounded-full"></span>
                  <h3 className="text-lg font-black text-white tracking-tight uppercase">Selected Package</h3>
                </div>

                {plan ? (
                  <div className="bg-gradient-to-br from-purple-700 to-indigo-700 p-6 rounded-3xl text-white shadow-md">
                    <span className="text-[10px] font-bold text-purple-200 bg-white/15 px-3 py-1 rounded-full uppercase tracking-wider">
                      {plan.accessTime || 'All Hours'}
                    </span>
                    <h4 className="text-xl font-extrabold mt-3 mb-0.5">{plan.name}</h4>
                    <p className="text-xs text-purple-200 font-semibold">{plan.durationDays} Days Duration</p>
                    <div className="text-2xl font-black mt-4">
                      ₹{plan.price.toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-zinc-500 bg-zinc-950/30 rounded-2xl border border-dashed border-zinc-800 text-xs">
                    Loading package overview...
                  </div>
                )}

                {/* Quick Help Box */}
                <div className="bg-purple-950/30 rounded-2xl p-5 border border-purple-900/40 text-xs text-purple-200 space-y-2 leading-relaxed">
                  <h5 className="font-bold text-purple-300 uppercase tracking-wider">Need Help?</h5>
                  <p>Filling out user parameters allows trainers to configure suitable cardiovascular and strength load setups on day 1.</p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default MembershipUserDetails;
