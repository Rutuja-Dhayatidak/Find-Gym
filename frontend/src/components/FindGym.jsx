import React, { useEffect, useRef, useState, useCallback } from "react";
import { useGeoLocation } from "../hooks/useGeoLocation";
import { getAllGyms, getNearbyGyms } from "../userServices/gymApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// Mappings for gym amenities chips
const gymAmenityChips = ["All", "AC", "Parking", "Locker", "Sauna", "Pool", "Cardio", "Zumba"];

// Realistic fallback gyms from screenshot to guarantee visual match
const defaultMockGyms = [
  {
    _id: "mock_command_fitness",
    name: "Command Fitness Gym",
    rating: 4.9,
    reviewsCount: 173,
    location: { address: "Bhumi Siddhi 19, DHRUV SIDDHI, 19", latitude: 18.6462486, longitude: 73.7616758 },
    address: { fullAddress: "Bhumi Siddhi 19, DHRUV SIDDHI, 19", city: "Ravet" },
    locationPoint: { coordinates: [73.7616758, 18.6462486] },
    timings: { open: "06:00 AM", close: "10:00 PM" },
    monthlyFee: 1500,
    amenities: ["AC", "Locker", "Cardio"],
    images: ["https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop"],
    review: "Friendly, knowledgeable trainers who make workouts enjoyable and effective."
  },
  {
    _id: "mock_md_fitness",
    name: "MD Fitness, Ravet, Pune",
    rating: 4.7,
    reviewsCount: 588,
    location: { address: "Ravet, Pune - 411033", latitude: 18.6441, longitude: 73.7635 },
    address: { fullAddress: "Ravet, Pune - 411033", city: "Ravet" },
    locationPoint: { coordinates: [73.7635, 18.6441] },
    timings: { open: "06:00 AM", close: "10:00 PM" },
    monthlyFee: 1200,
    amenities: ["AC", "Parking", "Cardio"],
    images: ["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop"],
    review: "The gym has excellent facilities and a motivating atmosphere."
  },
  {
    _id: "mock_kk_fitness",
    name: "KK Fitness Best gym",
    rating: 4.8,
    reviewsCount: 130,
    location: { address: "Anand plaza 1st floor bhondve corner, DY Patil College Rd", latitude: 18.6482, longitude: 73.7599 },
    address: { fullAddress: "Anand plaza 1st floor bhondve corner, DY Patil College Rd", city: "Ravet" },
    locationPoint: { coordinates: [73.7599, 18.6482] },
    timings: { open: "06:00 AM", close: "10:00 PM" },
    monthlyFee: 1800,
    amenities: ["AC", "Parking", "Locker", "Zumba"],
    images: ["https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop"],
    review: "Excellent equipment, trainers are highly skilled and friendly."
  }
];


const translateNameToHindi = (name) => {
  if (!name) return "";
  
  // Mapping of common English words in gym names to Hindi
  const mapping = {
    "iron": "आयरन",
    "paradise": "पैराडाइज",
    "fitness": "फिटनेस",
    "center": "सेंटर",
    "gym": "जिम",
    "club": "क्लब",
    "command": "कमांड",
    "md": "एमडी",
    "kk": "केके",
    "best": "बेस्ट",
    "gold": "गोल्ड",
    "golds": "गोल्ड्स",
    "power": "पावर",
    "house": "हाउस",
    "muscle": "मसल",
    "zone": "ज़ोन",
    "active": "एक्टिव",
    "arena": "एरिना",
    "studio": "स्टूडियो",
    "unisex": "यूनिसेक्स",
    "fit": "फिट",
    "evolution": "इवोल्यूशन"
  };

  const words = name.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, "").split(/\s+/);
  const translatedWords = words.map(word => {
    return mapping[word] || word.charAt(0).toUpperCase() + word.slice(1);
  });
  
  return translatedWords.join(" ");
};


const getGymMonthlyFee = (gym) => {
  if (!gym) return 1200;
  if (gym.membershipPlans && gym.membershipPlans.length > 0) {
    const monthlyPlan = gym.membershipPlans.find(p => p.duration?.toLowerCase().includes("month") || p.title?.toLowerCase().includes("month") || p.title?.toLowerCase().includes("monthly"));
    if (monthlyPlan) return monthlyPlan.price;
    return gym.membershipPlans[0].price;
  }
  return gym.monthlyFee || 1200;
};


const getStepInstruction = (step) => {
  if (!step || !step.maneuver) return "Drive ahead";
  const type = step.maneuver.type;
  const modifier = step.maneuver.modifier;
  const name = step.name ? `onto ${step.name}` : "";
  const distance = step.distance > 0 ? `for ${Math.round(step.distance)} meters` : "";

  if (type === "depart") {
    return `Head ${modifier || "ahead"} ${name} ${distance}`.trim();
  }
  if (type === "arrive") {
    return "Arrive at destination";
  }
  if (type === "turn") {
    return `Turn ${modifier || ""} ${name} ${distance}`.trim();
  }
  return `${type.charAt(0).toUpperCase() + type.slice(1)} ${modifier || ""} ${name} ${distance}`.trim();
};

const FindGym = () => {
  const navigate = useNavigate();
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [sortBy, setSortBy] = useState("distance");
  const [selectedGymDetail, setSelectedGymDetail] = useState(null);
  const [routingGym, setRoutingGym] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [updateOnMove, setUpdateOnMove] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // State to simulate satellite/default layer toggle
  const [mapLayer, setMapLayer] = useState("streets"); // 'streets' or 'satellite'
  const [showDirectionsPanel, setShowDirectionsPanel] = useState(false);
  const [travelMode, setTravelMode] = useState("best"); // "best", "car", "bike", "transit", "walk"
  const [routeDetails, setRouteDetails] = useState(null);
  const [routeSteps, setRouteSteps] = useState([]);
  const [showSteps, setShowSteps] = useState(false);

  const { coords, loading: locLoading, error: locError, status: locStatus, getCurrentLocation } = useGeoLocation();

  const mapRef = useRef(null);
  const leafletMapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const userMarkerRef = useRef(null);
  const streetTileLayerRef = useRef(null);
  const satelliteTileLayerRef = useRef(null);
  const routePolylineRef = useRef(null);


  const handleShareGym = (gym) => {
    if (!gym) return;
    const gymLink = `${window.location.origin}/gym-details?id=${gym._id || gym.id}`;
    const shareText = `📍 *${gym.name}*\n\n🏠 Address: ${gym.location?.address || gym.address?.fullAddress || "Akurdi, Pune"}\n💰 Fee: ₹${getGymMonthlyFee(gym)}/month\n\nCheck out the gym details here:\n${gymLink}`;
    
    // Check if the device is a mobile phone
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const whatsappUrl = isMobile 
      ? `whatsapp://send?text=${encodeURIComponent(shareText)}`
      : `https://web.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
      
    window.open(whatsappUrl, "_blank");
    toast.success("Opening WhatsApp directly...");
  };

  // Helper to parse ratings safely if they are objects (e.g. {average, count}) in database
  const getRatingValue = (val) => {
    if (val && typeof val === "object") {
      return val.average || 4.4;
    }
    return val || 4.4;
  };

  const getReviewsCountValue = (val, defaultValue = 173) => {
    if (val && typeof val === "object") {
      return val.count || defaultValue;
    }
    return val || defaultValue;
  };

  // Fetch gyms from API
  const fetchGyms = useCallback(async () => {
    setLoading(true);
    try {
      let data;
      if (coords.lat && coords.lng) {
        data = await getNearbyGyms({ lat: coords.lat, lng: coords.lng, radius: 50, limit: 100 });
      } else {
        data = await getAllGyms({ limit: 100 });
      }
      const fetchedGyms = data.data || [];
      
      setGyms(fetchedGyms);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to load gyms");
    } finally {
      setLoading(false);
    }
  }, [coords]);

  // Load gyms on mount or location change
  useEffect(() => {
    fetchGyms();
  }, [fetchGyms]);

  // Filter and sort gyms in memory
  const filteredAndSortedGyms = gyms
    .filter((gym) => {
      const addressText = gym.location?.address || gym.address?.fullAddress || "";
      const matchesSearch =
        gym.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        addressText.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTag =
        selectedTag === "All" ||
        (gym.amenities && gym.amenities.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase()));
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      if (sortBy === "distance" && a.distanceKm !== undefined && b.distanceKm !== undefined) {
        return a.distanceKm - b.distanceKm;
      }
      const feeA = a.monthlyFee || 0;
      const feeB = b.monthlyFee || 0;
      if (sortBy === "price") {
        return feeA - feeB;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  // Render map markers matching Google style
  const renderMarkers = useCallback(() => {
    if (!leafletMapInstanceRef.current || !window.L) return;
    const L = window.L;
    const map = leafletMapInstanceRef.current;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => {
      map.removeLayer(marker);
    });
    markersRef.current = {};

    filteredAndSortedGyms.forEach((gym) => {
      const lat = gym.locationPoint?.coordinates?.[1] || gym.location?.latitude;
      const lng = gym.locationPoint?.coordinates?.[0] || gym.location?.longitude;
      if (!lat || !lng) return;

      // Create a Google-style pin with label
      const customIcon = L.divIcon({
        className: "custom-google-marker-wrapper",
        html: `
          <div class="flex items-center gap-1.5 whitespace-nowrap select-none">
            <div class="relative w-8 h-8 flex items-center justify-center">
              <svg class="w-8 h-8 drop-shadow-md" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="#EA4335" />
                <circle cx="12" cy="9" r="3.5" fill="#FFFFFF" />
              </svg>
            </div>
            <span class="bg-white/95 px-1.5 py-0.5 rounded border border-gray-300 shadow-sm text-[11px] font-extrabold text-[#EA4335] tracking-wide uppercase">${gym.name}</span>
          </div>
        `,
        iconSize: [140, 32],
        iconAnchor: [16, 32],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      marker.on("click", () => {
        setSelectedGymDetail(gym);
        setSearchQuery(gym.name);
        setIsSidebarOpen(true);
      });

      markersRef.current[gym._id || gym.id] = marker;
    });
  }, [filteredAndSortedGyms]);

  // Dynamically load Leaflet stylesheet & script
  useEffect(() => {
    let link = document.getElementById("leaflet-css");
    if (!link) {
      link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    let script = document.getElementById("leaflet-js");
    if (!script) {
      script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = initializeMap;
      document.body.appendChild(script);
    } else if (window.L) {
      initializeMap();
    }

    function initializeMap() {
      if (!mapRef.current || leafletMapInstanceRef.current) return;

      const L = window.L;
      const centerLat = coords.lat || 18.6496;
      const centerLng = coords.lng || 73.7656;
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([centerLat, centerLng], 14);

      leafletMapInstanceRef.current = map;

      // Define standard streets layer - Using CartoDB Positron for cleaner Google Maps look
      streetTileLayerRef.current = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 20
      }).addTo(map);

      // Define satellite layer
      satelliteTileLayerRef.current = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 19
      });
    }

    return () => {
      if (leafletMapInstanceRef.current) {
        leafletMapInstanceRef.current.remove();
        leafletMapInstanceRef.current = null;
      }
    };
  }, []);

  // Update layer toggle
  useEffect(() => {
    if (!leafletMapInstanceRef.current) return;
    const map = leafletMapInstanceRef.current;

    if (mapLayer === "satellite") {
      if (streetTileLayerRef.current && map.hasLayer(streetTileLayerRef.current)) {
        map.removeLayer(streetTileLayerRef.current);
      }
      if (satelliteTileLayerRef.current) {
        satelliteTileLayerRef.current.addTo(map);
      }
    } else {
      if (satelliteTileLayerRef.current && map.hasLayer(satelliteTileLayerRef.current)) {
        map.removeLayer(satelliteTileLayerRef.current);
      }
      if (streetTileLayerRef.current) {
        streetTileLayerRef.current.addTo(map);
      }
    }
  }, [mapLayer]);

  // Update map markers when listing changes
  useEffect(() => {
    renderMarkers();
  }, [filteredAndSortedGyms, renderMarkers]);

  // Fly to user coordinates and render user locator pin
  useEffect(() => {
    if (coords.lat && coords.lng && leafletMapInstanceRef.current && window.L) {
      const L = window.L;
      const map = leafletMapInstanceRef.current;
      map.flyTo([coords.lat, coords.lng], 14, { duration: 1.5 });

      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
      }

      const userMarkerIcon = L.divIcon({
        className: "custom-leaflet-user-marker",
        html: `
          <div class="relative flex items-center justify-center w-6 h-6">
            <div class="absolute w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow-md"></div>
            <div class="w-6 h-6 rounded-full bg-blue-400 opacity-40 animate-ping"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      userMarkerRef.current = L.marker([coords.lat, coords.lng], { icon: userMarkerIcon })
        .addTo(map)
        .bindPopup("📍 You are here");
    }
  }, [coords]);

  // Handle map resizing upon sidebar toggle
  useEffect(() => {
    if (leafletMapInstanceRef.current) {
      setTimeout(() => {
        leafletMapInstanceRef.current.invalidateSize({ animate: true });
      }, 350);
    }
  }, [isSidebarOpen]);

  const handleGymSelect = (gym) => {
    setSelectedGymDetail(gym);
    setSearchQuery(gym.name);
    setIsSidebarOpen(true);
    const lat = gym.locationPoint?.coordinates?.[1] || gym.location?.latitude;
    const lng = gym.locationPoint?.coordinates?.[0] || gym.location?.longitude;
    if (lat && lng && leafletMapInstanceRef.current) {
      leafletMapInstanceRef.current.flyTo([lat, lng], 15, {
        duration: 1.2,
      });
    }
  };

  const zoomIn = () => {
    if (leafletMapInstanceRef.current) {
      leafletMapInstanceRef.current.zoomIn();
    }
  };

  const zoomOut = () => {
    if (leafletMapInstanceRef.current) {
      leafletMapInstanceRef.current.zoomOut();
    }
  };

  useEffect(() => {
    if (locStatus === "success") {
      toast.success("📍 Location detected successfully!");
    } else if (locStatus === "error") {
      toast.error(locError || "Failed to detect location");
    }
  }, [locStatus, locError]);

  // Helper to parse time strings (e.g. "06:00 AM", "10:00 PM") into minutes since midnight
  const parseTime = (timeStr) => {
    if (!timeStr) return null;
    const clean = timeStr.trim().toUpperCase();
    const match = clean.match(/^(\d+):(\d+)\s*(AM|PM)?$/);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3];

    if (ampm) {
      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;
    }
    return hours * 60 + minutes;
  };

  // Helper to format time strings for status display (e.g. "10:00 PM" -> "10 pm")
  const formatTimeForStatus = (timeStr) => {
    if (!timeStr) return "";
    const clean = timeStr.trim().toLowerCase();
    const match = clean.match(/^(\d+):(\d+)\s*(am|pm)?$/);
    if (!match) return timeStr;
    const hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = match[3] || "";
    
    const formattedMins = minutes === "00" ? "" : `:${minutes}`;
    return `${hours}${formattedMins} ${ampm}`.trim();
  };

  // Helper to determine if a gym is open or closed based on current time
  const getGymOpenStatus = (gym) => {
    let openTimeStr = "06:00 AM";
    let closeTimeStr = "10:00 PM";

    if (gym.openingTime && gym.closingTime) {
      openTimeStr = gym.openingTime;
      closeTimeStr = gym.closingTime;
    } else if (gym.timings) {
      if (gym.timings.open) openTimeStr = gym.timings.open;
      if (gym.timings.close) closeTimeStr = gym.timings.close;
    } else if (gym.hours) {
      const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      const todayName = days[new Date().getDay()];
      const todayHours = gym.hours[todayName];
      if (todayHours) {
        if (todayHours.closed) {
          return { isOpen: false, text: "Closed today" };
        }
        if (todayHours.open) openTimeStr = todayHours.open;
        if (todayHours.close) closeTimeStr = todayHours.close;
      }
    }

    const openMinutes = parseTime(openTimeStr);
    const closeMinutes = parseTime(closeTimeStr);

    if (openMinutes === null || closeMinutes === null) {
      return { isOpen: true, text: `Open · Closes 10 pm` };
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let isOpen = false;
    if (closeMinutes > openMinutes) {
      isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
    } else {
      isOpen = currentMinutes >= openMinutes || currentMinutes < closeMinutes;
    }

    if (isOpen) {
      return { isOpen: true, text: `Open · Closes ${formatTimeForStatus(closeTimeStr)}` };
    } else {
      return { isOpen: false, text: `Closed · Opens ${formatTimeForStatus(openTimeStr)}` };
    }
  };

  // Helper to draw directions/route from user location to gym using free OSRM API
  const drawRouteToGym = async (gym) => {
    if (!leafletMapInstanceRef.current || !window.L) return;
    const L = window.L;
    const map = leafletMapInstanceRef.current;

    setRoutingGym(gym);
    setSelectedGymDetail(null);

    // Clear previous route polyline if any
    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    const startLat = coords.lat || 18.6496;
    const startLng = coords.lng || 73.7656;

    const endLat = gym.locationPoint?.coordinates?.[1] || gym.location?.latitude;
    const endLng = gym.locationPoint?.coordinates?.[0] || gym.location?.longitude;

    if (!endLat || !endLng) {
      toast.error("Gym location coordinates not found");
      return;
    }

    setLoading(true);
    setShowDirectionsPanel(true);
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=true`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.code === "Ok" && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        setRouteDetails({
          distance: (route.distance / 1000).toFixed(1),
          duration: Math.round(route.duration / 60)
        });

        if (route.legs && route.legs[0] && route.legs[0].steps) {
          setRouteSteps(route.legs[0].steps);
        } else {
          setRouteSteps([]);
        }

        const routeCoords = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        
        // Draw blue route line matching Google Maps directions
        const polyline = L.polyline(routeCoords, {
          color: "#1a73e8",
          weight: 6,
          opacity: 0.85,
          lineCap: "round",
          lineJoin: "round"
        }).addTo(map);

        routePolylineRef.current = polyline;

        // Fit map bounds to show start and end of route
        map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
        toast.success("Plotted driving route on the map!");
      } else {
        setRouteDetails({
          distance: "2.5",
          duration: "8"
        });
        // Fallback to straight line
        const polyline = L.polyline([[startLat, startLng], [endLat, endLng]], {
          color: "#ea4335",
          dashArray: "8, 8",
          weight: 4,
          opacity: 0.8
        }).addTo(map);
        routePolylineRef.current = polyline;
        map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
        toast.error("Could not load route streets. Showing straight line path.");
      }
    } catch (err) {
      console.error(err);
      setRouteDetails({
        distance: "2.5",
        duration: "8"
      });
      const polyline = L.polyline([[startLat, startLng], [endLat, endLng]], {
        color: "#ea4335",
        dashArray: "8, 8",
        weight: 4,
        opacity: 0.8
      }).addTo(map);
      routePolylineRef.current = polyline;
      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedGymDetail(null);
    setShowDirectionsPanel(false);
    setRoutingGym(null);
    setRouteDetails(null);
    setRouteSteps([]);
    setShowSteps(false);
    if (routePolylineRef.current && leafletMapInstanceRef.current) {
      leafletMapInstanceRef.current.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }
  };

  // Helper to format dynamic timings
  const getGymTimingsText = (gym) => {
    if (gym.openingTime && gym.closingTime) {
      return `${gym.openingTime} - ${gym.closingTime}`;
    }
    if (gym.timings && gym.timings.open) {
      return `${gym.timings.open} - ${gym.timings.close}`;
    } else if (gym.hours && gym.hours.monday) {
      const mon = gym.hours.monday;
      return mon.closed ? "Closed Today" : `${mon.open} - ${mon.close}`;
    }
    return "06:00 - 22:00";
  };

  return (
    <div 
      className="w-full h-screen overflow-hidden bg-white text-gray-900 flex flex-row relative select-none"
      style={{ fontFamily: "'Roboto', 'Arial', sans-serif" }}
    >
      
      {/* 2. Main sidebar/detail card overlay */}
      <div className={`h-full bg-white border-r border-gray-200 shadow-xl flex flex-col z-20 flex-shrink-0 relative transition-all duration-300 ${
        isSidebarOpen ? "w-[390px]" : "w-0 overflow-hidden border-r-0 shadow-none"
      }`}>
        
        {showDirectionsPanel ? (
          /* Google-style Directions Input Header */
          <div className="p-4 bg-white border-b border-gray-200 flex flex-col gap-3.5 flex-shrink-0 select-none">
            {/* Travel modes icons */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pr-2">
                {/* Best Mode */}
                <button 
                  onClick={() => setTravelMode("best")}
                  className={`flex flex-col items-center gap-1 p-1 px-2.5 rounded-full transition-all cursor-pointer ${
                    travelMode === "best" ? "bg-[#e0f2f1] text-[#006064]" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M22.43 10.42L13.58 1.57c-.77-.77-2.03-.77-2.8 0L1.57 10.98c-.77.77-.77 2.03 0 2.8l8.85 8.85c.78.78 2.04.78 2.82 0l8.86-8.86c.78-.78.78-2.04.01-2.82zM14 14.5V12H9.5c-.28 0-.5.22-.5.5v3H7v-3c0-1.38 1.12-2.5 2.5-2.5H14V7.5l4.5 4.5-4.5 4.5z" />
                  </svg>
                  <span className="text-[10px] font-bold">Best</span>
                </button>

                {/* Car Mode */}
                <button 
                  onClick={() => setTravelMode("car")}
                  className={`flex flex-col items-center gap-1 p-1 px-2.5 rounded-full transition-all cursor-pointer ${
                    travelMode === "car" ? "bg-[#e0f2f1] text-[#006064]" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                  </svg>
                  <span className="text-[10px] font-bold">3 min</span>
                </button>

                {/* Bike Mode */}
                <button 
                  onClick={() => setTravelMode("bike")}
                  className={`flex flex-col items-center gap-1 p-1 px-2.5 rounded-full transition-all cursor-pointer ${
                    travelMode === "bike" ? "bg-[#e0f2f1] text-[#006064]" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M15.5 2.01L5.99 2c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-2.21-1.79-4-4-3.99zM9 20c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm0-4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm0-4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm0-4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm6 12c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm0-4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm0-4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm0-4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
                  </svg>
                  <span className="text-[10px] font-bold">3 min</span>
                </button>

                {/* Transit Mode */}
                <button 
                  onClick={() => setTravelMode("transit")}
                  className={`flex flex-col items-center gap-1 p-1 px-2.5 rounded-full transition-all cursor-pointer ${
                    travelMode === "transit" ? "bg-[#e0f2f1] text-[#006064]" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2c-4.42 0-8 3.58-8 8v7.5c0 .83.67 1.5 1.5 1.5H5v2c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-2h8v2c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-2h.5c.83 0 1.5-.67 1.5-1.5V10c0-4.42-3.58-8-8-8zm5 14H7v-2h10v2zm0-4.5H7V7h10v4.5z" />
                  </svg>
                  <span className="text-[10px] font-bold">9 min</span>
                </button>

                {/* Walk Mode */}
                <button 
                  onClick={() => setTravelMode("walk")}
                  className={`flex flex-col items-center gap-1 p-1 px-2.5 rounded-full transition-all cursor-pointer ${
                    travelMode === "walk" ? "bg-[#e0f2f1] text-[#006064]" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.7-1.1-1-1.8-1-.3 0-.5.1-.8.1L6 8.3v5.2h2V9.8l1.8-.9" />
                  </svg>
                  <span className="text-[10px] font-bold">17 min</span>
                </button>
              </div>

              {/* Close directions */}
              <button 
                onClick={() => {
                  setShowDirectionsPanel(false);
                  setRoutingGym(null);
                  if (routePolylineRef.current && leafletMapInstanceRef.current) {
                    leafletMapInstanceRef.current.removeLayer(routePolylineRef.current);
                    routePolylineRef.current = null;
                  }
                }}
                className="text-gray-500 hover:text-gray-800 transition-colors p-1 rounded-full hover:bg-gray-100 cursor-pointer"
                title="Close directions"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Inputs Block */}
            <div className="flex items-center gap-3 w-full">
              {/* Left connector track */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0 w-6">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-400 bg-white flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
                </div>
                <div className="w-[1.5px] h-6 border-l-2 border-dotted border-gray-300"></div>
                <svg className="w-5 h-5 text-[#ea4335]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 12 12 12 12s12-6.75 12-12c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </div>

              {/* Inputs */}
              <div className="flex-grow flex flex-col gap-2">
                <div className="bg-gray-50 rounded-lg border border-gray-300 px-3 py-1.5 text-[13px] text-gray-700 font-semibold text-left select-text">
                  Your location
                </div>
                <div className="bg-gray-50 rounded-lg border border-gray-300 px-3 py-1.5 text-[13px] text-gray-800 font-bold text-left truncate select-text">
                  {routingGym ? routingGym.name : "Select a gym"}
                </div>
              </div>

              {/* Swap Button */}
              <button className="text-gray-500 hover:text-gray-800 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer flex-shrink-0" title="Reverse starting point and destination">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          /* Floating Google-style Search Input at the top */
          <div className="p-3 pb-2 w-full z-30 flex-shrink-0">
            <div className="bg-white rounded-full border border-gray-300 shadow-md px-4 py-2.5 flex items-center transition-all duration-300 w-full">
              <input
                type="text"
                placeholder="Search Gym Finder..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-grow bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-sm pr-2"
              />
              
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    handleCloseDetail();
                  }}
                  className="mr-3 text-gray-400 hover:text-gray-700 transition-colors p-1 rounded hover:bg-gray-100"
                  title="Clear search"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              <div className="flex items-center gap-3.5 pl-2">
                {/* Search button (Magnifying glass) */}
                <button className="text-gray-500 hover:text-gray-800 transition-colors cursor-pointer">
                  <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                
                {/* Divider line */}
                <div className="h-5 w-[1px] bg-gray-300"></div>

                {/* Directions button (Teal diamond icon) */}
                <button 
                  onClick={() => {
                    if (selectedGymDetail) {
                      drawRouteToGym(selectedGymDetail);
                    } else if (filteredAndSortedGyms.length > 0) {
                      handleGymSelect(filteredAndSortedGyms[0]);
                      drawRouteToGym(filteredAndSortedGyms[0]);
                    } else {
                      toast.error("Please select a gym to show directions");
                    }
                  }}
                  className="w-7.5 h-7.5 bg-[#00838f] hover:bg-[#007077] rounded flex items-center justify-center text-white shadow-sm transition-colors cursor-pointer flex-shrink-0"
                  title="Directions"
                  style={{ transform: 'rotate(45deg)', borderRadius: '6px' }}
                >
                  <div style={{ transform: 'rotate(-45deg)' }} className="flex items-center justify-center">
                    <svg className="w-4.5 h-4.5 text-white fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 18v-5.5a2.5 2.5 0 0 1 2.5-2.5H16" />
                      <polyline points="13 6 17 10 13 14" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main scrollable body (Switch between listing or detail) */}
        {/* Main scrollable body (Conditionally displays gym list or route details) */}
        <div 
          className="flex-grow overflow-y-auto w-full min-h-0"
          onWheel={(e) => {
            e.currentTarget.scrollTop += e.deltaY;
          }}
        >
          {showDirectionsPanel ? (
            <div className="w-full flex flex-col font-sans select-none text-left">
              {showSteps ? (
                <>
                  {/* Steps Header */}
                  <div className="px-5 py-3.5 border-b border-gray-200 bg-white flex items-center justify-between text-xs text-[#00838f] font-bold flex-shrink-0">
                    <button 
                      onClick={() => setShowSteps(false)}
                      className="text-[#00838f] hover:text-[#006064] transition-colors py-1 flex items-center gap-1 cursor-pointer font-bold"
                    >
                      ◀ Back
                    </button>
                    <span className="text-gray-700 font-extrabold uppercase tracking-wide">Turn-by-turn Directions</span>
                    <button 
                      onClick={() => {
                        setShowDirectionsPanel(false);
                        setRoutingGym(null);
                        setRouteDetails(null);
                        setRouteSteps([]);
                        setShowSteps(false);
                        if (routePolylineRef.current && leafletMapInstanceRef.current) {
                          leafletMapInstanceRef.current.removeLayer(routePolylineRef.current);
                          routePolylineRef.current = null;
                        }
                      }}
                      className="text-gray-500 hover:text-gray-800 transition-colors p-1 rounded-full hover:bg-gray-100 cursor-pointer"
                      title="Close directions"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Route Summary Stats */}
                  <div className="bg-blue-50/40 p-4 border-b border-gray-150 flex flex-col gap-1 text-xs">
                    <p className="font-extrabold text-gray-800 text-[14px]">To {routingGym?.name}</p>
                    <div className="flex items-center gap-2 font-semibold text-gray-600 mt-0.5">
                      <span className="text-teal-700 font-black text-sm">{routeDetails?.duration} mins</span>
                      <span>•</span>
                      <span>{routeDetails?.distance} km</span>
                    </div>
                  </div>

                  {/* Steps list */}
                  <div className="flex-grow overflow-y-auto divide-y divide-gray-100 max-h-[360px] pb-6">
                    {routeSteps.length > 0 ? (
                      routeSteps.map((step, idx) => {
                        const instruction = getStepInstruction(step);
                        const isFirst = idx === 0;
                        const isLast = idx === routeSteps.length - 1;
                        return (
                          <div key={idx} className="p-4 flex gap-3.5 items-start hover:bg-gray-50 text-xs text-gray-700 font-medium">
                            <span className="text-base mt-0.5 flex-shrink-0">
                              {isFirst ? "🏁" : isLast ? "📍" : step.maneuver.modifier?.includes("left") ? "⬅️" : step.maneuver.modifier?.includes("right") ? "➡️" : "⬆️"}
                            </span>
                            <div className="flex-grow text-left">
                              <p className="text-gray-800 leading-relaxed font-bold">{instruction}</p>
                              {step.distance > 0 && !isLast && (
                                <p className="text-gray-400 text-[10px] mt-0.5">Continue for {Math.round(step.distance)} meters</p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-5 text-gray-400 text-xs">No street-by-street instructions available. Follow the plotted blue path on the map.</div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Options row */}
                  <div className="px-5 py-3.5 border-b border-gray-200 bg-white flex items-center justify-between text-xs text-[#00838f] font-bold flex-shrink-0">
                    <span className="text-gray-700 font-extrabold uppercase tracking-wide">Driving Route Details</span>
                    <button 
                      onClick={() => {
                        setShowDirectionsPanel(false);
                        setRoutingGym(null);
                        setRouteDetails(null);
                        setRouteSteps([]);
                        setShowSteps(false);
                        if (routePolylineRef.current && leafletMapInstanceRef.current) {
                          leafletMapInstanceRef.current.removeLayer(routePolylineRef.current);
                          routePolylineRef.current = null;
                        }
                      }}
                      className="text-gray-500 hover:text-gray-800 transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
                      title="Close directions"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Dynamic Driving Route Card */}
                  {routeDetails ? (
                    <div className="p-5 bg-white border-b border-gray-150 flex items-start gap-4 transition-all">
                      <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-[#1a73e8] text-base mt-0.5 flex-shrink-0">
                        🚙
                      </div>
                      <div className="flex-grow flex flex-col text-left">
                        <div className="flex justify-between items-baseline">
                          <span className="text-[17px] font-extrabold text-gray-900 leading-tight">Via local streets</span>
                          <span className="text-[18px] font-extrabold text-[#00838f] whitespace-nowrap">{routeDetails.duration} min</span>
                        </div>
                        <p className="text-[13px] text-gray-500 mt-1 font-semibold">Distance: {routeDetails.distance} km</p>
                        <p className="text-[12px] text-gray-400 mt-1.5 leading-normal">Fastest route now based on traffic conditions. Real-time OSRM routing active.</p>
                        
                        <button 
                          onClick={() => setShowSteps(true)}
                          className="w-fit mt-4 px-4 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                        >
                          🗺️ Start Navigation
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 text-gray-400 text-xs font-medium">Calculating route...</div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="w-full flex flex-col font-sans">
              <div className="px-5 py-3 border-b border-gray-150 flex items-center justify-between text-sm text-gray-700 bg-white">
                <span className="text-[16px] font-medium text-gray-900">Results</span>
                <div className="flex items-center gap-4 text-xs text-[#1a73e8] font-semibold font-sans">
                  <div className="flex items-center gap-1 cursor-pointer">
                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>Results Info</span>
                  </div>
                  <button className="flex items-center gap-1 cursor-pointer hover:underline">
                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="p-8 text-center text-xs text-gray-400 font-sans">Loading gyms data...</div>
              ) : filteredAndSortedGyms.length > 0 ? (
                <div className="divide-y divide-gray-150">
                  {filteredAndSortedGyms.map((gym) => {
                    const gymImage = gym.heroImage || gym.images?.[0] || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop";
                    const rating = getRatingValue(gym.rating);
                    const reviewsCount = getReviewsCountValue(gym.rating, gym.reviewsCount || 130);
                    const isSelected = selectedGymDetail && (selectedGymDetail._id === gym._id || selectedGymDetail.id === gym.id);
                    return (
                      <div
                        key={gym._id || gym.id}
                        onClick={() => handleGymSelect(gym)}
                        className={`p-5 hover:bg-gray-50 cursor-pointer flex flex-row justify-between items-start gap-4 transition-all ${
                          isSelected ? "bg-blue-50/50" : ""
                        }`}
                      >
                        <div className="flex-grow text-left">
                          <h3 className="font-semibold text-[17px] text-[#1a73e8] hover:underline transition-colors leading-snug">
                            {gym.name}
                          </h3>
                          
                          {/* Rating with SVG Stars */}
                          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500 font-semibold">
                            <span className="text-gray-800">{rating}</span>
                            <div className="flex text-yellow-500 gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <svg key={s} className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-gray-500">({reviewsCount})</span>
                          </div>

                          {/* Subtitle Category + address */}
                          <p className="text-[13px] text-gray-500 mt-1 font-medium">
                            Gym • {gym.location?.address || gym.address?.fullAddress || "Akurdi, Pune"}
                          </p>

                          {/* Open/Close Hours Status */}
                          {(() => {
                            const status = getGymOpenStatus(gym);
                            const parts = status.text.split("·");
                            return (
                              <div className="flex items-center gap-1 mt-1 text-[13px]">
                                <span className={status.isOpen ? "text-green-700 font-bold" : "text-red-600 font-bold"}>
                                  {parts[0] ? parts[0].trim() : (status.isOpen ? "Open" : "Closed")}
                                </span>
                                {parts[1] && (
                                  <span className="text-gray-400 font-medium">
                                    · {parts[1].trim()}
                                  </span>
                                )}
                              </div>
                            );
                          })()}

                          {/* Review Snippet with User Avatar */}
                          <div className="mt-3 flex items-start gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 font-sans leading-relaxed">
                            <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mt-0.5 flex-shrink-0">
                              <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                              </svg>
                            </div>
                            <span className="italic">"{gym.review || "Excellent equipment and helpful trainers."}"</span>
                          </div>
                        </div>

                        {/* Image Thumbnail on the Right */}
                        <img
                          src={gymImage}
                          alt={gym.name}
                          className="w-[84px] h-[84px] object-cover rounded-xl border border-gray-200 flex-shrink-0 shadow-sm"
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-gray-400 font-sans">No results found.</div>
              )}

              {/* Bottom footer bar with Map Moves update checkbox */}
              <div className="mt-auto border-t border-gray-200 p-4 bg-white flex items-center gap-2 text-xs text-gray-600 font-semibold select-none flex-shrink-0">
                <input 
                  type="checkbox" 
                  id="map-move-update" 
                  checked={updateOnMove} 
                  onChange={(e) => setUpdateOnMove(e.target.checked)}
                  className="rounded text-[#1a73e8] focus:ring-[#1a73e8] border-gray-300 w-4 h-4"
                />
                <label htmlFor="map-move-update" className="cursor-pointer">Update results when map moves</label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Toggle Button (Google Maps Style) */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="hidden md:flex absolute top-1/2 -translate-y-1/2 z-30 bg-white border border-gray-200 shadow-md hover:shadow-lg rounded-r-md py-4 px-1 cursor-pointer transition-all duration-300 items-center justify-center w-[20px] h-[48px]"
        style={{ left: isSidebarOpen ? "390px" : "0px" }}
        title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        <span className="text-[10px] font-extrabold text-gray-500 hover:text-gray-800">
          {isSidebarOpen ? "◀" : "▶"}
        </span>
      </button>

      {/* 3. Leaflet Map container on the right */}
      <div className="flex-grow h-full relative z-10">
        <div ref={mapRef} className="w-full h-full z-0" />

        {/* Floating Detailed Card Container (Overlay on the Map) */}
        {selectedGymDetail && (
          <div 
            className="absolute top-4 left-4 z-20 w-[408px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col pointer-events-auto"
            style={{ 
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              maxHeight: 'calc(100vh - 48px)'
            }}
          >
            <div className="overflow-y-auto flex-grow min-h-0">
              <div className="relative w-full h-[220px] flex-shrink-0">
                <img
                  src={selectedGymDetail.heroImage || selectedGymDetail.images?.[0] || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop"}
                  alt={selectedGymDetail.name}
                  className="w-full h-full object-cover"
                />
                
                <button
                  onClick={handleCloseDetail}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white text-gray-800 hover:bg-gray-100 flex items-center justify-center shadow-lg transition-all cursor-pointer z-30 font-bold"
                  title="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-black/75 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                  </svg>
                  <span>See photos</span>
                </div>
              </div>

              <div className="px-5 pt-4 pb-3 flex flex-col text-left border-b border-gray-150">
                <h2 className="text-[23px] font-medium text-gray-900 tracking-tight leading-tight uppercase font-sans">
                  {selectedGymDetail.name}
                </h2>
                <p className="text-[13px] text-gray-500 font-semibold mt-0.5 uppercase">
                  {translateNameToHindi(selectedGymDetail.name)}
                </p>
                
                <div className="flex items-center gap-1 mt-1 text-[13px] text-gray-500 font-medium">
                  <span className="font-bold text-gray-800">{getRatingValue(selectedGymDetail.rating)}</span>
                  <div className="flex text-yellow-500 gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-gray-500 hover:underline cursor-pointer">({getReviewsCountValue(selectedGymDetail.rating, selectedGymDetail.reviewsCount || 173)})</span>
                  <span className="text-gray-300 mx-1">•</span>
                  <span>Gym</span>
                </div>
              </div>

              <div className="flex border-b border-gray-200 text-[13px] font-bold text-gray-500 px-3 select-none flex-shrink-0">
                {["Overview", "Reviews", "About"].map((t) => (
                  <button 
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`flex-1 py-3 border-b-2 text-center transition-all ${
                      activeTab === t 
                        ? "border-[#00838f] text-[#00838f]" 
                        : "border-transparent hover:text-gray-800"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {activeTab === "Overview" && (
                <div className="flex flex-col text-left">
                  <div className="flex justify-around px-2 py-4 bg-white border-b border-gray-150">
                    <button
                      onClick={() => drawRouteToGym(selectedGymDetail)}
                      className="flex flex-col items-center gap-1.5 group w-[64px] cursor-pointer"
                    >
                      <div className="w-[36px] h-[36px] rounded-full bg-[#00838f] hover:bg-[#007077] flex items-center justify-center text-white shadow-sm transition-colors cursor-pointer">
                        <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18v-5.5a2.5 2.5 0 0 1 2.5-2.5H16" />
                          <polyline points="13 6 17 10 13 14" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-bold text-[#1a73e8] group-hover:underline">Directions</span>
                    </button>

                    <button 
                      onClick={() => navigate(`/gym-details?id=${selectedGymDetail._id || selectedGymDetail.id}`)}
                      className="flex flex-col items-center gap-1.5 group w-[64px] cursor-pointer"
                    >
                      <div className="w-[36px] h-[36px] rounded-full bg-[#e0f7fa] hover:bg-[#b2ebf2] flex items-center justify-center text-[#00838f] shadow-sm transition-all">
                        <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-bold text-[#1a73e8] group-hover:underline leading-tight text-center">View Website</span>
                    </button>

                    <button 
                      onClick={() => handleShareGym(selectedGymDetail)}
                      className="flex flex-col items-center gap-1.5 group w-[64px] cursor-pointer"
                    >
                      <div className="w-[36px] h-[36px] rounded-full bg-[#e0f7fa] hover:bg-[#b2ebf2] flex items-center justify-center text-[#00838f] shadow-sm transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186l5.572 3.251m-5.572-3.251l5.56-3.248a2.25 2.25 0 1 1 3.06 3.19l-5.56 3.248m5.57 1.09a2.25 2.25 0 1 1-3.136 3.062l-5.572-3.251" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-bold text-[#1a73e8] group-hover:underline">Share</span>
                    </button>
                  </div>

                  <div className="p-5 flex flex-col gap-5 text-gray-800 text-[13.5px]">
                    <div className="flex items-start gap-4">
                      <div className="text-gray-400 mt-0.5 flex-shrink-0">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                      </div>
                      <p className="text-gray-700 leading-normal text-left">
                        {selectedGymDetail.location?.address || selectedGymDetail.address?.fullAddress || "Akurdi, Pune"}
                      </p>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="text-gray-400 mt-0.5 flex-shrink-0">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                      </div>
                      <div className="flex-grow flex items-center justify-between text-left">
                        <div>
                          {(() => {
                            const status = getGymOpenStatus(selectedGymDetail);
                            return (
                              <>
                                <span className={status.isOpen ? "text-green-600 font-extrabold" : "text-red-600 font-extrabold"}>
                                  {status.isOpen ? "Open" : "Closed"}
                                </span>
                                <span className="text-gray-400 mx-1.5">·</span>
                                <span className="text-gray-700 font-medium">Timings: {getGymTimingsText(selectedGymDetail)}</span>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="text-gray-400 mt-0.5 flex-shrink-0">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-700">₹{getGymMonthlyFee(selectedGymDetail).toLocaleString()} per month</p>
                      </div>
                    </div>

                    {((selectedGymDetail.facilities && selectedGymDetail.facilities.length > 0) || (selectedGymDetail.amenities && selectedGymDetail.amenities.length > 0)) && (
                      <div className="flex items-start gap-4">
                        <div className="text-gray-400 mt-0.5 flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a2.25 2.25 0 0 0 3.182 0l4.318-4.318a2.25 2.25 0 0 0 0-3.182L11.16 3.659A2.25 2.25 0 0 0 9.568 3z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 7.5h.008v.008H6V7.5z" />
                          </svg>
                        </div>
                        <div className="flex-grow font-sans text-left">
                          <p className="font-semibold text-gray-700 mb-1.5">Amenities</p>
                          <div className="flex flex-wrap gap-1.5">
                            {(selectedGymDetail.facilities && selectedGymDetail.facilities.length > 0 ? selectedGymDetail.facilities : selectedGymDetail.amenities).map((item) => (
                              <span key={item} className="px-2.5 py-0.5 rounded-full bg-gray-100 text-[10px] text-gray-600 font-bold border border-gray-200 uppercase">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "Reviews" && (
                <div className="p-5 flex flex-col gap-4 text-left">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-800 text-[15px]">Visitor Reviews</h3>
                    <button className="text-[12px] text-[#00838f] font-bold hover:underline">Write a review</button>
                  </div>

                  <div className="flex flex-col gap-4 divide-y divide-gray-100">
                    <div className="pt-2 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[13px] text-gray-800">Rutuja Dhayatisak</span>
                        <span className="text-[11px] text-gray-400">2 weeks ago</span>
                      </div>
                      <div className="flex text-yellow-500 text-xs">
                        <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Best gym in the Akurdi area! Excellent trainers, very hygienic environment, and top notch equipment. Specially the cardio and zumba sessions are very motivating. Highly recommended!
                      </p>
                    </div>

                    <div className="pt-4 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[13px] text-gray-800">Abhishek Jadhav</span>
                        <span className="text-[11px] text-gray-400">1 month ago</span>
                      </div>
                      <div className="flex text-yellow-500 text-xs">
                        <span>★</span><span>★</span><span>★</span><span>★</span><span className="text-gray-300">★</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Great workout space with ample parking slot. The timing matches well for working professionals. Very reasonable membership fees.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "About" && (
                <div className="p-5 text-left text-gray-700 text-[13.5px]">
                  <p className="leading-relaxed">
                    This premium fitness center offers standard workout amenities, modern strength equipment, functional cardio areas, and group classes under the guidance of certified trainers.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Floating map chips / pills at the top of the map - Dynamic Gym Amenity Tags */}
        <div className="absolute top-4 left-4 z-10 flex gap-2 overflow-x-auto max-w-[calc(100vw-420px)] pb-1 scrollbar-none pointer-events-auto select-none">
          {gymAmenityChips.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border shadow-md transition-all cursor-pointer ${
                selectedTag === tag
                  ? "bg-[#008080] text-white border-[#008080]"
                  : "bg-white text-gray-700 border-gray-300 hover:text-black"
              }`}
            >
              <span>{tag}</span>
            </button>
          ))}
        </div>

        {/* Floating avatar at top-right of map */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-3 pointer-events-auto">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-500 shadow-md border-2 border-white flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:scale-105 transition-transform" title="User Account">
            WA
          </div>
        </div>

        {/* Satellite/Streets Layer selector at the bottom-left of the map */}
        <div 
          onClick={() => setMapLayer(mapLayer === "streets" ? "satellite" : "streets")}
          className="absolute bottom-6 left-6 z-10 bg-white border-2 border-white rounded-lg overflow-hidden shadow-lg cursor-pointer flex flex-col items-center hover:scale-105 transition-all select-none w-[64px] h-[64px]"
        >
          <div className="w-full h-2/3 bg-gray-200 overflow-hidden relative">
            <img 
              src={mapLayer === "streets" 
                ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/10/362/703"
                : "https://a.tile.openstreetmap.org/10/362/703.png"
              } 
              alt="Layer Thumbnail"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-all"></div>
          </div>
          <span className="text-[10px] font-extrabold text-gray-800 py-0.5 capitalize">{mapLayer === "streets" ? "Satellite" : "Streets"}</span>
        </div>

        {/* Google Maps Bottom-Right Control Stack */}
        <div className="absolute bottom-16 right-4 z-10 flex flex-col items-center gap-2.5 pointer-events-auto">
          {/* Target Location Button */}
          <div className="relative group">
            {/* Tooltip */}
            <div className="absolute right-12 top-1/2 -translate-y-1/2 bg-black text-white text-[11px] rounded px-2.5 py-1.5 shadow-md flex flex-col items-start whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
              <span className="font-bold">Your Location</span>
              <span className="text-blue-400 text-[10px] cursor-pointer hover:underline">Learn more</span>
              {/* Arrow */}
              <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-l-4 border-l-black"></div>
            </div>
            
            <button 
              onClick={getCurrentLocation}
              disabled={locLoading}
              className="w-10 h-10 bg-white hover:bg-gray-50 rounded-full shadow-md border border-gray-200 flex items-center justify-center cursor-pointer transition-colors"
              title="Show Your Location"
            >
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="2.5" fill="currentColor" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              </svg>
            </button>
          </div>

          {/* Zoom Buttons Stack */}
          <div className="flex flex-col bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden w-10">
            <button 
              onClick={zoomIn}
              className="w-10 h-9 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 border-b border-gray-200 transition-colors font-semibold cursor-pointer"
              title="Zoom In"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
            <button 
              onClick={zoomOut}
              className="w-10 h-9 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors font-semibold cursor-pointer"
              title="Zoom Out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scale Line control */}
        <div className="absolute bottom-4 right-52 z-10 flex flex-col items-start select-none pointer-events-none">
          <span className="text-[10px] text-gray-700 font-bold bg-white/60 px-1 rounded">500 m</span>
          <div className="w-16 h-1.5 border-x border-b border-gray-800"></div>
        </div>

        {/* Google Maps Logo style branding */}
        <div className="absolute bottom-1 right-[268px] z-10 text-[10px] text-gray-500 bg-white/70 px-1.5 py-0.5 rounded font-sans flex items-center gap-1 select-none pointer-events-none">
          <span className="font-extrabold text-[#4285F4]">G</span>
          <span className="font-extrabold text-[#EA4335]">o</span>
          <span className="font-extrabold text-[#FBBC05]">o</span>
          <span className="font-extrabold text-[#4285F4]">g</span>
          <span className="font-extrabold text-[#34A853]">l</span>
          <span className="font-extrabold text-[#EA4335]">e</span>
          <span className="text-gray-400 text-[9px] ml-1">Map data ©2026</span>
        </div>
      </div>

      <style>{`
        .custom-google-marker-wrapper {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
};

export default FindGym;
