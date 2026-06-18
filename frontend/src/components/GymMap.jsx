import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon bug
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Create a custom icon for the user's current location
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to dynamically re-center map when location/gyms update
const MapRecenter = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

export const GymMap = ({ gyms, userLocation }) => {
  // Determine center: userLocation if available, otherwise fallback to India center coordinates (lat, lng)
  const defaultCenter = userLocation ? [userLocation.lat, userLocation.lng] : [20.5937, 78.9629];
  const defaultZoom = userLocation ? 12 : 5;

  return (
    <div className="w-full h-full min-h-[350px] relative rounded-2xl overflow-hidden border border-gray-200">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom={true}
        className="w-full h-full absolute inset-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Recenter helper */}
        <MapRecenter center={defaultCenter} zoom={defaultZoom} />

        {/* User Location Marker */}
        {userLocation && userLocation.lat && userLocation.lng && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="font-semibold text-xs">📍 You are here</div>
            </Popup>
          </Marker>
        )}

        {/* Gym Markers */}
        {gyms && gyms.map((gym) => {
          // Fallback to locationPoint coordinates first, then location.latitude/longitude
          const lat = gym.locationPoint?.coordinates?.[1] || gym.location?.latitude;
          const lng = gym.locationPoint?.coordinates?.[0] || gym.location?.longitude;
          if (!lat || !lng) return null;

          const addressText = gym.location?.address || gym.address?.fullAddress || '';

          return (
            <Marker key={gym._id || gym.id} position={[lat, lng]}>
              <Popup>
                <div className="p-1 max-w-[200px] text-gray-900 font-sans">
                  <h4 className="font-bold text-sm text-[#FF7A00] m-0 mb-1">{gym.name}</h4>
                  {addressText && (
                    <p className="text-[11px] text-gray-650 m-0 mb-1">📍 {addressText}</p>
                  )}
                  {gym.distanceKm !== undefined && (
                    <p className="text-[11px] font-bold text-gray-800 m-0">
                      🚀 {gym.distanceKm} km away
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default GymMap;
