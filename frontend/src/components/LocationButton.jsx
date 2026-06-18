import React, { useEffect } from 'react';
import { useGeoLocation } from '../hooks/useGeoLocation';
import toast from 'react-hot-toast';

export const LocationButton = ({ onLocationDetected, buttonClassName }) => {
  const { coords, loading, error, status, getCurrentLocation } = useGeoLocation();

  const [lastStatus, setLastStatus] = React.useState('idle');

  // Trigger callbacks and toast notifications depending on status of location retrieval
  useEffect(() => {
    if (status === lastStatus) return; // prevent loop when parent component re-renders

    if (status === 'success') {
      onLocationDetected({ lat: coords.lat, lng: coords.lng });
      toast.success('📍 Location detected successfully!');
      setLastStatus('success');
    } else if (status === 'error') {
      toast.error(error || 'Failed to detect location.');
      setLastStatus('error');
    } else if (status === 'loading') {
      setLastStatus('loading');
    }
  }, [status, coords, error, onLocationDetected, lastStatus]);

  // Determine button inner text based on status
  const getButtonText = () => {
    if (loading) return 'Detecting location...';
    if (status === 'success') return 'Location Set ✓';
    if (status === 'error') return 'Try Again';
    return 'Use Current Location'; // default/idle text
  };

  return (
    <button
      type="button"
      onClick={getCurrentLocation}
      disabled={loading}
      aria-label="Detect current location"
      className={buttonClassName || 'px-4 py-2.5 bg-[#FF7A00] text-white rounded-xl font-bold hover:bg-orange-600 transition-all disabled:opacity-50'}
    >
      {getButtonText()}
    </button>
  );
};

export default LocationButton;
