import React, { useState, useEffect } from 'react';
import { useNearbyGyms } from '../hooks/useNearbyGyms';
import { useGeoLocation } from '../hooks/useGeoLocation';
import GymCard from './GymCard';
import GymMap from './GymMap';

export const NearbyGyms = () => {
  const { coords, loading: locLoading, error: locError, status: locStatus, getCurrentLocation } = useGeoLocation();
  const { gyms, loading: gymsLoading, error: gymsError, fetchNearbyGyms } = useNearbyGyms();
  
  const [radius, setRadius] = useState(15);

  // Trigger gym fetching once coordinates are successfully obtained
  useEffect(() => {
    if (coords.lat && coords.lng) {
      fetchNearbyGyms({ lat: coords.lat, lng: coords.lng, radius });
    }
  }, [coords.lat, coords.lng, fetchNearbyGyms]);

  // Handle radius selection changes
  const handleRadiusChange = (e) => {
    const val = parseFloat(e.target.value);
    setRadius(val);
    if (coords.lat && coords.lng) {
      fetchNearbyGyms({ lat: coords.lat, lng: coords.lng, radius: val });
    }
  };

  // Re-fetch gyms with current values
  const handleRetry = () => {
    if (coords.lat && coords.lng) {
      fetchNearbyGyms({ lat: coords.lat, lng: coords.lng, radius });
    } else {
      getCurrentLocation();
    }
  };

  const hasLocation = !!(coords.lat && coords.lng);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>🔍</span> Find Nearby Gyms
          </h1>
          <p className="text-gray-400 mt-1">Discover fitness centers near your current location</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Radius Selector */}
          <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white">
            <span className="text-xs font-semibold text-gray-400">Radius:</span>
            <select
              value={radius}
              onChange={handleRadiusChange}
              className="bg-transparent border-none text-white focus:outline-none text-sm font-bold cursor-pointer"
            >
              <option className="bg-neutral-950" value={5}>5 km</option>
              <option className="bg-neutral-950" value={10}>10 km</option>
              <option className="bg-neutral-950" value={15}>15 km</option>
              <option className="bg-neutral-950" value={20}>20 km</option>
              <option className="bg-neutral-950" value={25}>25 km</option>
              <option className="bg-neutral-950" value={50}>50 km</option>
            </select>
          </div>

          {/* Find Gyms Button */}
          <button
            onClick={getCurrentLocation}
            disabled={locLoading || gymsLoading}
            className="px-5 py-2.5 bg-[#FF7A00] hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer text-sm"
          >
            {locLoading ? (
              <span>Detecting location...</span>
            ) : gymsLoading ? (
              <span>Fetching gyms...</span>
            ) : (
              <>
                <span>📍</span> Find Gyms Near Me
              </>
            )}
          </button>
        </div>
      </div>

      {/* Geolocation Status Messages */}
      {locError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center justify-between">
          <span>⚠️ {locError}</span>
          <button onClick={getCurrentLocation} className="underline font-bold ml-2">Try Again</button>
        </div>
      )}

      {/* Main Grid: Left List, Right Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Listing */}
        <div className="lg:col-span-5 flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2">
          {!hasLocation && !gymsLoading && !locLoading && (
            <div className="bg-neutral-900 border border-neutral-800 p-8 text-center rounded-2xl flex flex-col items-center justify-center gap-3">
              <span className="text-3xl">📡</span>
              <p className="text-gray-400 text-sm font-semibold">Please share your location to discover gyms around you.</p>
              <button
                onClick={getCurrentLocation}
                className="mt-2 text-xs font-bold text-[#FF7A00] border border-[#FF7A00]/30 hover:border-[#FF7A00] px-4 py-2 rounded-xl transition-all"
              >
                Allow Location Access
              </button>
            </div>
          )}

          {(locLoading || gymsLoading) && (
            // Skeleton loader for 3 cards
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 animate-pulse flex flex-col gap-3">
                  <div className="h-4 bg-neutral-800 rounded w-2/3" />
                  <div className="h-3 bg-neutral-800 rounded w-1/2" />
                  <div className="h-3 bg-neutral-800 rounded w-1/3" />
                  <div className="flex gap-2 mt-2">
                    <div className="h-3.5 bg-neutral-800 rounded-full w-12" />
                    <div className="h-3.5 bg-neutral-800 rounded-full w-16" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {gymsError && !gymsLoading && (
            <div className="bg-neutral-900 border border-neutral-800 p-6 text-center rounded-2xl text-red-400 text-sm">
              <p className="mb-2">⚠️ {gymsError}</p>
              <button onClick={handleRetry} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-lg text-xs transition-all">
                Retry
              </button>
            </div>
          )}

          {hasLocation && !gymsLoading && !gymsError && gyms.length === 0 && (
            <div className="bg-neutral-900 border border-neutral-800 p-8 text-center rounded-2xl">
              <p className="text-gray-400 text-sm">No gyms found within {radius} km radius of your location.</p>
            </div>
          )}

          {hasLocation && !gymsLoading && !gymsError && gyms.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              {gyms.map((gym) => (
                <GymCard key={gym._id || gym.id} gym={gym} />
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Map */}
        <div className="lg:col-span-7 h-[400px] lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
          <GymMap
            gyms={gyms}
            userLocation={hasLocation ? { lat: coords.lat, lng: coords.lng } : null}
          />
        </div>
      </div>
    </div>
  );
};

export default NearbyGyms;
