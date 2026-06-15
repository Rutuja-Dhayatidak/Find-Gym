import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar';
import ErrorAlert from '../components/ErrorAlert';
import api from '../utils/api';
import { Dumbbell, MapPin, Clock, ShieldCheck, ChevronRight } from 'lucide-react';

const AddGymForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    
    address: '',
    city: '',
    state: '',
    zipCode: '',
    
    capacity: 20,
    amenities: [],
    hours: {
      monday: { open: '06:00', close: '22:00', closed: false },
      tuesday: { open: '06:00', close: '22:00', closed: false },
      wednesday: { open: '06:00', close: '22:00', closed: false },
      thursday: { open: '06:00', close: '22:00', closed: false },
      friday: { open: '06:00', close: '22:00', closed: false },
      saturday: { open: '06:00', close: '20:00', closed: false },
      sunday: { open: '08:00', close: '16:00', closed: true }
    }
  });

  const amenityOptions = [
    'WiFi', 'Locker Rooms', 'Steam Room', 'Sauna', 'Swimming Pool', 
    'Parking', 'Shower Facilities', 'AC', 'Cardio Equipment', 
    'Weight Training', 'Yoga Studio', 'Crossfit Area'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => {
      const current = prev.amenities;
      const updated = current.includes(amenity)
        ? current.filter(a => a !== amenity)
        : [...current, amenity];
      return {
        ...prev,
        amenities: updated
      };
    });
  };

  const handleHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: {
          ...prev.hours[day],
          [field]: value
        }
      }
    }));
  };

  const validateStep = () => {
    setError('');
    if (step === 1) {
      if (!formData.name || formData.name.trim().length < 3) {
        setError("Gym name must be at least 3 characters");
        return false;
      }
      if (!formData.description || formData.description.trim().length < 20) {
        setError("Description too short (minimum 20 characters)");
        return false;
      }
      if (!formData.phone || formData.phone.replace(/\D/g, '').length !== 10) {
        setError("Invalid phone number (must be 10 digits)");
        return false;
      }
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError("Invalid email format");
        return false;
      }
    } else if (step === 2) {
      if (!formData.address || formData.address.trim().length < 5) {
        setError("Address must be at least 5 characters");
        return false;
      }
      if (!formData.city.trim()) {
        setError("City is required");
        return false;
      }
      if (!formData.state.trim()) {
        setError("State is required");
        return false;
      }
      if (!formData.zipCode || formData.zipCode.replace(/\D/g, '').length !== 6) {
        setError("ZIP Code must be exactly 6 digits");
        return false;
      }
    } else if (step === 3) {
      if (formData.capacity < 20) {
        setError("Gym capacity must be at least 20");
        return false;
      }
      if (formData.amenities.length === 0) {
        setError("Please select at least one amenity");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);
    setError('');

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        phone: formData.phone,
        email: formData.email,
        location: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        },
        capacity: Number(formData.capacity),
        amenities: formData.amenities,
        hours: formData.hours
      };

      const response = await api.post('/gyms', payload);

      if (response.data.success) {
        alert("Gym added successfully! Awaiting verification.");
        navigate('/gym-owner/dashboard');
      } else {
        setError(response.data.message || "Failed to add gym");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Operation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-6">
          <Dumbbell className="w-12 h-12 text-orange-500 mx-auto mb-2" />
          <h2 className="text-3xl font-extrabold tracking-tight">Add Your Gym</h2>
          <p className="text-sm text-zinc-400 mt-1">Provide details of your fitness center</p>
        </div>

        <ProgressBar currentStep={step} totalSteps={3} />
        <ErrorAlert message={error} />

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-lg font-medium text-orange-500 border-b border-zinc-800 pb-2">Gym Information</h3>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Gym Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Iron Gym & Fitness"
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Gym Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your gym, programs, equipment (min 20 characters)"
                  rows={4}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Gym Contact Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit number"
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Gym Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="gym@example.com"
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-lg font-medium text-orange-500 border-b border-zinc-800 pb-2">Gym Location</h3>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Full Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleLocationChange}
                  placeholder="Shop number, street, building"
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleLocationChange}
                    placeholder="e.g. Pune"
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleLocationChange}
                    placeholder="e.g. Maharashtra"
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">ZIP Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleLocationChange}
                    placeholder="6-digit ZIP"
                    maxLength={6}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h3 className="text-lg font-medium text-orange-500 border-b border-zinc-800 pb-2 mb-4">Hours & Operating Capacity</h3>
                <div className="w-1/2">
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Gym Member Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min={20}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Operating Hours</label>
                <div className="space-y-3 max-h-60 overflow-y-auto bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                  {days.map(day => (
                    <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-3 gap-2">
                      <span className="text-sm font-semibold capitalize text-zinc-300 w-24">{day}</span>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.hours[day].closed}
                            onChange={(e) => handleHoursChange(day, 'closed', e.target.checked)}
                            className="rounded border-zinc-850 text-orange-500 focus:ring-orange-500 w-4 h-4"
                          />
                          Closed
                        </label>
                        {!formData.hours[day].closed && (
                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              value={formData.hours[day].open}
                              onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                              className="bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                            />
                            <span className="text-zinc-500 text-xs">to</span>
                            <input
                              type="time"
                              value={formData.hours[day].close}
                              onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                              className="bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Amenities Offered</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {amenityOptions.map(amenity => (
                    <label 
                      key={amenity} 
                      className={`flex items-center px-4 py-3 rounded-xl border cursor-pointer transition text-sm select-none ${
                        formData.amenities.includes(amenity)
                          ? 'bg-orange-500/10 border-orange-500 text-orange-400'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => handleAmenityToggle(amenity)}
                        className="hidden"
                      />
                      {amenity}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4 border-t border-zinc-800">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="w-1/2 py-3 bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 rounded-xl font-semibold transition"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className={`py-3 bg-orange-500 hover:bg-orange-600 rounded-xl font-semibold transition ${step === 1 ? 'w-full' : 'w-1/2'}`}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 py-3 bg-orange-500 hover:bg-orange-600 rounded-xl font-semibold transition disabled:opacity-50"
              >
                {loading ? 'Adding Gym...' : 'Save & Submit'}
              </button>
            )}
          </div>
        </form>

        <p className="text-center text-sm text-zinc-400 mt-6">
          <Link to="/gym-owner/dashboard" className="text-zinc-500 hover:text-zinc-300 hover:underline">
            Cancel and return to Dashboard
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AddGymForm;
