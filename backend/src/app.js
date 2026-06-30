const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

const superadminDashboardRoutes = require('./routes/superadminDashboardRoutes');
const superadminUserRoutes = require('./routes/superadminUserRoutes');
const superadminAdminRoutes = require('./routes/superadminAdminRoutes');
const superadminGymRoutes = require('./routes/superadminGymRoutes');
const superadminCmsRoutes = require('./routes/superadminCmsRoutes');
const superadminGymOwnerRoutes = require('./routes/superadminGymOwnerRoutes');
const superadminTrainerRoutes = require('./routes/superadminTrainerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cityAdminRoutes = require('./routes/cityAdminRoutes');
const authRoutes = require('./routes/authRoutes');
const gymRoutes = require('./routes/gymRoutes');
const trainerAuthRoutes = require('./routes/trainerAuthRoutes');
const trainerRoutes = require('./routes/trainerRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const membershipRoutes = require('./routes/membershipRoutes');

const adminMobileAppBannerRoutes = require('./routes/admin/mobileAppBannerRoutes');
const mobileAppBannerRoutes = require('./routes/mobileAppBannerRoutes');

// Health Store Routes
const cityAdminHealthStoreRoutes = require('./routes/cityAdminHealthStoreRoutes');
const healthStoreAuthRoutes = require('./routes/healthStoreAuthRoutes');
const healthStoreOwnerRoutes = require('./routes/healthStoreOwnerRoutes');
const publicHealthStoreRoutes = require('./routes/publicHealthStoreRoutes');
const healthStorePaymentRoutes = require('./routes/healthStorePaymentRoutes');

const app = express();

const defaultClientOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://livesale.fitness',
  'https://www.livesale.fitness',
  'https://admin.livesale.fitness'
];

const clientOrigins = [
  ...defaultClientOrigins,
  ...(process.env.CLIENT_ORIGINS || process.env.CORS_ORIGINS || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean)
].filter((origin, index, origins) => origins.indexOf(origin) === index);

app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading images/resources from external sources
}));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || clientOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiter
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  })
);

// Serve static files for CMS
const path = require('path');
app.use('/cms', express.static(path.join(__dirname, '../uploads')));

app.get("/", (req, res) => {
  res.send("LiveSale.Fitness API Running...");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "livesale-api",
    uptime: process.uptime()
  });
});

// Super Admin Routes
app.use('/api/superadmin/dashboard', superadminDashboardRoutes);
app.use('/api/superadmin/users', superadminUserRoutes);
app.use('/api/superadmin/admins', superadminAdminRoutes);
app.use('/api/superadmin/gyms', superadminGymRoutes);
app.use('/api/superadmin/cms', superadminCmsRoutes);
app.use('/api/superadmin/gym-owners', superadminGymOwnerRoutes);
app.use('/api/superadmin/trainers', superadminTrainerRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/admin/mobile-app-banners', adminMobileAppBannerRoutes);
app.use('/api/mobile/mobile-app-banners', mobileAppBannerRoutes);
app.use('/api/city-admin', cityAdminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/gyms', gymRoutes);

// Trainer Routes
app.use('/api/trainer/auth', trainerAuthRoutes);
app.use('/api/trainer', trainerRoutes);

// Booking Routes
app.use('/api/bookings', bookingRoutes);

// Membership Routes
app.use('/api/memberships', membershipRoutes);

// Health Store Routes
app.use('/api/city-admin/health-stores', cityAdminHealthStoreRoutes);
app.use('/api/health-store', healthStoreAuthRoutes);
app.use('/api/health-store-owner', healthStoreOwnerRoutes);
app.use('/api/health-store/categories', publicHealthStoreRoutes);
app.use('/api/health-store/payment', healthStorePaymentRoutes);

// Public trainer listing
const adminTrainerController = require('./controllers/admin/trainerController');
app.get('/api/public/trainers', adminTrainerController.getPublicTrainers);
app.get('/api/public/trainers/:trainerId', adminTrainerController.getPublicTrainerById);

// Trainer stats (admin)
app.get('/api/admin/trainer-stats', adminTrainerController.getTrainerStats);

// Public landing stats
const Gym = require('./models/Gym');
const Trainer = require('./models/Trainer');
const User = require('./models/User');

app.get('/api/public/stats', async (req, res, next) => {
  try {
    const gymsCount = await Gym.countDocuments({ active: true, verified: true });
    const trainersCount = await Trainer.countDocuments({ status: { $in: ['approved', 'active'] } });
    const usersCount = await User.countDocuments({});
    
    // Distinct cities
    const cities = await Gym.distinct('location.city', { active: true, verified: true });
    
    // Average rating
    const gymsWithRatings = await Gym.find({ active: true, verified: true, 'rating.average': { $exists: true } });
    let totalRating = 0;
    let countRating = 0;
    gymsWithRatings.forEach(g => {
      if (g.rating && typeof g.rating.average === 'number') {
        totalRating += g.rating.average;
        countRating++;
      }
    });
    const avgRating = countRating > 0 ? (totalRating / countRating).toFixed(1) : "4.8";

    return res.status(200).json({
      success: true,
      data: {
        gymsCount: gymsCount || 15,
        trainersCount: trainersCount || 8,
        usersCount: usersCount || 120,
        citiesCount: cities.length || 3,
        avgRating: avgRating
      }
    });
  } catch (error) {
    return next(error);
  }
});

// Global Error Handler (last)
app.use(errorHandler);

module.exports = app;
