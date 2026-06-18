import { useState, useCallback, useEffect } from 'react';

// Custom hook to detect and manage geolocation access
export const useGeoLocation = () => {
  const [coords, setCoords] = useState(() => {
    const cachedLat = localStorage.getItem('user_latitude');
    const cachedLng = localStorage.getItem('user_longitude');
    return {
      lat: cachedLat ? parseFloat(cachedLat) : null,
      lng: cachedLng ? parseFloat(cachedLng) : null
    };
  });
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(() => {
    const cachedLat = localStorage.getItem('user_latitude');
    return cachedLat ? 'success' : 'idle';
  }); // 'idle' | 'loading' | 'success' | 'error'

  const getCurrentLocation = useCallback(() => {
    setStatus('loading');
    setError(null);

    // Geolocation HTTPS requirement check (rule 10)
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isHttp = window.location.protocol === 'http:';
    if (isHttp && !isLocalhost) {
      const msg = 'Location requires HTTPS. Please use a secure connection.';
      setError(msg);
      setStatus('error');
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Extract latitude and longitude from Geolocation API position (rule 3)
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        localStorage.setItem('user_latitude', lat.toString());
        localStorage.setItem('user_longitude', lng.toString());
        setCoords({ lat, lng });
        setStatus('success');
        window.dispatchEvent(new Event('location-updated'));
      },
      (err) => {
        // Map standard Geolocation API error codes (rule 4)
        let mappedMessage = 'Unable to detect location.';
        if (err.code === 1) {
          mappedMessage = 'Location permission denied. Please allow location access.';
        } else if (err.code === 2) {
          mappedMessage = 'Location unavailable. Check GPS settings.';
        } else if (err.code === 3) {
          mappedMessage = 'Location request timed out. Try again.';
        }
        setError(mappedMessage);
        setStatus('error');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // Listen for custom 'location-updated' event to update coords state automatically
  useEffect(() => {
    const handleLocationUpdate = () => {
      const cachedLat = localStorage.getItem('user_latitude');
      const cachedLng = localStorage.getItem('user_longitude');
      if (cachedLat && cachedLng) {
        setCoords({ lat: parseFloat(cachedLat), lng: parseFloat(cachedLng) });
        setStatus('success');
      }
    };

    window.addEventListener('location-updated', handleLocationUpdate);
    return () => {
      window.removeEventListener('location-updated', handleLocationUpdate);
    };
  }, []);

  return {
    coords,
    loading: status === 'loading',
    error,
    status,
    getCurrentLocation,
  };
};
