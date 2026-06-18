import React, { useState, useEffect } from 'react';
import { getAllTrainers, approveTrainer, rejectTrainer, blockTrainer, getTrainerDetails } from '../../../../services/cityAdminApi';
import TrainerDetails from '../../PlatformAdmin/Trainers/TrainerDetails';

const TrainersList = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignedCities, setAssignedCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const openDetails = (trainer) => {
    setSelectedTrainer(trainer);
    setIsDetailsModalOpen(true);
  };

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem('admin') || '{}');
    const cities = admin.assignedCities || [];
    setAssignedCities(cities);
    if (cities.length > 0) {
      setSelectedCity(cities[0]);
    }
  }, []);

  const fetchTrainers = async () => {
    setLoading(true);
    try {
      const res = await getAllTrainers({
        city: selectedCity || undefined,
        search: searchTerm || undefined,
      });
      if (res.success) {
        setTrainers(res.data);
      } else {
        setError(res.message || 'Failed to fetch trainers');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error communicating with server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, [selectedCity, searchTerm]);

  const handleApprove = async (trainerId) => {
    if (!window.confirm('Approve this trainer?')) return;
    try {
      const res = await approveTrainer(trainerId);
      if (res.success) {
        alert('Trainer approved successfully!');
        fetchTrainers();
      } else {
        alert(res.message || 'Approval failed');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error executing request');
    }
  };

  const handleReject = async (trainerId) => {
    const reason = window.prompt('Please enter the reason for rejection:');
    if (reason === null) return;
    try {
      const res = await rejectTrainer(trainerId, reason);
      if (res.success) {
        alert('Trainer rejected successfully!');
        fetchTrainers();
      } else {
        alert(res.message || 'Rejection failed');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error executing request');
    }
  };

  const handleBlock = async (trainerId) => {
    if (!window.confirm('Are you sure you want to block this trainer?')) return;
    try {
      const res = await blockTrainer(trainerId);
      if (res.success) {
        alert('Trainer blocked successfully!');
        fetchTrainers();
      } else {
        alert(res.message || 'Blocking failed');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error executing request');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Trainers Management</h1>
          <p className="text-slate-500 text-sm">Review, verify, and block personal trainers.</p>
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
            placeholder="Search trainers..."
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
          <div className="text-center py-10 font-medium text-slate-600">Loading trainers...</div>
        ) : trainers.length === 0 ? (
          <div className="text-center py-10 font-medium text-slate-500">No trainers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm font-semibold">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">City</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="text-slate-700 text-sm divide-y divide-slate-100">
                {trainers.map((trainer) => (
                  <tr key={trainer._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-900">{trainer.name}</td>
                    <td className="p-4">{trainer.email}</td>
                    <td className="p-4">{trainer.phone || '-'}</td>
                    <td className="p-4">{trainer.city || '-'}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          trainer.status === 'verified'
                            ? 'bg-green-50 text-green-700 border border-green-150'
                            : trainer.status === 'pending'
                            ? 'bg-yellow-50 text-yellow-700 border border-yellow-150'
                            : 'bg-red-50 text-red-700 border border-red-150'
                        }`}
                      >
                        {trainer.status}
                      </span>
                    </td>
                    <td className="p-4 space-x-2">
                      <button
                        onClick={() => openDetails(trainer)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded text-xs transition-colors"
                      >
                        View
                      </button>
                      {trainer.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(trainer._id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-2.5 py-1 rounded text-xs transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(trainer._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded text-xs transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {trainer.status === 'verified' && (
                        <button
                          onClick={() => handleBlock(trainer._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded text-xs transition-colors"
                        >
                          Block
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
      {isDetailsModalOpen && (
        <TrainerDetails 
          trainerId={selectedTrainer?._id} 
          onClose={() => setIsDetailsModalOpen(false)} 
          apiFetchDetails={getTrainerDetails}
        />
      )}
    </div>
  );
};

export default TrainersList;
