import React from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { registerGym } from '../userServices/gymApi';
import LocationButton from './LocationButton';

export const GymRegistrationForm = () => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      amenities: [],
    },
  });

  // Handle form submission to backend
  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        ownerName: data.ownerName,
        phone: data.phone,
        email: data.email,
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          fullAddress: data.fullAddress,
        },
        location: {
          type: 'Point',
          coordinates: [parseFloat(data.lng), parseFloat(data.lat)], // [longitude, latitude] (GeoJSON)
        },
        amenities: data.amenities || [],
        timings: { open: data.openTime, close: data.closeTime },
        monthlyFee: parseFloat(data.monthlyFee) || 0,
      };

      await registerGym(payload);
      toast.success('🎉 Gym registered successfully!');
      reset(); // clears all fields including lat/lng
    } catch (err) {
      toast.error(err.message || 'Registration failed. Try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span>🏋️</span> Register Your Gym
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Gym Name & Owner Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-750 uppercase tracking-wider mb-1.5">Gym Name *</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] outline-none text-gray-900 transition-all text-sm"
              placeholder="e.g. FitClub Gym"
              {...register('name', {
                required: 'Gym Name is required',
                minLength: { value: 3, message: 'Min 3 characters' },
              })}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-750 uppercase tracking-wider mb-1.5">Owner Name *</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] outline-none text-gray-900 transition-all text-sm"
              placeholder="e.g. John Doe"
              {...register('ownerName', { required: 'Owner Name is required' })}
            />
            {errors.ownerName && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.ownerName.message}</p>}
          </div>
        </div>

        {/* Phone & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-750 uppercase tracking-wider mb-1.5">Phone *</label>
            <input
              type="tel"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] outline-none text-gray-900 transition-all text-sm"
              placeholder="10-digit mobile number"
              {...register('phone', {
                required: 'Phone is required',
                pattern: { value: /^[6-9]\d{9}$/, message: 'Enter valid 10-digit Indian mobile number' },
              })}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-750 uppercase tracking-wider mb-1.5">Email *</label>
            <input
              type="email"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] outline-none text-gray-900 transition-all text-sm"
              placeholder="e.g. owner@gym.com"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Enter valid email' },
              })}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.email.message}</p>}
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-200 space-y-4">
          <h3 className="font-bold text-sm text-gray-800 border-b border-gray-200 pb-2">📍 Address Details</h3>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Street Address</label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:border-[#FF7A00] outline-none text-sm text-gray-900"
              placeholder="Street or building info"
              {...register('street')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">City</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:border-[#FF7A00] outline-none text-sm text-gray-900"
                placeholder="City"
                {...register('city')}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">State</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:border-[#FF7A00] outline-none text-sm text-gray-900"
                placeholder="State"
                {...register('state')}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Pincode</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:border-[#FF7A00] outline-none text-sm text-gray-900"
                placeholder="Pincode"
                {...register('pincode')}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Full Address *</label>
            <textarea
              rows={2}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:border-[#FF7A00] outline-none text-sm text-gray-900 resize-none"
              placeholder="Complete printable address"
              {...register('fullAddress', { required: 'Full address is required' })}
            />
            {errors.fullAddress && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.fullAddress.message}</p>}
          </div>
        </div>

        {/* Location Coordinates & Location Button */}
        <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-200 space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-2 border-b border-gray-200 pb-2">
            <h3 className="font-bold text-sm text-gray-800">🧭 Map Location</h3>
            <LocationButton
              onLocationDetected={({ lat, lng }) => {
                setValue('lat', lat, { shouldValidate: true });
                setValue('lng', lng, { shouldValidate: true });
              }}
              buttonClassName="px-3 py-1.5 bg-[#FF7A00] text-white rounded-lg text-xs font-bold hover:bg-orange-600 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Latitude *</label>
              <input
                type="number"
                step="any"
                readOnly
                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-xl outline-none text-sm text-gray-500 cursor-not-allowed"
                placeholder="Auto-filled via button"
                {...register('lat', {
                  required: 'Latitude is required',
                  min: { value: -90, message: 'Must be between -90 and 90' },
                  max: { value: 90, message: 'Must be between -90 and 90' },
                })}
              />
              {errors.lat && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.lat.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Longitude *</label>
              <input
                type="number"
                step="any"
                readOnly
                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-xl outline-none text-sm text-gray-500 cursor-not-allowed"
                placeholder="Auto-filled via button"
                {...register('lng', {
                  required: 'Longitude is required',
                  min: { value: -180, message: 'Must be between -180 and 180' },
                  max: { value: 180, message: 'Must be between -180 and 180' },
                })}
              />
              {errors.lng && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.lng.message}</p>}
            </div>
          </div>
        </div>

        {/* Timings & Fee */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-750 uppercase tracking-wider mb-1.5">Open Time</label>
            <input
              type="text"
              placeholder="e.g. 06:00 AM"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:border-[#FF7A00] outline-none text-sm text-gray-900"
              {...register('openTime')}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-750 uppercase tracking-wider mb-1.5">Close Time</label>
            <input
              type="text"
              placeholder="e.g. 10:00 PM"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:border-[#FF7A00] outline-none text-sm text-gray-900"
              {...register('closeTime')}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-750 uppercase tracking-wider mb-1.5">Monthly Fee (₹)</label>
            <input
              type="number"
              placeholder="e.g. 1500"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:border-[#FF7A00] outline-none text-sm text-gray-900"
              {...register('monthlyFee')}
            />
          </div>
        </div>

        {/* Amenities Checkboxes */}
        <div>
          <label className="block text-xs font-bold text-gray-750 uppercase tracking-wider mb-2">Amenities</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
            {['AC', 'Parking', 'Locker', 'Sauna', 'Pool', 'Cardio', 'Zumba', 'Shower'].map((amenity) => (
              <label key={amenity} className="flex items-center gap-2 text-sm text-gray-750 cursor-pointer select-none">
                <input
                  type="checkbox"
                  value={amenity}
                  className="w-4 h-4 accent-[#FF7A00]"
                  {...register('amenities')}
                />
                {amenity}
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-[#FF7A00] text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSubmitting ? 'Saving...' : 'Register Gym'}
        </button>
      </form>
    </div>
  );
};

export default GymRegistrationForm;
