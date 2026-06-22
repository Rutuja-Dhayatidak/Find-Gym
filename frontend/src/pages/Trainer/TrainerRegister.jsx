import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerTrainer } from '../../userServices/trainerApi';

// ─── Step indicator ──────────────────────────────────────────────────────────
const StepIndicator = ({ current, total }) => (
  <div className="flex items-center justify-center gap-2 mb-8">
    {Array.from({ length: total }, (_, i) => {
      const step = i + 1;
      const done = step < current;
      const active = step === current;
      return (
        <React.Fragment key={step}>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
            ${active ? 'bg-[#a3ff12] border-[#a3ff12] text-black' :
              done ? 'bg-[#a3ff12]/20 border-[#a3ff12] text-[#a3ff12]' :
              'bg-white/5 border-white/20 text-white/40'}`}>
            {done ? '✓' : step}
          </div>
          {step < total && <div className={`h-0.5 w-10 rounded ${done ? 'bg-[#a3ff12]' : 'bg-white/10'}`} />}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── Field helpers ────────────────────────────────────────────────────────────
const Field = ({ label, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-white/70">{label}</label>
    {children}
    {error && <p className="text-red-400 text-xs">{error}</p>}
  </div>
);

const Input = (props) => (
  <input
    {...props}
    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30
      focus:outline-none focus:border-[#a3ff12] focus:ring-1 focus:ring-[#a3ff12] transition-all text-sm"
  />
);

const Select = ({ children, ...props }) => (
  <select
    {...props}
    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white
      focus:outline-none focus:border-[#a3ff12] transition-all text-sm"
  >
    {children}
  </select>
);

const FileInput = ({ label, name, accept, onChange, preview }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-medium text-white/70">{label}</label>
    <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-xl p-6
      cursor-pointer hover:border-[#a3ff12]/60 transition-all group bg-white/3">
      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📎</div>
      <span className="text-white/50 text-sm">Click to upload</span>
      {preview && <span className="text-[#a3ff12] text-xs mt-1 truncate max-w-xs">{preview}</span>}
      <input type="file" name={name} accept={accept} onChange={onChange} className="hidden" />
    </label>
  </div>
);

const SPECIALIZATIONS = ['Weight Training', 'Yoga', 'Cardio', 'CrossFit', 'Pilates', 'Zumba', 'Boxing', 'Swimming', 'Calisthenics', 'Nutrition'];
const TRAINING_TYPES = ['Personal Training', 'Group Training', 'Online Training', 'Home Visits'];
const LANGUAGES = ['Hindi', 'English', 'Marathi', 'Gujarati', 'Tamil', 'Telugu', 'Kannada', 'Bengali'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = ['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'];
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai', 'Hyderabad', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat'];

// ─── Main Component ───────────────────────────────────────────────────────────
const TrainerRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    // Step 1
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    dateOfBirth: '', gender: '',
    // Step 2
    city: '', specializations: [], experience: '', bio: '',
    languages: [], trainingTypes: [], certifications: '',
    // Step 3
    pricePerSession: '', pricePerMonth: '', trialSession: false, trialPrice: '',
    availability: { days: [], timeSlots: [] },
    // Step 4
    aadharNumber: '', panNumber: '', accountHolder: '', accountNumber: '', ifsc: '', bankName: '',
  });

  const [files, setFiles] = useState({ profilePhoto: null, aadharCard: null, certificates: [] });
  const [filePreviews, setFilePreviews] = useState({ profilePhoto: '', aadharCard: '' });

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const toggleArr = (field, val) => {
    const arr = form[field];
    set(field, arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const handleFile = (e) => {
    const { name, files: fl } = e.target;
    if (name === 'certificates') {
      setFiles(prev => ({ ...prev, certificates: Array.from(fl) }));
    } else {
      setFiles(prev => ({ ...prev, [name]: fl[0] }));
      setFilePreviews(prev => ({ ...prev, [name]: fl[0]?.name || '' }));
    }
  };

  // ─── Validation per step ───────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (step === 1) {
      if (!form.name || form.name.length < 3) errs.name = 'Min 3 characters required';
      if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Valid email required';
      if (!form.phone || !/^\d{10}$/.test(form.phone)) errs.phone = 'Exactly 10 digits required';
      if (!form.password || form.password.length < 6) errs.password = 'Min 6 characters required';
      if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
      if (!form.dateOfBirth) errs.dateOfBirth = 'Date of birth required';
      if (!form.gender) errs.gender = 'Please select gender';
    }
    if (step === 2) {
      if (!form.city) errs.city = 'City is required';
      if (form.specializations.length === 0) errs.specializations = 'Select at least one specialization';
      if (!form.experience || isNaN(form.experience) || Number(form.experience) < 0) errs.experience = 'Valid experience required';
      if (!form.bio || form.bio.length < 20) errs.bio = 'Min 20 characters required';
      if (form.trainingTypes.length === 0) errs.trainingTypes = 'Select at least one training type';
    }
    if (step === 3) {
      if (!form.pricePerSession || Number(form.pricePerSession) <= 0) errs.pricePerSession = 'Valid price required';
      if (form.availability.days.length === 0) errs.availDays = 'Select at least one day';
      if (form.availability.timeSlots.length === 0) errs.availSlots = 'Select at least one time slot';
    }
    if (step === 4) {
      if (!files.profilePhoto) errs.profilePhoto = 'Profile photo required';
      if (!files.aadharCard) errs.aadharCard = 'Aadhar card required';
      if (!form.aadharNumber || form.aadharNumber.replace(/\D/g, '').length !== 12) {
        errs.aadharNumber = 'Aadhar number must be exactly 12 digits';
      }
      if (!form.panNumber || form.panNumber.trim().length !== 10) {
        errs.panNumber = 'PAN number must be exactly 10 characters';
      }
      if (!form.accountHolder) errs.accountHolder = 'Account holder name is required';
      if (!form.accountNumber || form.accountNumber.trim().length < 10) {
        errs.accountNumber = 'Bank account number must be at least 10 digits';
      }
      if (!form.ifsc || form.ifsc.trim().length !== 11) {
        errs.ifsc = 'IFSC code must be exactly 11 characters';
      }
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => { if (validate()) setStep(s => s + 1); };
  const back = () => setStep(s => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setServerError('');
    try {
      const fd = new FormData();
      // Append all text fields with mapping to backend keys
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'accountHolder') {
          fd.append('bankAccountHolderName', v);
        } else if (k === 'accountNumber') {
          fd.append('bankAccountNumber', v);
        } else if (k === 'ifsc') {
          fd.append('bankIfscCode', v);
        } else if (typeof v === 'object' && !Array.isArray(v) && v !== null) {
          fd.append(k, JSON.stringify(v));
        } else if (Array.isArray(v)) {
          v.forEach(item => fd.append(k, item));
        } else {
          fd.append(k, v);
        }
      });
      if (files.profilePhoto) fd.append('profilePhoto', files.profilePhoto);
      if (files.aadharCard) fd.append('aadharCard', files.aadharCard);
      files.certificates.forEach(f => fd.append('certificates', f));

      const res = await registerTrainer(fd);
      if (res.success) {
        localStorage.setItem('trainerToken', res.token);
        navigate('/trainer/dashboard');
      } else {
        setServerError(res.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setServerError(err?.message || 'Server error. Please try again.');
    } finally {

      setSubmitting(false);
    }
  };

  // ─── Step renderers ────────────────────────────────────────────────────────
  const renderStep1 = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <Field label="Full Name *" error={fieldErrors.name}>
        <Input placeholder="John Smith" value={form.name} onChange={e => set('name', e.target.value)} />
      </Field>
      <Field label="Email Address *" error={fieldErrors.email}>
        <Input type="email" placeholder="john@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
      </Field>
      <Field label="Phone Number *" error={fieldErrors.phone}>
        <Input placeholder="10-digit number" value={form.phone} onChange={e => set('phone', e.target.value)} />
      </Field>
      <Field label="Date of Birth *" error={fieldErrors.dateOfBirth}>
        <Input type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} />
      </Field>
      <Field label="Password *" error={fieldErrors.password}>
        <Input type="password" placeholder="Min 6 characters" value={form.password} onChange={e => set('password', e.target.value)} />
      </Field>
      <Field label="Confirm Password *" error={fieldErrors.confirmPassword}>
        <Input type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
      </Field>
      <Field label="Gender *" error={fieldErrors.gender}>
        <Select value={form.gender} onChange={e => set('gender', e.target.value)}>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </Select>
      </Field>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="City *" error={fieldErrors.city}>
          <Select value={form.city} onChange={e => set('city', e.target.value)}>
            <option value="">Select City</option>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Years of Experience *" error={fieldErrors.experience}>
          <Input type="number" min="0" placeholder="e.g. 3" value={form.experience} onChange={e => set('experience', e.target.value)} />
        </Field>
      </div>
      <Field label="Specializations * (select all that apply)" error={fieldErrors.specializations}>
        <div className="flex flex-wrap gap-2 mt-1">
          {SPECIALIZATIONS.map(s => (
            <button type="button" key={s} onClick={() => toggleArr('specializations', s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                ${form.specializations.includes(s) ? 'bg-[#a3ff12] text-black border-[#a3ff12]' : 'bg-white/5 text-white/60 border-white/10 hover:border-[#a3ff12]/40'}`}>
              {s}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Training Types *" error={fieldErrors.trainingTypes}>
        <div className="flex flex-wrap gap-2 mt-1">
          {TRAINING_TYPES.map(t => (
            <button type="button" key={t} onClick={() => toggleArr('trainingTypes', t)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                ${form.trainingTypes.includes(t) ? 'bg-[#a3ff12] text-black border-[#a3ff12]' : 'bg-white/5 text-white/60 border-white/10 hover:border-[#a3ff12]/40'}`}>
              {t}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Languages Spoken">
        <div className="flex flex-wrap gap-2 mt-1">
          {LANGUAGES.map(l => (
            <button type="button" key={l} onClick={() => toggleArr('languages', l)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                ${form.languages.includes(l) ? 'bg-[#a3ff12] text-black border-[#a3ff12]' : 'bg-white/5 text-white/60 border-white/10 hover:border-[#a3ff12]/40'}`}>
              {l}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Certifications (comma separated)">
        <Input placeholder="e.g. ACE, NASM, CrossFit Level 1" value={form.certifications} onChange={e => set('certifications', e.target.value)} />
      </Field>
      <Field label="Bio / About You *" error={fieldErrors.bio}>
        <textarea
          rows={4}
          placeholder="Tell clients about yourself, your training philosophy, achievements..."
          value={form.bio}
          onChange={e => set('bio', e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30
            focus:outline-none focus:border-[#a3ff12] focus:ring-1 focus:ring-[#a3ff12] transition-all text-sm resize-none"
        />
      </Field>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Price Per Session (₹) *" error={fieldErrors.pricePerSession}>
          <Input type="number" min="0" placeholder="e.g. 500" value={form.pricePerSession} onChange={e => set('pricePerSession', e.target.value)} />
        </Field>
        <Field label="Price Per Month (₹)">
          <Input type="number" min="0" placeholder="e.g. 4000" value={form.pricePerMonth} onChange={e => set('pricePerMonth', e.target.value)} />
        </Field>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={() => set('trialSession', !form.trialSession)}
          className={`w-12 h-6 rounded-full transition-all relative ${form.trialSession ? 'bg-[#a3ff12]' : 'bg-white/10'}`}>
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.trialSession ? 'left-6' : 'left-0.5'}`} />
        </button>
        <span className="text-white/80 text-sm">Offer Free / Discounted Trial Session</span>
      </div>
      {form.trialSession && (
        <Field label="Trial Session Price (₹) — 0 for free">
          <Input type="number" min="0" placeholder="0" value={form.trialPrice} onChange={e => set('trialPrice', e.target.value)} />
        </Field>
      )}

      <Field label="Available Days *" error={fieldErrors.availDays}>
        <div className="flex flex-wrap gap-2 mt-1">
          {DAYS.map(d => (
            <button type="button" key={d} onClick={() => setForm(prev => {
              const days = prev.availability.days.includes(d)
                ? prev.availability.days.filter(x => x !== d)
                : [...prev.availability.days, d];
              return { ...prev, availability: { ...prev.availability, days } };
            })}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                ${form.availability.days.includes(d) ? 'bg-[#a3ff12] text-black border-[#a3ff12]' : 'bg-white/5 text-white/60 border-white/10 hover:border-[#a3ff12]/40'}`}>
              {d.slice(0, 3)}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Available Time Slots *" error={fieldErrors.availSlots}>
        <div className="flex flex-wrap gap-2 mt-1">
          {TIME_SLOTS.map(t => (
            <button type="button" key={t} onClick={() => setForm(prev => {
              const timeSlots = prev.availability.timeSlots.includes(t)
                ? prev.availability.timeSlots.filter(x => x !== t)
                : [...prev.availability.timeSlots, t];
              return { ...prev, availability: { ...prev.availability, timeSlots } };
            })}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                ${form.availability.timeSlots.includes(t) ? 'bg-[#a3ff12] text-black border-[#a3ff12]' : 'bg-white/5 text-white/60 border-white/10 hover:border-[#a3ff12]/40'}`}>
              {t}
            </button>
          ))}
        </div>
      </Field>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FileInput label="Profile Photo *" name="profilePhoto" accept="image/*" onChange={handleFile} preview={filePreviews.profilePhoto} />
        <FileInput label="Aadhar Card *" name="aadharCard" accept="image/*,.pdf" onChange={handleFile} preview={filePreviews.aadharCard} />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white/70">Certificates (max 3)</label>
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-xl p-5
          cursor-pointer hover:border-[#a3ff12]/60 transition-all group">
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🏅</div>
          <span className="text-white/50 text-sm">Upload Certificates (PDF / Image)</span>
          {files.certificates.length > 0 && (
            <span className="text-[#a3ff12] text-xs mt-1">{files.certificates.length} file(s) selected</span>
          )}
          <input type="file" name="certificates" accept="image/*,.pdf" multiple onChange={handleFile} className="hidden" />
        </label>
        {fieldErrors.profilePhoto && <p className="text-red-400 text-xs">{fieldErrors.profilePhoto}</p>}
        {fieldErrors.aadharCard && <p className="text-red-400 text-xs">{fieldErrors.aadharCard}</p>}
      </div>

      <div className="border border-white/10 rounded-xl p-5 bg-white/3">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">🏦 Bank Details <span className="text-white/40 font-normal text-sm">(for payouts)</span></h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Account Holder Name *" error={fieldErrors.accountHolder}>
            <Input placeholder="As per bank records" value={form.accountHolder} onChange={e => set('accountHolder', e.target.value)} />
          </Field>
          <Field label="Account Number *" error={fieldErrors.accountNumber}>
            <Input placeholder="Bank account number" value={form.accountNumber} onChange={e => set('accountNumber', e.target.value)} />
          </Field>
          <Field label="IFSC Code *" error={fieldErrors.ifsc}>
            <Input placeholder="e.g. SBIN0001234" value={form.ifsc} onChange={e => set('ifsc', e.target.value.toUpperCase())} />
          </Field>
          <Field label="Bank Name">
            <Input placeholder="e.g. State Bank of India" value={form.bankName} onChange={e => set('bankName', e.target.value)} />
          </Field>
        </div>
      </div>

      <div className="border border-white/10 rounded-xl p-5 bg-white/3">
        <h3 className="text-white font-semibold mb-4">🪪 KYC Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Aadhar Number *" error={fieldErrors.aadharNumber}>
            <Input placeholder="12-digit Aadhar number" value={form.aadharNumber} onChange={e => set('aadharNumber', e.target.value)} />
          </Field>
          <Field label="PAN Number *" error={fieldErrors.panNumber}>
            <Input placeholder="e.g. ABCDE1234F" value={form.panNumber} onChange={e => set('panNumber', e.target.value.toUpperCase())} />
          </Field>
        </div>
      </div>
    </div>
  );

  const stepTitles = ['Personal Info', 'Professional Info', 'Pricing & Schedule', 'Documents & KYC'];

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4">
      {/* Back to home */}
      <div className="max-w-3xl mx-auto mb-6">
        <Link to="/" className="text-white/50 hover:text-white text-sm flex items-center gap-2 transition-all">
          ← Back to livesale.Fitness
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black mb-2">
            Become a <span className="text-[#a3ff12]">Trainer</span>
          </h1>
          <p className="text-white/50 text-sm">Join livesale.Fitness's trainer network and grow your fitness career</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
          <StepIndicator current={step} total={4} />

          {/* Step Title */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">
              Step {step}: {stepTitles[step - 1]}
            </h2>
            <div className="h-0.5 w-full bg-white/5 rounded mt-3">
              <div className="h-0.5 bg-[#a3ff12] rounded transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }} />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}

            {serverError && (
              <div className="mt-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                ⚠️ {serverError}
              </div>
            )}

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
              {step > 1 ? (
                <button type="button" onClick={back}
                  className="px-6 py-2.5 rounded-xl border border-white/20 text-white/70 hover:text-white hover:border-white/50 transition-all text-sm font-medium">
                  ← Back
                </button>
              ) : (
                <Link to="/trainer/login" className="text-white/40 hover:text-white/70 text-sm transition-all">
                  Already registered? Login
                </Link>
              )}

              {step < 4 ? (
                <button type="button" onClick={next}
                  className="px-8 py-2.5 rounded-xl bg-[#a3ff12] text-black font-bold hover:bg-[#90e610] transition-all text-sm">
                  Next Step →
                </button>
              ) : (
                <button type="submit" disabled={submitting}
                  className="px-8 py-2.5 rounded-xl bg-[#a3ff12] text-black font-bold hover:bg-[#90e610] transition-all text-sm disabled:opacity-50 flex items-center gap-2">
                  {submitting ? (
                    <><span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Submitting...</>
                  ) : '🚀 Submit Application'}
                </button>
              )}
            </div>
          </form>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          Your application will be reviewed within 2–3 business days.
        </p>
      </div>
    </div>
  );
};

export default TrainerRegister;
