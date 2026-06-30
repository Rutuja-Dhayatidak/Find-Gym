const mongoose = require('mongoose');

const membershipPlanSchema = new mongoose.Schema({
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  durationDays: { type: Number, required: true },
  joiningFee: { type: Number, default: 0 },
  accessTime: { type: String, default: 'All Hours' },
  facilities: { type: [String], default: [] },
  rules: { type: [String], default: [] },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('MembershipPlan', membershipPlanSchema);
