import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiPath } from '../../services/config';

const SetupPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [reqs, setReqs] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false
  });

  useEffect(() => {
    setReqs({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password)
    });
  }, [password]);

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid or Expired Link</h2>
          <p className="text-gray-600 mb-6">The password setup link you clicked is invalid or has expired.</p>
          <button 
            onClick={() => navigate('/admin/login')}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!reqs.length || !reqs.upper || !reqs.lower || !reqs.number) {
      setError('Please meet all password requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(apiPath('/admins/setup-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password, confirmPassword })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Password set successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/admin/login');
        }, 2000);
      } else {
        setError(data.message || 'Failed to setup password. The link might be expired.');
      }
    } catch (err) {
      setError('Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Complete Your Setup
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Set a secure password for your new admin account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{success}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <p className="text-xs font-medium text-gray-700 mb-2">Password Requirements:</p>
              <ul className="text-xs space-y-1">
                <li className={`flex items-center ${reqs.length ? 'text-green-600' : 'text-gray-500'}`}>
                  {reqs.length ? '✓' : '○'} Minimum 8 characters
                </li>
                <li className={`flex items-center ${reqs.upper ? 'text-green-600' : 'text-gray-500'}`}>
                  {reqs.upper ? '✓' : '○'} At least one uppercase letter (A-Z)
                </li>
                <li className={`flex items-center ${reqs.lower ? 'text-green-600' : 'text-gray-500'}`}>
                  {reqs.lower ? '✓' : '○'} At least one lowercase letter (a-z)
                </li>
                <li className={`flex items-center ${reqs.number ? 'text-green-600' : 'text-gray-500'}`}>
                  {reqs.number ? '✓' : '○'} At least one number (0-9)
                </li>
              </ul>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    confirmPassword && password !== confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-2 text-sm text-red-600">Passwords do not match</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || success}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Set Password & Complete Setup'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetupPassword;
