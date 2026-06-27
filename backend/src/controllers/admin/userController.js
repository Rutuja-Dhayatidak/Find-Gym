const WebsiteUser = require('../../models/WebsiteUser');
const MobileUser = require('../../models/MobileUser');
const ActivityLog = require('../../models/ActivityLog');

exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const userType = req.query.userType || 'all';

    let query = { role: 'user' };
    
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
    }

    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    if (req.query.dateFrom || req.query.dateTo) {
      query.joinDate = {};
      if (req.query.dateFrom) query.joinDate.$gte = new Date(req.query.dateFrom);
      if (req.query.dateTo) query.joinDate.$lte = new Date(req.query.dateTo);
    }

    // Get total counts for the stats cards regardless of search/status filters
    const statWebsiteCount = await WebsiteUser.countDocuments({ role: 'user' });
    const statMobileCount = await MobileUser.countDocuments({ role: 'user' });
    const statTotalCount = statWebsiteCount + statMobileCount;

    let users = [];
    let totalCount = 0;

    const formatUser = (u, type) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      status: u.status,
      joinDate: u.joinDate || u.createdAt,
      lastLogin: u.lastLogin,
      fitnessGoal: u.fitnessGoal,
      userType: type
    });

    const sortField = req.query.sortBy || 'joinDate';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    if (userType === 'website') {
      totalCount = await WebsiteUser.countDocuments(query);
      const dbUsers = await WebsiteUser.find(query)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .select('-password');
      users = dbUsers.map(u => formatUser(u, 'website'));
    } else if (userType === 'mobile') {
      totalCount = await MobileUser.countDocuments(query);
      const dbUsers = await MobileUser.find(query)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .select('-password');
      users = dbUsers.map(u => formatUser(u, 'mobile'));
    } else {
      // Combined 'all' users
      const websiteUsers = await WebsiteUser.find(query).select('-password');
      const mobileUsers = await MobileUser.find(query).select('-password');

      const allUsersCombined = [
        ...websiteUsers.map(u => formatUser(u, 'website')),
        ...mobileUsers.map(u => formatUser(u, 'mobile'))
      ];

      // Sort combined array
      allUsersCombined.sort((a, b) => {
        const valA = a[sortField] ? new Date(a[sortField]).getTime() : 0;
        const valB = b[sortField] ? new Date(b[sortField]).getTime() : 0;
        return sortOrder === 1 ? valA - valB : valB - valA;
      });

      totalCount = allUsersCombined.length;
      users = allUsersCombined.slice(skip, skip + limit);
    }

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          limit
        },
        stats: {
          total: statTotalCount,
          website: statWebsiteCount,
          mobile: statMobileCount
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    let user = await WebsiteUser.findById(req.params.userId).select('-password');
    let userType = 'website';
    if (!user) {
      user = await MobileUser.findById(req.params.userId).select('-password');
      userType = 'mobile';
    }
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const Transaction = require('../../models/Transaction');
    const bookings = await Transaction.aggregate([
      { $match: { userId: user._id, status: 'success' } },
      { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: '$amount' } } }
    ]);

    const stats = bookings.length ? bookings[0] : { count: 0, amount: 0 };

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        fullName: user.name,
        email: user.email,
        phone: user.phone,
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        profilePhoto: user.profilePhoto,
        fitnessGoal: user.fitnessGoal,
        location: user.location,
        city: user.city,
        status: user.status,
        joinDate: user.joinDate || user.createdAt,
        lastLogin: user.lastLogin,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        totalBookings: stats.count,
        totalAmount: stats.amount,
        userType
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.blockUser = async (req, res) => {
  try {
    let user = await WebsiteUser.findByIdAndUpdate(req.params.userId, { status: 'blocked' }, { new: true });
    if (!user) {
      user = await MobileUser.findByIdAndUpdate(req.params.userId, { status: 'blocked' }, { new: true });
    }
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    await ActivityLog.create({
      type: 'user_blocked',
      userId: user._id,
      adminId: req.admin._id,
      description: `User ${user.name} was blocked. Reason: ${req.body.reason || 'None provided'}`,
    });

    res.status(200).json({ success: true, message: 'User blocked successfully', user: { id: user._id, status: 'blocked' } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    let user = await WebsiteUser.findByIdAndUpdate(req.params.userId, { status: 'active' }, { new: true });
    if (!user) {
      user = await MobileUser.findByIdAndUpdate(req.params.userId, { status: 'active' }, { new: true });
    }
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await ActivityLog.create({
      type: 'user_unblocked',
      userId: user._id,
      adminId: req.admin._id,
      description: `User ${user.name} was unblocked.`,
    });

    res.status(200).json({ success: true, message: 'User unblocked successfully' });
  } catch (error) {
    res.status(550).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    let user = await WebsiteUser.findByIdAndDelete(req.params.userId);
    if (!user) {
      user = await MobileUser.findByIdAndDelete(req.params.userId);
    }
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getUserActivity = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const activities = await ActivityLog.find({ userId: req.params.userId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const totalCount = await ActivityLog.countDocuments({ userId: req.params.userId });

    res.status(200).json({
      success: true,
      data: {
        activities: activities.map(a => ({
          id: a._id,
          type: a.type,
          description: a.description,
          timestamp: a.timestamp,
          details: a.metadata
        })),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          limit
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

