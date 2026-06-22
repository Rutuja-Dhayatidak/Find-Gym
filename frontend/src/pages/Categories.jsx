import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getPublicDiets,
  getPublicSupplements,
  createRazorpayOrder,
  verifyRazorpayPayment
} from '../userServices/publicHealthStoreApi';

import muscleBlazeImg from '../assets/muscleblaze_whey.png';
import myProteinImg from '../assets/myprotein_whey.png';
import dymatizeImg from '../assets/dymatize_iso100.png';
import isopureImg from '../assets/isopure_zerocarb.png';

// Star Rating helper
const StarRating = ({ rating = 4.5 }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((i) => (
      <span key={i} className={`text-sm ${i <= Math.floor(rating) ? 'text-yellow-400' : 'text-gray-700'}`}>
        ★
      </span>
    ))}
    <span className="text-gray-400 text-xs font-semibold ml-1">{rating}</span>
  </div>
);

// Dynamic script loader for Razorpay
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

const Categories = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('diet');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Selected Detail Modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [purchaseType, setPurchaseType] = useState('One Time'); // 'One Time' or 'Monthly'
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedFlavor, setSelectedFlavor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [cartQty, setCartQty] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [deliveryOption, setDeliveryOption] = useState('Standard'); // 'Standard' or 'Fast'
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI', 'COD', etc.

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [successOrderDetails, setSuccessOrderDetails] = useState(null);

  const isDiet = activeTab === 'diet';

  const dietHeroSlides = [
    {
      badge: "Nutrition & Diet",
      title: "Balanced Nutrition",
      subtitle: "Fuel your body with balanced meals",
      benefits: ["Rich in Proteins", "High in Fiber", "Essential Vitamins"],
      image: "/balanced-bowl.png"
    },
    {
      badge: "Weight Loss",
      title: "Smart Weight Loss",
      subtitle: "Clean meals designed for fat loss",
      benefits: ["Low Calories", "High Fiber", "Daily Energy"],
      image: "/weight-loss-bowl.png"
    },
    {
      badge: "Muscle Gain",
      title: "Muscle Gain Meal",
      subtitle: "Protein-rich meals for strength and recovery",
      benefits: ["High Protein", "Healthy Carbs", "Post Workout Support"],
      image: "/muscle-gain-bowl.png"
    },
    {
      badge: "Healthy Breakfast",
      title: "Start Fresh Daily",
      subtitle: "Healthy breakfast plans for active lifestyle",
      benefits: ["Quick Meals", "Balanced Macros", "Good Digestion"],
      image: "/breakfast-bowl.png"
    }
  ];

  const [activeDietSlide, setActiveDietSlide] = useState(0);
  const [dietRotation, setDietRotation] = useState(0);

  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedVeg, setSelectedVeg] = useState('All');
  const [priceRange, setPriceRange] = useState('All');

  // Reset filters when tab changes
  useEffect(() => {
    setSelectedBrand('All');
    setSelectedCategory('All');
    setSelectedVeg('All');
    setPriceRange('All');
  }, [activeTab]);

  const uniqueBrands = ['All', ...Array.from(new Set(items.map(item => item.brand).filter(Boolean)))];

  const filteredItems = items.filter(item => {
    if (isDiet) return true;

    if (selectedBrand !== 'All' && item.brand !== selectedBrand) return false;

    if (selectedCategory !== 'All') {
      const cat = selectedCategory.toLowerCase();
      const name = item.name.toLowerCase();
      const desc = (item.description || '').toLowerCase();
      const categoryField = (item.category || '').toLowerCase();
      if (!name.includes(cat) && !desc.includes(cat) && !categoryField.includes(cat)) {
        return false;
      }
    }

    if (selectedVeg !== 'All') {
      const isVegItem = item.foodType === 'Vegetarian' || (item.name || '').toLowerCase().includes('veg');
      if (selectedVeg === 'Veg' && !isVegItem) return false;
      if (selectedVeg === 'Non-Veg' && isVegItem) return false;
    }

    const price = item.sellingPrice || item.oneTimePrice || 0;
    if (priceRange === 'under_2000' && price >= 2000) return false;
    if (priceRange === '2000_5000' && (price < 2000 || price > 5000)) return false;
    if (priceRange === 'over_5000' && price <= 5000) return false;

    return true;
  });

  useEffect(() => {
    setActiveImageIndex(0);
    if (selectedProduct && selectedProduct.productType === 'Supplement') {
      const vars = selectedProduct.variants || [];
      if (vars.length > 0) {
        setSelectedFlavor(vars[0].flavor || '');
        setSelectedSize(vars[0].size || '');
      } else {
        setSelectedFlavor(selectedProduct.flavor || 'Unflavored');
        setSelectedSize(selectedProduct.quantity || '1kg');
      }
    } else {
      setSelectedFlavor('');
      setSelectedSize('');
    }
  }, [selectedProduct]);

  const activeVariant = selectedProduct && selectedProduct.productType === 'Supplement' && selectedProduct.variants && selectedProduct.variants.length > 0
    ? selectedProduct.variants.find(v => v.flavor === selectedFlavor && v.size === selectedSize) || selectedProduct.variants[0]
    : null;

  const availableFlavors = selectedProduct && selectedProduct.productType === 'Supplement'
    ? Array.from(new Set((selectedProduct.variants || []).map(v => v.flavor).filter(Boolean)))
    : [];

  const availableSizes = selectedProduct && selectedProduct.productType === 'Supplement'
    ? Array.from(new Set((selectedProduct.variants || []).map(v => v.size).filter(Boolean)))
    : [];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let res;
      if (isDiet) {
        res = await getPublicDiets({ search });
      } else {
        res = await getPublicSupplements({ search });
      }
      setItems(res.data || []);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [activeTab, search]);

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    toast.loading('Detecting current location...', { id: 'geo' });
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.display_name) {
            setCheckoutAddress(data.display_name);
            toast.success('Location detected!', { id: 'geo' });
          } else {
            setCheckoutAddress(`${latitude}, ${longitude}`);
            toast.success('Location set to coordinates.', { id: 'geo' });
          }
        } catch (err) {
          setCheckoutAddress(`${latitude}, ${longitude}`);
          toast.success('Location set to coordinates.', { id: 'geo' });
        }
      },
      (err) => {
        toast.error('Unable to retrieve location: ' + err.message, { id: 'geo' });
      }
    );
  };

  const handleCheckout = async (product) => {
    const userToken = localStorage.getItem('userToken');
    if (!userToken) {
      toast.error('Please login first to purchase plans or supplements.');
      navigate('/login');
      return;
    }

    if (!checkoutAddress.trim()) {
      toast.error('Please enter a delivery address.');
      return;
    }

    if (product.productType === 'Supplement') {
      const matchedVariant = product.variants?.find(v => v.flavor === selectedFlavor && v.size === selectedSize);
      if (matchedVariant && matchedVariant.stock <= 0) {
        toast.error('This product variant is currently out of stock.');
        return;
      } else if (!matchedVariant && product.stock <= 0) {
        toast.error('This product is currently out of stock.');
        return;
      }
    }

    setCheckoutLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        setCheckoutLoading(false);
        return;
      }

      // Prepare order details
      const orderPayload = {
        storeId: product.healthStore._id || product.healthStore,
        address: checkoutAddress,
        items: [
          {
            productId: product._id,
            quantity: 1,
            purchaseType: product.productType === 'Diet' && purchaseType === 'Monthly' ? 'Monthly' : 'One Time',
            flavor: product.productType === 'Supplement' ? selectedFlavor : undefined,
            size: product.productType === 'Supplement' ? selectedSize : undefined
          }
        ]
      };

      const res = await createRazorpayOrder(orderPayload);
      const orderData = res.data;

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'LifeCell.Fitness Health Store',
        description: `Order for ${product.name}`,
        image: product.images?.[0] || 'https://lh3.googleusercontent.com/d/1w8lK1Hw1h...',
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
            toast.success(verifyRes.message || 'Payment verified! Order placed.');

            const isProductDiet = product.productType === 'Diet';
            const activeVar = product.productType === 'Supplement' && product.variants && product.variants.length > 0
              ? product.variants.find(v => v.flavor === selectedFlavor && v.size === selectedSize) || product.variants[0]
              : null;

            const basePrice = isProductDiet
              ? (purchaseType === 'Monthly' ? product.monthlyPrice : product.oneTimePrice)
              : (activeVar ? activeVar.sellingPrice : (product.sellingPrice || product.oneTimePrice));

            const mrpPrice = isProductDiet
              ? basePrice
              : (activeVar ? activeVar.mrp : product.originalPrice) || basePrice;

            const qty = cartQty;
            const discountAmount = (mrpPrice - basePrice) * qty;
            const shippingCost = deliveryOption === 'Fast' ? 149 : 0;
            const finalTotal = (basePrice * qty) + shippingCost;

            setSuccessOrderDetails({
              orderId: verifyRes.data?.orderNumber || 'LCF' + Math.floor(100000000 + Math.random() * 900000000),
              invoiceNumber: verifyRes.data?.invoiceNumber || `INV-${Date.now()}`,
              productName: product.name,
              productImage: product.images?.[0] || '',
              productType: product.productType,
              flavor: selectedFlavor || '',
              size: selectedSize || '',
              quantity: qty,
              basePrice: basePrice,
              totalAmount: finalTotal,
              discountAmount: discountAmount,
              address: checkoutAddress,
              deliveryOption: deliveryOption,
              paymentMethod: paymentMethod,
              date: new Date()
            });

            setSelectedProduct(null);
            setCheckoutProduct(null);
            setCheckoutAddress('');
            fetchProducts(); // refresh stock
          } catch (verifyErr) {
            toast.error(verifyErr.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: isDiet ? '#22c55e' : '#ef4444'
        }
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.open();
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const dietBg = '/diet_banner_bg.png';
  const suppBg = '/supplement_banner_bg.png';

  if (successOrderDetails) {
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };
    const formatTime = (date) => {
      return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const estStart = successOrderDetails.deliveryOption === 'Fast' ? 1 : 3;
    const estEnd = successOrderDetails.deliveryOption === 'Fast' ? 2 : 5;

    const estStartDate = new Date(successOrderDetails.date.getTime() + estStart * 24 * 60 * 60 * 1000);
    const estEndDate = new Date(successOrderDetails.date.getTime() + estEnd * 24 * 60 * 60 * 1000);

    return (
      <div className="min-h-screen bg-[#090b0e] text-white font-sans relative overflow-x-hidden pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Page Ambient Glows */}
        <div className="absolute top-0 left-[-10%] w-[50%] h-[50%] bg-violet-600/5 rounded-full blur-[160px] pointer-events-none z-0" />
        <div className="absolute top-[35%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-600/3 rounded-full blur-[160px] pointer-events-none z-0" />

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          {/* Green Check Circle */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 text-3xl shadow-[0_0_30px_rgba(16,185,129,0.25)] animate-bounce">
              ✓
            </div>
          </div>

          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Order Confirmed!</h1>
          <p className="text-zinc-400 text-sm">Thank you for your purchase. Your order has been placed successfully.</p>

          <div className="inline-flex items-center gap-2 bg-[#111319] border border-zinc-800/80 rounded-xl px-4 py-2 text-xs font-bold mt-4 shadow-inner">
            <span className="text-zinc-400">Order ID:</span>
            <span className="text-emerald-400 font-mono select-all uppercase">{successOrderDetails.orderId}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(successOrderDetails.orderId);
                toast.success("Order ID copied!");
              }}
              className="text-zinc-500 hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0 ml-1"
            >
              📋
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 border-t border-b border-zinc-900 py-6 text-left">
            <div>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-wider mb-1">Order Placed On</p>
              <p className="text-xs font-bold text-white">{formatDate(successOrderDetails.date)}</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">{formatTime(successOrderDetails.date)}</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-wider mb-1">Estimated Delivery</p>
              <p className="text-xs font-bold text-white">{formatDate(estStartDate)} - {formatDate(estEndDate)}</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">{estStart} - {estEnd} Business Days</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-wider mb-1">Payment Method</p>
              <p className="text-xs font-bold text-white">{successOrderDetails.paymentMethod}</p>
              <p className="text-[10px] text-green-400 font-bold mt-0.5">Paid Successfully</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-wider mb-1">Total Amount</p>
              <p className="text-xs font-extrabold text-white">₹{successOrderDetails.totalAmount}</p>
              {successOrderDetails.discountAmount > 0 && (
                <p className="text-[10px] text-green-400 font-bold mt-0.5">Saved ₹{successOrderDetails.discountAmount}</p>
              )}
            </div>
          </div>

          {/* Details Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 text-left">
            {/* Card 1: Order Items */}
            <div className="bg-[#111319]/80 border border-zinc-900 rounded-[1.8rem] p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">Order Items</h3>
                <div className="flex gap-4 items-start">
                  <div className="w-16 h-16 bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                    {successOrderDetails.productImage ? (
                      <img src={successOrderDetails.productImage} alt={successOrderDetails.productName} className="w-full h-full object-contain rounded-lg" />
                    ) : (
                      <div className="text-2xl">{successOrderDetails.productType === 'Diet' ? '🥗' : '💊'}</div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-xs font-bold text-white leading-tight line-clamp-2">{successOrderDetails.productName}</h4>
                    {successOrderDetails.flavor && (
                      <span className="inline-block bg-white/[0.03] border border-zinc-800/80 rounded-md px-1.5 py-0.5 text-[9px] text-zinc-400 font-black uppercase mt-1">
                        {successOrderDetails.flavor}
                      </span>
                    )}
                    <p className="text-[10px] text-zinc-500 mt-2 font-bold uppercase">
                      {successOrderDetails.size || '1 Unit'} &bull; Qty: {successOrderDetails.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-white">₹{successOrderDetails.totalAmount}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => toast.success("Invoice download started...")}
                className="mt-6 w-full bg-[#16181b] hover:bg-zinc-800 text-white font-extrabold text-[10px] py-3 rounded-xl transition-all border border-zinc-900 hover:border-zinc-850 uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer"
              >
                📥 Download Invoice
              </button>
            </div>

            {/* Card 2: Delivery Address */}
            <div className="bg-[#111319]/80 border border-zinc-900 rounded-[1.8rem] p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">Delivery Address</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-white">{localStorage.getItem('userName') || 'Rohit Sharma'}</span>
                    <span className="text-[8px] font-black bg-violet-600/15 text-violet-400 px-1.5 py-0.5 rounded uppercase tracking-wide">
                      Home
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                    {successOrderDetails.address || 'No address provided'}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-bold">+1 (555) 123-4567</p>
                </div>
              </div>

              <button
                onClick={() => navigate('/profile')}
                className="mt-6 w-full bg-[#16181b] hover:bg-zinc-800 text-white font-extrabold text-[10px] py-3 rounded-xl transition-all border border-zinc-900 hover:border-zinc-850 uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer"
              >
                View / Edit Address &gt;
              </button>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="bg-[#111319]/80 border border-zinc-900 rounded-[1.8rem] p-6 mt-6 text-left">
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-6">What's Next?</h3>
            
            <div className="grid grid-cols-5 gap-2 relative">
              {/* Connector line */}
              <div className="absolute left-[10%] right-[10%] top-4 h-[2px] bg-zinc-800/80 z-0">
                <div className="h-full bg-emerald-500 w-[20%] transition-all duration-500" />
              </div>

              {/* Step 1: Confirmed */}
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-black flex items-center justify-center text-xs font-black shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  ✓
                </div>
                <p className="text-[10px] font-black text-white mt-2">Order Confirmed</p>
                <p className="text-[9px] text-zinc-500 font-semibold mt-0.5">{formatDate(successOrderDetails.date)}</p>
              </div>

              {/* Step 2: Packed */}
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-8 h-8 rounded-full bg-[#16181b] border border-zinc-800 text-zinc-400 flex items-center justify-center text-xs font-bold">
                  📦
                </div>
                <p className="text-[10px] font-black text-zinc-400 mt-2">Packed</p>
                <p className="text-[9px] text-zinc-500 font-semibold mt-0.5">Within 24 Hours</p>
              </div>

              {/* Step 3: Shipped */}
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-8 h-8 rounded-full bg-[#16181b] border border-zinc-800 text-zinc-400 flex items-center justify-center text-xs font-bold">
                  🚚
                </div>
                <p className="text-[10px] font-black text-zinc-400 mt-2">Shipped</p>
                <p className="text-[9px] text-zinc-500 font-semibold mt-0.5">{formatDate(estStartDate)}</p>
              </div>

              {/* Step 4: Out for Delivery */}
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-8 h-8 rounded-full bg-[#16181b] border border-zinc-800 text-zinc-400 flex items-center justify-center text-xs font-bold">
                  🛵
                </div>
                <p className="text-[10px] font-black text-zinc-400 mt-2">Out for Delivery</p>
                <p className="text-[9px] text-zinc-500 font-semibold mt-0.5">{formatDate(estEndDate)}</p>
              </div>

              {/* Step 5: Delivered */}
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-8 h-8 rounded-full bg-[#16181b] border border-zinc-800 text-zinc-400 flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
                <p className="text-[10px] font-black text-zinc-400 mt-2">Delivered</p>
                <p className="text-[9px] text-zinc-500 font-semibold mt-0.5">{formatDate(estEndDate)}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <button
              onClick={() => navigate('/profile')}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-extrabold text-xs py-3.5 px-8 rounded-xl transition-all shadow-lg shadow-violet-500/20 uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
            >
              📍 Track Order
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="bg-[#111319] hover:bg-[#16181b] text-white border border-zinc-850 hover:border-zinc-800 font-extrabold text-xs py-3.5 px-8 rounded-xl transition-all uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
            >
              📋 View My Orders
            </button>
            <button
              onClick={() => setSuccessOrderDetails(null)}
              className="bg-transparent hover:bg-white/[0.03] text-zinc-400 hover:text-white border border-zinc-850 hover:border-zinc-800 font-extrabold text-xs py-3.5 px-8 rounded-xl transition-all uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
            >
              🛒 Continue Shopping
            </button>
          </div>

          {/* Support Banner */}
          <div className="mt-16 pt-8 border-t border-zinc-900/60 flex flex-col sm:flex-row justify-between items-center text-zinc-500 text-xs font-bold gap-4">
            <div>
              <p className="text-white font-bold text-sm">Need help?</p>
              <p className="font-normal mt-0.5">We're here for you</p>
            </div>
            <div className="flex gap-6 items-center flex-wrap justify-center">
              <span>📞 +1 (555) 123-4567</span>
              <span>✉️ support@lifecell.fitness</span>
              <span>⏰ 24/7 Support Available</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (checkoutProduct) {
    const isProductDiet = checkoutProduct.productType === 'Diet';
    const activeVar = checkoutProduct.productType === 'Supplement' && checkoutProduct.variants && checkoutProduct.variants.length > 0
      ? checkoutProduct.variants.find(v => v.flavor === selectedFlavor && v.size === selectedSize) || checkoutProduct.variants[0]
      : null;

    const basePrice = isProductDiet
      ? (purchaseType === 'Monthly' ? checkoutProduct.monthlyPrice : checkoutProduct.oneTimePrice)
      : (activeVar ? activeVar.sellingPrice : (checkoutProduct.sellingPrice || checkoutProduct.oneTimePrice));

    const mrpPrice = isProductDiet
      ? basePrice
      : (activeVar ? activeVar.mrp : checkoutProduct.originalPrice) || basePrice;

    const qty = cartQty;
    const subtotal = mrpPrice * qty;
    const shippingCost = deliveryOption === 'Fast' ? 149 : 0;
    const discountAmount = (mrpPrice - basePrice) * qty;
    const finalTotal = (basePrice * qty) + shippingCost;
    const pointsEarned = Math.round(finalTotal * 0.01);

    return (
      <div className="min-h-screen bg-[#090b0e] text-white font-sans relative overflow-x-hidden pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Page-level Ambient Glows */}
        <div className="absolute top-0 left-[-10%] w-[50%] h-[50%] bg-violet-600/5 rounded-full blur-[160px] pointer-events-none z-0" />
        <div className="absolute top-[35%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-600/3 rounded-full blur-[160px] pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Steps Indicator */}
          <div className="flex items-center justify-center gap-4 mb-10 text-xs md:text-sm font-bold uppercase tracking-wider text-zinc-500">
            <span className="flex items-center gap-2 text-violet-400">
              <span className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px]">1</span>
              <span>Checkout</span>
            </span>
            <span className="w-12 h-px bg-zinc-800" />
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center text-[10px]">2</span>
              <span>Payment</span>
            </span>
            <span className="w-12 h-px bg-zinc-800" />
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center text-[10px]">3</span>
              <span>Order Confirmed</span>
            </span>
          </div>

          <div className="text-left mb-8 relative">
            {/* Back Button */}
            <button
              onClick={() => setCheckoutProduct(null)}
              className="absolute right-0 top-0 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800/80 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              ← Back to Shop
            </button>
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Checkout</h1>
            <p className="text-zinc-400 text-sm">Review your order and complete your purchase</p>
          </div>

          {/* Value Props Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 bg-zinc-900/10 border border-zinc-800 rounded-2xl p-4 text-xs font-bold text-zinc-400">
            <span className="flex items-center gap-2">🛡️ 100% Secure Payments</span>
            <span className="flex items-center gap-2">🚚 Instant Delivery</span>
            <span className="flex items-center gap-2">🔄 Easy Returns</span>
            <span className="flex items-center gap-2">📞 24/7 Support</span>
          </div>

          {/* Checkout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
            {/* Left Column (lg:col-span-8) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Delivery Address Section */}
              <div className="bg-[#111319]/80 border border-zinc-900 rounded-[1.8rem] p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-violet-600/10 text-violet-400 flex items-center justify-center text-xs">1</span>
                    Delivery Address
                  </h3>
                  <button
                    onClick={() => {
                      setIsEditingAddress(true);
                      handleLocateUser();
                    }}
                    className="text-[10px] font-extrabold text-violet-400 hover:underline"
                  >
                    + Add New Address
                  </button>
                </div>
                <div className="border border-zinc-900 rounded-xl p-5 bg-[#0e1013] relative transition-all hover:border-zinc-800">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-3 items-start">
                      {/* Location Pin Icon */}
                      <span className="text-lg mt-0.5">📍</span>
                      <div className="space-y-2 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black bg-violet-600/15 text-violet-400 px-2 py-0.5 rounded uppercase tracking-wide">
                            Default
                          </span>
                          <p className="text-sm font-extrabold text-white">{localStorage.getItem('userName') || 'Rohit Sharma'}</p>
                        </div>
                        {isEditingAddress ? (
                          <div className="space-y-3 mt-2 w-full">
                            <textarea
                              required
                              value={checkoutAddress}
                              onChange={e => setCheckoutAddress(e.target.value)}
                              placeholder="Enter full shipping address..."
                              className="w-full bg-[#16181b] border border-zinc-900 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-violet-500 transition-all min-h-[85px] resize-none"
                            />
                            <button
                              onClick={() => setIsEditingAddress(false)}
                              className="bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-[10px] py-1.5 px-4 rounded-lg transition-all uppercase tracking-widest"
                            >
                              Save Address
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs text-zinc-300 leading-relaxed font-medium max-w-md">
                            {checkoutAddress || "No address set. Click Change or Locate Me to add address."}
                          </p>
                        )}
                        <p className="text-[11px] text-zinc-500 font-bold mt-1">+1 (555) 123-4567</p>
                      </div>
                    </div>

                    {!isEditingAddress && (
                      <button
                        onClick={() => setIsEditingAddress(true)}
                        className="text-xs font-extrabold text-violet-400 hover:text-violet-300 transition-colors uppercase tracking-wider bg-transparent border-0 cursor-pointer"
                      >
                        Change
                      </button>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-900/60 flex items-center justify-between">
                    <button
                      onClick={handleLocateUser}
                      className="bg-[#16181b] hover:bg-zinc-800 text-white font-extrabold text-[10px] py-2 px-4 rounded-xl transition-all border border-zinc-900 hover:border-zinc-850 uppercase tracking-widest flex items-center gap-1.5 cursor-pointer"
                    >
                      📍 Locate Me
                    </button>
                  </div>
                </div>
              </div>

              {/* Delivery Options Section */}
              <div className="bg-[#111319]/80 border border-zinc-900 rounded-[1.8rem] p-6 space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-violet-600/10 text-violet-400 flex items-center justify-center text-xs">2</span>
                  Delivery Options
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className={`flex items-start gap-3 border rounded-xl p-4 cursor-pointer transition-all ${deliveryOption === 'Standard' ? 'border-violet-500 bg-violet-500/5' : 'border-zinc-900 bg-zinc-950/40 hover:border-zinc-850'}`}>
                    <input
                      type="radio"
                      name="delivery"
                      value="Standard"
                      checked={deliveryOption === 'Standard'}
                      onChange={() => setDeliveryOption('Standard')}
                      className="mt-1 accent-violet-600"
                    />
                    <div className="flex-grow">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-black text-white">Standard Delivery</span>
                        <span className="text-xs font-black text-green-400">FREE</span>
                      </div>
                      <p className="text-[10px] text-zinc-500">3-5 Business Days</p>
                      <p className="text-[10px] text-zinc-400 mt-2">Get your order in 3-5 working days</p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 border rounded-xl p-4 cursor-pointer transition-all ${deliveryOption === 'Fast' ? 'border-violet-500 bg-violet-500/5' : 'border-zinc-900 bg-zinc-950/40 hover:border-zinc-850'}`}>
                    <input
                      type="radio"
                      name="delivery"
                      value="Fast"
                      checked={deliveryOption === 'Fast'}
                      onChange={() => setDeliveryOption('Fast')}
                      className="mt-1 accent-violet-600"
                    />
                    <div className="flex-grow">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-black text-white">Fast Delivery</span>
                        <span className="text-xs font-black text-violet-400">₹149</span>
                      </div>
                      <p className="text-[10px] text-zinc-500">1-2 Business Days</p>
                      <p className="text-[10px] text-zinc-400 mt-2">Get your order in 1-2 working days</p>
                    </div>
                  </label>
                </div>
              </div>


            </div>

            {/* Right Column - Order Summary (lg:col-span-4) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#111319]/80 border border-zinc-900 rounded-[1.8rem] p-6 space-y-5">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Order Summary</h3>

                {/* Product details */}
                <div className="flex gap-4 items-start">
                  <div className="w-24 h-24 bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                    {checkoutProduct.images?.[0] ? (
                      <img src={checkoutProduct.images[0]} alt={checkoutProduct.name} className="w-full h-full object-contain rounded-xl" />
                    ) : (
                      <div className="text-4xl">{isProductDiet ? '🥗' : '💊'}</div>
                    )}
                  </div>
                  <div className="flex-grow text-left">
                    <h4 className="text-sm font-bold text-white leading-tight line-clamp-2">{checkoutProduct.name}</h4>
                    
                    {/* Flavor chip */}
                    <div className="mt-1.5">
                      <span className="inline-block bg-white/[0.03] border border-zinc-800/80 rounded-lg px-2.5 py-1 text-[10px] text-zinc-400 font-black uppercase tracking-wider">
                        {selectedFlavor || 'Double Chocolate'}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-500 mt-2 font-bold uppercase tracking-wider">
                      {selectedSize || '1.7kg'} &bull; Qty: {qty}
                    </p>

                    <div className="mt-3">
                      <span className="text-xl font-black text-white">₹{basePrice * qty}</span>
                      {mrpPrice > basePrice && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-zinc-500 line-through text-[11px] font-bold">₹{subtotal}</span>
                          <span className="text-[9px] font-black text-red-400 bg-red-400/10 border border-red-400/25 px-1.5 py-0.5 rounded uppercase tracking-wider">
                            {Math.round(((mrpPrice - basePrice) / mrpPrice) * 100)}% OFF
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-900/60 my-4" />

                {/* Bill details */}
                <div className="space-y-3.5 text-xs text-zinc-400">
                  <div className="flex justify-between font-medium">
                    <span>Subtotal</span>
                    <span className="text-white font-bold">₹{subtotal}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-[#22c55e] font-bold">
                      <span>Discount ({Math.round(((mrpPrice - basePrice) / mrpPrice) * 100)}%)</span>
                      <span>- ₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium">
                    <span>Delivery Charges</span>
                    <span className="text-[#22c55e] font-bold">FREE</span>
                  </div>
                </div>

                <div className="border-t border-zinc-900/60 my-4" />

                {/* Total */}
                <div className="flex justify-between items-baseline text-white">
                  <span className="text-sm font-bold">Total Amount</span>
                  <span className="text-2xl font-black">₹{finalTotal}</span>
                </div>

                {discountAmount > 0 && (
                  <p className="text-[11px] text-violet-400 font-black tracking-wide text-left mt-1.5">
                    You Save ₹{discountAmount} on this order
                  </p>
                )}

                {/* LC Points */}
                <div className="flex justify-between items-center bg-[#13151b] border border-zinc-900 rounded-2xl p-4 text-xs text-zinc-350 font-bold transition-all hover:bg-zinc-900/30 mt-6 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span>You will earn</span>
                    <span className="inline-flex items-center gap-1 text-[#f59e0b]">
                      <span className="w-4 h-4 bg-[#f59e0b]/15 text-[#f59e0b] font-black text-[9px] rounded-full flex items-center justify-center border border-[#f59e0b]/20">🪙</span>
                      {pointsEarned} LC Points
                    </span>
                  </div>
                  <span className="text-zinc-650 text-[10px] font-black">&gt;</span>
                </div>

                {/* Safe badge */}
                <div className="flex items-center gap-3 bg-[#13151b] border border-zinc-900 rounded-2xl p-4 text-left">
                  <div className="w-8 h-8 rounded-xl bg-[#22c55e]/10 text-[#22c55e] flex items-center justify-center flex-shrink-0 border border-[#22c55e]/25">
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-black text-white">Safe & Secure Checkout</p>
                    <p className="text-[10px] text-zinc-500 font-bold mt-0.5">SSL Encrypted Payments</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Footer Pricing / Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#0c0e12]/95 border-t border-zinc-900/90 py-4 px-6 z-40 backdrop-blur-md flex items-center justify-between shadow-2xl">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
            <div className="text-left">
              <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-widest">Total Price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-white">₹{finalTotal}</span>
                {discountAmount > 0 && (
                  <span className="text-green-400 text-[10px] font-bold">Save ₹{discountAmount}</span>
                )}
              </div>
            </div>

            <button
              onClick={() => handleCheckout(checkoutProduct)}
              disabled={checkoutLoading}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-extrabold text-xs py-3.5 px-8 rounded-xl transition-all shadow-lg shadow-violet-500/20 uppercase tracking-widest min-w-[200px]"
            >
              🔒 {checkoutLoading ? 'Processing...' : `Proceed to Pay ₹${finalTotal}`}
            </button>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080a] text-white font-sans relative overflow-x-hidden">
      {/* Page-level Ambient Glows */}
      <div className="absolute top-0 left-[-10%] w-[50%] h-[50%] bg-red-650/5 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="absolute top-[35%] right-[-10%] w-[50%] h-[50%] bg-orange-600/3 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-[20%] w-[40%] h-[40%] bg-red-500/2 rounded-full blur-[140px] pointer-events-none z-0" />      {/* Hero Section */}
      <style>{`
        @keyframes orbitSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbitSpinReverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.04); }
        }
      `}</style>

      <div className="relative overflow-hidden z-10" style={{ minHeight: '600px' }}>
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
          style={{ backgroundImage: `url(${dietBg})`, opacity: isDiet ? 1 : 0 }}
        />
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
          style={{ backgroundImage: `url(${suppBg})`, opacity: isDiet ? 0 : 1 }}
        />


        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
          {/* Tabs */}
          <div className="flex items-center justify-center mb-8">
            <div className="inline-flex bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 gap-1">
              <button
                onClick={() => { setActiveTab('diet'); setSearch(''); }}
                className={`relative flex items-center gap-2.5 px-7 py-3 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer ${isDiet ? 'bg-white/[0.08] text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
              >
                <span>🥗</span>
                <span>Diet Plans</span>
                {isDiet && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />}
              </button>
              <button
                onClick={() => { setActiveTab('supplements'); setSearch(''); }}
                className={`relative flex items-center gap-2.5 px-7 py-3 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer ${!isDiet ? 'bg-white/[0.08] text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
              >
                <span>💊</span>
                <span>Supplements</span>
                {!isDiet && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />}
              </button>
            </div>
          </div>

          {/* Diet Section */}
          {isDiet ? (
            <div className="relative" style={{ minHeight: '440px' }}>

              {/* Left Arrow */}
              <button
                onClick={() => {
                  setActiveDietSlide((prev) => (prev - 1 + dietHeroSlides.length) % dietHeroSlides.length);
                  setDietRotation((r) => r - 360);
                }}
                className="absolute left-[-16px] lg:left-[-44px] top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 border border-white/10 hover:border-green-500/50 text-white hover:bg-green-500/10 transition-all hover:scale-110 cursor-pointer shadow-xl z-40 flex items-center justify-center backdrop-blur-sm"
                aria-label="Previous Slide"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Right Arrow */}
              <button
                onClick={() => {
                  setActiveDietSlide((prev) => (prev + 1) % dietHeroSlides.length);
                  setDietRotation((r) => r + 360);
                }}
                className="absolute right-[-16px] lg:right-[-44px] top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 border border-white/10 hover:border-green-500/50 text-white hover:bg-green-500/10 transition-all hover:scale-110 cursor-pointer shadow-xl z-40 flex items-center justify-center backdrop-blur-sm"
                aria-label="Next Slide"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Hero Content: relative container */}
              <div className="relative flex items-center justify-center" style={{ minHeight: '440px' }}>


                {/* LEFT TEXT OVERLAY */}
                <div className="absolute inset-y-0 left-0 flex items-center z-30 w-full lg:w-[42%] pointer-events-auto">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeDietSlide}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                      className="relative rounded-[2rem] p-6 md:p-8"
                      style={{
                        background: 'linear-gradient(135deg, rgba(0,0,0,0.72) 0%, rgba(10,20,10,0.55) 100%)',
                        backdropFilter: 'blur(22px)',
                        WebkitBackdropFilter: 'blur(22px)',
                        border: '1px solid rgba(34,197,94,0.10)',
                        boxShadow: '0 8px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)'
                      }}
                    >
                      {/* Badge */}
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5"
                        style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
                        <svg className="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                        </svg>
                        <span className="text-green-400 text-[10px] font-extrabold uppercase tracking-[0.15em]">
                          {dietHeroSlides[activeDietSlide].badge}
                        </span>
                      </div>

                      {/* Title */}
                      <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-3 tracking-tight">
                        {dietHeroSlides[activeDietSlide].title}
                      </h1>

                      {/* Subtitle */}
                      <p className="text-zinc-300 text-sm md:text-base leading-relaxed mb-7 font-medium">
                        {dietHeroSlides[activeDietSlide].subtitle}
                      </p>

                      {/* Benefits */}
                      <div className="flex flex-col gap-3">
                        {dietHeroSlides[activeDietSlide].benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-sm font-semibold text-white">
                            <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.30)' }}>
                              <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

              </div>


              {/* Dot Indicators */}
              <div className="flex items-center justify-center gap-2.5 mt-8">
                {dietHeroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (idx !== activeDietSlide) {
                        setDietRotation(r => r + (idx > activeDietSlide ? 360 : -360));
                        setActiveDietSlide(idx);
                      }
                    }}
                    className={`rounded-full transition-all duration-300 ${idx === activeDietSlide
                        ? 'w-7 h-2.5 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.7)]'
                        : 'w-2.5 h-2.5 bg-zinc-700 hover:bg-zinc-500'
                      }`}
                  />
                ))}
              </div>

            </div>
          ) : (
            /* Supplement Section: Classic Static Hero Content */
            <div className="max-w-lg">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-widest mb-5">
                ⚡ Premium Supplements
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-3">
                Choose Your <br />
                <span className="text-red-400">Health Path</span>
              </h1>
              <p className="text-gray-300 text-base leading-relaxed">
                Premium supplements for better performance, muscle building, and recovery.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Search & Grid Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20 relative z-15">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-1 h-6 rounded-full ${isDiet ? 'bg-green-500' : 'bg-red-500'}`} />
            <p className="text-gray-400 text-sm font-semibold uppercase tracking-widest">
              {isDiet ? 'Available Diet Plans' : 'Available Supplements'}
            </p>
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`🔍 Search ${isDiet ? 'diet plans...' : 'supplements...'}`}
            className="w-full sm:max-w-xs bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500 text-zinc-300"
          />
        </div>

        {/* Supplement Filters */}
        {!isDiet && (
          <div className="bg-white/[0.01] border border-white/5 backdrop-blur-xl rounded-2xl p-4 mb-8 flex flex-col gap-4">
            {/* Category Filter */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">Goal / Category</span>
              <div className="flex flex-wrap gap-2">
                {['All', 'Whey Protein', 'Creatine', 'Mass Gainer', 'Pre Workout', 'Multivitamin', 'Fat Burner', 'BCAA', 'Fish Oil'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all border ${selectedCategory === cat
                      ? 'bg-violet-600/10 text-violet-400 border-violet-500 shadow-[0_0_15px_rgba(109,40,217,0.15)] scale-[1.02]'
                      : 'bg-zinc-900/50 text-zinc-400 hover:text-white border-zinc-800/80 hover:border-zinc-700/40'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Brand Filter */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">Brand</span>
                <select
                  value={selectedBrand}
                  onChange={e => setSelectedBrand(e.target.value)}
                  className="bg-zinc-900/50 border border-zinc-800/85 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500/50 font-bold"
                >
                  <option value="All">All Brands</option>
                  {uniqueBrands.filter(b => b !== 'All').map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">Price Range</span>
                <select
                  value={priceRange}
                  onChange={e => setPriceRange(e.target.value)}
                  className="bg-zinc-900/50 border border-zinc-800/85 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500/50 font-bold"
                >
                  <option value="All">All Prices</option>
                  <option value="under_2000">Under ₹2,000</option>
                  <option value="2000_5000">₹2,000 - ₹5,000</option>
                  <option value="over_5000">Over ₹5,000</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center">
            <div className={`animate-spin w-8 h-8 border-4 ${isDiet ? 'border-green-500' : 'border-red-500'} border-t-transparent rounded-full mx-auto mb-3`} />
            <p className="text-gray-400">Loading catalog...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-24 text-center border border-zinc-850 rounded-2xl bg-zinc-900/20">
            <p className="text-3xl mb-2">🍏</p>
            <p className="text-gray-400 font-medium">No live listings found matching your filters</p>
          </div>
        ) : (
          <div className={isDiet ? "grid grid-cols-1 lg:grid-cols-2 gap-8" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"}>
            {filteredItems.map((item) => {
              const price = item.purchaseMode === 'Subscription' ? item.monthlyPrice : (item.sellingPrice || item.oneTimePrice || 133);
              const cleanTitle = item.name.split(" - ")[0];
              const cleanDesc = (item.shortDescription || item.description || "")
                .replace(/^(short\s+summary|summary):\s*/i, "");

              if (isDiet) {
                return (
                  <div
                    key={item._id}
                    onClick={() => { setSelectedProduct(item); setPurchaseType(item.purchaseMode === 'Subscription' ? 'Monthly' : 'One Time'); }}
                    className="group relative flex flex-col sm:flex-row bg-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-green-500/40 rounded-[1.8rem] p-6 hover:shadow-[0_0_30px_rgba(34,197,94,0.08)] transition-all duration-300 shadow-2xl cursor-pointer gap-6 text-left"
                  >
                    {/* Left: Image Container */}
                    <div className="relative w-full sm:w-[30%] aspect-[4/3] sm:aspect-auto sm:self-stretch rounded-2xl overflow-hidden bg-zinc-950 flex-shrink-0 border border-zinc-900">
                      {item.images?.[0] ? (
                        <img src={item.images[0]} alt={cleanTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl bg-zinc-900">🥗</div>
                      )}
                      {/* Live Badge */}
                      <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-[10px] font-extrabold text-white px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5 z-10">
                        <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>
                        <span>LIVE</span>
                      </span>
                    </div>

                    {/* Right: Info */}
                    <div className="flex flex-col justify-between flex-grow">
                      <div>
                        {/* Live Badge Group */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#0d1c12] border border-[#142d1a] text-[#22c55e] text-[9.5px] font-black uppercase tracking-wider mb-2.5">
                          {item.brand || 'LIFECELL.FITNESS LIVE'}
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-white leading-tight mb-1.5 tracking-tight group-hover:text-green-400 transition-colors">
                          {cleanTitle}
                        </h3>

                        {/* Description */}
                        <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2 mb-4 font-normal">
                          {cleanDesc || "A balanced diet plan designed to support your fitness journey with nutritious meals."}
                        </p>

                        {/* Specs grid */}
                        <div className="grid grid-cols-4 gap-2 mb-4">
                          <div className="flex flex-col items-start">
                            <svg className="w-5 h-5 text-[#22c55e]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 22c1.25-3.25 4.5-9.5 9-13.5 4.5-4 9-5.5 10-4.5s-.5 5.5-4.5 10c-4 4.5-10.25 7.75-13.5 9z" />
                              <path d="M2 22l7-7" />
                            </svg>
                            <span className="text-xs font-bold text-white mt-1.5 leading-none">{item.foodType || 'Vegetarian'}</span>
                            <span className="text-[10px] text-zinc-550 mt-1 font-medium">Food Type</span>
                          </div>

                          <div className="flex flex-col items-start border-l border-zinc-800/80 pl-3">
                            <svg className="w-5 h-5 text-[#22c55e]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2 .5 3.5 1.5 4.5 2 2 3 5 1.5 7.5A5.5 5.5 0 118.5 14.5z" />
                            </svg>
                            <span className="text-xs font-bold text-white mt-1.5 leading-none">{item.nutritionInfo?.calories || '1200'} kcal</span>
                            <span className="text-[10px] text-zinc-550 mt-1 font-medium">Calories</span>
                          </div>

                          <div className="flex flex-col items-start border-l border-zinc-800/80 pl-3">
                            <svg className="w-5 h-5 text-[#22c55e]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="9" />
                              <polyline points="12 6 12 12 16 12" />
                            </svg>
                            <span className="text-xs font-bold text-white mt-1.5 leading-none">{item.duration || '1-Day Plan'}</span>
                            <span className="text-[10px] text-zinc-550 mt-1 font-medium">Meal Plan</span>
                          </div>

                          <div className="flex flex-col items-start border-l border-zinc-800/80 pl-3">
                            <svg className="w-5 h-5 text-[#22c55e]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 20v-6m4 6V9m4 11V5" />
                            </svg>
                            <span className="text-xs font-bold text-white mt-1.5 leading-none">Balanced</span>
                            <span className="text-[10px] text-zinc-550 mt-1 font-medium">Nutrition</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-3.5 border-t border-zinc-800/80 mt-auto">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl font-bold text-white tracking-tight">₹{price}</span>
                          <span className="flex items-center px-2.5 py-0.5 text-[10px] font-bold bg-[#0d1c12] border border-[#142d1a] text-[#22c55e] rounded-full">
                            <svg className="w-3 h-3 text-[#22c55e] mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.5 1.5 0 002.122 0l4.318-4.318a1.5 1.5 0 000-2.122L11.159 3.659A2.25 2.25 0 009.568 3z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                            </svg>
                            Affordable Plan
                          </span>
                        </div>

                        <button className="bg-[#22c55e] hover:bg-green-500 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-1.5 transition-all duration-300 shadow-md whitespace-nowrap flex-shrink-0">
                          <span>View Plan Details</span>
                          <svg className="w-3.5 h-3.5 text-white flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              } else {
                // Return vertical Supplement card matching the requested purple/violet design
                const discount = item.originalPrice > item.sellingPrice ? Math.round(((item.originalPrice - item.sellingPrice) / item.originalPrice) * 100) : 0;
                const savings = item.originalPrice > item.sellingPrice ? (item.originalPrice - item.sellingPrice) : 0;
                return (
                  <div
                    key={item._id}
                    onClick={() => { setSelectedProduct(item); setPurchaseType('One Time'); }}
                    className="group bg-[#111319] border border-[#1d2028] rounded-[1.8rem] p-3.5 flex flex-col justify-between relative hover:border-violet-500/40 hover:shadow-[0_0_35px_rgba(109,40,217,0.18)] transition-all duration-300 shadow-2xl cursor-pointer text-left"
                  >
                    {/* Top Badges */}
                    {discount > 0 && (
                      <span className="absolute top-5 left-5 bg-[#8b5cf6] text-white text-[9.5px] font-black uppercase px-2 py-1 rounded-md z-10 tracking-widest shadow-md">
                        {discount}% OFF
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toast.success("Added to Wishlist!"); }}
                      className="absolute top-5 right-5 text-white hover:text-red-500 bg-[#0d0e12]/60 backdrop-blur-md rounded-full p-2 transition-all z-10 hover:scale-110 border border-white/5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>

                    {/* Product Image Container with studio purple backdrop (aspect-1.3 for lower height) */}
                    <div className="aspect-[1.3] w-full rounded-xl overflow-hidden bg-gradient-to-b from-[#8062f2] to-[#5235be] flex items-center justify-center mb-3 border border-white/5 relative shadow-inner">
                      {item.images?.[0] ? (
                        <img src={item.images[0]} alt={cleanTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="text-5xl text-white/90">💊</div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        {/* Brand Name */}
                        <span className="text-[9px] font-extrabold text-[#9333ea] uppercase tracking-widest block mb-0.5">
                          {item.brand || 'OPTIMUM NUTRITION'}
                        </span>
                        {/* Product Title */}
                        <h3 className="text-base font-black text-white tracking-tight leading-tight mb-1 truncate group-hover:text-violet-400 transition-colors" title={cleanTitle}>
                          {cleanTitle}
                        </h3>
                        {/* Description - 1 line to reduce height */}
                        <p className="text-[#8a92a6] text-[11px] leading-relaxed line-clamp-1 mb-3 font-normal">
                          {cleanDesc || "Premium whey protein powder for muscle recovery, lean muscle support."}
                        </p>
                      </div>

                      <div>
                        {/* Rating & Authenticity */}
                        <div className="flex items-center justify-between text-[9.5px] text-gray-400 font-bold mb-3 border-t border-[#1d2028] pt-2.5">
                          <div className="flex items-center gap-0.5">
                            <span className="text-yellow-400 text-xs">★</span>
                            <span className="font-extrabold text-white">4.7</span>
                            <span className="text-gray-500 font-medium">(98)</span>
                          </div>
                          <span className="text-[#1d2028]">|</span>
                          <div className="flex items-center gap-1 text-violet-400">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span className="text-[8.5px] font-black uppercase tracking-wider">100% Authentic</span>
                          </div>
                          <span className="text-[#1d2028]">|</span>
                          <div className="flex items-center gap-1 text-yellow-500">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                            <span className="text-[8.5px] font-black uppercase tracking-wider">Premium</span>
                          </div>
                        </div>


                        {/* Price & Stock status */}
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="flex items-baseline">
                              <span className="text-lg font-black text-white">₹{item.sellingPrice || item.oneTimePrice}</span>
                              {item.originalPrice > item.sellingPrice && (
                                <span className="text-gray-500 line-through text-[10px] font-bold ml-1.5">₹{item.originalPrice}</span>
                              )}
                            </div>
                            {savings > 0 && (
                              <p className="text-violet-400 text-[9px] font-extrabold mt-0.5">
                                You Save ₹{savings} ({discount}% OFF)
                              </p>
                            )}
                          </div>
                          <span className={`text-[8.5px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider flex items-center gap-1 ${item.stock > 0 ? 'bg-[#0f291e] text-[#4ade80] border-[#143f2a]' : 'bg-rose-950/20 text-[#f87171] border-rose-900/40'
                            }`}>
                            {item.stock > 0 && (
                              <svg className="w-2 h-2 text-[#4ade80]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {item.stock > 0 ? `In Stock (${item.stock})` : 'Out of Stock'}
                          </span>
                        </div>

                        {/* Action buttons row */}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const existing = JSON.parse(localStorage.getItem("cart_items") || "[]");
                              const itemIndex = existing.findIndex(i => i._id === item._id);
                              if (itemIndex > -1) {
                                existing[itemIndex].qty = (existing[itemIndex].qty || 1) + 1;
                              } else {
                                existing.push({
                                  _id: item._id,
                                  name: item.name,
                                  brand: item.brand,
                                  price: item.sellingPrice || item.oneTimePrice || 0,
                                  image: item.images?.[0] || '',
                                  qty: 1
                                });
                              }
                              localStorage.setItem("cart_items", JSON.stringify(existing));
                              window.dispatchEvent(new Event("cart-updated"));
                              toast.success("Added to Cart!");
                            }}
                            className="p-2.5 rounded-xl border border-[#232936] bg-[#161921] hover:bg-[#1f2430] text-violet-400 flex items-center justify-center hover:scale-105 transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => { setSelectedProduct(item); setPurchaseType('One Time'); }}
                            className="flex-grow bg-[#6349c7] hover:bg-[#5235be] text-white font-extrabold text-[10px] py-2.5 rounded-xl transition-all shadow-[0_4px_15px_rgba(99,73,199,0.2)] flex items-center justify-center gap-1.5 uppercase tracking-widest hover:scale-[1.01]"
                          >
                            <span>View Details</span>
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-[#0e1013] z-50 overflow-y-auto" data-lenis-prevent>
          <div className="w-full min-h-screen p-6 md:p-12 relative grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">

            {/* Close Button */}
            <button
              onClick={() => { setSelectedProduct(null); setCheckoutAddress(''); }}
              className="absolute top-6 right-6 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2.5 transition-all cursor-pointer z-20"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Left Column: Image, Benefits, Description, How to use, Ingredients (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-8 text-left">

              {/* Product Image Card */}
              <div className="relative aspect-square w-full rounded-[2rem] overflow-hidden border border-zinc-900 bg-zinc-950 flex items-center justify-center">
                {selectedProduct.images?.[activeImageIndex] ? (
                  <img src={selectedProduct.images[activeImageIndex]} alt="" className="w-full h-full object-cover" />
                ) : selectedProduct.images?.[0] ? (
                  <img src={selectedProduct.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-7xl">{isDiet ? '🥗' : '💊'}</div>
                )}
                {/* Brand Badge Overlay */}
                <span className="absolute top-6 left-6 text-[10px] font-black uppercase bg-red-600/10 border border-red-500/20 text-red-500 px-3.5 py-1.5 rounded-lg backdrop-blur-md">
                  {selectedProduct.brand || (isDiet ? 'NUTRITION PLAN' : 'PREMIUM SUPPLEMENT')}
                </span>
              </div>

              {/* Thumbnails Carousel */}
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
                {selectedProduct.images?.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border flex-shrink-0 cursor-pointer transition-all ${activeImageIndex === idx ? 'border-red-500 ring-2 ring-red-500/20 scale-95' : 'border-zinc-900 bg-zinc-900 hover:border-zinc-700'
                      }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
                {/* Fallbacks if only 1 image */}
                {(!selectedProduct.images || selectedProduct.images.length <= 1) && [1, 2, 3, 4].map((n) => (
                  <div key={n} className="w-16 h-16 rounded-xl overflow-hidden border border-zinc-900/50 bg-zinc-900/50 flex-shrink-0 flex items-center justify-center text-xs text-zinc-650">
                    📸
                  </div>
                ))}
              </div>

              {/* Key Benefits Grid */}
              <div className="border border-zinc-900 rounded-[1.8rem] p-6 bg-zinc-900/10 space-y-4">
                <h4 className="text-xs font-black tracking-widest text-zinc-400 uppercase">Key Benefits</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <span className="text-red-500 text-lg">💪</span>
                    <div>
                      <p className="text-xs font-extrabold text-white">24g Premium Protein</p>
                      <p className="text-[10px] text-zinc-500">Per Serving</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-red-500 text-lg">⚡</span>
                    <div>
                      <p className="text-xs font-extrabold text-white">Supports Recovery</p>
                      <p className="text-[10px] text-zinc-500">Post-Workout Support</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-red-500 text-lg">🏋️</span>
                    <div>
                      <p className="text-xs font-extrabold text-white">Builds Lean Muscle</p>
                      <p className="text-[10px] text-zinc-500">Helps in Muscle Growth</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-red-500 text-lg">🍃</span>
                    <div>
                      <p className="text-xs font-extrabold text-white">5.5g BCAAs</p>
                      <p className="text-[10px] text-zinc-500">Supports Strength</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Description */}
              <div className="space-y-3">
                <h4 className="text-xs font-black tracking-widest text-zinc-400 uppercase">Product Description</h4>
                <p className="text-sm text-zinc-400 leading-relaxed font-normal">
                  {selectedProduct.description || selectedProduct.shortDescription || "Optimum Nutrition Gold Standard 100% Whey is a premium whey protein supplement suitable for gym users, athletes and fitness beginners."}
                </p>
              </div>

              {/* How to Use Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-black tracking-widest text-zinc-400 uppercase">How To Use</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border border-zinc-900 rounded-xl bg-zinc-950/40">
                    <span className="text-red-500 text-xs font-black">01</span>
                    <p className="text-[11px] text-zinc-400 mt-1">Take 1 Scoop (30.4g)</p>
                  </div>
                  <div className="p-3 border border-zinc-900 rounded-xl bg-zinc-950/40">
                    <span className="text-red-500 text-xs font-black">02</span>
                    <p className="text-[11px] text-zinc-400 mt-1">Add to 180-240ml cold water/milk</p>
                  </div>
                  <div className="p-3 border border-zinc-900 rounded-xl bg-zinc-950/40">
                    <span className="text-red-500 text-xs font-black">03</span>
                    <p className="text-[11px] text-zinc-400 mt-1">Shake or blend for 20-30s</p>
                  </div>
                  <div className="p-3 border border-zinc-900 rounded-xl bg-zinc-950/40">
                    <span className="text-red-500 text-xs font-black">04</span>
                    <p className="text-[11px] text-zinc-400 mt-1">Enjoy post workout or daily</p>
                  </div>
                </div>
              </div>

              {/* Ingredients */}
              <div className="space-y-3">
                <h4 className="text-xs font-black tracking-widest text-zinc-400 uppercase">Ingredients</h4>
                <p className="text-xs text-zinc-550 leading-relaxed">
                  {selectedProduct.ingredients || "Protein Blend (Whey Protein Isolate, Whey Protein Concentrate, Whey Peptides), Cocoa Powder, Lecithin, Natural and Artificial Flavors, Acesulfame Potassium, Lactase."}
                </p>
              </div>

            </div>

            {/* Right Column: Title, Flavor/Size Chips, Specs grid, Prices, Checkout, Accordions (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-6 text-left lg:pl-4">

              <div>
                {/* Brand name */}
                <span className="text-xs font-extrabold text-red-500 uppercase tracking-widest block mb-1">
                  {selectedProduct.brand || 'OPTIMUM NUTRITION'}
                </span>
                {/* Product Name */}
                <h2 className="text-3xl font-black text-white leading-tight mb-2 tracking-tight">
                  {selectedProduct.name}
                </h2>
                {/* Store Info & Review */}
                <div className="flex flex-wrap items-center gap-4 text-xs mt-2">
                  <p className="text-zinc-400">
                    By Store: <span className="text-red-500 font-bold hover:underline cursor-pointer">{selectedProduct.healthStore?.storeName || 'HealthFuel Nutrition Store'}</span>
                  </p>
                  <span className="text-zinc-650">|</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-yellow-400 text-sm">★</span>
                    <span className="font-extrabold text-white">4.8 Rating</span>
                    <span className="text-zinc-500">(120 Reviews)</span>
                  </div>
                </div>
              </div>

              {/* Secondary Badges */}
              <div className="flex gap-2">
                <span className="bg-zinc-900/40 border border-zinc-900 text-[10px] font-black uppercase text-zinc-450 px-3 py-1.5 rounded-lg flex items-center gap-1">
                  ⭐ Premium Category
                </span>
                <span className="bg-zinc-900/40 border border-zinc-900 text-[10px] font-black uppercase text-zinc-450 px-3 py-1.5 rounded-lg flex items-center gap-1">
                  🛡️ 100% Authentic
                </span>
              </div>

              {/* Short Description */}
              <p className="text-sm text-zinc-400 leading-relaxed">
                {selectedProduct.shortDescription || 'Optimum Nutrition Gold Standard 100% Whey is a premium whey protein supplement suitable for gym users, athletes and fitness beginners.'}
              </p>

              {/* Variant Select: FLAVORS CHIPS */}
              {!isDiet && selectedProduct.productType === 'Supplement' && availableFlavors.length > 0 && (
                <div className="space-y-3">
                  <label className="block text-xs font-black tracking-widest text-zinc-450 uppercase">Select Flavor</label>
                  <div className="flex flex-wrap gap-2">
                    {availableFlavors.map(f => {
                      const isSelected = selectedFlavor === f;
                      return (
                        <button
                          key={f}
                          type="button"
                          onClick={() => {
                            setSelectedFlavor(f);
                            const sizeForFlavor = selectedProduct.variants.find(v => v.flavor === f && v.size === selectedSize);
                            if (!sizeForFlavor) {
                              const fallbackVariant = selectedProduct.variants.find(v => v.flavor === f);
                              if (fallbackVariant) setSelectedSize(fallbackVariant.size);
                            }
                          }}
                          className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${isSelected
                            ? 'bg-red-500/10 border-red-500 text-red-450'
                            : 'bg-zinc-900/40 border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700'
                            }`}
                        >
                          <span>{f}</span>
                          {isSelected && <span className="text-[10px]">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Variant Select: SIZES CHIPS */}
              {!isDiet && selectedProduct.productType === 'Supplement' && availableSizes.length > 0 && (
                <div className="space-y-3">
                  <label className="block text-xs font-black tracking-widest text-zinc-450 uppercase">Select Size / Pack</label>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map(s => {
                      const isSelected = selectedSize === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            setSelectedSize(s);
                            const flavorForSize = selectedProduct.variants.find(v => v.size === s && v.flavor === selectedFlavor);
                            if (!flavorForSize) {
                              const fallbackVariant = selectedProduct.variants.find(v => v.size === s);
                              if (fallbackVariant) setSelectedFlavor(fallbackVariant.flavor);
                            }
                          }}
                          className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${isSelected
                            ? 'bg-red-500/10 border-red-500 text-red-450'
                            : 'bg-zinc-900/40 border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700'
                            }`}
                        >
                          <span>{s}</span>
                          {isSelected && <span className="text-[10px]">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Specs Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-zinc-950/40 p-4 border border-zinc-900/70 rounded-2xl">
                <div className="text-left">
                  <p className="text-[9px] font-bold text-zinc-550 uppercase tracking-wider">Quantity / Size</p>
                  <p className="text-xs font-extrabold text-white mt-1">
                    {activeVariant ? activeVariant.size : (selectedProduct.quantity || '1.7 kg')}
                  </p>
                </div>
                <div className="text-left border-l border-zinc-900/70 pl-3">
                  <p className="text-[9px] font-bold text-zinc-550 uppercase tracking-wider">Flavor</p>
                  <p className="text-xs font-extrabold text-white mt-1 truncate max-w-[100px]">
                    {activeVariant ? activeVariant.flavor : (selectedProduct.flavor || 'Double Chocolate')}
                  </p>
                </div>
                <div className="text-left border-l border-zinc-900/70 pl-3">
                  <p className="text-[9px] font-bold text-zinc-550 uppercase tracking-wider">Servings</p>
                  <p className="text-xs font-extrabold text-white mt-1">54 Servings</p>
                </div>
                <div className="text-left border-l border-zinc-900/70 pl-3">
                  <p className="text-[9px] font-bold text-zinc-550 uppercase tracking-wider">Scoop Size</p>
                  <p className="text-xs font-extrabold text-white mt-1">30.4g (1 Scoop)</p>
                </div>
              </div>

              {/* Pricing & Availability Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-950/40 p-5 border border-zinc-900/70 rounded-2xl">
                <div>
                  <p className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest mb-1.5">Pricing Details</p>
                  {selectedProduct.purchaseMode === 'Subscription' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPurchaseType('One Time')}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-extrabold transition-all cursor-pointer ${purchaseType === 'One Time' ? 'bg-white text-black border-zinc-900' : 'border-zinc-900 bg-zinc-900/60 text-gray-400 hover:text-white'
                          }`}
                      >
                        One-time (₹{selectedProduct.oneTimePrice})
                      </button>
                      <button
                        onClick={() => setPurchaseType('Monthly')}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-extrabold transition-all cursor-pointer ${purchaseType === 'Monthly' ? (isDiet ? 'bg-green-500 text-white border-green-500' : 'bg-red-500 text-white border-red-500') : 'border-zinc-900 bg-zinc-900/60 text-gray-400 hover:text-white'
                          }`}
                      >
                        Monthly (₹{selectedProduct.monthlyPrice})
                      </button>
                    </div>
                  ) : (
                    <div>
                      {activeVariant ? (
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-zinc-500 line-through text-xs font-bold">₹{activeVariant.mrp}</span>
                            <span className="text-2xl font-black text-white">₹{activeVariant.sellingPrice}</span>
                          </div>
                          {activeVariant.mrp > activeVariant.sellingPrice && (
                            <p className="text-[10.5px] text-red-500 font-extrabold mt-0.5 bg-red-500/5 px-2 py-0.5 rounded-md inline-block border border-red-500/10">
                              Save ₹{activeVariant.mrp - activeVariant.sellingPrice} ({Math.round(((activeVariant.mrp - activeVariant.sellingPrice) / activeVariant.mrp) * 100)}% OFF)
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-2xl font-black text-white">₹{selectedProduct.sellingPrice || selectedProduct.oneTimePrice}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-center items-start md:items-end">
                  <p className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest mb-1.5">Availability</p>
                  {activeVariant ? (
                    activeVariant.stock > 0 ? (
                      <span className="bg-[#0e2c1e] text-[#4ade80] border border-[#165a38] text-[10px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
                        <span>In Stock ({activeVariant.stock} available)</span>
                      </span>
                    ) : (
                      <span className="bg-[#2d0f0f] text-[#f87171] border border-[#5c1c1c] text-[10px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f87171]" />
                        <span>Out of Stock</span>
                      </span>
                    )
                  ) : (
                    selectedProduct.stock > 0 ? (
                      <span className="bg-[#0e2c1e] text-[#4ade80] border border-[#165a38] text-[10px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
                        <span>In Stock ({selectedProduct.stock} available)</span>
                      </span>
                    ) : (
                      <span className="bg-[#2d0f0f] text-[#f87171] border border-[#5c1c1c] text-[10px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f87171]" />
                        <span>Out of Stock</span>
                      </span>
                    )
                  )}
                  {activeVariant && activeVariant.stock <= (activeVariant.lowStockAlert || 5) && activeVariant.stock > 0 && (
                    <span className="text-[9.5px] text-yellow-500 font-bold mt-1.5">⚠️ Low Stock Alert (limit is {activeVariant.lowStockAlert || 5})</span>
                  )}
                </div>
              </div>

              {/* Delivery Address Input */}
              <div className="space-y-2 bg-zinc-950/40 p-4 border border-zinc-900 rounded-2xl">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Delivery Address *</label>
                  <button
                    type="button"
                    onClick={handleLocateUser}
                    className="text-[9px] font-black uppercase text-red-500 hover:text-red-400 flex items-center gap-1 cursor-pointer bg-white/5 border border-zinc-900 px-2 py-1 rounded-md hover:bg-white/10 transition-all"
                  >
                    📍 Locate Me
                  </button>
                </div>
                <input
                  required
                  value={checkoutAddress}
                  onChange={e => setCheckoutAddress(e.target.value)}
                  placeholder="Enter full shipping address..."
                  className="w-full bg-[#16181b] border border-zinc-900 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-all"
                />
              </div>

              {/* Quantity Counter & Add To Cart / Buy Now Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                {/* Counter */}
                <div className="flex items-center bg-zinc-900 border border-zinc-900 rounded-xl overflow-hidden h-[44px]">
                  <button
                    type="button"
                    onClick={() => setCartQty(q => Math.max(1, q - 1))}
                    className="px-4 py-2 text-zinc-400 hover:text-white transition-all font-black text-sm h-full"
                  >
                    -
                  </button>
                  <span className="px-3 text-sm font-extrabold text-white w-10 text-center">{cartQty}</span>
                  <button
                    type="button"
                    onClick={() => setCartQty(q => q + 1)}
                    className="px-4 py-2 text-zinc-400 hover:text-white transition-all font-black text-sm h-full"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const existing = JSON.parse(localStorage.getItem("cart_items") || "[]");
                    const itemIndex = existing.findIndex(i => i._id === selectedProduct._id);
                    if (itemIndex > -1) {
                      existing[itemIndex].qty = (existing[itemIndex].qty || 1) + cartQty;
                    } else {
                      existing.push({
                        _id: selectedProduct._id,
                        name: selectedProduct.name,
                        brand: selectedProduct.brand,
                        price: selectedProduct.sellingPrice || selectedProduct.oneTimePrice || 0,
                        image: selectedProduct.images?.[0] || '',
                        qty: cartQty
                      });
                    }
                    localStorage.setItem("cart_items", JSON.stringify(existing));
                    window.dispatchEvent(new Event("cart-updated"));
                    toast.success("Added to Cart!");
                  }}
                  className="flex-grow w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer h-[44px] uppercase tracking-wider"
                >
                  🛒 Add to Cart
                </button>

                {/* Buy Now button */}
                <button
                  onClick={() => {
                    const token = localStorage.getItem('userToken');
                    if (!token) {
                      toast.error('Please login first to purchase plans or supplements.');
                      navigate('/login');
                    } else {
                      setCheckoutProduct(selectedProduct);
                    }
                  }}
                  disabled={checkoutLoading}
                  className="flex-grow w-full sm:w-auto border border-red-500/40 hover:border-red-500 bg-[#0e1013] text-red-500 font-extrabold text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer h-[44px] uppercase tracking-wider"
                >
                  ⚡ {checkoutLoading ? 'Processing...' : 'Buy Now'}
                </button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-between gap-3 text-gray-500 text-[9px] font-bold uppercase tracking-wider border-t border-zinc-900 pt-4">
                <span className="flex items-center gap-1.5">🛡️ 100% Secure Payments</span>
                <span className="flex items-center gap-1.5">🚚 Instant Delivery</span>
                <span className="flex items-center gap-1.5">🤝 Trusted by Thousands</span>
                <span className="flex items-center gap-1.5">🔄 Easy Returns</span>
                <span className="flex items-center gap-1.5">📞 24/7 Support</span>
              </div>

              {/* Accordions */}
              <div className="border border-zinc-900 rounded-2xl overflow-hidden divide-y divide-zinc-900">

                {/* Nutrition Facts */}
                <div className="bg-zinc-950/20">
                  <button
                    type="button"
                    onClick={() => setActiveAccordion(activeAccordion === 'nutrition' ? null : 'nutrition')}
                    className="w-full px-5 py-4 flex justify-between items-center text-xs font-black tracking-widest text-zinc-300 uppercase hover:text-white transition-all cursor-pointer"
                  >
                    <span>Nutrition Facts</span>
                    <span className="text-[10px]">{activeAccordion === 'nutrition' ? '▼' : '▶'}</span>
                  </button>
                  {activeAccordion === 'nutrition' && (
                    <div className="px-5 pb-5 text-xs text-zinc-400 space-y-2.5 border-t border-zinc-900 pt-3">
                      <p className="text-[10px] font-bold uppercase text-zinc-550 border-b border-zinc-900 pb-1">Nutrition Information per serving</p>
                      <div className="flex justify-between border-b border-zinc-900 pb-1">
                        <span>Calories</span>
                        <span className="font-bold text-white">{selectedProduct.nutritionInfo?.calories || '120'} kcal</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-900 pb-1">
                        <span>Protein</span>
                        <span className="font-bold text-white">{selectedProduct.nutritionInfo?.protein || '24g'}</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-900 pb-1">
                        <span>Carbs</span>
                        <span className="font-bold text-white">{selectedProduct.nutritionInfo?.carbs || '3g'}</span>
                      </div>
                      <div className="flex justify-between pb-1">
                        <span>Fat</span>
                        <span className="font-bold text-white">{selectedProduct.nutritionInfo?.fat || '1g'}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Information */}
                <div className="bg-zinc-950/20">
                  <button
                    type="button"
                    onClick={() => setActiveAccordion(activeAccordion === 'info' ? null : 'info')}
                    className="w-full px-5 py-4 flex justify-between items-center text-xs font-black tracking-widest text-zinc-300 uppercase hover:text-white transition-all cursor-pointer"
                  >
                    <span>Additional Information</span>
                    <span className="text-[10px]">{activeAccordion === 'info' ? '▼' : '▶'}</span>
                  </button>
                  {activeAccordion === 'info' && (
                    <div className="px-5 pb-5 text-xs text-zinc-400 space-y-2 border-t border-zinc-900 pt-3">
                      <p><strong>Brand:</strong> {selectedProduct.brand || 'Optimum Nutrition'}</p>
                      <p><strong>Category:</strong> {selectedProduct.category || 'Whey Protein'}</p>
                      <p><strong>Returns:</strong> {selectedProduct.isReturnable ? 'Easy returns available within 7 days' : 'Non-returnable product'}</p>
                      <p><strong>Delivery:</strong> Available in current city location</p>
                    </div>
                  )}
                </div>

                {/* Shipping & Returns */}
                <div className="bg-zinc-950/20">
                  <button
                    type="button"
                    onClick={() => setActiveAccordion(activeAccordion === 'shipping' ? null : 'shipping')}
                    className="w-full px-5 py-4 flex justify-between items-center text-xs font-black tracking-widest text-zinc-300 uppercase hover:text-white transition-all cursor-pointer"
                  >
                    <span>Shipping & Returns</span>
                    <span className="text-[10px]">{activeAccordion === 'shipping' ? '▼' : '▶'}</span>
                  </button>
                  {activeAccordion === 'shipping' && (
                    <div className="px-5 pb-5 text-xs text-zinc-400 border-t border-zinc-900 pt-3 leading-relaxed">
                      Delivery is handled locally and usually takes between 1-2 hours depending on distance from the store location. Refused deliveries will not be refunded.
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* You May Also Like Section */}
            <div className="lg:col-span-12 border-t border-zinc-900/60 pt-8 mt-4 space-y-6 text-left">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-xs font-black tracking-widest text-zinc-300 uppercase">You May Also Like</h3>
                <button type="button" className="text-red-500 hover:text-red-400 font-extrabold text-xs flex items-center gap-1.5 uppercase tracking-widest transition-all">
                  <span>View All</span>
                  <span className="text-sm">→</span>
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Product 1 */}
                <div className="bg-[#0c0d10] border border-zinc-900/60 rounded-2xl p-4 flex flex-col justify-between relative group hover:border-zinc-800 transition-all duration-300">
                  <button type="button" className="absolute top-3.5 right-3.5 text-red-500 hover:scale-110 transition-transform z-10 text-xs">
                    ❤️
                  </button>
                  <div className="aspect-square w-full rounded-xl overflow-hidden bg-zinc-950 flex items-center justify-center mb-3">
                    <img src={muscleBlazeImg} alt="MuscleBlaze" className="h-full w-full object-cover group-hover:scale-105 transition-all duration-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors line-clamp-2">MuscleBlaze Biozyme Whey Protein</h4>
                    <div className="flex justify-between items-center mt-2.5">
                      <span className="text-xs font-black text-white">₹4499</span>
                      <span className="text-[10px] text-yellow-450 font-extrabold flex items-center gap-0.5">★ 4.7</span>
                    </div>
                  </div>
                </div>

                {/* Product 2 */}
                <div className="bg-[#0c0d10] border border-zinc-900/60 rounded-2xl p-4 flex flex-col justify-between relative group hover:border-zinc-800 transition-all duration-300">
                  <button type="button" className="absolute top-3.5 right-3.5 text-red-500 hover:scale-110 transition-transform z-10 text-xs">
                    ❤️
                  </button>
                  <div className="aspect-square w-full rounded-xl overflow-hidden bg-zinc-950 flex items-center justify-center mb-3">
                    <img src={myProteinImg} alt="Myprotein" className="h-full w-full object-cover group-hover:scale-105 transition-all duration-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors line-clamp-2">Myprotein Impact Whey Protein</h4>
                    <div className="flex justify-between items-center mt-2.5">
                      <span className="text-xs font-black text-white">₹4599</span>
                      <span className="text-[10px] text-yellow-450 font-extrabold flex items-center gap-0.5">★ 4.6</span>
                    </div>
                  </div>
                </div>

                {/* Product 3 */}
                <div className="bg-[#0c0d10] border border-zinc-900/60 rounded-2xl p-4 flex flex-col justify-between relative group hover:border-zinc-800 transition-all duration-300">
                  <button type="button" className="absolute top-3.5 right-3.5 text-red-500 hover:scale-110 transition-transform z-10 text-xs">
                    ❤️
                  </button>
                  <div className="aspect-square w-full rounded-xl overflow-hidden bg-zinc-950 flex items-center justify-center mb-3">
                    <img src={dymatizeImg} alt="Dymatize" className="h-full w-full object-cover group-hover:scale-105 transition-all duration-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors line-clamp-2">Dymatize ISO 100 Hydrolyzed</h4>
                    <div className="flex justify-between items-center mt-2.5">
                      <span className="text-xs font-black text-white">₹5499</span>
                      <span className="text-[10px] text-yellow-450 font-extrabold flex items-center gap-0.5">★ 4.8</span>
                    </div>
                  </div>
                </div>

                {/* Product 4 */}
                <div className="bg-[#0c0d10] border border-zinc-900/60 rounded-2xl p-4 flex flex-col justify-between relative group hover:border-zinc-800 transition-all duration-300">
                  <button type="button" className="absolute top-3.5 right-3.5 text-red-500 hover:scale-110 transition-transform z-10 text-xs">
                    ❤️
                  </button>
                  <div className="aspect-square w-full rounded-xl overflow-hidden bg-zinc-950 flex items-center justify-center mb-3">
                    <img src={isopureImg} alt="Isopure" className="h-full w-full object-cover group-hover:scale-105 transition-all duration-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors line-clamp-2">Isopure Zero Carb Whey</h4>
                    <div className="flex justify-between items-center mt-2.5">
                      <span className="text-xs font-black text-white">₹4999</span>
                      <span className="text-[10px] text-yellow-450 font-extrabold flex items-center gap-0.5">★ 4.7</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
