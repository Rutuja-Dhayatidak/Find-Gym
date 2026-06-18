import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getGymById } from '../userServices/gymApi';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.08
    }
  },
  viewport: { once: true, margin: "-80px" }
};

const cardScaleUp = {
  initial: { opacity: 0, scale: 0.94, y: 20 },
  whileInView: { opacity: 1, scale: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5, ease: "easeOut" }
};

const GymDetails = () => {
  const [searchParams] = useSearchParams();
  const gymId = searchParams.get('id');
  const navigate = useNavigate();

  const [gym, setGym] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('About');

  useEffect(() => {
    if (!gymId) {
      toast.error('Gym ID not provided');
      setLoading(false);
      return;
    }

    const fetchGymDetails = async () => {
      try {
        const response = await getGymById(gymId);
        setGym(response.data || response);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load gym details');
      } finally {
        setLoading(false);
      }
    };

    fetchGymDetails();
  }, [gymId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070708] text-white flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-t-orange-500 border-zinc-800 rounded-full animate-spin"></div>
          <p className="text-zinc-400 text-sm font-semibold tracking-wide">Loading Gym Experience...</p>
        </div>
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="min-h-screen bg-[#070708] text-white flex flex-col items-center justify-center font-sans p-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 max-w-md text-center shadow-xl">
          <svg className="w-16 h-16 text-zinc-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold mb-2">Gym Not Found</h2>
          <p className="text-zinc-400 text-sm mb-6">The gym details you are trying to view are unavailable or invalid.</p>
          <button
            onClick={() => navigate('/gyms')}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer"
          >
            Back to Gym Finder
          </button>
        </div>
      </div>
    );
  }

  // Parse details
  const ratingVal = gym.rating && typeof gym.rating === 'object' ? gym.rating.average || 4.5 : gym.rating || 4.5;
  const reviewsCount = gym.rating && typeof gym.rating === 'object' ? gym.rating.count || 128 : gym.reviewsCount || 128;
  const address = gym.location?.address
    ? `${gym.location.address}, ${gym.location.city}, ${gym.location.state} ${gym.location.zipCode || ''}`.trim()
    : gym.address?.fullAddress || "Gawade Wada, Gurudwara Colony, Nigdi, Pimpri-Chinchwad, Maharashtra 411033";

  const monthlyFee = gym.membershipPlans && gym.membershipPlans.length > 0
    ? gym.membershipPlans.reduce((min, p) => p.price < min ? p.price : min, gym.membershipPlans[0].price)
    : gym.monthlyFee || 1200;

  const timingsText = gym.openingTime && gym.closingTime
    ? `${gym.openingTime} - ${gym.closingTime}`
    : gym.timings && gym.timings.open
      ? `${gym.timings.open} - ${gym.timings.close}`
      : gym.hours && gym.hours.monday && !gym.hours.monday.closed
        ? `${gym.hours.monday.open} - ${gym.hours.monday.close}`
        : "6:00 AM - 11:00 PM";

  const baseFirstImage = (gym.images?.[0] && !gym.images[0].includes("photo-1540575467063"))
    ? gym.images[0]
    : "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop";

  const slideshowImages = (gym.galleryImages && gym.galleryImages.length > 0)
    ? gym.galleryImages
    : [
      (gym.heroImage || baseFirstImage),
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=1200&auto=format&fit=crop"
    ];

  const displayBannerImage = activeImage || (currentSlide === 0 && gym.heroImage ? gym.heroImage : slideshowImages[currentSlide]);

  const facilityIconMap = {
    'Cardio': '⚡',
    'Strength Training': '🏋️',
    'Personal Trainer': '👥',
    'Locker': '🔒',
    'Shower': '🚿',
    'Steam': '💨',
    'Diet Plan': '📋',
    'Parking': '🅿️',
    'Wi-Fi': '📶',
    'AC': '❄️',
    'Sauna': '🧖‍♂️',
    'Swimming Pool': '🏊',
    'Yoga Studio': '🧘',
    'Crossfit Area': '💪',
    'Locker Rooms': '🔒',
    'Steam Room': '💨',
    'Shower Facilities': '🚿',
    'Weight Training': '🏋️'
  };

  const displayFacilities = (gym.facilities && gym.facilities.length > 0)
    ? gym.facilities
    : (gym.amenities && gym.amenities.length > 0 ? gym.amenities : ['Cardio', 'Strength Training', 'Personal Trainer', 'Locker', 'Shower', 'AC']);

  const displayTrainers = (gym.trainers && gym.trainers.length > 0)
    ? gym.trainers
    : [
      { name: "Rohit Sharma", experience: "5+ Years Exp.", specialization: "Strength & Conditioning", photo: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=150&auto=format&fit=crop" },
      { name: "Neha Patil", experience: "4+ Years Exp.", specialization: "Weight Loss Specialist", photo: "https://images.unsplash.com/photo-1594744803329-e58b31de215f?q=80&w=150&auto=format&fit=crop" },
      { name: "Amit Verma", experience: "6+ Years Exp.", specialization: "Muscle Gain Expert", photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop" },
      { name: "Pooja Singh", experience: "3+ Years Exp.", specialization: "Yoga & Flexibility", photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop" }
    ];

  const displayPlans = (gym.membershipPlans && gym.membershipPlans.length > 0)
    ? gym.membershipPlans
    : [
      { title: 'Monthly', price: monthlyFee, duration: 'month', validity: 'Valid for 30 Days', saving: 0, isPopular: false },
      { title: 'Quarterly', price: monthlyFee * 3 - 301, duration: '3 Months', validity: 'Valid for 90 Days', saving: 301, isPopular: false },
      { title: 'Half Yearly', price: monthlyFee * 6 - 1201, duration: '6 Months', validity: 'Valid for 180 Days', saving: 1201, isPopular: false },
      { title: 'Yearly', price: monthlyFee * 12 - 3401, duration: 'Year', validity: 'Valid for 365 Days', saving: 3401, isPopular: true }
    ];

  const hasOffers = (gym.offers && gym.offers.length > 0);
  const displayOffer = hasOffers
    ? gym.offers[0]
    : { title: "50% OFF", description: "on First Month 🎁. Hurry Up! Offer valid till 31 May 2026", image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=150&auto=format&fit=crop" };

  const isTrialAvailable = gym.freeTrial?.available !== undefined ? gym.freeTrial.available : true;
  const trialDays = gym.freeTrial?.days || 3;
  const trialDesc = gym.freeTrial?.description || "Experience our premium facilities";

  const showOffersSection = !gym.setupCompleted || hasOffers || isTrialAvailable;
  const showPromoOffer = !gym.setupCompleted || hasOffers;
  const showFreeTrial = !gym.setupCompleted || isTrialAvailable;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slideshowImages.length) % slideshowImages.length);
  };

  const tabs = [
    {
      id: 'About',
      icon: (color) => (
        <svg className="w-5 h-5 transition-colors" fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="2.2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      )
    },
    {
      id: 'Gallery',
      icon: (color) => (
        <svg className="w-5 h-5 transition-colors" fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="2.2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      )
    },
    {
      id: 'Facilities',
      icon: (color) => (
        <svg className="w-5 h-5 transition-colors" fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="2.2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <path d="M9 17v-5H5v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5H9" />
          <circle cx="12" cy="7" r="2.5" />
        </svg>
      )
    },
    {
      id: 'Trainers',
      icon: (color) => (
        <svg className="w-5 h-5 transition-colors" fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="2.2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      id: 'Plans',
      icon: (color) => (
        <svg className="w-5 h-5 transition-colors" fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="2.2">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      )
    },
    {
      id: 'Reviews',
      icon: (color) => (
        <svg className="w-5 h-5 transition-colors" fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="2.2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )
    },
    {
      id: 'Offers',
      icon: (color) => (
        <svg className="w-5 h-5 transition-colors" fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="2.2">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      )
    },
    {
      id: 'Location',
      icon: (color) => (
        <svg className="w-5 h-5 transition-colors" fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="2.2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      )
    }
  ];

  return (
    <div
      className="min-h-screen bg-[#070708] text-white font-sans antialiased pb-20 selection:bg-orange-500 selection:text-white select-none relative overflow-x-hidden pt-20"
      style={{
        backgroundImage: 'radial-gradient(rgba(249, 115, 22, 0.035) 1.5px, transparent 0), radial-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 0)',
        backgroundSize: '32px 32px, 16px 16px',
        backgroundPosition: '0 0, 8px 8px'
      }}
    >
      {/* Decorative ambient glowing backdrops */}
      <div className="absolute top-[350px] left-[-100px] w-[600px] h-[600px] bg-orange-600/5 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="absolute top-[800px] right-[-100px] w-[500px] h-[500px] bg-orange-500/3 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[200px] left-[15%] w-[600px] h-[600px] bg-amber-500/3 rounded-full blur-[150px] pointer-events-none z-0"></div>

      {/* 1. Hero Slideshow Area */}
      <div className="relative w-full h-[480px] md:h-[520px] overflow-hidden">

        {/* Slideshow Image */}
        <img
          src={displayBannerImage}
          alt={`Slide ${currentSlide + 1}`}
          className="w-full h-full object-cover brightness-[0.78] contrast-105 transition-all duration-700 ease-out"
          style={{ objectPosition: 'center 42%' }}
        />

        {/* Top Radial/Linear dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070708] via-transparent to-black/45 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-black/35 z-10"></div>

        {/* Slide Counter */}
        <div className="absolute top-6 left-6 z-20 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-zinc-800">
          <span>📷</span> {currentSlide + 1} / {slideshowImages.length}
        </div>

        {/* Slide navigation controls */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-sm text-white flex items-center justify-center border border-zinc-850 hover:scale-105 active:scale-95 transition-all cursor-pointer text-lg font-bold"
        >
          ❮
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-sm text-white flex items-center justify-center border border-zinc-850 hover:scale-105 active:scale-95 transition-all cursor-pointer text-lg font-bold"
        >
          ❯
        </button>

        {/* Left Side Content Overlay */}
        <div className="absolute bottom-6 left-6 md:left-12 z-20 max-w-xl text-left">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="px-2.5 py-0.5 text-[9px] font-black tracking-wider bg-orange-600 text-white rounded uppercase">
              Premium Gym
            </span>
            <div className="flex items-center gap-1 text-[#ffc107] text-[13px] font-extrabold">
              <span>★</span>
              <span>{ratingVal}</span>
              <span className="text-zinc-400 font-medium">({reviewsCount} Reviews)</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase leading-none mb-3">
            {gym.name}
          </h1>

          <p className="text-green-500 text-xs font-bold mb-4 flex items-center gap-2">
            <span>🟢 Open Now</span>
            <span className="text-zinc-500 font-medium">•</span>
            <span className="text-zinc-300 font-medium">{timingsText}</span>
          </p>

          <p className="text-zinc-300 text-xs md:text-sm font-semibold leading-relaxed flex items-start gap-1.5 max-w-md mb-5">
            <span className="text-orange-500 mt-0.5">📍</span>
            <span>{address}</span>
          </p>

          {/* Badges row */}
          <div className="flex flex-wrap gap-2 text-[10px] font-extrabold uppercase tracking-wide">
            <span className="px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300">🚲 2.5 km away</span>
            <span className="px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300">Unisex Gym</span>
            <span className="px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300">AC</span>
            <span className="px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300">Parking</span>
          </div>
        </div>

        {/* Right Side Card: Monthly Membership Box (Matches the right card in hero) */}
        <div className="hidden lg:flex absolute bottom-6 right-12 z-20 w-[320px] bg-[#121214]/85 border border-zinc-800/80 backdrop-blur-xl rounded-2xl p-5 shadow-2xl flex-col text-left">
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Monthly Membership</p>
          <p className="text-3xl font-black text-white mb-2">₹{monthlyFee.toLocaleString()}<span className="text-xs text-zinc-500 font-medium">/month</span></p>

          <div className="flex items-center gap-1.5 text-xs text-green-500 font-semibold mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span>Free Trial Available</span>
          </div>

          <button className="w-full py-3 bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-extrabold rounded-xl transition-all cursor-pointer text-xs uppercase tracking-wider mb-2.5 shadow-lg shadow-orange-600/10">
            Join Now
          </button>

          <button className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 active:scale-95 text-white font-extrabold rounded-xl transition-all cursor-pointer text-xs uppercase tracking-wider mb-5">
            Book Free Trial
          </button>

          {/* Mini Features List */}
          <div className="flex flex-col gap-2.5 text-[11px] font-bold text-zinc-400 border-t border-zinc-850 pt-4">
            <div className="flex items-center gap-2">
              <span className="text-[14px]">📝</span> <span>No Registration Fees</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[14px]">🏋️</span> <span>Access to All Equipment</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[14px]">👥</span> <span>Certified Trainers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[14px]">📋</span> <span>Diet Plan Included</span>
            </div>
          </div>
        </div>

        {/* Floating circular icon buttons on the right of title info */}
        <div className="absolute bottom-6 right-6 lg:right-[352px] z-20 flex flex-col gap-3">
          <button className="w-10 h-10 rounded-full bg-black/45 border border-zinc-800 text-white flex items-center justify-center hover:bg-zinc-900 transition-colors cursor-pointer" title="Share">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186l5.572 3.251m-5.572-3.251l5.56-3.248a2.25 2.25 0 1 1 3.06 3.19l-5.56 3.248m5.57 1.09a2.25 2.25 0 1 1-3.136 3.062l-5.572-3.251" />
            </svg>
          </button>
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="w-10 h-10 rounded-full bg-black/45 border border-zinc-800 text-white flex items-center justify-center hover:bg-zinc-900 transition-colors cursor-pointer"
            title="Add to Favorites"
          >
            <svg className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 2. Four Horizontal Buttons Below Banner */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: "-40px" }}
        className="max-w-6xl mx-auto px-4 md:px-8 mt-5 grid grid-cols-2 md:grid-cols-4 gap-3.5"
      >
        <motion.a variants={fadeInUp} href="tel:+919876543210" className="py-4 bg-[#121214]/65 hover:bg-[#18181b]/85 border border-[#27272a]/65 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2.5 transition-all text-xs md:text-sm uppercase tracking-wider">
          <span>📞</span> Call Now
        </motion.a>
        <motion.a variants={fadeInUp} href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="py-4 bg-[#121214]/65 hover:bg-[#18181b]/85 border border-[#27272a]/65 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2.5 transition-all text-xs md:text-sm uppercase tracking-wider">
          <span>💬</span> WhatsApp
        </motion.a>
        <motion.button
          variants={fadeInUp}
          onClick={() => navigate('/gyms')}
          className="py-4 bg-[#121214]/65 hover:bg-[#18181b]/85 border border-[#27272a]/65 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2.5 transition-all text-xs md:text-sm uppercase tracking-wider cursor-pointer"
        >
          <span>🗺️</span> Get Directions
        </motion.button>
        <motion.button variants={fadeInUp} className="py-4 bg-[#121214]/65 hover:bg-[#18181b]/85 border border-[#27272a]/65 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2.5 transition-all text-xs md:text-sm uppercase tracking-wider cursor-pointer">
          <span>📅</span> Book Trial
        </motion.button>
      </motion.div>

      {/* 3. Main Navigation Bar Tabs (Matches the Orange Icon navigation bar) */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: "-40px" }}
        className="max-w-6xl mx-auto px-4 md:px-8 mt-10"
      >
        <div className="bg-[#121214]/20 border-b border-zinc-800/80 p-1 flex items-center overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const iconColor = isActive ? '#f97316' : '#a1a1aa'; // Active Orange-500 or zinc-400
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  document.getElementById(tab.id.toLowerCase())?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`flex-1 min-w-[76px] py-4 text-[11px] font-bold transition-all cursor-pointer flex flex-col items-center gap-2 border-b-2 ${isActive
                    ? 'border-orange-500 text-orange-500 font-extrabold'
                    : 'border-transparent text-zinc-450 hover:text-white'
                  }`}
              >
                {tab.icon(iconColor)}
                <span>{tab.id}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* 4. About FITNESS18 Section */}
      <div id="about" className="max-w-6xl mx-auto px-4 md:px-8 mt-12 text-left">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-60px" }}
          className="bg-[#121214]/45 border border-zinc-900 rounded-3xl p-6 md:p-8 hover:border-orange-500/10 transition-colors shadow-xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Text details */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white border-l-4 border-orange-500 pl-3">
                About {gym.name}
              </h2>
              <p className="text-zinc-400 text-sm md:text-[14.5px] leading-relaxed">
                {gym.about || gym.description || `${gym.name} is a premium fitness destination equipped with state-of-the-art equipment, expert trainers and personalized fitness programs to help you achieve your goals.`}
              </p>

              {/* Orange highlights row */}
              <div className="flex gap-8 mt-3 text-left">
                <div>
                  <p className="text-2xl font-black text-orange-500 flex items-center gap-1.5">
                    <span className="text-[18px]">👥</span> 5000+
                  </p>
                  <p className="text-zinc-555 text-[10px] font-bold uppercase tracking-wide mt-0.5">Members</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-orange-500 flex items-center gap-1.5">
                    <span className="text-[18px]">🏋️</span> 15+
                  </p>
                  <p className="text-zinc-555 text-[10px] font-bold uppercase tracking-wide mt-0.5">Trainers</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-orange-500 flex items-center gap-1.5">
                    <span className="text-[18px]">📅</span> 8+
                  </p>
                  <p className="text-zinc-555 text-[10px] font-bold uppercase tracking-wide mt-0.5">Years</p>
                </div>
              </div>
            </div>

            {/* Right Photos grid (4 thumbnails side-by-side) */}
            <div id="gallery" className="lg:col-span-7 flex flex-col gap-4">
              <div className="grid grid-cols-4 gap-3">
                {slideshowImages.map((imgUrl, i) => (
                  <div
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`aspect-[3/4] rounded-2xl overflow-hidden border group cursor-pointer shadow-md transition-all duration-300 relative ${currentSlide === i ? 'border-orange-500 scale-95 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'border-zinc-800 hover:border-orange-500/50'
                      }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumb ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {i === slideshowImages.length - 1 && (
                      <div className="absolute inset-0 bg-black/65 flex items-center justify-center p-2 text-center text-[10px] font-extrabold uppercase tracking-wider text-white">
                        View All Photos
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </motion.div>
      </div>

      {/* 5. Facilities / Amenities Section */}
      <motion.div
        id="facilities"
        variants={staggerContainer}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: "-40px" }}
        className="max-w-6xl mx-auto px-4 md:px-8 mt-14 text-left"
      >
        <motion.div variants={fadeInUp} className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white border-l-4 border-orange-500 pl-3">
            Facilities / Amenities
          </h2>
          <button className="text-xs font-bold text-orange-500 hover:underline">
            View All
          </button>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
          {displayFacilities.map((facility, idx) => (
            <motion.div
              key={idx}
              variants={cardScaleUp}
              className="bg-[#121214]/40 border border-zinc-900 p-4.5 rounded-2xl flex flex-col items-center justify-center text-center gap-2.5 hover:border-orange-500/25 transition-all group"
            >
              <span className="text-2xl text-orange-500 group-hover:scale-110 transition-transform">
                {facilityIconMap[facility] || '⭐'}
              </span>
              <span className="text-[9.5px] font-extrabold tracking-wider uppercase text-zinc-350">{facility}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 6. Our Trainers Section */}
      <motion.div
        id="trainers"
        variants={staggerContainer}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: "-40px" }}
        className="max-w-6xl mx-auto px-4 md:px-8 mt-14 text-left"
      >
        <motion.div variants={fadeInUp} className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white border-l-4 border-orange-500 pl-3">
            Our Trainers
          </h2>
          <button className="text-xs font-bold text-orange-500 hover:underline">
            View All
          </button>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {displayTrainers.map((t, idx) => (
            <motion.div
              key={idx}
              variants={cardScaleUp}
              className="bg-[#121214]/40 border border-zinc-900 rounded-2xl overflow-hidden text-center flex flex-col items-center hover:border-orange-500/25 transition-all shadow-md group"
            >
              <div className="w-full aspect-[4/5] bg-zinc-800 overflow-hidden relative">
                <img
                  src={t.photo || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=150&auto=format&fit=crop"}
                  alt={t.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
              <div className="p-4 flex-grow flex flex-col justify-center">
                <h4 className="font-extrabold text-sm text-white">{t.name}</h4>
                <p className="text-zinc-500 text-[10px] font-bold uppercase mt-1 tracking-wider">{t.experience || t.exp}</p>
                <p className="text-orange-500 text-[10px] font-black uppercase mt-1 tracking-wider">{t.specialization || t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 7. Membership Plans Section */}
      <motion.div
        id="plans"
        variants={staggerContainer}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: "-40px" }}
        className="max-w-6xl mx-auto px-4 md:px-8 mt-14 text-left"
      >
        <motion.div variants={fadeInUp} className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white border-l-4 border-orange-500 pl-3">
            Membership Plans
          </h2>
          <button className="text-xs font-bold text-orange-500 hover:underline">
            Compare Plans
          </button>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {displayPlans.map((p, idx) => (
            <motion.div
              key={idx}
              variants={cardScaleUp}
              className={`bg-[#121214]/50 border rounded-2xl p-6 flex flex-col justify-between items-center text-center hover:border-orange-500/40 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(249,115,22,0.1)] transition-all duration-300 relative ${p.isPopular ? 'border-orange-500/70 bg-[#121214]/80' : 'border-zinc-900'
                }`}
            >
              {p.isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-[9px] font-extrabold tracking-widest bg-orange-500 text-white rounded-full uppercase shadow">
                  Best Value
                </span>
              )}
              <div className={p.isPopular ? "mt-2" : ""}>
                <p className="text-zinc-400 text-xs font-extrabold uppercase tracking-widest mb-3">{p.title}</p>
                <p className="text-2xl font-black text-white">₹{p.price.toLocaleString()}<span className="text-[11px] text-zinc-500 font-semibold">/{p.duration}</span></p>
                <p className="text-zinc-555 text-[11px] font-bold mt-2">{p.validity}</p>
                {p.saving > 0 && (
                  <p className="text-green-500 text-[11px] font-bold mt-1">Save ₹{p.saving.toLocaleString()}</p>
                )}
              </div>
              <button className="w-full mt-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-extrabold rounded-lg text-xs uppercase transition-colors cursor-pointer">
                Join Now
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 8. Offers & Trial Cards Side-by-Side (Matches screenshot layout) */}
      {showOffersSection && (
        <motion.div
          id="offers"
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-40px" }}
          className="max-w-6xl mx-auto px-4 md:px-8 mt-14 text-left"
        >
          <div className={`grid gap-5 ${showPromoOffer && showFreeTrial ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-2xl mx-auto'}`}>

            {/* Left offer Card with giftbox */}
            {showPromoOffer && (
              <motion.div
                variants={cardScaleUp}
                className="bg-gradient-to-r from-red-950/40 to-[#121214]/40 border border-zinc-900 rounded-3xl p-6 md:p-8 flex items-center justify-between shadow-lg hover:border-orange-500/10 transition-colors"
              >
                <div className="flex flex-col gap-2 max-w-[65%]">
                  <span className="w-fit px-2.5 py-0.5 text-[8.5px] font-black tracking-widest bg-orange-500 text-white rounded uppercase">
                    ⚡ Limited Time Offer
                  </span>
                  <h3 className="text-2xl font-black text-white leading-tight mt-2">{displayOffer.title}</h3>
                  <p className="text-zinc-500 text-[11px] font-semibold mt-1">{displayOffer.description}</p>
                  <button className="w-fit mt-4 px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-extrabold rounded-xl uppercase tracking-wider transition-colors cursor-pointer shadow-md">
                    Claim Offer
                  </button>
                </div>
                {/* 3D Gift Box mock image */}
                <div className="w-[100px] h-[100px] flex-shrink-0 animate-bounce" style={{ animationDuration: '3s' }}>
                  <img
                    src={displayOffer.image || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=150&auto=format&fit=crop"}
                    alt="Giftbox"
                    className="w-full h-full object-contain filter drop-shadow-2xl rounded-2xl"
                  />
                </div>
              </motion.div>
            )}

            {/* Right offer Card with trainer photo */}
            {showFreeTrial && (
              <motion.div
                variants={cardScaleUp}
                className="bg-gradient-to-r from-green-950/20 to-[#121214]/40 border border-zinc-900 rounded-3xl p-6 md:p-8 flex items-center justify-between shadow-lg hover:border-orange-500/10 transition-colors"
              >
                <div className="flex flex-col gap-2 max-w-[60%]">
                  <span className="w-fit px-2.5 py-0.5 text-[8.5px] font-black tracking-widest bg-green-600 text-white rounded uppercase">
                    🟢 Free Trial
                  </span>
                  <h3 className="text-2xl font-black text-white leading-tight mt-2">{trialDays} Days Free Trial</h3>
                  <p className="text-zinc-555 text-[11px] font-semibold mt-1">{trialDesc}</p>
                  <button className="w-fit mt-5 px-6 py-2 bg-green-700 hover:bg-green-600 text-white text-xs font-extrabold rounded-xl uppercase tracking-wider transition-colors cursor-pointer shadow-md">
                    Book Free Trial
                  </button>
                </div>
                {/* Trainer Avatar Photo */}
                <div className="w-[120px] h-[120px] rounded-full overflow-hidden border border-zinc-800 shadow-xl flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=150&auto=format&fit=crop"
                    alt="Trainer"
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            )}

          </div>
        </motion.div>
      )}

      {/* 9. Reviews & Ratings Section */}
      <motion.div
        id="reviews"
        variants={fadeInUp}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: "-45px" }}
        className="max-w-6xl mx-auto px-4 md:px-8 mt-14 text-left"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white border-l-4 border-orange-500 pl-3">
            Reviews & Ratings
          </h2>
          <button className="text-xs font-bold text-orange-500 hover:underline">
            Write a Review
          </button>
        </div>

        <div className="bg-[#121214]/30 border border-zinc-900 rounded-3xl p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* Aggregate Score Card */}
          <div className="lg:col-span-3 flex flex-col items-center justify-center text-center lg:border-r border-[#27272a]/20 lg:pr-8 py-2">
            <p className="text-6xl font-black text-white">{ratingVal}</p>
            <div className="flex text-yellow-500 text-lg gap-1.5 mt-3">
              <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
            </div>
            <p className="text-zinc-500 text-[11px] font-bold mt-2">({reviewsCount} Reviews)</p>
          </div>

          {/* Distribution Graph Bars */}
          <div className="lg:col-span-5 flex flex-col gap-2">
            {[
              { stars: 5, count: 78, pct: '65%' },
              { stars: 4, count: 32, pct: '25%' },
              { stars: 3, count: 12, pct: '8%' },
              { stars: 2, count: 4, pct: '3%' },
              { stars: 1, count: 2, pct: '1%' },
            ].map((row) => (
              <div key={row.stars} className="flex items-center gap-3 text-xs font-bold text-zinc-400">
                <span className="w-3 text-right">{row.stars}★</span>
                <div className="flex-grow h-2 bg-zinc-950 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: row.pct }} />
                </div>
                <span className="w-6 text-zinc-500 text-right">{row.count}</span>
              </div>
            ))}
          </div>

          {/* Sample Comments List */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 bg-zinc-950/20 p-4 rounded-2xl border border-[#27272a]/20">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-xs text-zinc-300">Siddharth J.</span>
                <span className="text-[10px] text-zinc-500">2 days ago</span>
              </div>
              <div className="flex text-yellow-500 text-[10px]">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
              <p className="text-xs text-zinc-400 leading-normal">
                Great gym with all modern equipment. Trainers are very supportive and helpful.
              </p>
            </div>

            <div className="flex flex-col gap-1.5 bg-zinc-950/20 p-4 rounded-2xl border border-[#27272a]/20">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-xs text-zinc-300">Priya K.</span>
                <span className="text-[10px] text-zinc-500">1 week ago</span>
              </div>
              <div className="flex text-yellow-500 text-[10px]">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
              <p className="text-xs text-zinc-400 leading-normal">
                Very clean and spacious gym. Love the atmosphere!
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 10. Location Section with Map (Matches screenshot layout) */}
      <motion.div
        id="location"
        variants={fadeInUp}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: "-45px" }}
        className="max-w-6xl mx-auto px-4 md:px-8 mt-14 text-left"
      >
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white border-l-4 border-orange-500 pl-3 mb-6">
          Location
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 bg-[#121214]/30 border border-zinc-900 rounded-3xl p-6 items-center">

          {/* Left location text detail */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div>
              <p className="text-xs text-zinc-500 font-extrabold uppercase tracking-wide">Gym Address</p>
              <p className="text-zinc-300 text-sm font-semibold mt-2.5 leading-relaxed">
                {address}
              </p>
            </div>

            <button
              onClick={() => navigate('/gyms')}
              className="w-fit px-6 py-3 bg-[#121214] hover:bg-zinc-900 border border-zinc-850 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2"
            >
              🗺️ Get Directions
            </button>
          </div>

          {/* Right Interactive/Mock Map Frame */}
          <div className="lg:col-span-7 h-[280px] rounded-2xl overflow-hidden border border-zinc-900 shadow-md">
            <iframe
              src={`https://maps.google.com/maps?q=${gym.location?.latitude || 18.6496},${gym.location?.longitude || 73.7656}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              className="w-full h-full border-0 filter invert-[90%] hue-rotate-[180deg] brightness-[88%] contrast-[105%]"
              allowFullScreen=""
              loading="lazy"
              title="Gym Map"
            />
          </div>

        </div>
      </motion.div>

    </div>
  );
};

export default GymDetails;
