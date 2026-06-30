import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../assets/Gemini_Generated_Image_e93s7pe93s7pe93s-removebg-preview.png";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPublicProductById
} from "../userServices/publicHealthStoreApi";

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

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [registerDropdownOpen, setRegisterDropdownOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false);
  const [isCartFullscreen, setIsCartFullscreen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    fullName: localStorage.getItem("userName") || "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    landmark: ""
  });

  const [userCity, setUserCity] = useState(localStorage.getItem("user_city") || "PUNE");

  const detectUserCity = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    toast.loading("Detecting your location...", { id: "geo-city" });
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        localStorage.setItem('user_latitude', latitude.toString());
        localStorage.setItem('user_longitude', longitude.toString());
        window.dispatchEvent(new Event('location-updated'));
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.address) {
            const detectedCity = data.address.city || data.address.town || data.address.village || data.address.county || "PUNE";
            const cleanCity = detectedCity.toUpperCase();
            localStorage.setItem("user_city", cleanCity);
            setUserCity(cleanCity);
            toast.success(`Location set to ${cleanCity}!`, { id: "geo-city" });
          } else {
            toast.error("Could not resolve city name.", { id: "geo-city" });
          }
        } catch (err) {
          console.error("Error reverse geocoding:", err);
          toast.error("Failed to detect city.", { id: "geo-city" });
        }
      },
      (err) => {
        toast.error("Permission denied or error: " + err.message, { id: "geo-city" });
      }
    );
  };

  useEffect(() => {
    const handleLocationChange = async () => {
      const lat = localStorage.getItem('user_latitude');
      const lon = localStorage.getItem('user_longitude');
      const storedCity = localStorage.getItem('user_city');
      
      if (storedCity) {
        setUserCity(storedCity);
        return;
      }
      
      if (lat && lon) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          const data = await res.json();
          if (data && data.address) {
            const detectedCity = data.address.city || data.address.town || data.address.village || data.address.county || "PUNE";
            const cleanCity = detectedCity.toUpperCase();
            localStorage.setItem("user_city", cleanCity);
            setUserCity(cleanCity);
          }
        } catch (err) {
          console.error("Error fetching location on event:", err);
        }
      }
    };
    
    handleLocationChange();
    window.addEventListener('location-updated', handleLocationChange);
    return () => {
      window.removeEventListener('location-updated', handleLocationChange);
    };
  }, []);

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    toast.loading("Detecting current location...", { id: "geo-navbar" });
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.display_name) {
            setCheckoutForm(prev => ({
              ...prev,
              address: data.display_name,
              city: data.address?.city || data.address?.town || data.address?.village || "",
              state: data.address?.state || "",
              pincode: data.address?.postcode || ""
            }));
            toast.success("Location detected!", { id: "geo-navbar" });
          } else {
            setCheckoutForm(prev => ({ ...prev, address: `${latitude}, ${longitude}` }));
            toast.success("Location set to coordinates.", { id: "geo-navbar" });
          }
        } catch (err) {
          setCheckoutForm(prev => ({ ...prev, address: `${latitude}, ${longitude}` }));
          toast.success("Location set to coordinates.", { id: "geo-navbar" });
        }
      },
      (err) => {
        toast.error("Unable to retrieve location: " + err.message, { id: "geo-navbar" });
      }
    );
  };

  const handleProceedToPay = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("userToken");
    if (!token) {
      toast.error("Please login first to checkout.");
      navigate("/login");
      return;
    }

    if (!checkoutForm.fullName.trim() || !checkoutForm.mobile.trim() || !checkoutForm.address.trim() || !checkoutForm.city.trim() || !checkoutForm.state.trim() || !checkoutForm.pincode.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setCheckoutLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Razorpay SDK failed to load. Are you online?");
        setCheckoutLoading(false);
        return;
      }

      const resolvedItems = [];
      for (const item of cartItems) {
        let storeId = item.healthStore;
        let productType = item.productType;
        let flavor = item.flavor;
        let size = item.size;

        if (!storeId || !productType) {
          try {
            const productRes = await getPublicProductById(item._id);
            if (productRes && productRes.data) {
              storeId = productRes.data.healthStore?._id || productRes.data.healthStore;
              productType = productRes.data.productType;
              if (productType === "Supplement" && !flavor) {
                flavor = productRes.data.variants?.[0]?.flavor || productRes.data.flavor || "";
                size = productRes.data.variants?.[0]?.size || productRes.data.quantity || "";
              }
            }
          } catch (err) {
            console.error("Error resolving product details for checkout:", err);
          }
        }

        if (!storeId) {
          throw new Error(`Could not resolve health store info for item: ${item.name}`);
        }

        resolvedItems.push({
          ...item,
          healthStore: storeId,
          productType,
          flavor,
          size
        });
      }

      const distinctStores = Array.from(new Set(resolvedItems.map(i => i.healthStore)));
      if (distinctStores.length === 0) {
        toast.error("Your cart is empty.");
        setCheckoutLoading(false);
        return;
      }
      if (distinctStores.length > 1) {
        toast.error("Checkout only supports one health store at a time. Please remove items from other stores.");
        setCheckoutLoading(false);
        return;
      }

      const storeId = distinctStores[0];
      const itemsPayload = resolvedItems.map(item => ({
        productId: item._id,
        quantity: item.qty || 1,
        purchaseType: item.purchaseType || "One Time",
        flavor: item.flavor || undefined,
        size: item.size || undefined
      }));

      const addressPayload = {
        fullName: checkoutForm.fullName,
        mobile: checkoutForm.mobile,
        email: localStorage.getItem("userEmail") || "",
        address: checkoutForm.address,
        city: checkoutForm.city,
        state: checkoutForm.state,
        pincode: checkoutForm.pincode,
        landmark: checkoutForm.landmark
      };

      const orderPayload = {
        storeId,
        address: addressPayload,
        items: itemsPayload
      };

      const orderRes = await createRazorpayOrder(orderPayload);
      const orderData = orderRes.data;

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "livesale.Fitness Health Store",
        description: `Order from ${orderData.storeName || "Health Store"}`,
        image: cartItems[0]?.image || "",
        order_id: orderData.razorpayOrderId,
        handler: async (response) => {
          try {
            const verificationPayload = {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: orderData.orderId
            };
            const verifyRes = await verifyRazorpayPayment(verificationPayload);
            toast.success(verifyRes.message || "Payment verified! Order placed successfully.");

            clearCart();
            setCheckoutModalOpen(false);
            setIsCartFullscreen(false);
            setCartDropdownOpen(false);
            navigate("/orders");
          } catch (verifyErr) {
            toast.error(verifyErr.message || "Payment verification failed");
          }
        },
        prefill: {
          name: checkoutForm.fullName,
          contact: checkoutForm.mobile
        },
        theme: {
          color: "#FF7A00"
        }
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.open();
    } catch (err) {
      toast.error(err.message || "Failed to initiate payment");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const loadCart = () => {
    try {
      const items = JSON.parse(localStorage.getItem("cart_items") || "[]");
      setCartItems(items);
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    const handleClose = () => setIsOpen(false);
    const handleCollapseChange = (e) => {
      // e.detail is isCollapsed. If isCollapsed is false, then sidebar is open (isOpen = true).
      setIsOpen(!e.detail);
    };
    window.addEventListener("toggle-sidebar", handleToggle);
    window.addEventListener("close-sidebar", handleClose);
    window.addEventListener("sidebar-collapse-change", handleCollapseChange);
    loadCart();
    window.addEventListener("cart-updated", loadCart);
    return () => {
      window.removeEventListener("toggle-sidebar", handleToggle);
      window.removeEventListener("close-sidebar", handleClose);
      window.removeEventListener("sidebar-collapse-change", handleCollapseChange);
      window.removeEventListener("cart-updated", loadCart);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".register-dropdown-container")) {
        setRegisterDropdownOpen(false);
      }
      if (!event.target.closest(".cart-dropdown-container")) {
        setCartDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const removeFromCart = (id) => {
    const updated = cartItems.filter(item => item._id !== id);
    localStorage.setItem("cart_items", JSON.stringify(updated));
    setCartItems(updated);
    window.dispatchEvent(new Event("cart-updated"));
  };

  const clearCart = () => {
    localStorage.removeItem("cart_items");
    setCartItems([]);
    window.dispatchEvent(new Event("cart-updated"));
  };

  const handleHamburgerClick = () => {
    window.dispatchEvent(new Event("toggle-sidebar"));
  };

  return (
    <>
      <nav
        className={`
        fixed
        top-0
        left-0
        ${isOpen ? 'w-full lg:w-[calc(100%-100px)]' : 'w-full'}
        z-50
        bg-black/20
        backdrop-blur-xl
        border-b
        border-white/10
        shadow-lg
        transition-all
        duration-300
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center gap-2.5">
                <img src={logo} alt="livesale.Fitness Logo" className="h-20 w-auto object-contain rounded" />

              </Link>
            </div>



            {/* Right Area (Desktop + Mobile handles) */}
            <div className="flex items-center gap-2 md:gap-4 justify-end">

              {/* Mobile Location button */}
              <button
                onClick={detectUserCity}
                className="
                flex
                md:hidden
                items-center
                gap-1.5
                px-3
                py-1.5
                rounded-full
                border
                border-white/20
                bg-white/10
                backdrop-blur-md
                text-white
                text-xs
                font-bold
                cursor-pointer
              "
              >
                <span>{userCity}</span>
                📍
              </button>

              {/* Desktop Right (Hidden on mobile) */}
              <div className="hidden md:flex items-center gap-4">
                <button
                  onClick={detectUserCity}
                  className="
                  flex
                  items-center
                  gap-2
                  px-4
                  py-2
                  rounded-full
                  border
                  border-white/20
                  bg-white/10
                  backdrop-blur-md
                  text-white
                  hover:bg-white/20
                  transition-all
                  cursor-pointer
                "
                >
                  <span className="font-semibold text-sm">{userCity}</span>
                  📍
                </button>


                <div className="relative register-dropdown-container">
                  <button
                    onClick={() => setRegisterDropdownOpen(!registerDropdownOpen)}
                    className="
                    px-6
                    py-2.5
                    rounded-full
                    bg-[#FF7A00]
                    hover:bg-[#E66E00]
                    text-white
                    font-medium
                    shadow-lg
                    hover:scale-105
                    transition-all
                    cursor-pointer
                    flex
                    items-center
                    gap-1.5
                  "
                  >
                    <span>Register</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${registerDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {registerDropdownOpen && (
                    <div className="absolute right-0 mt-2.5 w-60 rounded-2xl bg-black/95 border border-zinc-800/80 backdrop-blur-xl shadow-2xl p-2.5 z-50 flex flex-col gap-1.5 animate-fadeIn">
                      <Link
                        to="/gym-owner/login"
                        onClick={() => setRegisterDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-zinc-300 hover:text-[#FF7A00] hover:bg-white/[0.05] rounded-xl transition-all font-semibold text-xs text-left"
                      >
                        <span className="text-base">🏋️</span>
                        <span> Gym Owner Login / Register</span>
                      </Link>
                      <Link
                        to="/trainer/register"
                        onClick={() => setRegisterDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-zinc-300 hover:text-[#a3ff12] hover:bg-white/[0.05] rounded-xl transition-all font-semibold text-xs text-left"
                      >
                        <span className="text-base">👥</span>
                        <span>Register as Trainer</span>
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setRegisterDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-zinc-300 hover:text-[#FF7A00] hover:bg-white/[0.05] rounded-xl transition-all font-semibold text-xs text-left border-t border-zinc-800/60"
                      >
                        <span className="text-base">👤</span>
                        <span>User Register</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Cart Icon & Dropdown */}
                <div className="relative cart-dropdown-container">
                  <button
                    onClick={() => setCartDropdownOpen(!cartDropdownOpen)}
                    className="
                    p-2.5
                    rounded-full
                    bg-white/10
                    border
                    border-white/20
                    hover:bg-white/20
                    text-white
                    shadow-lg
                    hover:scale-105
                    transition-all
                    cursor-pointer
                    flex
                    items-center
                    justify-center
                    relative
                  "
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {cartItems.length > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-[#FF7A00] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-black animate-pulse">
                        {cartItems.reduce((acc, i) => acc + (i.qty || 1), 0)}
                      </span>
                    )}
                  </button>

                  {cartDropdownOpen && (
                    <div className="absolute right-0 mt-2.5 w-80 rounded-2xl bg-black/95 border border-zinc-800/80 backdrop-blur-xl shadow-2xl p-4 z-50 flex flex-col gap-3 animate-fadeIn text-left">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🛒</span>
                          <h4 className="font-extrabold text-sm text-white">Your Cart</h4>
                          <span className="bg-[#FF7A00]/10 text-[#FF7A00] text-[10px] font-black px-2 py-0.5 rounded-full">
                            {cartItems.reduce((acc, i) => acc + (i.qty || 1), 0)} items
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setIsCartFullscreen(true);
                              setCartDropdownOpen(false);
                            }}
                            className="p-1 rounded hover:bg-white/5 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                            title="Fullscreen Cart"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h6m0 0v6m0-6L14 10M9 21H3m0 0v-6m0 6l7-7" />
                            </svg>
                          </button>
                          {cartItems.length > 0 && (
                            <button
                              onClick={clearCart}
                              className="text-xs text-zinc-550 hover:text-red-400 font-bold transition-colors cursor-pointer"
                            >
                              Clear All
                            </button>
                          )}
                        </div>
                      </div>

                      {cartItems.length === 0 ? (
                        <div className="py-8 text-center flex flex-col items-center justify-center">
                          <span className="text-3xl mb-2">🛍️</span>
                          <p className="text-zinc-400 text-xs font-semibold">Your cart is empty</p>
                          <p className="text-zinc-600 text-[10px] mt-1">Add items from the store to get started</p>
                        </div>
                      ) : (
                        <>
                          <div className="max-h-60 overflow-y-auto flex flex-col gap-2 pr-1 custom-scrollbar">
                            {cartItems.map((item) => (
                              <div key={item._id} className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all justify-between">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center flex-shrink-0">
                                    {item.image ? (
                                      <img src={item.image} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <span className="text-lg">💊</span>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-white truncate w-36" title={item.name}>
                                      {item.name.split(" - ")[0]}
                                    </p>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider truncate">
                                      {item.brand || "Supplement"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-white">
                                    ₹{item.price} <span className="text-zinc-650 font-normal text-[10px]">x{item.qty || 1}</span>
                                  </span>
                                  <button
                                    onClick={() => removeFromCart(item._id)}
                                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-all flex items-center justify-center"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="border-t border-zinc-800 pt-3 flex flex-col gap-3">
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="text-zinc-400">Total Amount:</span>
                              <span className="text-sm font-black text-white">
                                ₹{cartItems.reduce((acc, i) => acc + (i.qty || 1) * i.price, 0)}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                const token = localStorage.getItem("userToken");
                                if (!token) {
                                  toast.error("Please login first to checkout.");
                                  navigate("/login");
                                  return;
                                }
                                setCheckoutModalOpen(true);
                              }}
                              className="w-full py-2.5 rounded-xl bg-[#FF7A00] hover:bg-[#E66E00] text-white font-extrabold text-xs text-center transition-all uppercase tracking-widest shadow-lg"
                            >
                              Proceed to Checkout
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Menu Hamburger Button */}
              <button
                className="md:hidden text-white p-1"
                onClick={handleHamburgerClick}
              >
                {isOpen ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>

            </div>
          </div>
        </div>
      </nav>

      {/* Fullscreen Cart Modal */}
      {isCartFullscreen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4 md:p-6 animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#0a0b0d] border border-zinc-900 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative flex flex-col gap-6 text-left">

            {/* Close Button */}
            <button
              onClick={() => setIsCartFullscreen(false)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
              title="Close Fullscreen"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="border-b border-zinc-850 pb-5">
              <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
                <span>🛒</span> Your Shopping Cart
              </h2>
              <p className="text-zinc-500 text-xs md:text-sm mt-1">
                You have {cartItems.reduce((acc, i) => acc + (i.qty || 1), 0)} items in your cart
              </p>
            </div>

            {/* Items List */}
            {cartItems.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <span className="text-5xl mb-4">🛍️</span>
                <p className="text-zinc-400 text-lg font-bold">Your cart is empty</p>
                <p className="text-zinc-500 text-xs mt-1">Add items from the store to get started</p>
              </div>
            ) : (
              <>
                <div className="flex-grow max-h-[350px] overflow-y-auto flex flex-col gap-3 pr-2 custom-scrollbar">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-zinc-900 hover:border-zinc-800 transition-all gap-4">

                      {/* Left: Product Info */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-16 h-16 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center flex-shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl">💊</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm md:text-base font-extrabold text-white truncate max-w-[240px] md:max-w-[320px]">
                            {item.name}
                          </h4>
                          <span className="inline-block bg-[#FF7A00]/10 border border-[#FF7A00]/25 text-[#FF7A00] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mt-1">
                            {item.brand || "Supplement"}
                          </span>
                        </div>
                      </div>

                      {/* Right: Quantity, Price & Delete */}
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-sm md:text-base font-black text-white">
                            ₹{item.price * (item.qty || 1)}
                          </p>
                          <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">
                            ₹{item.price} each • Qty: {item.qty || 1}
                          </p>
                        </div>

                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="w-10 h-10 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 border border-zinc-900 hover:border-red-500/15 transition-all flex items-center justify-center cursor-pointer"
                          title="Remove item"
                        >
                          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

                {/* Summary & Checkout */}
                <div className="border-t border-zinc-850 pt-5 mt-auto flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-bold text-sm md:text-base">Grand Total:</span>
                    <span className="text-xl md:text-2xl font-black text-white">
                      ₹{cartItems.reduce((acc, i) => acc + (i.qty || 1) * i.price, 0)}
                    </span>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={clearCart}
                      className="flex-1 py-4 border border-zinc-800 hover:border-red-500/20 bg-transparent hover:bg-red-500/5 text-zinc-400 hover:text-red-400 font-bold rounded-2xl transition-all uppercase tracking-wider text-xs cursor-pointer"
                    >
                      Clear Entire Cart
                    </button>
                    <button
                      onClick={() => {
                        const token = localStorage.getItem("userToken");
                        if (!token) {
                          toast.error("Please login first to checkout.");
                          navigate("/login");
                          return;
                        }
                        setCheckoutModalOpen(true);
                      }}
                      className="flex-[2] py-4 bg-gradient-to-r from-[#FF7A00] to-[#E66E00] hover:to-[#FF7A00] text-white font-black rounded-2xl transition-all uppercase tracking-widest text-xs shadow-[0_6px_20px_rgba(255,122,0,0.3)] cursor-pointer"
                    >
                      Proceed to Checkout ➔
                    </button>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* Address Checkout Modal */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[10000] flex items-center justify-center p-4 md:p-6 animate-fadeIn">
          <div className="w-full max-w-xl bg-black/95 border border-zinc-800 rounded-[2rem] p-6 md:p-8 shadow-2xl relative flex flex-col gap-5 text-left">

            {/* Close Button */}
            <button
              onClick={() => setCheckoutModalOpen(false)}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105"
              title="Close"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="border-b border-zinc-805 pb-3">
              <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                <span>📍</span> Shipping Address
              </h2>
              <p className="text-zinc-500 text-xs mt-1">
                Please enter your delivery details to proceed with payment
              </p>
            </div>

            <form onSubmit={handleProceedToPay} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={checkoutForm.fullName}
                    onChange={e => setCheckoutForm({ ...checkoutForm, fullName: e.target.value })}
                    placeholder="Enter full name"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#FF7A00] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={checkoutForm.mobile}
                    onChange={e => setCheckoutForm({ ...checkoutForm, mobile: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#FF7A00] transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">Street Address *</label>
                  <button
                    type="button"
                    onClick={handleLocateUser}
                    className="text-[9px] font-black text-[#FF7A00] hover:underline flex items-center gap-1 uppercase tracking-wider bg-transparent border-0 cursor-pointer"
                  >
                    📍 Locate Me
                  </button>
                </div>
                <textarea
                  required
                  value={checkoutForm.address}
                  onChange={e => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                  placeholder="House no., street name, apartment..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#FF7A00] transition-all min-h-[60px] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">City *</label>
                  <input
                    type="text"
                    required
                    value={checkoutForm.city}
                    onChange={e => setCheckoutForm({ ...checkoutForm, city: e.target.value })}
                    placeholder="City"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#FF7A00] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">State *</label>
                  <input
                    type="text"
                    required
                    value={checkoutForm.state}
                    onChange={e => setCheckoutForm({ ...checkoutForm, state: e.target.value })}
                    placeholder="State"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#FF7A00] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">Pincode *</label>
                  <input
                    type="text"
                    required
                    value={checkoutForm.pincode}
                    onChange={e => setCheckoutForm({ ...checkoutForm, pincode: e.target.value })}
                    placeholder="6-digit ZIP code"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#FF7A00] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">Landmark (Optional)</label>
                <input
                  type="text"
                  value={checkoutForm.landmark}
                  onChange={e => setCheckoutForm({ ...checkoutForm, landmark: e.target.value })}
                  placeholder="Nearby famous place"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#FF7A00] transition-all"
                />
              </div>

              <div className="flex gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => setCheckoutModalOpen(false)}
                  className="flex-1 py-3 border border-zinc-800 hover:border-zinc-700 bg-transparent text-zinc-400 hover:text-white font-bold rounded-xl transition-all uppercase tracking-wider text-[10px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={checkoutLoading}
                  className="flex-[2] py-3 bg-[#FF7A00] hover:bg-[#E66E00] text-white font-black rounded-xl transition-all uppercase tracking-widest text-[10px] shadow-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {checkoutLoading ? "Initiating..." : `Pay ₹${cartItems.reduce((acc, i) => acc + (i.qty || 1) * i.price, 0)}`}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;