import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { calculateMembership, createMembershipOrder, verifyMembershipPayment } from '../userServices/membershipApi';
import MembershipStepper from '../components/MembershipStepper';
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

const MembershipPayment = () => {
  const { planId } = useParams();
  const [searchParams] = useSearchParams();
  const gymId = searchParams.get('gymId');
  const navigate = useNavigate();

  const [userDetails, setUserDetails] = useState(null);
  const [calcData, setCalcData] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // UPI, CARD, NET_BANKING, PAY_AT_GYM
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);

  useEffect(() => {
    const cachedData = sessionStorage.getItem(`checkout_user_${planId}`);
    if (!cachedData) {
      toast.error('User details not found. Please complete the form first.');
      navigate(`/membership/user-details/${planId}?gymId=${gymId}`);
      return;
    }
    setUserDetails(JSON.parse(cachedData));
    
    const fetchCalculation = async () => {
      try {
        setLoading(true);
        const res = await calculateMembership(planId, '');
        setCalcData(res.data);
      } catch (err) {
        toast.error(err.message || 'Pricing calculation failed');
      } finally {
        setLoading(false);
      }
    };
    fetchCalculation();
  }, [planId, gymId, navigate]);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    try {
      const res = await calculateMembership(planId, couponCode.trim());
      if (res.data.discountAmount > 0) {
        setCalcData(res.data);
        setAppliedCoupon(couponCode.toUpperCase().trim());
        setCouponSuccess(`Coupon "${couponCode.toUpperCase()}" applied successfully!`);
      } else {
        setCouponError('Invalid coupon code or minimum order value not met');
      }
    } catch (err) {
      setCouponError('Failed to apply coupon');
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      const res = await calculateMembership(planId, '');
      setCalcData(res.data);
      setAppliedCoupon('');
      setCouponCode('');
      setCouponSuccess('');
      setCouponError('');
    } catch (err) {
      toast.error('Failed to reset calculation');
    }
  };

  const handlePayment = async () => {
    if (payLoading) return;
    setPayLoading(true);

    try {
      const orderPayload = {
        planId,
        userDetails,
        couponCode: appliedCoupon || undefined,
        preferredJoiningDate: userDetails.preferredJoiningDate,
        paymentMethod
      };

      const res = await createMembershipOrder(orderPayload);
      
      if (!res.success) {
        throw new Error(res.message || 'Order creation failed');
      }

      if (paymentMethod === 'PAY_AT_GYM') {
        toast.success('Membership request submitted successfully! 🎉');
        sessionStorage.removeItem(`checkout_user_${planId}`);
        navigate(`/membership/payment-success/${res.membershipId}?gymId=${gymId}`);
        return;
      }

      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        throw new Error('Razorpay SDK failed to load. Are you online?');
      }

      const options = {
        key: res.keyId,
        amount: res.amount,
        currency: res.currency,
        name: 'Gym Membership',
        description: `Plan: ${calcData?.planName}`,
        order_id: res.razorpayOrderId,
        prefill: res.userPrefill,
        theme: {
          color: '#6D28D9'
        },
        handler: async (response) => {
          try {
            toast.loading('Verifying payment signature...', { id: 'payment-verify' });
            const verifyRes = await verifyMembershipPayment({
              purchaseId: res.purchaseId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.success) {
              toast.dismiss('payment-verify');
              toast.success('Payment Verified! Membership Active 💪');
              sessionStorage.removeItem(`checkout_user_${planId}`);
              navigate(`/membership/payment-success/${verifyRes.membership._id}?gymId=${gymId}`);
            } else {
              toast.dismiss('payment-verify');
              toast.error(verifyRes.message || 'Signature verification failed');
            }
          } catch (verifyErr) {
            toast.dismiss('payment-verify');
            toast.error(verifyErr.message || 'Failed to verify payment');
          }
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled by user');
            setPayLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error('Payment process error:', err);
      toast.error(err.message || 'Failed to initiate purchase');
      setPayLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-400 font-medium">Preparing secure checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-10 px-4 md:px-8 text-white">
      <div className="max-w-5xl mx-auto bg-zinc-900/60 rounded-[32px] border border-zinc-800/80 overflow-hidden backdrop-blur-md">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-850 p-8 text-white relative flex flex-col md:flex-row justify-between items-center gap-4 border-b border-zinc-800">
          <button 
            onClick={() => navigate(-1)} 
            className="md:absolute left-8 top-1/2 md:-translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center md:text-left md:pl-16">
            <h1 className="text-2xl font-black tracking-tight text-white">Review & Secure Payment</h1>
            <p className="text-xs text-purple-200 mt-1 font-medium">Verify bill totals, apply promo discount, and checkout safely</p>
          </div>
          <div className="text-right">
            <span className="px-4 py-1.5 bg-purple-700/60 text-white text-xs font-bold rounded-full uppercase tracking-wider">
              Step 3 of 3
            </span>
          </div>
        </div>

        {/* Stepper */}
        <div className="px-6 py-6 border-b border-zinc-800 bg-zinc-950/20">
          <MembershipStepper currentStep={3} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800/80">
          
          {/* Left Column: Form Coupons & Selector Methods (7 cols) */}
          <div className="lg:col-span-7 p-6 md:p-10 space-y-8">
            {/* Coupon Box */}
            <div className="bg-purple-950/20 border border-purple-900/40 rounded-3xl p-6">
              <h5 className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-3.5 flex items-center gap-2">
                <span>🎟️</span> Apply Promotion Code
              </h5>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-zinc-950/80 border border-purple-900/60 px-4 py-3 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-purple-400 bg-purple-950/80 px-2.5 py-1 rounded border border-purple-900/40">
                      {appliedCoupon}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-extrabold">Applied Successfully!</span>
                  </div>
                  <button 
                    onClick={handleRemoveCoupon}
                    className="text-xs font-bold text-red-400 hover:text-red-300 outline-none"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-3">
                  <input 
                    type="text" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE (e.g. WELCOME10)"
                    className="flex-grow h-11 px-4 rounded-xl border border-zinc-800 bg-zinc-950/80 text-white text-xs font-bold outline-none focus:border-purple-500 uppercase"
                  />
                  <button 
                    type="submit"
                    className="px-6 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Apply Coupon
                  </button>
                </form>
              )}
              {couponError && <p className="text-red-450 text-[11px] mt-2 font-semibold">{couponError}</p>}
              {couponSuccess && <p className="text-emerald-400 text-[11px] mt-2 font-bold">{couponSuccess}</p>}
            </div>

            {/* Payment Method Selector */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-2.5 h-6 bg-purple-600 rounded-full"></span>
                <h3 className="text-lg font-black text-white tracking-tight uppercase">Payment Channels</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'UPI', label: 'UPI / QR Scanner', desc: 'Scan and pay using GPay, PhonePe, Paytm', icon: '📱' },
                  { id: 'CARD', label: 'Credit / Debit Card', desc: 'Secure checkout using Visa, MasterCard, RuPay', icon: '💳' },
                  { id: 'NET_BANKING', label: 'Net Banking', desc: 'Direct secure bank routing transfer', icon: '🏦' },
                  { id: 'PAY_AT_GYM', label: 'Pay offline at Gym', desc: 'Pay at reception desk to activate', icon: '💵' }
                ].map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-4 rounded-2xl border text-left flex items-start gap-4 transition-all outline-none cursor-pointer ${
                      paymentMethod === method.id 
                        ? 'border-purple-600 bg-purple-950/60 shadow-md ring-1 ring-purple-600' 
                        : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/40'
                    }`}
                  >
                    <span className="text-2xl mt-0.5">{method.icon}</span>
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-zinc-200 block">{method.label}</span>
                      <span className="text-[10px] text-zinc-500 font-semibold leading-snug block">{method.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Calculations & Secure Pay CTA (5 cols) */}
          <div className="lg:col-span-5 p-6 md:p-10 bg-zinc-900/20 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-6 bg-purple-600 rounded-full"></span>
                <h3 className="text-lg font-black text-white tracking-tight uppercase">Billing Invoice</h3>
              </div>

              {/* Pricing breakdown summary */}
              <div className="bg-zinc-950/60 rounded-3xl p-6 border border-zinc-800 shadow-md space-y-4">
                <div className="flex justify-between text-sm text-zinc-400 font-semibold">
                  <span>Base Package Cost</span>
                  <span className="text-white">₹{calcData?.basePrice}</span>
                </div>
                {calcData?.joiningFee > 0 && (
                  <div className="flex justify-between text-sm text-zinc-400 font-semibold">
                    <span>One-time Joining Fee</span>
                    <span className="text-white">₹{calcData?.joiningFee}</span>
                  </div>
                )}
                {calcData?.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-400 font-extrabold bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-900/40">
                    <span>Discount Applied</span>
                    <span>- ₹{calcData?.discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-zinc-400 border-t border-zinc-800 pt-3 font-semibold">
                  <span>Subtotal</span>
                  <span className="text-white">₹{calcData?.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm text-zinc-400 font-semibold">
                  <span>GST ({calcData?.gstPercent}%)</span>
                  <span className="text-white">₹{calcData?.gstAmount}</span>
                </div>
                <div className="border-t border-zinc-800 pt-4 flex justify-between font-black text-base text-white">
                  <span>Total Payable</span>
                  <span className="text-purple-400 text-lg">₹{calcData?.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Secure payment button */}
            <div className="mt-8 pt-4">
              <button 
                onClick={handlePayment}
                disabled={payLoading}
                className="w-full h-12 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white font-extrabold rounded-2xl text-sm transition-all shadow-md shadow-purple-100 hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer outline-none"
              >
                {payLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Proceed to Pay ₹{calcData?.totalAmount}</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MembershipPayment;
