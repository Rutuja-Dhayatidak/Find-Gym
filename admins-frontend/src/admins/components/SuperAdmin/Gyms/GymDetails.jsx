import React, { useState } from 'react';
import Modal from '../../common/Modal';
import Badge from '../../common/Badge';
import Button from '../../common/Button';
import { MapPin, Phone, Mail, Globe, Users, Clock, Dumbbell } from 'lucide-react';

const GymDetails = ({ isOpen, onClose, gym }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!gym) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gym Details" size="xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-start gap-6">
            <div className="w-24 h-24 rounded-xl bg-orange-100 text-primary flex flex-col items-center justify-center">
               <Dumbbell size={32} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{gym.name}</h2>
                  <p className="text-gray-500 flex items-center gap-1 mb-2"><MapPin size={16} /> {gym.city}, India</p>
                </div>
                <Badge label={gym.status} variant={gym.status === 'Approved' ? 'success' : gym.status === 'Pending' ? 'warning' : 'danger'} />
              </div>
              
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={16} className="text-gray-400" /> +91 9876543210
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={16} className="text-gray-400" /> contact@{gym.name.toLowerCase().replace(/ /g, '')}.com
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Globe size={16} className="text-gray-400" /> www.{gym.name.toLowerCase().replace(/ /g, '')}.com
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
              <p className="text-sm text-gray-500 mb-1">Members</p>
              <p className="text-xl font-bold text-gray-900">{gym.members}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
              <p className="text-sm text-gray-500 mb-1">Classes</p>
              <p className="text-xl font-bold text-gray-900">24</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
              <p className="text-sm text-gray-500 mb-1">Trainers</p>
              <p className="text-xl font-bold text-gray-900">8</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
              <p className="text-sm text-gray-500 mb-1">Revenue/mo</p>
              <p className="text-xl font-bold text-gray-900">{gym.revenue}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 border-b pb-2">Owner Info</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                {gym.owner.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{gym.owner}</p>
                <Badge label="Verified KYC" variant="success" className="mt-1" />
              </div>
            </div>
            <Button variant="secondary" className="w-full text-sm">View Owner Profile</Button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
             <h3 className="font-semibold text-gray-900 mb-4 border-b pb-2">Quick Actions</h3>
             <div className="flex flex-col gap-2">
               {gym.status === 'Pending' ? (
                 <>
                  <Button variant="success">Approve Gym</Button>
                  <Button variant="danger">Reject Gym</Button>
                 </>
               ) : (
                 <Button variant="danger">Suspend Gym</Button>
               )}
               <Button variant="secondary">Edit Details</Button>
             </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {['overview', 'analytics', 'classes', 'staff'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="min-h-[200px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2"><Clock size={16}/> Operating Hours</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex justify-between"><span>Mon - Fri:</span> <span>05:00 AM - 11:00 PM</span></li>
                <li className="flex justify-between"><span>Saturday:</span> <span>06:00 AM - 10:00 PM</span></li>
                <li className="flex justify-between"><span>Sunday:</span> <span>06:00 AM - 02:00 PM</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {['AC', 'Locker Room', 'Steam Bath', 'Cardio Zone', 'Free Weights', 'Cafeteria'].map(amenity => (
                  <span key={amenity} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{amenity}</span>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeTab !== 'overview' && (
          <div className="flex items-center justify-center h-48 text-gray-400">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Data Placeholder
          </div>
        )}
      </div>
    </Modal>
  );
};

export default GymDetails;
