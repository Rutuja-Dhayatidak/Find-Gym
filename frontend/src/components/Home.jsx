import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import defaultHeroBg from '../assets/home background img2.png';
import ctaBgImg from '../assets/hone baner img2.png';
import giftBoxImg from '../assets/3d_gift_box.png';
import { getActiveBanners, getPublicStats } from '../userServices/homeApi';
import { resolveMediaUrl } from '../userServices/config';
import { getPublicSupplements } from '../userServices/publicHealthStoreApi';
import FeaturedGyms from './FeaturedGyms';
const tofuBowlImg = "/balanced-bowl.png";
const salmonImg = "/muscle-gain-bowl.png";
const oatsBowlImg = "/breakfast-bowl.png";

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const navigate = useNavigate();
  const container = useRef(null);
  const [heroBg, setHeroBg] = useState(defaultHeroBg);
  const [mediaType, setMediaType] = useState('image/png');
  const [activeDishIndex, setActiveDishIndex] = useState(0);
  const [activeSupplementTab, setActiveSupplementTab] = useState("Whey Protein");
  const [dbSupplements, setDbSupplements] = useState([]);

  const healthyDishes = [
    {
      name: "Tofu Buddha Bowl",
      description: "Discover customized nutrition guides, caloric-matched meal prep recipes, and expert-backed dietary advice to fuel your body perfectly.",
      calories: "420",
      protein: "32g",
      carbs: "45g",
      image: tofuBowlImg,
      features: [
        "Personalized Meal Plans",
        "500+ Calorie-Counted Recipes",
        "Calorie & Macro Tracker",
        "Expert Dietitian Consultations"
      ]
    },
    {
      name: "Grilled Salmon & Asparagus",
      description: "Boost your brainpower and heart health with Omega-3 rich salmon paired with crisp green asparagus for clean fuel.",
      calories: "480",
      protein: "42g",
      carbs: "12g",
      image: salmonImg,
      features: [
        "High Protein & Healthy Fats",
        "Low Carb / Keto Friendly",
        "Rich in Omega-3 Fatty Acids",
        "Ready in under 20 minutes"
      ]
    },
    {
      name: "Berry Oats & Almond Bowl",
      description: "Start your morning with a perfect blend of high fiber, wholesome fats, and clean protein to keep you energized all day.",
      calories: "350",
      protein: "18g",
      carbs: "28g",
      image: oatsBowlImg,
      features: [
        "Quick Breakfast Fuel",
        "Complex Carbs for Energy",
        "Heart-Healthy Monounsaturated Fats",
        "Vitamin & Mineral Rich"
      ]
    }
  ];
  const [platformStats, setPlatformStats] = useState({
    gymsCount: 15,
    trainersCount: 8,
    usersCount: 120,
    citiesCount: 3,
    avgRating: "4.8"
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getPublicStats();
        if (res.success && res.data) {
          setPlatformStats(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch public stats:", error);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await getActiveBanners();
        const banners = response.data.banners;

        if (banners && banners.length > 0) {
          // Find the first active banner
          const activeBanner = banners.find(b => b.status === 'Active');
          if (activeBanner) {
            setHeroBg(resolveMediaUrl(activeBanner.mediaUrl));
            setMediaType(activeBanner.mediaType || 'image/jpeg');
          }
        }
      } catch (error) {
        console.error("Failed to load banner:", error);
      }
    };

    fetchBanner();
  }, []);

  useEffect(() => {
    const fetchSupplements = async () => {
      try {
        const response = await getPublicSupplements({ category: activeSupplementTab, limit: 10 });
        if (response && response.success) {
          setDbSupplements(response.data);
        }
      } catch (err) {
        console.error("Failed to load supplements:", err);
      }
    };
    fetchSupplements();
  }, [activeSupplementTab]);

  const [whyVisible, setWhyVisible] = useState(false);
  const whyRef = useRef(null);

  // Foggy landing animation states
  const [fogTransition, setFogTransition] = useState(false);
  const [showFog, setShowFog] = useState(true);

  useEffect(() => {
    // Start fog dissipation transition
    const startTimer = setTimeout(() => {
      setFogTransition(true);
    }, 200);

    // Completely remove the fog overlay from DOM
    const endTimer = setTimeout(() => {
      setShowFog(false);
    }, 1800);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(endTimer);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setWhyVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = whyRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, []);

  useGSAP(() => {
    // Hero Text
    gsap.from('.hero-text > *', { y: 50, opacity: 0, duration: 1, stagger: 0.2, ease: 'power3.out', delay: 0.2 });

    // How it works steps
    gsap.from('.how-step', {
      scrollTrigger: { trigger: '.how-section', start: 'top 85%', toggleActions: 'play none none none' },
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power2.out'
    });

    gsap.from('.how-cta', {
      scrollTrigger: { trigger: '.how-section', start: 'top 75%', toggleActions: 'play none none none' },
      x: 60,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    });

    // Refresh ScrollTrigger to recalculate DOM heights/offsets after components load
    const refreshTimer1 = setTimeout(() => ScrollTrigger.refresh(), 200);
    const refreshTimer2 = setTimeout(() => ScrollTrigger.refresh(), 800);
    const refreshTimer3 = setTimeout(() => ScrollTrigger.refresh(), 1500);

    return () => {
      clearTimeout(refreshTimer1);
      clearTimeout(refreshTimer2);
      clearTimeout(refreshTimer3);
    };
  }, { scope: container });

  return (
    <>
      {showFog && (
        <div
          className={`fixed inset-0 z-[9999] bg-[#000000]/95 flex flex-col items-center justify-center transition-all duration-[1400ms] ease-out pointer-events-none ${fogTransition ? 'opacity-0 backdrop-blur-none scale-105' : 'opacity-100 backdrop-blur-3xl'
            }`}
        >
          {/* Dynamic colorful foggy glow rings */}
          <div className="absolute w-[600px] h-[600px] rounded-full bg-[#FF7A00]/10 blur-[130px] top-1/4 left-1/4 animate-pulse"></div>
          <div className="absolute w-[500px] h-[500px] rounded-full bg-white/[0.02] blur-[110px] bottom-1/4 right-1/4"></div>

          <div className="relative z-10 flex flex-col items-center gap-4">
            {/* Spinning glowing loader representing mist/energy */}
            <div className="w-14 h-14 rounded-full border-2 border-t-[#FF7A00] border-r-transparent border-b-[#FF7A00] border-l-transparent animate-spin mb-2 shadow-[0_0_25px_rgba(255,122,0,0.3)]"></div>
            <h2 className="text-3xl font-black tracking-[0.2em] text-white">
              livesale<span className="text-[#FF7A00]">.FITNESS</span>
            </h2>
            <p className="text-gray-500 text-[10px] tracking-[0.35em] uppercase font-semibold">Experience Fitness</p>
          </div>
        </div>
      )}

      <div
        className={`min-h-screen bg-[#000000] transition-all duration-[1600ms] ease-out ${fogTransition ? 'blur-none opacity-100 scale-100' : 'blur-xl opacity-0 scale-95'
          }`}
        ref={container}
      >
        {/* Hero Section */}
        <div
          className="relative min-h-screen flex items-center bg-cover bg-center bg-no-repeat transition-all duration-1000 py-24 md:py-28 overflow-hidden"
          style={mediaType.startsWith('image/') ? { backgroundImage: `url(${heroBg})` } : {}}
        >
          {mediaType.startsWith('video/') && (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute top-0 left-0 w-full h-full object-cover z-0"
            >
              <source src={heroBg} type={mediaType} />
            </video>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-black/80 to-black/40 md:bg-gradient-to-r md:from-black/80 md:via-black/40 md:to-transparent z-0 pointer-events-none"></div>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 md:mt-16">
            <div className="text-left hero-text">
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/45 border border-white/10 text-gray-300 text-xs font-semibold mb-6">
                <span>🔥</span> 1000+ Gyms • 500+ Trainers • 50+ Cities
              </div>

              {/* Main Heading */}
              <h1 className="text-[42px] md:text-6xl font-extrabold text-white tracking-tight drop-shadow-lg leading-[1.05] md:leading-tight">
                Find The Perfect <br />
                <span className="text-[#FF7A00]">Gym</span> Near You
              </h1>

              {/* Description */}
              <p className="mt-4 text-[15px] md:text-lg text-gray-300 max-w-xl leading-relaxed">
                Discover top-rated gyms, fitness centers, trainers and workout spaces around your location. Start your fitness journey today!
              </p>

              {/* Coupon Banner Card - Google Maps Offer Style */}
              <div className="mt-6 bg-[#0a0a0a]/75 md:bg-black/60 border border-[#FF7A00]/30 shadow-[0_0_30px_rgba(255,122,0,0.15)] rounded-2xl p-4 md:py-4 md:px-5 flex flex-col md:flex-row items-center justify-between w-full md:max-w-2xl overflow-hidden relative backdrop-blur-md">

                {/* Left side offer content */}
                <div className="flex flex-col items-start text-left md:w-[52%] z-10">
                  {/* Pill Badge */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FF7A00] text-white text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-3 shadow-[0_0_10px_rgba(255,122,0,0.3)]">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>LIMITED TIME OFFER</span>
                  </div>

                  <h3 className="text-xl md:text-2xl font-extrabold text-white leading-tight mb-2 tracking-tight">
                    Get Up To <span className="text-[#FF7A00]">30% OFF</span> <br /> on Gym Membership
                  </h3>

                  <p className="text-gray-400 text-xs font-medium mb-4 leading-normal">
                    Use the coupon code below and start saving today!
                  </p>

                  <div className="flex flex-wrap items-center gap-3.5">
                    <button className="bg-[#FF7A00] hover:bg-[#E66E00] text-white font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all duration-300 shadow-[0_4px_15px_rgba(255,122,0,0.3)] text-xs cursor-pointer">
                      Claim Offer Now <span>&gt;</span>
                    </button>

                    <span className="flex items-center gap-1.5 text-gray-500 text-[10px] font-semibold">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Valid for new users only
                    </span>
                  </div>
                </div>

                {/* Right side coupon card and 3D illustration */}
                <div className="flex items-center gap-3.5 mt-4 md:mt-0 md:w-[48%] w-full justify-end relative z-10">
                  {/* Coupon Box with Dashed Border */}
                  <div className="border border-dashed border-[#FF7A00]/60 rounded-xl py-3 px-5 flex flex-col items-center justify-center bg-[#070707]/90 min-w-[160px] relative shadow-inner">
                    {/* Scissor icon positioned directly on top-left of dashed border */}
                    <div className="absolute -top-[11px] left-3 text-[#FF7A00] text-sm font-extrabold flex items-center gap-1 pointer-events-none">
                      ✂️
                    </div>

                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">COUPON CODE</span>
                    <span className="text-xl font-black text-[#FF7A00] tracking-widest mb-2">FINDGYM30</span>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("FINDGYM30");
                        alert("Coupon Code 'FINDGYM30' copied to clipboard!");
                      }}
                      className="flex items-center gap-1.5 border border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.07] text-white text-[10px] font-semibold py-1 px-3.5 rounded-md transition-all cursor-pointer"
                    >
                      <span>Copy Code</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                  </div>

                  {/* Gift Icon illustration float overlay */}
                  <div className="flex items-center justify-center relative flex-shrink-0">
                    <img
                      src={giftBoxImg}
                      alt="3D Gift Box"
                      className="w-20 h-20 object-contain drop-shadow-[0_6px_15px_rgba(255,122,0,0.4)] transform rotate-6 hover:rotate-12 transition-transform duration-300"
                    />
                  </div>
                </div>

                {/* Decorative glow rings inside banner */}
                <div className="absolute -right-20 -bottom-20 w-44 h-44 rounded-full bg-[#FF7A00]/10 blur-2xl z-0 pointer-events-none" />
                <div className="absolute -left-20 -top-20 w-44 h-44 rounded-full bg-[#FF7A00]/5 blur-2xl z-0 pointer-events-none" />
              </div>

              {/* Popular Searches */}
              <div className="mt-8 flex flex-wrap items-center gap-2 md:gap-3 text-[11px] md:text-xs">
                <span className="text-gray-500 font-medium w-full md:w-auto text-left mb-1 md:mb-0">Popular Searches:</span>
                <button className="px-3.5 py-1.5 rounded-full bg-black/40 border border-[#FF7A00] text-[#FF7A00] hover:bg-[#FF7A00]/10 transition-colors font-medium">Gym in Pune</button>
                <button className="px-3.5 py-1.5 rounded-full bg-black/40 border border-white/10 text-gray-400 hover:text-white hover:border-white/25 transition-colors font-medium">Personal Trainer</button>
                <button className="px-3.5 py-1.5 rounded-full bg-black/40 border border-white/10 text-gray-400 hover:text-white hover:border-white/25 transition-colors font-medium">Yoga Studios</button>
                <button className="px-3.5 py-1.5 rounded-full bg-black/40 border border-white/10 text-gray-400 hover:text-white hover:border-white/25 transition-colors font-medium">CrossFit</button>
                <button className="px-3.5 py-1.5 rounded-full bg-black/40 border border-white/10 text-gray-400 hover:text-white hover:border-white/25 transition-colors font-medium">Zumba</button>
              </div>
            </div>
          </div>
          {/* Full screen width marquee at the bottom of Hero */}
          <div className="absolute bottom-0 left-0 w-full bg-black/60 border-t border-white/10 backdrop-blur-md py-3 z-20">
            <marquee direction="left" scrollamount="12" className="text-sm font-semibold text-white tracking-widest uppercase">
              MUMBAI • DELHI • BANGALORE • HYDERABAD • KOLKATA • AHMEDABAD ⚡ GET UP TO 30% OFF ON MEMBERSHIPS! ⚡ JOIN livesale.FITNESS TODAY FOR FREE TRIALS! ⚡
            </marquee>
          </div>
        </div>

        {/* Why Choose Section (Exact UI Match) */}
        <div className="py-16 md:py-24 px-4 md:px-0 bg-[#000000] relative overflow-hidden font-sans border-b border-gray-800 why-section" ref={whyRef}>

          {/* Top Right Decorative Background */}
          <div className="absolute top-0 right-0 w-full md:w-1/2 lg:w-1/3 h-[300px] md:h-[600px] pointer-events-none opacity-60 md:opacity-100">
            <div className="absolute inset-0 bg-[#FF7A00]/20 mix-blend-overlay z-10 rounded-none md:rounded-bl-[400px]"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-black md:bg-gradient-to-l md:from-transparent md:via-[#000000]/50 md:to-[#000000] z-20"></div>
            <img src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1470&auto=format&fit=crop" className="w-full h-full object-cover rounded-none md:rounded-bl-[400px]" alt="Gym Motivation" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-30">

            {/* Header */}
            <div
              className={`text-center mb-16 max-w-3xl mx-auto flex flex-col items-center transition-all duration-1000 transform ${whyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#161B26] border border-[#FF7A00]/20 text-gray-300 text-xs font-bold tracking-[0.15em] mb-6 shadow-[0_0_15px_rgba(255,122,0,0.1)]">
                <svg className="w-3.5 h-3.5 text-[#FF7A00]" fill="currentColor" viewBox="0 0 24 24"><path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z" /></svg>
                WHY CHOOSE US
              </div>
              <h2 className="text-[34px] md:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight text-center">
                Why Choose <br className="block md:hidden" /> <span className="text-[#FF7A00]">livesale.Fitness?</span>
              </h2>
              <p className="text-gray-400 text-sm md:text-lg font-light leading-relaxed max-w-xs md:max-w-3xl text-center">
                We make your fitness journey smarter, easier and more effective<br className="hidden md:block" /> by bringing everything you need in one place.
              </p>
            </div>

            {/* 4 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10 mt-10 why-cards-container">

              {/* Card 1 */}
              <div
                className={`why-card bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-4 md:p-6 lg:p-8 flex flex-row md:flex-col items-center justify-between min-h-[115px] md:min-h-0 md:h-[400px] hover:border-[#FF7A00]/50 hover:bg-white/[0.07] transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] group transform ${whyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: '100ms' }}
              >
                <div className="flex flex-row md:flex-col items-center md:items-center gap-4 md:gap-0">
                  <div className="w-10 h-10 md:w-16 md:h-16 rounded-full border border-[#FF7A00]/30 bg-white/[0.05] flex items-center justify-center mb-0 md:mb-6 flex-shrink-0 shadow-[0_0_20px_rgba(255,122,0,0.15)] group-hover:shadow-[0_0_20px_rgba(255,122,0,0.3)] transition-shadow">
                    <svg className="w-5 h-5 md:w-7 md:h-7 text-[#FF8C00]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                  </div>
                  <div className="flex flex-col items-start md:items-center text-left md:text-center">
                    <h3 className="text-base md:text-xl font-bold text-white mb-1 md:mb-3">Discover Gyms</h3>
                    <p className="text-gray-400 text-xs md:text-sm leading-relaxed">Explore gyms near you with detailed info, photos & amenities.</p>
                  </div>
                </div>
                <div className="w-auto md:w-full mt-0 md:mt-6 flex justify-center flex-shrink-0">
                  <div className="relative w-[110px] h-[70px] md:w-full md:max-w-[220px] md:h-28 bg-white/[0.02] rounded-xl overflow-hidden flex flex-col items-center justify-center border border-white/[0.08]">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '15px 15px' }}></div>
                    <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-[#FF7A00]/50 blur-[2px]"></div>
                    <div className="absolute top-4 left-6 w-2 h-2 rounded-full bg-gray-500/50 blur-[2px]"></div>
                    <svg className="w-8 h-8 md:w-12 md:h-12 text-[#FF7A00] drop-shadow-[0_5px_10px_rgba(255,122,0,0.5)] relative z-10 -mt-1 md:-mt-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                    <div className="w-6 h-1.5 bg-black/40 rounded-[100%] mx-auto -mt-1 relative z-0"></div>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div
                className={`why-card bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-4 md:p-6 lg:p-8 flex flex-row md:flex-col items-center justify-between min-h-[115px] md:min-h-0 md:h-[400px] hover:border-[#FF7A00]/50 hover:bg-white/[0.07] transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] group transform ${whyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: '200ms' }}
              >
                <div className="flex flex-row md:flex-col items-center md:items-center gap-4 md:gap-0">
                  <div className="w-10 h-10 md:w-16 md:h-16 rounded-full border border-[#FF7A00]/30 bg-white/[0.05] flex items-center justify-center mb-0 md:mb-6 flex-shrink-0 shadow-[0_0_20px_rgba(255,122,0,0.15)] group-hover:shadow-[0_0_20px_rgba(255,122,0,0.3)] transition-shadow">
                    <svg className="w-5 h-5 md:w-7 md:h-7 text-[#FF8C00]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                  </div>
                  <div className="flex flex-col items-start md:items-center text-left md:text-center">
                    <h3 className="text-base md:text-xl font-bold text-white mb-1 md:mb-3">Trusted Reviews</h3>
                    <p className="text-gray-400 text-xs md:text-sm leading-relaxed">Read real reviews from members to make confident choices.</p>
                  </div>
                </div>
                <div className="w-auto md:w-full mt-0 md:mt-6 flex justify-center flex-shrink-0">
                  <div className="w-[110px] h-[70px] md:w-full md:max-w-[220px] md:h-28 bg-white/[0.02] rounded-xl p-2 md:p-4 border border-white/[0.08] flex flex-col gap-1.5 md:gap-3 justify-center">
                    <div className="flex items-center gap-1.5 md:gap-3">
                      <div className="w-5 h-5 md:w-8 md:h-8 rounded-full bg-white/[0.05] flex items-center justify-center text-gray-400 flex-shrink-0"><svg className="w-3 h-3 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg></div>
                      <div className="flex text-yellow-500 text-[7px] md:text-[10px] tracking-widest gap-0.5">★★★★★</div>
                    </div>
                    <div className="w-full h-1 bg-white/[0.08] rounded-full"></div>
                    <div className="w-2/3 h-1 bg-white/[0.08] rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div
                className={`why-card bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-4 md:p-6 lg:p-8 flex flex-row md:flex-col items-center justify-between min-h-[115px] md:min-h-0 md:h-[400px] hover:border-[#FF7A00]/50 hover:bg-white/[0.07] transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] group transform ${whyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: '300ms' }}
              >
                <div className="flex flex-row md:flex-col items-center md:items-center gap-4 md:gap-0">
                  <div className="w-10 h-10 md:w-16 md:h-16 rounded-full border border-[#FF7A00]/30 bg-white/[0.05] flex items-center justify-center mb-0 md:mb-6 flex-shrink-0 shadow-[0_0_20px_rgba(255,122,0,0.15)] group-hover:shadow-[0_0_20px_rgba(255,122,0,0.3)] transition-shadow">
                    <svg className="w-5 h-5 md:w-7 md:h-7 text-[#FF8C00]" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm-1 14H5c-.55 0-1-.45-1-1v-5h16v5c0 .55-.45 1-1 1zm1-10H4V6c0-.55.45-1 1-1h14c.55 0 1 .45 1 1v2zM6 14h6v2H6v-2z" /></svg>
                  </div>
                  <div className="flex flex-col items-start md:items-center text-left md:text-center">
                    <h3 className="text-base md:text-xl font-bold text-white mb-1 md:mb-3">Compare Plans</h3>
                    <p className="text-gray-400 text-xs md:text-sm leading-relaxed">Compare membership plans & pricing to find the best fit.</p>
                  </div>
                </div>
                <div className="w-auto md:w-full mt-0 md:mt-6 flex justify-center flex-shrink-0">
                  <div className="w-[110px] h-[70px] md:w-full md:max-w-[220px] md:h-24 flex justify-center items-end gap-1 md:gap-1.5 pb-2 md:pb-3">
                    <div className="w-1/3 bg-white/[0.02] rounded-t-lg md:rounded-t-xl h-10 md:h-16 border-t border-l border-r border-white/[0.08] flex flex-col justify-end p-1 md:p-2 pb-1.5 md:pb-3 relative">
                      <div className="w-full h-0.5 bg-white/[0.08] mb-0.5 rounded"></div>
                      <span className="text-gray-500 text-[8px] md:text-xs text-center block">$</span>
                    </div>
                    <div className="w-1/3 bg-[#FF7A00]/10 rounded-t-lg md:rounded-t-xl h-14 md:h-24 border-t border-l border-r border-[#FF7A00]/30 flex flex-col justify-end p-1 md:p-2 pb-1.5 md:pb-3 relative">
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 md:w-6 md:h-6 rounded bg-[#FF7A00] flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 md:w-4 md:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      <div className="w-full h-0.5 bg-[#FF7A00]/50 mb-0.5 rounded"></div>
                      <span className="text-[#FF8C00] font-bold text-[10px] md:text-sm text-center block">$$</span>
                    </div>
                    <div className="w-1/3 bg-white/[0.02] rounded-t-lg md:rounded-t-xl h-12 md:h-20 border-t border-l border-r border-white/[0.08] flex flex-col justify-end p-1 md:p-2 pb-1.5 md:pb-3 relative">
                      <div className="w-full h-0.5 bg-white/[0.08] mb-0.5 rounded"></div>
                      <span className="text-gray-500 text-[8px] md:text-xs text-center block">$$$</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4 */}
              <div
                className={`why-card bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-4 md:p-6 lg:p-8 flex flex-row md:flex-col items-center justify-between min-h-[115px] md:min-h-0 md:h-[400px] hover:border-[#FF7A00]/50 hover:bg-white/[0.07] transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] group transform ${whyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: '400ms' }}
              >
                <div className="flex flex-row md:flex-col items-center md:items-center gap-4 md:gap-0">
                  <div className="w-10 h-10 md:w-16 md:h-16 rounded-full border border-[#FF7A00]/30 bg-white/[0.05] flex items-center justify-center mb-0 md:mb-6 flex-shrink-0 shadow-[0_0_20px_rgba(255,122,0,0.15)] group-hover:shadow-[0_0_20px_rgba(255,122,0,0.3)] transition-shadow">
                    <svg className="w-5 h-5 md:w-7 md:h-7 text-[#FF8C00]" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>
                  </div>
                  <div className="flex flex-col items-start md:items-center text-left md:text-center">
                    <h3 className="text-base md:text-xl font-bold text-white mb-1 md:mb-3">Connect Easily</h3>
                    <p className="text-gray-400 text-xs md:text-sm leading-relaxed">Connect with gyms directly for inquiries or free trials.</p>
                  </div>
                </div>
                <div className="w-auto md:w-full mt-0 md:mt-6 flex justify-center flex-shrink-0">
                  <div className="w-[110px] h-[70px] md:w-full md:max-w-[220px] md:h-auto bg-white/[0.02] rounded-xl p-2 md:p-4 border border-white/[0.08] flex flex-col justify-center gap-1.5">
                    <div className="flex justify-between items-center mb-0 md:mb-4">
                      <span className="text-white font-semibold text-[8px] md:text-sm">Connect</span>
                      <span className="bg-[#FF7A00]/20 text-[#FF8C00] text-[6px] md:text-[10px] px-1 md:px-2.5 py-0.5 rounded-full">Online</span>
                    </div>
                    <div className="flex justify-center gap-1.5 md:gap-4">
                      <div className="w-5 h-5 md:w-8 md:h-8 rounded-full bg-[#FF7A00]/10 flex items-center justify-center text-[#FF8C00]"><svg className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg></div>
                      <div className="w-5 h-5 md:w-8 md:h-8 rounded-full bg-[#FF7A00]/10 flex items-center justify-center text-[#FF8C00]"><svg className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM4 20V4h16v16H4zM6 9h12v2H6zm0 4h8v2H6zm0-8h12v2H6z" /></svg></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div
              className={`bg-[#0a0b0d]/75 border border-zinc-900 rounded-[2rem] p-6 md:p-8 stats-container shadow-2xl transition-all duration-1000 transform ${whyVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
              style={{ transitionDelay: '500ms' }}
            >
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">

                {/* Stat 1: Gyms Listed */}
                <div className="bg-[#111215]/80 border border-zinc-900 rounded-2xl py-8 px-4 flex flex-col items-center justify-center text-center group hover:border-[#FF7A00]/40 transition-all duration-300 relative shadow-lg">
                  <div className="w-16 h-16 rounded-full bg-[#16171a] border border-[#FF7A00]/15 flex items-center justify-center text-[#FF7A00] mb-5 shadow-inner relative group-hover:scale-105 transition-transform duration-300">
                    <div className="absolute inset-0 bg-[#FF7A00]/5 rounded-full blur-[4px]"></div>
                    <svg className="w-6 h-6 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z" />
                    </svg>
                  </div>
                  <h4 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-1">{platformStats.gymsCount}+</h4>
                  <p className="text-zinc-500 text-[10px] md:text-xs font-bold uppercase tracking-wider">Gyms Listed</p>
                  <div className="w-6 h-0.5 bg-[#FF7A00] rounded-full mt-4 transition-all duration-300 group-hover:w-10"></div>
                </div>

                {/* Stat 2: Cities Covered */}
                <div className="bg-[#111215]/80 border border-zinc-900 rounded-2xl py-8 px-4 flex flex-col items-center justify-center text-center group hover:border-[#FF7A00]/40 transition-all duration-300 relative shadow-lg">
                  <div className="w-16 h-16 rounded-full bg-[#16171a] border border-[#FF7A00]/15 flex items-center justify-center text-[#FF7A00] mb-5 shadow-inner relative group-hover:scale-105 transition-transform duration-300">
                    <div className="absolute inset-0 bg-[#FF7A00]/5 rounded-full blur-[4px]"></div>
                    <svg className="w-6 h-6 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M15 11V5l-3-3-3 3v2H3v14h18V11h-6zm-8 8H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm6 12h-2v-2h2v2zm0-4h-2v-2h2v2z" />
                    </svg>
                  </div>
                  <h4 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-1">{platformStats.citiesCount}+</h4>
                  <p className="text-zinc-500 text-[10px] md:text-xs font-bold uppercase tracking-wider">Cities Covered</p>
                  <div className="w-6 h-0.5 bg-[#FF7A00] rounded-full mt-4 transition-all duration-300 group-hover:w-10"></div>
                </div>

                {/* Stat 3: Happy Users */}
                <div className="bg-[#111215]/80 border border-zinc-900 rounded-2xl py-8 px-4 flex flex-col items-center justify-center text-center group hover:border-[#FF7A00]/40 transition-all duration-300 relative shadow-lg">
                  <div className="w-16 h-16 rounded-full bg-[#16171a] border border-[#FF7A00]/15 flex items-center justify-center text-[#FF7A00] mb-5 shadow-inner relative group-hover:scale-105 transition-transform duration-300">
                    <div className="absolute inset-0 bg-[#FF7A00]/5 rounded-full blur-[4px]"></div>
                    <svg className="w-6 h-6 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                    </svg>
                  </div>
                  <h4 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-1">{platformStats.usersCount}+</h4>
                  <p className="text-zinc-500 text-[10px] md:text-xs font-bold uppercase tracking-wider">Happy Users</p>
                  <div className="w-6 h-0.5 bg-[#FF7A00] rounded-full mt-4 transition-all duration-300 group-hover:w-10"></div>
                </div>

                {/* Stat 4: Average Rating */}
                <div className="bg-[#111215]/80 border border-zinc-900 rounded-2xl py-8 px-4 flex flex-col items-center justify-center text-center group hover:border-[#FF7A00]/40 transition-all duration-300 relative shadow-lg">
                  <div className="w-16 h-16 rounded-full bg-[#16171a] border border-[#FF7A00]/15 flex items-center justify-center text-[#FF7A00] mb-5 shadow-inner relative group-hover:scale-105 transition-transform duration-300">
                    <div className="absolute inset-0 bg-[#FF7A00]/5 rounded-full blur-[4px]"></div>
                    <svg className="w-6 h-6 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  </div>
                  <h4 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-1">{platformStats.avgRating}</h4>
                  <p className="text-zinc-500 text-[10px] md:text-xs font-bold uppercase tracking-wider">Average Rating</p>
                  <div className="w-6 h-0.5 bg-[#FF7A00] rounded-full mt-4 transition-all duration-300 group-hover:w-10"></div>
                </div>

                {/* Stat 5: Trusted Platform */}
                <div className="bg-[#111215]/80 border border-zinc-900 rounded-2xl py-8 px-4 flex flex-col items-center justify-center text-center group hover:border-[#FF7A00]/40 transition-all duration-300 relative shadow-lg">
                  <div className="w-16 h-16 rounded-full bg-[#16171a] border border-[#FF7A00]/15 flex items-center justify-center text-[#FF7A00] mb-5 shadow-inner relative group-hover:scale-105 transition-transform duration-300">
                    <div className="absolute inset-0 bg-[#FF7A00]/5 rounded-full blur-[4px]"></div>
                    <svg className="w-6 h-6 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                    </svg>
                  </div>
                  <h4 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-1">100%</h4>
                  <p className="text-zinc-500 text-[10px] md:text-xs font-bold uppercase tracking-wider">Trusted Platform</p>
                  <div className="w-6 h-0.5 bg-[#FF7A00] rounded-full mt-4 transition-all duration-300 group-hover:w-10"></div>
                </div>

              </div>
            </div>

            {/* Footer Text */}
            <div className="flex items-center justify-center gap-6 mt-10 w-full overflow-hidden">
              <div className="hidden md:block flex-1 h-[1px] bg-gradient-to-r from-transparent to-[#FF7A00]/30"></div>
              <div className="flex items-center gap-2 text-zinc-400 font-extrabold text-[11px] md:text-xs tracking-widest uppercase">
                <span className="text-[#FF7A00] text-sm">⚡</span>
                Your Fitness. Your Choice. Our Platform.
                <span className="text-[#FF7A00] text-sm">⚡</span>
              </div>
              <div className="hidden md:block flex-1 h-[1px] bg-gradient-to-l from-transparent to-[#FF7A00]/30"></div>
            </div>
          </div>
        </div>

        {/* Supplements Section */}
        <div className="py-24 bg-[#000000] border-b border-gray-800 relative overflow-hidden font-sans">
          {/* Decorative ambient blur glows */}
          <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-[#FF7A00]/5 rounded-full blur-[140px] pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-orange-600/5 rounded-full blur-[140px] pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

            {/* Section Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16">
              <div className="text-left max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/20 text-[#FF7A00] text-[10px] font-bold uppercase tracking-wider mb-4 shadow-[0_0_15px_rgba(255,122,0,0.1)]">
                  ⭐ Premium Quality • 100% Authentic
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-[#FF7A00] tracking-tight mb-4 leading-tight">
                  Supplements <span className="text-white">Store</span>
                </h2>
                <p className="text-gray-400 text-base font-light leading-relaxed">
                  Discover trusted, high-performance supplements to fuel your workouts and achieve your fitness goals faster.
                </p>
              </div>

              {/* Trust Assurances Badge Group */}
              <div className="grid grid-cols-2 gap-5 p-5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl max-w-xl w-full lg:w-auto shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FF7A00]/10 border border-[#FF7A00]/20 flex items-center justify-center text-[#FF7A00] flex-shrink-0 shadow-inner">
                    🛡️
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">100% Authentic</h4>
                    <p className="text-[10px] text-gray-500 font-medium">Genuine Products</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FF7A00]/10 border border-[#FF7A00]/20 flex items-center justify-center text-[#FF7A00] flex-shrink-0 shadow-inner">
                    🔬
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">Expert Approved</h4>
                    <p className="text-[10px] text-gray-500 font-medium">Lab Tested</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FF7A00]/10 border border-[#FF7A00]/20 flex items-center justify-center text-[#FF7A00] flex-shrink-0 shadow-inner">
                    🚚
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">Fast Delivery</h4>
                    <p className="text-[10px] text-gray-500 font-medium">Pan India</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FF7A00]/10 border border-[#FF7A00]/20 flex items-center justify-center text-[#FF7A00] flex-shrink-0 shadow-inner">
                    🔒
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">Secure Checkout</h4>
                    <p className="text-[10px] text-gray-500 font-medium">100% Safe</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-3 mb-12">
              {["Whey Protein", "Creatine", "Vitamins", "Mass Gainer", "Fat Burner"].map((tab) => {
                const isActive = activeSupplementTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveSupplementTab(tab)}
                    className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer transform active:scale-95 ${isActive
                      ? "bg-[#FF7A00]/15 border border-[#FF7A00] text-[#FF7A00] shadow-[0_0_15px_rgba(255,122,0,0.25)]"
                      : "bg-white/[0.02] border border-white/5 text-gray-400 hover:text-white hover:border-white/20"
                      }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Grid of Supplements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
              {dbSupplements && dbSupplements.length > 0 ? (
                dbSupplements.map((product) => {
                  const discountPct = product.originalPrice && product.sellingPrice
                    ? Math.round(((product.originalPrice - product.sellingPrice) / product.originalPrice) * 100)
                    : 0;

                  return (
                    <div key={product._id} className="bg-[#08080a] border border-white/5 hover:border-[#FF7A00]/40 rounded-2xl p-4.5 flex flex-col justify-between transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_8px_30px_rgba(255,122,0,0.08)] group relative overflow-hidden">
                      <div className="flex items-center justify-between mb-4 z-10">
                        {discountPct > 0 ? (
                          <span className="border border-red-500/30 text-red-500 bg-red-500/5 text-[9px] font-extrabold px-2.5 py-0.5 rounded shadow-inner">
                            {discountPct}% OFF
                          </span>
                        ) : (
                          <span className="border border-[#FF7A00]/30 text-[#FF7A00] bg-[#FF7A00]/5 text-[9px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded flex items-center gap-1 shadow-inner">
                            ★ Bestseller
                          </span>
                        )}
                        <button className="text-gray-600 hover:text-red-500 transition-colors p-1 bg-white/5 rounded-full hover:bg-white/10">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>

                      {/* Image Container with Glow Ring */}
                      <div className="h-56 w-full flex items-center justify-center mb-5 relative">
                        <div className="absolute w-44 h-44 bg-[#FF7A00]/5 group-hover:bg-[#FF7A00]/10 rounded-full blur-xl z-0 transition-all duration-500 scale-90 group-hover:scale-110"></div>
                        <img
                          src={product.images?.[0] || "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=400&auto=format&fit=crop"}
                          alt={product.name}
                          className="h-48 object-contain z-10 transform group-hover:-translate-y-2 group-hover:rotate-2 transition-all duration-500 rounded-lg"
                          onError={(e) => { e.target.src = "https://placehold.co/400x400/08080a/ffffff?text=Supplement" }}
                        />
                      </div>

                      <div className="flex flex-col flex-grow text-left">
                        <h3 className="text-white font-bold text-xs leading-snug mb-1.5 line-clamp-2 group-hover:text-[#FF7A00] transition-colors min-h-[32px]">
                          {product.name}
                        </h3>
                        <span className="bg-white/5 text-gray-400 text-[9px] font-bold px-2 py-0.5 rounded w-fit mb-3 border border-white/5">
                          {product.variants?.[0]?.flavor || product.flavor || "Standard"}
                        </span>

                        {/* Rating */}
                        <div className="flex items-center gap-0.5 text-[10px] text-yellow-500 mb-4">
                          {Array.from({ length: Math.round(product.rating || 4.5) }).map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                          {Array.from({ length: 5 - Math.round(product.rating || 4.5) }).map((_, i) => (
                            <span key={i} className="text-gray-700">★</span>
                          ))}
                          <span className="text-gray-400 font-bold ml-1">{product.rating || 4.5}</span>
                        </div>
                      </div>

                      {/* Price & Action */}
                      <div className="pt-3.5 border-t border-white/5 text-left">
                        <div className="flex items-baseline gap-1.5 mb-3">
                          <span className="text-white font-black text-sm">₹{(product.sellingPrice || product.oneTimePrice || 0).toLocaleString()}</span>
                          {product.originalPrice && product.originalPrice > (product.sellingPrice || product.oneTimePrice) && (
                            <>
                              <span className="text-gray-500 line-through text-[11px]">₹{product.originalPrice.toLocaleString()}</span>
                              <span className="text-[#FF7A00] text-[10px] font-bold">{discountPct}% OFF</span>
                            </>
                          )}
                        </div>
                        <button
                          onClick={() => navigate(`/categories?tab=supplements&productId=${product._id}`)}
                          className="w-full bg-gradient-to-r from-[#FF7A00] to-[#E66E00] hover:to-[#FF7A00] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-[0_4px_12px_rgba(255,122,0,0.2)] hover:shadow-[0_4px_18px_rgba(255,122,0,0.35)] flex items-center justify-center gap-1 cursor-pointer transform active:scale-95"
                        >
                          View Product <span className="text-xs transition-transform group-hover:translate-x-0.5">&gt;</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-12 text-center">
                  <p className="text-gray-500 text-sm">No supplements found in this category.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Featured Gyms Swiper Section */}
        <FeaturedGyms />

        {/* How It Works Section */}
        <div className="py-12 md:py-20 bg-[#000000] relative overflow-hidden how-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

            <div className="flex flex-col lg:flex-row gap-6">

              {/* Left Column: How It Works */}
              <div className="lg:w-[60%] bg-transparent md:bg-[#000000] border-0 md:border border-gray-800 rounded-3xl p-0 md:p-8 lg:p-10 flex flex-col justify-center">
                <h2 className="text-3xl font-bold text-white mb-8 md:mb-12 text-center md:text-left">
                  How <span className="text-[#FF7A00] drop-shadow-[0_0_10px_rgba(255,122,0,0.5)]">livesale.Fitness</span> Works?
                </h2>

                <div className="flex flex-col md:flex-row justify-between items-stretch md:items-start gap-0 md:gap-4 relative">

                  {/* Arrows (Hidden on mobile) */}
                  <div className="hidden md:flex absolute top-10 left-0 w-full justify-between px-[12%] pointer-events-none">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </div>

                  {/* Step 1 */}
                  <div className="how-step flex flex-row md:flex-col items-center md:text-center text-left w-full md:w-1/4 z-10 rounded-2xl md:rounded-none border border-white/10 md:border-0 bg-white/[0.03] md:bg-transparent p-5 md:p-0 gap-5 md:gap-0">
                    <div className="w-20 h-20 rounded-full border border-orange-500/50 md:border-[#FF7A00]/30 bg-slate-900 md:bg-[#161B26] flex items-center justify-center md:mb-4 flex-shrink-0 shadow-[0_0_20px_rgba(255,122,0,0.1)]">
                      <svg className="w-8 h-8 text-orange-500 md:text-[#FF8C00]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <div className="flex flex-col items-start md:items-center text-left md:text-center">
                      <span className="text-[#FF7A00] font-semibold text-sm mb-1">Step 1</span>
                      <h4 className="text-white font-bold text-sm mb-2">Search Location</h4>
                      <p className="text-gray-500 text-xs leading-relaxed">Enter your city or area to find nearby gyms.</p>
                    </div>
                  </div>

                  {/* Mobile Down Arrow 1 */}
                  <div className="flex md:hidden justify-center w-full py-3">
                    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                    </svg>
                  </div>

                  {/* Step 2 */}
                  <div className="how-step flex flex-row md:flex-col items-center md:text-center text-left w-full md:w-1/4 z-10 rounded-2xl md:rounded-none border border-white/10 md:border-0 bg-white/[0.03] md:bg-transparent p-5 md:p-0 gap-5 md:gap-0">
                    <div className="w-20 h-20 rounded-full border border-orange-500/50 md:border-[#FF7A00]/30 bg-slate-900 md:bg-[#161B26] flex items-center justify-center md:mb-4 flex-shrink-0 shadow-[0_0_20px_rgba(255,122,0,0.1)]">
                      <svg className="w-8 h-8 text-orange-500 md:text-[#FF8C00]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>
                    </div>
                    <div className="flex flex-col items-start md:items-center text-left md:text-center">
                      <span className="text-[#FF7A00] font-semibold text-sm mb-1">Step 2</span>
                      <h4 className="text-white font-bold text-sm mb-2">Browse Gyms</h4>
                      <p className="text-gray-500 text-xs leading-relaxed">Explore gyms with photos, facilities and details.</p>
                    </div>
                  </div>

                  {/* Mobile Down Arrow 2 */}
                  <div className="flex md:hidden justify-center w-full py-3">
                    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                    </svg>
                  </div>

                  {/* Step 3 */}
                  <div className="how-step flex flex-row md:flex-col items-center md:text-center text-left w-full md:w-1/4 z-10 rounded-2xl md:rounded-none border border-white/10 md:border-0 bg-white/[0.03] md:bg-transparent p-5 md:p-0 gap-5 md:gap-0">
                    <div className="w-20 h-20 rounded-full border border-orange-500/50 md:border-[#FF7A00]/30 bg-slate-900 md:bg-[#161B26] flex items-center justify-center md:mb-4 flex-shrink-0 shadow-[0_0_20px_rgba(255,122,0,0.1)]">
                      <svg className="w-8 h-8 text-orange-500 md:text-[#FF8C00]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>
                    </div>
                    <div className="flex flex-col items-start md:items-center text-left md:text-center">
                      <span className="text-[#FF7A00] font-semibold text-sm mb-1">Step 3</span>
                      <h4 className="text-white font-bold text-sm mb-2">Compare & Choose</h4>
                      <p className="text-gray-500 text-xs leading-relaxed">Compare plans, amenities and reviews.</p>
                    </div>
                  </div>

                  {/* Mobile Down Arrow 3 */}
                  <div className="flex md:hidden justify-center w-full py-3">
                    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                    </svg>
                  </div>

                  {/* Step 4 */}
                  <div className="how-step flex flex-row md:flex-col items-center md:text-center text-left w-full md:w-1/4 z-10 rounded-2xl md:rounded-none border border-white/10 md:border-0 bg-white/[0.03] md:bg-transparent p-5 md:p-0 gap-5 md:gap-0">
                    <div className="w-20 h-20 rounded-full border border-orange-500/50 md:border-[#FF7A00]/30 bg-slate-900 md:bg-[#161B26] flex items-center justify-center md:mb-4 flex-shrink-0 shadow-[0_0_20px_rgba(255,122,0,0.1)]">
                      <svg className="w-8 h-8 text-orange-500 md:text-[#FF8C00]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                    </div>
                    <div className="flex flex-col items-start md:items-center text-left md:text-center">
                      <span className="text-[#FF7A00] font-semibold text-sm mb-1">Step 4</span>
                      <h4 className="text-white font-bold text-sm mb-2">Connect & Join</h4>
                      <p className="text-gray-500 text-xs leading-relaxed">Contact the gym and start your fitness journey.</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Right Column: CTA */}
              <div className="how-cta lg:w-[40%] relative bg-[#000000] border border-[#FF7A00]/30 rounded-3xl overflow-hidden p-8 lg:p-10 flex flex-col justify-center shadow-[0_0_30px_rgba(255,122,0,0.1)]">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#000000] via-[#000000]/80 to-transparent z-10"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-transparent to-transparent z-10"></div>
                  <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1470&auto=format&fit=crop" alt="Fitness Journey" className="w-full h-full object-cover object-right opacity-60" />
                </div>

                <div className="relative z-20">
                  <h2 className="text-3xl lg:text-2x6 font-bold text-white leading-tight mb-2">
                    Start Your <br />
                    <span className="text-[#FF7A00] drop-shadow-[0_0_10px_rgba(255,122,0,0.4)]">Fitness Journey</span> <br />
                    Today!
                  </h2>
                  <p className="text-gray-400 text-sm max-w-xs mt-4 mb-8">
                    Find the perfect gym that fits your goals and lifestyle.
                  </p>
                  <button
                    onClick={() => navigate('/gyms')}
                    className="bg-[#FF7A00] hover:bg-green-600 text-black font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-colors shadow-[0_4px_14px_0_rgba(255,122,0,0.39)] cursor-pointer"
                  >
                    Explore Gyms
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* CTA Banner Section (Nutrition & Diet) */}
        <div className="pb-20 bg-[#000000] px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="relative bg-gradient-to-br from-[#0c0c0e] to-[#050506] rounded-[2.5rem] overflow-hidden border border-zinc-900/80 flex flex-col items-stretch p-8 md:p-12 shadow-[0_10px_40px_rgba(0,0,0,0.8)] gap-8">

              {/* Background ambient glow */}
              <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-[#FF7A00]/5 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-orange-600/5 blur-3xl pointer-events-none" />

              {/* Top/Middle Section */}
              <div className="flex flex-col lg:flex-row items-center justify-between gap-10">

                {/* Content Left (60% width) */}
                <div className="relative z-20 lg:w-[58%] text-left flex flex-col">
                  {/* Pill Label */}
                  <div className="flex">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/25 text-[#FF7A00] text-[10px] font-black uppercase tracking-wider mb-5">
                      🥗 NUTRITION & DIET
                    </span>
                  </div>

                  <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight leading-none">
                    Ready for <span className="text-[#FF7A00] drop-shadow-[0_0_10px_rgba(255,122,0,0.3)]">Healthy Food</span>?
                  </h2>

                  <p className="text-zinc-400 text-xs md:text-sm mb-8 leading-relaxed max-w-xl">
                    Discover customized nutrition guides, calorie-matched meal prep recipes, and expert-backed dietary advice to fuel your body perfectly.
                  </p>

                  {/* 4 Feature Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {/* Card 1 */}
                    <div className="bg-[#0e1013]/60 border border-zinc-900/60 rounded-2xl p-4 flex gap-4 items-center">
                      <div className="w-10 h-10 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/20 flex items-center justify-center text-[#FF7A00] flex-shrink-0 text-lg">
                        📋
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-white font-bold text-xs md:text-sm">Personalized Meal Plans</span>
                        <span className="text-zinc-500 text-[10px] md:text-xs leading-tight mt-0.5">Plans tailored to your goals & lifestyle.</span>
                      </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-[#0e1013]/60 border border-zinc-900/60 rounded-2xl p-4 flex gap-4 items-center">
                      <div className="w-10 h-10 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/20 flex items-center justify-center text-[#FF7A00] flex-shrink-0 text-lg">
                        🍳
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-white font-bold text-xs md:text-sm">500+ Calorie-Counted Recipes</span>
                        <span className="text-zinc-500 text-[10px] md:text-xs leading-tight mt-0.5">Delicious recipes with precise macros.</span>
                      </div>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-[#0e1013]/60 border border-zinc-900/60 rounded-2xl p-4 flex gap-4 items-center">
                      <div className="w-10 h-10 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/20 flex items-center justify-center text-[#FF7A00] flex-shrink-0 text-lg">
                        🔥
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-white font-bold text-xs md:text-sm">Calorie & Macro Tracker</span>
                        <span className="text-zinc-500 text-[10px] md:text-xs leading-tight mt-0.5">Track nutrients easily to stay on target.</span>
                      </div>
                    </div>

                    {/* Card 4 */}
                    <div className="bg-[#0e1013]/60 border border-zinc-900/60 rounded-2xl p-4 flex gap-4 items-center">
                      <div className="w-10 h-10 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/20 flex items-center justify-center text-[#FF7A00] flex-shrink-0 text-lg">
                        👤
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-white font-bold text-xs md:text-sm">Expert Dietitian Consultations</span>
                        <span className="text-zinc-500 text-[10px] md:text-xs leading-tight mt-0.5">Get support from certified nutrition experts.</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/categories?tab=diet')}
                    className="bg-gradient-to-r from-[#FF7A00] to-[#E66E00] hover:to-[#FF7A00] text-white font-black py-4 px-8 rounded-2xl flex items-center gap-2 transition-all duration-300 shadow-[0_6px_20px_rgba(255,122,0,0.35)] cursor-pointer text-xs w-fit uppercase tracking-wider"
                  >
                    Explore Healthy Food <span>➔</span>
                  </button>
                </div>

                {/* Graphic Right (40% width) - Interactive orbiting plate */}
                <div className="relative z-20 lg:w-[40%] w-full flex flex-col justify-center items-center min-h-[380px]">
                  {/* Orbiting Golden Ring Effect */}
                  <div className="absolute w-[320px] h-[320px] md:w-[410px] md:h-[410px] rounded-full border border-dashed border-[#FF7A00]/20 animate-[spin_40s_linear_infinite] pointer-events-none"></div>

                  {/* Glowing Plate Backdrop */}
                  <div className="absolute w-72 h-72 md:w-80 md:h-80 rounded-full bg-gradient-to-tr from-[#FF7A00]/20 to-orange-500/5 blur-2xl pointer-events-none"></div>

                  {/* Main Plate Image */}
                  <motion.img
                    key={activeDishIndex}
                    initial={{ opacity: 0, rotate: -45, scale: 0.85 }}
                    animate={{ opacity: 1, rotate: 6, scale: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    src={healthyDishes[activeDishIndex].image}
                    alt={healthyDishes[activeDishIndex].name}
                    className="w-60 h-60 md:w-80 md:h-80 lg:w-[360px] lg:h-[360px] object-cover rounded-full border border-[#FF7A00]/30 shadow-[0_15px_35px_rgba(255,122,0,0.3)] relative z-10 transition-transform duration-500 hover:scale-105"
                  />

                  {/* Floating Glassmorphic Macro Badges */}
                  <div key={`macros-${activeDishIndex}`} className="absolute inset-0 pointer-events-none">
                    {/* Badge 1: Calories (Top) */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#090a0c]/85 border border-zinc-900 px-4 py-2 rounded-xl shadow-lg z-20 flex items-center gap-2">
                      <span className="text-[#FF7A00] text-sm">🔥</span>
                      <div className="flex flex-col items-start leading-none">
                        <span className="text-white font-black text-xs">{healthyDishes[activeDishIndex].calories} kcal</span>
                        <span className="text-zinc-500 text-[8px] mt-0.5">Calories</span>
                      </div>
                    </div>

                    {/* Badge 2: Protein (Bottom-Left) */}
                    <div className="absolute bottom-4 left-[-20px] lg:left-[-35px] bg-[#090a0c]/85 border border-zinc-900 px-4 py-2.5 rounded-xl shadow-lg z-20 flex items-center gap-2">
                      <span className="text-[#FF7A00] text-sm">💪</span>
                      <div className="flex flex-col items-start leading-none">
                        <span className="text-white font-black text-xs">{healthyDishes[activeDishIndex].protein}</span>
                        <span className="text-zinc-500 text-[8px] mt-0.5">Protein</span>
                      </div>
                    </div>

                    {/* Badge 3: Carbs (Right-Middle) */}
                    <div className="absolute top-1/3 right-[-20px] lg:right-[-35px] bg-[#090a0c]/85 border border-zinc-900 px-4 py-2.5 rounded-xl shadow-lg z-20 flex items-center gap-2">
                      <span className="text-[#FF7A00] text-sm">🌾</span>
                      <div className="flex flex-col items-start leading-none">
                        <span className="text-white font-black text-xs">{healthyDishes[activeDishIndex].carbs}</span>
                        <span className="text-zinc-500 text-[8px] mt-0.5">Carbs</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Row: Arrow Navigation */}
              <div className="relative z-20 mt-8 border-t border-zinc-900/60 pt-6 flex items-center justify-end">

                {/* Arrows and Pagination Dots */}
                <div className="flex items-center gap-5">
                  {/* Pagination Dots */}
                  <div className="flex gap-2">
                    {healthyDishes.map((_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-300 ${activeDishIndex === i ? 'bg-[#FF7A00] w-4' : 'bg-zinc-800 w-1.5'}`}
                      ></span>
                    ))}
                  </div>

                  {/* Navigation Arrows */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveDishIndex((prev) => (prev === 0 ? healthyDishes.length - 1 : prev - 1))}
                      className="w-9 h-9 rounded-full bg-zinc-900 hover:bg-[#FF7A00] border border-zinc-850 hover:border-[#FF7A00] text-white hover:text-black transition-all flex items-center justify-center cursor-pointer shadow-lg active:scale-95"
                      title="Previous Dish"
                    >
                      <span className="rotate-180 inline-block">➔</span>
                    </button>

                    <button
                      onClick={() => setActiveDishIndex((prev) => (prev === healthyDishes.length - 1 ? 0 : prev + 1))}
                      className="w-9 h-9 rounded-full bg-[#FF7A00] text-black transition-all flex items-center justify-center cursor-pointer shadow-lg hover:scale-105 active:scale-95"
                      title="Next Dish"
                    >
                      <span>➔</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="pb-24 bg-[#000000] relative overflow-hidden font-sans benefits-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-30">
            {/* Header */}
            <div className="text-center mb-12 max-w-3xl mx-auto flex flex-col items-center">
              <div className="inline-flex items-center gap-4 text-[#FF7A00] text-xs font-bold tracking-[0.15em] mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                OUR BENEFITS
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
                Benefits That <span className="text-[#FF7A00]">Empower You</span>
              </h2>
              <p className="text-gray-400 text-base md:text-lg font-light leading-relaxed">
                We bring everything you need to <span className="text-[#FF7A00] underline decoration-[#FF7A00]/50 underline-offset-4">achieve your fitness goals.</span>
              </p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

              {/* Card 1: Verified Gyms */}
              <div className="relative bg-[#000000] border border-gray-800 rounded-2xl overflow-hidden h-auto md:h-[280px] group flex flex-col justify-center p-6 md:p-8 hover:border-[#FF7A00]/50 transition-all duration-300">
                <div className="absolute inset-0 z-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#000000] via-[#000000]/90 to-[#000000]/20 z-10"></div>
                  <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop" className="w-full h-full object-cover object-right opacity-30 group-hover:opacity-50 transition-opacity duration-500" alt="Verified Gyms" />
                </div>
                <div className="relative z-20 flex gap-5 md:gap-6 items-start max-w-sm">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(255,122,0,0.15)]">
                    <svg className="w-6 h-6 md:w-8 md:h-8 text-[#FF7A00] drop-shadow-[0_0_10px_rgba(255,122,0,0.8)]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" /></svg>
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3">Verified Gyms</h3>
                    <p className="text-gray-400 text-xs md:text-sm leading-relaxed">All gyms are verified for authenticity and quality assurance.</p>
                  </div>
                </div>
              </div>

              {/* Card 2: Expert Trainers */}
              <div className="relative bg-[#000000] border border-gray-800 rounded-2xl overflow-hidden h-auto md:h-[280px] group flex flex-col justify-center p-6 md:p-8 hover:border-[#FF7A00]/50 transition-all duration-300">
                <div className="absolute inset-0 z-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#000000] via-[#000000]/90 to-transparent z-10"></div>
                  <img src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1470&auto=format&fit=crop" className="w-full h-full object-cover object-right opacity-30 group-hover:opacity-50 transition-opacity duration-500" alt="Expert Trainers" />
                </div>
                <div className="relative z-20 flex gap-5 md:gap-6 items-start max-w-sm">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(255,122,0,0.15)]">
                    <svg className="w-6 h-6 md:w-8 md:h-8 text-[#FF7A00] drop-shadow-[0_0_10px_rgba(255,122,0,0.8)]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" /></svg>
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3">Expert Trainers</h3>
                    <p className="text-gray-400 text-xs md:text-sm leading-relaxed">Connect with certified and experienced trainers easily.</p>
                  </div>
                </div>
              </div>

              {/* Card 3: Best Prices */}
              <div className="relative bg-[#000000] border border-gray-800 rounded-2xl overflow-hidden h-auto md:h-[280px] group flex flex-col justify-center p-6 md:p-8 hover:border-[#FF7A00]/50 transition-all duration-300">
                <div className="absolute inset-0 z-0 bg-[#000000]"></div>
                <div className="relative z-20 flex flex-col md:flex-row gap-6 items-center w-full h-full">
                  <div className="flex gap-5 md:gap-6 items-start md:max-w-[200px] w-full md:w-1/2">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(255,122,0,0.15)]">
                      <svg className="w-6 h-6 md:w-8 md:h-8 text-[#FF7A00] drop-shadow-[0_0_10px_rgba(255,122,0,0.8)]" fill="currentColor" viewBox="0 0 24 24"><path d="M21.41 11.58L12.41 2.58C12.05 2.22 11.55 2 11 2H4C2.9 2 2 2.9 2 4V11C2 11.55 2.22 12.05 2.59 12.42L11.59 21.42C11.95 21.78 12.45 22 13 22C13.55 22 14.05 21.78 14.41 21.41L21.41 14.41C21.78 14.05 22 13.55 22 13C22 12.45 21.77 11.94 21.41 11.58ZM13 20.01L4 11V4H11V3.99L20 12.99L13 20.01ZM6.5 8C7.33 8 8 7.33 8 6.5C8 5.67 7.33 5 6.5 5C5.67 5 5 5.67 5 6.5C5 7.33 5.67 8 6.5 8Z" /></svg>
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3">Best Prices</h3>
                      <p className="text-gray-400 text-xs md:text-sm leading-relaxed">Compare and find the best membership plans that fit your budget.</p>
                    </div>
                  </div>
                  {/* Pricing Plans Graphic */}
                  <div className="flex-1 flex gap-2 md:gap-3 h-[180px] md:h-full items-end w-full md:pt-4">
                    {/* Basic */}
                    <div className="w-1/3 bg-[#111520] border border-gray-800 rounded-xl p-2.5 flex flex-col h-[70%] relative opacity-60">
                      <div className="text-[10px] text-gray-400 font-semibold mb-1">BASIC</div>
                      <div className="text-sm md:text-base text-white font-bold mb-2">₹999<span className="text-[8px] md:text-[10px] text-gray-500">/mo</span></div>
                      <div className="flex flex-col gap-1 mt-auto">
                        <div className="flex items-center gap-1"><svg className="w-2.5 h-2.5 text-[#FF7A00]" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg><span className="text-[8px] md:text-[9px] text-gray-400">Gym Access</span></div>
                        <div className="flex items-center gap-1"><svg className="w-2.5 h-2.5 text-[#FF7A00]" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg><span className="text-[8px] md:text-[9px] text-gray-400">Basic Equip.</span></div>
                      </div>
                    </div>
                    {/* Standard */}
                    <div className="w-1/3 bg-[#221A15] border border-[#FF7A00]/50 rounded-xl p-2.5 flex flex-col h-[85%] relative shadow-[0_0_20px_rgba(255,122,0,0.1)]">
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#FF7A00] text-black text-[7px] md:text-[8px] font-bold px-1.5 py-0.5 rounded-sm">POPULAR</div>
                      <div className="text-[10px] text-[#FF8C00] font-semibold mb-1 mt-1 md:mt-0">STANDARD</div>
                      <div className="text-base md:text-lg text-white font-bold mb-2">₹1499<span className="text-[8px] md:text-[10px] text-gray-500">/mo</span></div>
                      <div className="flex flex-col gap-1 mt-auto">
                        <div className="flex items-center gap-1"><svg className="w-2.5 h-2.5 text-[#FF7A00]" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg><span className="text-[8px] md:text-[9px] text-gray-300">Gym Access</span></div>
                        <div className="flex items-center gap-1"><svg className="w-2.5 h-2.5 text-[#FF7A00]" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg><span className="text-[8px] md:text-[9px] text-gray-300">Group Classes</span></div>
                        <div className="flex items-center gap-1"><svg className="w-2.5 h-2.5 text-[#FF7A00]" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg><span className="text-[8px] md:text-[9px] text-gray-300">Personal Train.</span></div>
                      </div>
                    </div>
                    {/* Premium */}
                    <div className="w-1/3 bg-[#111520] border border-gray-800 rounded-xl p-2.5 flex flex-col h-[70%] relative opacity-60">
                      <div className="text-[10px] text-gray-400 font-semibold mb-1">PREMIUM</div>
                      <div className="text-sm md:text-base text-white font-bold mb-2">₹2499<span className="text-[8px] md:text-[10px] text-gray-500">/mo</span></div>
                      <div className="flex flex-col gap-1 mt-auto">
                        <div className="flex items-center gap-1"><svg className="w-2.5 h-2.5 text-[#FF7A00]" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg><span className="text-[8px] md:text-[9px] text-gray-400">All Features</span></div>
                        <div className="flex items-center gap-1"><svg className="w-2.5 h-2.5 text-[#FF7A00]" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg><span className="text-[8px] md:text-[9px] text-gray-400">Nutrition Guide</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4: Top Facilities */}
              <div className="relative bg-[#000000] border border-gray-800 rounded-2xl overflow-hidden h-auto md:h-[280px] group flex flex-col justify-center p-6 md:p-8 hover:border-[#FF7A00]/50 transition-all duration-300">
                <div className="absolute inset-0 z-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#000000] via-[#000000]/90 to-transparent z-10"></div>
                  <img src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1470&auto=format&fit=crop" className="w-full h-full object-cover object-right opacity-30 group-hover:opacity-50 transition-opacity duration-500" alt="Top Facilities" />
                </div>
                <div className="relative z-20 flex gap-5 md:gap-6 items-start max-w-sm">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(255,122,0,0.15)]">
                    <svg className="w-6 h-6 md:w-8 md:h-8 text-[#FF7A00] drop-shadow-[0_0_10px_rgba(255,122,0,0.8)]" fill="currentColor" viewBox="0 0 24 24"><path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43-1.43-1.43L22 16.29z" /></svg>
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3">Top Facilities</h3>
                    <p className="text-gray-400 text-xs md:text-sm leading-relaxed">Access modern equipment and world-class fitness facilities.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
