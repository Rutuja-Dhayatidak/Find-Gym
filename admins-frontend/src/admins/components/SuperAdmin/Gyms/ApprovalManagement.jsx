import React, { useState } from 'react';
import Button from '../../common/Button';
import Badge from '../../common/Badge';
import ConfirmationModal from '../../common/ConfirmationModal';
import { Dumbbell, MapPin, CheckCircle, XCircle } from 'lucide-react';

const ApprovalManagement = () => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [gymToReject, setGymToReject] = useState(null);

  const pendingGyms = [
    { id: 'GYM-005', name: 'Fitness First', city: 'Mumbai', owner: 'Sameer Khan', date: '2024-03-22' },
    { id: 'GYM-006', name: 'Spartan Gym', city: 'Pune', owner: 'Karan Patel', date: '2024-03-24' },
  ];

  const handleApprove = (gym) => {
    // Approve logic
    alert(`Approved ${gym.name}`);
  };

  const handleRejectClick = (gym) => {
    setGymToReject(gym);
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    setShowRejectModal(false);
    // Reject logic
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
        <p className="text-sm text-gray-500">Review and approve new gym partner requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {pendingGyms.map(gym => (
          <div key={gym.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-lg bg-orange-100 text-primary flex items-center justify-center">
                  <Dumbbell size={24} />
                </div>
                <Badge label="Pending Review" variant="warning" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-1">{gym.name}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1 mb-4"><MapPin size={14} /> {gym.city}</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Owner:</span>
                  <span className="font-medium text-gray-900">{gym.owner}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Applied on:</span>
                  <span className="font-medium text-gray-900">{gym.date}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button variant="danger" className="w-full flex justify-center items-center gap-2" onClick={() => handleRejectClick(gym)}>
                  <XCircle size={16} /> Reject
                </Button>
                <Button variant="success" className="w-full flex justify-center items-center gap-2" onClick={() => handleApprove(gym)}>
                  <CheckCircle size={16} /> Approve
                </Button>
              </div>
              <div className="mt-4 text-center">
                <a href="#" className="text-sm text-primary hover:underline font-medium">View Full Details</a>
              </div>
            </div>
          </div>
        ))}
        {pendingGyms.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
            No pending gym approvals.
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={confirmReject}
        title="Reject Gym Application"
        message={`Are you sure you want to reject the application for ${gymToReject?.name}?`}
        dangerMode={true}
      />
    </div>
  );
};

export default ApprovalManagement;
