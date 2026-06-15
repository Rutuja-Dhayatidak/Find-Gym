import React, { useState, useEffect } from 'react';
import { getAllGyms, approveGym, rejectGym, suspendGym } from '../../../../services/cityAdminApi';

const GymsList = () => {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignedCities, setAssignedCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem('admin') || '{}');
    const cities = admin.assignedCities || [];
    setAssignedCities(cities);
    if (cities.length > 0) {
      setSelectedCity(cities[0]);
    }
  }, []);

  const fetchGyms = async () => {
    setLoading(true);
    try {
      const res = await getAllGyms({
        city: selectedCity || undefined,
        search: searchTerm || undefined,
      });
      if (res.success) {
        setGyms(res.data);
      } else {
        setError(res.message || 'Failed to fetch gyms');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error communicating with server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGyms();
  }, [selectedCity, searchTerm]);

  const handleApprove = async (gymId) => {
    if (!window.confirm('Are you sure you want to approve this gym?')) return;
    try {
      const res = await approveGym(gymId);
      if (res.success) {
        alert('Gym approved successfully!');
        fetchGyms();
      } else {
        alert(res.message || 'Approval failed');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error executing request');
    }
  };

  const handleReject = async (gymId) => {
    const reason = window.prompt('Please enter the reason for rejection:');
    if (reason === null) return;
    try {
      const res = await rejectGym(gymId, reason);
      if (res.success) {
        alert('Gym rejected successfully!');
        fetchGyms();
      } else {
        alert(res.message || 'Rejection failed');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error executing request');
    }
  };

  const handleSuspend = async (gymId) => {
    if (!window.confirm('Are you sure you want to suspend this gym?')) return;
    try {
      const res = await suspendGym(gymId);
      if (res.success) {
        alert('Gym suspended successfully!');
        fetchGyms();
      } else {
        alert(res.message || 'Suspension failed');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error executing request');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gyms Management</h1>
          <p className="text-slate-500 text-sm">Review applications, approve, reject, or suspend gyms.</p>
        </div>
        <div className="flex gap-4 items-center">
          {assignedCities.length > 1 && (
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Assigned Cities</option>
              {assignedCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
          <input
            type="text"
            placeholder="Search gyms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 w-64"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-10 font-medium text-slate-600">Loading gyms...</div>
        ) : gyms.length === 0 ? (
          <div className="text-center py-10 font-medium text-slate-500">No gyms found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm font-semibold">
                  <th className="p-4">Name</th>
                  <th className="p-4">Owner Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">City</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="text-slate-700 text-sm divide-y divide-slate-100">
                {gyms.map((gym) => (
                  <tr key={gym._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-900">{gym.name}</td>
                    <td className="p-4">{gym.ownerName}</td>
                    <td className="p-4">{gym.email}</td>
                    <td className="p-4">{gym.phone}</td>
                    <td className="p-4">{gym.location?.city || gym.city}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          gym.status === 'approved'
                            ? 'bg-green-50 text-green-700 border border-green-150'
                            : gym.status === 'pending'
                            ? 'bg-yellow-50 text-yellow-700 border border-yellow-150'
                            : gym.status === 'suspended'
                            ? 'bg-orange-50 text-orange-700 border border-orange-150'
                            : 'bg-red-50 text-red-700 border border-red-150'
                        }`}
                      >
                        {gym.status}
                      </span>
                    </td>
                    <td className="p-4 space-x-2">
                      {gym.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(gym._id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-2.5 py-1 rounded text-xs transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(gym._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded text-xs transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {gym.status === 'approved' && (
                        <button
                          onClick={() => handleSuspend(gym._id)}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-2.5 py-1 rounded text-xs transition-colors"
                        >
                          Suspend
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GymsList;
