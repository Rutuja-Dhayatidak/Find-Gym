const express = require('express');
const router = express.Router();
const membershipController = require('../controllers/membershipController');
const { protectUser, protectOwner } = require('../middleware/authMiddleware');

// Custom combined middleware to verify either user or owner token
const protectUserOrOwner = async (req, res, next) => {
  let token;
  const parseCookies = (cookieHeader) => {
    const list = {};
    if (!cookieHeader) return list;
    cookieHeader.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      list[parts.shift().trim()] = decodeURI(parts.join('='));
    });
    return list;
  };
  
  const cookies = parseCookies(req.headers.cookie);
  if (cookies.token) {
    token = cookies.token;
  }
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    const GymOwner = require('../models/GymOwner');
    const owner = await GymOwner.findById(decoded.id);
    if (owner) {
      req.owner = owner;
      return next();
    }
    
    const WebsiteUser = require('../models/WebsiteUser');
    const User = require('../models/User');
    let user = await WebsiteUser.findById(decoded.id).select('-password');
    if (!user) {
      user = await User.findById(decoded.id).select('-password');
    }
    if (user) {
      req.user = user;
      return next();
    }
    
    return res.status(401).json({ success: false, message: 'Authorized identity not found' });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired', error: error.message });
  }
};

// Public/Semi-public plan routes
router.get('/plans/:gymId', membershipController.getActivePlans);
router.get('/plan/:planId', membershipController.getPlanDetails);

// Pricing calculation (does not require auth necessarily, but safe)
router.post('/calculate', membershipController.calculateAmount);

// Order creation & payment signature verification (User protected)
router.post('/create-order', protectUser, membershipController.createOrder);
router.post('/verify-payment', protectUser, membershipController.verifyPayment);

// Active membership & history retrieval
router.get('/my-active', protectUser, membershipController.getMyActiveMembership);
router.get('/my', protectUser, membershipController.getMyMemberships);

// --- LEGACY ROTUES (preserved) & Owner Dashboard routes ---
router.get('/owner', protectOwner, membershipController.getOwnerGymMemberships);

// Specific membership details, invoices, QR codes (Accessible to User or Gym Owner)
router.get('/:membershipId', protectUserOrOwner, membershipController.getMembershipDetails);
router.get('/:membershipId/invoice', protectUserOrOwner, membershipController.getInvoiceDetails);
router.get('/:membershipId/qr', protectUserOrOwner, membershipController.getQRCodeData);

// Confirm Pay at Gym payments (Gym Owner protected)
router.post('/pay-at-gym/:purchaseId/confirm', protectOwner, membershipController.confirmPayAtGym);

// --- LEGACY ROTUES (preserved) ---
router.post('/initiate', protectUser, membershipController.initiatePurchase);
router.post('/verify', protectUser, membershipController.verifyPurchase);

module.exports = router;
