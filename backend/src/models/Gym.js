const mongoose = require('mongoose');

const gymSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GymOwner',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    minlength: 20,
    maxlength: 1000
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    latitude: { type: Number },
    longitude: { type: Number }
  },
  
  hours: {
    monday: { open: String, close: String, closed: Boolean },
    tuesday: { open: String, close: String, closed: Boolean },
    wednesday: { open: String, close: String, closed: Boolean },
    thursday: { open: String, close: String, closed: Boolean },
    friday: { open: String, close: String, closed: Boolean },
    saturday: { open: String, close: String, closed: Boolean },
    sunday: { open: String, close: String, closed: Boolean }
  },
  
  capacity: {
    type: Number,
    required: true,
    min: 20,
    max: 10000
  },
  currentMembers: {
    type: Number,
    default: 0
  },
  amenities: {
    type: [String],
    default: []
  },
  images: {
    type: [String],
    default: []
  },
  
  verified: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  },
  
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  
  trainers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer'
  }],
  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
  memberships: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Membership'
  }],
  monthlyRevenue: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Gym', gymSchema);
