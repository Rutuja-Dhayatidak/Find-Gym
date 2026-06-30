const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

/**
 * Generic admin auth middleware.
 * Works for Super Admin, Platform Admin, and City Admin.
 * Sets req.admin with the authenticated admin document.
 */
const adminAuth = async (req, res, next) => {
  try {
    let token;

    // 1. Try Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 2. Try cookie
    if (!token && req.cookies && req.cookies.adminToken) {
      token = req.cookies.adminToken;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // Check if user is Super Admin
    if (decoded.role === 'Super Admin') {
      const User = require('../models/User');
      const superAdmin = await User.findById(decoded.id);
      if (superAdmin && superAdmin.role === 'superadmin') {
        req.admin = {
          _id: superAdmin._id,
          fullName: superAdmin.name,
          email: superAdmin.email,
          adminType: 'Super Admin',
          status: 'Active'
        };
        return next();
      }
    }

    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    if (admin.status !== 'Active') {
      return res.status(403).json({ success: false, message: 'Admin account is not active.' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin Auth Error:', error);
    res.status(401).json({ success: false, message: 'Invalid or expired token', error: error.message });
  }
};

module.exports = adminAuth;
