const crypto = require('crypto');
const Membership = require('../models/Membership');
const Gym = require('../models/Gym');
const User = require('../models/User');
const MembershipPlan = require('../models/MembershipPlan');
const MembershipPurchase = require('../models/MembershipPurchase');
const Coupon = require('../models/Coupon');
const Invoice = require('../models/Invoice');
const { getRazorpay } = require('../utils/razorpay');

// Helper to calculate end date from duration string or days
const calculateEndDate = (startDate, durationDays) => {
  const date = new Date(startDate);
  date.setDate(date.getDate() + Number(durationDays || 30));
  return date;
};

// Helper to resolve plan from new MembershipPlan collection OR legacy Gym subdocument
const resolvePlan = async (planId) => {
  let plan = await MembershipPlan.findById(planId);
  if (plan) return plan;

  const gyms = await Gym.find({ 'membershipPlans._id': planId });
  for (const gym of gyms) {
    const matched = gym.membershipPlans.find(p => p._id.toString() === planId.toString());
    if (matched) {
      return {
        _id: matched._id,
        gymId: gym._id,
        name: matched.title,
        price: matched.price,
        durationDays: matched.durationDays || (matched.validity ? parseInt(matched.validity) * 30 : 30),
        joiningFee: matched.joiningFee || 0,
        accessTime: matched.accessTime || 'All Hours Access',
        facilities: matched.facilities || [],
        rules: matched.rules || []
      };
    }
  }
  return null;
};

// 1. GET /api/memberships/plans/:gymId
exports.getActivePlans = async (req, res) => {
  try {
    const { gymId } = req.params;
    const plans = await MembershipPlan.find({ gymId, isActive: true });
    
    const gym = await Gym.findById(gymId);
    const legacyPlans = (gym && gym.membershipPlans) || [];
    const legacyMapped = legacyPlans.map(p => ({
      _id: p._id,
      gymId: gym._id,
      name: p.title,
      price: p.price,
      durationDays: p.durationDays || 30,
      joiningFee: p.joiningFee || 0,
      accessTime: p.accessTime || 'All Hours',
      facilities: p.facilities || [],
      rules: p.rules || [],
      isActive: true
    }));

    const allPlans = [...plans];
    legacyMapped.forEach(lp => {
      if (!allPlans.some(ap => ap._id.toString() === lp._id.toString())) {
        allPlans.push(lp);
      }
    });

    res.status(200).json({ success: true, data: allPlans });
  } catch (error) {
    console.error("Get active plans error:", error);
    res.status(500).json({ success: false, message: "Failed to load plans" });
  }
};

// 2. GET /api/memberships/plan/:planId
exports.getPlanDetails = async (req, res) => {
  try {
    const { planId } = req.params;
    const plan = await resolvePlan(planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Membership plan not found" });
    }
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    console.error("Get plan details error:", error);
    res.status(500).json({ success: false, message: "Failed to load plan details" });
  }
};

// 3. POST /api/memberships/calculate
exports.calculateAmount = async (req, res) => {
  try {
    const { planId, couponCode } = req.body;
    const plan = await resolvePlan(planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }

    const basePrice = Number(plan.price || 0);
    const joiningFee = Number(plan.joiningFee || 0);
    const rawSubtotal = basePrice + joiningFee;

    let discountAmount = 0;
    if (couponCode) {
      const codeClean = couponCode.trim().toUpperCase();
      if (codeClean === 'WELCOME10') {
        discountAmount = Math.round(rawSubtotal * 0.10);
      } else {
        const coupon = await Coupon.findOne({ code: codeClean, isActive: true });
        if (coupon) {
          if (coupon.discountType === 'PERCENTAGE') {
            discountAmount = Math.round(rawSubtotal * (coupon.discountValue / 100));
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
              discountAmount = coupon.maxDiscount;
            }
          } else {
            discountAmount = coupon.discountValue;
          }
        }
      }
    }

    const subtotal = Math.max(0, rawSubtotal - discountAmount);
    const gstPercent = 18;
    const gstAmount = Math.round(subtotal * (gstPercent / 100));
    const totalAmount = subtotal + gstAmount;

    res.status(200).json({
      success: true,
      data: {
        planName: plan.name,
        basePrice,
        joiningFee,
        discountAmount,
        subtotal,
        gstPercent,
        gstAmount,
        totalAmount
      }
    });
  } catch (error) {
    console.error("Calculate amount error:", error);
    res.status(500).json({ success: false, message: "Calculation failed", error: error.message });
  }
};

// 4. POST /api/memberships/create-order
exports.createOrder = async (req, res) => {
  try {
    const { planId, userDetails, couponCode, preferredJoiningDate, paymentMethod } = req.body;
    const userId = req.user._id;

    const plan = await resolvePlan(planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }

    const basePrice = Number(plan.price || 0);
    const joiningFee = Number(plan.joiningFee || 0);
    const rawSubtotal = basePrice + joiningFee;

    let discountAmount = 0;
    if (couponCode) {
      const codeClean = couponCode.trim().toUpperCase();
      if (codeClean === 'WELCOME10') {
        discountAmount = Math.round(rawSubtotal * 0.10);
      } else {
        const coupon = await Coupon.findOne({ code: codeClean, isActive: true });
        if (coupon) {
          discountAmount = coupon.discountType === 'PERCENTAGE'
            ? Math.round(rawSubtotal * (coupon.discountValue / 100))
            : coupon.discountValue;
        }
      }
    }

    const subtotal = Math.max(0, rawSubtotal - discountAmount);
    const gstAmount = Math.round(subtotal * 0.18);
    const totalAmount = subtotal + gstAmount;

    const gym = await Gym.findById(plan.gymId);
    const gymName = gym ? gym.name : "Fitness Center";

    const purchase = new MembershipPurchase({
      userId,
      gymId: plan.gymId,
      planId,
      planSnapshot: {
        name: plan.name,
        price: basePrice,
        durationDays: plan.durationDays,
        joiningFee,
        facilities: plan.facilities
      },
      userDetails,
      couponCode,
      discountAmount,
      gstPercent: 18,
      gstAmount,
      subtotal,
      totalAmount,
      paymentMethod,
      paymentGateway: paymentMethod === 'PAY_AT_GYM' ? 'PAY_AT_GYM' : 'RAZORPAY',
      status: paymentMethod === 'PAY_AT_GYM' ? 'PAY_AT_GYM_PENDING' : 'CREATED'
    });

    if (paymentMethod === 'PAY_AT_GYM') {
      await purchase.save();
      
      const membershipId = `GYM-MEM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newMembership = new Membership({
        membershipId,
        customerId: userId,
        userId,
        gymId: plan.gymId,
        planId,
        purchaseId: purchase._id,
        gymName,
        planName: plan.name,
        startDate: new Date(preferredJoiningDate || Date.now()),
        endDate: calculateEndDate(new Date(preferredJoiningDate || Date.now()), plan.durationDays),
        durationDays: plan.durationDays,
        status: 'PAY_AT_GYM_PENDING',
        amountPaid: totalAmount,
        paymentStatus: 'pending',
        paymentMethod: 'PAY_AT_GYM',
        fitnessGoal: userDetails.fitnessGoal || 'General Fitness',
        facilitiesIncluded: plan.facilities,
        qrCodeData: JSON.stringify({ membershipId, userId, gymId: plan.gymId })
      });
      await newMembership.save();

      return res.status(201).json({
        success: true,
        membershipId: newMembership._id,
        purchaseId: purchase._id,
        message: "Offline request registered"
      });
    }

    const razorpay = getRazorpay();
    const orderOptions = {
      amount: totalAmount * 100,
      currency: 'INR',
      receipt: `rcpt_pur_${purchase._id.toString().substring(0, 15)}`
    };

    const rzpOrder = await razorpay.orders.create(orderOptions);
    purchase.razorpayOrderId = rzpOrder.id;
    await purchase.save();

    res.status(201).json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      purchaseId: purchase._id,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      userPrefill: {
        name: userDetails.fullName,
        email: userDetails.email,
        contact: userDetails.mobile
      }
    });

  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ success: false, message: "Order creation failed", error: error.message });
  }
};

// 5. POST /api/memberships/verify-payment
exports.verifyPayment = async (req, res) => {
  try {
    const { purchaseId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const purchase = await MembershipPurchase.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({ success: false, message: "Purchase session not found" });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || 'fallback_secret';
    const generated = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated !== razorpay_signature) {
      purchase.status = 'FAILED';
      purchase.failureReason = 'Signature validation mismatch';
      await purchase.save();
      return res.status(400).json({ success: false, message: "Signature verification failed" });
    }

    const existing = await Membership.findOne({ purchaseId });
    if (existing && existing.status === 'active') {
      return res.status(200).json({ success: true, membership: existing });
    }

    purchase.status = 'PAID';
    purchase.razorpayPaymentId = razorpay_payment_id;
    purchase.razorpaySignature = razorpay_signature;
    await purchase.save();

    const gym = await Gym.findById(purchase.gymId);
    const gymName = gym ? gym.name : "Fitness Center";

    const membershipId = `GYM-MEM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const startDate = new Date(purchase.userDetails.preferredJoiningDate || Date.now());
    const endDate = calculateEndDate(startDate, purchase.planSnapshot.durationDays);

    const membership = new Membership({
      membershipId,
      customerId: purchase.userId,
      userId: purchase.userId,
      gymId: purchase.gymId,
      planId: purchase.planId,
      purchaseId: purchase._id,
      gymName,
      planName: purchase.planSnapshot.name,
      startDate,
      endDate,
      durationDays: purchase.planSnapshot.durationDays,
      status: 'active',
      amountPaid: purchase.totalAmount,
      paymentStatus: 'paid',
      paymentMethod: 'razorpay',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      fitnessGoal: purchase.userDetails.fitnessGoal || 'General Fitness',
      facilitiesIncluded: purchase.planSnapshot.facilities,
      qrCodeData: JSON.stringify({ membershipId, userId: purchase.userId, gymId: purchase.gymId })
    });
    await membership.save();

    const invoiceNumber = `INV-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoice = new Invoice({
      invoiceNumber,
      membershipId: membership._id,
      purchaseId: purchase._id,
      userId: purchase.userId,
      gymId: purchase.gymId,
      amount: purchase.subtotal,
      gstAmount: purchase.gstAmount,
      totalAmount: purchase.totalAmount,
      paymentId: razorpay_payment_id
    });
    await invoice.save();

    membership.invoiceNumber = invoiceNumber;
    await membership.save();

    await User.findByIdAndUpdate(purchase.userId, {
      role: 'member',
      isSubscribed: true,
      activeMembership: membership._id
    });

    res.status(200).json({ success: true, membership });

  } catch (error) {
    console.error("Verify payment signature error:", error);
    res.status(500).json({ success: false, message: "Verification failed", error: error.message });
  }
};

// 6. GET /api/memberships/my-active
exports.getMyActiveMembership = async (req, res) => {
  try {
    const userId = req.user._id;
    const activeMem = await Membership.findOne({
      customerId: userId,
      status: 'active',
      endDate: { $gt: new Date() }
    }).populate('gymId', 'name location phone email heroImage images');

    if (!activeMem) {
      return res.status(200).json({ success: true, active: false });
    }

    const diff = Math.max(0, new Date(activeMem.endDate) - new Date());
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

    res.status(200).json({
      success: true,
      active: true,
      data: activeMem,
      daysLeft
    });
  } catch (error) {
    console.error("Get my active membership error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch active membership" });
  }
};

// 7. GET /api/memberships/my
exports.getMyMemberships = async (req, res) => {
  try {
    const userId = req.user._id;
    const memberships = await Membership.find({ customerId: userId })
      .populate('gymId', 'name location phone email heroImage images')
      .sort({ createdAt: -1 });

    const now = new Date();
    const result = memberships.map(m => {
      const isExpired = m.endDate && new Date(m.endDate) < now;
      const effectiveStatus = isExpired ? 'expired' : m.status;
      return {
        _id: m._id,
        membershipId: m.membershipId,
        gymId: m.gymId?._id,
        gymName: m.gymName || m.gymId?.name || 'Unknown Gym',
        gymCity: m.gymId?.location?.city || '',
        gymAddress: m.gymId?.location?.address || '',
        gymImage: m.gymId?.heroImage || (m.gymId?.images && m.gymId.images[0]) || null,
        planTitle: m.planTitle || m.planName,
        planName: m.planName || m.planTitle,
        duration: m.duration || `${m.durationDays} Days`,
        pricePaid: m.amountPaid || m.pricePaid || 0,
        paymentStatus: m.paymentStatus,
        paymentMethod: m.paymentMethod,
        invoiceNumber: m.invoiceNumber,
        startDate: m.startDate,
        endDate: m.endDate,
        status: effectiveStatus,
        membershipStatus: effectiveStatus,
        facilitiesIncluded: m.facilitiesIncluded || [],
        fitnessGoal: m.fitnessGoal,
        createdAt: m.createdAt
      };
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Get my memberships error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch memberships" });
  }
};

// 8. GET /api/memberships/:membershipId
exports.getMembershipDetails = async (req, res) => {
  try {
    const { membershipId } = req.params;
    const membership = await Membership.findById(membershipId).populate('gymId', 'name location');
    if (!membership) {
      return res.status(404).json({ success: false, message: "Membership record not found" });
    }
    res.status(200).json({ success: true, data: membership });
  } catch (error) {
    console.error("Get membership details error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch details" });
  }
};

// 9. GET /api/memberships/:membershipId/invoice
exports.getInvoiceDetails = async (req, res) => {
  try {
    const { membershipId } = req.params;
    const invoice = await Invoice.findOne({ membershipId });
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice details not found" });
    }
    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    console.error("Get invoice error:", error);
    res.status(500).json({ success: false, message: "Failed to load invoice" });
  }
};

// 10. GET /api/memberships/:membershipId/qr
exports.getQRCodeData = async (req, res) => {
  try {
    const { membershipId } = req.params;
    const membership = await Membership.findById(membershipId);
    if (!membership) {
      return res.status(404).json({ success: false, message: "Membership not found" });
    }

    const qrData = membership.qrCodeData || JSON.stringify({ membershipId: membership.membershipId });
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;

    res.status(200).json({
      success: true,
      qrCodeData: qrData,
      qrCodeUrl
    });
  } catch (error) {
    console.error("Get QR error:", error);
    res.status(500).json({ success: false, message: "Failed to load QR code" });
  }
};

// 11. POST /api/memberships/pay-at-gym/:purchaseId/confirm
exports.confirmPayAtGym = async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const purchase = await MembershipPurchase.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({ success: false, message: "Purchase session not found" });
    }

    purchase.status = 'PAID';
    await purchase.save();

    const membership = await Membership.findOne({ purchaseId: purchase._id });
    if (membership) {
      membership.status = 'active';
      membership.paymentStatus = 'paid';
      membership.paymentMethod = 'cash';
      
      const invoiceNumber = `INV-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const invoice = new Invoice({
        invoiceNumber,
        membershipId: membership._id,
        purchaseId: purchase._id,
        userId: purchase.userId,
        gymId: purchase.gymId,
        amount: purchase.subtotal,
        gstAmount: purchase.gstAmount,
        totalAmount: purchase.totalAmount,
        paymentId: 'PAY_AT_GYM_CONFIRMED'
      });
      await invoice.save();
      
      membership.invoiceNumber = invoiceNumber;
      await membership.save();

      await User.findByIdAndUpdate(purchase.userId, {
        role: 'member',
        isSubscribed: true,
        activeMembership: membership._id
      });
    }

    res.status(200).json({ success: true, message: "Payment confirmed offline and membership activated!" });
  } catch (error) {
    console.error("Confirm offline payment error:", error);
    res.status(500).json({ success: false, message: "Confirmation failed", error: error.message });
  }
};

// 12. GET /api/memberships/owner
exports.getOwnerGymMemberships = async (req, res) => {
  try {
    const ownerId = req.owner._id;
    const gyms = await Gym.find({ ownerId });
    const gymIds = gyms.map(gym => gym._id);

    const memberships = await Membership.find({ gymId: { $in: gymIds } })
      .populate('gymId', 'name location')
      .sort({ createdAt: -1 });

    const MobileUser = require('../models/MobileUser');
    const User = require('../models/User');

    const resolvedMemberships = [];
    for (const m of memberships) {
      const mObj = m.toObject();
      if (mObj.customerId) {
        let user = await User.findById(mObj.customerId).select('name email phone');
        let resolvedSource = mObj.orderSource || 'Website';
        
        if (!user) {
          user = await MobileUser.findById(mObj.customerId).select('name email phone');
          if (user) resolvedSource = 'Mobile App';
        }
        mObj.customerId = user || { name: 'N/A', email: 'N/A', phone: 'N/A' };
        mObj.orderSource = resolvedSource;
      } else {
        mObj.customerId = { name: 'N/A', email: 'N/A', phone: 'N/A' };
        mObj.orderSource = mObj.orderSource || 'Website';
      }
      resolvedMemberships.push(mObj);
    }

    res.status(200).json({ success: true, data: resolvedMemberships });
  } catch (error) {
    console.error("Get owner gym memberships error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve memberships" });
  }
};

// --- LEGACY PORT LAYER WRAPPERS ---
exports.initiatePurchase = async (req, res) => {
  try {
    const { gymId, pricePaid, duration, planTitle } = req.body;
    const orderOptions = {
      amount: Math.round(Number(pricePaid) * 100),
      currency: 'INR',
      receipt: `rcpt_mem_${Date.now()}`
    };
    const razorpay = getRazorpay();
    const order = await razorpay.orders.create(orderOptions);

    const membership = new Membership({
      customerId: req.user._id,
      gymId,
      planTitle,
      pricePaid: Number(pricePaid),
      duration,
      orderId: order.id,
      status: 'pending',
      paymentStatus: 'pending',
      membershipStatus: 'pending'
    });
    await membership.save();

    res.status(201).json({
      success: true,
      membershipId: membership._id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.verifyPurchase = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const generated = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'fallback_secret')
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Signature verification failed" });
    }

    const m = await Membership.findOne({ orderId: razorpay_order_id });
    if (!m) return res.status(404).json({ success: false, message: "Order not found" });

    m.status = 'active';
    m.paymentStatus = 'paid';
    m.paymentId = razorpay_payment_id;
    m.startDate = new Date();
    m.endDate = calculateEndDate(new Date(), 30);
    await m.save();

    res.status(200).json({ success: true, message: "Verified", membership: m });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
