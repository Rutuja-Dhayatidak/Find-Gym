import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserProfile, updateUserProfile } from "../userServices/Auth";
import { getUserOrders } from "../userServices/publicHealthStoreApi";
import toast from "react-hot-toast";
import { X, Camera, User, Phone, Ruler, Scale, MapPin, Target } from "lucide-react";

const UserProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    fitnessGoal: "",
    location: "",
    city: "",
    profilePhoto: null
  });
  const [editPhotoPreview, setEditPhotoPreview] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("userToken");
        if (!token) {
          toast.error("Please login to view profile");
          navigate("/login");
          return;
        }
        const res = await getUserProfile();
        if (res.success) {
          setProfileData(res.data);
          // Fetch orders
          try {
            const ordersRes = await getUserOrders();
            if (ordersRes.success) {
              setOrders(ordersRes.data || []);
            }
          } catch (oErr) {
            console.error("Error loading orders:", oErr);
          }
          // Fetch user memberships
          try {
            const api = (await import('../userServices/api')).default;
            const memRes = await api.get('/memberships/my');
            if (memRes.data?.success) {
              setMemberships(memRes.data.data || []);
            }
          } catch (mErr) {
            console.error("Error loading memberships:", mErr);
          }
        } else {
          toast.error("Failed to load profile details");
          navigate("/login");
        }
      } catch (err) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("userToken");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userName");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    if (!loading && window.location.hash === '#orders') {
      setTimeout(() => {
        const element = document.getElementById('orders-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 200);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#FF7A00] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return null;
  }

  // Calculate profile completion percentage
  const fields = ['name', 'email', 'phone', 'gender', 'age', 'height', 'weight', 'fitnessGoal', 'location', 'city', 'profilePhoto'];
  const filledCount = fields.filter(field => profileData[field]).length;
  const completion = Math.round((filledCount / fields.length) * 100);

  const user = {
    fullName: profileData.name,
    email: profileData.email,
    phone: profileData.phone || "Not provided",
    gender: profileData.gender ? (profileData.gender.charAt(0).toUpperCase() + profileData.gender.slice(1)) : "Not provided",
    memberSince: profileData.joinDate ? new Date(profileData.joinDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A",
    location: `${profileData.city || ""}${profileData.city && profileData.location ? ", " : ""}${profileData.location || ""}` || "Not provided",
    profilePhoto: profileData.profilePhoto || "https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=300&auto=format&fit=crop",
    completion: completion,
    membership: profileData.membership || {
      gymName: "No Active Membership",
      plan: "Explore gyms near you and subscribe to a plan!",
      expiryDate: "N/A",
      status: "Inactive"
    },
    stats: [
      { id: 1, label: "Workouts", value: "0", icon: "🔥" },
      { id: 2, label: "Hours Active", value: "0 hrs", icon: "⏰" },
      { id: 3, label: "Kcal Burned", value: "0", icon: "⚡" },
      { id: 4, label: "Bookings", value: "0", icon: "📅" }
    ],
    healthBadges: [
      { id: 1, label: "Height & Weight", value: `${profileData.height || "—"} cm / ${profileData.weight || "—"} kg`, icon: "🧍" },
      { id: 2, label: "Fitness Goal", value: profileData.fitnessGoal === "weightLoss" ? "Weight Loss" : profileData.fitnessGoal === "muscle" ? "Build Muscle" : profileData.fitnessGoal === "general" ? "General Fitness" : profileData.fitnessGoal === "flexibility" ? "Flexibility" : "Not specified", icon: "🎯" },
      { id: 3, label: "Age", value: profileData.age ? `${profileData.age} years` : "—", icon: "🎂" },
      { id: 4, label: "Preferred Workout", value: "Strength Training", icon: "🏋️" }
    ],
    bookings: [],
    savedGyms: []
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  const renderTrackingTimeline = (status) => {
    if (['Cancelled', 'Refunded'].includes(status)) {
      return (
        <div className="flex items-center gap-2 text-red-500 bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-xl text-xs font-semibold">
          <span>❌</span> Order status: {status}
        </div>
      );
    }

    const steps = [
      { label: 'Placed', statusKey: 'Pending' },
      { label: 'Packed', statusKey: 'Packed' },
      { label: 'Shipped', statusKey: 'Shipped' },
      { label: 'Delivered', statusKey: 'Delivered' }
    ];

    let currentIndex = 0;
    if (status === 'Confirmed' || status === 'Pending') currentIndex = 0;
    else if (status === 'Packed') currentIndex = 1;
    else if (status === 'Shipped') currentIndex = 2;
    else if (status === 'Delivered') currentIndex = 3;

    return (
      <div className="w-full mt-4 bg-[#070708] border border-white/5 rounded-2xl p-4">
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-4">Order Tracking Timeline</p>
        <div className="flex items-center justify-between relative px-2">
          {/* Progress line connector */}
          <div className="absolute left-6 right-6 top-[15px] h-[2px] bg-white/10 z-0">
            <div 
              className="h-full bg-gradient-to-r from-[#FF7A00] to-orange-400 transition-all duration-500"
              style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {/* Steps rendering */}
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentIndex;
            return (
              <div key={idx} className="flex flex-col items-center relative z-10">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center border font-bold text-xs transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-[#FF7A00] border-[#FF7A00] text-white shadow-[0_0_10px_rgba(255,122,0,0.4)]' 
                      : 'bg-[#111112] border-white/10 text-gray-500'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span className={`text-[9px] font-bold mt-2 ${isCompleted ? 'text-white' : 'text-gray-500'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Modal handlers
  const handleOpenEditModal = () => {
    setEditForm({
      name: profileData.name || "",
      phone: profileData.phone || "",
      age: profileData.age || "",
      gender: profileData.gender || "",
      height: profileData.height || "",
      weight: profileData.weight || "",
      fitnessGoal: profileData.fitnessGoal || "",
      location: profileData.location || "",
      city: profileData.city || "",
      profilePhoto: null
    });
    setEditPhotoPreview(profileData.profilePhoto || null);
    setIsEditModalOpen(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditForm(prev => ({ ...prev, profilePhoto: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const data = new FormData();
      data.append('name', editForm.name);
      data.append('phone', editForm.phone);
      data.append('age', editForm.age);
      data.append('gender', editForm.gender);
      data.append('height', editForm.height);
      data.append('weight', editForm.weight);
      data.append('fitnessGoal', editForm.fitnessGoal);
      data.append('location', editForm.location);
      data.append('city', editForm.city);
      if (editForm.profilePhoto) {
        data.append('profilePhoto', editForm.profilePhoto);
      }

      const res = await updateUserProfile(data);
      if (res.success) {
        toast.success("Profile updated successfully!");
        setProfileData(res.data);
        setIsEditModalOpen(false);
      } else {
        toast.error(res.message || "Failed to update profile");
      }
    } catch (err) {
      toast.error(err.message || "Error updating profile details.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="pt-24 pb-12 min-h-screen bg-[#070708] text-white px-4 md:px-8 max-w-7xl mx-auto font-sans">
      
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            My <span className="text-[#FF7A00]">Profile</span>
          </h1>
          <p className="text-gray-400 text-xs mt-1">Manage your health stats, goals, and active memberships.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleOpenEditModal}
            className="px-4 py-2 border border-[#FF7A00] text-[#FF7A00] hover:bg-[#FF7A00]/10 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            ✏️ Edit Profile
          </button>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.2)]"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Sidebar Panel (4 columns) */}
        <div className="lg:col-span-3 lg:sticky lg:top-28 bg-[#111112] border border-white/5 rounded-3xl p-6 flex flex-col items-center relative overflow-hidden shadow-xl">
          {/* Avatar Area */}
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FF7A00] to-orange-400 p-[1px] blur-[3px]" />
            <img 
              src={user.profilePhoto} 
              alt={user.fullName} 
              className="relative w-28 h-28 object-cover rounded-full border-2 border-[#FF7A00] shadow-[0_0_15px_rgba(255,122,0,0.3)]"
            />
          </div>

          <h2 className="text-xl font-bold text-white text-center">{user.fullName}</h2>
          
          {/* Badge */}
          <div className="mt-1.5 px-3 py-1 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/30 text-[#FF7A00] text-[10px] font-bold tracking-wide flex items-center gap-1">
            🏆 Fitness Enthusiast
          </div>

          <p className="text-xs text-gray-400 mt-3 flex items-center gap-1 text-center justify-center">
            <span className="text-[#FF3B30]">📍</span> {user.location}
          </p>

          <div className="w-full border-t border-white/5 my-5" />

          {/* User Details Details Rows */}
          <div className="w-full space-y-4 text-xs text-gray-300">
            <div className="flex items-center gap-3">
              <span className="text-gray-500 w-5">✉️</span>
              <div className="flex-grow">
                <p className="text-[10px] text-gray-500 uppercase">Email</p>
                <p className="font-semibold text-white truncate max-w-[170px]">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-500 w-5">📞</span>
              <div className="flex-grow">
                <p className="text-[10px] text-gray-500 uppercase">Phone</p>
                <p className="font-semibold text-white">{user.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-500 w-5">👤</span>
              <div className="flex-grow">
                <p className="text-[10px] text-gray-500 uppercase">Gender</p>
                <p className="font-semibold text-white">{user.gender}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-500 w-5">📅</span>
              <div className="flex-grow">
                <p className="text-[10px] text-gray-500 uppercase">Member Since</p>
                <p className="font-semibold text-white">{user.memberSince}</p>
              </div>
            </div>
          </div>

          <div className="w-full border-t border-white/5 my-5" />

          {/* Profile Completion Bar */}
          <div className="w-full">
            <div className="flex justify-between items-center text-xs font-bold mb-2">
              <span className="text-gray-300">Profile Completion</span>
              <span className="text-[#FF7A00]">{user.completion}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
              <div 
                className="h-full bg-gradient-to-r from-[#FF7A00] to-orange-400 rounded-full"
                style={{ width: `${user.completion}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-500 leading-relaxed mb-4">
              {user.completion < 100 
                ? "Complete your profile details to hit 100% and get better recommendations." 
                : "Your profile is fully completed! Enjoy customized gym recommendations."}
            </p>
            <button className="w-full py-2.5 border border-[#FF7A00]/40 text-[#FF7A00] hover:bg-[#FF7A00]/5 hover:border-[#FF7A00] rounded-xl text-xs font-bold transition-all cursor-pointer">
              Update Goals
            </button>
            <button 
              onClick={handleLogout}
              className="w-full mt-3 py-2.5 bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Right Panel Content (9 columns) */}
        <div className="lg:col-span-9 flex flex-col gap-6">

          {/* Membership Cards */}
          {memberships.length === 0 ? (
            <div className="bg-gradient-to-br from-[#2b1b11] via-[#16120e] to-[#0d0b0a] border border-[#FF7A00]/20 rounded-3xl p-6 relative overflow-hidden shadow-xl">
              <div className="absolute right-6 bottom-4 text-white/[0.02] text-9xl font-black select-none pointer-events-none">👑</div>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <span className="text-3xl bg-[#FF7A00]/10 w-12 h-12 rounded-xl flex items-center justify-center border border-[#FF7A00]/20">👑</span>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Membership Details</p>
                    <h3 className="text-xl font-black text-white mt-0.5">No Active Membership</h3>
                    <p className="text-xs text-[#FF7A00] font-bold mt-0.5">Explore gyms near you and subscribe to a plan!</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-gray-400">Inactive</span>
              </div>
              <div className="w-full border-t border-white/5 my-5" />
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-400 flex items-center gap-1.5"><span>📅</span> Valid till: <strong className="text-white font-semibold">N/A</strong></p>
                <Link to="/gyms" className="px-4 py-2 bg-[#FF7A00] hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer">Find Gyms &rarr;</Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {memberships.map((mem) => {
                const isActive = mem.status === 'active';
                const isExpired = mem.status === 'expired';
                const endDate = mem.endDate ? new Date(mem.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
                const startDate = mem.startDate ? new Date(mem.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
                return (
                  <div key={mem._id} className="bg-gradient-to-br from-[#2b1b11] via-[#16120e] to-[#0d0b0a] border border-[#FF7A00]/20 rounded-3xl p-6 relative overflow-hidden shadow-xl">
                    <div className="absolute right-6 bottom-4 text-white/[0.02] text-9xl font-black select-none pointer-events-none">👑</div>
                    {/* Header row */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl bg-[#FF7A00]/10 w-12 h-12 rounded-xl flex items-center justify-center border border-[#FF7A00]/20">👑</span>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Membership Details</p>
                          <h3 className="text-xl font-black text-white mt-0.5">{mem.gymName}</h3>
                          <p className="text-xs text-[#FF7A00] font-bold mt-0.5">{mem.planTitle} · {mem.duration}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isActive ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                        : isExpired ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                        : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                      }`}>
                        {isActive ? 'Active' : isExpired ? 'Expired' : 'Pending'}
                      </span>
                    </div>

                    <div className="w-full border-t border-white/5 my-4" />

                    {/* Info grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Start Date</p>
                        <p className="text-xs text-white font-semibold mt-0.5">{startDate}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Valid Till</p>
                        <p className={`text-xs font-semibold mt-0.5 ${isExpired ? 'text-red-400' : 'text-white'}`}>{endDate}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Amount Paid</p>
                        <p className="text-xs text-[#FF7A00] font-bold mt-0.5">₹{mem.pricePaid?.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Invoice</p>
                        <p className="text-xs text-white font-semibold mt-0.5 truncate">{mem.invoiceNumber || '—'}</p>
                      </div>
                    </div>

                    {/* Location */}
                    {mem.gymCity && (
                      <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">📍 {mem.gymAddress}, {mem.gymCity}</p>
                    )}

                    {/* Facilities */}
                    {mem.facilitiesIncluded?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {mem.facilitiesIncluded.map((f, i) => (
                          <span key={i} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[10px] text-gray-300 font-medium">✓ {f}</span>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-end">
                      {isActive ? (
                        <span className="px-4 py-2 border border-[#FF7A00]/30 text-[#FF7A00] text-xs font-bold rounded-xl">🏋️ Membership Active</span>
                      ) : (
                        <Link to="/gyms" className="px-4 py-2 bg-[#FF7A00] hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all">Renew / Find Gyms &rarr;</Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Orders Link Info / Button */}
          <div className="bg-[#111112] border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="font-black text-sm text-white flex items-center gap-2">📦 My Orders & Tracking</h3>
              <p className="text-xs text-gray-400 mt-1">Manage and track your supplements and diet plans orders.</p>
            </div>
            <Link to="/orders" className="px-5 py-2.5 bg-[#FF7A00] hover:bg-orange-650 text-white font-bold text-xs rounded-xl transition-all tracking-wider shrink-0 cursor-pointer">
              View Order History &rarr;
            </Link>
          </div>



        </div>

      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-y-auto">
          <div className="bg-[#111112] border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative my-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="absolute right-5 top-5 text-zinc-400 hover:text-white transition-colors cursor-pointer border-0 bg-transparent outline-none"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-white">
                Edit <span className="text-[#FF7A00]">Profile Details</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">Update your basic info, coordinates and health goals.</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Profile Image Uploader */}
              <div className="flex flex-col items-center justify-center py-4 bg-black/40 border border-white/5 rounded-2xl gap-2">
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className="group relative w-24 h-24 rounded-full overflow-hidden border-2 border-[#FF7A00] cursor-pointer shadow-lg transition-transform hover:scale-105"
                >
                  <img 
                    src={editPhotoPreview || "https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=300&auto=format&fit=crop"} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-5 h-5 text-white mb-0.5" />
                    <span className="text-[9px] text-white font-bold uppercase tracking-wider">Upload</span>
                  </div>
                </div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Click avatar to select new photo</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleEditPhotoUpload}
                  className="hidden"
                />
              </div>

              {/* Grid 1: Name and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Full Name</label>
                  <div className="flex items-center gap-2 border border-white/10 rounded-xl bg-black/40 focus-within:border-[#FF7A00] focus-within:ring-1 focus-within:ring-[#FF7A00] px-3.5 py-3 transition-all">
                    <User className="w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleEditInputChange}
                      placeholder="Enter full name"
                      className="bg-transparent border-0 outline-none w-full text-sm text-white placeholder-zinc-650"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Phone Number</label>
                  <div className="flex items-center gap-2 border border-white/10 rounded-xl bg-black/40 focus-within:border-[#FF7A00] focus-within:ring-1 focus-within:ring-[#FF7A00] px-3.5 py-3 transition-all">
                    <Phone className="w-4 h-4 text-zinc-500" />
                    <input
                      type="tel"
                      name="phone"
                      value={editForm.phone}
                      onChange={handleEditInputChange}
                      placeholder="e.g. +919876543210"
                      className="bg-transparent border-0 outline-none w-full text-sm text-white placeholder-zinc-650"
                    />
                  </div>
                </div>
              </div>

              {/* Grid 2: Age, Gender, Height, Weight */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Age</label>
                  <div className="flex items-center gap-2 border border-white/10 rounded-xl bg-black/40 focus-within:border-[#FF7A00] focus-within:ring-1 focus-within:ring-[#FF7A00] px-3.5 py-3 transition-all">
                    <input
                      type="number"
                      name="age"
                      value={editForm.age}
                      onChange={handleEditInputChange}
                      placeholder="Age"
                      className="bg-transparent border-0 outline-none w-full text-sm text-white placeholder-zinc-650"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Gender</label>
                  <div className="flex items-center gap-2 border border-white/10 rounded-xl bg-black/40 focus-within:border-[#FF7A00] focus-within:ring-1 focus-within:ring-[#FF7A00] px-3.5 py-3 transition-all">
                    <select
                      name="gender"
                      value={editForm.gender}
                      onChange={handleEditInputChange}
                      className="bg-transparent border-0 outline-none w-full text-sm text-white focus:bg-[#111112] [&>option]:bg-[#111112] cursor-pointer"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Height (cm)</label>
                  <div className="flex items-center gap-2 border border-white/10 rounded-xl bg-black/40 focus-within:border-[#FF7A00] focus-within:ring-1 focus-within:ring-[#FF7A00] px-3.5 py-3 transition-all">
                    <Ruler className="w-4 h-4 text-zinc-500" />
                    <input
                      type="number"
                      name="height"
                      value={editForm.height}
                      onChange={handleEditInputChange}
                      placeholder="cm"
                      className="bg-transparent border-0 outline-none w-full text-sm text-white placeholder-zinc-650"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Weight (kg)</label>
                  <div className="flex items-center gap-2 border border-white/10 rounded-xl bg-black/40 focus-within:border-[#FF7A00] focus-within:ring-1 focus-within:ring-[#FF7A00] px-3.5 py-3 transition-all">
                    <Scale className="w-4 h-4 text-zinc-500" />
                    <input
                      type="number"
                      name="weight"
                      value={editForm.weight}
                      onChange={handleEditInputChange}
                      placeholder="kg"
                      className="bg-transparent border-0 outline-none w-full text-sm text-white placeholder-zinc-650"
                    />
                  </div>
                </div>
              </div>

              {/* Grid 3: City and Region */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">City</label>
                  <div className="flex items-center gap-2 border border-white/10 rounded-xl bg-black/40 focus-within:border-[#FF7A00] focus-within:ring-1 focus-within:ring-[#FF7A00] px-3.5 py-3 transition-all">
                    <MapPin className="w-4 h-4 text-zinc-500" />
                    <select
                      name="city"
                      value={editForm.city}
                      onChange={handleEditInputChange}
                      className="bg-transparent border-0 outline-none w-full text-sm text-white focus:bg-[#111112] [&>option]:bg-[#111112] cursor-pointer"
                    >
                      <option value="">Select City</option>
                      <option value="Pune">Pune</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Bangalore">Bangalore</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Region / Location</label>
                  <div className="flex items-center gap-2 border border-white/10 rounded-xl bg-black/40 focus-within:border-[#FF7A00] focus-within:ring-1 focus-within:ring-[#FF7A00] px-3.5 py-3 transition-all">
                    <MapPin className="w-4 h-4 text-zinc-500" />
                    <select
                      name="location"
                      value={editForm.location}
                      onChange={handleEditInputChange}
                      className="bg-transparent border-0 outline-none w-full text-sm text-white focus:bg-[#111112] [&>option]:bg-[#111112] cursor-pointer"
                    >
                      <option value="">Select Region</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Delhi">Delhi</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Goal */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Primary Fitness Goal</label>
                <div className="flex items-center gap-2 border border-white/10 rounded-xl bg-black/40 focus-within:border-[#FF7A00] focus-within:ring-1 focus-within:ring-[#FF7A00] px-3.5 py-3 transition-all">
                  <Target className="w-4 h-4 text-zinc-500" />
                  <select
                    name="fitnessGoal"
                    value={editForm.fitnessGoal}
                    onChange={handleEditInputChange}
                    className="bg-transparent border-0 outline-none w-full text-sm text-white focus:bg-[#111112] [&>option]:bg-[#111112] cursor-pointer"
                  >
                    <option value="">Select Goal</option>
                    <option value="weightLoss">Weight Loss (Burn fat & lose weight)</option>
                    <option value="muscle">Build Muscle (Gain strength & muscle)</option>
                    <option value="general">General Fitness (Stay healthy & active)</option>
                    <option value="flexibility">Flexibility (Yoga & wellness)</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-1/2 py-3 bg-zinc-950 border border-white/10 hover:bg-zinc-800 rounded-xl font-bold text-xs text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="w-1/2 py-3 bg-gradient-to-r from-[#FF7A00] to-orange-500 hover:from-orange-600 hover:to-[#FF7A00] rounded-xl font-bold text-xs text-white transition disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_4px_15px_rgba(255,122,0,0.2)]"
                >
                  {updating ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
