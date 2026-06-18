import React, { useState, useEffect } from 'react';
import { getTrainerDetails } from '../../../../services/adminApi';

const TrainerDetails = ({ trainerId, onClose, apiFetchDetails = getTrainerDetails }) => {
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const response = await apiFetchDetails(trainerId);
        if (response.success) {
          setTrainer(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch trainer details:', error);
      } finally {
        setLoading(false);
      }
    };
    if (trainerId) fetchDetails();
  }, [trainerId]);

  if (!trainerId) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Trainer Details</h2>
          <button onClick={onClose} className="text-slate-500 hover:bg-slate-200 p-2 rounded-full transition-colors">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : !trainer ? (
            <div className="text-center text-red-500 py-10">Failed to load trainer data.</div>
          ) : (
            <div className="space-y-8">
              {/* Profile Header */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-3xl font-bold border-4 border-white shadow-lg overflow-hidden shrink-0">
                  {trainer.profilePhoto ? <img src={trainer.profilePhoto} alt={trainer.name} className="w-full h-full object-cover" /> : trainer.name?.charAt(0)}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-slate-800">{trainer.name}</h3>
                  <p className="text-slate-500">{trainer.email} • {trainer.phone}</p>
                  <p className="text-slate-500 mt-1">
                    <strong>City:</strong> {trainer.city || 'N/A'} • <strong>Gender:</strong> {trainer.gender || 'N/A'} • <strong>DOB:</strong> {trainer.dateOfBirth ? new Date(trainer.dateOfBirth).toLocaleDateString() : 'N/A'}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      trainer.status === 'verified' ? 'bg-emerald-100 text-emerald-700' : 
                      trainer.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {trainer.status.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold flex items-center">
                      ⭐ {trainer.rating || 0}
                    </span>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center flex items-center justify-center">
                  <div>
                    <p className="text-sm text-slate-500">Active Clients</p>
                    <p className="text-2xl font-bold text-slate-800">{trainer.clientCount || 0}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Info Column */}
                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <h4 className="text-lg font-semibold text-slate-800 border-b pb-2 mb-4">Professional Info</h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-slate-500">Experience</p>
                        <p className="font-medium text-slate-800">{trainer.experience || 0} Years</p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Specializations</p>
                        <div className="flex flex-wrap gap-2">
                          {trainer.specializations && trainer.specializations.length > 0 ? (
                            trainer.specializations.map((spec, idx) => (
                              <span key={idx} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">
                                {spec}
                              </span>
                            ))
                          ) : <span className="text-slate-500">None listed</span>}
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Languages</p>
                        <div className="flex flex-wrap gap-2">
                          {trainer.languages && trainer.languages.length > 0 ? (
                            trainer.languages.map((lang, idx) => (
                              <span key={idx} className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-medium">
                                {lang}
                              </span>
                            ))
                          ) : <span className="text-slate-500">None listed</span>}
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-500">Bio</p>
                        <p className="text-slate-800 mt-1">{trainer.bio || 'No bio provided.'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <h4 className="text-lg font-semibold text-slate-800 border-b pb-2 mb-4">Pricing & Training Formats</h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-slate-500 mb-1">Training Types Offered</p>
                        <div className="flex flex-wrap gap-2">
                          {trainer.trainingTypes && trainer.trainingTypes.length > 0 ? (
                            trainer.trainingTypes.map((type, idx) => (
                              <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                                {type}
                              </span>
                            ))
                          ) : <span className="text-slate-500">None listed</span>}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-slate-500">Price Per Session</p>
                          <p className="font-bold text-slate-800 text-base">₹{trainer.pricePerSession || 0}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Price Per Month</p>
                          <p className="font-bold text-slate-800 text-base">₹{trainer.pricePerMonth || 0}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-500">Trial Session</p>
                        <p className="font-medium text-slate-800">
                          {trainer.trialSession ? `Yes (₹${trainer.trialPrice || 0})` : 'No'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <h4 className="text-lg font-semibold text-slate-800 border-b pb-2 mb-4">Availability</h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-slate-500 mb-1">Available Days</p>
                        <div className="flex flex-wrap gap-1.5">
                          {trainer.availability?.days && trainer.availability.days.length > 0 ? (
                            trainer.availability.days.map((day, idx) => (
                              <span key={idx} className="bg-green-100 text-green-700 px-2.5 py-1 rounded text-xs font-semibold">
                                {day}
                              </span>
                            ))
                          ) : <span className="text-slate-500">Not specified</span>}
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Preferred Time Slots</p>
                        <div className="flex flex-wrap gap-1.5">
                          {trainer.availability?.timeSlots && trainer.availability.timeSlots.length > 0 ? (
                            trainer.availability.timeSlots.map((slot, idx) => (
                              <span key={idx} className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded text-xs font-semibold">
                                {slot}
                              </span>
                            ))
                          ) : <span className="text-slate-500">Not specified</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                     <h4 className="text-lg font-semibold text-slate-800 border-b pb-2 mb-4">Certifications</h4>
                     {trainer.certifications && trainer.certifications.length > 0 ? (
                      <ul className="space-y-3">
                        {trainer.certifications.map((cert, idx) => (
                          <li key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded border border-slate-100">
                            <div>
                              <span className="font-medium">{cert.name}</span>
                              {cert.verified && <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">Verified</span>}
                            </div>
                            {cert.url && <a href={cert.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">View</a>}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500">No certifications uploaded.</p>
                    )}
                  </div>
                </div>

                {/* Reviews Column */}
                <div>
                  <h4 className="text-lg font-semibold text-slate-800 border-b pb-2 mb-4">Recent Reviews</h4>
                  {trainer.reviews && trainer.reviews.length > 0 ? (
                    <div className="space-y-4">
                      {trainer.reviews.map((review, idx) => (
                        <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-slate-800">{review.reviewer}</span>
                            <span className="text-yellow-500 text-sm">{'⭐'.repeat(Math.round(review.rating))}</span>
                          </div>
                          <p className="text-sm text-slate-600 italic">"{review.text}"</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 bg-slate-50 p-6 rounded-xl text-center border border-slate-100">No reviews yet.</p>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainerDetails;
