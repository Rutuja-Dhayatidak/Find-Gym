import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar';
import ErrorAlert from '../components/ErrorAlert';
import api from '../userServices/api';
import { User, Mail, Phone, Lock, Landmark, FileText, CheckCircle, Upload } from 'lucide-react';

const GymOwnerRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gstNumber: '',
    
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    
    aadharNumber: '',
    panNumber: '',
  });

  const [files, setFiles] = useState({
    kycDocument: null,
    bankProof: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles[0]) {
      setFiles(prev => ({
        ...prev,
        [name]: selectedFiles[0]
      }));
    }
  };

  const validateStep = () => {
    setError('');
    if (step === 1) {
      if (!formData.name || formData.name.trim().length < 3) {
        setError("Name must be at least 3 characters");
        return false;
      }
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError("Invalid email format");
        return false;
      }
      if (!formData.phone || formData.phone.replace(/\D/g, '').length !== 10) {
        setError("Invalid phone number (must be 10 digits)");
        return false;
      }
      if (!formData.password || formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return false;
      }
    } else if (step === 2) {
      if (!formData.bankName.trim()) {
        setError("Bank name is required");
        return false;
      }
      if (!formData.accountHolderName.trim()) {
        setError("Account holder name is required");
        return false;
      }
      if (!formData.accountNumber || formData.accountNumber.trim().length < 10) {
        setError("Account number must be at least 10 digits");
        return false;
      }
      if (!formData.ifscCode || formData.ifscCode.trim().length !== 11) {
        setError("Invalid IFSC code (must be 11 characters)");
        return false;
      }
    } else if (step === 3) {
      if (!formData.aadharNumber || formData.aadharNumber.replace(/\D/g, '').length !== 12) {
        setError("Invalid Aadhar number (must be 12 digits)");
        return false;
      }
      if (!formData.panNumber || formData.panNumber.trim().length !== 10) {
        setError("Invalid PAN number (must be 10 characters)");
        return false;
      }
      if (!files.kycDocument) {
        setError("KYC Document file upload is required");
        return false;
      }
      if (!files.bankProof) {
        setError("Bank Proof file upload is required");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('ownerName', formData.name);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('password', formData.password);
      if (formData.gstNumber) data.append('gstNumber', formData.gstNumber);
      
      data.append('bankName', formData.bankName);
      data.append('accountNumber', formData.accountNumber);
      data.append('accountHolderName', formData.accountHolderName);
      data.append('ifscCode', formData.ifscCode);
      
      data.append('aadharNumber', formData.aadharNumber);
      data.append('panNumber', formData.panNumber.toUpperCase());
      
      data.append('kycDocument', files.kycDocument);
      data.append('bankProof', files.bankProof);

      const response = await api.post('/auth/gym-owner-register', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        alert("Registration Successful!\nYour account is pending admin verification. You will receive an email shortly.");
        navigate('/gym-owner/login');
      } else {
        setError(response.data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Registration failed. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative text-white flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=90&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 z-10 bg-black/70" />
      {/* Orange glow */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 80% at 10% 90%, rgba(234,88,12,0.15) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-20 max-w-xl w-full">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          </div>
          <span className="text-white font-black text-xl tracking-tight">Find<span className="text-orange-400">Gym</span></span>
        </div>

      <div className="bg-white/[0.06] border border-white/[0.1] backdrop-blur-2xl p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black tracking-tight">Gym Owner Signup</h2>
          <p className="text-sm text-white/45 mt-1">Start partnering with Find Gym today</p>
        </div>

        <ProgressBar currentStep={step} totalSteps={3} />
        <ErrorAlert message={error} />

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-lg font-medium text-orange-400 border-b border-white/[0.08] pb-2">Owner Information</h3>
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/30 w-[17px] h-[17px]" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/[0.07] border border-white/[0.1] text-white placeholder-white/25 rounded-xl focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/30 w-[17px] h-[17px]" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/[0.07] border border-white/[0.1] text-white placeholder-white/25 rounded-xl focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/30 w-[17px] h-[17px]" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit mobile number"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/[0.07] border border-white/[0.1] text-white placeholder-white/25 rounded-xl focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/30 w-[17px] h-[17px]" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Min 6 characters"
                      className="w-full pl-10 pr-4 py-2.5 bg-white/[0.07] border border-white/[0.1] text-white placeholder-white/25 rounded-xl focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 transition-all"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/30 w-[17px] h-[17px]" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Repeat password"
                      className="w-full pl-10 pr-4 py-2.5 bg-white/[0.07] border border-white/[0.1] text-white placeholder-white/25 rounded-xl focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">GST Number (Optional)</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/30 w-[17px] h-[17px]" />
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleInputChange}
                    placeholder="Enter GST if applicable"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/[0.07] border border-white/[0.1] text-white placeholder-white/25 rounded-xl focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-lg font-medium text-orange-400 border-b border-white/[0.08] pb-2">Bank Details</h3>
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  placeholder="e.g. State Bank of India"
                  className="w-full px-4 py-2.5 bg-white/[0.07] border border-white/[0.1] text-white placeholder-white/25 rounded-xl focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Account Holder Name</label>
                <input
                  type="text"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleInputChange}
                  placeholder="Exact name in bank account"
                  className="w-full px-4 py-2.5 bg-white/[0.07] border border-white/[0.1] text-white placeholder-white/25 rounded-xl focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Account Number</label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    placeholder="Enter account number"
                    className="w-full px-4 py-2.5 bg-white/[0.07] border border-white/[0.1] text-white placeholder-white/25 rounded-xl focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">IFSC Code</label>
                  <input
                    type="text"
                    name="ifscCode"
                    value={formData.ifscCode}
                    onChange={handleInputChange}
                    placeholder="11-character code"
                    className="w-full px-4 py-2.5 bg-white/[0.07] border border-white/[0.1] text-white placeholder-white/25 rounded-xl focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 transition-all uppercase"
                    maxLength={11}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-lg font-medium text-orange-400 border-b border-white/[0.08] pb-2">KYC Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Aadhar Number</label>
                  <input
                    type="text"
                    name="aadharNumber"
                    value={formData.aadharNumber}
                    onChange={handleInputChange}
                    placeholder="12-digit number"
                    maxLength={12}
                    className="w-full px-4 py-2.5 bg-white/[0.07] border border-white/[0.1] text-white placeholder-white/25 rounded-xl focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">PAN Number</label>
                  <input
                    type="text"
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={handleInputChange}
                    placeholder="10-character code"
                    maxLength={10}
                    className="w-full px-4 py-2.5 bg-white/[0.07] border border-white/[0.1] text-white placeholder-white/25 rounded-xl focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 transition-all uppercase"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Upload KYC Document (Aadhar/PAN)</label>
                  <div className="relative border border-dashed border-white/[0.1] hover:border-orange-500/40 bg-white/[0.04] rounded-xl p-4 transition-all">
                    <input
                      type="file"
                      name="kycDocument"
                      onChange={handleFileChange}
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                    <div className="flex flex-col items-center justify-center text-center">
                      <Upload className="w-8 h-8 text-white/30 mb-1" />
                      <p className="text-sm text-white/80">
                        {files.kycDocument ? files.kycDocument.name : 'Select Aadhar or PAN Card file'}
                      </p>
                      <p className="text-xs text-white/35">PDF, PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Upload Bank Proof (Cheque/Passbook)</label>
                  <div className="relative border border-dashed border-white/[0.1] hover:border-orange-500/40 bg-white/[0.04] rounded-xl p-4 transition-all">
                    <input
                      type="file"
                      name="bankProof"
                      onChange={handleFileChange}
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                    <div className="flex flex-col items-center justify-center text-center">
                      <Upload className="w-8 h-8 text-white/30 mb-1" />
                      <p className="text-sm text-white/80">
                        {files.bankProof ? files.bankProof.name : 'Select Cancelled Cheque or Passbook'}
                      </p>
                      <p className="text-xs text-white/35">PDF, PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4 border-t border-white/[0.08]">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="w-1/2 py-3 bg-white/[0.07] border border-white/[0.1] hover:bg-white/[0.12] rounded-xl font-semibold transition text-white"
              >
                ← Back
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className={`py-3 rounded-xl font-extrabold transition text-white ${step === 1 ? 'w-full' : 'w-1/2'}`}
                style={{ background: 'linear-gradient(135deg, #FF7A00 0%, #E66E00 100%)', boxShadow: '0 0 24px rgba(255,122,0,0.3)' }}
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 py-3 rounded-xl font-extrabold transition disabled:opacity-50 text-white flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #FF7A00 0%, #E66E00 100%)', boxShadow: '0 0 24px rgba(255,122,0,0.3)' }}
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                ) : 'Register'}
              </button>
            )}
          </div>
        </form>

        <p className="text-center text-sm text-white/35 mt-6">
          Already registered?{' '}
          <Link to="/gym-owner/login" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
            Login here
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
};

export default GymOwnerRegistration;
