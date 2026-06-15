import React, { useState } from 'react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import FormInput from '../../common/FormInput';

const CreateAdmin = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    adminType: '',
    status: 'Active',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const adminTypeOptions = [
    { value: 'Platform Admin', label: 'Platform Admin - Full access to entire platform' },
    { value: 'City Admin', label: 'City Admin - Access to specific city/cities' },
    { value: 'Gym Manager', label: 'Gym Manager - Access to specific gym(s)' }
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim() || formData.fullName.length < 2) {
      newErrors.fullName = 'Full Name is required and must be at least 2 characters';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }
    if (!formData.adminType) {
      newErrors.adminType = 'Please select an Admin Type';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/admins/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}` // TODO: Add your auth token here
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        alert(`✅ Admin Created Successfully!\nSetup email has been sent to: ${formData.email}\nThe admin must click the link to set their password.\nLink expires in 24 hours.`);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          adminType: '',
          status: 'Active',
        });
        if (onSuccess) onSuccess();
        onClose();
      } else {
        alert(data.message || 'Failed to create admin');
        if (data.message && data.message.toLowerCase().includes('email')) {
          setErrors(prev => ({ ...prev, email: 'Email already exists' }));
        }
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      alert('Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Admin" size="lg">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FormInput 
              label="Full Name" 
              placeholder="Enter full name" 
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              error={errors.fullName}
              className={errors.fullName ? 'border-red-500' : ''}
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
          </div>
          <div>
            <FormInput 
              label="Email" 
              type="email" 
              placeholder="Enter email address" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value.toLowerCase()})}
              error={errors.email}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <FormInput 
              label="Phone" 
              type="tel" 
              placeholder="10 digit phone number" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
              error={errors.phone}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-1">Admin Type</label>
            <select 
              value={formData.adminType}
              onChange={(e) => setFormData({...formData, adminType: e.target.value})}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.adminType ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select Admin Type</option>
              {adminTypeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.adminType && <p className="text-red-500 text-xs mt-1">{errors.adminType}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="status" 
                  value="Active"
                  checked={formData.status === 'Active'}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="text-primary focus:ring-primary"
                />
                Active
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="status" 
                  value="Inactive"
                  checked={formData.status === 'Inactive'}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="text-primary focus:ring-primary"
                />
                Inactive
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <strong>Note:</strong> When you create an admin, they will receive an email with a secure link to set their own password. The link will expire in 24 hours.
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100 justify-end">
          <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600">
            {loading ? 'Creating...' : 'Create Admin'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateAdmin;
