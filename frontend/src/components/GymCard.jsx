import React from 'react';

export const GymCard = ({ gym }) => {
  if (!gym) return null;

  const addressText = gym.location?.address || gym.address?.fullAddress || '';
  const isVerified = gym.verified || gym.isVerified;
  
  // Format opening timings from hours object or timings object
  let timingsText = '';
  if (gym.timings && gym.timings.open) {
    timingsText = `${gym.timings.open} - ${gym.timings.close}`;
  } else if (gym.hours && gym.hours.monday) {
    const mon = gym.hours.monday;
    timingsText = mon.closed ? 'Closed Today' : `${mon.open} - ${mon.close}`;
  }

  return (
    <div className="bg-white border border-gray-150 rounded-2xl p-5 hover:shadow-lg transition-all flex flex-col gap-3">
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-bold text-[16px] text-gray-950 hover:text-[#FF7A00] transition-colors leading-snug">
          {gym.name}
        </h3>
        {isVerified && (
          <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center shrink-0">
            ✓ Verified
          </span>
        )}
      </div>

      <div className="space-y-1.5 text-xs text-gray-650">
        {addressText && (
          <p className="flex items-start gap-1">
            <span>📍</span>
            <span>{addressText}</span>
          </p>
        )}
        {gym.phone && (
          <p className="flex items-center gap-1">
            <span>📞</span>
            <span>{gym.phone}</span>
          </p>
        )}
        {timingsText && (
          <p className="flex items-center gap-1">
            <span>🕒</span>
            <span>{timingsText}</span>
          </p>
        )}
        {gym.monthlyFee !== undefined && (
          <p className="flex items-center gap-1 font-bold text-gray-900">
            <span>💰</span>
            <span>₹{gym.monthlyFee}/month</span>
          </p>
        )}
        {gym.distanceKm !== undefined && (
          <p className="flex items-center gap-1 font-semibold text-[#FF7A00] mt-1 text-[11px]">
            <span>📍</span>
            <span>{gym.distanceKm} km away</span>
          </p>
        )}
      </div>

      {gym.amenities && gym.amenities.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {gym.amenities.map((amenity, idx) => (
            <span key={idx} className="px-2 py-0.5 bg-gray-100 rounded text-[9px] text-gray-600 font-semibold">
              {amenity}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default GymCard;
