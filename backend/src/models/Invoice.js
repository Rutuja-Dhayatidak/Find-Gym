const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  membershipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Membership', required: true },
  purchaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'MembershipPurchase', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
  amount: { type: Number, required: true }, // subtotal
  gstAmount: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  paymentId: { type: String },
  invoiceUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
