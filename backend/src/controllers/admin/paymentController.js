const Transaction = require('../../models/Transaction');
const ActivityLog = require('../../models/ActivityLog');
const MembershipPurchase = require('../../models/MembershipPurchase');
const HealthStoreOrder = require('../../models/HealthStoreOrder');

exports.getAllTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch from all collections
    const [rawTransactions, rawMemberships, rawHealthStoreOrders] = await Promise.all([
      Transaction.find({}),
      MembershipPurchase.find({}),
      HealthStoreOrder.find({})
    ]);

    let all = [];

    // 1. Generic Transactions
    rawTransactions.forEach(t => {
      all.push({
        id: t._id,
        userId: t.userId,
        userName: t.userName,
        amount: t.amount,
        type: t.type || 'booking',
        date: t.date || t.createdAt,
        status: t.status,
        paymentMethod: t.paymentMethod || 'Razorpay'
      });
    });

    // 2. Membership purchases
    rawMemberships.forEach(m => {
      let status = 'pending';
      if (m.status === 'PAID') status = 'success';
      else if (m.status === 'FAILED' || m.status === 'CANCELLED') status = 'failed';
      else if (m.status === 'PAY_AT_GYM_PENDING') status = 'pending';

      all.push({
        id: m._id,
        userId: m.userId,
        userName: m.userDetails?.fullName || 'Gym Member',
        amount: m.totalAmount,
        type: 'gym_membership',
        date: m.createdAt,
        status,
        paymentMethod: m.paymentMethod || 'Razorpay'
      });
    });

    // 3. Health Store orders
    rawHealthStoreOrders.forEach(o => {
      let status = 'pending';
      if (o.paymentStatus === 'Paid' || o.paymentStatus === 'paid' || o.paymentStatus === 'PAID') status = 'success';
      else if (o.paymentStatus === 'Failed' || o.paymentStatus === 'failed') status = 'failed';

      all.push({
        id: o._id,
        userId: o.customer,
        userName: o.address?.fullName || 'Store Customer',
        amount: o.total || o.subtotal || 0,
        type: 'health_store',
        date: o.createdAt,
        status,
        paymentMethod: o.paymentMethod || 'Razorpay'
      });
    });

    // Filtering
    if (req.query.search) {
      const searchStr = req.query.search.toLowerCase();
      all = all.filter(item => 
        (item.userName && item.userName.toLowerCase().includes(searchStr)) ||
        (item.id && item.id.toString().includes(searchStr))
      );
    }

    if (req.query.type) {
      all = all.filter(item => item.type === req.query.type);
    }

    if (req.query.status) {
      all = all.filter(item => item.status === req.query.status);
    }

    // Sort
    const sortField = req.query.sortBy || 'date';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    all.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (sortField === 'date') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      if (valA < valB) return -sortOrder;
      if (valA > valB) return sortOrder;
      return 0;
    });

    const totalCount = all.length;
    const paginatedTransactions = all.slice(skip, skip + limit);

    res.status(200).json({
      success: true,
      data: {
        transactions: paginatedTransactions,
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

exports.getRevenueReports = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    if (!dateFrom || !dateTo) {
      return res.status(400).json({ success: false, message: 'dateFrom and dateTo are required' });
    }

    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);
    
    const lastYearStartDate = new Date(startDate);
    lastYearStartDate.setFullYear(lastYearStartDate.getFullYear() - 1);
    const lastYearEndDate = new Date(endDate);
    lastYearEndDate.setFullYear(lastYearEndDate.getFullYear() - 1);

    const thisYearTransactions = await Transaction.aggregate([
      { $match: { status: 'success', date: { $gte: startDate, $lte: endDate } } }
    ]);

    const totalRevenueThisYear = thisYearTransactions.reduce((acc, curr) => acc + curr.amount, 0);

    const lastYearTransactions = await Transaction.aggregate([
      { $match: { status: 'success', date: { $gte: lastYearStartDate, $lte: lastYearEndDate } } }
    ]);

    const totalRevenueLastYear = lastYearTransactions.reduce((acc, curr) => acc + curr.amount, 0);

    const growth = totalRevenueLastYear ? ((totalRevenueThisYear - totalRevenueLastYear) / totalRevenueLastYear) * 100 : 100;

    // By Type
    const byTypeAgg = await Transaction.aggregate([
      { $match: { status: 'success', date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$type', amount: { $sum: '$amount' } } }
    ]);

    const byType = byTypeAgg.map(t => ({ type: t._id, amount: t.amount }));

    // Monthly (Simplified)
    const monthlyRevenueAgg = await Transaction.aggregate([
      { $match: { status: 'success', date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$date" } }, amount: { $sum: '$amount' } } },
      { $sort: { _id: 1 } }
    ]);

    const monthlyRevenue = monthlyRevenueAgg.map(m => ({ month: m._id, amount: m.amount }));

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: totalRevenueThisYear,
        monthlyRevenue,
        byType,
        comparison: {
          thisYear: totalRevenueThisYear,
          lastYear: totalRevenueLastYear,
          growth: growth.toFixed(2)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getPendingPayouts = async (req, res) => {
  try {
    // Mocking payouts data as it wasn't clearly defined in models
    res.status(200).json({
      success: true,
      data: {
        payouts: [
          {
            id: "payout123",
            gymId: "gym123",
            gymName: "YC's Gym",
            amount: 450000,
            dueDate: new Date().toISOString(),
            status: "pending"
          }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.processPayout = async (req, res) => {
  try {
    // Mock processing
    const { processedDate } = req.body;
    
    await ActivityLog.create({
      type: 'payout_processed',
      adminId: req.admin._id,
      description: `Payout ${req.params.payoutId} processed.`
    });

    res.status(200).json({
      success: true,
      message: "Payout processed",
      payout: { id: req.params.payoutId, status: "processed", processedDate }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
