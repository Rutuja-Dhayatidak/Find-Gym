import React from 'react';
import Modal from '../../common/Modal';
import Badge from '../../common/Badge';
import Button from '../../common/Button';

const UserDetails = ({ isOpen, onClose, user }) => {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Profile" size="lg">
      <div className="flex items-center gap-6 mb-8 pb-6 border-b border-gray-100">
        <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center font-bold text-4xl">
          {user.name.charAt(0)}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h2>
          <p className="text-gray-600 mb-2">{user.email} • {user.phone}</p>
          <Badge 
            label={user.status} 
            variant={user.status === 'Active' ? 'success' : user.status === 'Blocked' ? 'danger' : 'warning'} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Personal Info</h3>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-gray-500">Age:</span> <span className="font-medium">28</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Gender:</span> <span className="font-medium">Male</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Height:</span> <span className="font-medium">175 cm</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Weight:</span> <span className="font-medium">75 kg</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Fitness Goal:</span> <span className="font-medium">Build Muscle</span></div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Account Info</h3>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-gray-500">User ID:</span> <span className="font-mono text-sm">{user.id}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Email Verified:</span> <Badge label="Yes" variant="success" /></div>
            <div className="flex justify-between"><span className="text-gray-500">Phone Verified:</span> <Badge label="Yes" variant="success" /></div>
            <div className="flex justify-between"><span className="text-gray-500">Account Created:</span> <span className="font-medium">{user.joined}</span></div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-100 justify-end">
        <Button variant="secondary" onClick={onClose}>Close</Button>
        <Button variant="primary">View Full Activity</Button>
      </div>
    </Modal>
  );
};

export default UserDetails;
