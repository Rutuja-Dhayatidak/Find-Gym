const express = require("express");
const cors = require("cors");
const superadminDashboardRoutes = require('./routes/superadminDashboardRoutes');
const superadminUserRoutes = require('./routes/superadminUserRoutes');
const superadminAdminRoutes = require('./routes/superadminAdminRoutes');
const superadminGymRoutes = require('./routes/superadminGymRoutes');
const superadminCmsRoutes = require('./routes/superadminCmsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cityAdminRoutes = require('./routes/cityAdminRoutes');
const authRoutes = require('./routes/authRoutes');
const gymRoutes = require('./routes/gymRoutes');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());

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
app.use('/api/admins', adminRoutes);
app.use('/api/city-admin', cityAdminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/gyms', gymRoutes);

module.exports = app;