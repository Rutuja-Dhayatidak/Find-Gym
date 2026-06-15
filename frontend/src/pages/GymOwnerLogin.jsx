import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ErrorAlert from '../components/ErrorAlert';
import api from '../utils/api';
import { Mail, Lock, Landmark } from 'lucide-react';

const GymOwnerLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/gym-owner-login', { email, password });
      if (response.data.success) {
        const { token, owner } = response.data.data;
        
        // Store details in local storage for frontend auth persistence check
        localStorage.setItem('gymOwnerToken', token);
        localStorage.setItem('gymOwner', JSON.stringify(owner));
        
        navigate('/gym-owner/dashboard');
      } else {
        setError(response.data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-6">
          <Landmark className="w-12 h-12 text-orange-500 mx-auto mb-2" />
          <h2 className="text-3xl font-extrabold tracking-tight">Gym Owner Login</h2>
          <p className="text-sm text-zinc-400 mt-1">Access your dashboard and manage gyms</p>
        </div>

        <ErrorAlert message={error} />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 rounded-xl font-semibold transition disabled:opacity-50 text-white"
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-zinc-400 mt-6">
          Don't have an owner account?{' '}
          <Link to="/gym-owner/register" className="text-orange-500 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default GymOwnerLogin;
