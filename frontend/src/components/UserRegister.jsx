import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { registerUser, sendOtp, verifyOtp, googleLogin } from '../userServices/Auth';
import toast from 'react-hot-toast';

const UserRegister = () => {
  const [step, setStep] = useState(1);
  const [otpSent, setOtpSent] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    phoneCode: '+91',
    phone: '',
    otp: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    profilePhoto: null,
    fitnessGoal: '',
    location: '',
    city: '',
    agreeTerms: false
  });

  const [errors, setErrors] = useState({});

  const handleGoogleCallback = async (response) => {
    const toastId = toast.loading("Processing Google Sign-in...");
    try {
      const res = await googleLogin(response.credential);
      if (res.success) {
        toast.success(res.message || "Google Login successful!", { id: toastId });
        
        // Save to localStorage
        localStorage.setItem("userToken", res.data.token);
        localStorage.setItem("userRole", res.data.user.role);
        localStorage.setItem("userName", res.data.user.name);
        window.dispatchEvent(new Event("storage"));

        setSuccessMsg('Logged in successfully! Redirecting...');
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        toast.error(res.message || "Google Authentication failed", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Google Sign-in failed", { id: toastId });
    }
  };

  useEffect(() => {
    if (step === 1 && window.google) {
      const clientID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "717837798350-t1n3gbm7oiv8lnvkhcdvihss49ql87fe.apps.googleusercontent.com";
      window.google.accounts.id.initialize({
        client_id: clientID,
        callback: handleGoogleCallback
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-signup-button"),
        { theme: "filled_blue", size: "large", width: 330, text: "signup_with" }
      );
    }
  }, [step]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profilePhoto: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFormData({ ...formData, profilePhoto: null });
    setPhotoPreview(null);
  };

  const handleSendOTP = async () => {
    const newErrors = {};
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Valid email is required to send OTP';
    }
    if (!formData.phone || formData.phone.length !== 10 || !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Valid 10-digit phone number is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const toastId = toast.loading("Sending OTP to email...");
    try {
      const res = await sendOtp(formData.email);
      if (res.success) {
        setOtpSent(true);
        setErrors({});
        toast.success(res.message || "OTP sent successfully to your email!", { id: toastId });
      } else {
        toast.error(res.message || "Failed to send OTP", { id: toastId });
      }
    } catch (err) {
      toast.error(err.message || "Error sending OTP", { id: toastId });
    }
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Valid email is required';
      if (!formData.phone || formData.phone.length !== 10 || !/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone number must be exactly 10 digits';
      if (!otpSent) {
        newErrors.otp = 'Please send and enter OTP first';
      } else if (!formData.otp) {
        newErrors.otp = 'OTP is required';
      }
    } else if (step === 2) {
      const hasLetters = /[a-zA-Z]/.test(formData.password);
      const hasNumbers = /\d/.test(formData.password);
      if (!formData.password || formData.password.length < 8 || !hasLetters || !hasNumbers) {
        newErrors.password = 'Password must meet all requirements';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (step === 3) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.age || formData.age < 16 || formData.age > 100) newErrors.age = 'Age must be between 16 and 100';
      if (!formData.gender) newErrors.gender = 'Please select a gender';
      if (!formData.height || formData.height < 100 || formData.height > 250) newErrors.height = 'Height must be between 100 and 250 cm';
      if (!formData.weight || formData.weight < 30 || formData.weight > 300) newErrors.weight = 'Weight must be between 30 and 300 kg';
    } else if (step === 4) {
      if (!formData.location) newErrors.location = 'Please select a region';
      if (!formData.city) newErrors.city = 'Please select a city';
      if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the Terms and Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (step === 1) {
      // Step 1 validation
      const newErrors = {};
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Valid email is required';
      if (!formData.phone || formData.phone.length !== 10 || !/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone number must be exactly 10 digits';
      if (!otpSent) {
        newErrors.otp = 'Please send and enter OTP first';
      } else if (!formData.otp) {
        newErrors.otp = 'OTP is required';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      const toastId = toast.loading("Verifying OTP...");
      try {
        const res = await verifyOtp(formData.email, formData.otp);
        if (res.success) {
          toast.success("OTP verified successfully!", { id: toastId });
          setErrors({});
          setStep((prev) => prev + 1);
        } else {
          toast.error(res.message || "Invalid OTP", { id: toastId });
          setErrors({ otp: res.message || "Invalid OTP" });
        }
      } catch (err) {
        toast.error(err.message || "Invalid OTP", { id: toastId });
        setErrors({ otp: err.message || "Invalid OTP" });
      }
    } else {
      if (validateStep()) {
        setStep((prev) => prev + 1);
      }
    }
  };

  const handlePrev = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep()) {
      setLoading(true);
      try {
        const data = new FormData();
        data.append('email', formData.email);
        data.append('phone', formData.phoneCode + formData.phone);
        data.append('password', formData.password);
        data.append('fullName', formData.fullName);
        data.append('age', formData.age);
        data.append('gender', formData.gender);
        data.append('height', formData.height);
        data.append('weight', formData.weight);
        data.append('location', formData.location);
        data.append('city', formData.city);
        if (formData.profilePhoto) {
          data.append('profilePhoto', formData.profilePhoto);
        }

        const res = await registerUser(data);
        if (res.success) {
          toast.success(res.message || 'Account created successfully!');
          setSuccessMsg('Account created successfully! Redirecting...');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          toast.error(res.message || 'Registration failed');
        }
      } catch (err) {
        toast.error(err.message || 'Registration failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const renderProgressBar = () => {
    return (
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-xs font-semibold text-[#FF7A00]">Step {step} of 4</span>
        </div>
        <div className="flex gap-1.5 h-1.5">
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className={`flex-1 rounded-full transition-all duration-300 ${idx <= step ? 'bg-[#FF7A00]' : 'bg-white/10'
                }`}
            />
          ))}
        </div>
      </div>
    );
  };

  // CSS Input Classes helper (Dark Google Maps Style)
  const getInputClasses = (fieldName) => `
    w-full pl-10 pr-4 py-3 border rounded-xl shadow-sm placeholder-gray-500 
    focus:outline-none focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent text-sm transition-all
    bg-black/40 border-white/10 text-white
    ${errors[fieldName] ? 'border-red-500 bg-red-950/20' : 'border-white/10 hover:border-white/20'}
  `;

  return (
    <div className="min-h-screen relative text-white font-sans flex flex-col lg:flex-row overflow-hidden">

      {/* Full-screen background image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=90&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 z-10 bg-black/65" />
      {/* Orange radial glow */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 80% at 10% 90%, rgba(234,88,12,0.18) 0%, transparent 60%)',
        }}
      />

      {/* Left panel - branding */}
      <div className="relative z-20 hidden lg:flex flex-col justify-between flex-1 p-14 max-w-[55%]">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          </div>
          <span className="text-white font-black text-xl tracking-tight">livesale<span className="text-orange-400">.Fitness</span></span>
        </div>

        {/* Hero text */}
        <div className="mb-10">
          <p className="text-orange-400 text-xs font-bold tracking-[0.2em] uppercase mb-4">Start Your Journey</p>
          <h1 className="text-[3.2rem] font-black text-white leading-[1.08] mb-5">
            Join <span style={{ color: '#FF7A00', textShadow: '0 0 40px rgba(255,122,0,0.4)' }}>livesale.Fitness</span><br />
            and Transform<br />Your Life
          </h1>
          <p className="text-white/55 text-[1rem] leading-[1.7] max-w-[380px]">
            Discover the best gyms, trainers, and fitness centers near your location.
          </p>
          <div className="space-y-4 mt-10">
            {[
              { icon: '🏋️', title: 'Top Rated Gyms', desc: 'Explore 1000+ top rated gyms near you' },
              { icon: '👤', title: 'Expert Trainers', desc: '500+ certified and experienced trainers' },
              { icon: '⭐', title: 'Trusted Reviews', desc: 'Real reviews to make informed decisions' },
            ].map((f) => (
              <div key={f.title} className="flex items-center gap-3">
                <span className="text-xl">{f.icon}</span>
                <div>
                  <div className="text-white text-sm font-bold">{f.title}</div>
                  <div className="text-white/40 text-xs">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-8 mt-10">
            {[
              { val: '1000+', label: 'Gyms' },
              { val: '500+', label: 'Trainers' },
              { val: '50+', label: 'Cities' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-[1.7rem] font-black text-orange-400 leading-none">{s.val}</div>
                <div className="text-white/40 text-xs font-medium mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - multi-step form */}
      <div className="relative z-20 flex items-center justify-center w-full lg:w-auto lg:min-w-[460px] lg:max-w-[520px] px-6 py-12 lg:px-12 lg:bg-black/40 lg:backdrop-blur-2xl lg:border-l lg:border-white/[0.08] mt-16 lg:mt-0">
        <div className="w-full max-w-[460px] relative">

          {/* Subtle Orange Glow Border Effect */}
          <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF7A00]/40 to-transparent blur-[1px]" />

          <h2 className="mb-2 text-2xl font-extrabold tracking-tight">
            Create <span className="text-[#FF7A00]">Account</span>
          </h2>

          {renderProgressBar()}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-center text-sm font-medium">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Step 1: Email & Phone */}
            {step === 1 && (
              <div className="space-y-4">
                {/* Google Sign-up */}
                <div id="google-signup-button" className="w-full flex justify-center py-1"></div>

                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-white/5"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-500 text-xs tracking-widest uppercase">OR</span>
                  <div className="flex-grow border-t border-white/5"></div>
                </div>

                {/* Email field */}
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-gray-500">✉️</span>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={getInputClasses('email')}
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                </div>

                {/* Phone number field */}
                <div>
                  <div className="flex gap-2">
                    <select
                      name="phoneCode"
                      value={formData.phoneCode}
                      onChange={handleChange}
                      className="w-[90px] px-2 py-3 border border-white/10 bg-black/60 text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
                    >
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                    </select>
                    <div className="relative flex-grow">
                      <span className="absolute left-3.5 top-3.5 text-gray-500">📞</span>
                      <input
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className={getInputClasses('phone')}
                        placeholder="9876543210"
                      />
                    </div>
                  </div>
                  {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone}</p>}
                </div>

                {/* Send OTP button */}
                {!otpSent ? (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    className="w-full py-3 px-4 border border-[#FF7A00] text-[#FF7A00] hover:bg-[#FF7A00]/10 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>🚀</span> Send OTP
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <span className="absolute left-3.5 top-3.5 text-gray-500">🔑</span>
                      <input
                        name="otp"
                        type="text"
                        maxLength="6"
                        value={formData.otp}
                        onChange={handleChange}
                        className={getInputClasses('otp')}
                        placeholder="Enter 6-digit OTP"
                      />
                    </div>
                    {errors.otp && <p className="mt-1 text-xs text-red-400">{errors.otp}</p>}
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      className="w-full text-right text-xs text-gray-400 hover:text-[#FF7A00]"
                    >
                      Resend OTP?
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Password */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-gray-500">🔒</span>
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={getInputClasses('password')}
                    placeholder="Password"
                  />
                  {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-gray-500">🔒</span>
                  <input
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={getInputClasses('confirmPassword')}
                    placeholder="Confirm Password"
                  />
                  {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>}
                </div>

                {/* Password meter details */}
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1.5 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <span>{formData.password.length >= 8 ? '✅' : '❌'}</span>
                    <span>Min 8 characters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{/[a-zA-Z]/.test(formData.password) ? '✅' : '❌'}</span>
                    <span>Contains letters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{/\d/.test(formData.password) ? '✅' : '❌'}</span>
                    <span>Contains numbers</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Profile Details */}
            {step === 3 && (
              <div className="space-y-4">
                {/* Photo upload wrapper */}
                <div className="flex items-center gap-4 p-3 bg-white/5 border border-white/5 rounded-xl">
                  {photoPreview ? (
                    <div className="relative">
                      <img src={photoPreview} alt="Preview" className="h-14 w-14 object-cover rounded-full border border-[#FF7A00]" />
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-black/40 flex items-center justify-center border border-dashed border-white/20 text-gray-500 text-xs">
                      No Photo
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="block w-full text-xs text-gray-400 file:mr-4 file:py-1.5 file:px-3.5 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"
                  />
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-gray-500">👤</span>
                  <input
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={getInputClasses('fullName')}
                    placeholder="Full Name"
                  />
                  {errors.fullName && <p className="mt-1 text-xs text-red-400">{errors.fullName}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-gray-500">🎂</span>
                    <input
                      name="age"
                      type="number"
                      value={formData.age}
                      onChange={handleChange}
                      className={getInputClasses('age')}
                      placeholder="Age"
                    />
                  </div>
                  <div>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-3 py-3 border border-white/10 bg-black/60 text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
                    >
                      <option value="">Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-gray-500">📏</span>
                    <input
                      name="height"
                      type="number"
                      value={formData.height}
                      onChange={handleChange}
                      className={getInputClasses('height')}
                      placeholder="Height (cm)"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-gray-500">⚖️</span>
                    <input
                      name="weight"
                      type="number"
                      value={formData.weight}
                      onChange={handleChange}
                      className={getInputClasses('weight')}
                      placeholder="Weight (kg)"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Location */}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-3 py-3 border border-white/10 bg-black/60 text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
                  >
                    <option value="">Select Region</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Delhi">Delhi</option>
                  </select>
                </div>
                <div>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-3 border border-white/10 bg-black/60 text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
                  >
                    <option value="">Select City</option>
                    <option value="Pune">Pune</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Bangalore">Bangalore</option>
                  </select>
                </div>
              </div>
            )}

            {/* Nav controls */}
            <div className="flex gap-3 pt-3 mt-4 border-t border-white/5">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="w-1/3 py-3 px-4 border border-white/10 rounded-xl font-bold text-xs hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Back
                </button>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className={`${step > 1 ? 'w-2/3' : 'w-full'} flex justify-center items-center py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#FF7A00] hover:bg-[#E66E00] shadow-[0_4px_15px_rgba(255,122,0,0.3)] transition-all transform hover:-translate-y-0.5 cursor-pointer`}
                >
                  Next Step &rarr;
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className={`${step > 1 ? 'w-2/3' : 'w-full'} flex justify-center items-center py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#FF7A00] hover:bg-[#E66E00] shadow-[0_4px_15px_rgba(255,122,0,0.3)] transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50`}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              )}
            </div>

            <div className="text-center mt-5">
              <span className="text-xs text-gray-400">Already have an account? </span>
              <Link to="/login" className="text-xs font-bold text-[#FF7A00] hover:underline">
                Login
              </Link>
            </div>

            {/* Terms and conditions checkmark box below login */}
            <div className="flex items-start mt-4 px-4">
              <input
                id="agreeTerms"
                name="agreeTerms"
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="h-4 w-4 text-[#FF7A00] focus:ring-[#FF7A00] border-gray-600 rounded bg-transparent mt-0.5 cursor-pointer"
              />
              <label htmlFor="agreeTerms" className="ml-2.5 text-xs text-gray-300 leading-relaxed text-left cursor-pointer">
                I agree to the <a href="#" className="text-[#FF7A00] hover:underline">Terms of Service</a> and <a href="#" className="text-[#FF7A00] hover:underline">Privacy Policy</a>
              </label>
            </div>
            {errors.agreeTerms && <p className="mt-1 text-xs text-red-400 text-center">{errors.agreeTerms}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;
