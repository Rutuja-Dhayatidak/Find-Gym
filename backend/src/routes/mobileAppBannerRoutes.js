const express = require('express');
const router = express.Router();
const controller = require('../controllers/admin/mobileAppBannerController');

// Mobile App client routes
router.get('/', controller.getActiveMobileBanners);

module.exports = router;
