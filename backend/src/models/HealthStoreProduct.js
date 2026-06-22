const mongoose = require('mongoose');

const nutritionInfoSchema = new mongoose.Schema(
  {
    calories: { type: Number },
    protein: { type: String },
    carbs: { type: String },
    fat: { type: String },
  },
  { _id: false }
);

const variantSchema = new mongoose.Schema(
  {
    flavor: { type: String },
    size: { type: String },
    mrp: { type: Number },
    sellingPrice: { type: Number },
    stock: { type: Number, default: 0 },
    lowStockAlert: { type: Number, default: 5 },
    sku: { type: String },
  },
  { _id: false }
);

const healthStoreProductSchema = new mongoose.Schema(
  {
    variants: [variantSchema],
    healthStore: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HealthStore',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HealthStoreOwner',
      required: true,
    },
    productType: {
      type: String,
      enum: ['Diet', 'Food', 'Supplement'],
      required: true,
    },
    name: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true, trim: true },
    category: {
      type: String,
      required: true,
      trim: true,
      // Diet/Food: Weight Loss Diet, Muscle Gain Diet, Diabetes Diet, Vegetarian Diet, Non-Veg Diet, Custom Diet Plan, Healthy Meal, High Protein Meal
      // Supplement: Whey Protein, Creatine, Mass Gainer, Pre Workout, Multivitamin, Fat Burner, BCAA, Omega 3
    },
    brand: { type: String, trim: true }, // Supplement only
    images: [{ type: String }],
    shortDescription: { type: String, trim: true },
    description: { type: String, trim: true },
    benefits: [{ type: String }],
    suitableFor: [{ type: String }],
    ingredients: { type: String },   // Supplement
    howToUse: { type: String },       // Supplement
    duration: {
      type: String,
      default: 'N/A',
    }, // Diet/Food
    foodPreference: {
      type: String,
      enum: ['Veg', 'Non-Veg', 'Both', 'N/A'],
      default: 'N/A',
    }, // Diet/Food
    quantity: { type: String, trim: true }, // Supplement e.g. "1kg", "60 tablets"
    originalPrice: { type: Number, default: 0 },
    sellingPrice: { type: Number, default: 0 },
    oneTimePrice: { type: Number, default: 0 },
    monthlyPrice: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    lowStockAlert: { type: Number, default: 10 },
    nutritionInfo: { type: nutritionInfoSchema, default: {} },
    mealChart: { type: String }, // Text or JSON
    pdfFile: { type: String },
    expiryDate: { type: Date },
    flavor: { type: String },
    isReturnable: { type: Boolean, default: false },
    deliveryAvailable: { type: Boolean, default: true },

    // Approval
    approvalStatus: {
      type: String,
      enum: ['Draft', 'Pending Approval', 'Approved', 'Rejected', 'Live', 'Inactive'],
      default: 'Draft',
    },
    rejectionReason: { type: String },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    approvedAt: { type: Date },
    isLive: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // Location (inherited from store)
    city: { type: String, trim: true },

    // Reviews
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-generate slug before save
healthStoreProductSchema.pre('save', function () {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
});

// Indexes
healthStoreProductSchema.index({ healthStore: 1 });
healthStoreProductSchema.index({ city: 1 });
healthStoreProductSchema.index({ approvalStatus: 1 });
healthStoreProductSchema.index({ productType: 1 });
healthStoreProductSchema.index({ isLive: 1 });
healthStoreProductSchema.index({ category: 1 });

module.exports = mongoose.model('HealthStoreProduct', healthStoreProductSchema);
