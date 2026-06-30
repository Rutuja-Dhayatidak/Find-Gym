const MobileAppBanner = require('../../models/MobileAppBanner');
const fs = require('fs');
const { uploadToCloudinary } = require('../../utils/cloudinary');
const ActivityLog = require('../../models/ActivityLog');

// 1. Create Mobile App Banner (Admin)
exports.createBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Banner image is required' });
    }

    const { smallTitle, headline, subtitle, discountText, buttonText } = req.body;

    if (!headline) {
      return res.status(400).json({ success: false, message: 'Headline is required' });
    }
    if (!buttonText) {
      return res.status(400).json({ success: false, message: 'Button text is required' });
    }

    const isActive = req.body.isActive === 'true' || req.body.isActive === true;
    const sortOrder = parseInt(req.body.sortOrder, 10) || 0;

    // Read local uploaded file buffer
    const fileBuffer = fs.readFileSync(req.file.path);
    // Upload to Cloudinary under 'mobile_banners' folder
    const cloudinaryUrl = await uploadToCloudinary(fileBuffer, 'mobile_banners');

    // Clean up local temp file
    try {
      fs.unlinkSync(req.file.path);
    } catch (err) {
      console.error('Failed to delete temp file:', err.message);
    }

    const banner = new MobileAppBanner({
      bannerImage: cloudinaryUrl,
      smallTitle,
      headline,
      subtitle,
      discountText,
      buttonText,
      isActive,
      sortOrder
    });

    await banner.save();

    // Log activity if Admin details are available
    if (req.admin) {
      await ActivityLog.create({
        type: 'mobile_banner_created',
        adminId: req.admin._id,
        description: `Mobile App Banner "${headline}" created.`
      }).catch(err => console.error('Activity log error:', err.message));
    }

    res.status(201).json({ success: true, message: 'Mobile App Banner created successfully', data: banner });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 2. Get All Banners For Admin
exports.getAdminBanners = async (req, res) => {
  try {
    const banners = await MobileAppBanner.find().sort({ sortOrder: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 3. Update Banner (Admin)
exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await MobileAppBanner.findById(id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    const { smallTitle, headline, subtitle, discountText, buttonText } = req.body;

    if (headline !== undefined && !headline) {
      return res.status(400).json({ success: false, message: 'Headline is required' });
    }
    if (buttonText !== undefined && !buttonText) {
      return res.status(400).json({ success: false, message: 'Button text is required' });
    }

    if (smallTitle !== undefined) banner.smallTitle = smallTitle;
    if (headline !== undefined) banner.headline = headline;
    if (subtitle !== undefined) banner.subtitle = subtitle;
    if (discountText !== undefined) banner.discountText = discountText;
    if (buttonText !== undefined) banner.buttonText = buttonText;

    if (req.body.isActive !== undefined) {
      banner.isActive = req.body.isActive === 'true' || req.body.isActive === true;
    }
    if (req.body.sortOrder !== undefined) {
      banner.sortOrder = parseInt(req.body.sortOrder, 10) || 0;
    }

    // Check if new image is uploaded
    if (req.file) {
      const fileBuffer = fs.readFileSync(req.file.path);
      const cloudinaryUrl = await uploadToCloudinary(fileBuffer, 'mobile_banners');
      banner.bannerImage = cloudinaryUrl;

      // Clean up local temp file
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Failed to delete temp file:', err.message);
      }
    }

    await banner.save();

    // Log activity if Admin details are available
    if (req.admin) {
      await ActivityLog.create({
        type: 'mobile_banner_updated',
        adminId: req.admin._id,
        description: `Mobile App Banner "${banner.headline}" updated.`
      }).catch(err => console.error('Activity log error:', err.message));
    }

    res.status(200).json({ success: true, message: 'Mobile App Banner updated successfully', data: banner });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 4. Delete Banner (Admin)
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await MobileAppBanner.findByIdAndDelete(id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    // Log activity if Admin details are available
    if (req.admin) {
      await ActivityLog.create({
        type: 'mobile_banner_deleted',
        adminId: req.admin._id,
        description: `Mobile App Banner "${banner.headline}" deleted.`
      }).catch(err => console.error('Activity log error:', err.message));
    }

    res.status(200).json({ success: true, message: 'Mobile App Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 5. Toggle Active Status (Admin)
exports.toggleActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await MobileAppBanner.findById(id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    banner.isActive = !banner.isActive;
    await banner.save();

    res.status(200).json({ success: true, message: `Banner status set to ${banner.isActive ? 'Active' : 'Inactive'}`, data: banner });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 6. Get Active Banners For Mobile App (Public)
exports.getActiveMobileBanners = async (req, res) => {
  try {
    const banners = await MobileAppBanner.find({ isActive: true }).sort({ sortOrder: 1 });
    res.status(200).json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
