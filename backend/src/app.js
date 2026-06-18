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

const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading images/resources from external sources
}));

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
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
  res.send("Find Gym API Running...");
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
app.use('/api/city-admin', cityAdminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/gyms', gymRoutes);

// Trainer Routes
app.use('/api/trainer/auth', trainerAuthRoutes);
app.use('/api/trainer', trainerRoutes);

// Public trainer listing
const adminTrainerController = require('./controllers/admin/trainerController');
app.get('/api/public/trainers', adminTrainerController.getPublicTrainers);
app.get('/api/public/trainers/:trainerId', adminTrainerController.getPublicTrainerById);

// Trainer stats (admin)
app.get('/api/admin/trainer-stats', adminTrainerController.getTrainerStats);

// Global Error Handler (last)
app.use(errorHandler);

module.exports = app;