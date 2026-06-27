import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login } from '../../../../services/healthStoreOwnerApi';

const HealthStoreLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login({ email, password });
      if (res.data.success) {
        localStorage.setItem('hsOwnerToken', res.data.data.token);
        localStorage.setItem('hsOwner', JSON.stringify(res.data.data.owner));
        localStorage.setItem('hsStore', JSON.stringify(res.data.data.store));
        toast.success('Welcome to your Health Store Panel!');
        navigate('/health-store-owner/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-red-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-orange-600/5 blur-[100px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/[0.02] border border-white/10 shadow-inner mb-4">
            <span className="text-3xl">🏪</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
            livesale.Fitness <span className="text-red-500">Store Panel</span>
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to manage your diet plans and supplements
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 py-8 px-6 sm:px-10 shadow-2xl rounded-2xl">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Owner Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-white/10 rounded-xl bg-black/40 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 sm:text-sm transition-all"
                  placeholder="owner@store.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-white/10 rounded-xl bg-black/40 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 sm:text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-[0_4px_15px_rgba(239,68,68,0.3)] hover:shadow-[0_4px_25px_rgba(239,68,68,0.5)] text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-all cursor-pointer transform active:scale-95"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>

              <div className="mt-4 text-center">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-red-500 hover:text-red-600 hover:underline transition-all"
                >
                  Standard Admin? Sign In here
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthStoreLogin;
