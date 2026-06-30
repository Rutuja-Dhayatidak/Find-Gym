const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/mobileAppBannerController');
const platformAdminAuth = require('../../middleware/platformAdminAuth');
const upload = require('../../middleware/upload');

// Admin CMS routes
router.get('/', platformAdminAuth, controller.getAdminBanners);
router.post('/', platformAdminAuth, upload.single('bannerImage'), controller.createBanner);
router.put('/:id', platformAdminAuth, upload.single('bannerImage'), controller.updateBanner);
router.delete('/:id', platformAdminAuth, controller.deleteBanner);
router.patch('/:id/status', platformAdminAuth, controller.toggleActiveStatus);

module.exports = router;
