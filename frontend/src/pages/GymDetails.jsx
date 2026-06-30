import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getGymById, initiateMembershipPurchase, verifyMembershipPurchase } from '../userServices/gymApi';
import toast from 'react-hot-toast';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);


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
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  const handleJoinNow = async (planTitle, price, duration) => {
    const userToken = localStorage.getItem('userToken') || localStorage.getItem('token');
    if (!userToken) {
      toast.error('Please login first to join a membership plan.');
      navigate('/login');
      return;
    }

    setPurchaseLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        setPurchaseLoading(false);
        return;
      }

      const initiateRes = await initiateMembershipPurchase({
        gymId,
        planTitle,
        pricePaid: price,
        duration
      });

      if (!initiateRes.success) {
        toast.error(initiateRes.message || 'Failed to initiate purchase');
        setPurchaseLoading(false);
        return;
      }

      const options = {
        key: initiateRes.key,
        amount: initiateRes.amount,
        currency: initiateRes.currency,
        name: gym.name,
        description: `Membership - ${planTitle}`,
        order_id: initiateRes.orderId,
        handler: async (response) => {
          try {
            await verifyMembershipPurchase({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            toast.success(`Welcome to ${gym.name}! Membership is now active! 🎉`, {
              duration: 6000,
              icon: '💪'
            });
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } catch (err) {
            console.error("Verification failed:", err);
            toast.error("Payment verified locally, but backend sync failed.");
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#FF7A00'
        }
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.open();

    } catch (err) {
      console.error("Purchase error:", err);
      toast.error(err.message || 'Failed to process membership purchase.');
    } finally {
      setPurchaseLoading(false);
    }
  };

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

  useGSAP(() => {
    if (!gym) return;

    // GSAP ScrollTrigger animations for sections
    const sections = ['#about', '#facilities', '#trainers', '#plans', '#offers', '#reviews', '#location'];
    sections.forEach((sectionId) => {
      const element = document.querySelector(sectionId);
      if (element) {
        gsap.fromTo(element,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 85%',
              toggleActions: 'play none none none',
            }
          }
        );
      }
    });

    // Stagger animate cards inside sections
    const cardSelectors = [
      { trigger: '#facilities', targets: '#facilities div.grid > div' },
      { trigger: '#trainers', targets: '#trainers div.grid > div' },
      { trigger: '#plans', targets: '#plans div.grid > div' },
      { trigger: '#offers', targets: '#offers div.grid > div' }
    ];

    cardSelectors.forEach(({ trigger, targets }) => {
      const triggerEl = document.querySelector(trigger);
      const cards = document.querySelectorAll(targets);
      if (triggerEl && cards.length > 0) {
        gsap.fromTo(cards,
          { opacity: 0, y: 30, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.05,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: triggerEl,
              start: 'top 80%',
              toggleActions: 'play none none none',
            }
          }
        );
      }
    });
  }, [gym]);


  if (loading) {
    return (
      <div className="min-h-screen bg-[#111215] text-white flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-t-orange-500 border-zinc-800 rounded-full animate-spin"></div>
          <p className="text-zinc-400 text-sm font-semibold tracking-wide">Loading Gym Experience...</p>
        </div>
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="min-h-screen bg-[#111215] text-white flex flex-col items-center justify-center font-sans p-6">
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
      id: 'Services',
      icon: (color) => (
        <svg className="w-5 h-5 transition-colors" fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="2.2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
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
      className="min-h-screen bg-[#111215] text-white font-sans antialiased pb-20 selection:bg-orange-500 selection:text-white select-none relative overflow-x-hidden pt-20"
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
      <div className="relative w-full h-[380px] sm:h-[480px] md:h-[520px] overflow-hidden">

        {/* Slideshow Image */}
        <img
          src={displayBannerImage}
          alt={`Slide ${currentSlide + 1}`}
          className="w-full h-full object-cover brightness-[0.78] contrast-105 transition-all duration-700 ease-out"
          style={{ objectPosition: 'center 42%' }}
        />

        {/* Top Radial/Linear dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111215] via-transparent to-black/45 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-black/35 z-10"></div>

        {/* Slide Counter */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 bg-black/60 backdrop-blur-md px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1.5 border border-zinc-800">
          <span>📷</span> {currentSlide + 1} / {slideshowImages.length}
        </div>

        {/* Slide navigation controls */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-sm text-white flex items-center justify-center border border-zinc-850 hover:scale-105 active:scale-95 transition-all cursor-pointer text-sm sm:text-lg font-bold"
        >
          ❮
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-sm text-white flex items-center justify-center border border-zinc-850 hover:scale-105 active:scale-95 transition-all cursor-pointer text-sm sm:text-lg font-bold"
        >
          ❯
        </button>

        {/* Left Side Content Overlay */}
        <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 md:left-12 z-20 max-w-xl text-left">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <span className="px-2 py-0.5 text-[8px] sm:text-[9px] font-black tracking-wider bg-orange-600 text-white rounded uppercase">
              Premium Gym
            </span>
            <div className="flex items-center gap-1 text-[#ffc107] text-[11px] sm:text-[13px] font-extrabold">
              <span>★</span>
              <span>{ratingVal}</span>
              <span className="text-zinc-400 font-medium">({reviewsCount} Reviews)</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase leading-tight mb-2 sm:mb-3">
            {gym.name}
          </h1>

          <p className="text-green-500 text-[10px] sm:text-xs font-bold mb-3 sm:mb-4 flex items-center gap-2">
            <span>🟢 Open Now</span>
            <span className="text-zinc-500 font-medium">•</span>
            <span className="text-zinc-350 font-medium">{timingsText}</span>
          </p>

          <p className="text-zinc-300 text-[11px] sm:text-xs md:text-sm font-semibold leading-relaxed flex items-start gap-1.5 max-w-md mb-4 sm:mb-5">
            <span className="text-orange-500 mt-0.5">📍</span>
            <span className="line-clamp-1 sm:line-clamp-none">{address}</span>
          </p>

          {/* Badges row */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wide">
            <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300">🚲 2.5 km away</span>
            <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300">Unisex Gym</span>
            <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300">AC</span>
            <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300">Parking</span>
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

          <button 
            onClick={() => handleJoinNow('Monthly Fitness Plan', monthlyFee, '1 Month')}
            disabled={purchaseLoading}
            className="w-full py-3 bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-extrabold rounded-xl transition-all cursor-pointer text-xs uppercase tracking-wider mb-2.5 shadow-lg shadow-orange-600/10 disabled:opacity-50"
          >
            {purchaseLoading ? 'Processing...' : 'Join Now'}
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

        {/* Floating circular icon buttons on the top right */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:right-[352px] z-20 flex sm:flex-col gap-2">
          <button onClick={() => handleShareGym(gym)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/45 border border-zinc-800 text-white flex items-center justify-center hover:bg-zinc-900 transition-colors cursor-pointer" title="Share">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186l5.572 3.251m-5.572-3.251l5.56-3.248a2.25 2.25 0 1 1 3.06 3.19l-5.56 3.248m5.57 1.09a2.25 2.25 0 1 1-3.136 3.062l-5.572-3.251" />
            </svg>
          </button>
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/45 border border-zinc-800 text-white flex items-center justify-center hover:bg-zinc-900 transition-colors cursor-pointer"
            title="Add to Favorites"
          >
            <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
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
                <span className="text-[9.5px] font-bold uppercase tracking-wider mt-1">{tab.id}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* 4. About FITNESS18 Section */}
      <div id="about" className="max-w-[1380px] mx-auto px-4 md:px-8 mt-12 text-left">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-60px" }}
          className="bg-[#0b0c0e] border border-zinc-900 rounded-[2.5rem] p-6 md:p-10 shadow-2xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Column */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="flex">
                <span className="bg-[#ff7a00] text-white text-[10px] font-black uppercase tracking-wider px-4 py-1.5 rounded-sm relative transform -skew-x-12">
                  ABOUT US
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase mt-5 leading-tight">
                ABOUT <span className="text-[#ff7a00]">{gym.name}</span>
              </h2>

              <p className="text-zinc-400 text-xs md:text-sm leading-relaxed mt-4">
                {gym.about || gym.description || `${gym.name} is a premium fitness gym with modern equipment, certified trainers, cardio zone, strength training, personal training, diet guidance, and flexible membership plans.`}
              </p>

              {/* Statistics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-2 py-6 border-y border-zinc-900/60 my-5">
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="text-base text-[#ff7a00] mb-1">👥</span>
                  <span className="text-lg md:text-xl font-black text-white">5000+</span>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5">Members</span>
                </div>
                <div className="flex flex-col items-center justify-center text-center border-l border-zinc-900/60">
                  <span className="text-base text-[#ff7a00] mb-1">🏋️</span>
                  <span className="text-lg md:text-xl font-black text-white">15+</span>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5">Trainers</span>
                </div>
                <div className="flex flex-col items-center justify-center text-center border-t sm:border-t-0 pt-4 sm:pt-0 border-zinc-900/60 sm:border-l">
                  <span className="text-base text-[#ff7a00] mb-1">📅</span>
                  <span className="text-lg md:text-xl font-black text-white">8+</span>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5">Years</span>
                </div>
                <div className="flex flex-col items-center justify-center text-center border-l border-t sm:border-t-0 pt-4 sm:pt-0 border-zinc-900/60">
                  <span className="text-base text-[#ff7a00] mb-1">⭐</span>
                  <span className="text-lg md:text-xl font-black text-white">{ratingVal}/5</span>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5">Ratings</span>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#ff7a00]/10 border border-[#ff7a00]/20 flex items-center justify-center text-[#ff7a00] text-sm flex-shrink-0">
                    🏋️
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-white">Modern Equipment</h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">Train with the latest high-quality equipment for the best results.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#ff7a00]/10 border border-[#ff7a00]/20 flex items-center justify-center text-[#ff7a00] text-sm flex-shrink-0">
                    👥
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-white">Certified Trainers</h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">Expert & certified trainers to guide, motivate and transform you.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#ff7a00]/10 border border-[#ff7a00]/20 flex items-center justify-center text-[#ff7a00] text-sm flex-shrink-0">
                    ⚡
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-white">Cardio Zone</h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">Advanced cardio machines to improve your endurance.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#ff7a00]/10 border border-[#ff7a00]/20 flex items-center justify-center text-[#ff7a00] text-sm flex-shrink-0">
                    🍎
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-white">Diet Guidance</h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">Personalized diet plans to fuel your body and achieve goals.</p>
                  </div>
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => {
                    const plansEl = document.getElementById('plans');
                    if (plansEl) plansEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3.5 bg-[#ff7a00] hover:bg-[#e06b00] text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 shadow-lg shadow-orange-600/10 cursor-pointer"
                >
                  <span>JOIN NOW</span>
                  <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-white text-[9px]">➔</span>
                </button>
                <button
                  onClick={() => {
                    const plansEl = document.getElementById('plans');
                    if (plansEl) plansEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3.5 bg-transparent border border-zinc-800 hover:border-zinc-700 text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer"
                >
                  <span>EXPLORE PLANS</span>
                  <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-white text-[9px]">➔</span>
                </button>
              </div>
            </div>

            {/* Right Column - Photos & Feature Cards Grid */}
            <div id="gallery" className="lg:col-span-7 grid grid-cols-6 gap-3 sm:gap-4">

              {/* Card 1: Our Gym */}
              <div className="col-span-3 sm:col-span-2 relative aspect-square sm:aspect-[3/3.8] rounded-2xl sm:rounded-3xl overflow-hidden group border border-zinc-900">
                <img
                  src={slideshowImages[0]}
                  alt="Our Gym"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 right-3 sm:right-4 flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#ff7a00] flex items-center justify-center text-white text-[10px] sm:text-xs flex-shrink-0 shadow-lg">
                    📷
                  </div>
                  <div>
                    <h4 className="text-[8px] sm:text-[10px] font-black text-white uppercase tracking-wider">OUR GYM</h4>
                    <p className="text-[6.5px] sm:text-[8px] text-zinc-300 font-medium">State-of-the-art infrastructure</p>
                  </div>
                </div>
              </div>

              {/* Card 2: Expert Trainers */}
              <div className="col-span-3 sm:col-span-2 relative aspect-square sm:aspect-[3/3.8] rounded-2xl sm:rounded-3xl overflow-hidden group border border-zinc-900">
                <img
                  src={gym.trainers?.[0]?.photo || "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=300&auto=format&fit=crop"}
                  alt="Expert Trainers"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 right-3 sm:right-4 flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#ff7a00] flex items-center justify-center text-white text-[10px] sm:text-xs flex-shrink-0 shadow-lg">
                    👥
                  </div>
                  <div>
                    <h4 className="text-[8px] sm:text-[10px] font-black text-white uppercase tracking-wider">EXPERT TRAINERS</h4>
                    <p className="text-[6.5px] sm:text-[8px] text-zinc-300 font-medium">Certified professionals with experience</p>
                  </div>
                </div>
              </div>

              {/* Card 3: Diet Plans */}
              <div className="col-span-3 sm:col-span-2 relative aspect-square sm:aspect-[3/3.8] rounded-2xl sm:rounded-3xl overflow-hidden group border border-zinc-900">
                <img
                  src={gym.offers?.[0]?.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop"}
                  alt="Diet Plans"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 right-3 sm:right-4 flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#ff7a00] flex items-center justify-center text-white text-[10px] sm:text-xs flex-shrink-0 shadow-lg">
                    🍎
                  </div>
                  <div>
                    <h4 className="text-[8px] sm:text-[10px] font-black text-white uppercase tracking-wider">DIET PLANS</h4>
                    <p className="text-[6.5px] sm:text-[8px] text-zinc-300 font-medium">Customized nutrition for your goals</p>
                  </div>
                </div>
              </div>

              {/* Card 4: Premium Lockers */}
              <div className="col-span-3 sm:col-span-3 relative h-[110px] sm:h-[140px] rounded-2xl sm:rounded-3xl overflow-hidden group border border-zinc-900">
                <img
                  src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=400&auto=format&fit=crop"
                  alt="Premium Lockers"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 right-3 sm:right-4 flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#ff7a00] flex items-center justify-center text-white text-[10px] sm:text-xs flex-shrink-0 shadow-lg">
                    🔒
                  </div>
                  <div>
                    <h4 className="text-[8px] sm:text-[10px] font-black text-white uppercase tracking-wider">PREMIUM LOCKERS</h4>
                    <p className="text-[6.5px] sm:text-[8px] text-zinc-350 font-medium">Secure & spacious locker rooms</p>
                  </div>
                </div>
              </div>

              {/* Card 5: Ample Parking */}
              <div className="col-span-3 sm:col-span-3 relative h-[110px] sm:h-[140px] rounded-2xl sm:rounded-3xl overflow-hidden group border border-zinc-900">
                <img
                  src="https://images.unsplash.com/photo-1506015391300-4802dc74de2e?q=80&w=400&auto=format&fit=crop"
                  alt="Ample Parking"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 right-3 sm:right-4 flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#ff7a00] flex items-center justify-center text-white text-[10px] sm:text-xs flex-shrink-0 shadow-lg">
                    🚗
                  </div>
                  <div>
                    <h4 className="text-[8px] sm:text-[10px] font-black text-white uppercase tracking-wider">AMPLE PARKING</h4>
                    <p className="text-[6.5px] sm:text-[8px] text-zinc-300 font-medium">Hassle-free parking for members</p>
                  </div>
                </div>
              </div>

              {/* Card 6: Promo Banner */}
              <div className="col-span-6 bg-[#121316] border border-zinc-900 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#ff8c00] to-[#ff5100] flex items-center justify-center text-white text-xl flex-shrink-0 shadow-lg shadow-orange-500/20">
                    ★
                  </div>
                  <div>
                    <h4 className="text-xs md:text-sm font-black text-white uppercase tracking-wide">YOUR FITNESS JOURNEY STARTS HERE!</h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Join {gym.name} today and become a stronger, healthier version of yourself.</p>
                  </div>
                </div>
                <button
                  onClick={() => handleJoinNow('Monthly Fitness Plan', monthlyFee, '1 Month')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-[#ff7a00] hover:bg-[#e06b00] text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md shadow-orange-600/10 cursor-pointer flex-shrink-0"
                >
                  <span>BOOK FREE TRIAL</span>
                  <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-white text-[8px]">➔</span>
                </button>
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

        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-2 sm:gap-3">
          {displayFacilities.map((facility, idx) => (
            <motion.div
              key={idx}
              variants={cardScaleUp}
              className="bg-[#121214]/40 border border-zinc-900 p-2.5 sm:p-4.5 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 sm:gap-2.5 hover:border-orange-500/25 transition-all group"
            >
              <span className="text-xl sm:text-2xl text-orange-500 group-hover:scale-110 transition-transform">
                {facilityIconMap[facility] || '⭐'}
              </span>
              <span className="text-[8.5px] sm:text-[9.5px] font-extrabold tracking-wider uppercase text-zinc-350 leading-tight break-words max-w-full">{facility}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 5b. Services Offered Section */}
      {gym.services && gym.services.length > 0 && (
        <motion.div
          id="services"
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-40px" }}
          className="max-w-6xl mx-auto px-4 md:px-8 mt-14 text-left"
        >
          <motion.div variants={fadeInUp} className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white border-l-4 border-orange-500 pl-3">
              Services Offered
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {gym.services.map((service, idx) => (
              <motion.div
                key={idx}
                variants={cardScaleUp}
                className="bg-[#121214]/40 border border-zinc-900 p-6 rounded-2xl flex flex-col gap-3 hover:border-orange-500/25 transition-all group text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl text-orange-500">✨</span>
                  <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">{service.name}</h4>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 6. Our Trainers Section */}
      <motion.div
        id="trainers"
        variants={staggerContainer}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: "-40px" }}
        className="max-w-[1380px] mx-auto px-6 py-8 md:px-10 md:py-10 mt-14 bg-[#141518] border border-[#222327] rounded-[2rem] text-left shadow-2xl relative"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-[10px] md:text-xs font-black uppercase tracking-wider text-[#a3e635] mb-1">
              OUR EXPERT TRAINERS
            </p>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase">
              Meet Our Trainers
            </h2>
          </div>
          <button 
            onClick={() => navigate('/trainers')}
            className="px-6 py-3 bg-transparent border border-[#a3e635] hover:bg-[#a3e635] hover:text-black text-white text-[11px] font-black uppercase tracking-wider rounded-2xl transition-all duration-300 shadow-md"
          >
            VIEW ALL TRAINERS
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {displayTrainers.map((t, idx) => (
            <motion.div
              key={idx}
              variants={cardScaleUp}
              className="bg-[#1b1c20] border border-[#2d2e35] rounded-3xl p-4 flex flex-col justify-between group hover:border-[#a3e635]/50 transition-all duration-300"
            >
              <div className="flex flex-col gap-4">
                <div className="w-full aspect-[4/5] bg-zinc-900 rounded-2xl overflow-hidden relative">
                  <img
                    src={t.photo || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=150&auto=format&fit=crop"}
                    alt={t.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>
                
                <div className="pl-4 border-l-2 border-[#a3e635] text-left py-0.5 flex flex-col gap-1">
                  <h4 className="font-extrabold text-sm text-white tracking-wide">
                    {t.name}
                  </h4>
                  <p className="text-zinc-400 text-[10px] font-medium tracking-wide">
                    {t.specialization || t.role || "Fitness Expert"}
                  </p>
                  
                  {/* Additional Trainer Info Fields */}
                  {(t.experience || t.certification) && (
                    <p className="text-zinc-500 text-[9px] font-bold mt-1">
                      {t.experience ? `${t.experience} Experience` : ""}
                      {t.experience && t.certification ? " • " : ""}
                      {t.certification || ""}
                    </p>
                  )}

                  {t.trainingType && (
                    <p className="text-[#a3e635] text-[9px] font-extrabold uppercase tracking-wider mt-1">
                      {t.trainingType}
                    </p>
                  )}

                  {t.availability && (
                    <p className="text-zinc-400 text-[9px] mt-0.5 flex items-center gap-1 font-semibold">
                      <span className="text-[10px] text-[#a3e635]">⏰</span> {t.availability}
                    </p>
                  )}

                  {t.bio && (
                    <p className="text-zinc-400 text-[10px] leading-relaxed mt-1.5 border-t border-zinc-800/80 pt-1.5 italic">
                      "{t.bio}"
                    </p>
                  )}
                  
                  {/* Social Icons Row */}
                  <div className="flex gap-3 mt-3 text-[#a3e635]">
                    <a href={t.facebookLink || "#"} target="_blank" rel="noreferrer" className="hover:text-white transition-colors duration-200">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M9 8H7v3h2v9h3v-9h3l.5-3H12V6c0-.88.39-1 1-1h2V2h-3c-2.9 0-5 1.55-5 4.5V8z"/>
                      </svg>
                    </a>
                    <a href={t.instagramLink || "#"} target="_blank" rel="noreferrer" className="hover:text-white transition-colors duration-200">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                      </svg>
                    </a>
                    <a href={t.twitterLink || "#"} target="_blank" rel="noreferrer" className="hover:text-white transition-colors duration-200">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>
                  </div>
                </div>
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
              <button 
                onClick={() => handleJoinNow(p.title, p.price, p.duration || p.validity)}
                disabled={purchaseLoading}
                className="w-full mt-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-extrabold rounded-lg text-xs uppercase transition-colors cursor-pointer disabled:opacity-50"
              >
                {purchaseLoading ? 'Processing...' : 'Join Now'}
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

          {/* Dynamic Reviews or Sample Comments List */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {gym.reviews && gym.reviews.length > 0 ? (
              gym.reviews.map((r, idx) => (
                <div key={idx} className="flex flex-col gap-1.5 bg-zinc-950/20 p-4 rounded-2xl border border-[#27272a]/20">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-xs text-zinc-305">{r.userName}</span>
                    <span className="text-[10px] text-zinc-500">{r.date ? new Date(r.date).toLocaleDateString() : 'Just now'}</span>
                  </div>
                  <div className="flex text-yellow-500 text-[10px] gap-0.5">
                    {Array.from({ length: r.rating || 5 }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <p className="text-xs text-zinc-400 leading-normal">
                    {r.comment}
                  </p>
                </div>
              ))
            ) : (
              <>
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
              </>
            )}
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
