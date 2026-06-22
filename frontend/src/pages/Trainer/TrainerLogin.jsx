import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginTrainer } from '../../userServices/trainerApi';

const TrainerLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await loginTrainer({ email, password });
      if (res.success) {
        localStorage.setItem('trainerToken', res.token);
        navigate('/trainer/dashboard');
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 py-10">
      <div className="max-w-md w-full">
        {/* Back to home */}
        <div className="mb-6">
          <Link to="/" className="text-white/50 hover:text-white text-sm flex items-center gap-2 transition-all">
            ← Back to livesale.Fitness
          </Link>
        </div>

        {/* Form Container */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black mb-2">
              Trainer <span className="text-[#a3ff12]">Portal</span>
            </h1>
            <p className="text-white/50 text-sm">Sign in to manage your profile and bookings</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white/70">Email Address</label>
              <input
                type="email"
                placeholder="trainer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#a3ff12] focus:ring-1 focus:ring-[#a3ff12] transition-all text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white/70">Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#a3ff12] focus:ring-1 focus:ring-[#a3ff12] transition-all text-sm"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#a3ff12] text-black font-bold hover:bg-[#90e610] transition-all text-sm flex justify-center items-center gap-2"
            >
              {loading ? (
                <><span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Logging in...</>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-white/50 border-t border-white/10 pt-6">
            Don't have a trainer account?{' '}
            <Link to="/trainer/register" className="text-[#a3ff12] hover:underline font-semibold">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerLogin;
