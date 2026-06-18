import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../userServices/Auth";
import toast from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

const UserLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      if (res.success) {
        toast.success(res.message || "Logged in successfully!");
        localStorage.setItem("userToken", res.data.token);
        localStorage.setItem("userRole", res.data.user.role);
        localStorage.setItem("userName", res.data.user.name);
        window.dispatchEvent(new Event("storage"));
        setTimeout(() => navigate("/profile"), 1500);
      } else {
        toast.error(res.message || "Login failed");
      }
    } catch (err) {
      toast.error(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-stretch overflow-hidden">

      {/* ── Full-screen background image ── */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=90&fit=crop')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 z-10 bg-black/65" />
      {/* Orange radial glow */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 10% 90%, rgba(234,88,12,0.18) 0%, transparent 60%)",
        }}
      />

      {/* ── Left panel — branding ── */}
      <div className="relative z-20 hidden lg:flex flex-col justify-between flex-1 p-14 max-w-[55%]">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          </div>
          <span className="text-white font-black text-xl tracking-tight">
            Find<span className="text-orange-400">Gym</span>
          </span>
        </div>

        {/* Hero text */}
        <div className="mb-10">
          <p className="text-orange-400 text-xs font-bold tracking-[0.2em] uppercase mb-4">
            Your Fitness Destination
          </p>
          <h1 className="text-[3.2rem] font-black text-white leading-[1.08] mb-5">
            Transform Your<br />
            <span style={{ color: "#FF7A00", textShadow: "0 0 40px rgba(255,122,0,0.4)" }}>
              Fitness Journey
            </span>
          </h1>
          <p className="text-white/55 text-[1rem] leading-[1.7] max-w-[380px]">
            Discover top gyms, certified trainers, and fitness centers near you — all in one place.
          </p>

          {/* Feature pills */}
          <div className="flex flex-col gap-3 mt-10">
            {[
              { icon: "🏋️", text: "500+ Verified Gyms across India" },
              { icon: "👨‍🏫", text: "Certified Personal Trainers" },
              { icon: "📍", text: "Find gyms near your location" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <span className="text-lg">{f.icon}</span>
                <span className="text-white/60 text-sm font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — Login form ── */}
      <div className="relative z-20 flex items-center justify-center w-full lg:w-auto lg:min-w-[420px] lg:max-w-[480px] px-6 py-12 lg:px-12 lg:bg-black/40 lg:backdrop-blur-2xl lg:border-l lg:border-white/[0.08]">
        <div className="w-full max-w-[380px]">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            </div>
            <span className="text-white font-black text-lg">
              Find<span className="text-orange-400">Gym</span>
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-[1.9rem] font-black text-white leading-tight mb-1.5">
              Welcome back
            </h2>
            <p className="text-white/45 text-sm">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[0.72rem] font-bold text-white/50 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 w-[17px] h-[17px]" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/[0.07] border border-white/[0.1] text-white placeholder-white/25 rounded-xl text-sm focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[0.72rem] font-bold text-white/50 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 w-[17px] h-[17px]" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 bg-white/[0.07] border border-white/[0.1] text-white placeholder-white/25 rounded-xl text-sm focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between text-[0.78rem]">
              <label className="flex items-center gap-2 text-white/40 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 accent-orange-500 rounded"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-orange-400 hover:text-orange-300 transition-colors font-medium">
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 py-3.5 rounded-xl font-extrabold text-sm text-white transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
              style={{
                background: loading
                  ? "#555"
                  : "linear-gradient(135deg, #FF7A00 0%, #E66E00 100%)",
                boxShadow: loading ? "none" : "0 0 28px rgba(255,122,0,0.35)",
              }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-[0.8rem] text-white/35 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
              Register here
            </Link>
          </p>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/[0.07]" />
            <span className="text-white/20 text-xs">or</span>
            <div className="flex-1 h-px bg-white/[0.07]" />
          </div>

          {/* Back to home */}
          <Link
            to="/"
            className="flex items-center justify-center gap-1.5 text-[0.78rem] text-white/30 hover:text-white/60 transition-colors"
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Find Gym
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
