import React, { useState } from 'react';
import axios from 'axios';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import FormInput from '../../common/FormInput';
import AssignCities from './AssignCities';

const CreateCityAdmin = ({ isOpen, onClose }) => {
  const [showAssignCities, setShowAssignCities] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    status: 'Active',
    assignedCities: [],
    permissions: []
  });

  const permissionOptions = [
    'View Dashboard', 'Manage Users', 'Manage Gyms', 'Manage Trainers', 'View Reports'
  ];

  const handlePermissionToggle = (perm) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm]
    }));
  };

  const handleCitySelection = (cities) => {
    setFormData(prev => ({ ...prev, assignedCities: cities }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
      const token = localStorage.getItem('superAdminToken');
      await axios.post(
        `${baseUrl}/api/admins/create`,
        {
          fullName: formData.name,
          email: formData.email,
          phone: formData.phone,
          adminType: 'city_admin',
          status: formData.status,
          assignedCities: formData.assignedCities,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('City Admin created successfully! Setup email has been sent.');
      onClose();
      if (window.location.reload) window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create City Admin');
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Create City Admin" size="lg">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput 
              label="Full Name" 
              placeholder="Enter full name" 
              required 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            <FormInput 
              label="Email" 
              type="email" 
              placeholder="Enter email address" 
              required 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <FormInput 
              label="Phone" 
              type="tel" 
              placeholder="+91" 
              required 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
            
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-1">Assign Cities</label>
              <div className="flex gap-2 items-center">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setShowAssignCities(true)}
                  className="w-full justify-between"
                >
                  {formData.assignedCities.length > 0 
                    ? `${formData.assignedCities.length} cities selected` 
                    : 'Select Cities'}
                </Button>
              </div>
            </div>

            <FormInput 
              label="Password" 
              type="password" 
              required 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            <FormInput 
              label="Confirm Password" 
              type="password" 
              required 
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            />
          </div>

          <div className="mt-6 border-t border-gray-100 pt-6">
            <h4 className="text-sm font-bold text-gray-700 mb-4">City Admin Permissions</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {permissionOptions.map(perm => (
                <label key={perm} className="flex items-center gap-2 text-sm text-gray-700">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                    checked={formData.permissions.includes(perm)}
                    onChange={() => handlePermissionToggle(perm)}
                  />
                  {perm}
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100 justify-end">
            <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit">Create City Admin</Button>
          </div>
        </form>
      </Modal>

      {showAssignCities && (
        <AssignCities 
          isOpen={showAssignCities} 
          onClose={() => setShowAssignCities(false)} 
          selectedCities={formData.assignedCities}
          onSave={handleCitySelection}
        />
      )}
    </>
  );
};

export default CreateCityAdmin;
