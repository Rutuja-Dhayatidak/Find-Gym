const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ['FLAT', 'PERCENTAGE'], required: true },
  discountValue: { type: Number, required: true },
  maxDiscount: { type: Number },
  minOrderAmount: { type: Number, default: 0 },
  validFrom: { type: Date, default: Date.now },
  validTill: { type: Date, required: true },
  usageLimit: { type: Number, default: 100 },
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  applicableGymIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Gym' }],
  applicablePlanIds: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
