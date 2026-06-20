import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { apiPath } from '../../services/config';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(apiPath('/admins/login'), {
        email,
        password
      });

      if (response.data.success) {
        // Based on role, redirect to appropriate dashboard
        const { admin, token } = response.data;
        
        // Save tokens depending on role (we have superAdminToken and adminToken in axios logic)
        localStorage.setItem('admin', JSON.stringify(admin));
        if (admin.adminType === 'Super Admin') {
          localStorage.setItem('superAdminToken', token);
          navigate('/super-admin');
        } else if (admin.adminType === 'Platform Admin') {
          localStorage.setItem('adminToken', token);
          navigate('/platform-admin/dashboard');
        } else if (admin.adminType === 'city_admin' || admin.adminType === 'City Admin') {
          localStorage.setItem('adminToken', token);
          navigate('/city-admin/dashboard');
        } else {
          // Default fallback
          localStorage.setItem('adminToken', token);
          navigate('/platform-admin/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Decorative Glow Spheres */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-[#FF7A00]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-orange-600/5 blur-[100px] pointer-events-none" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center">
          {/* Gym Weight Icon with glow */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/[0.02] border border-white/10 shadow-inner mb-4">
            <svg className="w-8 h-8 text-[#FF7A00] drop-shadow-[0_0_10px_rgba(255,122,0,0.5)]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
            LifeCell.Fitness <span className="text-[#FF7A00]">Admin Portal</span>
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to manage the platform
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          {/* Glassmorphic Container */}
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 py-8 px-6 sm:px-10 shadow-2xl rounded-2xl relative">
            
            {error && (
              <div className="mb-6 bg-red-950/40 border border-red-500/50 p-4 rounded-xl">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-red-500 font-bold">⚠️</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-red-400 font-semibold">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 appearance-none block w-full px-3 py-3 border border-white/10 rounded-xl bg-black/40 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] sm:text-sm transition-all"
                    placeholder="admin@lifecell.fitness"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 appearance-none block w-full px-3 py-3 border border-white/10 rounded-xl bg-black/40 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] sm:text-sm transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-[0_4px_15px_rgba(255,122,0,0.3)] hover:shadow-[0_4px_25px_rgba(255,122,0,0.5)] text-sm font-bold text-white bg-[#FF7A00] hover:bg-[#E66E00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF7A00] disabled:opacity-50 transition-all cursor-pointer transform active:scale-95"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
