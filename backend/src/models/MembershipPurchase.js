const mongoose = require('mongoose');

const membershipPurchaseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
  planId: { type: String, required: true }, // Can be MembershipPlan ID or inline plan title
  planSnapshot: {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    durationDays: { type: Number, required: true },
    joiningFee: { type: Number, default: 0 },
    facilities: { type: [String], default: [] }
  },
  userDetails: {
    fullName: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    gender: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    city: { type: String, required: true },
    emergencyContact: { type: String, required: true },
    healthIssue: { type: String },
    preferredJoiningDate: { type: Date, required: true },
    fitnessGoal: { type: String, required: true }
  },
  couponCode: { type: String },
  discountAmount: { type: Number, default: 0 },
  gstPercent: { type: Number, default: 18 },
  gstAmount: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, required: true }, // Card, UPI, etc.
  paymentGateway: { type: String, enum: ['RAZORPAY', 'PAY_AT_GYM'], required: true },
  razorpayOrderId: { type: String, unique: true, sparse: true },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  receipt: { type: String, required: true },
  status: {
    type: String,
    enum: ['CREATED', 'PENDING_PAYMENT', 'PAID', 'FAILED', 'CANCELLED', 'PAY_AT_GYM_PENDING'],
    default: 'CREATED'
  },
  failureReason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('MembershipPurchase', membershipPurchaseSchema);
