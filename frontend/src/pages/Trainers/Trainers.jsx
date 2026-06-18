import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPublicTrainers } from "../../userServices/trainerApi";

const STATIC_TRAINERS = [
  {
    id: 1,
    name: "Rahul Sharma",
    speciality: "Strength & Muscle Gain Coach",
    experience: "5 Years",
    rating: 4.8,
    reviews: 120,
    price: 499,
    category: "Strength",
    clients: "250+",
    location: "Mumbai, India",
    languages: "English, Hindi",
    topRated: true,
    about:
      "I am a lean flex strength and conditioning coach with 5+ years of experience helping clients build muscle, improve endurance and achieve their fitness goals. My training focuses on progressive overload, correct form and confidence.",
    specializations: ["Muscle Gain", "Strength Training", "Bodybuilding", "Nutrition Planning"],
    availability: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    timeSlot: "6:00 AM - 10:00 PM",
    ratingBreakdown: [
      { stars: 5, pct: 72 },
      { stars: 4, pct: 18 },
      { stars: 3, pct: 6 },
      { stars: 2, pct: 2 },
      { stars: 1, pct: 2 },
    ],
    image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=500&fit=crop&crop=faces&q=85",
  },
  {
    id: 2,
    name: "Priya Mehta",
    speciality: "Weight Loss Specialist",
    experience: "4 Years",
    rating: 4.7,
    reviews: 98,
    price: 449,
    category: "Weight Loss",
    clients: "180+",
    location: "Pune, India",
    languages: "English, Hindi",
    topRated: false,
    about:
      "Priya is a certified personal trainer and nutritionist specializing in sustainable weight loss using HIIT, functional training, and evidence-based diet planning.",
    specializations: ["Fat Loss", "HIIT Training", "Nutrition Coaching", "Cardio Fitness"],
    availability: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    timeSlot: "7:00 AM - 9:00 PM",
    ratingBreakdown: [
      { stars: 5, pct: 65 },
      { stars: 4, pct: 22 },
      { stars: 3, pct: 8 },
      { stars: 2, pct: 3 },
      { stars: 1, pct: 2 },
    ],
    image: "https://images.unsplash.com/photo-1609899464726-209d02a9f8f7?w=400&h=500&fit=crop&crop=faces&q=85",
  },
  {
    id: 3,
    name: "Amit Verma",
    speciality: "CrossFit Coach",
    experience: "6 Years",
    rating: 4.9,
    reviews: 150,
    price: 599,
    category: "CrossFit",
    clients: "320+",
    location: "Delhi, India",
    languages: "English, Hindi",
    topRated: false,
    about:
      "Amit is a Level-2 CrossFit certified coach who helps everyday athletes build explosive power, endurance, and functional strength through dynamic programming.",
    specializations: ["CrossFit WODs", "Olympic Lifting", "Endurance", "Mobility & Recovery"],
    availability: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    timeSlot: "5:30 AM - 9:00 PM",
    ratingBreakdown: [
      { stars: 5, pct: 85 },
      { stars: 4, pct: 10 },
      { stars: 3, pct: 3 },
      { stars: 2, pct: 1 },
      { stars: 1, pct: 1 },
    ],
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=500&fit=crop&crop=faces&q=85",
  },
  {
    id: 4,
    name: "Neha Iyer",
    speciality: "Yoga & Wellness Coach",
    experience: "3 Years",
    rating: 4.6,
    reviews: 75,
    price: 399,
    category: "Yoga",
    clients: "120+",
    location: "Bangalore, India",
    languages: "English, Hindi",
    topRated: false,
    about:
      "Neha is a 500-hour certified yoga instructor who blends Hatha, Vinyasa, and restorative yoga to help clients reduce stress and enhance well-being.",
    specializations: ["Hatha Yoga", "Vinyasa Flow", "Meditation", "Stress Management"],
    availability: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    timeSlot: "6:00 AM - 8:00 PM",
    ratingBreakdown: [
      { stars: 5, pct: 60 },
      { stars: 4, pct: 25 },
      { stars: 3, pct: 10 },
      { stars: 2, pct: 3 },
      { stars: 1, pct: 2 },
    ],
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=500&fit=crop&crop=faces&q=85",
  },
];

const CLIENT_REVIEWS = [
  {
    id: 1,
    name: "Arun Singh",
    timeAgo: "2 weeks ago",
    rating: 5,
    text: "Rahul sir ki training se meri body completely transform ho gayi. 3 mahine mein 8 kg muscle gain hua. Best trainer ever!",
    initials: "AS",
    avatarBg: "bg-[#FF7A00]/10",
    avatarBorder: "border-[#FF7A00]/30",
    avatarText: "text-[#FF7A00]",
  },
  {
    id: 2,
    name: "Sneha Patil",
    timeAgo: "1 month ago",
    rating: 5,
    text: "Professional and very knowledgeable. The workouts are intense but very rewarding. Highly recommend this trainer to anyone serious about fitness.",
    initials: "SP",
    avatarBg: "bg-purple-500/10",
    avatarBorder: "border-purple-500/30",
    avatarText: "text-purple-400",
  },
  {
    id: 3,
    name: "Siddharth Rao",
    timeAgo: "3 weeks ago",
    rating: 5,
    text: "CrossFit sessions with Amit are incredibly rewarding. He scales perfectly for each level and explains the why behind every movement.",
    initials: "SR",
    avatarBg: "bg-orange-500/10",
    avatarBorder: "border-orange-500/30",
    avatarText: "text-orange-400",
  },
];

const CATEGORIES = ["All", "Personal Trainer", "Yoga", "Weight Loss", "Strength", "CrossFit"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/* ──────────────────────────────────────────────────
   SHARED STAR RATING
────────────────────────────────────────────────── */
function Stars({ count = 5, size = 12 }) {
  return (
    <div className="flex items-center gap-[2px]">
      {[...Array(5)].map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24">
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={i < Math.round(count) ? "#fbbf24" : "rgba(251,191,36,0.18)"}
            stroke={i < Math.round(count) ? "#fbbf24" : "rgba(251,191,36,0.2)"}
            strokeWidth="0.5"
          />
        </svg>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────
   HERO
────────────────────────────────────────────────── */
function Hero() {
  return (
    <section
      className="relative min-h-[70vh] flex items-center overflow-hidden pt-[68px]"
      style={{
        background:
          "linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 55%, rgba(0,0,0,0.3) 100%), url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80&fit=crop') center/cover no-repeat",
      }}
    >
      {/* Orange radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 65% 80% at 12% 50%, rgba(255,122,0,0.08) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 w-full max-w-[1300px] mx-auto px-10 grid grid-cols-2 items-center gap-8 min-h-[calc(70vh-68px)] py-16 max-lg:grid-cols-1 max-lg:text-center max-lg:py-14 max-md:px-5">

        {/* ── Left ── */}
        <div className="flex flex-col gap-4 max-lg:items-center">
          <p className="text-[0.72rem] font-bold tracking-[0.18em] uppercase text-[#FF7A00]">
            Our Trainers
          </p>

          <h1 className="leading-[1.03] font-black">
            <span className="block text-3xl font-extrabold text-white max-md:text-2xl">
              Find Your Perfect
            </span>
            <span
              className="block text-[5rem] font-black leading-tight max-lg:text-[3.5rem] max-md:text-[2.8rem]"
              style={{
                color: "#FF7A00",
                textShadow: "0 0 40px rgba(255,122,0,0.35)",
              }}
            >
              Fitness Coach
            </span>
          </h1>

          <p className="text-[0.95rem] text-white/60 leading-[1.7] max-w-[420px]">
            Certified trainers for weight loss, muscle gain, yoga and personal training.
          </p>
        </div>

        {/* ── Right ── */}
        <div className="flex justify-end items-center max-lg:justify-center">
          <div className="relative w-[370px] h-[470px] max-md:w-[270px] max-md:h-[340px]">
            <img
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=700&fit=crop&crop=top&q=85"
              alt="Fitness trainer"
              className="w-full h-full object-cover object-top rounded-[22px] border border-[#FF7A00]/18 shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_50px_rgba(255,122,0,0.07)]"
            />

            {/* Floating badge */}
            <div
              className="absolute -right-4 bottom-6 bg-[#0a0a0a]/95 border border-[#FF7A00]/25 rounded-2xl px-5 py-3 backdrop-blur-xl text-center shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_20px_rgba(255,122,0,0.1)]"
              style={{ animation: "floatY 3.5s ease-in-out infinite" }}
            >
              <span
                className="block text-[2.2rem] font-black leading-none"
                style={{ color: "#FF7A00", textShadow: "0 0 20px rgba(255,122,0,0.5)" }}
              >
                100+
              </span>
              <span className="block text-[0.68rem] font-semibold text-white/55 mt-0.5 leading-snug">
                Super Trainers
              </span>
            </div>

            <style>{`@keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────
   FILTER BAR
────────────────────────────────────────────────── */
function FilterBar({ active, setActive }) {
  return (
    <div className="bg-[#111] border-t border-b border-white/[0.07] px-10 py-3 max-md:px-4">
      <div className="max-w-[1300px] mx-auto flex items-center justify-between gap-4 flex-wrap">
        {/* Chips */}
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map((c) =>
            active === c ? (
              <button
                key={c}
                onClick={() => setActive(c)}
                className="px-4 py-1.5 rounded-full text-[0.75rem] font-extrabold bg-[#FF7A00] text-white border border-[#FF7A00] shadow-[0_0_14px_rgba(255,122,0,0.3)] whitespace-nowrap cursor-pointer"
              >
                {c}
              </button>
            ) : (
              <button
                key={c}
                onClick={() => setActive(c)}
                className="px-4 py-1.5 rounded-full text-[0.75rem] font-semibold text-white/60 border border-white/[0.07] bg-white/[0.04] hover:border-[#FF7A00]/25 hover:text-[#FF7A00] hover:bg-[#FF7A00]/08 transition-all whitespace-nowrap cursor-pointer"
              >
                {c}
              </button>
            )
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[0.75rem] text-white/35 whitespace-nowrap">Sort By:</span>
          <select
            defaultValue="popular"
            className="bg-white/[0.06] border border-white/[0.07] rounded-lg text-white text-[0.75rem] px-3 py-1.5 outline-none cursor-pointer focus:border-[#FF7A00]/25 appearance-none"
          >
            <option value="popular">Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="price-low">Price: Low → High</option>
            <option value="price-high">Price: High → Low</option>
          </select>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────
   TRAINER CARD
────────────────────────────────────────────────── */
function TrainerCard({ trainer, fav, onFav }) {
  const navigate = useNavigate();
  const trainerId = trainer._id || trainer.id;

  const handleViewProfile = (e) => {
    e.stopPropagation();
    navigate(`/trainer/${trainerId}`);
  };

  return (
    <div
      onClick={handleViewProfile}
      className={`
        relative bg-[rgba(18,18,18,0.92)] rounded-2xl overflow-hidden cursor-pointer
        border backdrop-blur-xl transition-all duration-300
        hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(255,122,0,0.08)]
        border-white/[0.07] hover:border-[#FF7A00]/25
      `}
    >
      {/* Image */}
      <div className="relative h-[200px] overflow-hidden">
        <img
          src={trainer.image}
          alt={trainer.name}
          loading="lazy"
          className="w-full h-full object-cover object-top transition-transform duration-400 group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0d0d0d]/98" />

        {/* Top Rated Badge */}
        {trainer.topRated && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FF7A00] text-white text-[0.6rem] font-extrabold uppercase tracking-wide shadow-[0_0_10px_rgba(255,122,0,0.4)]">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Top Rated
          </div>
        )}

        {/* Heart */}
        <button
          onClick={(e) => { e.stopPropagation(); onFav(trainerId); }}
          className={`
            absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center
            backdrop-blur-md border transition-all duration-200
            ${fav
              ? "border-red-500/50 bg-red-500/15 text-red-400"
              : "border-white/[0.07] bg-black/80 text-white/50 hover:border-red-500/40 hover:bg-red-500/10"
            }
          `}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="px-3.5 pt-3 pb-3.5">
        <div className="text-[1rem] font-bold text-white mb-0.5">{trainer.name}</div>
        <div className="text-[0.72rem] font-semibold text-[#FF7A00] mb-1.5">{trainer.speciality}</div>

        <div className="flex items-center gap-1.5 text-[0.68rem] text-white/35 mb-1.5">
          {trainer.experience} Exp
          <span className="w-[3px] h-[3px] rounded-full bg-white/30" />
          {trainer.clients} Clients
        </div>

        <div className="flex items-center gap-1 mb-1.5">
          <Stars count={typeof trainer.rating === 'object' ? (trainer.rating?.average || 0) : (trainer.rating || 0)} size={11} />
          <span className="text-[0.75rem] font-bold text-white ml-1">{typeof trainer.rating === 'object' ? (trainer.rating?.average || 0) : (trainer.rating || 0)}</span>
          <span className="text-[0.65rem] text-white/30 ml-0.5">({trainer.rating?.count || trainer.reviews || 0})</span>
        </div>

        <div className="flex items-baseline gap-1 mb-2.5">
          <span
            className="text-[1.1rem] font-extrabold"
            style={{ color: "#FF7A00", textShadow: "0 0 10px rgba(255,122,0,0.3)" }}
          >
            ₹{trainer.pricePerSession || trainer.price || 0}
          </span>
          <span className="text-[0.65rem] text-white/30">/session</span>
        </div>

        <button
          onClick={handleViewProfile}
          className="w-full py-2 rounded-xl border border-[#FF7A00]/25 text-[#FF7A00] text-[0.75rem] font-bold hover:bg-[#FF7A00] hover:text-white hover:shadow-[0_0_16px_rgba(255,122,0,0.3)] transition-all duration-200"
        >
          View Profile
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────
   TRAINER DETAIL
────────────────────────────────────────────────── */
function TrainerDetail({ trainer, onBack }) {
  const imageSrc = trainer.photo || trainer.profilePhoto || trainer.image || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=500&fit=crop&crop=faces&q=85";
  const specLabel = trainer.speciality || (trainer.specializations && trainer.specializations.length > 0 ? trainer.specializations.join(', ') : 'Fitness Coach');
  const ratingValue = trainer.rating?.average || trainer.rating || 0;
  const reviewsCount = trainer.reviews || 0;
  const expText = typeof trainer.experience === 'number' ? `${trainer.experience} Years` : (trainer.experience || 'Not specified');
  const clientsText = trainer.clients || `${trainer.clientCount || 0}+`;
  const locationText = trainer.city || trainer.location || 'India';
  const priceVal = trainer.pricePerSession || trainer.price || 0;
  const languagesText = Array.isArray(trainer.languages) ? trainer.languages.join(', ') : (trainer.languages || 'English, Hindi');
  const bioText = trainer.bio || trainer.about || 'Certified professional trainer helping clients reach their fitness goals.';
  
  const availabilityDays = Array.isArray(trainer.availability) 
    ? trainer.availability 
    : (trainer.availability?.days || []);
    
  const timeSlotsText = trainer.timeSlot || (trainer.availability?.timeSlots && trainer.availability.timeSlots.length > 0 ? trainer.availability.timeSlots.join(', ') : 'Not specified');

  return (
    <div className="max-w-[1300px] mx-auto px-10 pb-8 max-md:px-4">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[0.78rem] font-medium text-white/35 hover:text-[#FF7A00] transition-colors mb-5 bg-transparent border-0 p-0 cursor-pointer"
      >
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Trainers
      </button>

      <div className="grid grid-cols-[300px_1fr] gap-8 items-start max-lg:grid-cols-1">

        {/* ──── LEFT PANEL ──── */}
        <div className="flex flex-col gap-4 sticky top-20 max-lg:static max-lg:grid max-lg:grid-cols-2 max-md:grid-cols-1">

          {/* Trainer Image */}
          <div className="relative rounded-[18px] overflow-hidden h-[320px] border border-[#FF7A00]/20 shadow-[0_0_30px_rgba(255,122,0,0.07)]">
            <img
              src={imageSrc}
              alt={trainer.name}
              className="w-full h-full object-cover object-top"
            />
            {/* Rating pill */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-black/88 border border-yellow-400/35 rounded-full backdrop-blur-md text-yellow-400 text-[0.8rem] font-bold">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#fbbf24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {ratingValue}
            </div>
          </div>

          {/* Book Card */}
          <div className="bg-[rgba(22,22,22,0.82)] border border-[#FF7A00]/22 rounded-2xl p-5 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.4),0_0_15px_rgba(255,122,0,0.05)]">
            <div className="text-[0.82rem] font-bold text-white mb-0.5">Book a Session</div>
            <div className="flex items-baseline gap-1 mb-4">
              <span
                className="text-[2rem] font-black"
                style={{ color: "#FF7A00", textShadow: "0 0 16px rgba(255,122,0,0.4)" }}
              >
                ₹{priceVal}
              </span>
              <span className="text-[0.78rem] text-white/35">/session</span>
            </div>
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#FF7A00] to-[#E66E00] hover:to-[#FF7A00] text-white font-extrabold text-[0.88rem] rounded-xl border-0 cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_0_32px_rgba(255,122,0,0.35),0_6px_16px_rgba(255,122,0,0.2)] transition-all duration-250 shadow-[0_0_20px_rgba(255,122,0,0.25)]">
              Book Now
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>

        {/* ──── RIGHT PANEL ──── */}
        <div className="flex flex-col gap-5">

          {/* Header */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-[2rem] font-black text-white leading-tight mb-1.5 max-md:text-[1.6rem]">
                {trainer.name}
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 border border-green-500/28 rounded-full text-green-400 text-[0.7rem] font-semibold mb-1.5">
                <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
                </svg>
                Verified Trainer
              </span>
              <div className="text-[0.88rem] font-semibold text-[#FF7A00]">{specLabel}</div>
            </div>
            <div className="text-right">
              <Stars count={ratingValue} size={14} />
              <div className="text-[0.78rem] font-bold text-yellow-400 mt-1">{ratingValue} · {reviewsCount} Reviews</div>
            </div>
          </div>

          {/* Stats Pills */}
          <div className="flex gap-3 flex-wrap">
            {[
              {
                icon: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                val: expText, key: "Experience",
              },
              {
                icon: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
                val: clientsText, key: "Trained",
              },
              {
                icon: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
                val: locationText, key: "Location",
              },
              {
                icon: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>,
                val: languagesText, key: "Languages",
              },
            ].map((s) => (
              <div
                key={s.key}
                className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] rounded-xl px-3.5 py-2.5 flex-1 min-w-[130px] hover:border-[#FF7A00]/22 transition-colors"
              >
                <div className="w-8 h-8 rounded-[9px] bg-[#FF7A00]/08 flex items-center justify-center text-[#FF7A00] shrink-0">
                  {s.icon}
                </div>
                <div>
                  <span className="block text-[0.78rem] font-bold text-white leading-snug">{s.val}</span>
                  <span className="block text-[0.62rem] text-white/35">{s.key}</span>
                </div>
              </div>
            ))}
          </div>

          {/* About Me */}
          <div>
            <SectionLabel>About Me</SectionLabel>
            <p className="text-[0.85rem] text-white/60 leading-[1.78]">{bioText}</p>
          </div>

          {/* Specializations */}
          <div>
            <SectionLabel>Specializations</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {trainer.specializations && trainer.specializations.length > 0 ? (
                trainer.specializations.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 bg-[#FF7A00]/08 border border-[#FF7A00]/22 rounded-full text-[0.7rem] font-semibold text-[#FF7A00]"
                  >
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-white/45 text-xs">None listed</span>
              )}
            </div>
          </div>

          {/* Availability */}
          <div>
            <SectionLabel>Availability</SectionLabel>
            <div className="flex gap-1.5 flex-wrap mb-2">
              {DAYS.map((day) => {
                const on = availabilityDays.includes(day);
                return (
                  <div
                    key={day}
                    className={`flex flex-col items-center gap-1 px-2.5 py-2 rounded-xl border min-w-[44px] transition-colors ${
                      on
                        ? "border-[#FF7A00]/25 bg-[#FF7A00]/08"
                        : "border-white/[0.07] bg-white/[0.03]"
                    }`}
                  >
                    <span className={`text-[0.6rem] font-bold uppercase tracking-wide ${on ? "text-[#FF7A00]" : "text-white/30"}`}>
                      {day}
                    </span>
                    {on ? (
                      <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#FF7A00">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-[9px] text-white/25">—</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-1.5 text-[0.78rem] text-white/55">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#FF7A00">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {timeSlotsText}
            </div>
          </div>

          {/* Ratings Box */}
          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            <div>
              <SectionLabel>Ratings & Reviews</SectionLabel>
              <div className="bg-[rgba(22,22,22,0.82)] border border-white/[0.07] rounded-2xl p-4 backdrop-blur-md">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-[3rem] font-black text-white leading-none">{ratingValue}</span>
                  <div className="flex flex-col gap-1">
                    <Stars count={ratingValue} size={13} />
                    <span className="text-[0.68rem] text-white/35">{reviewsCount} Reviews</span>
                  </div>
                </div>
                {[
                  { stars: 5, pct: ratingValue >= 4.5 ? 90 : 20 },
                  { stars: 4, pct: ratingValue >= 3.5 && ratingValue < 4.5 ? 80 : 10 },
                  { stars: 3, pct: ratingValue >= 2.5 && ratingValue < 3.5 ? 70 : 5 },
                  { stars: 2, pct: ratingValue >= 1.5 && ratingValue < 2.5 ? 60 : 0 },
                  { stars: 1, pct: ratingValue < 1.5 && ratingValue > 0 ? 50 : 0 }
                ].map((r) => (
                  <div key={r.stars} className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[0.65rem] text-white/35 w-2.5 text-right shrink-0">{r.stars}</span>
                    <div className="flex-1 h-[5px] bg-white/[0.07] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${r.pct}%`,
                          background: "linear-gradient(90deg, #E66E00, #FF7A00)",
                          boxShadow: "0 0 5px rgba(255,122,0,0.3)",
                        }}
                      />
                    </div>
                    <span className="text-[0.62rem] text-white/30 w-6 text-right shrink-0">{r.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div /> {/* spacer */}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────
   SECTION LABEL (helper)
────────────────────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 text-[0.78rem] font-bold text-white uppercase tracking-widest mb-2.5">
      <span
        className="inline-block w-[3px] h-[14px] rounded-sm shrink-0"
        style={{ background: "#FF7A00", boxShadow: "0 0 6px rgba(255,122,0,0.5)" }}
      />
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────────
   CLIENT REVIEWS
────────────────────────────────────────────────── */
function ClientReviews() {
  return (
    <div className="max-w-[1300px] mx-auto px-10 pb-10 max-md:px-4">
      <div className="flex items-baseline justify-between mb-4">
        <div className="text-[1.05rem] font-extrabold text-white">What Clients Say</div>
        <button className="flex items-center gap-1 text-[0.75rem] font-semibold text-[#FF7A00] bg-transparent border-0 p-0 cursor-pointer hover:opacity-70 transition-opacity">
          View All Reviews
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-1">
        {CLIENT_REVIEWS.map((r) => (
          <div
            key={r.id}
            className="bg-[rgba(18,18,18,0.92)] border border-white/[0.07] rounded-2xl p-4 backdrop-blur-xl hover:border-[#FF7A00]/22 hover:-translate-y-1 transition-all duration-250"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-[0.85rem] border-2 shrink-0 ${r.avatarBg} ${r.avatarBorder} ${r.avatarText}`}
                >
                  {r.initials}
                </div>
                <div>
                  <div className="text-[0.85rem] font-bold text-white">{r.name}</div>
                  <div className="text-[0.65rem] text-white/30 mt-0.5">{r.timeAgo}</div>
                </div>
              </div>
              <Stars count={r.rating} size={11} />
            </div>
            <p className="text-[0.8rem] text-white/55 leading-[1.7]">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────
   MAIN PAGE
────────────────────────────────────────────────── */
const Trainers = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [favs, setFavs] = useState(new Set());

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        setLoading(true);
        const res = await getPublicTrainers();
        if (res.success) {
          setTrainers(res.trainers || []);
          if (res.trainers && res.trainers.length > 0) {
            setSelectedTrainer(res.trainers[0]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch trainers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrainers();
  }, []);

  const filtered = trainers.filter((t) => {
    if (activeFilter === "All") return true;
    
    const specs = (t.specializations || []).map(s => s.toLowerCase());
    const filterLower = activeFilter.toLowerCase();
    
    if (activeFilter === "Personal Trainer") {
      const types = (t.trainingTypes || []).map(ty => ty.toLowerCase());
      return types.includes("personal training") || (t.category && t.category.toLowerCase() === "personal trainer");
    }
    
    return specs.includes(filterLower) || 
           (t.category && t.category.toLowerCase() === filterLower) ||
           (filterLower === "strength" && specs.some(s => s.includes("strength") || s.includes("weight"))) ||
           (filterLower === "weight loss" && specs.some(s => s.includes("loss") || s.includes("fat")));
  });

  const toggleFav = (id) => {
    setFavs((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const handleSelect = (trainer) => {
    const trainerId = trainer._id || trainer.id;
    setSelectedTrainer((prev) => ((prev?._id || prev?.id) === trainerId ? null : trainer));
    setTimeout(() => {
      document.getElementById("detail-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white font-['Inter',sans-serif] overflow-x-hidden">

      {/* HERO */}
      <Hero />

      {/* FILTER */}
      <FilterBar active={activeFilter} setActive={setActiveFilter} />

      {/* CARDS GRID */}
      <div className="max-w-[1300px] mx-auto px-10 py-6 max-md:px-4">
        {loading ? (
          <div className="text-center py-12 text-white/50">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7A00]" />
            <p className="mt-2 text-sm">Loading active trainers...</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1">
            {filtered.map((t) => {
              const tid = t._id || t.id;
              return (
                <TrainerCard
                  key={tid}
                  trainer={t}
                  fav={favs.has(tid)}
                  onFav={toggleFav}
                />
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-4 text-center py-12 text-white/35 text-[0.95rem]">
                No trainers found for this category.
              </div>
            )}
          </div>
        )}
      </div>

      {/* REVIEWS */}
      <ClientReviews />
    </div>
  );
};

export default Trainers;

